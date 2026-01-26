import { NextResponse } from 'next/server'
import { getPublicRanges } from '@/lib/supabase-db'

export async function GET() {
  try {
    const result = await getPublicRanges()

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to fetch ranges' },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching ranges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ranges' },
      { status: 500 }
    )
  }
}