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
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'expired'
  subscriptionExpiry?: Date | null
  lastPaymentDate?: Date | null
  nextPaymentDate?: Date | null
  canceledAt?: Date | null
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
  email?: string
  password?: string
}

export interface CreateRangeResult {
  range: Range
  user?: {
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

    // Create range without subscription (inactive by default)
    // Ranges need to contact us and then pay for subscription to get full access

    // Prepare range data, excluding fields that might not exist in DB yet
    const rangeData: any = {
      id: rangeId,
      name: data.name,
      slug: data.slug,
      area: data.area,
      town: data.town || null,
      status: 'QUIET',
      isActive: true,
    }

    // Try to add subscription fields - new ranges have no subscription by default
    try {
      rangeData.subscriptionType = null // No subscription type initially
      rangeData.subscriptionStatus = 'expired' // Expired means they need to contact us
      rangeData.subscriptionExpiry = null // No expiry date
    } catch (e) {
      console.log('Subscription fields not available in database yet')
    }

    // Try to add address fields if they exist
    try {
      if (data.address !== undefined) rangeData.address = data.address || null
      if (data.postcode !== undefined) rangeData.postcode = data.postcode || null
      if (data.latitude !== undefined) rangeData.latitude = data.latitude || null
      if (data.longitude !== undefined) rangeData.longitude = data.longitude || null
    } catch (e) {
      console.log('Address fields not available in database yet, creating range without them')
    }

    const { data: range, error: rangeError } = await supabase
      .from('ranges')
      .insert(rangeData)
      .select()
      .single()

    if (rangeError) {
      console.error('Error creating range:', rangeError)
      console.error('Range data being inserted:', JSON.stringify(rangeData, null, 2))
      return null
    }

    // Create user only if email and password are provided
    let user = null
    if (data.email && data.password) {
      // Hash password and create user
      const passwordHash = await bcrypt.hash(data.password, 12)
      const { data: userUuidResult } = await supabase.rpc('gen_random_uuid')
      const userId = userUuidResult || crypto.randomUUID()

      const { data: userData, error: userError } = await supabase
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
        console.error('User data being inserted:', {
          id: userId,
          email: data.email,
          role: 'RANGE',
          rangeId: range.id,
        })
        // Clean up range if user creation failed
        await supabase
          .from('ranges')
          .delete()
          .eq('id', range.id)
        return null
      }

      user = userData
    }

    return {
      range: {
        ...range,
        lastUpdatedAt: range.lastUpdatedAt ? new Date(range.lastUpdatedAt) : null,
        createdAt: new Date(range.createdAt),
        users: user ? [user] : []
      },
      user: user || undefined
    }
  } catch (error) {
    console.error('Database query error in createRangeWithUser:', error)

    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.slice(0, 500)
      })
    }

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
    // Prepare update data, excluding address fields if they don't exist in DB yet
    const updateData: any = {
      name: data.name,
      slug: data.slug,
      area: data.area,
      town: data.town || null,
    }

    // Try to add address fields if they exist
    try {
      if (data.address !== undefined) updateData.address = data.address || null
      if (data.postcode !== undefined) updateData.postcode = data.postcode || null
      if (data.latitude !== undefined) updateData.latitude = data.latitude || null
      if (data.longitude !== undefined) updateData.longitude = data.longitude || null
    } catch (e) {
      console.log('Address fields not available in database yet, updating range without them')
    }

    // Update the range
    const { data: updatedRange, error: rangeError } = await supabase
      .from('ranges')
      .update(updateData)
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
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'expired'
  subscriptionExpiry?: Date | null
  lastPaymentDate?: Date | null
  nextPaymentDate?: Date | null
  canceledAt?: Date | null
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

// Contact submission types
export interface ContactSubmission {
  id: string
  rangeId: string
  contactName: string
  email: string
  phone: string
  status: 'pending' | 'contacted' | 'converted' | 'declined'
  notes?: string | null
  submittedAt: Date
  contactedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

// Create a new contact submission
export async function createContactSubmission(submission: {
  rangeId: string
  contactName: string
  email: string
  phone: string
}): Promise<ContactSubmission | null> {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        range_id: submission.rangeId,
        contact_name: submission.contactName,
        email: submission.email,
        phone: submission.phone,
        status: 'pending'
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating contact submission:', error)
      return null
    }

