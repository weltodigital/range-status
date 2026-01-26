import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllRanges } from '@/lib/supabase-db'
import AdminRangesClient from './ranges/AdminRangesClient'

export const metadata = {
  title: 'Admin Dashboard - Range Status',
  description: 'Admin panel for managing golf driving ranges',
}

export default async function AdminPage() {
  const session = await getSession()

  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const ranges = await getAllRanges()

  return <AdminRangesClient ranges={ranges} />
}