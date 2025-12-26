// AI Search API Endpoint

import { NextRequest, NextResponse } from 'next/server'
import { parseNaturalLanguageQuery } from '@/lib/ai-search'
import prisma from '@/lib/db'

// POST /api/ai-search - Natural language yacht search
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Parse query with AI
    const searchResult = await parseNaturalLanguageQuery(query)
    console.log('AI Search Debug:', { query, searchResult }) // Debug log
    const { filters, explanation, suggestions } = searchResult

    // Build Prisma query from filters
    const where: any = {
      status: 'AVAILABLE',
    }

    if (filters.type) {
      where.type = filters.type
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {}
      if (filters.minPrice) where.price.gte = filters.minPrice
      if (filters.maxPrice) where.price.lte = filters.maxPrice
    }

    if (filters.minLength || filters.maxLength) {
      where.lengthFeet = {}
      if (filters.minLength) where.lengthFeet.gte = filters.minLength
      if (filters.maxLength) where.lengthFeet.lte = filters.maxLength
    }

    if (filters.brands && filters.brands.length > 0) {
      where.brand = { in: filters.brands }
    }

    if (filters.minYear) {
      where.year = { gte: filters.minYear }
    }

    if (filters.maxYear) {
      where.year = { ...where.year, lte: filters.maxYear }
    }

    if (filters.minCabins) {
      where.cabins = { gte: filters.minCabins }
    }

    if (filters.minGuests) {
      where.guestCapacity = { gte: filters.minGuests }
    }

    if (filters.features && filters.features.length > 0) {
      // Filter by features (amenities or highlights)
      // Using hasSome to be inclusive (OR logic), can switch to hasEvery for AND logic
      where.OR = [
        { amenitiesEn: { hasSome: filters.features } },
        { highlightsEn: { hasSome: filters.features } }
      ]
    }

    if (filters.textQuery) {
      // Free text search for specific yacht names or models
      const textFilter = { contains: filters.textQuery, mode: 'insensitive' }
      where.AND = [
        {
          OR: [
            { title: textFilter },
            { model: textFilter },
            { slug: textFilter }
          ]
        }
      ]
    }

    // Fetch matching yachts
    const yachts = await prisma.yacht.findMany({
      where,
      include: {
        media: {
          where: { isCover: true },
          take: 1,
        },
      },
      orderBy: [
        { featured: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 20,
    })

    return NextResponse.json({
      yachts,
      filters,
      explanation,
      suggestions,
      totalResults: yachts.length,
    })
  } catch (error) {
    console.error('AI search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
