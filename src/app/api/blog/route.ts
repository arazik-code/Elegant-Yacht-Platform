// Blog API Endpoints

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/blog - List published blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const where: any = {
      status: 'published',
    }
    
    if (category) {
      where.category = category
    }
    
    if (tag) {
      where.tags = { has: tag }
    }
    
    if (featured === 'true') {
      where.featured = true
    }
    
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.blogPost.count({ where }),
    ])
    
    return NextResponse.json({
      posts,
      total,
      hasMore: offset + posts.length < total,
    })
    
  } catch (error) {
    console.error('Blog list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}
