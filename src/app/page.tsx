import { Suspense } from 'react'
import { headers } from 'next/headers'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import RangesClient from '@/components/RangesClient'
import PortalClient from '@/app/portal/PortalClient'
import Header from '@/components/Header'
import Logo from '@/components/Logo'
import { getRangeById } from '@/lib/supabase-db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Golf Driving Ranges - Range Status',
  description: 'Find golf driving ranges near you and check how busy they are in real-time',
}

export default async function HomePage() {
  const headersList = headers()
  const hostname = headersList.get('host') || ''
  const isAppSubdomain = hostname.includes('app.rangestatus.com')

  // If on app subdomain, check authentication and show appropriate dashboard
  if (isAppSubdomain) {
    const session = await getSession()

    if (!session) {
      redirect('/login')
    }

    if (session.role === 'ADMIN') {
      // Redirect admin to /admin
      redirect('/admin')
    } else if (session.role === 'RANGE') {
      // Show portal directly for range owners (they get the clean URL)
      if (!session.rangeId) {
        redirect('/login')
      }

      const range = await getRangeById(session.rangeId)

      if (!range || !range.isActive) {
        redirect('/login')
      }

      return <PortalClient range={range} />
    }
  }

  // Default public homepage for main domain
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-secondary/90 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Logo size="lg" className="mx-auto mb-8" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            See How Busy Driving Ranges Are Before You Go
          </h1>
          <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto">
            Find range crowd levels in real-time near you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-10">
        <Suspense fallback={<div className="text-center">Loading ranges...</div>}>
          <RangesClient />
        </Suspense>
      </div>
    </div>
  )
}