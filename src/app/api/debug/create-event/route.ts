import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET() {
  try {
    const rangeId = '6582e7d6-47e0-459f-b2e6-9057475ba4b8'
    const now = new Date().toISOString()

    console.log('Attempting to create status event:', { rangeId, status: 'TEST', createdAt: now })

    const { data, error } = await supabase
      .from('status_events')
      .insert({
        rangeId,
        status: 'TEST',
        createdAt: now,
      })
      .select()

    console.log('Insert result:', { data, error })

    return NextResponse.json({
      success: !error,
      data,
      error: error?.message,
      details: {
        rangeId,
        status: 'TEST',
        createdAt: now
      }
    })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
}