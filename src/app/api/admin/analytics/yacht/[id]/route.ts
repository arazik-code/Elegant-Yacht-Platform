// Yacht-specific analytics API endpoint
// GET /api/admin/analytics/yacht/[id] - Get stats for a specific yacht

import { NextRequest, NextResponse } from 'next/server'
import { getYachtStats } from '@/lib/analytics-server'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: yachtId } = await params

        if (!yachtId) {
            return NextResponse.json(
                { error: 'Yacht ID is required' },
                { status: 400 }
            )
        }

        const { searchParams } = new URL(request.url)
        const startDateParam = searchParams.get('startDate')
        const endDateParam = searchParams.get('endDate')

        const startDate = startDateParam ? new Date(startDateParam) : undefined
        const endDate = endDateParam ? new Date(endDateParam) : undefined

        const stats = await getYachtStats(yachtId, startDate, endDate)

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Yacht analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to get yacht analytics' },
            { status: 500 }
        )
    }
}
