// Owner Data Export API
// Export all data for a specific yacht owner

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: yachtId } = await params
        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'csv'

        // Get yacht details
        const yacht = await prisma.yacht.findUnique({
            where: { id: yachtId },
            include: {
                media: { select: { url: true, type: true } },
                inquiries: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        outcome: true,
                        createdAt: true,
                        dealValue: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!yacht) {
            return NextResponse.json({ error: 'Yacht not found' }, { status: 404 })
        }

        // Get analytics
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const [views, allTimeViews] = await Promise.all([
            prisma.analyticsEvent.count({
                where: { yachtId, eventType: 'yacht_view', createdAt: { gte: thirtyDaysAgo } },
            }),
            prisma.analyticsEvent.count({
                where: { yachtId, eventType: 'yacht_view' },
            }),
        ])

        // Calculate days on market
        const daysOnMarket = Math.floor(
            (Date.now() - new Date(yacht.createdAt).getTime()) / (24 * 60 * 60 * 1000)
        )

        // Build export data
        const reportData = {
            yacht: {
                title: yacht.title,
                type: yacht.type,
                status: yacht.status,
                price: yacht.price,
                currency: yacht.currency,
                listedDate: yacht.createdAt,
                daysOnMarket,
            },
            performance: {
                viewsLast30Days: views,
                totalViews: allTimeViews,
                totalInquiries: yacht.inquiries.length,
                conversionRate: allTimeViews > 0
                    ? ((yacht.inquiries.length / allTimeViews) * 100).toFixed(2) + '%'
                    : '0%',
            },
            inquiries: yacht.inquiries.map(inq => ({
                date: inq.createdAt,
                name: inq.name,
                email: inq.email,
                phone: inq.phone,
                status: inq.status,
                outcome: inq.outcome || 'PENDING',
                dealValue: inq.dealValue,
            })),
            exportedAt: new Date().toISOString(),
        }

        if (format === 'json') {
            return NextResponse.json(reportData)
        }

        // CSV format
        const csvLines: string[] = []

        // Yacht info section
        csvLines.push('YACHT REPORT')
        csvLines.push('')
        csvLines.push('Yacht Information')
        csvLines.push(`Title,${yacht.title}`)
        csvLines.push(`Type,${yacht.type}`)
        csvLines.push(`Status,${yacht.status}`)
        csvLines.push(`Price,${yacht.price ? `${yacht.price} ${yacht.currency}` : 'On Request'}`)
        csvLines.push(`Listed Date,${new Date(yacht.createdAt).toLocaleDateString()}`)
        csvLines.push(`Days on Market,${daysOnMarket}`)
        csvLines.push('')

        // Performance section
        csvLines.push('Performance (Last 30 Days)')
        csvLines.push(`Views,${views}`)
        csvLines.push(`Total Views (All Time),${allTimeViews}`)
        csvLines.push(`Inquiries,${yacht.inquiries.length}`)
        csvLines.push(`Conversion Rate,${reportData.performance.conversionRate}`)
        csvLines.push('')

        // Inquiries section
        csvLines.push('Inquiries')
        csvLines.push('Date,Name,Email,Phone,Status,Outcome,Deal Value')
        yacht.inquiries.forEach(inq => {
            csvLines.push([
                new Date(inq.createdAt).toLocaleDateString(),
                `"${inq.name}"`,
                inq.email || '',
                inq.phone || '',
                inq.status,
                inq.outcome || 'PENDING',
                inq.dealValue || '',
            ].join(','))
        })

        const csv = csvLines.join('\n')

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="yacht-report-${yacht.slug || yacht.id}.csv"`,
            },
        })
    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json(
            { error: 'Failed to generate export' },
            { status: 500 }
        )
    }
}