    return {
      id: data.id,
      rangeId: data.range_id,
      contactName: data.contact_name,
      email: data.email,
      phone: data.phone,
      status: data.status,
      notes: data.notes,
      submittedAt: new Date(data.submitted_at),
      contactedAt: data.contacted_at ? new Date(data.contacted_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  } catch (error) {
    console.error('Database error creating contact submission:', error)
    return null
  }
}

// Get all contact submissions for admin
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select(`
        *,
        ranges (
          name,
          slug
        )
      `)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching contact submissions:', error)
      return []
    }

    return data.map(submission => ({
      id: submission.id,
      rangeId: submission.range_id,
      contactName: submission.contact_name,
      email: submission.email,
      phone: submission.phone,
      status: submission.status,
      notes: submission.notes,
      submittedAt: new Date(submission.submitted_at),
      contactedAt: submission.contacted_at ? new Date(submission.contacted_at) : null,
      createdAt: new Date(submission.created_at),
      updatedAt: new Date(submission.updated_at),
      // Add range info for admin display
      range: submission.ranges
    }))
  } catch (error) {
    console.error('Database error fetching contact submissions:', error)
    return []
  }
}

// Update contact submission status
export async function updateContactSubmissionStatus(
  id: string,
  status: 'pending' | 'contacted' | 'converted' | 'declined',
  notes?: string
): Promise<boolean> {
  try {
    const updateData: any = { status }

    if (status === 'contacted' || status === 'converted') {
      updateData.contacted_at = new Date().toISOString()
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const { error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating contact submission:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Database error updating contact submission:', error)
    return false
  }
}

// Range activation interfaces and functions
export interface ActivateRangeData {
  rangeId: string
  email: string
  password: string
}

export async function activateRangeWithUser(data: ActivateRangeData): Promise<{ success: boolean; user?: { id: string; email: string } } | null> {
  try {
    // First check if range exists
    const { data: range, error: rangeError } = await supabase
      .from('ranges')
      .select('id, name')
      .eq('id', data.rangeId)
      .single()

    if (rangeError) {
      console.error('Range not found:', rangeError)
      return null
    }

    // Check if range already has a user
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('rangeId', data.rangeId)
      .eq('role', 'RANGE')
      .limit(1)

    if (userCheckError) {
      console.error('Error checking existing user:', userCheckError)
      return null
    }

    if (existingUser && existingUser.length > 0) {
      console.error('Range already has a user account')
      return null
    }

    // Check if email is already in use
    const emailExists = await checkEmailExists(data.email)
    if (emailExists) {
      console.error('Email already exists')
      return null
    }

    // Create user for the range
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
        rangeId: data.rangeId,
      })
      .select('id, email')
      .single()

    if (userError) {
      console.error('Error creating user for range activation:', userError)
      return null
    }

    console.log(`Range "${range.name}" activated with user "${data.email}"`)

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    }
  } catch (error) {
    console.error('Error activating range:', error)
    return null
  }
}

export async function updateUserEmail(rangeId: string, newEmail: string): Promise<boolean> {
  try {
    // Check if the new email already exists
    const emailExists = await checkEmailExists(newEmail)
    if (emailExists) {
      console.error('Email already exists')
      return false
    }

    // Update the user's email for the given range
    const { error } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('rangeId', rangeId)
      .eq('role', 'RANGE')

    if (error) {
      console.error('Error updating user email:', error)
      return false
    }

    console.log(`Email updated for range ${rangeId} to ${newEmail}`)
    return true
  } catch (error) {
    console.error('Error in updateUserEmail:', error)
    return false
  }
}

export async function adminResetUserPassword(rangeId: string, newPassword: string): Promise<boolean> {
  try {
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update the user's password for the given range
    const { error } = await supabase
      .from('users')
      .update({ passwordHash })
      .eq('rangeId', rangeId)
      .eq('role', 'RANGE')

    if (error) {
      console.error('Error updating user password:', error)
      return false
    }

    console.log(`Password updated for range ${rangeId}`)
    return true
  } catch (error) {
    console.error('Error in adminResetUserPassword:', error)
    return false
  }
}