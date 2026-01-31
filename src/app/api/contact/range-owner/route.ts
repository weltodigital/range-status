import { NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  rangeId: z.string().min(1, 'Range ID is required'),
  rangeName: z.string().min(1, 'Range name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required')
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = contactSchema.parse(body)

    // In a real implementation, you would:
    // 1. Save to database (contact requests table)
    // 2. Send notification email to admin
    // 3. Maybe send confirmation email to range owner

    // For now, we'll just log the request
    console.log('Range Owner Contact Request:', {
      timestamp: new Date().toISOString(),
      rangeId: validatedData.rangeId,
      rangeName: validatedData.rangeName,
      contactName: validatedData.contactName,
      email: validatedData.email,
      phone: validatedData.phone
    })

    // TODO: Implement email notifications
    // - Send admin notification email
    // - Send confirmation email to range owner
    // - Save to database for tracking

    return NextResponse.json({
      success: true,
      message: 'Contact request submitted successfully'
    })

  } catch (error) {
    console.error('Contact form submission error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit contact request' },
      { status: 500 }
    )
  }
}