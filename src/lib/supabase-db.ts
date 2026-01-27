import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-admin'
    }
  }
})

// Range types
export interface Range {
  id: string
  name: string
  slug: string
  area: string
  town: string | null
  address?: string | null
  postcode?: string | null
  latitude?: number | null
  longitude?: number | null
  status: string
  note?: string | null
  lastUpdatedAt: Date | null
  openingHours?: any
  isActive: boolean
  createdAt: Date
  subscriptionType?: 'trial' | 'monthly' | 'yearly'
  subscriptionStatus?: 'active' | 'expired' | 'cancelled'
  subscriptionExpiry?: Date | null
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  users: RangeUser[]
}

export interface RangeUser {
  id: string
  email: string
}

export async function getAllRanges(): Promise<Range[]> {
  try {
    // First get all ranges
    const { data: ranges, error: rangesError } = await supabase
      .from('ranges')
      .select('*')
      .order('createdAt', { ascending: false })

    if (rangesError) {
      console.error('Error fetching ranges:', rangesError)
      return []
    }

    // Get range users for each range
    const rangesWithUsers = await Promise.all(
      (ranges || []).map(async (range) => {
        const { data: users } = await supabase
          .from('users')
          .select('id, email')
          .eq('rangeId', range.id)
          .eq('role', 'RANGE')

        return {
          ...range,
          lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
          createdAt: new Date(range.createdAt),
          users: users || []
        }
      })
    )

    return rangesWithUsers
  } catch (error) {
    console.error('Database query error:', error)
    return []
  }
}

