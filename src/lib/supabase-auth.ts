import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export interface AuthUser {
  id: string
  email: string
  role: 'ADMIN' | 'RANGE'
  rangeId?: string
}

export async function authenticateUserSupabase(email: string, password: string): Promise<AuthUser | null> {
  try {
    console.log('Attempting to authenticate user with Supabase:', email)

    // Find user by email
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error) {
      console.error('Supabase query error:', error)
      return null
    }

    const user = users?.[0]
    console.log('User found:', user ? 'Yes' : 'No')

    if (!user) {
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
    console.error('Supabase authentication error:', error)
    return null
  }
}