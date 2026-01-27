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
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
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