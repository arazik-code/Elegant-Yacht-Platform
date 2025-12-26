// Yachts API Route

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

type YachtOrderByInput = {
  featured?: 'asc' | 'desc'
  priority?: 'asc' | 'desc'
  createdAt?: 'asc' | 'desc'
  price?: 'asc' | 'desc'
  lengthFeet?: 'asc' | 'desc'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type')
    const brand = searchParams.get('brand')
    const minLength = searchParams.get('minLength')
    const maxLength = searchParams.get('maxLength')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const featured = searchParams.get('featured')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const ids = searchParams.get('ids')

    // Build where clause
    const where: Prisma.YachtWhereInput = {
      status: 'AVAILABLE',
    }

    if (type && type !== 'ALL') {
      where.type = type as 'SALE' | 'CHARTER'
    }

    if (ids) {
      const idArray = ids.split(',').filter(Boolean)
      if (idArray.length > 0) {
        where.id = { in: idArray }
      }
    }

    if (brand) {
      where.brand = brand
    }

    if (minLength || maxLength) {
      where.lengthFeet = {}
      if (minLength) where.lengthFeet.gte = parseInt(minLength)
      if (maxLength) where.lengthFeet.lte = parseInt(maxLength)
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseInt(minPrice)
      if (maxPrice) where.price.lte = parseInt(maxPrice)
    }

    if (featured === 'true') {
      where.featured = true
    }

    // Build order by
    let orderBy: YachtOrderByInput[] = [
      { featured: 'desc' },
      { priority: 'desc' },
    ]

    switch (sort) {
      case 'oldest':
        orderBy.push({ createdAt: 'asc' })
        break
      case 'price-asc':
        orderBy.push({ price: 'asc' })
        break
      case 'price-desc':
        orderBy.push({ price: 'desc' })
        break
      case 'length-asc':
        orderBy.push({ lengthFeet: 'asc' })
        break
      case 'length-desc':
        orderBy.push({ lengthFeet: 'desc' })
        break
      default:
        orderBy.push({ createdAt: 'desc' })
    }

    const skip = (page - 1) * limit

    const [yachts, total] = await Promise.all([
      prisma.yacht.findMany({
        where,
        include: {
          media: {
            orderBy: { order: 'asc' },
            take: 3,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.yacht.count({ where }),
    ])

    // Transform data for API response
    const transformedYachts = yachts.map((yacht: any) => ({
      id: yacht.id,
      slug: yacht.slug,
      title: yacht.title,
      type: yacht.type,
      status: yacht.status,
      price: yacht.showPrice && yacht.price ? Number(yacht.price) : null,
      priceOnRequest: yacht.priceOnRequest,
      currency: yacht.currency,
      charterPricePerWeek: yacht.charterPricePerWeek ? Number(yacht.charterPricePerWeek) : null,
      lengthFeet: yacht.lengthFeet,
      brand: yacht.brand,
      model: yacht.model,
      year: yacht.year,
      cabins: yacht.cabins,
      guestCapacity: yacht.guestCapacity,
      featured: yacht.featured,
      media: yacht.media.map((m: any) => ({
        url: m.url,
        type: m.type,
        isCover: m.isCover,
      })),
    }))

    return NextResponse.json({
      yachts: transformedYachts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })

  } catch (error) {
    console.error('Yachts API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch yachts' },
      { status: 500 }
    )
  }
}
