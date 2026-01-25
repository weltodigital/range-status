import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Get admin credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rangestatus.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Created admin user: ${admin.email}`)

  // Create sample range
  const sampleRange = await prisma.range.upsert({
    where: { slug: 'test-range' },
    update: {},
    create: {
      name: 'Test Golf Range',
      slug: 'test-range',
      area: 'Hampshire',
      town: 'Winchester',
      status: 'QUIET',
      note: 'Welcome to our test range!',
      lastUpdatedAt: new Date(),
      openingHours: {
        monday: { closed: false, open: '08:00', close: '21:00' },
        tuesday: { closed: false, open: '08:00', close: '21:00' },
        wednesday: { closed: false, open: '08:00', close: '21:00' },
        thursday: { closed: false, open: '08:00', close: '21:00' },
        friday: { closed: false, open: '08:00', close: '22:00' },
        saturday: { closed: false, open: '07:00', close: '22:00' },
        sunday: { closed: false, open: '07:00', close: '20:00' },
      },
      isActive: true,
    },
  })

  console.log(`✅ Created sample range: ${sampleRange.name}`)

  // Create range portal user
  const rangePasswordHash = await bcrypt.hash('range123', 12)

  const rangeUser = await prisma.user.upsert({
    where: { email: 'testrange@example.com' },
    update: {},
    create: {
      email: 'testrange@example.com',
      passwordHash: rangePasswordHash,
      role: 'RANGE',
      rangeId: sampleRange.id,
    },
  })

  console.log(`✅ Created range user: ${rangeUser.email}`)

  // Create some sample status events
  const now = new Date()
  const events = [
    { status: 'QUIET', createdAt: new Date(now.getTime() - 3600000) }, // 1 hour ago
    { status: 'MODERATE', createdAt: new Date(now.getTime() - 7200000) }, // 2 hours ago
    { status: 'BUSY', createdAt: new Date(now.getTime() - 10800000) }, // 3 hours ago
  ]

  for (const event of events) {
    await prisma.statusEvent.create({
      data: {
        rangeId: sampleRange.id,
        status: event.status,
        createdAt: event.createdAt,
      },
    })
  }

  console.log('✅ Created sample status events')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log(`Admin: ${adminEmail} / ${adminPassword}`)
  console.log(`Range Portal: testrange@example.com / range123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })