import { NextRequest, NextResponse } from 'next/server'
import { getAllRanges, updateRangeSubscription } from '@/lib/supabase-db'

// Quick fix endpoint specifically for Ed Golf Range
export async function POST(request: NextRequest) {
  try {
    const customerId = 'cus_TtsBySQVuSBLbS'

    // Get all ranges to find Ed's
    const ranges = await getAllRanges()

    // Find Ed's range - try multiple variations
    const edRange = ranges.find(r =>
      r.name.toLowerCase().includes('ed') &&
      r.name.toLowerCase().includes('golf')
    )

    if (!edRange) {
      return NextResponse.json({
        error: 'Ed Golf Range not found',
        availableRanges: ranges.map(r => ({ id: r.id, name: r.name }))
      }, { status: 404 })
    }

    // Update the range with the Stripe customer ID
    const updatedRange = await updateRangeSubscription(edRange.id, {
      stripeCustomerId: customerId
    })

    if (!updatedRange) {
      return NextResponse.json({ error: 'Failed to update range' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully linked Stripe customer to ${edRange.name}`,
      range: {
        id: updatedRange.id,
        name: updatedRange.name,
        stripeCustomerId: updatedRange.stripeCustomerId
      }
    })

  } catch (error) {
    console.error('Fix Ed range error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}