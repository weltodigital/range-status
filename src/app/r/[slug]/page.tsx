import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatTimeAgo, isStale, getStatusColor } from '@/lib/utils'
import { WeeklyHours } from '@/lib/hours'
import { calculateTypicalBusyTimes } from '@/lib/analytics'
import OpeningHours from '@/components/OpeningHours'
import TypicalBusyTimes from '@/components/TypicalBusyTimes'
import Logo from '@/components/Logo'
import Link from 'next/link'

interface RangePageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: RangePageProps) {
  const { slug } = await params

  const range = await prisma.range.findUnique({
    where: { slug, isActive: true },
  })

  if (!range) {
    return {
      title: 'Range Not Found - Range Status',
    }
  }

  return {
    title: `${range.name} - Live Status | Range Status`,
    description: `Check how busy ${range.name} is right now. Live golf driving range traffic status.`,
  }
}

export default async function RangePage({ params }: RangePageProps) {
  const { slug } = await params

  const range = await prisma.range.findUnique({
    where: { slug, isActive: true },
  })

  if (!range) {
    notFound()
  }

  const lastUpdated = range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null
  const isDataStale = lastUpdated ? isStale(lastUpdated) : true
  const openingHours = range.openingHours
    ? range.openingHours as unknown as WeeklyHours
    : null

  // Calculate typical busy times
  const busyTimesData = await calculateTypicalBusyTimes(range.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary to-secondary/90 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Logo size="md" />
          </div>
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {range.name}
            </h1>
            <p className="text-xl text-white-90">
              {range.area}{range.town && `, ${range.town}`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 -mt-4 relative z-10">

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="mb-6">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold ${getStatusColor(range.status)}`}>
              {range.status}
            </div>
          </div>

          {range.note && (
            <p className="text-lg text-gray-700 mb-4 italic">
              "{range.note}"
            </p>
          )}

          <div className="text-sm text-gray-600">
            {lastUpdated ? (
              <>
                Last updated {formatTimeAgo(lastUpdated)}
                {isDataStale && (
                  <div className="text-amber-600 font-medium mt-2">
                    ⚠️ May be out of date
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-400">No recent updates</span>
            )}
          </div>
        </div>

        {/* Opening Hours */}
        <div className="mb-6">
          <OpeningHours hours={openingHours} />
        </div>

        {/* Typical Busy Times */}
        <div className="mb-6">
          <TypicalBusyTimes
            hasEnoughData={busyTimesData.hasEnoughData}
            busyTimeData={busyTimesData.busyTimeData}
            topBusyWindows={busyTimesData.topBusyWindows}
          />
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link
            href="/ranges"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ← View all ranges
          </Link>
        </div>
      </div>
    </div>
  )
}