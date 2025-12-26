// Inquiry API Route

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { inquirySchema } from '@/lib/validations'
import { sendInquiryAlertEmail, sendInquiryConfirmationEmail } from '@/lib/email'
import { verifyRecaptcha } from '@/lib/recaptcha'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify reCAPTCHA if token is provided
    if (body.recaptchaToken) {
      const recaptchaResult = await verifyRecaptcha(body.recaptchaToken, 'inquiry', 0.5)
      if (!recaptchaResult.valid) {
        console.warn('reCAPTCHA failed:', recaptchaResult.error, 'Score:', recaptchaResult.score)
        return NextResponse.json(
          { success: false, message: 'Security verification failed. Please try again.' },
          { status: 403 }
        )
      }
    }

    // Honeypot check - if hidden field is filled, it's a bot
    if (body.website || body._honeypot) {
      console.warn('Honeypot triggered in inquiry form')
      // Return success to not tip off bots, but don't process
      return NextResponse.json(
        { success: true, message: 'Inquiry submitted successfully' },
        { status: 201 }
      )
    }

    // Validate input
    const validatedData = inquirySchema.parse(body)

    // Get additional tracking info - use middleware-provided IP
    const userAgent = request.headers.get('user-agent') || undefined
    const clientIP = request.headers.get('x-client-ip')
    const ipAddress = clientIP || request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0] || undefined
    const referrer = request.headers.get('referer') || undefined

    // Create inquiry in database
    const inquiry = await prisma.inquiry.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email || null,
        message: validatedData.message || null,
        yachtId: validatedData.yachtId || null,
        source: validatedData.source,
        userAgent,
        ipAddress,
        referrer,
        context: validatedData.context,
      },
    })

    // Get yacht details separately if yachtId exists
    let yachtDetails: { title: string; slug: string; price: number | null; currency: string } | null = null
    if (inquiry.yachtId) {
      yachtDetails = await prisma.yacht.findUnique({
        where: { id: inquiry.yachtId },
        select: {
          title: true,
          slug: true,
          price: true,
          currency: true,
        },
      })
    }

    // Send email notifications (non-blocking)
    const emailPromises: Promise<void>[] = []

    // Map inquiry source to inquiry type
    const inquiryType: 'purchase' | 'charter' | 'general' =
      inquiry.source === 'WEBSITE' ? 'general' :
        inquiry.source === 'WHATSAPP' ? 'general' : 'general'

    // 1. Send admin alert email
    emailPromises.push(
      sendInquiryAlertEmail({
        inquiryId: inquiry.id,
        customerName: inquiry.name,
        customerEmail: inquiry.email || '',
        customerPhone: inquiry.phone || undefined,
        message: inquiry.message || 'No message provided',
        inquiryType,
        yachtName: yachtDetails?.title,
        yachtPrice: yachtDetails?.price
          ? `${yachtDetails.currency || 'AED'} ${yachtDetails.price.toLocaleString()}`
          : undefined,
        yachtSlug: yachtDetails?.slug,
      }).then((result) => {
        if (!result.success) {
          console.error('Failed to send admin alert email:', result.error)
        }
      })
    )

    // 2. Send customer confirmation email (if email provided)
    if (inquiry.email) {
      emailPromises.push(
        sendInquiryConfirmationEmail({
          customerEmail: inquiry.email,
          customerName: inquiry.name,
          inquiryType,
          message: inquiry.message || 'No message provided',
          yachtName: yachtDetails?.title,
        }).then((result) => {
          if (!result.success) {
            console.error('Failed to send confirmation email:', result.error)
          }
        })
      )
    }

    // Execute email sends in background (don't wait for completion)
    Promise.all(emailPromises).catch((err) => {
      console.error('Email sending error:', err)
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry submitted successfully',
        inquiryId: inquiry.id,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Inquiry submission error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Invalid form data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // This would typically require authentication
  // For now, return 401
  return NextResponse.json(
    { message: 'Unauthorized' },
    { status: 401 }
  )
}
