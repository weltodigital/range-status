'use client'

import { useState } from 'react'
import { Range } from '@/lib/supabase-db'
import { useRouter } from 'next/navigation'
import { WeeklyHours, DayHours, DEFAULT_HOURS, DAYS, DAY_NAMES } from '@/lib/hours'

interface HoursClientProps {
  range: Range
}

export default function HoursClient({ range }: HoursClientProps) {
  const router = useRouter()
  const [hours, setHours] = useState<WeeklyHours>(
    range.openingHours
      ? range.openingHours as unknown as WeeklyHours
      : DEFAULT_HOURS
  )
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateDayHours = (day: typeof DAYS[number], field: keyof DayHours, value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
    // Clear error for this day when user makes changes
    if (errors[day]) {
      setErrors(prev => ({ ...prev, [day]: '' }))
    }
  }

  const validateHours = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    DAYS.forEach(day => {
      const dayHours = hours[day]
      if (!dayHours.closed) {
        if (!dayHours.open || !dayHours.close) {
          newErrors[day] = 'Open and close times are required'
          isValid = false
        } else {
          // Validate time format
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
          if (!timeRegex.test(dayHours.open) || !timeRegex.test(dayHours.close)) {
            newErrors[day] = 'Time must be in HH:MM format'
            isValid = false
          } else {
            // Validate open < close
            const [openHour, openMin] = dayHours.open.split(':').map(Number)
            const [closeHour, closeMin] = dayHours.close.split(':').map(Number)
            const openTime = openHour * 60 + openMin
            const closeTime = closeHour * 60 + closeMin
            if (openTime >= closeTime) {
              newErrors[day] = 'Open time must be before close time'
              isValid = false
            }
          }
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSave = async () => {
    if (!validateHours()) {
      return
    }

    setLoading(true)
    setSaveStatus('')

    try {
      const response = await fetch('/api/portal/hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hours }),
      })

      const data = await response.json()

      if (response.ok) {
        setSaveStatus('Saved!')
        setTimeout(() => setSaveStatus(''), 2000)
      } else {
        setSaveStatus('Error saving')
        setTimeout(() => setSaveStatus(''), 3000)
      }
    } catch (error) {
      console.error('Error saving hours:', error)
      setSaveStatus('Error saving')
      setTimeout(() => setSaveStatus(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Opening Hours</h1>
              <p className="text-sm text-gray-600">{range.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            {DAYS.map((day, index) => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{DAY_NAMES[index]}</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hours[day].closed}
                      onChange={(e) => updateDayHours(day, 'closed', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Closed</span>
                  </label>
                </div>

                {!hours[day].closed && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Open</label>
                      <input
                        type="time"
                        value={hours[day].open || ''}
                        onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Close</label>
                      <input
                        type="time"
                        value={hours[day].close || ''}
                        onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white text-gray-900"
                      />
                    </div>
                  </div>
                )}

                {errors[day] && (
                  <p className="text-red-600 text-xs mt-2">{errors[day]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : 'Save Opening Hours'}
            </button>

            {saveStatus && (
              <div className={`text-center py-2 rounded mt-3 ${
                saveStatus === 'Saved!'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {saveStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}