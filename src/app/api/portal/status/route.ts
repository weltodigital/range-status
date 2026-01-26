import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updateRangeStatus } from '@/lib/supabase-db'
import { statusUpdateSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'RANGE' || !session.rangeId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = statusUpdateSchema.parse(body)

    // Update range status
    const updatedRange = await updateRangeStatus(
      session.rangeId,
      validatedData.status,
      validatedData.note
    )

    if (!updatedRange) {
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      range: updatedRange,
    })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}