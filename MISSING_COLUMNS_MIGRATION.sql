-- Missing columns migration for ranges table
-- Run this SQL in your Supabase SQL Editor to fix "Failed to create range" error

-- Add address and location fields
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "postcode" TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,8);
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(11,8);

-- Add subscription fields (from STRIPE_SETUP.md)
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "subscriptionType" TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT DEFAULT 'expired';
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "subscriptionExpiry" TIMESTAMPTZ;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;

-- Add additional subscription fields (from SUBSCRIPTION_MIGRATION.md)
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP WITH TIME ZONE;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "nextPaymentDate" TIMESTAMP WITH TIME ZONE;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ranges_subscription_status ON ranges("subscriptionStatus");
CREATE INDEX IF NOT EXISTS idx_ranges_subscription_expiry ON ranges("subscriptionExpiry");
CREATE INDEX IF NOT EXISTS idx_ranges_last_payment ON ranges("lastPaymentDate");
CREATE INDEX IF NOT EXISTS idx_ranges_stripe_customer ON ranges("stripeCustomerId");
CREATE INDEX IF NOT EXISTS idx_ranges_location ON ranges("latitude", "longitude");