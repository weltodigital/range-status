'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Create custom golf flag SVG icons for different status colors
const createGolfFlagIcon = (color: string) => {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <!-- Flag pole -->
      <line x1="16" y1="4" x2="16" y2="28" stroke="#8B4513" stroke-width="2"/>
      <!-- Flag -->
      <path d="M16 4 L28 8 L28 16 L16 12 Z" fill="${color}" stroke="#333" stroke-width="0.5"/>
      <!-- Golf ball at base -->
      <circle cx="16" cy="28" r="2" fill="white" stroke="#333" stroke-width="0.5"/>
      <!-- Golf ball dimples -->
      <circle cx="15" cy="27.5" r="0.3" fill="#ddd"/>
      <circle cx="17" cy="27.5" r="0.3" fill="#ddd"/>
      <circle cx="16" cy="28.5" r="0.3" fill="#ddd"/>
    </svg>
  `;

  const iconUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

  return new Icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 28],
    popupAnchor: [0, -28],
  });
}

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

  // Create icons for each status
  const getGolfIcon = (status: string) => {
    const color = getStatusColor(status)
    return createGolfFlagIcon(color)
  }

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
            icon={getGolfIcon(range.status)}
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