// Analytics CSV Export API
// GET /api/admin/analytics/export - Export analytics data as CSV

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'inquiries'
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')

        // Default to last 30 days
        const endDate = endDateParam ? new Date(endDateParam) : new Date()
        const startDate = startDateParam
            ? new Date(startDateParam)
            : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

        const dateFilter = { createdAt: { gte: startDate, lte: endDate } }

        let csv = ''
        let filename = ''

        switch (type) {
            case 'inquiries': {
                const inquiries = await prisma.inquiry.findMany({
                    where: dateFilter,
                    include: {
                        yacht: { select: { title: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                })

                // CSV Header
                csv = 'Date,Name,Email,Phone,Source,Status,Yacht,Message\n'

                // CSV Rows
                for (const inq of inquiries) {
                    const date = inq.createdAt.toISOString().split('T')[0]
                    const name = inq.name.replace(/,/g, ' ')
                    const email = inq.email || ''
                    const phone = inq.phone.replace(/,/g, ' ')
                    const source = inq.source
                    const status = inq.status
                    const yacht = inq.yacht?.title?.replace(/,/g, ' ') || ''
                    const message = (inq.message || '').replace(/,/g, ' ').replace(/\n/g, ' ').substring(0, 100)

                    csv += `${date},"${name}","${email}","${phone}",${source},${status},"${yacht}","${message}"\n`
                }

                filename = `inquiries_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`
                break
            }

            case 'yacht-performance': {
                const yachts = await prisma.yacht.findMany({
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true,
                        price: true,
                        _count: {
                            select: { inquiries: true },
                        },
                    },
                })

                // Get view counts for each yacht
                const viewsData = await prisma.analyticsEvent.groupBy({
                    by: ['yachtId'],
                    where: {
                        eventType: 'yacht_view',
                        ...dateFilter,
                    },
                    _count: { yachtId: true },
                })

                const viewsMap = new Map(viewsData.map((v) => [v.yachtId, v._count.yachtId]))

                // CSV Header
                csv = 'Yacht,Type,Status,Price,Views (30d),Inquiries,Conversion Rate\n'

                // CSV Rows
                for (const yacht of yachts) {
                    const views = viewsMap.get(yacht.id) || 0
                    const inquiries = yacht._count.inquiries
                    const convRate = views > 0 ? ((inquiries / views) * 100).toFixed(2) : '0.00'
                    const price = yacht.price ? `AED ${yacht.price.toLocaleString()}` : 'POA'

                    csv += `"${yacht.title}",${yacht.type},${yacht.status},"${price}",${views},${inquiries},${convRate}%\n`
                }

                filename = `yacht_performance_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`
                break
            }

            case 'sources': {
                const sourceData = await prisma.inquiry.groupBy({
                    by: ['source'],
                    where: dateFilter,
                    _count: { source: true },
                })

                // CSV Header
                csv = 'Source,Inquiries,Percentage\n'

                const total = sourceData.reduce((acc, s) => acc + s._count.source, 0)

                // CSV Rows
                for (const source of sourceData) {
                    const pct = total > 0 ? ((source._count.source / total) * 100).toFixed(2) : '0.00'
                    csv += `${source.source},${source._count.source},${pct}%\n`
                }

                filename = `source_breakdown_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`
                break
            }

            case 'daily-events': {
                const events = await prisma.analyticsEvent.findMany({
                    where: dateFilter,
                    select: {
                        eventType: true,
                        createdAt: true,
                    },
                })

                // Group by day and event type
                const dailyMap = new Map<string, Map<string, number>>()

                for (const event of events) {
                    const date = event.createdAt.toISOString().split('T')[0]
                    if (!dailyMap.has(date)) {
                        dailyMap.set(date, new Map())
                    }
                    const dayMap = dailyMap.get(date)!
                    dayMap.set(event.eventType, (dayMap.get(event.eventType) || 0) + 1)
                }

                // CSV Header
                csv = 'Date,Page Views,Yacht Views,Inquiries,WhatsApp Clicks\n'

                // Sort dates and output
                const sortedDates = Array.from(dailyMap.keys()).sort()
                for (const date of sortedDates) {
                    const dayMap = dailyMap.get(date)!
                    const pageViews = dayMap.get('page_view') || 0
                    const yachtViews = dayMap.get('yacht_view') || 0
                    const inquiries = dayMap.get('inquiry_submit') || 0
                    const whatsapp = dayMap.get('whatsapp_click') || 0

                    csv += `${date},${pageViews},${yachtViews},${inquiries},${whatsapp}\n`
                }

                filename = `daily_events_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`
                break
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid export type. Use: inquiries, yacht-performance, sources, daily-events' },
                    { status: 400 }
                )
        }

        // Return CSV response
        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error('Analytics export error:', error)
        return NextResponse.json(
            { error: 'Failed to export analytics' },
            { status: 500 }
        )
    }
}
