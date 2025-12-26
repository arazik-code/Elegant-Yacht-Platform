// Admin Blog API Endpoints

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { createAuditLog } from '@/lib/audit'

// GET /api/admin/blog - List all blog posts (admin)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({ posts, total })

  } catch (error) {
    console.error('Admin blog list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blog - Create blog post
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    const body = await request.json()

    const {
      slug,
      titleEn,
      titleAr,
      excerptEn,
      excerptAr,
      contentEn,
      contentAr,
      coverImage,
      coverImageAlt,
      metaTitleEn,
      metaTitleAr,
      metaDescriptionEn,
      metaDescriptionAr,
      category,
      tags,
      sources,
      status,
      featured,
    } = body

    if (!slug || !titleEn || !contentEn) {
      return NextResponse.json(
        { error: 'Slug, title (EN), and content (EN) are required' },
        { status: 400 }
      )
    }

    // Check slug uniqueness
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        titleEn,
        titleAr,
        excerptEn,
        excerptAr,
        contentEn,
        contentAr,
        coverImage,
        coverImageAlt,
        metaTitleEn,
        metaTitleAr,
        metaDescriptionEn,
        metaDescriptionAr,
        category,
        tags: tags || [],
        sources: sources || [],
        status: status || 'draft',
        featured: featured || false,
        authorName: user?.fullName,
        publishedAt: status === 'published' ? new Date() : null,
      },
    })

    await createAuditLog({
      action: 'CREATE',
      entityType: 'BlogPost',
      entityId: post.id,
      entityName: titleEn,
      clerkId: userId,
      adminEmail: user?.emailAddresses[0]?.emailAddress,
      adminName: user?.fullName,
    })

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Create blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
