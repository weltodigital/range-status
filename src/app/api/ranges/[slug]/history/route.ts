import { NextResponse } from 'next/server'
import { getRangeBySlug } from '@/lib/supabase-db'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Get today's date range (start and end of today)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Fetch today's status events
    const statusEvents = await prisma.statusEvent.findMany({
      where: {
        rangeId: range.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const response = NextResponse.json({
      events: statusEvents.map(event => ({
        id: event.id,
        status: event.status,
        createdAt: event.createdAt.toISOString()
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