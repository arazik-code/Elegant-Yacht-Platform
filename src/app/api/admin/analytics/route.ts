// Analytics API - Track events and retrieve analytics data

import { NextRequest, NextResponse } from 'next/server'
import {
  trackEvent,
  getAnalyticsSummary,
  getRealTimeStats,
  getConversionFunnel,
  getFilterUsageStats,
  getComparisonStats,
  type TrackEventData,
} from '@/lib/analytics-server'

// POST /api/admin/analytics - Track an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TrackEventData

    // Add request metadata
    const enhancedData: TrackEventData = {
      ...body,
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        undefined,
    }

    await trackEvent(enhancedData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

// GET /api/admin/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'summary'
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    // Default to last 30 days
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (action) {
      case 'summary':
        const summary = await getAnalyticsSummary(startDate, endDate)
        return NextResponse.json(summary)

      case 'realtime':
        const realtime = await getRealTimeStats()
        return NextResponse.json(realtime)

      case 'funnel':
        const funnel = await getConversionFunnel(startDate, endDate)
        return NextResponse.json(funnel)

      case 'filters':
        const filters = await getFilterUsageStats(startDate, endDate)
        return NextResponse.json(filters)

      case 'comparison':
        const comparison = await getComparisonStats(startDate, endDate)
        return NextResponse.json(comparison)

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}
