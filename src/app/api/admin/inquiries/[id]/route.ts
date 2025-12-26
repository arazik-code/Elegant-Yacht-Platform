// Admin Single Inquiry API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/admin/inquiries/[id] - Get single inquiry
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        yacht: {
          select: { id: true, title: true, slug: true },
        },
      },
    })

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    return NextResponse.json({ inquiry })
  } catch (error) {
    console.error('Error fetching inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/inquiries/[id] - Update inquiry with outcome, notes, follow-up
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get current inquiry for status history
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
      select: { status: true, statusHistory: true },
    })

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    // Handle status change with history tracking
    if (body.status && body.status !== existingInquiry.status) {
      const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      updateData.status = body.status

      // Add to status history
      const history = (existingInquiry.statusHistory as Array<{
        status: string
        changedAt: string
        changedBy: string
      }>) || []

      history.push({
        status: body.status,
        changedAt: new Date().toISOString(),
        changedBy: userId,
      })

      updateData.statusHistory = history

      if (body.status === 'CONTACTED') {
        updateData.contactedAt = new Date()
      }
    }

    // Handle outcome (WON, LOST, IN_PROGRESS)
    if (body.outcome !== undefined) {
      const validOutcomes = ['WON', 'LOST', 'IN_PROGRESS', null]
      if (!validOutcomes.includes(body.outcome)) {
        return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 })
      }
      updateData.outcome = body.outcome
      updateData.outcomeDate = body.outcome ? new Date() : null
    }

    // Handle notes and sales memory
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.outcomeNotes !== undefined) updateData.outcomeNotes = body.outcomeNotes
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo

    // Handle follow-up date
    if (body.followUpDate !== undefined) {
      updateData.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null
    }

    // Handle deal closure fields
    if (body.soldYachtId !== undefined) updateData.soldYachtId = body.soldYachtId || null
    if (body.dealValue !== undefined) updateData.dealValue = body.dealValue || null

    // Update inquiry
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData,
      include: {
        yacht: { select: { id: true, title: true, slug: true } },
      },
    })

    return NextResponse.json({ success: true, inquiry })
  } catch (error) {
    console.error('Error updating inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/inquiries/[id] - Delete inquiry
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if inquiry exists
    const existingInquiry = await prisma.inquiry.findUnique({
      where: { id },
    })

    if (!existingInquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
    }

    // Delete inquiry
    await prisma.inquiry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inquiry:', error)
    return NextResponse.json(
      { error: 'Failed to delete inquiry' },
      { status: 500 }
    )
  }
}
