import Link from 'next/link'
import { Range } from '@/lib/supabase-db'
import { formatTimeAgo, isStale, getStatusColorLight } from '@/lib/utils'
import { getSubscriptionInfo, shouldShowStatusUpdate } from '@/lib/subscription-utils'

interface RangeCardProps {
  range: Range & {
    _count?: {
      statusEvents: number
    }
  }
}

export default function RangeCard({ range }: RangeCardProps) {
  const lastUpdated = range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null
  const isDataStale = lastUpdated ? isStale(lastUpdated) : true

  // Check subscription status
  const subscriptionInfo = getSubscriptionInfo(range)
  const canShowStatus = shouldShowStatusUpdate(subscriptionInfo)

  return (
    <Link
      href={`/r/${range.slug}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-4"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-secondary text-lg">{range.name}</h3>
          <p className="text-sm text-accent">
            {range.area}{range.town && `, ${range.town}`}
          </p>
        </div>
        <div className="text-right">
          {canShowStatus ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorLight(range.status)}`}>
              {range.status}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Status Unavailable
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="text-accent">
          {lastUpdated ? (
            <>
              Updated {formatTimeAgo(lastUpdated)}
              {isDataStale && (
                <span className="text-amber-600 ml-2">• May be out of date</span>
              )}
            </>
          ) : (
            <span className="text-accent">No recent updates</span>
          )}
        </div>
      </div>

      {range.note && (
        <p className="text-sm text-secondary mt-2 italic">"{range.note}"</p>
      )}
    </Link>
  )
}