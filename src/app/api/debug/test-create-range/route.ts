import { NextResponse } from "next/server"
import { createRangeWithUser } from "@/lib/supabase-db"

export async function GET() {
  try {
    console.log("Testing range creation...")

    // Test data - using your exact data from the form
    const testData = {
      name: "test range",
      slug: "test-range",
      area: "Hampshire",
      town: "Havant",
      address: "tes range range",
      postcode: "PO9 3LR",
      latitude: 50.84187196252509,
      longitude: -0.9879131479193698,
      email: "edwelton0@gmail.com",
      password: "yl3ygwVWXOmW",
    }

    console.log("Test data:", JSON.stringify(testData, null, 2))

    const result = await createRangeWithUser(testData)

    if (!result) {
      return NextResponse.json({
        error: "createRangeWithUser returned null",
        testData
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      result,
      testData
    })

  } catch (error) {
    console.error("Debug range creation error:", error)

    return NextResponse.json({
      error: "Debug test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
