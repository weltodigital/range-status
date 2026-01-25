import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing database connection...')

    // Test basic connection
    await prisma.$connect()
    console.log('Database connected successfully')

    // Test querying users
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)

    // Test finding specific user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@rangestatus.com' }
    })
    console.log('Admin user found:', adminUser ? 'Yes' : 'No')
    console.log('Admin user details:', adminUser ? { id: adminUser.id, email: adminUser.email, role: adminUser.role } : 'Not found')

    return NextResponse.json({
      success: true,
      userCount,
      adminUser: adminUser ? { id: adminUser.id, email: adminUser.email, role: adminUser.role } : null,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    }, { status: 500 })
  }
}