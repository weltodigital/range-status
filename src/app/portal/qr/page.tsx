import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import QRClient from './QRClient'

export default async function QRPage() {
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

  return <QRClient range={range} />
}