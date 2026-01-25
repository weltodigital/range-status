import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('Testing Supabase client connection...')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Test basic connection by counting users
    const { data: users, error } = await supabase
      .from('users')
      .select('email, role')

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    console.log('Supabase connection successful, found users:', users?.length)

    return NextResponse.json({
      success: true,
      userCount: users?.length || 0,
      users: users,
      connectionType: 'supabase-client'
    })
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionType: 'supabase-client'
    }, { status: 500 })
  }
}