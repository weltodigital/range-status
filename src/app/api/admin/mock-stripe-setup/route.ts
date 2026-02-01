import { NextRequest, NextResponse } from 'next/server'
import { getAllRanges, updateRangeSubscription } from '@/lib/supabase-db'

// Admin endpoint to set up mock Stripe customer for development testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rangeName, mockCustomerId = 'cus_mock_development_customer' } = body

    if (!rangeName) {
      return NextResponse.json({ error: 'Range name required' }, { status: 400 })
    }

    // Find the range by name
    const ranges = await getAllRanges()
    const range = ranges.find(r =>
      r.name.toLowerCase() === rangeName.toLowerCase() ||
      r.name.toLowerCase().includes(rangeName.toLowerCase())
    )

    if (!range) {
      return NextResponse.json({
        error: 'Range not found',
        availableRanges: ranges.map(r => r.name)
      }, { status: 404 })
    }

    // Check if range already has a Stripe customer
    if (range.stripeCustomerId) {
      return NextResponse.json({
        error: 'Range already has Stripe customer',
        currentCustomerId: range.stripeCustomerId
      }, { status: 400 })
    }

    // Update range with mock Stripe customer ID
    const updatedRange = await updateRangeSubscription(range.id, {
      stripeCustomerId: mockCustomerId
    })

    if (!updatedRange) {
      return NextResponse.json({ error: 'Failed to update range' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Mock Stripe customer set up for ${range.name}`,
      range: {
        id: updatedRange.id,
        name: updatedRange.name,
        subscriptionStatus: updatedRange.subscriptionStatus,
        subscriptionType: updatedRange.subscriptionType,
        stripeCustomerId: updatedRange.stripeCustomerId
      }
    })

  } catch (error) {
    console.error('Mock Stripe setup error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}