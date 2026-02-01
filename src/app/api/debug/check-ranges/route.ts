import { NextResponse } from "next/server"
import { getAllRanges } from "@/lib/supabase-db"

export async function GET() {
  try {
    console.log("Checking all ranges subscription status...")

    const ranges = await getAllRanges()

    const rangeData = ranges?.map(range => ({
      id: range.id,
      name: range.name,
      subscriptionType: range.subscriptionType,
      subscriptionStatus: range.subscriptionStatus,
      subscriptionExpiry: range.subscriptionExpiry,
      stripeCustomerId: range.stripeCustomerId,
      stripeSubscriptionId: range.stripeSubscriptionId,
      isActive: range.isActive,
      hasUser: range.users.length > 0,
      userEmail: range.users[0]?.email
    }))

    return NextResponse.json({
      success: true,
      totalRanges: ranges?.length || 0,
      ranges: rangeData,
      message: "Range subscription status check complete"
    })

  } catch (error) {
    console.error("Debug range check error:", error)

    return NextResponse.json({
      error: "Debug check failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}