export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'expired' | 'trial'
export type SubscriptionType = 'trial' | 'monthly' | 'yearly'

export interface SubscriptionInfo {
  isActive: boolean
  isPaid: boolean
  isExpired: boolean
  isCanceled: boolean
  isPastDue: boolean
  isTrial: boolean
  daysRemaining: number | null
  daysPastDue: number | null
  daysSinceLastPayment: number | null
  daysSinceCanceled: number | null
  statusText: string
  statusColor: string
  canAccessFullFeatures: boolean
}

// Minimal interface for subscription calculations - only requires subscription fields
export interface SubscriptionRange {
  subscriptionType?: 'trial' | 'monthly' | 'yearly'
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'expired'
  subscriptionExpiry?: Date | null
  lastPaymentDate?: Date | null
  canceledAt?: Date | null
}

export function getSubscriptionInfo(range: SubscriptionRange): SubscriptionInfo {
  const now = new Date()
  const subscriptionType = range.subscriptionType || 'trial'
  const subscriptionStatus = range.subscriptionStatus || 'active'
  const subscriptionExpiry = range.subscriptionExpiry ? new Date(range.subscriptionExpiry) : null
  const lastPaymentDate = range.lastPaymentDate ? new Date(range.lastPaymentDate) : null
  const canceledAt = range.canceledAt ? new Date(range.canceledAt) : null

  // Calculate days
  const daysRemaining = subscriptionExpiry ? Math.ceil((subscriptionExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
  const daysPastDue = subscriptionExpiry && now > subscriptionExpiry ? Math.ceil((now.getTime() - subscriptionExpiry.getTime()) / (1000 * 60 * 60 * 24)) : null
  const daysSinceLastPayment = lastPaymentDate ? Math.ceil((now.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24)) : null
  const daysSinceCanceled = canceledAt ? Math.ceil((now.getTime() - canceledAt.getTime()) / (1000 * 60 * 60 * 24)) : null

  // Determine status flags
  const isTrial = subscriptionType === 'trial'
  const isExpired = subscriptionExpiry ? now > subscriptionExpiry : false
  const isCanceled = subscriptionStatus === 'canceled'
  const isPastDue = subscriptionStatus === 'past_due'
  const isActive = subscriptionStatus === 'active' && !isExpired
  const isPaid = !isTrial && isActive

  // Determine access level
  const canAccessFullFeatures = isActive && !isExpired

  // Generate status text and color
  let statusText: string
  let statusColor: string

  if (isCanceled) {
    statusText = `Canceled ${daysSinceCanceled ? `${daysSinceCanceled} days ago` : ''}`
    statusColor = 'red'
  } else if (isPastDue && daysPastDue) {
    statusText = `Past Due (${daysPastDue} days overdue)`
    statusColor = 'orange'
  } else if (isExpired && daysRemaining !== null && daysRemaining < 0) {
    statusText = `Expired (${Math.abs(daysRemaining)} days ago)`
    statusColor = 'red'
  } else if (isTrial && daysRemaining !== null) {
    if (daysRemaining > 0) {
      statusText = `Trial (${daysRemaining} days remaining)`
      statusColor = 'blue'
    } else {
      statusText = 'Trial Expired'
      statusColor = 'red'
    }
  } else if (isPaid) {
    const typeText = subscriptionType === 'monthly' ? 'Monthly' : 'Yearly'
    if (daysSinceLastPayment !== null && daysSinceLastPayment <= 31) {
      statusText = `${typeText} (paid ${daysSinceLastPayment} days ago)`
    } else {
      statusText = `${typeText} Subscription`
    }
    statusColor = 'green'
  } else {
    statusText = 'Unknown Status'
    statusColor = 'gray'
  }

  return {
    isActive,
    isPaid,
    isExpired,
    isCanceled,
    isPastDue,
    isTrial,
    daysRemaining,
    daysPastDue,
    daysSinceLastPayment,
    daysSinceCanceled,
    statusText,
    statusColor,
    canAccessFullFeatures
  }
}

export function getSubscriptionStatusBadge(info: SubscriptionInfo): string {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'

  switch (info.statusColor) {
    case 'green':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'blue':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'orange':
      return `${baseClasses} bg-orange-100 text-orange-800`
    case 'red':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

export function shouldShowStatusUpdate(info: SubscriptionInfo): boolean {
  return info.canAccessFullFeatures
}

export function getUpgradeMessage(info: SubscriptionInfo): string {
  if (info.isTrial && info.isExpired) {
    return 'Your trial has expired. Subscribe now to continue updating your range status.'
  }
  if (info.isPastDue) {
    return 'Your subscription is past due. Please update your payment to continue service.'
  }
  if (info.isCanceled) {
    return 'Your subscription has been canceled. Reactivate to continue updating your status.'
  }
  if (info.isExpired) {
    return 'Your subscription has expired. Renew now to continue using all features.'
  }
  return 'Subscribe to access all features including status updates.'
}