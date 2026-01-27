'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = new Icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface Range {
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
}

interface MapProps {
  ranges: Range[]
  center?: [number, number]
  zoom?: number
  height?: string
  showAllRanges?: boolean
}

export default function Map({
  ranges,
  center = [54.5, -3], // UK center
  zoom = 6,
  height = '400px',
  showAllRanges = false
}: MapProps) {
  // Filter ranges that have coordinates
  const rangesWithCoords = ranges.filter(range =>
    range.latitude && range.longitude
  )

  // Use first range's coordinates as center if only showing one range
  const mapCenter = !showAllRanges && rangesWithCoords.length === 1
    ? [rangesWithCoords[0].latitude!, rangesWithCoords[0].longitude!] as [number, number]
    : center

  const mapZoom = !showAllRanges && rangesWithCoords.length === 1 ? 15 : zoom

  useEffect(() => {
    // Set default icon for all markers
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: icon.src,
        iconUrl: icon.src,
        shadowUrl: iconShadow.src,
      })
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUIET': return '#22c55e'
      case 'MODERATE': return '#f59e0b'
      case 'BUSY': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'QUIET': return 'Quiet'
      case 'MODERATE': return 'Moderate'
      case 'BUSY': return 'Busy'
      default: return 'Unknown'
    }
  }

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {rangesWithCoords.map((range) => (
          <Marker
            key={range.id}
            position={[range.latitude!, range.longitude!]}
            icon={DefaultIcon}
          >
            <Popup>
              <div className="min-w-48">
                <h3 className="font-semibold text-gray-900 mb-1">{range.name}</h3>
                <div className="mb-2">
                  <span
                    className="inline-block px-2 py-1 text-xs font-medium rounded text-white"
                    style={{ backgroundColor: getStatusColor(range.status) }}
                  >
                    {getStatusText(range.status)}
                  </span>
                </div>
                {range.note && (
                  <p className="text-sm text-gray-600 mb-2">{range.note}</p>
                )}
                <div className="text-xs text-gray-500 mb-2">
                  {range.area}{range.town && `, ${range.town}`}
                </div>
                <a
                  href={`/r/${range.slug}`}
                  className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  View Range →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}