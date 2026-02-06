import { NextResponse } from 'next/server'
import { getStatusEvents } from '@/lib/supabase-db'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const rangeId = url.searchParams.get('rangeId')

    if (!rangeId) {
      return NextResponse.json({ error: 'rangeId parameter required' }, { status: 400 })
    }

    // Get all events for this range (no date filter)
    const allEvents = await getStatusEvents(rangeId)

    // Get today's events
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const todayEvents = allEvents.filter(event => {
      const eventDate = new Date(event.createdAt)
      return eventDate >= startOfDay
    })

    return NextResponse.json({
      rangeId,
      totalEvents: allEvents.length,
      allEvents: allEvents.slice(-10), // Last 10 events
      todayEvents,
      todayStart: startOfDay.toISOString(),
      currentTime: today.toISOString()
    })

  } catch (error) {
    console.error('Test events error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}