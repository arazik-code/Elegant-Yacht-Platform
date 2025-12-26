// Single Blog Post API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/blog/[slug] - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    })
    
    if (!post || post.status !== 'published') {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Get related posts
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: post.id },
        status: 'published',
        OR: [
          { category: post.category },
          { tags: { hasSome: post.tags } },
        ],
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    })
    
    return NextResponse.json({
      post,
      relatedPosts,
    })
    
  } catch (error) {
    console.error('Blog post error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}
