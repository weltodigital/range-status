import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const ranges = await prisma.range.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        lastUpdatedAt: 'desc',
      },
    })

    // Get unique areas
    const areas = [...new Set(ranges.map(range => range.area))].sort()

    return NextResponse.json({
      ranges,
      areas,
    })
  } catch (error) {
    console.error('Error fetching ranges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ranges' },
      { status: 500 }
    )
  }
}