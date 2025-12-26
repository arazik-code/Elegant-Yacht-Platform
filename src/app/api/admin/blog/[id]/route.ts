// Admin Single Blog Post API

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { createAuditLog, getChanges } from '@/lib/audit'

// GET /api/admin/blog/[id] - Get blog post for editing
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

    const post = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Get blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/blog/[id] - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const user = await currentUser()
    const body = await request.json()

    // Get existing post
    const existing = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check slug uniqueness if changed
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findUnique({
        where: { slug: body.slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Set publishedAt when publishing
    const { id: _id, createdAt, updatedAt, media, authorId, ...updateData } = body
    if (body.status === 'published' && existing.status !== 'published') {
      (updateData as any).publishedAt = new Date()
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    })

    // Log changes
    const changes = getChanges(existing as any, body)
    if (Object.keys(changes).length > 0) {
      await createAuditLog({
        action: 'UPDATE',
        entityType: 'BlogPost',
        entityId: id,
        entityName: post.titleEn,
        changes,
        clerkId: userId,
        adminEmail: user?.emailAddresses[0]?.emailAddress,
        adminName: user?.fullName,
      })
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Update blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blog/[id] - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const user = await currentUser()

    const post = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    await prisma.blogPost.delete({
      where: { id },
    })

    await createAuditLog({
      action: 'DELETE',
      entityType: 'BlogPost',
      entityId: id,
      entityName: post.titleEn,
      clerkId: userId,
      adminEmail: user?.emailAddresses[0]?.emailAddress,
      adminName: user?.fullName,
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
