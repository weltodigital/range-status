import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createContactSubmission } from '@/lib/supabase-db'

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

    // Save contact submission to database
    const submission = await createContactSubmission({
      rangeId: validatedData.rangeId,
      contactName: validatedData.contactName,
      email: validatedData.email,
      phone: validatedData.phone
    })

    if (!submission) {
      console.error('Failed to save contact submission to database')
      return NextResponse.json(
        { error: 'Failed to save contact request' },
        { status: 500 }
      )
    }

    // Log the successful submission
    console.log('Range Owner Contact Request Saved:', {
      submissionId: submission.id,
      timestamp: submission.submittedAt.toISOString(),
      rangeId: validatedData.rangeId,
      rangeName: validatedData.rangeName,
      contactName: validatedData.contactName,
      email: validatedData.email,
      phone: validatedData.phone
    })

    // TODO: Optional future enhancements
    // - Send admin notification email
    // - Send confirmation email to range owner

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