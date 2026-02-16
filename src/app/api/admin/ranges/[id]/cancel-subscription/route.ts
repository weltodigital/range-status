import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updateRangeSubscription, getRangeById } from '@/lib/supabase-db'
import { cancelSubscription } from '@/lib/stripe'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get current range data
    const range = await getRangeById(id)
    if (!range) {
      return NextResponse.json(
        { error: 'Range not found' },
        { status: 404 }
      )
    }

    // Cancel Stripe subscription if it exists
    let stripeCancellationResult = null
    if (range.stripeSubscriptionId) {
      console.log(`Admin canceling Stripe subscription ${range.stripeSubscriptionId} for range ${range.name}`)

      try {
        stripeCancellationResult = await cancelSubscription(range.stripeSubscriptionId)

        if (stripeCancellationResult.success) {
          console.log(`Stripe subscription ${range.stripeSubscriptionId} canceled successfully by admin`)
        } else {
          console.warn(`Failed to cancel Stripe subscription: ${stripeCancellationResult.error}`)
          // Continue with database update even if Stripe cancellation fails
        }
      } catch (stripeError) {
        console.warn('Error canceling Stripe subscription:', stripeError)
        // Continue with database update even if Stripe cancellation fails
      }
    }

    // Update subscription status in database
    const now = new Date()
    await updateRangeSubscription(id, {
      subscriptionStatus: 'canceled' as 'canceled',
      subscriptionExpiry: now, // Expire immediately
      canceledAt: now,
      // Keep existing Stripe IDs for reference/audit trail
      stripeCustomerId: range.stripeCustomerId,
      stripeSubscriptionId: range.stripeSubscriptionId
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      stripeResult: stripeCancellationResult
    })

  } catch (error) {
    console.error('Subscription cancellation error:', error)

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}