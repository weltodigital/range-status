# Stripe Setup Guide for Range Status

This guide walks you through setting up Stripe for subscription billing with 7-day trials.

## 1. Stripe Dashboard Setup

### Create Products and Prices

1. **Log into Stripe Dashboard** → Products → Add Product

2. **Create Monthly Product:**
   - Name: "Range Status Monthly"
   - Description: "Monthly subscription to Range Status platform"
   - Price ID: Create recurring price
     - Amount: £29.00 GBP
     - Billing period: Monthly
     - **Important**: Copy the Price ID (e.g., `price_1ABC123...`)

3. **Create Yearly Product:**
   - Name: "Range Status Yearly"
   - Description: "Yearly subscription to Range Status platform (2 months free)"
   - Price ID: Create recurring price
     - Amount: £290.00 GBP
     - Billing period: Yearly
     - **Important**: Copy the Price ID

### Set up Trial Periods

Stripe handles trials automatically when you:
1. Set `trial_period_days: 7` in checkout session creation
2. Or use `trial_end` timestamp for specific trial end dates

## 2. Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Keys (get from Stripe Dashboard → Developers → API Keys)
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_ for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_ for production

# Price IDs (from products you created above)
STRIPE_MONTHLY_PRICE_ID=price_1ABC123...
STRIPE_YEARLY_PRICE_ID=price_1DEF456...

# Webhook endpoint secret (from Stripe Dashboard → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...

# Your domain
NEXT_PUBLIC_DOMAIN=https://yourdomain.com # or http://localhost:3000 for dev
```

## 3. Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

## 4. Webhook Configuration

1. **Stripe Dashboard** → Developers → Webhooks → Add endpoint
2. **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
3. **Events to send**:
   ```
   checkout.session.completed
   customer.subscription.created
   customer.subscription.updated
   customer.subscription.deleted
   customer.subscription.trial_will_end
   invoice.payment_succeeded
   invoice.payment_failed
   ```

## 5. Database Schema

You'll need to add these columns to your `ranges` table in Supabase:

```sql
-- Add subscription columns to ranges table
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'trial';
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE ranges ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_ranges_subscription_status ON ranges(subscription_status);
CREATE INDEX IF NOT EXISTS idx_ranges_stripe_customer ON ranges(stripe_customer_id);
```

## 6. Implementation Steps

### Step 1: Replace Mock API Endpoints

Update `/api/portal/create-checkout/route.ts` with real Stripe integration:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: NextRequest) {
  // ... existing auth code ...

  const priceId = plan === 'yearly'
    ? process.env.STRIPE_YEARLY_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 7, // 7-day trial
      metadata: {
        rangeId: range.id,
        plan: plan
      }
    },
    success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/portal/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/portal/billing?canceled=true`,
    metadata: {
      rangeId: range.id,
      plan: plan
    }
  })

  return NextResponse.json({ url: session.url })
}
```

### Step 2: Update Billing Management

Update `/api/portal/manage-billing/route.ts`:

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: range.stripeCustomerId!,
  return_url: `${process.env.NEXT_PUBLIC_DOMAIN}/portal/billing`
})

return NextResponse.json({ url: session.url })
```

### Step 3: Implement Webhook Processing

Update `/api/webhooks/stripe/route.ts` with signature verification:

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    // ... other event handlers
  }

  return NextResponse.json({ received: true })
}
```

## 7. Trial Management

### Option A: Stripe-managed Trials (Recommended)
- Set `trial_period_days: 7` in checkout session
- Stripe automatically handles trial logic
- First invoice created after trial ends
- Customer charged automatically after trial

### Option B: Custom Trial Logic
```typescript
// When creating subscription
subscription_data: {
  trial_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
  metadata: { ... }
}
```

## 8. Testing

1. **Use Stripe Test Mode** for development
2. **Test Cards**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0027 6000 3184`

3. **Test Trial Flow**:
   - Create subscription with trial
   - Verify trial period in Stripe Dashboard
   - Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## 9. Go Live Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test subscription flow end-to-end
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications in Stripe
- [ ] Set up dunning management for failed payments

## 10. Important Notes

- **Trials start immediately** upon subscription creation
- **No payment required** during trial period
- **Automatic billing** begins after trial ends
- **Webhooks are critical** for keeping your database in sync
- **Always verify webhook signatures** for security
- **Handle idempotency** in webhook processing

This setup provides a complete subscription system with 7-day trials, automatic billing, and customer self-service portal access.