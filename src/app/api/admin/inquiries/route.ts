// Admin Inquiries API
// List all inquiries with filtering

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: Record<string, unknown> = {}

    switch (filter) {
      case 'new':
        where.status = 'NEW'
        break
      case 'contacted':
        where.status = 'CONTACTED'
        break
      case 'closed':
        where.status = 'CLOSED'
        break
      case 'won':
        where.outcome = 'WON'
        break
      case 'lost':
        where.outcome = 'LOST'
        break
      case 'in-progress':
        where.outcome = 'IN_PROGRESS'
        break
      case 'follow-up':
        // Inquiries with follow-up date <= today and no outcome
        where.followUpDate = { lte: new Date() }
        where.outcome = null
        break
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          yacht: { select: { id: true, title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      inquiries,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Inquiries API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}
