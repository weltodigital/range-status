import { getSession } from '@/lib/auth'
import { getRangeById } from '@/lib/supabase-db'
import { redirect, notFound } from 'next/navigation'
import EditRangeClient from './EditRangeClient'

interface EditRangePageProps {
  params: { id: string }
}

export const metadata = {
  title: 'Edit Range - Admin | Range Status',
  description: 'Edit golf driving range details',
}

export default async function EditRangePage({ params }: EditRangePageProps) {
  const session = await getSession()

  if (!session || session.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params

  const range = await getRangeById(id)

  if (!range) {
    notFound()
  }

  return <EditRangeClient range={range} />
}