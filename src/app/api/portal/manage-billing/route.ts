import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getRangeById } from '@/lib/supabase-db'
import { createBillingPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'RANGE' || !session.rangeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const range = await getRangeById(session.rangeId)

    if (!range || !range.isActive) {
      return NextResponse.json({ error: 'Range not found or inactive' }, { status: 404 })
    }

    if (!range.stripeCustomerId) {
      // For ranges with active subscriptions but no Stripe customer ID,
      // this likely means they were set up before Stripe integration was complete
      if (range.subscriptionStatus === 'active') {
        return NextResponse.json({
          error: 'Billing portal setup required. Please contact support to link your subscription.',
          code: 'BILLING_SETUP_REQUIRED'
        }, { status: 404 })
      } else {
        return NextResponse.json({
          error: 'No billing account found. Please subscribe to access billing management.',
          code: 'NO_BILLING_ACCOUNT'
        }, { status: 404 })
      }
    }

    // Handle mock/development customer ID
    if (range.stripeCustomerId === 'cus_mock_development_customer') {
      return NextResponse.json({
        error: 'Development mode - billing portal would redirect to Stripe customer portal',
        mockRedirect: true,
        message: 'In production, this would redirect to Stripe billing portal'
      }, { status: 200 })
    }

    // Create Stripe billing portal session
    const portalSession = await createBillingPortalSession(range.stripeCustomerId)

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}