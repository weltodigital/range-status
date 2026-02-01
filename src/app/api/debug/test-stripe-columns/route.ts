import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log("Testing Stripe columns...")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-admin'
        }
      }
    })

    // Try to select just the new columns to see if they exist
    const { data, error } = await supabase
      .from('ranges')
      .select('id, name, stripeCustomerId, stripeSubscriptionId')
      .limit(1)

    if (error) {
      console.error('Error selecting stripe columns:', error)
      return NextResponse.json({
        error: "Column test failed",
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Stripe columns exist and can be selected",
      sampleData: data
    })

  } catch (error) {
    console.error("Stripe column test error:", error)

    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}