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

    // Fetch today's status events
    const allEvents = await getStatusEvents(range.id, startOfDay)

    // Filter to only today's events and sort by newest first
    const todayEvents = allEvents
      .filter(event => {
        const eventDate = new Date(event.createdAt)
        return eventDate >= startOfDay
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const response = NextResponse.json({
      events: todayEvents.map(event => ({
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