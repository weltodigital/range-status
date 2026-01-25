import { NextResponse } from 'next/server'
import { authenticateUserSupabase } from '@/lib/supabase-auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('Testing authentication for:', email)

    const user = await authenticateUserSupabase(email, password)

    return NextResponse.json({
      success: user !== null,
      user: user ? { id: user.id, email: user.email, role: user.role } : null
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}