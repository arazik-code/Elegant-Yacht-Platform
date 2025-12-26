// Admin Single Yacht API - GET, PUT, DELETE

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { yachtSchema } from '@/lib/validations'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/admin/yachts/[id] - Get single yacht
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const yacht = await prisma.yacht.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        inquiries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!yacht) {
      return NextResponse.json({ error: 'Yacht not found' }, { status: 404 })
    }

    return NextResponse.json({ yacht })
  } catch (error) {
    console.error('Error fetching yacht:', error)
    return NextResponse.json(
      { error: 'Failed to fetch yacht' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/yachts/[id] - Update yacht
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

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

    // Check if yacht exists
    const existingYacht = await prisma.yacht.findUnique({
      where: { id },
    })

    if (!existingYacht) {
      return NextResponse.json({ error: 'Yacht not found' }, { status: 404 })
    }

    // Check if slug is unique (if changed)
    if (data.slug !== existingYacht.slug) {
      const slugExists = await prisma.yacht.findUnique({
        where: { slug: data.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A yacht with this URL slug already exists' },
          { status: 400 }
        )
      }
    }

    // Update yacht
    const yacht = await prisma.yacht.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        type: data.type,
        status: data.status,
        featured: data.featured,
        showPrice: data.showPrice,
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
        priceOnRequest: data.priceOnRequest,
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

    return NextResponse.json({ yacht })
  } catch (error) {
    console.error('Error updating yacht:', error)
    return NextResponse.json(
      { error: 'Failed to update yacht' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/yachts/[id] - Delete yacht
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth()
    const { id } = await context.params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if yacht exists
    const existingYacht = await prisma.yacht.findUnique({
      where: { id },
    })

    if (!existingYacht) {
      return NextResponse.json({ error: 'Yacht not found' }, { status: 404 })
    }

    // Delete yacht (cascades to media and inquiries via Prisma)
    await prisma.yacht.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting yacht:', error)
    return NextResponse.json(
      { error: 'Failed to delete yacht' },
      { status: 500 }
    )
  }
}
