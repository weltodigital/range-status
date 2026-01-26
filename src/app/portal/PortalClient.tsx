'use client'

import { useState } from 'react'
import StatusButton from '@/components/StatusButton'
import { formatTimeAgo, isStale } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

interface RangeType {
  id: string
  name: string
  slug: string
  area: string
  town: string | null
  status: string
  note?: string | null
  lastUpdatedAt: Date | null
  openingHours?: any
  isActive: boolean
  createdAt: Date
}

interface PortalClientProps {
  range: RangeType
}

export default function PortalClient({ range: initialRange }: PortalClientProps) {
  const [range, setRange] = useState(initialRange)
  const [note, setNote] = useState(range.note || '')
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const router = useRouter()

  const handleStatusUpdate = async (newStatus: 'QUIET' | 'MODERATE' | 'BUSY') => {
    setLoading(true)
    setSaveStatus('')

    try {
      const response = await fetch('/api/portal/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note: note.trim() || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setRange(data.range)
        setSaveStatus('Saved!')
        setTimeout(() => setSaveStatus(''), 2000)
      } else {
        setSaveStatus('Error saving')
        setTimeout(() => setSaveStatus(''), 3000)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      setSaveStatus('Error saving')
      setTimeout(() => setSaveStatus(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-secondary to-secondary/90 p-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Logo size="md" />
            <button
              onClick={handleLogout}
              className="text-sm text-white-80 hover-text-white px-3 py-1 rounded border border-white/30 hover:border-white/60 transition-all"
            >
              Logout
            </button>
          </div>
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-1 text-white">{range.name}</h1>
            <p className="text-white-80">{range.area}{range.town && `, ${range.town}`}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">

          {range.lastUpdatedAt && (
            <div className="mb-4">
              <p className="text-sm text-accent">
                Last updated: {formatTimeAgo(new Date(range.lastUpdatedAt))}
              </p>
              {isStale(new Date(range.lastUpdatedAt)) && (
                <p className="text-sm text-amber-600 font-medium">
                  ⚠️ Status may be out of date
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-secondary">Update Status</h2>

          <div className="space-y-3 mb-4">
            <StatusButton
              status="QUIET"
              isActive={range.status === 'QUIET'}
              onClick={() => handleStatusUpdate('QUIET')}
              disabled={loading}
            />
            <StatusButton
              status="MODERATE"
              isActive={range.status === 'MODERATE'}
              onClick={() => handleStatusUpdate('MODERATE')}
              disabled={loading}
            />
            <StatusButton
              status="BUSY"
              isActive={range.status === 'BUSY'}
              onClick={() => handleStatusUpdate('BUSY')}
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-secondary mb-2">
              Optional Note (60 chars max)
            </label>
            <input
              id="note"
              type="text"
              maxLength={60}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lesson in progress, Open late today"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-gray-900 placeholder-gray-400"
            />
            <p className="text-xs text-accent mt-1">{note.length}/60 characters</p>
          </div>

          {saveStatus && (
            <div className={`text-center py-2 rounded ${
              saveStatus === 'Saved!'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {saveStatus}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-secondary">Opening Hours</h2>
          <button
            onClick={() => router.push('/portal/hours')}
            className="w-full px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
          >
            Manage Opening Hours
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 text-secondary">Public Page & QR Code</h2>
          <button
            onClick={() => router.push('/portal/qr')}
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            View QR Code & Print Poster
          </button>
        </div>
      </div>
    </div>
  )
}