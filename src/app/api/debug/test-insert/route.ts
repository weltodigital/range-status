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
    const testRangeId = '6582e7d6-47e0-459f-b2e6-9057475ba4b8'
    const now = new Date().toISOString()

    // Try different column name combinations
    const tests = [
      { name: 'camelCase', data: { rangeId: testRangeId, status: 'TEST', createdAt: now } },
      { name: 'snake_case', data: { range_id: testRangeId, status: 'TEST', created_at: now } },
      { name: 'mixed', data: { rangeId: testRangeId, status: 'TEST', created_at: now } },
      { name: 'mixed2', data: { range_id: testRangeId, status: 'TEST', createdAt: now } }
    ]

    const results = []

    for (const test of tests) {
      const { data, error } = await supabase
        .from('status_events')
        .insert(test.data)
        .select()

      results.push({
        test: test.name,
        success: !error,
        error: error?.message,
        data: data
      })
    }

    return NextResponse.json({ results })

  } catch (error) {
    console.error('Test insert error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}