import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { toggleRangeActiveStatus } from '@/lib/supabase-db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Toggle active status
    const updatedRange = await toggleRangeActiveStatus(id)

    if (!updatedRange) {
      return NextResponse.json(
        { error: 'Range not found or toggle failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      range: updatedRange,
    })
  } catch (error) {
    console.error('Toggle active error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle active status' },
      { status: 500 }
    )
  }
}