import { NextResponse } from 'next/server'

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL || 'Not set'

  // Mask the password for security
  const maskedUrl = databaseUrl.includes('@')
    ? databaseUrl.replace(/:([^:@]+)@/, ':***@')
    : databaseUrl

  return NextResponse.json({
    databaseUrl: maskedUrl,
    hasPooler: databaseUrl.includes('pooler.supabase.com'),
    hasPort6543: databaseUrl.includes(':6543'),
    hasPgBouncer: databaseUrl.includes('pgbouncer=true')
  })
}