import { NextRequest, NextResponse } from 'next/server'
import { getAllRanges } from '@/lib/supabase-db'

// Admin endpoint to find ranges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    const ranges = await getAllRanges()

    let filteredRanges = ranges
    if (name) {
      filteredRanges = ranges.filter(range =>
        range.name.toLowerCase().includes(name.toLowerCase())
      )
    }

    return NextResponse.json({
      ranges: filteredRanges.map(range => ({
        id: range.id,
        name: range.name,
        slug: range.slug,
        area: range.area,
        town: range.town,
        subscriptionType: range.subscriptionType,
        subscriptionStatus: range.subscriptionStatus,
        subscriptionExpiry: range.subscriptionExpiry,
        stripeCustomerId: range.stripeCustomerId,
        stripeSubscriptionId: range.stripeSubscriptionId,
        isActive: range.isActive,
        users: range.users
      }))
    })

  } catch (error) {
    console.error('Find range error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}