import { getSession } from '@/lib/auth'
import { getAllRanges } from '@/lib/supabase-db'
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

  const ranges = await getAllRanges()

  return <AdminRangesClient ranges={ranges} />
}