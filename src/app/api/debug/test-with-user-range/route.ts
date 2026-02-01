import { NextResponse } from "next/server"
import { createRangeWithUser } from "@/lib/supabase-db"

export async function GET() {
  try {
    console.log("Testing range creation with user...")

    // Test data with email/password
    const timestamp = Date.now()
    const testData = {
      name: `test range with user ${timestamp}`,
      slug: `test-range-with-user-${timestamp}`,
      area: "Hampshire",
      town: "Portsmouth",
      address: "test range address",
      postcode: "PO1 1AA",
      latitude: 50.8,
      longitude: -1.1,
      email: `testuser${timestamp}@example.com`,
      password: "testPassword123"
    }

    console.log("Test data (with user):", JSON.stringify(testData, null, 2))

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
      testData,
      message: "Range created with user account - traditional workflow working!"
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