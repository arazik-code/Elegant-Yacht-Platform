import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const [
            totalYachts,
            featuredYachts,
            saleYachts,
            charterYachts,
            soldYachts,
            totalInquiries,
            newInquiries,
            recentInquiries,
        ] = await Promise.all([
            prisma.yacht.count(),
            prisma.yacht.count({ where: { featured: true } }),
            prisma.yacht.count({ where: { type: 'SALE' } }),
            prisma.yacht.count({ where: { type: 'CHARTER' } }),
            prisma.yacht.count({ where: { status: 'SOLD' } }),
            prisma.inquiry.count(),
            prisma.inquiry.count({ where: { status: 'NEW' } }),
            prisma.inquiry.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    yacht: {
                        select: { title: true, slug: true },
                    },
                },
            }),
        ])

        return NextResponse.json({
            totalYachts,
            featuredYachts,
            saleYachts,
            charterYachts,
            soldYachts,
            totalInquiries,
            newInquiries,
            recentInquiries,
        })
    } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        )
    }
}
