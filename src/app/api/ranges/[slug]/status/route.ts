import { NextResponse } from 'next/server'
import { getRangeBySlug } from '@/lib/supabase-db'
import { isStale, formatTimeAgo } from '@/lib/utils'

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

    return NextResponse.json({
      status: range.status,
      note: range.note,
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
      lastUpdatedText: lastUpdated ? formatTimeAgo(lastUpdated) : 'Never',
      isStale: isDataStale
    })

  } catch (error) {
    console.error('Error fetching range status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}