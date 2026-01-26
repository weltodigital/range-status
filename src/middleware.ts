import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Check if we're on the main domain or app subdomain
  const isMainDomain = hostname.includes('www.rangestatus.com') || hostname === 'rangestatus.com'
  const isAppSubdomain = hostname.includes('app.rangestatus.com')

  // Redirect admin routes from main domain to app subdomain
  if (isMainDomain && (pathname.startsWith('/admin') || pathname.startsWith('/portal') || pathname === '/login')) {
    const appUrl = `https://app.rangestatus.com${pathname}${request.nextUrl.search}`
    return NextResponse.redirect(appUrl)
  }

  // Only process auth logic on app subdomain
  if (isAppSubdomain) {
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

    // Keep admin and portal routes protected for direct access
    if (pathname.startsWith('/admin')) {
      if (!session || session.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    if (pathname.startsWith('/portal')) {
      if (!session || session.role !== 'RANGE') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Redirect to dashboard if already logged in and visiting login
    if (pathname === '/login' && session) {
      if (session.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Redirect root app subdomain to login if not authenticated
    if (pathname === '/' && !session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}