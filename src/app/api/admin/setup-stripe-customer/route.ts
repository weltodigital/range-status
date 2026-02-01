import { NextRequest, NextResponse } from 'next/server'
import { getRangeById, updateRangeSubscription } from '@/lib/supabase-db'
import { getStripe } from '@/lib/stripe'

// Admin endpoint to manually set up Stripe customer for existing ranges
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rangeId, email, name } = body

    if (!rangeId || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the range
    const range = await getRangeById(rangeId)
    if (!range) {
      return NextResponse.json({ error: 'Range not found' }, { status: 404 })
    }

    // Check if range already has a Stripe customer
    if (range.stripeCustomerId) {
      return NextResponse.json({ error: 'Range already has Stripe customer' }, { status: 400 })
    }

    // Create Stripe customer
    const stripe = getStripe()
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        rangeId: range.id,
        rangeName: range.name
      }
    })

    // Update range with Stripe customer ID
    const updatedRange = await updateRangeSubscription(range.id, {
      stripeCustomerId: customer.id
    })

    if (!updatedRange) {
      return NextResponse.json({ error: 'Failed to update range' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Stripe customer created for ${range.name}`,
      customerId: customer.id,
      range: {
        id: updatedRange.id,
        name: updatedRange.name,
        stripeCustomerId: updatedRange.stripeCustomerId
      }
    })

  } catch (error) {
    console.error('Stripe customer setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}