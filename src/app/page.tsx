import { Suspense } from 'react'
import { headers } from 'next/headers'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import RangesClient from '@/components/RangesClient'
import AdminRangesClient from '@/app/admin/ranges/AdminRangesClient'
import Logo from '@/components/Logo'
import { getAllRanges } from '@/lib/supabase-db'

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
      // Show admin dashboard
      const ranges = await getAllRanges()
      return <AdminRangesClient ranges={ranges} />
    } else if (session.role === 'RANGE') {
      // Redirect to portal dashboard
      redirect('/portal')
    }
  }

  // Default public homepage for main domain
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-secondary to-secondary/90 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">
            Golf Driving Ranges
          </h1>
          <p className="text-white-90 text-xl">
            Check how busy ranges are before you go
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6 relative z-10">
        <Suspense fallback={<div className="text-center">Loading ranges...</div>}>
          <RangesClient />
        </Suspense>
      </div>
    </div>
  )
}