import { getSession } from '@/lib/auth'
import { getRangeById } from '@/lib/supabase-db'
import { redirect } from 'next/navigation'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const session = await getSession()

  if (!session || session.role !== 'RANGE' || !session.rangeId) {
    redirect('/login')
  }

  const range = await getRangeById(session.rangeId)

  if (!range || !range.isActive) {
    redirect('/login')
  }

  return <BillingClient range={range} />
}