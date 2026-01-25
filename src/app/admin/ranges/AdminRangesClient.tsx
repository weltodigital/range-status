'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatTimeAgo, isStale, getStatusColorLight } from '@/lib/utils'

interface RangeWithUsers {
  id: string
  name: string
  slug: string
  area: string
  town: string | null
  status: string
  lastUpdatedAt: Date | null
  isActive: boolean
  createdAt: Date
  users: {
    id: string
    email: string
  }[]
}

interface AdminRangesClientProps {
  ranges: RangeWithUsers[]
}

export default function AdminRangesClient({ ranges: initialRanges }: AdminRangesClientProps) {
  const [ranges, setRanges] = useState(initialRanges)
  const [showStaleOnly, setShowStaleOnly] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const filteredRanges = ranges.filter(range => {
    if (!showStaleOnly) return true
    return range.lastUpdatedAt ? isStale(new Date(range.lastUpdatedAt)) : true
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Range Management</h1>
              <p className="text-gray-600">Manage golf driving ranges and their portal access</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/admin/ranges/new"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              Add New Range
            </Link>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showStaleOnly}
                onChange={(e) => setShowStaleOnly(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show stale ranges only (>90 min)</span>
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-900">{ranges.length}</div>
            <div className="text-sm text-gray-600">Total Ranges</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-green-600">
              {ranges.filter(r => r.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-amber-600">
              {ranges.filter(r => r.lastUpdatedAt && isStale(new Date(r.lastUpdatedAt))).length}
            </div>
            <div className="text-sm text-gray-600">Stale Status</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-2xl font-bold text-gray-600">
              {ranges.filter(r => r.status === 'QUIET').length}
            </div>
            <div className="text-sm text-gray-600">Currently Quiet</div>
          </div>
        </div>

        {/* Ranges Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ranges ({filteredRanges.length})
            </h2>
          </div>

          {filteredRanges.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {showStaleOnly ? 'No stale ranges found' : 'No ranges found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Portal User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRanges.map((range) => {
                    const lastUpdated = range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null
                    const isDataStale = lastUpdated ? isStale(lastUpdated) : true
                    const portalUser = range.users[0]

                    return (
                      <tr key={range.id} className={!range.isActive ? 'opacity-60' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">
                              {range.name}
                              {!range.isActive && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {range.area}{range.town && `, ${range.town}`}
                            </div>
                            <div className="text-xs text-gray-400">/{range.slug}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorLight(range.status)}`}>
                            {range.status}
                          </span>
                          {isDataStale && (
                            <div className="text-xs text-amber-600 mt-1">Stale</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lastUpdated ? formatTimeAgo(lastUpdated) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {portalUser ? portalUser.email : 'No user'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/r/${range.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                            target="_blank"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/ranges/${range.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}