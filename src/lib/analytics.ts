import { getStatusEvents } from '@/lib/supabase-db'

export interface BusyTimeData {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  hour: number // 0-23
  averageScore: number // 1 = QUIET, 2 = MODERATE, 3 = BUSY
}

export interface TopBusyWindow {
  day: string
  timeRange: string
  averageScore: number
}

export async function calculateTypicalBusyTimes(rangeId: string): Promise<{
  hasEnoughData: boolean
  busyTimeData: BusyTimeData[]
  topBusyWindows: TopBusyWindow[]
}> {
  // Check if we have at least 30 days of data
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const statusEvents = await getStatusEvents(rangeId, thirtyDaysAgo)

  if (statusEvents.length < 30) {
    return {
      hasEnoughData: false,
      busyTimeData: [],
      topBusyWindows: [],
    }
  }

  // Map status to score
  const statusToScore: Record<string, number> = {
    QUIET: 1,
    MODERATE: 2,
    BUSY: 3,
  }

  // Group events by day of week and hour
  const hourlyData: { [key: string]: number[] } = {}

  statusEvents.forEach(event => {
    const date = new Date(event.createdAt)
    const dayOfWeek = date.getDay()
    const hour = date.getHours()
    const score = statusToScore[event.status] ?? 1

    const key = `${dayOfWeek}-${hour}`
    if (!hourlyData[key]) {
      hourlyData[key] = []
    }
    hourlyData[key].push(score)
  })

  // Calculate averages
  const busyTimeData: BusyTimeData[] = []
  Object.entries(hourlyData).forEach(([key, scores]) => {
    const [dayOfWeek, hour] = key.split('-').map(Number)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

    busyTimeData.push({
      dayOfWeek,
      hour,
      averageScore,
    })
  })

  // Find top 3 busiest windows (2-hour periods)
  const windowScores: Array<{
    dayOfWeek: number
    startHour: number
    averageScore: number
  }> = []

  for (let day = 0; day < 7; day++) {
    for (let hour = 6; hour <= 20; hour++) { // 6 AM to 8 PM windows
      const scores = []
      for (let h = hour; h < hour + 2 && h <= 22; h++) {
        const dayHourData = busyTimeData.find(d => d.dayOfWeek === day && d.hour === h)
        if (dayHourData) {
          scores.push(dayHourData.averageScore)
        }
      }

      if (scores.length > 0) {
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
        windowScores.push({
          dayOfWeek: day,
          startHour: hour,
          averageScore,
        })
      }
    }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const topBusyWindows = windowScores
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3)
    .map(window => ({
      day: dayNames[window.dayOfWeek],
      timeRange: `${String(window.startHour).padStart(2, '0')}:00–${String(window.startHour + 2).padStart(2, '0')}:00`,
      averageScore: window.averageScore,
    }))

  return {
    hasEnoughData: true,
    busyTimeData,
    topBusyWindows,
  }
}