import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
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

    const now = new Date()

    // Update range status
    const updatedRange = await prisma.range.update({
      where: { id: session.rangeId },
      data: {
        status: validatedData.status,
        note: validatedData.note || null,
        lastUpdatedAt: now,
      },
    })

    // Create status event
    await prisma.statusEvent.create({
      data: {
        rangeId: session.rangeId,
        status: validatedData.status,
        createdAt: now,
      },
    })

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