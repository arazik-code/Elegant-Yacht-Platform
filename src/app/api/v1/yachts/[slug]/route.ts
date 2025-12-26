// Public API v1 - Single Yacht endpoint

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

// API Key validation
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key')
  const validKeys = (process.env.PUBLIC_API_KEYS || '').split(',').filter(Boolean)
  
  if (process.env.NODE_ENV === 'development' && !validKeys.length) {
    return true
  }
  
  return apiKey ? validKeys.includes(apiKey) : false
}

// GET /api/v1/yachts/[slug] - Get single yacht details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    )
  }
  
  // Rate limit
  const apiKey = request.headers.get('X-API-Key') || 'anonymous'
  const rateLimit = checkRateLimit(`api-v1:${apiKey}`, 'api')
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: getRateLimitHeaders(rateLimit, 'api') }
    )
  }
  
  try {
    const { slug } = await params
    
    const yacht = await prisma.yacht.findUnique({
      where: { slug },
      include: {
        media: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            url: true,
            type: true,
            alt: true,
            caption: true,
            isCover: true,
          },
        },
      },
    })
    
    if (!yacht || yacht.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Yacht not found' },
        { status: 404 }
      )
    }
    
    // Format response with public fields only
    const publicYacht = {
      id: yacht.id,
      slug: yacht.slug,
      title: yacht.title,
      type: yacht.type,
      price: yacht.priceOnRequest ? null : yacht.price,
      priceOnRequest: yacht.priceOnRequest,
      currency: yacht.currency,
      charterPricePerHour: yacht.charterPricePerHour,
      charterPricePerDay: yacht.charterPricePerDay,
      
      // Specifications
      lengthFeet: yacht.lengthFeet,
      lengthMeters: yacht.lengthMeters,
      beam: yacht.beam,
      brand: yacht.brand,
      model: yacht.model,
      year: yacht.year,
      builder: yacht.builder,
      
      // Capacity
      cabins: yacht.cabins,
      bathrooms: yacht.bathrooms,
      guestCapacity: yacht.guestCapacity,
      crewCapacity: yacht.crewCapacity,
      
      // Technical
      engines: yacht.engines,
      maxSpeed: yacht.maxSpeed,
      cruiseSpeed: yacht.cruiseSpeed,
      
      // Content
      description: yacht.descriptionEn,
      highlights: yacht.highlightsEn,
      amenities: yacht.amenitiesEn,
      
      // Charter specific
      charterRoutes: yacht.charterRoutes,
      minimumHours: yacht.minimumHours,
      
      // Media
      media: yacht.media,
      
      // Metadata
      featured: yacht.featured,
      updatedAt: yacht.updatedAt,
    }
    
    return NextResponse.json(
      { data: publicYacht },
      {
        headers: {
          ...getRateLimitHeaders(rateLimit, 'api'),
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
    
  } catch (error) {
    console.error('Public API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
