import { NextResponse } from 'next/server'
import { getRangeBySlug } from '@/lib/supabase-db'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug') || 'ed-golf-range'

    const range = await getRangeBySlug(slug)

    if (!range) {
      return NextResponse.json({ error: 'Range not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: range.id,
      name: range.name,
      slug: range.slug,
      status: range.status,
      lastUpdatedAt: range.lastUpdatedAt
    })

  } catch (error) {
    console.error('Get range ID error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}