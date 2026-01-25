import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import PortalClient from './PortalClient'

export default async function PortalPage() {
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

  return <PortalClient range={range} />
}