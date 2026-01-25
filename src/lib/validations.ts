import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const statusUpdateSchema = z.object({
  status: z.enum(['QUIET', 'MODERATE', 'BUSY']),
  note: z.string().max(60, 'Note must be 60 characters or less').optional(),
})

export const timeSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format')

export const daySchema = z.object({
  closed: z.boolean(),
  open: timeSchema.optional(),
  close: timeSchema.optional(),
}).refine((data) => {
  if (!data.closed && (!data.open || !data.close)) {
    return false
  }
  if (!data.closed && data.open && data.close) {
    const [openHour, openMin] = data.open.split(':').map(Number)
    const [closeHour, closeMin] = data.close.split(':').map(Number)
    const openTime = openHour * 60 + openMin
    const closeTime = closeHour * 60 + closeMin
    return openTime < closeTime
  }
  return true
}, {
  message: 'Open time must be before close time'
})

export const openingHoursSchema = z.object({
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
  saturday: daySchema,
  sunday: daySchema,
})

export const rangeSchema = z.object({
  name: z.string().min(1, 'Range name is required'),
  area: z.string().min(1, 'Area is required'),
  town: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
})

export const createRangeUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})