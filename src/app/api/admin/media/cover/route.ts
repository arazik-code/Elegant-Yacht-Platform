// Admin Media API - Cover, Reorder, Update operations

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

// PUT /api/admin/media/cover - Set media as cover
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    // Support both { yachtId, mediaId } and { mediaId } formats
    const mediaId = body.mediaId
    let yachtId = body.yachtId
    
    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      )
    }
    
    // If yachtId not provided, get it from the media record
    if (!yachtId) {
      const media = await prisma.yachtMedia.findUnique({
        where: { id: mediaId },
        select: { yachtId: true }
      })
      if (!media) {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 })
      }
      yachtId = media.yachtId
    }
    
    // Unset all covers for this yacht
    await prisma.yachtMedia.updateMany({
      where: { yachtId },
      data: { isCover: false },
    })
    
    // Set new cover
    const updatedMedia = await prisma.yachtMedia.update({
      where: { id: mediaId },
      data: { isCover: true },
    })
    
    return NextResponse.json({ success: true, media: updatedMedia })
  } catch (error) {
    console.error('Error setting cover:', error)
    return NextResponse.json(
      { error: 'Failed to set cover' },
      { status: 500 }
    )
  }
}
