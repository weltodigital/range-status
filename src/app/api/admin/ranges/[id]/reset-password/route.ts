import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { resetRangeUserPassword } from '@/lib/supabase-db'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

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
    const body = await request.json()
    const { password } = resetPasswordSchema.parse(body)

    // Reset password
    const success = await resetRangeUserPassword(id, password)

    if (!success) {
      return NextResponse.json(
        { error: 'Portal user not found or password reset failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}