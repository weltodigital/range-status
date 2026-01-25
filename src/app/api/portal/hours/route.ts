import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { openingHoursSchema } from '@/lib/validations'

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
    const validatedData = openingHoursSchema.parse(body.hours)

    const updatedRange = await prisma.range.update({
      where: { id: session.rangeId },
      data: {
        openingHours: validatedData,
      },
    })

    return NextResponse.json({
      success: true,
      range: updatedRange,
    })
  } catch (error) {
    console.error('Hours update error:', error)
    return NextResponse.json(
      { error: 'Failed to update opening hours' },
      { status: 500 }
    )
  }
}