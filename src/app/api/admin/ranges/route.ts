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
      address: body.address,
      postcode: body.postcode,
      latitude: body.latitude,
      longitude: body.longitude,
      slug: body.slug,
    })

    // Validate user data (optional)
    const userData = createRangeUserSchema.parse({
      email: body.email || undefined,
      password: body.password || undefined,
    })

    // Check if slug is unique
    const slugExists = await checkSlugExists(rangeData.slug)
    if (slugExists) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Check if email is unique (only if email is provided)
    if (userData.email) {
      const emailExists = await checkEmailExists(userData.email)
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    // Create range and optionally user
    const result = await createRangeWithUser({
      name: rangeData.name,
      slug: rangeData.slug,
      area: rangeData.area,
      town: rangeData.town || null,
      address: rangeData.address || null,
      postcode: rangeData.postcode || null,
      latitude: rangeData.latitude || null,
      longitude: rangeData.longitude || null,
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
      user: result.user ? {
        id: result.user.id,
        email: result.user.email,
      } : null,
    })
  } catch (error) {
    console.error('Range creation error:', error)

    // Handle validation errors
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Validation failed: ' + error.message },
          { status: 400 }
        )
      }

      if (error.message.includes('Unique constraint') ||
          error.message.includes('duplicate key') ||
          error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Email or slug already exists. Please use different values.' },
          { status: 400 }
        )
      }

      // Return the actual error message for debugging
      return NextResponse.json(
        { error: `Failed to create range: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create range: Unknown error' },
      { status: 500 }
    )
  }
}