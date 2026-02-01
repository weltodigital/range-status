import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log("Listing all columns in ranges table...")

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

    // Query the information_schema to get all columns in the ranges table
    const { data, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'ranges'
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })

    if (error) {
      // If rpc doesn't work, try direct SQL through a simple query
      console.error('RPC failed, trying alternative approach:', error)

      // Try to get the first row to see what columns are actually available
      const { data: sampleData, error: sampleError } = await supabase
        .from('ranges')
        .select('*')
        .limit(1)

      if (sampleError) {
        return NextResponse.json({
          error: "Both column listing approaches failed",
          rpcError: error.message,
          selectError: sampleError.message
        }, { status: 500 })
      }

      // Return the keys from the sample data
      const columns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []

      return NextResponse.json({
        success: true,
        method: "sample_data_keys",
        columns: columns,
        note: "RPC failed, showing available column names from sample data"
      })
    }

    return NextResponse.json({
      success: true,
      method: "information_schema",
      columns: data
    })

  } catch (error) {
    console.error("List columns error:", error)

    return NextResponse.json({
      error: "Column listing failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}