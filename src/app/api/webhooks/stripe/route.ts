import { NextRequest, NextResponse } from 'next/server'
import { updateRangeSubscription } from '@/lib/supabase-db'
import { verifyWebhookSignature } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.log('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

// Webhook handler functions

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { customer, subscription, metadata } = session
  const rangeId = metadata?.rangeId

  if (rangeId && customer && subscription) {
    const plan = metadata.plan === 'yearly' ? 'yearly' : 'monthly'

    // Calculate expiry date based on trial period
    const trialPeriodDays = 7
    const subscriptionExpiry = new Date()
    subscriptionExpiry.setDate(subscriptionExpiry.getDate() + trialPeriodDays)

    await updateRangeSubscription(rangeId, {
      subscriptionType: plan as 'monthly' | 'yearly',
      subscriptionStatus: 'active',
      subscriptionExpiry,
      stripeCustomerId: customer as string,
      stripeSubscriptionId: subscription as string
    })

    console.log(`Subscription created for range ${rangeId}: ${plan} plan with ${trialPeriodDays} day trial`)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Handle renewal payment - invoice.subscription can be string ID or expanded object
  if (invoice.billing_reason === 'subscription_cycle') {
    console.log(`Payment succeeded for invoice: ${invoice.id}`)
    // Could update subscription expiry date based on billing cycle
    // This would require finding the range by subscription ID first
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const rangeId = subscription.metadata?.rangeId

  if (rangeId) {
    const status = subscription.status === 'active' ? 'active' :
                  subscription.status === 'canceled' ? 'canceled' : 'expired'

    // Update subscription status
    await updateRangeSubscription(rangeId, {
      subscriptionStatus: status as 'active' | 'expired' | 'canceled'
    })

    console.log(`Subscription updated for range ${rangeId}: status = ${status}`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const rangeId = subscription.metadata?.rangeId

  if (rangeId) {
    // When subscription is deleted/canceled, update the database
    // Keep the stripe IDs for audit trail, but mark as canceled
    const canceledAt = subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : new Date() // Fallback to current time if canceled_at is null

    await updateRangeSubscription(rangeId, {
      subscriptionStatus: 'canceled',
      subscriptionExpiry: canceledAt, // Set expiry to cancellation date
      canceledAt: canceledAt,
      // Keep Stripe IDs for reference - don't null them
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id
    })

    console.log(`Subscription ${subscription.id} canceled for range ${rangeId} at ${canceledAt.toISOString()}`)
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const rangeId = subscription.metadata?.rangeId

  if (rangeId) {
    console.log(`Trial ending soon for range ${rangeId}`)
    // Could send notification email to range owner here
  }
}