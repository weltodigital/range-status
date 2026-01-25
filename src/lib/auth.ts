import { cookies } from 'next/headers'
import * as bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AuthUser {
  id: string
  email: string
  role: 'ADMIN' | 'RANGE'
  rangeId?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(user: AuthUser): Promise<void> {
  const session = {
    userId: user.id,
    email: user.email,
    role: user.role,
    rangeId: user.rangeId,
    expires: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  }

  const cookieStore = await cookies()
  cookieStore.set('session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  })
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value)

    if (Date.now() > session.expires) {
      await clearSession()
      return null
    }

    return {
      id: session.userId,
      email: session.email,
      role: session.role,
      rangeId: session.rangeId,
    }
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { range: true },
    })

    if (!user) {
      return null
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'RANGE',
      rangeId: user.rangeId || undefined,
    }
  } catch {
    return null
  }
}