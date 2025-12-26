// Owner Monthly Performance Report API
// Generates and sends performance email to yacht owners

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface YachtReport {
    id: string
    title: string
    ownerEmail: string
    views: number
    inquiries: number
    daysOnMarket: number
    avgViews: number
    performanceStatus: string
}

// Get report data for all yachts
async function generateOwnerReports(): Promise<YachtReport[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const now = new Date()

    // Get all available yachts
    const yachts = await prisma.yacht.findMany({
        where: { status: 'AVAILABLE' },
        select: {
            id: true,
            title: true,
            type: true,
            price: true,
            createdAt: true,
        },
    })

    if (yachts.length === 0) return []

    // Get views for each yacht
    const viewsData = await prisma.analyticsEvent.groupBy({
        by: ['yachtId'],
        where: {
            yachtId: { in: yachts.map(y => y.id) },
            eventType: 'yacht_view',
            createdAt: { gte: thirtyDaysAgo },
        },
        _count: { yachtId: true },
    })

    // Get inquiries for each yacht
    const inquiriesData = await prisma.inquiry.groupBy({
        by: ['yachtId'],
        where: {
            yachtId: { in: yachts.map(y => y.id) },
            createdAt: { gte: thirtyDaysAgo },
        },
        _count: { yachtId: true },
    })

    // Build views map
    const viewsMap = new Map<string, number>()
    viewsData.forEach(v => {
        if (v.yachtId) viewsMap.set(v.yachtId, v._count.yachtId)
    })

    // Build inquiries map
    const inquiriesMap = new Map<string, number>()
    inquiriesData.forEach(i => {
        if (i.yachtId) inquiriesMap.set(i.yachtId, i._count.yachtId)
    })

    // Calculate average views
    const totalViews = Array.from(viewsMap.values()).reduce((a, b) => a + b, 0)
    const avgViews = yachts.length > 0 ? Math.round(totalViews / yachts.length) : 0

    // Generate reports
    const reports: YachtReport[] = yachts.map(yacht => {
        const views = viewsMap.get(yacht.id) || 0
        const inquiries = inquiriesMap.get(yacht.id) || 0
        const daysOnMarket = Math.floor(
            (now.getTime() - yacht.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        )

        // Calculate performance status
        let performanceStatus = 'Average'
        if (views > avgViews * 1.5) performanceStatus = 'Excellent'
        else if (views > avgViews) performanceStatus = 'Good'
        else if (views < avgViews * 0.5) performanceStatus = 'Needs Attention'

        return {
            id: yacht.id,
            title: yacht.title,
            ownerEmail: '', // Would need owner email field in yacht model
            views,
            inquiries,
            daysOnMarket,
            avgViews,
            performanceStatus,
        }
    })

    return reports
}

// Generate HTML email for owner report
function generateOwnerReportEmail(report: YachtReport): string {
    const statusColors: Record<string, string> = {
        'Excellent': '#22c55e',
        'Good': '#3b82f6',
        'Average': '#eab308',
        'Needs Attention': '#ef4444',
    }

    const statusColor = statusColors[report.performanceStatus] || '#888'
    const viewsDiff = report.avgViews > 0
        ? Math.round(((report.views - report.avgViews) / report.avgViews) * 100)
        : 0
    const viewsSign = viewsDiff >= 0 ? '+' : ''

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a;">
    <!-- Header -->
    <tr>
      <td style="padding: 32px; text-align: center; border-bottom: 1px solid #333;">
        <h1 style="margin: 0; color: #d4af37; font-size: 24px;">Monthly Performance Report</h1>
        <p style="margin: 8px 0 0; color: #888; font-size: 14px;">${report.title}</p>
      </td>
    </tr>
    
    <!-- Performance Status -->
    <tr>
      <td style="padding: 24px 32px; text-align: center;">
        <p style="margin: 0 0 8px; color: #888; font-size: 12px;">PERFORMANCE STATUS</p>
        <p style="margin: 0; color: ${statusColor}; font-size: 28px; font-weight: bold;">
          ${report.performanceStatus}
        </p>
      </td>
    </tr>
    
    <!-- Stats Grid -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="50%" style="padding: 16px; background-color: #252525; text-align: center;">
              <p style="margin: 0; color: #888; font-size: 12px;">VIEWS</p>
              <p style="margin: 8px 0 0; color: #fff; font-size: 32px; font-weight: bold;">${report.views}</p>
              <p style="margin: 4px 0 0; color: ${viewsDiff >= 0 ? '#22c55e' : '#ef4444'}; font-size: 12px;">
                ${viewsSign}${viewsDiff}% vs avg
              </p>
            </td>
            <td width="50%" style="padding: 16px; background-color: #252525; text-align: center; border-left: 1px solid #333;">
              <p style="margin: 0; color: #888; font-size: 12px;">INQUIRIES</p>
              <p style="margin: 8px 0 0; color: #d4af37; font-size: 32px; font-weight: bold;">${report.inquiries}</p>
              <p style="margin: 4px 0 0; color: #888; font-size: 12px;">this month</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Days on Market -->
    <tr>
      <td style="padding: 0 32px 24px;">
        <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #252525;">
          <tr>
            <td style="padding: 16px; text-align: center;">
              <p style="margin: 0; color: #888; font-size: 12px;">DAYS ON MARKET</p>
              <p style="margin: 8px 0 0; color: #fff; font-size: 24px; font-weight: bold;">${report.daysOnMarket}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Summary -->
    <tr>
      <td style="padding: 0 32px 32px;">
        <p style="margin: 0; color: #888; font-size: 14px; line-height: 1.6;">
          Your yacht received <strong style="color: #fff;">${report.views} views</strong> 
          and <strong style="color: #d4af37;">${report.inquiries} inquiries</strong> 
          this month. ${report.performanceStatus === 'Excellent' || report.performanceStatus === 'Good'
            ? 'Great performance!'
            : 'Contact us for promotional options.'}
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #333;">
        <p style="margin: 0; color: #888; font-size: 12px;">
          Bimo Yacht • Premium Yacht Brokerage
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const yachtId = searchParams.get('yachtId')
        const preview = searchParams.get('preview') === 'true'

        // Generate reports
        const reports = await generateOwnerReports()

        // If specific yacht requested
        if (yachtId) {
            const report = reports.find(r => r.id === yachtId)
            if (!report) {
                return NextResponse.json({ error: 'Yacht not found' }, { status: 404 })
            }

            if (preview) {
                // Return HTML preview
                const html = generateOwnerReportEmail(report)
                return new NextResponse(html, {
                    headers: { 'Content-Type': 'text/html' },
                })
            }

            return NextResponse.json({ report })
        }

        // Return all reports summary
        return NextResponse.json({
            totalYachts: reports.length,
            reports: reports.map(r => ({
                id: r.id,
                title: r.title,
                views: r.views,
                inquiries: r.inquiries,
                status: r.performanceStatus,
            })),
        })
    } catch (error) {
        console.error('Owner report error:', error)
        return NextResponse.json(
            { error: 'Failed to generate reports' },
            { status: 500 }
        )
    }
}

// POST to send reports
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { yachtId, email } = body

        if (!yachtId || !email) {
            return NextResponse.json(
                { error: 'yachtId and email are required' },
                { status: 400 }
            )
        }

        // Generate report
        const reports = await generateOwnerReports()
        const report = reports.find(r => r.id === yachtId)

        if (!report) {
            return NextResponse.json({ error: 'Yacht not found' }, { status: 404 })
        }

        // Generate email HTML
        const html = generateOwnerReportEmail(report)

        // TODO: Send email using Resend
        // For now, return success with preview
        return NextResponse.json({
            success: true,
            message: 'Report generated (email sending not configured)',
            report: {
                title: report.title,
                views: report.views,
                inquiries: report.inquiries,
                status: report.performanceStatus,
            },
        })
    } catch (error) {
        console.error('Send report error:', error)
        return NextResponse.json(
            { error: 'Failed to send report' },
            { status: 500 }
        )
    }
}
