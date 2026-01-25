import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

interface AreaPageProps {
  params: { area: string }
}

export async function generateMetadata({ params }: AreaPageProps) {
  const { area } = await params
  const decodedArea = decodeURIComponent(area)

  return {
    title: `${decodedArea} Golf Driving Ranges - Range Status`,
    description: `Check how busy golf driving ranges are in ${decodedArea}`,
  }
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { area } = await params
  const decodedArea = decodeURIComponent(area)

  // Check if area exists
  const rangeExists = await prisma.range.findFirst({
    where: {
      area: decodedArea,
      isActive: true,
    },
  })

  if (!rangeExists) {
    notFound()
  }

  // Redirect to main ranges page with area filter
  redirect(`/ranges?area=${encodeURIComponent(decodedArea)}`)
}