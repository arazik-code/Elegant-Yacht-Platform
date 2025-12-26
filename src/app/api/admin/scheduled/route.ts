// Scheduled Tasks API
// Manage scheduled publishing and other tasks

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { createAuditLog } from '@/lib/audit'

// GET /api/admin/scheduled - Get scheduled tasks
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const entityType = searchParams.get('entityType')
    
    const where: any = {}
    if (status !== 'all') {
      where.status = status
    }
    if (entityType) {
      where.entityType = entityType
    }
    
    const tasks = await prisma.scheduledTask.findMany({
      where,
      orderBy: { scheduledFor: 'asc' },
      take: 100,
    })
    
    return NextResponse.json({ tasks })
    
  } catch (error) {
    console.error('Scheduled tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled tasks' },
      { status: 500 }
    )
  }
}

// POST /api/admin/scheduled - Create scheduled task
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await currentUser()
    const body = await request.json()
    const { taskType, entityType, entityId, scheduledFor, metadata } = body
    
    if (!taskType || !scheduledFor) {
      return NextResponse.json(
        { error: 'taskType and scheduledFor are required' },
        { status: 400 }
      )
    }
    
    const task = await prisma.scheduledTask.create({
      data: {
        taskType,
        entityType,
        entityId,
        scheduledFor: new Date(scheduledFor),
        createdBy: userId,
        metadata,
      },
    })
    
    await createAuditLog({
      action: 'CREATE',
      entityType: entityType || 'Yacht',
      entityId,
      metadata: { taskType, scheduledFor },
      clerkId: userId,
      adminEmail: user?.emailAddresses[0]?.emailAddress,
      adminName: user?.fullName,
    })
    
    return NextResponse.json({ task })
    
  } catch (error) {
    console.error('Create scheduled task error:', error)
    return NextResponse.json(
      { error: 'Failed to create scheduled task' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/scheduled - Cancel scheduled task
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }
    
    await prisma.scheduledTask.update({
      where: { id: taskId },
      data: { status: 'cancelled' },
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Cancel scheduled task error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel scheduled task' },
      { status: 500 }
    )
  }
}
