import { NextResponse } from 'next/server'
import { getPublicRanges } from '@/lib/supabase-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const result = await getPublicRanges()

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to fetch ranges' },
        { status: 500 }
      )
    }

    const response = NextResponse.json(result)

    // Disable caching to ensure real-time updates
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Error fetching ranges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ranges' },
      { status: 500 }
    )
  }
}