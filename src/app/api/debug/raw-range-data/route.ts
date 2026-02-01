import { NextResponse } from "next/server"
import { getAllRanges } from "@/lib/supabase-db"

export async function GET() {
  try {
    console.log("Getting raw range data...")

    const ranges = await getAllRanges()

    // Return the first range's raw data to see the actual structure
    const firstRange = ranges?.[0]

    return NextResponse.json({
      success: true,
      firstRangeRaw: firstRange,
      allKeys: firstRange ? Object.keys(firstRange) : []
    })

  } catch (error) {
    console.error("Raw range data error:", error)

    return NextResponse.json({
      error: "Raw data fetch failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}