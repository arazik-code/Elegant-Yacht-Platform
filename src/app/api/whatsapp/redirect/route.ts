// WhatsApp Redirect API with Click Tracking

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { 
  generateWhatsAppLink,
  generateAdminReplyLink,
  createWhatsAppClickEvent,
  type WhatsAppContext,
  type AdminReplyTemplate,
  type WhatsAppClickEvent,
} from '@/lib/whatsapp'

// GET /api/whatsapp/redirect - Track click and redirect to WhatsApp
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const context = (searchParams.get('context') as WhatsAppContext) || 'general_inquiry'
    const locale = (searchParams.get('locale') as 'en' | 'ar') || 'en'
    const yachtTitle = searchParams.get('yacht') || undefined
    const yachtId = searchParams.get('yachtId') || undefined
    const inquiryId = searchParams.get('inquiryId') || undefined
    const templateId = searchParams.get('templateId') as AdminReplyTemplate | undefined
    const phone = searchParams.get('phone') || undefined
    const customerName = searchParams.get('customerName') || undefined
    
    // Create click event for analytics
    const clickEvent = createWhatsAppClickEvent(searchParams, request.headers)
    
    // Log to WhatsAppClick model (async, don't wait)
    logWhatsAppClick(clickEvent).catch(console.error)
    
    // If linked to an inquiry, update it
    if (inquiryId) {
      updateInquiryWhatsAppClick(inquiryId).catch(console.error)
    }
    
    // Generate WhatsApp link based on context
    let whatsAppUrl: string
    
    if (context === 'admin_reply' && templateId && phone) {
      // Admin reply with template
      whatsAppUrl = generateAdminReplyLink(
        phone,
        templateId,
        { yachtTitle, customerName },
        locale
      )
    } else {
      // Customer initiated
      whatsAppUrl = generateWhatsAppLink(
        context,
        { yachtTitle },
        locale,
        phone
      )
    }
    
    // Redirect to WhatsApp
    return NextResponse.redirect(whatsAppUrl)
  } catch (error) {
    console.error('WhatsApp redirect error:', error)
    // Fallback to direct WhatsApp link
    return NextResponse.redirect(
      `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971501566633'}`
    )
  }
}

// Log WhatsApp click to WhatsAppClick model
async function logWhatsAppClick(event: WhatsAppClickEvent) {
  try {
    await prisma.whatsAppClick.create({
      data: {
        context: event.context,
        locale: event.locale,
        inquiryId: event.inquiryId || undefined,
        yachtId: event.yachtId || undefined,
        yachtTitle: event.yachtTitle || undefined,
        templateId: event.templateId || undefined,
        userAgent: event.userAgent || undefined,
        referrer: event.referrer || undefined,
      },
    })
  } catch (error) {
    // Fallback: log to AnalyticsEvent if WhatsAppClick model not available
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'WHATSAPP_CLICK',
          eventData: {
            context: event.context,
            yachtTitle: event.yachtTitle,
            inquiryId: event.inquiryId,
            templateId: event.templateId,
            locale: event.locale,
          },
          yachtId: event.yachtId,
          userAgent: event.userAgent,
          referrer: event.referrer,
        },
      })
    } catch {
      // Last resort: console log
      console.log('WhatsApp click event:', JSON.stringify(event))
    }
  }
}

// Update inquiry with WhatsApp click info
async function updateInquiryWhatsAppClick(inquiryId: string) {
  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      select: { notes: true },
    })
    
    const existingNotes = inquiry?.notes || ''
    const timestamp = new Date().toISOString()
    const newNote = `WhatsApp contacted at ${timestamp}`
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n${newNote}` 
      : newNote
    
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        notes: updatedNotes,
        status: 'CONTACTED', // Auto-update status
        contactedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Error updating inquiry:', error)
  }
}

// POST /api/whatsapp/redirect - Get WhatsApp analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, inquiryId, startDate, endDate } = body
    
    if (action === 'getClickCount' && inquiryId) {
      const count = await prisma.whatsAppClick.count({
        where: { inquiryId },
      })
      return NextResponse.json({ count })
    }
    
    if (action === 'getStats') {
      const where: Record<string, unknown> = {}
      if (startDate) where.createdAt = { gte: new Date(startDate) }
      if (endDate) {
        where.createdAt = { 
          ...(where.createdAt as Record<string, Date> || {}), 
          lte: new Date(endDate) 
        }
      }
      
      const [totalClicks, clicksByContext] = await Promise.all([
        prisma.whatsAppClick.count({ where }),
        prisma.whatsAppClick.groupBy({
          by: ['context'],
          _count: { context: true },
          where,
        }),
      ])
      
      return NextResponse.json({
        totalClicks,
        clicksByContext: clicksByContext.reduce((acc, item) => {
          acc[item.context] = item._count.context
          return acc
        }, {} as Record<string, number>),
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('WhatsApp analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}
