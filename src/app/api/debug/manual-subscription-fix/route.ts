import { NextResponse } from "next/server"
import { updateRangeSubscription } from "@/lib/supabase-db"

export async function POST() {
  try {
    console.log("Manually fixing Ed's Golf Range subscription...")

    // Ed's Golf Range ID from the debug output
    const rangeId = "04c14f55-8815-4a44-a1ed-989967ff38c2"

    // Calculate 7 day trial expiry
    const subscriptionExpiry = new Date()
    subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 7)

    // Update the subscription (assuming monthly plan)
    const result = await updateRangeSubscription(rangeId, {
      subscriptionType: 'monthly' as 'monthly' | 'yearly',
      subscriptionStatus: 'active' as 'active' | 'expired' | 'canceled',
      subscriptionExpiry,
      stripeCustomerId: 'cus_manual_fix_' + Date.now(), // Placeholder since we don't have the real customer ID
      stripeSubscriptionId: 'sub_manual_fix_' + Date.now() // Placeholder since we don't have the real subscription ID
    })

    if (!result) {
      throw new Error('Failed to update range subscription')
    }

    return NextResponse.json({
      success: true,
      message: "Ed's Golf Range subscription manually fixed",
      rangeId,
      subscriptionExpiry: subscriptionExpiry.toISOString(),
      note: "This is a manual fix. You should check Stripe dashboard for the real customer and subscription IDs and update them properly."
    })

  } catch (error) {
    console.error("Manual subscription fix error:", error)

    return NextResponse.json({
      error: "Manual fix failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}