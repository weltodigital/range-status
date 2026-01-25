export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else {
    const days = Math.floor(diffInMinutes / (24 * 60))
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
}

export function isStale(date: Date): boolean {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  return diffInMinutes > 90
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'QUIET':
      return 'bg-quiet text-white'
    case 'MODERATE':
      return 'bg-moderate text-white'
    case 'BUSY':
      return 'bg-busy text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function getStatusColorLight(status: string): string {
  switch (status) {
    case 'QUIET':
      return 'bg-green-100 text-green-800'
    case 'MODERATE':
      return 'bg-amber-100 text-amber-800'
    case 'BUSY':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}