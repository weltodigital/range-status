import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewRangeClient from './NewRangeClient'

export const metadata = {
  title: 'Add New Range - Admin | Range Status',
  description: 'Add a new golf driving range',
}

export default async function NewRangePage() {
  const session = await getSession()

  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  return <NewRangeClient />
}