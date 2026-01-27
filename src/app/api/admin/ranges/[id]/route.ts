import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { checkSlugExistsExcluding, updateRange } from '@/lib/supabase-db'
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
      address: body.address,
      postcode: body.postcode,
      latitude: body.latitude,
      longitude: body.longitude,
      slug: body.slug,
    })

    // Check if slug is unique (excluding current range)
    const slugExists = await checkSlugExistsExcluding(rangeData.slug, id)
    if (slugExists) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Update range
    const updatedRange = await updateRange(id, {
      name: rangeData.name,
      slug: rangeData.slug,
      area: rangeData.area,
      town: rangeData.town || null,
      address: rangeData.address || null,
      postcode: rangeData.postcode || null,
      latitude: rangeData.latitude || null,
      longitude: rangeData.longitude || null,
    })

    if (!updatedRange) {
      return NextResponse.json(
        { error: 'Failed to update range' },
        { status: 500 }
      )
    }

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