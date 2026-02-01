import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { adminResetUserPassword } from '@/lib/supabase-db'

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
    const { password } = body

    if (!password || password.trim().length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Reset the user password
    const success = await adminResetUserPassword(params.id, password.trim())

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset password. User not found.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Password reset error:', error)

    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}