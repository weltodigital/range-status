import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { rangeSchema, createRangeUserSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate range data
    const rangeData = rangeSchema.parse({
      name: body.name,
      area: body.area,
      town: body.town,
      slug: body.slug,
    })

    // Validate user data
    const userData = createRangeUserSchema.parse({
      email: body.email,
      password: body.password,
    })

    // Check if slug is unique
    const existingRange = await prisma.range.findUnique({
      where: { slug: rangeData.slug },
    })

    if (existingRange) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Check if email is unique
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create range and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create range
      const range = await tx.range.create({
        data: {
          name: rangeData.name,
          slug: rangeData.slug,
          area: rangeData.area,
          town: rangeData.town || null,
          status: 'QUIET',
          isActive: true,
        },
      })

      // Create user
      const passwordHash = await hashPassword(userData.password)
      const user = await tx.user.create({
        data: {
          email: userData.email,
          passwordHash,
          role: 'RANGE',
          rangeId: range.id,
        },
      })

      return { range, user }
    })

    return NextResponse.json({
      success: true,
      range: result.range,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
    })
  } catch (error) {
    console.error('Range creation error:', error)

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email or slug already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create range' },
      { status: 500 }
    )
  }
}