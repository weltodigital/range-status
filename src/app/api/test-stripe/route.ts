import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if environment variables are present
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY
    const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const hasMonthlyPrice = !!process.env.STRIPE_MONTHLY_PRICE_ID
    const hasYearlyPrice = !!process.env.STRIPE_YEARLY_PRICE_ID
    const hasDomain = !!process.env.NEXT_PUBLIC_DOMAIN

    return NextResponse.json({
      stripe_configured: hasSecretKey && hasPublishableKey && hasMonthlyPrice && hasYearlyPrice,
      environment_variables: {
        STRIPE_SECRET_KEY: hasSecretKey ? '✅ Set' : '❌ Missing',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: hasPublishableKey ? '✅ Set' : '❌ Missing',
        STRIPE_MONTHLY_PRICE_ID: hasMonthlyPrice ? '✅ Set' : '❌ Missing',
        STRIPE_YEARLY_PRICE_ID: hasYearlyPrice ? '✅ Set' : '❌ Missing',
        NEXT_PUBLIC_DOMAIN: hasDomain ? '✅ Set' : '❌ Missing'
      },
      secret_key_format: hasSecretKey ? (process.env.STRIPE_SECRET_KEY!.startsWith('sk_') ? '✅ Valid format' : '❌ Invalid format') : '❌ Not set',
      domain_value: process.env.NEXT_PUBLIC_DOMAIN || 'Not set'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check Stripe configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}