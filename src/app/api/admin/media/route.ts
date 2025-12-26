// Admin Media Upload API

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

// GET /api/admin/media - Get media for a yacht
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const yachtId = searchParams.get('yachtId')

    if (!yachtId) {
      return NextResponse.json({ error: 'Yacht ID is required' }, { status: 400 })
    }

    const media = await prisma.yachtMedia.findMany({
      where: { yachtId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// POST /api/admin/media - Upload media (File or URL)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''

    // Handle JSON (Video URL)
    if (contentType.includes('application/json')) {
      const { yachtId, type, videoUrl } = await request.json()

      if (!yachtId || !videoUrl || type !== 'VIDEO') {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
      }

      // Get current max order
      const maxOrder = await prisma.yachtMedia.aggregate({
        where: { yachtId },
        _max: { order: true },
      })

      // Extract video ID for thumbnail (simple YouTube logic)
      let thumbnailUrl = null
      if (videoUrl.includes('youtube') || videoUrl.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = videoUrl.match(regExp)
        const videoId = (match && match[2].length === 11) ? match[2] : null
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      }

      const media = await prisma.yachtMedia.create({
        data: {
          yachtId,
          url: videoUrl,
          type: 'VIDEO',
          isCover: false,
          order: (maxOrder._max.order || 0) + 1,
          thumbnailUrl,
        },
      })

      return NextResponse.json({ media }, { status: 201 })
    }

    // Handle FormData (File Upload)
    const formData = await request.formData()
    const file = formData.get('file') as File
    const yachtId = formData.get('yachtId') as string
    const type = (formData.get('type') as string) || 'IMAGE'
    const isCover = formData.get('isCover') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!yachtId) {
      return NextResponse.json({ error: 'Yacht ID is required' }, { status: 400 })
    }

    // Check if yacht exists
    const yacht = await prisma.yacht.findUnique({
      where: { id: yachtId },
    })

    if (!yacht) {
      return NextResponse.json({ error: 'Yacht not found' }, { status: 404 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary with optimizations
    const isVideo = type === 'VIDEO'
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bimo-yacht/${yachtId}`,
          resource_type: isVideo ? 'video' : 'image',
          // Auto optimization for images
          transformation: !isVideo ? [
            { quality: 'auto:best' },
            { fetch_format: 'auto' },
          ] : undefined,
          // Generate video thumbnail
          eager: isVideo ? [
            {
              format: 'jpg', transformation: [
                { width: 640, height: 360, crop: 'fill' },
                { quality: 'auto' }
              ]
            }
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

    // Get current max order for yacht
    const maxOrder = await prisma.yachtMedia.aggregate({
      where: { yachtId },
      _max: { order: true },
    })

    // If setting as cover, unset other covers
    if (isCover) {
      await prisma.yachtMedia.updateMany({
        where: { yachtId, isCover: true },
        data: { isCover: false },
      })
    }

    // Check if this is the first image - auto set as cover
    const existingCount = await prisma.yachtMedia.count({
      where: { yachtId, type: 'IMAGE' },
    })
    const shouldBeCover = isCover || (existingCount === 0 && !isVideo)

    // Create media record
    const media = await prisma.yachtMedia.create({
      data: {
        yachtId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: type as 'IMAGE' | 'VIDEO',
        isCover: shouldBeCover,
        order: (maxOrder._max.order || 0) + 1,
        // Video specific
        thumbnailUrl: isVideo && uploadResult.eager?.[0]?.secure_url
          ? uploadResult.eager[0].secure_url
          : null,
        duration: isVideo ? uploadResult.duration : null,
      },
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/media - Delete media
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 })
    }

    // Get media record
    const media = await prisma.yachtMedia.findUnique({
      where: { id: mediaId },
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete from Cloudinary
    if (media.publicId) {
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === 'VIDEO' ? 'video' : 'image',
      })
    }

    // Delete from database
    await prisma.yachtMedia.delete({
      where: { id: mediaId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
