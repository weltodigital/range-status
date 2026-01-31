import { NextResponse } from "next/server"
import { checkSlugExists, checkEmailExists } from "@/lib/supabase-db"

export async function GET() {
  try {
    console.log("Checking Portsmouth Golf Centre data...")

    const email = "enquiries@portsmouthgolfcentre.co.uk"
    const slug = "portsmouth-golf-centre"

    console.log("Checking email:", email)
    const emailExists = await checkEmailExists(email)
    console.log("Email exists:", emailExists)

    console.log("Checking slug:", slug)
    const slugExists = await checkSlugExists(slug)
    console.log("Slug exists:", slugExists)

    return NextResponse.json({
      email,
      emailExists,
      slug,
      slugExists,
      canCreate: !emailExists && !slugExists
    })

  } catch (error) {
    console.error("Debug check error:", error)
    return NextResponse.json({
      error: "Debug check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}