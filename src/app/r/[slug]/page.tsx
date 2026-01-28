import { notFound } from 'next/navigation'
import { getRangeBySlug } from '@/lib/supabase-db'
import { formatTimeAgo, isStale, getStatusColor } from '@/lib/utils'
import { WeeklyHours } from '@/lib/hours'
import { calculateTypicalBusyTimes } from '@/lib/analytics'
import { getSubscriptionInfo, shouldShowStatusUpdate, getUpgradeMessage } from '@/lib/subscription-utils'
import OpeningHours from '@/components/OpeningHours'
import TypicalBusyTimes from '@/components/TypicalBusyTimes'
import MapWrapper from '@/components/MapWrapper'
import Logo from '@/components/Logo'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RangePageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: RangePageProps) {
  const { slug } = await params

  const range = await getRangeBySlug(slug)

  if (!range) {
    return {
      title: 'Range Not Found - Range Status',
    }
  }

  return {
    title: `${range.name} - Live Status | Range Status`,
    description: `Check how busy ${range.name} is right now. Live golf driving range traffic status.`,
  }
}

export default async function RangePage({ params }: RangePageProps) {
  const { slug } = await params

  const range = await getRangeBySlug(slug)

  if (!range) {
    notFound()
  }

  const lastUpdated = range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null
  const isDataStale = lastUpdated ? isStale(lastUpdated) : true
  const openingHours = range.openingHours
    ? range.openingHours as unknown as WeeklyHours
    : null

  // Check subscription status
  const subscriptionInfo = getSubscriptionInfo(range)
  const canShowStatus = shouldShowStatusUpdate(subscriptionInfo)

  // Calculate typical busy times only if subscription allows it
  const busyTimesData = canShowStatus ? await calculateTypicalBusyTimes(range.id) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary/90 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Logo size="md" />
          </div>
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {range.name}
            </h1>
            <p className="text-xl text-white-90">
              {range.area}{range.town && `, ${range.town}`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 -mt-4 relative z-10">

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          {canShowStatus ? (
            <>
              <div className="mb-6">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold ${getStatusColor(range.status)}`}>
                  {range.status}
                </div>
              </div>

              {range.note && (
                <p className="text-lg text-gray-700 mb-4 italic">
                  "{range.note}"
                </p>
              )}

              <div className="text-sm text-gray-600">
                {lastUpdated ? (
                  <>
                    Last updated {formatTimeAgo(lastUpdated)}
                    {isDataStale && (
                      <div className="text-amber-600 font-medium mt-2">
                        ⚠️ May be out of date
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">No recent updates</span>
                )}
              </div>
            </>
          ) : (
            <div className="py-8">
              <div className="mb-6">
                <div className="inline-flex items-center px-6 py-3 rounded-full text-xl font-bold bg-gray-100 text-gray-500">
                  Status Unavailable
                </div>
              </div>

              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-4">
                  {getUpgradeMessage(subscriptionInfo)}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Subscribe for Live Status</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Get real-time busy status updates, historical data, and more features.
                  </p>
                  <a
                    href="/portal"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Manage Subscription →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Address and Map */}
        {(range.address || range.postcode || (range.latitude && range.longitude)) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>

            {(range.address || range.postcode) && (
              <div className="mb-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="text-gray-900">
                    {range.address && <div>{range.address}</div>}
                    <div>
                      {range.area}{range.town && `, ${range.town}`}
                      {range.postcode && (
                        <span className="ml-2 text-gray-600">{range.postcode}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {range.latitude && range.longitude && (
              <div>
                <MapWrapper
                  ranges={[range]}
                  center={[range.latitude, range.longitude]}
                  zoom={15}
                  height="300px"
                />
              </div>
            )}
          </div>
        )}

        {/* Opening Hours */}
        <div className="mb-6">
          <OpeningHours hours={openingHours} />
        </div>

        {/* Typical Busy Times */}
        {canShowStatus && busyTimesData && (
          <div className="mb-6">
            <TypicalBusyTimes
              hasEnoughData={busyTimesData.hasEnoughData}
              busyTimeData={busyTimesData.busyTimeData}
              topBusyWindows={busyTimesData.topBusyWindows}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ← View all ranges
          </Link>
        </div>
      </div>
    </div>
  )
}