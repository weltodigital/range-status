'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatTimeAgo, isStale, getStatusColorLight } from '@/lib/utils'
import { getSubscriptionInfo, getSubscriptionStatusBadge, hasUsedFreeTrial } from '@/lib/subscription-utils'

interface RangeWithUsers {
  id: string
  name: string
  slug: string
  area: string
  town: string | null
  address?: string | null
  postcode?: string | null
  latitude?: number | null
  longitude?: number | null
  status: string
  note?: string | null
  lastUpdatedAt: Date | null
  openingHours?: any
  isActive: boolean
  createdAt: Date
  subscriptionType?: 'trial' | 'monthly' | 'yearly'
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'expired'
  subscriptionExpiry?: Date | null
  lastPaymentDate?: Date | null
  nextPaymentDate?: Date | null
  canceledAt?: Date | null
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  users: {
    id: string
    email: string
  }[]
}

interface EditRangeClientProps {
  range: RangeWithUsers
}

export default function EditRangeClient({ range: initialRange }: EditRangeClientProps) {
  const [range, setRange] = useState(initialRange)
  const subscriptionInfo = getSubscriptionInfo(range)
  const [name, setName] = useState(range.name)
  const [area, setArea] = useState(range.area)
  const [town, setTown] = useState(range.town || '')
  const [address, setAddress] = useState(range.address || '')
  const [postcode, setPostcode] = useState(range.postcode || '')
  const [latitude, setLatitude] = useState(range.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(range.longitude?.toString() || '')
  const [slug, setSlug] = useState(range.slug)
  const [newPassword, setNewPassword] = useState('')
  const [portalEmail, setPortalEmail] = useState('')
  const [portalPassword, setPortalPassword] = useState('')
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const router = useRouter()
  const portalUser = range.users[0]
  const lastUpdated = range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null
  const isDataStale = lastUpdated ? isStale(lastUpdated) : true

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(result)
  }

  const generateRandomPortalPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPortalPassword(result)
  }

  const handleCreatePortalAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/admin/ranges/${range.id}/activate-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: portalEmail.trim(),
          password: portalPassword.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(`Portal access created successfully for ${portalEmail}`)
        setPortalEmail('')
        setPortalPassword('')
        // Refresh the page to show the new user
        window.location.reload()
      } else {
        setError(data.error || 'Failed to create portal access')
      }
    } catch (err) {
      console.error('Error creating portal access:', err)
      setError('Failed to create portal access')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/admin/ranges/${range.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          area: area.trim(),
          town: town.trim() || null,
          address: address.trim() || null,
          postcode: postcode.trim() || null,
          latitude: latitude.trim() ? parseFloat(latitude.trim()) : null,
          longitude: longitude.trim() ? parseFloat(longitude.trim()) : null,
          slug: slug.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setRange(data.range)
        setSuccessMessage('Range updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Failed to update range')
      }
    } catch (err) {
      console.error('Error updating range:', err)
      setError('Failed to update range')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) {
      setError('Please enter a new email')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/admin/ranges/${range.id}/update-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage('Email updated successfully!')
        setEditingEmail(false)
        setNewEmail('')
        // Refresh the page to show the new email
        window.location.reload()
      } else {
        setError(data.error || 'Failed to update email')
      }
    } catch (err) {
      console.error('Error updating email:', err)
      setError('Failed to update email')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/admin/ranges/${range.id}/admin-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewPassword('')
        setSuccessMessage('Password reset successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      console.error('Error resetting password:', err)
      setError('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/admin/ranges/${range.id}/toggle-active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setRange(data.range)
        setSuccessMessage(`Range ${data.range.isActive ? 'activated' : 'deactivated'} successfully!`)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Failed to toggle active status')
      }
    } catch (err) {
      console.error('Error toggling active status:', err)
      setError('Failed to toggle active status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Range</h1>
              <p className="text-gray-600">{range.name}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Range Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Range Details</h2>

            <form onSubmit={handleUpdateRange} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Range Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                    Area *
                  </label>
                  <input
                    id="area"
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-2">
                    Town (Optional)
                  </label>
                  <input
                    id="town"
                    type="text"
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 123 High Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
                    Postcode (Optional)
                  </label>
                  <input
                    id="postcode"
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. AB12 3CD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (Optional)
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 51.5074"
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (Optional)
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. -0.1278"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Public URL: /r/{slug}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Range Details'}
              </button>
            </form>
          </div>

          {/* Range Status & Management */}
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorLight(range.status)}`}>
                    {range.status}
                  </span>
                </div>

                {range.note && (
                  <div>
                    <span className="text-sm text-gray-600">Note:</span>
                    <p className="text-sm text-gray-900 italic">"{range.note}"</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm text-gray-900">
                    {lastUpdated ? formatTimeAgo(lastUpdated) : 'Never'}
                    {isDataStale && (
                      <span className="text-amber-600 ml-2">• Stale</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active:</span>
                  <span className={`text-sm font-medium ${range.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {range.isActive ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={getSubscriptionStatusBadge(subscriptionInfo)}>
                    {subscriptionInfo.statusText}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm text-gray-900 capitalize">
                    {range.subscriptionType || 'Trial'}
                  </span>
                </div>

                {range.subscriptionExpiry && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Expires:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(range.subscriptionExpiry).toLocaleDateString()}
                      {subscriptionInfo.daysRemaining !== null && subscriptionInfo.daysRemaining > 0 && (
                        <span className="text-gray-500 ml-2">
                          ({subscriptionInfo.daysRemaining} days remaining)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {range.lastPaymentDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Payment:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(range.lastPaymentDate).toLocaleDateString()}
                      {subscriptionInfo.daysSinceLastPayment !== null && (
                        <span className="text-gray-500 ml-2">
                          ({subscriptionInfo.daysSinceLastPayment} days ago)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {range.nextPaymentDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next Payment:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(range.nextPaymentDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {range.canceledAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Canceled:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(range.canceledAt).toLocaleDateString()}
                      {subscriptionInfo.daysSinceCanceled !== null && (
                        <span className="text-gray-500 ml-2">
                          ({subscriptionInfo.daysSinceCanceled} days ago)
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {range.stripeCustomerId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stripe Customer:</span>
                    <span className="text-sm text-gray-900 font-mono">
                      {range.stripeCustomerId}
                    </span>
                  </div>
                )}

                {range.stripeSubscriptionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stripe Subscription:</span>
                    <span className="text-sm text-gray-900 font-mono">
                      {range.stripeSubscriptionId}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Full Access:</span>
                  <span className={`text-sm font-medium ${subscriptionInfo.canAccessFullFeatures ? 'text-green-600' : 'text-red-600'}`}>
                    {subscriptionInfo.canAccessFullFeatures ? 'Yes' : 'No'}
                  </span>
                </div>

                {/* Admin Subscription Controls */}
                {subscriptionInfo.isExpired && !subscriptionInfo.isTrial && !subscriptionInfo.isPaid && !subscriptionInfo.isCanceled && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Range Needs Account Setup</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      This range is listed but needs to contact us for full account setup.
                      {hasUsedFreeTrial(range)
                        ? ' Note: This range has already used their free trial, so they will need to set up payment immediately.'
                        : ' Once they contact us and are ready to subscribe, you can activate their subscription access with a 7-day free trial.'
                      }
                    </p>
                    <button
                      onClick={async () => {
                        const hasUsedTrial = hasUsedFreeTrial(range)
                        const confirmMessage = hasUsedTrial
                          ? 'This range has already used their free trial. Activating will require immediate payment setup. Continue?'
                          : 'Activate subscription access for this range? They will get a 7-day free trial.'

                        if (confirm(confirmMessage)) {
                          try {
                            const response = await fetch(`/api/admin/ranges/${range.id}/activate-subscription`, {
                              method: 'POST'
                            })

                            if (response.ok) {
                              window.location.reload()
                            } else {
                              const errorData = await response.json()
                              if (errorData.requiresPayment) {
                                alert('This range has already used their free trial. A paid subscription must be set up before activation.')
                              } else {
                                alert('Failed to activate subscription access: ' + (errorData.message || 'Unknown error'))
                              }
                            }
                          } catch (error) {
                            alert('Error activating subscription access')
                          }
                        }
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      {hasUsedFreeTrial(range) ? 'Activate (Paid Required)' : 'Activate with Free Trial'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Portal User */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Portal User</h2>

              {portalUser ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Email:</span>
                      {!editingEmail && (
                        <button
                          onClick={() => {
                            setEditingEmail(true)
                            setNewEmail(portalUser.email)
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {editingEmail ? (
                      <form onSubmit={handleUpdateEmail} className="space-y-2">
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter new email"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={loading || !newEmail.trim()}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEmail(false)
                              setNewEmail('')
                            }}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-900 font-medium">{portalUser.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Reset Password
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="newPassword"
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Generate
                      </button>
                    </div>
                    <button
                      onClick={handleResetPassword}
                      disabled={loading || !newPassword.trim()}
                      className="mt-2 w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">No portal user found. Create portal access for the range owner:</p>

                  <form onSubmit={handleCreatePortalAccess} className="space-y-4">
                    <div>
                      <label htmlFor="portalEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Portal Email
                      </label>
                      <input
                        id="portalEmail"
                        type="email"
                        required
                        value={portalEmail}
                        onChange={(e) => setPortalEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="owner@rangeexample.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="portalPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Portal Password
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="portalPassword"
                          type="text"
                          required
                          value={portalPassword}
                          onChange={(e) => setPortalPassword(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={generateRandomPortalPassword}
                          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Generate
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !portalEmail.trim() || !portalPassword.trim()}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {loading ? 'Creating Portal Access...' : 'Create Portal Access'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Range Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Range Management</h2>

              <div className="space-y-4">
                <button
                  onClick={handleToggleActive}
                  disabled={loading}
                  className={`w-full px-4 py-2 rounded focus:outline-none focus:ring-2 disabled:opacity-50 ${
                    range.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {loading ? 'Processing...' : (range.isActive ? 'Deactivate Range' : 'Activate Range')}
                </button>

                <a
                  href={`/r/${range.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View Public Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}