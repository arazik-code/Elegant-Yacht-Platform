
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

// POST /api/admin/blog/[id]/media - Upload media for specific post
// GET /api/admin/blog/[id]/media - List media for specific post

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Reuse existing media upload logic via internal fetch or service
        // For now we will forward to the main media endpoint which returns a URL
        // In a real app we might want to tag it with the post ID immediately

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `bimo-yacht/blog/${id}`,
                    resource_type: 'auto',
                    transformation: [
                        { quality: 'auto:best' },
                        { fetch_format: 'auto' },
                    ],
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            uploadStream.end(buffer)
        })

        // Create BlogMedia record
        const media = await prisma.blogMedia.create({
            data: {
                postId: id,
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                type: 'IMAGE', // For now assuming images, can detect video if needed
                alt: file.name,
            }
        })

        return NextResponse.json({ media })

    } catch (error) {
        console.error('Blog media upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload media' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const media = await prisma.blogMedia.findMany({
            where: { postId: id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ media })

    } catch (error) {
        console.error('Fetch blog media error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch media' },
            { status: 500 }
        )
    }
}
