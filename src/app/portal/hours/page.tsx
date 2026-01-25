import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import HoursClient from './HoursClient'

export default async function HoursPage() {
  const session = await getSession()

  if (!session || session.role !== 'RANGE' || !session.rangeId) {
    redirect('/login')
  }

  const range = await prisma.range.findUnique({
    where: { id: session.rangeId },
  })

  if (!range || !range.isActive) {
    redirect('/login')
  }

  return <HoursClient range={range} />
}