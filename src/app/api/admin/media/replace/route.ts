// Admin Media Replace API - Replace media file

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v2 as cloudinary } from 'cloudinary'
import prisma from '@/lib/db'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// PUT /api/admin/media/replace - Replace media file
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const mediaId = formData.get('mediaId') as string
    const yachtId = formData.get('yachtId') as string
    const isCover = formData.get('isCover') === 'true'
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }
    
    // Get existing media
    const existingMedia = await prisma.yachtMedia.findUnique({
      where: { id: mediaId },
    })
    
    if (!existingMedia) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }
    
    // Delete old file from Cloudinary
    if (existingMedia.publicId) {
      try {
        await cloudinary.uploader.destroy(existingMedia.publicId, {
          resource_type: existingMedia.type === 'VIDEO' ? 'video' : 'image',
        })
      } catch (err) {
        console.error('Error deleting old file:', err)
      }
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Determine file type
    const isVideo = file.type.startsWith('video/')
    const type = isVideo ? 'VIDEO' : 'IMAGE'
    
    // Upload new file to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bimo-yacht/${yachtId || existingMedia.yachtId}`,
          resource_type: isVideo ? 'video' : 'image',
          transformation: !isVideo ? [
            { quality: 'auto:best' },
            { fetch_format: 'auto' },
          ] : undefined,
          eager: isVideo ? [
            { format: 'jpg', transformation: [
              { width: 640, height: 360, crop: 'fill' },
              { quality: 'auto' }
            ]}
          ] : undefined,
          eager_async: true,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })
    
    // If setting as cover, unset other covers
    if (isCover) {
      await prisma.yachtMedia.updateMany({
        where: { 
          yachtId: existingMedia.yachtId,
          isCover: true,
          id: { not: mediaId }
        },
        data: { isCover: false },
      })
    }
    
    // Update media record
    const media = await prisma.yachtMedia.update({
      where: { id: mediaId },
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: type,
        isCover: isCover || existingMedia.isCover,
        thumbnailUrl: isVideo && uploadResult.eager?.[0]?.secure_url 
          ? uploadResult.eager[0].secure_url 
          : null,
        duration: isVideo ? uploadResult.duration : null,
      },
    })
    
    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error replacing media:', error)
    return NextResponse.json(
      { error: 'Failed to replace media' },
      { status: 500 }
    )
  }
}
