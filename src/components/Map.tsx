'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getSubscriptionInfo, shouldShowStatusUpdate } from '@/lib/subscription-utils'

// Create custom golf ball SVG icons for different status colors
const createGolfBallIcon = (color: string) => {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow/base -->
      <ellipse cx="16" cy="28" rx="8" ry="2" fill="#00000020"/>
      <!-- Golf ball main body -->
      <circle cx="16" cy="16" r="12" fill="white" stroke="#333" stroke-width="1"/>
      <!-- Status color indicator ring -->
      <circle cx="16" cy="16" r="11" fill="none" stroke="${color}" stroke-width="3"/>
      <!-- Golf ball dimples pattern -->
      <circle cx="12" cy="12" r="1" fill="#ddd"/>
      <circle cx="20" cy="12" r="1" fill="#ddd"/>
      <circle cx="16" cy="10" r="1" fill="#ddd"/>
      <circle cx="14" cy="16" r="1" fill="#ddd"/>
      <circle cx="18" cy="16" r="1" fill="#ddd"/>
      <circle cx="12" cy="20" r="1" fill="#ddd"/>
      <circle cx="20" cy="20" r="1" fill="#ddd"/>
      <circle cx="16" cy="22" r="1" fill="#ddd"/>
      <circle cx="10" cy="16" r="0.8" fill="#ddd"/>
      <circle cx="22" cy="16" r="0.8" fill="#ddd"/>
      <circle cx="16" cy="8" r="0.8" fill="#ddd"/>
      <circle cx="16" cy="24" r="0.8" fill="#ddd"/>
    </svg>
  `;

  const iconUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

  return new Icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// Alternative golf club icon option
const createGolfClubIcon = (color: string) => {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow/base -->
      <ellipse cx="16" cy="28" rx="6" ry="2" fill="#00000020"/>
      <!-- Golf club shaft -->
      <line x1="16" y1="6" x2="16" y2="26" stroke="#8B4513" stroke-width="2"/>
      <!-- Golf club head (driver style) -->
      <rect x="12" y="24" width="8" height="4" rx="1" fill="${color}" stroke="#333" stroke-width="0.5"/>
      <!-- Club head details -->
      <line x1="13" y1="26" x2="19" y2="26" stroke="white" stroke-width="0.5"/>
      <!-- Golf ball -->
      <circle cx="18" cy="8" r="2.5" fill="white" stroke="#333" stroke-width="0.5"/>
      <!-- Ball dimples -->
      <circle cx="17.5" cy="7.5" r="0.3" fill="#ddd"/>
      <circle cx="18.5" cy="7.5" r="0.3" fill="#ddd"/>
      <circle cx="18" cy="8.5" r="0.3" fill="#ddd"/>
      <!-- Status indicator -->
      <circle cx="8" cy="8" r="3" fill="${color}" stroke="white" stroke-width="1"/>
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
  subscriptionType?: 'trial' | 'monthly' | 'yearly' | null
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'expired'
  subscriptionExpiry?: Date | null
  lastPaymentDate?: Date | null
  canceledAt?: Date | null
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

  // Create icons for each range - using golf ball icons
  const getGolfIcon = (range: Range) => {
    const subscriptionInfo = getSubscriptionInfo(range)
    const canShowStatus = shouldShowStatusUpdate(subscriptionInfo)

    // If no subscription, show gray icon regardless of status
    const displayStatus = canShowStatus ? range.status : 'UNAVAILABLE'
    const color = getStatusColor(displayStatus)
    return createGolfBallIcon(color)
  }

  // Alternative function if you want to use golf club icons instead
  // const getGolfIcon = (status: string) => {
  //   const color = getStatusColor(status)
  //   return createGolfClubIcon(color)
  // }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUIET': return '#22c55e'
      case 'MODERATE': return '#f59e0b'
      case 'BUSY': return '#ef4444'
      case 'UNAVAILABLE': return '#9ca3af' // Gray for unavailable status
      default: return '#6b7280'
    }
  }

  const getStatusText = (range: Range) => {
    const subscriptionInfo = getSubscriptionInfo(range)
    const canShowStatus = shouldShowStatusUpdate(subscriptionInfo)

    if (!canShowStatus) {
      return 'Status Unavailable'
    }

    switch (range.status) {
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
        {rangesWithCoords.map((range) => {
          const subscriptionInfo = getSubscriptionInfo(range)
          const canShowStatus = shouldShowStatusUpdate(subscriptionInfo)
          const displayStatus = canShowStatus ? range.status : 'UNAVAILABLE'

          return (
            <Marker
              key={range.id}
              position={[range.latitude!, range.longitude!]}
              icon={getGolfIcon(range)}
            >
              <Popup>
                <div className="min-w-48">
                  <h3 className="font-semibold text-gray-900 mb-1">{range.name}</h3>
                  <div className="mb-2">
                    <span
                      className="inline-block px-2 py-1 text-xs font-medium rounded text-white"
                      style={{ backgroundColor: getStatusColor(displayStatus) }}
                    >
                      {getStatusText(range)}
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
        )
        })}
      </MapContainer>
    </div>
  )
}