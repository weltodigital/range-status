import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rangeSchema } from '@/lib/validations'

export async function PUT(
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
    const body = await request.json()

    // Validate range data
    const rangeData = rangeSchema.parse({
      name: body.name,
      area: body.area,
      town: body.town,
      slug: body.slug,
    })

    // Check if slug is unique (excluding current range)
    const existingRange = await prisma.range.findFirst({
      where: {
        slug: rangeData.slug,
        id: { not: id },
      },
    })

    if (existingRange) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Update range
    const updatedRange = await prisma.range.update({
      where: { id },
      data: {
        name: rangeData.name,
        slug: rangeData.slug,
        area: rangeData.area,
        town: rangeData.town || null,
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
    console.error('Range update error:', error)

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update range' },
      { status: 500 }
    )
  }
}