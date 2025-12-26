// Public API v1 - Yachts endpoint
// Versioned, documented API for external integrations

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

// API Key validation
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key')
  const validKeys = (process.env.PUBLIC_API_KEYS || '').split(',').filter(Boolean)
  
  // In development, allow requests without API key
  if (process.env.NODE_ENV === 'development' && !validKeys.length) {
    return true
  }
  
  return apiKey ? validKeys.includes(apiKey) : false
}

// GET /api/v1/yachts - List available yachts
export async function GET(request: NextRequest) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    )
  }
  
  // Rate limit by API key
  const apiKey = request.headers.get('X-API-Key') || 'anonymous'
  const rateLimit = checkRateLimit(`api-v1:${apiKey}`, 'api')
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: getRateLimitHeaders(rateLimit, 'api') }
    )
  }
  
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const type = searchParams.get('type')?.toUpperCase() as 'SALE' | 'CHARTER' | undefined
    const brand = searchParams.get('brand')
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
    const minLength = searchParams.get('minLength') ? parseInt(searchParams.get('minLength')!) : undefined
    const maxLength = searchParams.get('maxLength') ? parseInt(searchParams.get('maxLength')!) : undefined
    const minYear = searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined
    const featured = searchParams.get('featured') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const fields = searchParams.get('fields')?.split(',')
    
    // Build query
    const where: any = {
      status: 'AVAILABLE',
    }
    
    if (type) where.type = type
    if (brand) where.brand = { contains: brand, mode: 'insensitive' }
    if (featured) where.featured = true
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = minPrice
      if (maxPrice) where.price.lte = maxPrice
    }
    
    if (minLength || maxLength) {
      where.lengthFeet = {}
      if (minLength) where.lengthFeet.gte = minLength
      if (maxLength) where.lengthFeet.lte = maxLength
    }
    
    if (minYear) {
      where.year = { gte: minYear }
    }
    
    // Default fields selection
    const defaultSelect = {
      id: true,
      title: true,
      slug: true,
      type: true,
      price: true,
      priceOnRequest: true,
      currency: true,
      lengthFeet: true,
      brand: true,
      model: true,
      year: true,
      cabins: true,
      guestCapacity: true,
      descriptionEn: true,
      featured: true,
      media: {
        where: { isCover: true },
        select: { url: true, alt: true },
        take: 1,
      },
    }
    
    // Custom field selection
    let select = defaultSelect
    if (fields && fields.length > 0) {
      select = {} as any
      for (const field of fields) {
        if (field in defaultSelect) {
          (select as any)[field] = (defaultSelect as any)[field]
        }
      }
      // Always include id
      select.id = true
    }
    
    // Execute query
    const [yachts, total] = await Promise.all([
      prisma.yacht.findMany({
        where,
        select,
        orderBy: [
          { featured: 'desc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.yacht.count({ where }),
    ])
    
    // Format response
    const response = {
      data: yachts,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + yachts.length < total,
      },
      links: {
        self: request.url,
        next: offset + limit < total 
          ? `${request.url.split('?')[0]}?limit=${limit}&offset=${offset + limit}`
          : null,
      },
    }
    
    return NextResponse.json(response, {
      headers: {
        ...getRateLimitHeaders(rateLimit, 'api'),
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
    
  } catch (error) {
    console.error('Public API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
