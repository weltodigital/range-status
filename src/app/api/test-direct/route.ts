import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  // Try direct connection URL
  const directUrl = 'postgresql://postgres:krUqyWmqEn3T674Q@db.iwerrqqvcwfphmktewwb.supabase.co:5432/postgres?sslmode=require'

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: directUrl,
      },
    },
  })

  try {
    console.log('Testing direct database connection...')

    // Test basic connection
    await prisma.$connect()
    console.log('Direct connection successful')

    // Test query
    const userCount = await prisma.user.count()
    console.log('User count via direct connection:', userCount)

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      userCount,
      connectionType: 'direct'
    })
  } catch (error) {
    console.error('Direct connection error:', error)

    await prisma.$disconnect()

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      connectionType: 'direct'
    }, { status: 500 })
  }
}