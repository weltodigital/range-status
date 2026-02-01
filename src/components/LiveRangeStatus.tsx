'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStatusColor } from '@/lib/utils'

interface LiveRangeStatusProps {
  slug: string
  initialStatus: string
  initialNote?: string | null
  initialLastUpdated?: Date | null
  initialIsStale: boolean
}

interface RangeStatus {
  status: string
  note?: string | null
  lastUpdated?: string | null
  lastUpdatedText: string
  isStale: boolean
}

export default function LiveRangeStatus({
  slug,
  initialStatus,
  initialNote,
  initialLastUpdated,
  initialIsStale
}: LiveRangeStatusProps) {
  const [status, setStatus] = useState<RangeStatus>({
    status: initialStatus,
    note: initialNote,
    lastUpdated: initialLastUpdated?.toISOString() || null,
    lastUpdatedText: initialLastUpdated ? 'Just loaded' : 'Never',
    isStale: initialIsStale
  })

  const [isPolling, setIsPolling] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      console.log(`[LiveRangeStatus] Fetching status for ${slug} at ${new Date().toLocaleTimeString()}`)
      const response = await fetch(`/api/ranges/${slug}/status`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      if (response.ok) {
        const newStatus: RangeStatus = await response.json()
        console.log(`[LiveRangeStatus] Received status:`, newStatus)

        // Only update if there's actually a change
        setStatus(prevStatus => {
          const hasChanged =
            prevStatus.status !== newStatus.status ||
            prevStatus.note !== newStatus.note ||
            prevStatus.lastUpdated !== newStatus.lastUpdated ||
            prevStatus.isStale !== newStatus.isStale

          if (hasChanged) {
            console.log(`[LiveRangeStatus] Status changed - updating UI`)
            return newStatus
          } else {
            console.log(`[LiveRangeStatus] No changes detected`)
            return prevStatus
          }
        })
      } else {
        console.error('Failed to fetch status - response not ok:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }, [slug])

  useEffect(() => {
    if (!isPolling) return

    // Poll every 30 seconds
    const interval = setInterval(fetchStatus, 30000)

    return () => clearInterval(interval)
  }, [fetchStatus, isPolling])

  useEffect(() => {
    // Handle page visibility changes to pause/resume polling
    const handleVisibilityChange = () => {
      setIsPolling(!document.hidden)

      // Fetch immediately when page becomes visible
      if (!document.hidden) {
        fetchStatus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchStatus])

  return (
    <div className="mb-6">
      <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold ${getStatusColor(status.status)}`}>
        {status.status}
      </div>

      {status.note && (
        <p className="text-lg text-gray-700 mb-4 italic mt-4">
          "{status.note}"
        </p>
      )}

      <div className="text-sm text-gray-600 mt-4">
        {status.lastUpdated ? (
          <>
            Last updated {status.lastUpdatedText}
            {status.isStale && (
              <div className="text-amber-600 font-medium mt-2">
                ⚠️ May be out of date
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-400">No recent updates</span>
        )}

        {/* Visual indicator that it's live updating */}
        <div className="flex items-center mt-2">
          <div className={`w-2 h-2 rounded-full mr-2 ${isPolling ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-500">
            {isPolling ? 'Live updates' : 'Paused'}
          </span>
        </div>
      </div>
    </div>
  )
}