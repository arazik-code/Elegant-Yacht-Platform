// Admin Featured Listings Management API
// Toggle featured status and update priority

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        // Get all yachts with featured info
        const yachts = await prisma.yacht.findMany({
            where: { status: 'AVAILABLE' },
            select: {
                id: true,
                title: true,
                slug: true,
                type: true,
                featured: true,
                priority: true,
                price: true,
                currency: true,
                lengthFeet: true,
                brand: true,
                year: true,
                createdAt: true,
                media: {
                    where: { isCover: true },
                    select: { url: true },
                    take: 1,
                },
            },
            orderBy: [
                { featured: 'desc' },
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        })

        return NextResponse.json({
            success: true,
            yachts: yachts.map(y => ({
                ...y,
                coverImage: y.media[0]?.url || null,
            })),
        })
    } catch (error) {
        console.error('Featured API error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to fetch yachts' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { yachtId, featured, priority } = body

        if (!yachtId) {
            return NextResponse.json(
                { success: false, message: 'Yacht ID is required' },
                { status: 400 }
            )
        }

        const updateData: { featured?: boolean; priority?: number } = {}

        if (typeof featured === 'boolean') {
            updateData.featured = featured
        }
        if (typeof priority === 'number') {
            updateData.priority = priority
        }

        const updated = await prisma.yacht.update({
            where: { id: yachtId },
            data: updateData,
            select: {
                id: true,
                title: true,
                featured: true,
                priority: true,
            },
        })

        return NextResponse.json({
            success: true,
            yacht: updated,
        })
    } catch (error) {
        console.error('Featured update error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update yacht' },
            { status: 500 }
        )
    }
}
