export interface DayHours {
  closed: boolean
  open?: string
  close?: string
}

export interface WeeklyHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export const DEFAULT_HOURS: WeeklyHours = {
  monday: { closed: false, open: '08:00', close: '21:00' },
  tuesday: { closed: false, open: '08:00', close: '21:00' },
  wednesday: { closed: false, open: '08:00', close: '21:00' },
  thursday: { closed: false, open: '08:00', close: '21:00' },
  friday: { closed: false, open: '08:00', close: '21:00' },
  saturday: { closed: false, open: '08:00', close: '21:00' },
  sunday: { closed: false, open: '08:00', close: '21:00' },
}

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function getCurrentDayInfo(hours: WeeklyHours): { dayName: string; hours: DayHours; isOpen: boolean } {
  const today = new Date()
  const dayIndex = (today.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
  const dayName = DAY_NAMES[dayIndex]
  const dayHours = hours[DAYS[dayIndex]]

  let isOpen = false
  if (!dayHours.closed && dayHours.open && dayHours.close) {
    const now = today.getHours() * 60 + today.getMinutes()
    const [openHour, openMin] = dayHours.open.split(':').map(Number)
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number)
    const openTime = openHour * 60 + openMin
    const closeTime = closeHour * 60 + closeMin
    isOpen = now >= openTime && now < closeTime
  }

  return { dayName, hours: dayHours, isOpen }
}

export function formatDayHours(day: DayHours): string {
  if (day.closed) {
    return 'Closed'
  }
  return `${day.open}–${day.close}`
}