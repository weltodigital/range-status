import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { checkSlugExists, checkEmailExists, createRangeWithUser } from '@/lib/supabase-db'
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
    const slugExists = await checkSlugExists(rangeData.slug)
    if (slugExists) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Check if email is unique
    const emailExists = await checkEmailExists(userData.email)
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create range and user
    const result = await createRangeWithUser({
      name: rangeData.name,
      slug: rangeData.slug,
      area: rangeData.area,
      town: rangeData.town || null,
      email: userData.email,
      password: userData.password,
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create range' },
        { status: 500 }
      )
    }

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