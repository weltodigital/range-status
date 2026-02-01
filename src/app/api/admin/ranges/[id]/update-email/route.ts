import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updateUserEmail } from '@/lib/supabase-db'

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
    const { email } = body

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Update the user email
    const success = await updateUserEmail(params.id, email.trim())

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update email. Email may already be in use or user not found.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully'
    })

  } catch (error) {
    console.error('Email update error:', error)

    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    )
  }
}