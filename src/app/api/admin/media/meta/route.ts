// Admin Media Meta API - Update alt text and caption

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

// PUT /api/admin/media/meta - Update media metadata
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { mediaId, alt, caption } = await request.json()
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }
    
    // Update the media item
    const media = await prisma.yachtMedia.update({
      where: { id: mediaId },
      data: { 
        alt: alt || null,
        caption: caption || null,
      },
    })
    
    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error updating media meta:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}
