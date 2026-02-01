import { NextResponse } from 'next/server'
import { getRangeBySlug } from '@/lib/supabase-db'
import { isStale, formatTimeAgo } from '@/lib/utils'

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

    const lastUpdated = range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null
    const isDataStale = lastUpdated ? isStale(lastUpdated) : true

    const response = NextResponse.json({
      status: range.status,
      note: range.note,
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
      lastUpdatedText: lastUpdated ? formatTimeAgo(lastUpdated) : 'Never',
      isStale: isDataStale
    })

    // Set cache headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response

  } catch (error) {
    console.error('Error fetching range status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}