import { NextResponse } from 'next/server'
import { getRangeBySlug, getStatusEvents } from '@/lib/supabase-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params

    const range = await getRangeBySlug(slug)

    if (!range) {
      return NextResponse.json(
        { error: 'Range not found' },
        { status: 404 }
      )
    }

    // Get today's date range (start of today)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    // Debug: log the range ID and date filter
    console.log('History API Debug:', {
      rangeId: range.id,
      slug: slug,
      startOfDay: startOfDay.toISOString(),
      today: today.toISOString()
    })

    // Fetch all status events for this range (without date filter first to debug)
    const allEvents = await getStatusEvents(range.id)
    console.log('All events for range:', allEvents.length, allEvents.slice(0, 3))

    // Fetch all events first (no date filter to debug)
    const todayEvents = await getStatusEvents(range.id)
    console.log('All events (no date filter):', todayEvents.length, todayEvents.slice(0, 3))

    // Filter to today only and sort by newest first
    const filteredEvents = todayEvents
      .filter(event => {
        const eventDate = new Date(event.createdAt)
        const isToday = eventDate >= startOfDay
        console.log('Event date check:', {
          eventCreated: event.createdAt,
          eventDate: eventDate.toISOString(),
          startOfDay: startOfDay.toISOString(),
          isToday
        })
        return isToday
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const response = NextResponse.json({
      events: filteredEvents.map(event => ({
        id: event.id,
        status: event.status,
        createdAt: event.createdAt
      }))
    })

    // Set cache headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response

  } catch (error) {
    console.error('Error fetching range status history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}