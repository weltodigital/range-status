'use client'

import { useState } from 'react'
import RangeOwnerContactForm from '@/components/RangeOwnerContactForm'
import { SubscriptionInfo } from '@/lib/subscription-utils'

interface RangePageClientProps {
  rangeId: string
  rangeName: string
  subscriptionInfo: SubscriptionInfo
  contactUsMessage: string
}

export default function RangePageClient({
  rangeId,
  rangeName,
  subscriptionInfo,
  contactUsMessage
}: RangePageClientProps) {
  const [showContactForm, setShowContactForm] = useState(false)

  return (
    <>
      <div className="max-w-md mx-auto">
        <p className="text-gray-600 mb-4">
          {contactUsMessage}
        </p>

        {/* Check if this is a new range that needs to contact us */}
        {subscriptionInfo.isExpired && !subscriptionInfo.isTrial && !subscriptionInfo.isPaid && !subscriptionInfo.isCanceled ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Get Listed with Live Status</h3>
            <p className="text-sm text-green-700 mb-3">
              This range is in our directory. Contact us to set up live status updates and subscription features.
            </p>
            <button
              onClick={() => setShowContactForm(true)}
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium mr-2"
            >
              Request Access →
            </button>
            <a
              href="/portal"
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Portal Login
            </a>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Subscribe for Live Status</h3>
            <p className="text-sm text-blue-700 mb-3">
              Get real-time busy status updates, historical data, and more features.
            </p>
            <button
              onClick={() => setShowContactForm(true)}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium mr-2"
            >
              Request Access →
            </button>
            <a
              href="/portal"
              className="inline-block bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Manage Subscription
            </a>
          </div>
        )}
      </div>

      {showContactForm && (
        <RangeOwnerContactForm
          rangeId={rangeId}
          rangeName={rangeName}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </>
  )
}