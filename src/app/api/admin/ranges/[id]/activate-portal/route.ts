import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { activateRangeWithUser } from '@/lib/supabase-db'

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

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Activate the range with user credentials
    const result = await activateRangeWithUser({
      rangeId: params.id,
      email,
      password
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to activate portal access. Range may not exist or already have a user.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Portal access activated successfully',
      user: result.user
    })

  } catch (error) {
    console.error('Portal activation error:', error)

    return NextResponse.json(
      { error: 'Failed to activate portal access' },
      { status: 500 }
    )
  }
}