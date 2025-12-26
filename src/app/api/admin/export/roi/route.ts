// ROI Analytics Export API
// Export with deal outcomes for ROI tracking

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('start')
        const endDate = searchParams.get('end')
        const format = searchParams.get('format') || 'csv'

        // Build date filter
        const dateFilter: Record<string, unknown> = {}
        if (startDate) {
            dateFilter.createdAt = { ...(dateFilter.createdAt as object || {}), gte: new Date(startDate) }
        }
        if (endDate) {
            dateFilter.createdAt = { ...(dateFilter.createdAt as object || {}), lte: new Date(endDate) }
        }

        // Get all inquiries with outcomes
        const inquiries = await prisma.inquiry.findMany({
            where: dateFilter,
            include: {
                yacht: { select: { title: true, type: true, price: true, currency: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        // Calculate ROI metrics
        const wonDeals = inquiries.filter(inq => inq.outcome === 'WON')
        const lostDeals = inquiries.filter(inq => inq.outcome === 'LOST')
        const inProgress = inquiries.filter(inq => inq.outcome === 'IN_PROGRESS')
        const pending = inquiries.filter(inq => !inq.outcome)

        const totalDealValue = wonDeals.reduce((sum, inq) => sum + (inq.dealValue || 0), 0)
        const winRate = inquiries.length > 0
            ? ((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100).toFixed(1)
            : '0'

        if (format === 'json') {
            return NextResponse.json({
                summary: {
                    totalInquiries: inquiries.length,
                    won: wonDeals.length,
                    lost: lostDeals.length,
                    inProgress: inProgress.length,
                    pending: pending.length,
                    winRate: `${winRate}%`,
                    totalDealValue,
                },
                inquiries: inquiries.map(inq => ({
                    id: inq.id,
                    date: inq.createdAt,
                    name: inq.name,
                    yacht: inq.yacht?.title || 'General',
                    status: inq.status,
                    outcome: inq.outcome || 'PENDING',
                    dealValue: inq.dealValue,
                    source: inq.source,
                })),
            })
        }

        // CSV format
        const csvLines: string[] = []

        // Summary
        csvLines.push('ROI REPORT')
        csvLines.push('')
        csvLines.push('Summary')
        csvLines.push(`Total Inquiries,${inquiries.length}`)
        csvLines.push(`Won Deals,${wonDeals.length}`)
        csvLines.push(`Lost Deals,${lostDeals.length}`)
        csvLines.push(`In Progress,${inProgress.length}`)
        csvLines.push(`Pending,${pending.length}`)
        csvLines.push(`Win Rate,${winRate}%`)
        csvLines.push(`Total Deal Value,${totalDealValue.toLocaleString()} AED`)
        csvLines.push('')

        // Inquiries detail
        csvLines.push('Inquiry Details')
        csvLines.push('Date,Name,Email,Phone,Yacht,Type,Status,Outcome,Deal Value,Source')
        inquiries.forEach(inq => {
            csvLines.push([
                new Date(inq.createdAt).toLocaleDateString(),
                `"${inq.name}"`,
                inq.email || '',
                inq.phone || '',
                `"${inq.yacht?.title || 'General'}"`,
                inq.yacht?.type || '',
                inq.status,
                inq.outcome || 'PENDING',
                inq.dealValue || '',
                inq.source || '',
            ].join(','))
        })

        const csv = csvLines.join('\n')

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="roi-report-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        })
    } catch (error) {
        console.error('ROI export error:', error)
        return NextResponse.json(
            { error: 'Failed to generate ROI report' },
            { status: 500 }
        )
    }
}
