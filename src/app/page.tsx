import { Suspense } from 'react'
import RangesClient from '@/components/RangesClient'
import Logo from '@/components/Logo'

export const metadata = {
  title: 'Golf Driving Ranges - Range Status',
  description: 'Find golf driving ranges near you and check how busy they are in real-time',
}

export default function HomePage() {
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