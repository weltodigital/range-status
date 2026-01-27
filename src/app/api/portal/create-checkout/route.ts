import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getRangeById } from '@/lib/supabase-db'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'RANGE' || !session.rangeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, rangeId } = await request.json()

    if (!plan || !rangeId || rangeId !== session.rangeId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const range = await getRangeById(session.rangeId)

    if (!range || !range.isActive) {
      return NextResponse.json({ error: 'Range not found or inactive' }, { status: 404 })
    }

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession(
      range.id,
      plan as 'monthly' | 'yearly',
      session.email
    )

    return NextResponse.json({
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}