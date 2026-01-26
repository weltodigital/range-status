import { NextResponse } from 'next/server'
import { checkSlugExists, checkEmailExists, createRangeWithUser } from '@/lib/supabase-db'

export async function POST(request: Request) {
  try {
    console.log('🧪 Testing range creation...')

    // Test basic connectivity
    const slugExists = await checkSlugExists('test-debug-range')
    console.log('✅ checkSlugExists worked:', slugExists)

    const emailExists = await checkEmailExists('debug@test.com')
    console.log('✅ checkEmailExists worked:', emailExists)

    // Try to create a test range
    const result = await createRangeWithUser({
      name: 'Debug Test Range',
      slug: 'debug-test-range',
      area: 'Test Area',
      town: 'Test Town',
      email: 'debug@test.com',
      password: 'testpassword123'
    })

    console.log('🎯 createRangeWithUser result:', result)

    return NextResponse.json({
      success: true,
      slugExists,
      emailExists,
      createResult: result
    })
  } catch (error) {
    console.error('❌ Debug test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}