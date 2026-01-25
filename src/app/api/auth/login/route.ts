import { NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { authenticateUserSupabase } from '@/lib/supabase-auth'
import { createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const user = await authenticateUserSupabase(validatedData.email, validatedData.password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    await createSession(user)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        rangeId: user.rangeId,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}