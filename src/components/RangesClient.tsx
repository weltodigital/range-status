'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Range } from '@/lib/supabase-db'
import RangeCard from '@/components/RangeCard'

type SortOption = 'recent' | 'quiet-first'

export default function RangesClient() {
  const [ranges, setRanges] = useState<Range[]>([])
  const [areas, setAreas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetchRanges()

    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchRanges, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const areaParam = searchParams.get('area')
    if (areaParam) {
      setSelectedArea(areaParam)
    }
  }, [searchParams])

  const fetchRanges = async () => {
    try {
      const response = await fetch('/api/ranges')
      const data = await response.json()
      if (response.ok) {
        setRanges(data.ranges)
        setAreas(data.areas)
      }
    } catch (error) {
      console.error('Failed to fetch ranges:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUrl = (newArea: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newArea) {
      params.set('area', newArea)
    } else {
      params.delete('area')
    }
    const newUrl = params.toString() ? `${pathname}?${params}` : pathname
    router.push(newUrl, { scroll: false })
  }

  const handleAreaChange = (area: string) => {
    setSelectedArea(area)
    updateUrl(area)
  }

  const filteredRanges = ranges
    .filter(range => {
      const matchesSearch = range.name.toLowerCase().includes(search.toLowerCase()) ||
                           range.area.toLowerCase().includes(search.toLowerCase()) ||
                           (range.town && range.town.toLowerCase().includes(search.toLowerCase()))
      const matchesArea = !selectedArea || range.area === selectedArea
      return matchesSearch && matchesArea
    })
    .sort((a, b) => {
      if (sortBy === 'quiet-first') {
        const statusOrder: Record<string, number> = { 'QUIET': 0, 'MODERATE': 1, 'BUSY': 2 }
        const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
        if (statusDiff !== 0) return statusDiff
      }

      // Tie-break or default: most recently updated first
      const aTime = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0
      const bTime = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0
      return bTime - aTime
    })

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading ranges...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-secondary mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-secondary placeholder-accent bg-white"
            />
          </div>

          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
              Area
            </label>
            <select
              id="area"
              value={selectedArea}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-secondary bg-white"
            >
              <option value="">All areas</option>
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-secondary bg-white"
            >
              <option value="recent">Recently Updated</option>
              <option value="quiet-first">Quiet First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-secondary">
            {filteredRanges.length} {filteredRanges.length === 1 ? 'range' : 'ranges'}
            {selectedArea && ` in ${selectedArea}`}
          </h2>
        </div>

        {filteredRanges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-accent">
              {search || selectedArea
                ? 'No ranges found matching your criteria'
                : 'No ranges available'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRanges.map(range => (
              <RangeCard key={range.id} range={range} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}