import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import AdminRangesClient from './AdminRangesClient'

export const metadata = {
  title: 'Manage Ranges - Admin | Range Status',
  description: 'Admin panel for managing golf driving ranges',
}

export default async function AdminRangesPage() {
  const session = await getSession()

  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const ranges = await prisma.range.findMany({
    include: {
      users: {
        where: { role: 'RANGE' },
        select: { id: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <AdminRangesClient ranges={ranges} />
}