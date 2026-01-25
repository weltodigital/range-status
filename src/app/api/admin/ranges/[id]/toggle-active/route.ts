import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    // Get current range
    const currentRange = await prisma.range.findUnique({
      where: { id },
    })

    if (!currentRange) {
      return NextResponse.json(
        { error: 'Range not found' },
        { status: 404 }
      )
    }

    // Toggle active status
    const updatedRange = await prisma.range.update({
      where: { id },
      data: {
        isActive: !currentRange.isActive,
      },
      include: {
        users: {
          where: { role: 'RANGE' },
          select: { id: true, email: true },
        },
      },
    })

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