export async function getRangeBySlug(slug: string): Promise<Range | null> {
  try {
    const { data: range, error } = await supabase
      .from('ranges')
      .select('*')
      .eq('slug', slug)
      .eq('isActive', true)
      .single()

    if (error) {
      console.error('Error fetching range:', error)
      return null
    }

    return {
      ...range,
      lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
      createdAt: new Date(range.createdAt),
      users: []
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export async function getActiveRanges(): Promise<Range[]> {
  try {
    const { data: ranges, error } = await supabase
      .from('ranges')
      .select('*')
      .eq('isActive', true)
      .order('lastUpdatedAt', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error fetching active ranges:', error)
      return []
    }

    return (ranges || []).map(range => ({
      ...range,
      lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
      createdAt: new Date(range.createdAt),
      users: []
    }))
  } catch (error) {
    console.error('Database query error:', error)
    return []
  }
}

export async function getRangeById(id: string): Promise<Range | null> {
  try {
    // Get the range by ID
    const { data: range, error: rangeError } = await supabase
      .from('ranges')
      .select('*')
      .eq('id', id)
      .single()

    if (rangeError) {
      console.error('Error fetching range:', rangeError)
      return null
    }

    if (!range) {
      return null
    }

    // Get range users
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .eq('rangeId', range.id)
      .eq('role', 'RANGE')

    return {
      ...range,
      lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
      createdAt: new Date(range.createdAt),
      users: users || []
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export interface CreateRangeData {
  name: string
  slug: string
  area: string
  town?: string | null
  address?: string | null
  postcode?: string | null
  latitude?: number | null
  longitude?: number | null
  email: string
  password: string
}

export interface CreateRangeResult {
  range: Range
  user: {
    id: string
    email: string
  }
}

export async function checkSlugExists(slug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ranges')
      .select('id')
      .eq('slug', slug)
      .limit(1)

    if (error) {
      console.error('Error checking slug:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Database query error:', error)
    return false
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (error) {
      console.error('Error checking email:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Database query error:', error)
    return false
  }
}

export async function createRangeWithUser(data: CreateRangeData): Promise<CreateRangeResult | null> {
  try {
    // Generate UUID for range
    const { data: uuidResult } = await supabase.rpc('gen_random_uuid')
    const rangeId = uuidResult || crypto.randomUUID()

    // Create range first with trial subscription
    const trialExpiry = new Date()
    trialExpiry.setDate(trialExpiry.getDate() + 7) // 7-day trial

    const { data: range, error: rangeError } = await supabase
      .from('ranges')
      .insert({
        id: rangeId,
        name: data.name,
        slug: data.slug,
        area: data.area,
        town: data.town || null,
        address: data.address || null,
        postcode: data.postcode || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        status: 'QUIET',
        isActive: true,
        subscriptionType: 'trial',
        subscriptionStatus: 'active',
        subscriptionExpiry: trialExpiry.toISOString(),
      })
      .select()
      .single()

    if (rangeError) {
      console.error('Error creating range:', rangeError)
      return null
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(data.password, 12)
    const { data: userUuidResult } = await supabase.rpc('gen_random_uuid')
    const userId = userUuidResult || crypto.randomUUID()

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: data.email,
        passwordHash,
        role: 'RANGE',
        rangeId: range.id,
      })
      .select('id, email')
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      // Clean up range if user creation failed
      await supabase
        .from('ranges')
        .delete()
        .eq('id', range.id)
      return null
    }

    return {
      range: {
        ...range,
        lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
        createdAt: new Date(range.createdAt),
        users: [user]
      },
      user
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export async function checkSlugExistsExcluding(slug: string, excludeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ranges')
      .select('id')
      .eq('slug', slug)
      .neq('id', excludeId)
      .limit(1)

    if (error) {
      console.error('Error checking slug:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Database query error:', error)
    return false
  }
}

export async function updateRangeStatus(rangeId: string, status: string, note?: string | null): Promise<Range | null> {
  try {
    const now = new Date().toISOString()

    // Update range status
    const { data: range, error: updateError } = await supabase
      .from('ranges')
      .update({
        status,
        note: note || null,
        lastUpdatedAt: now,
      })
      .eq('id', rangeId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating range status:', updateError)
      return null
    }

    // Create status event
    const { error: eventError } = await supabase
      .from('status_events')
      .insert({
        rangeId,
        status,
        createdAt: now,
      })

    if (eventError) {
      console.error('Error creating status event:', eventError)
    }

    return {
      ...range,
      lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
      createdAt: new Date(range.createdAt),
      users: []
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export async function updateRangeOpeningHours(rangeId: string, openingHours: any): Promise<Range | null> {
  try {
    const { data: range, error } = await supabase
      .from('ranges')
      .update({
        openingHours,
      })
      .eq('id', rangeId)
      .select()
      .single()

    if (error) {
      console.error('Error updating opening hours:', error)
      return null
    }

    return {
      ...range,
      lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
      createdAt: new Date(range.createdAt),
      users: []
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export interface PublicRangesResult {
  ranges: any[]
  areas: string[]
}

export async function getPublicRanges(): Promise<PublicRangesResult | null> {
  try {
    const { data: ranges, error } = await supabase
      .from('ranges')
      .select('*')
      .eq('isActive', true)
      .order('lastUpdatedAt', { ascending: false })

    if (error) {
      console.error('Error fetching public ranges:', error)
      return null
    }

    // Get unique areas
    const areaSet = new Set(ranges?.map(range => range.area) || [])
    const areas = Array.from(areaSet).sort()

    return {
      ranges: ranges || [],
      areas
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export interface AuthUser {
  id: string
  email: string
  role: 'ADMIN' | 'RANGE'
  rangeId?: string
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    console.log('Attempting to authenticate user:', email)

    // Get user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, passwordHash, role, rangeId')
      .eq('email', email)
      .single()

    console.log('User found:', user ? 'Yes' : 'No')
    if (error || !user) {
      console.error('Error finding user:', error)
      return null
    }

    console.log('Verifying password...')
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    console.log('Password valid:', isValidPassword)

    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'RANGE',
      rangeId: user.rangeId || undefined,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}


export async function getStatusEvents(rangeId: string, from?: Date): Promise<any[]> {
  try {
    let query = supabase
      .from('status_events')
      .select('*')
      .eq('rangeId', rangeId)
      .order('createdAt', { ascending: true })

    if (from) {
      query = query.gte('createdAt', from.toISOString())
    }

    const { data: statusEvents, error } = await query

    if (error) {
      console.error('Error fetching status events:', error)
      return []
    }

    return statusEvents || []
  } catch (error) {
    console.error('Database query error:', error)
    return []
  }
}

export interface UpdateRangeData {
  name: string
  slug: string
  area: string
  town?: string | null
  address?: string | null
  postcode?: string | null
  latitude?: number | null
  longitude?: number | null
}

export async function updateRange(id: string, data: UpdateRangeData): Promise<Range | null> {
  try {
    // Update the range
    const { data: updatedRange, error: rangeError } = await supabase
      .from('ranges')
      .update({
        name: data.name,
        slug: data.slug,
        area: data.area,
        town: data.town || null,
        address: data.address || null,
        postcode: data.postcode || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (rangeError) {
      console.error('Error updating range:', rangeError)
      return null
    }

    // Get range users
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .eq('rangeId', updatedRange.id)
      .eq('role', 'RANGE')

    return {
      ...updatedRange,
      lastUpdatedAt: updatedRange.lastUpdatedAt ? new Date(updatedRange.lastUpdatedAt) : null,
      createdAt: new Date(updatedRange.createdAt),
      users: users || []
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export async function resetRangeUserPassword(rangeId: string, password: string): Promise<boolean> {
  try {
    // Find the range's portal user
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('rangeId', rangeId)
      .eq('role', 'RANGE')
      .limit(1)

    if (findError || !users || users.length === 0) {
      console.error('Error finding range user:', findError)
      return false
    }

    const user = users[0]

    // Hash password and update user
    const passwordHash = await bcrypt.hash(password, 12)

    const { error: updateError } = await supabase
      .from('users')
      .update({ passwordHash })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Database query error:', error)
    return false
  }
}

export async function toggleRangeActiveStatus(id: string): Promise<Range | null> {
  try {
    // Get current range
    const { data: currentRange, error: getError } = await supabase
      .from('ranges')
      .select('isActive')
      .eq('id', id)
      .single()

    if (getError || !currentRange) {
      console.error('Error getting range:', getError)
      return null
    }

    // Toggle active status
    const { data: updatedRange, error: updateError } = await supabase
      .from('ranges')
      .update({ isActive: !currentRange.isActive })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating range:', updateError)
      return null
    }

    // Get range users
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .eq('rangeId', updatedRange.id)
      .eq('role', 'RANGE')

    return {
      ...updatedRange,
      lastUpdatedAt: updatedRange.lastUpdatedAt ? new Date(updatedRange.lastUpdatedAt) : null,
      createdAt: new Date(updatedRange.createdAt),
      users: users || []
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    // Get user by ID
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('id, passwordHash')
      .eq('id', userId)
      .single()

    if (getUserError || !user) {
      console.error('Error finding user:', getUserError)
      return false
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      console.error('Current password is incorrect')
      return false
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ passwordHash: newPasswordHash })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Database query error:', error)
    return false
  }
}

export async function updateRangeSubscription(rangeId: string, subscriptionData: {
  subscriptionType?: 'trial' | 'monthly' | 'yearly'
  subscriptionStatus?: 'active' | 'expired' | 'cancelled'
  subscriptionExpiry?: Date | null
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
}): Promise<Range | null> {
  try {
    // Build update object with only provided fields
    const updateData: any = {}

    if (subscriptionData.subscriptionType !== undefined) {
      updateData.subscriptionType = subscriptionData.subscriptionType
    }
    if (subscriptionData.subscriptionStatus !== undefined) {
      updateData.subscriptionStatus = subscriptionData.subscriptionStatus
    }
    if (subscriptionData.subscriptionExpiry !== undefined) {
      updateData.subscriptionExpiry = subscriptionData.subscriptionExpiry?.toISOString() || null
    }
    if (subscriptionData.stripeCustomerId !== undefined) {
      updateData.stripeCustomerId = subscriptionData.stripeCustomerId
    }
    if (subscriptionData.stripeSubscriptionId !== undefined) {
      updateData.stripeSubscriptionId = subscriptionData.stripeSubscriptionId
    }

    const { data: range, error } = await supabase
      .from('ranges')
      .update(updateData)
      .eq('id', rangeId)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return null
    }

    return {
      ...range,
      lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
      createdAt: new Date(range.createdAt),
      subscriptionExpiry: range.subscriptionExpiry ? new Date(range.subscriptionExpiry) : null,
      users: []
    }
  } catch (error) {
    console.error('Database query error:', error)
    return null
  }
}