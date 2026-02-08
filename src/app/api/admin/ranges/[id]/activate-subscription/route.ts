import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updateRangeSubscription, getRangeById } from '@/lib/supabase-db'
import { hasUsedFreeTrial } from '@/lib/subscription-utils'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get current range data to check trial history
    const range = await getRangeById(id)
    if (!range) {
      return NextResponse.json(
        { error: 'Range not found' },
        { status: 404 }
      )
    }

    // Check if the range has had a trial before
    if (hasUsedFreeTrial(range)) {
      return NextResponse.json({
        success: false,
        message: 'This range has already used their free trial. A paid subscription is required.',
        requiresPayment: true
      }, { status: 400 })
    }

    // Activate subscription access - give them a trial to start with
    const trialExpiry = new Date()
    trialExpiry.setDate(trialExpiry.getDate() + 7) // 7-day trial

    await updateRangeSubscription(id, {
      subscriptionType: 'trial' as 'trial',
      subscriptionStatus: 'active' as 'active',
      subscriptionExpiry: trialExpiry,
      lastPaymentDate: null,
      nextPaymentDate: null,
      canceledAt: null
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription access activated with 7-day trial'
    })

  } catch (error) {
    console.error('Subscription activation error:', error)

    return NextResponse.json(
      { error: 'Failed to activate subscription' },
      { status: 500 }
    )
  }
}