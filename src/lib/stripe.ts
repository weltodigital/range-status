import Stripe from 'stripe'

let stripe: Stripe | null = null

// Lazy initialize Stripe to avoid build-time errors
export function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured - missing STRIPE_SECRET_KEY')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripe
}

// Pricing configuration
export const STRIPE_CONFIG = {
  monthlyPriceId: process.env.STRIPE_MONTHLY_PRICE_ID || '',
  yearlyPriceId: process.env.STRIPE_YEARLY_PRICE_ID || '',
  trialDays: 7,
  currency: 'gbp',
  prices: {
    monthly: 4900, // £49.00 in pence
    yearly: 49000,  // £490.00 in pence
  }
}

// Helper function to create checkout session
export async function createCheckoutSession(
  rangeId: string,
  plan: 'monthly' | 'yearly',
  userEmail: string
) {
  const stripeClient = getStripe()

  const priceId = plan === 'yearly'
    ? STRIPE_CONFIG.yearlyPriceId
    : STRIPE_CONFIG.monthlyPriceId

  if (!priceId) {
    throw new Error(`Stripe price ID not configured for ${plan} plan`)
  }

  const session = await stripeClient.checkout.sessions.create({
    customer_email: userEmail,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: STRIPE_CONFIG.trialDays,
      metadata: {
        rangeId,
        plan
      }
    },
    success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/portal/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/portal/billing?canceled=true`,
    metadata: {
      rangeId,
      plan
    }
  })

  return session
}

// Helper function to create billing portal session
export async function createBillingPortalSession(customerId: string) {
  const stripeClient = getStripe()

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_DOMAIN}/portal`
  })

  return session
}

// Helper function to verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  const stripeClient = getStripe()

  return stripeClient.webhooks.constructEvent(body, signature, secret)
}