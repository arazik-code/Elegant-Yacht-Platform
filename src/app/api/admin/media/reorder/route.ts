// Admin Media API - Reorder operations

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

// PUT /api/admin/media/reorder - Update media order
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    // Support both { items: [...] } and { yachtId, mediaOrder: [...] } formats
    const items = body.items || body.mediaOrder
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }
    
    // Update order for each media item
    await Promise.all(
      items.map(({ id, order }: { id: string; order: number }) =>
        prisma.yachtMedia.update({
          where: { id },
          data: { order },
        })
      )
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering media:', error)
    return NextResponse.json(
      { error: 'Failed to reorder media' },
      { status: 500 }
    )
  }
}
