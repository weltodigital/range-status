# Subscription Management Database Migration

## Required SQL to run in Supabase SQL Editor:

```sql
-- Add comprehensive subscription tracking fields to ranges table
ALTER TABLE ranges
ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "nextPaymentDate" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP WITH TIME ZONE;

-- Update any ranges that don't have subscription fields with defaults
UPDATE ranges
SET
  "subscriptionType" = COALESCE("subscriptionType", 'trial'),
  "subscriptionStatus" = COALESCE("subscriptionStatus", 'active')
WHERE "subscriptionType" IS NULL OR "subscriptionStatus" IS NULL;

-- Optional: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ranges_subscription_status ON ranges("subscriptionStatus");
CREATE INDEX IF NOT EXISTS idx_ranges_subscription_expiry ON ranges("subscriptionExpiry");
CREATE INDEX IF NOT EXISTS idx_ranges_last_payment ON ranges("lastPaymentDate");
```

## Features Implemented:

### Admin Interface:
- ✅ **Subscription Status Display** - Shows detailed subscription information on range edit pages
- ✅ **Admin Range List** - Added subscription status column to the main ranges table
- ✅ **Payment Tracking** - Displays days since last payment, days until expiry, cancellation dates
- ✅ **Stripe Integration Info** - Shows Stripe customer and subscription IDs

### Public Interface (Customer-facing):
- ✅ **Partial Access Control** - Ranges without active subscriptions show limited information
- ✅ **Status Update Restrictions** - Only active subscribers can update range status
- ✅ **Upgrade Prompts** - Clear messaging directing users to subscription management
- ✅ **Subscription Status Badges** - Color-coded status indicators throughout the interface

### Range Owner Portal:
- ✅ **Subscription Dashboard** - Shows current subscription status and details
- ✅ **Feature Restrictions** - Status update form only visible to active subscribers
- ✅ **Upgrade Call-to-Action** - Direct links to billing management for expired/canceled accounts

### Subscription Logic:
- ✅ **Trial Management** - 7-day trial period with countdown
- ✅ **Payment Status Tracking** - Monthly/yearly subscription monitoring
- ✅ **Grace Periods** - Past due handling with appropriate messaging
- ✅ **Cancellation Handling** - Tracks cancellation dates and provides reactivation prompts

## Subscription States Supported:

1. **Trial** - Active 7-day trial period
2. **Active** - Paid monthly or yearly subscription
3. **Past Due** - Payment failed but still within grace period
4. **Canceled** - User canceled but may still have access until expiry
5. **Expired** - Subscription has fully expired

## Access Control:

- **Full Access**: Active paid subscriptions and active trials
- **Limited Access**: Expired, canceled, or past due subscriptions
  - Range information still visible
  - Maps and contact details still shown
  - Status updates blocked with upgrade prompts
  - Historical data (busy times) hidden

This creates a freemium model where ranges stay listed but lose key functionality without an active subscription.