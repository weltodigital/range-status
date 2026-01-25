import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session from cookie
  const sessionCookie = request.cookies.get('session')
  let session = null

  if (sessionCookie) {
    try {
      session = JSON.parse(sessionCookie.value)
      // Check if session is expired
      if (Date.now() > session.expires) {
        session = null
      }
    } catch {
      session = null
    }
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protected portal routes
  if (pathname.startsWith('/portal')) {
    if (!session || session.role !== 'RANGE') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect to appropriate dashboard if already logged in and visiting login
  if (pathname === '/login' && session) {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/ranges', request.url))
    } else if (session.role === 'RANGE') {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/portal/:path*',
    '/login',
  ],
}