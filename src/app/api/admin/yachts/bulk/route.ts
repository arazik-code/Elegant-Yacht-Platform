// Admin Bulk Actions API
// Handles bulk operations on yachts

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { createAuditLog, getChanges } from '@/lib/audit'

// POST /api/admin/yachts/bulk - Perform bulk actions
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await currentUser()
    const body = await request.json()
    const { action, yachtIds, data } = body
    
    if (!action || !Array.isArray(yachtIds) || yachtIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide action and yachtIds.' },
        { status: 400 }
      )
    }
    
    let result: any
    
    switch (action) {
      case 'publish':
        result = await prisma.yacht.updateMany({
          where: { id: { in: yachtIds } },
          data: { 
            status: 'AVAILABLE',
            publishedAt: new Date(),
          },
        })
        await createAuditLog({
          action: 'BULK_UPDATE',
          entityType: 'Yacht',
          metadata: { action: 'publish', yachtIds },
          clerkId: userId,
          adminEmail: user?.emailAddresses[0]?.emailAddress,
          adminName: user?.fullName,
        })
        break
        
      case 'unpublish':
        result = await prisma.yacht.updateMany({
          where: { id: { in: yachtIds } },
          data: { 
            status: 'UNAVAILABLE',
          },
        })
        await createAuditLog({
          action: 'BULK_UPDATE',
          entityType: 'Yacht',
          metadata: { action: 'unpublish', yachtIds },
          clerkId: userId,
          adminEmail: user?.emailAddresses[0]?.emailAddress,
          adminName: user?.fullName,
        })
        break
        
      case 'archive':
        result = await prisma.yacht.updateMany({
          where: { id: { in: yachtIds } },
          data: { 
            status: 'UNAVAILABLE',
          },
        })
        await createAuditLog({
          action: 'ARCHIVE',
          entityType: 'Yacht',
          metadata: { yachtIds },
          clerkId: userId,
          adminEmail: user?.emailAddresses[0]?.emailAddress,
          adminName: user?.fullName,
        })
        break
        
      case 'delete':
        // Soft delete - mark as unavailable
        result = await prisma.yacht.deleteMany({
          where: { id: { in: yachtIds } },
        })
        await createAuditLog({
          action: 'BULK_DELETE',
          entityType: 'Yacht',
          metadata: { yachtIds },
          clerkId: userId,
          adminEmail: user?.emailAddresses[0]?.emailAddress,
          adminName: user?.fullName,
        })
        break
        
      case 'update_priority':
        if (typeof data?.priority !== 'number') {
          return NextResponse.json(
            { error: 'Priority value required' },
            { status: 400 }
          )
        }
        result = await prisma.yacht.updateMany({
          where: { id: { in: yachtIds } },
          data: { priority: data.priority },
        })
        await createAuditLog({
          action: 'BULK_UPDATE',
          entityType: 'Yacht',
          metadata: { action: 'update_priority', yachtIds, priority: data.priority },
          clerkId: userId,
          adminEmail: user?.emailAddresses[0]?.emailAddress,
          adminName: user?.fullName,
        })
        break
        
      case 'toggle_featured':
        if (typeof data?.featured !== 'boolean') {
          return NextResponse.json(
            { error: 'Featured value required' },
            { status: 400 }
          )
        }
        result = await prisma.yacht.updateMany({
          where: { id: { in: yachtIds } },
          data: { featured: data.featured },
        })
        await createAuditLog({
          action: 'BULK_UPDATE',
          entityType: 'Yacht',
          metadata: { action: 'toggle_featured', yachtIds, featured: data.featured },
          clerkId: userId,
          adminEmail: user?.emailAddresses[0]?.emailAddress,
          adminName: user?.fullName,
        })
        break
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      action,
      affected: result.count,
    })
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json(
      { error: 'Bulk action failed' },
      { status: 500 }
    )
  }
}
