'use client'

import { useState } from 'react'
import { Range } from '@/lib/supabase-db'
import Link from 'next/link'
import Footer from '@/components/Footer'

interface BillingClientProps {
  range: Range
}

const PRICING = {
  monthly: {
    price: 49,
    period: 'month',
    description: 'Perfect for getting started'
  },
  yearly: {
    price: 490,
    period: 'year',
    savings: 98, // £588 - £490 = £98 savings
    description: 'Best value - 2 months free!'
  }
}

export default function BillingClient({ range }: BillingClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)

  const currentSubscription = {
    type: range.subscriptionType || 'trial',
    status: range.subscriptionStatus || 'active',
    expiry: range.subscriptionExpiry ? new Date(range.subscriptionExpiry) : null
  }

  const isOnTrial = currentSubscription.type === 'trial'
  const isExpired = currentSubscription.status === 'expired'
  const daysLeft = currentSubscription.expiry
    ? Math.max(0, Math.ceil((currentSubscription.expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(true)
    try {
      // This would integrate with Stripe
      const response = await fetch('/api/portal/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          rangeId: range.id
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        alert('Unable to start checkout process. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setLoading(true)
    try {
      // This would redirect to Stripe customer portal
      const response = await fetch('/api/portal/manage-billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Unable to access billing portal. Please contact support.')
      }
    } catch (error) {
      console.error('Billing portal error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-sm text-gray-600 mt-1">{range.name}</p>
          </div>

          {/* Current Subscription Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Subscription</h2>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentSubscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : currentSubscription.status === 'expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentSubscription.status === 'active' ? 'Active' :
                     currentSubscription.status === 'expired' ? 'Expired' : 'Cancelled'}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-700">Plan:</span>
                  <span className="text-sm text-gray-900 ml-2 capitalize">
                    {currentSubscription.type}
                    {currentSubscription.type === 'trial' && ` (${daysLeft} days left)`}
                  </span>
                </div>

                {currentSubscription.expiry && (
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">
                      {currentSubscription.type === 'trial' ? 'Trial expires:' : 'Next billing:'}
                    </span>
                    <span className="text-sm text-gray-900 ml-2">
                      {currentSubscription.expiry.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {!isOnTrial && currentSubscription.status === 'active' && (
                <button
                  onClick={handleManageBilling}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Manage Billing
                </button>
              )}
            </div>
          </div>

          {/* Pricing Plans (show if on trial or subscription expired) */}
          {(isOnTrial || isExpired) && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Monthly Plan */}
                  <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                    onClick={() => setSelectedPlan('monthly')}
                  >
                    <div className="flex items-center mb-4">
                      <input
                        type="radio"
                        name="plan"
                        value="monthly"
                        checked={selectedPlan === 'monthly'}
                        onChange={() => setSelectedPlan('monthly')}
                        className="text-primary focus:ring-primary"
                      />
                      <label className="ml-3 text-lg font-semibold text-gray-900">Monthly</label>
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">£{PRICING.monthly.price}</span>
                      <span className="text-gray-600 ml-1">/{PRICING.monthly.period}</span>
                    </div>

                    <p className="text-sm text-gray-600">{PRICING.monthly.description}</p>
                  </div>

                  {/* Yearly Plan */}
                  <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all relative ${
                    selectedPlan === 'yearly'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                    onClick={() => setSelectedPlan('yearly')}
                  >
                    <div className="absolute -top-3 left-6">
                      <span className="bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-full">
                        Save £{PRICING.yearly.savings}
                      </span>
                    </div>

                    <div className="flex items-center mb-4">
                      <input
                        type="radio"
                        name="plan"
                        value="yearly"
                        checked={selectedPlan === 'yearly'}
                        onChange={() => setSelectedPlan('yearly')}
                        className="text-primary focus:ring-primary"
                      />
                      <label className="ml-3 text-lg font-semibold text-gray-900">Yearly</label>
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">£{PRICING.yearly.price}</span>
                      <span className="text-gray-600 ml-1">/{PRICING.yearly.period}</span>
                      <div className="text-sm text-gray-500">
                        £{Math.round(PRICING.yearly.price / 12)}/month
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">{PRICING.yearly.description}</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => handleSubscribe(selectedPlan)}
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Subscribe to ${selectedPlan} plan`}
                </button>

                <p className="text-xs text-gray-500 mt-3">
                  7-day free trial • Secure payment by Stripe • Cancel anytime
                </p>
              </div>
            </>
          )}

          {/* Features List */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Real-time status updates</span>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Custom QR codes & posters</span>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Opening hours management</span>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Analytics & insights</span>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">Mobile-friendly portal</span>
              </div>

              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/portal"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            ← Back to Portal
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}