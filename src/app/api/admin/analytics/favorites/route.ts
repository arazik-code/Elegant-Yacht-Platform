// Favorites Analytics API
// Returns analytics about most favorited yachts for admin dashboard

import { NextResponse } from 'next/server'
import { getFavoritesAnalytics } from '@/lib/analytics-server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        // Parse date range (default to last 30 days)
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const startDate = searchParams.get('startDate')
            ? new Date(searchParams.get('startDate')!)
            : thirtyDaysAgo
        const endDate = searchParams.get('endDate')
            ? new Date(searchParams.get('endDate')!)
            : now

        const data = await getFavoritesAnalytics(startDate, endDate)

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching favorites analytics:', error)
        return NextResponse.json(
            { error: 'Failed to fetch favorites analytics' },
            { status: 500 }
        )
    }
}
