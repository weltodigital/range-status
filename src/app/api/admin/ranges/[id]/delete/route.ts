import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { deleteRange } from '@/lib/supabase-db'

export async function DELETE(
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

    const success = await deleteRange(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete range' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting range:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}