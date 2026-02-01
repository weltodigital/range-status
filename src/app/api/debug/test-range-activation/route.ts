import { NextResponse } from "next/server"
import { activateRangeWithUser } from "@/lib/supabase-db"

export async function GET() {
  try {
    console.log("Testing range activation...")

    // Use the range ID from the range we created without a user
    // In practice, you'd get this from the admin interface
    const rangeId = "529a65b7-9819-42e0-a7dd-1063e9893c69" // From our previous test

    const activationData = {
      rangeId,
      email: "owner@testrange.com",
      password: "newPassword123"
    }

    console.log("Activation data:", JSON.stringify(activationData, null, 2))

    const result = await activateRangeWithUser(activationData)

    if (!result) {
      return NextResponse.json({
        error: "Range activation failed",
        activationData
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      result,
      activationData,
      message: "Range successfully activated with user account!"
    })

  } catch (error) {
    console.error("Debug range activation error:", error)

    return NextResponse.json({
      error: "Debug test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}