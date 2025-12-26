// Admin Yachts API - CRUD Operations

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { yachtSchema } from '@/lib/validations'

// GET /api/admin/yachts - Get all yachts (admin)
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const yachts = await prisma.yacht.findMany({
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { inquiries: true },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ yachts })
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch yachts' },
      { status: 500 }
    )
  }
}

// POST /api/admin/yachts - Create new yacht
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const result = yachtSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const data = result.data

    // Check if slug is unique
    const existingYacht = await prisma.yacht.findUnique({
      where: { slug: data.slug },
    })

    if (existingYacht) {
      return NextResponse.json(
        { error: 'A yacht with this URL slug already exists' },
        { status: 400 }
      )
    }

    // Create yacht
    const yacht = await prisma.yacht.create({
      data: {
        title: data.title,
        slug: data.slug,
        type: data.type,
        status: data.status,
        featured: data.featured,
        showPrice: data.showPrice,
        priceOnRequest: data.priceOnRequest,
        brand: data.brand,
        model: data.model,
        year: data.year,
        lengthFeet: data.lengthFeet,
        cabins: data.cabins,
        bathrooms: data.bathrooms,
        guestCapacity: data.guestCapacity,
        crewCapacity: data.crewCapacity,
        engines: data.engines,
        engineMake: data.engineMake,
        engineModel: data.engineModel,
        engineHours: data.engineHours,
        engineType: data.engineType,
        driveType: data.driveType,
        fuelType: data.fuelType,
        maxSpeed: data.maxSpeed,
        cruiseSpeed: data.cruiseSpeed,
        fuelCapacity: data.fuelCapacity,
        range: data.range,
        beam: data.beam,
        draft: data.draft,
        currency: data.currency,
        price: data.price,
        charterPricePerWeek: data.charterPricePerWeek,
        charterPricePerSeasonWinter: data.charterPricePerSeasonWinter,
        charterPricePerSeasonSummer: data.charterPricePerSeasonSummer,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        highlightsEn: data.highlightsEn,
        highlightsAr: data.highlightsAr,
        charterRoutes: data.charterRoutes,
        priority: data.priority,
      },
    })

    return NextResponse.json({ yacht }, { status: 201 })
  } catch (error) {
    console.error('Error creating yacht:', error)
    return NextResponse.json(
      { error: 'Failed to create yacht' },
      { status: 500 }
    )
  }
}
