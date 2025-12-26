// Owner Yacht Insights API Endpoint
// Returns performance metrics for yacht owners

import { NextRequest, NextResponse } from 'next/server'
import { getOwnerYachtInsights } from '@/lib/analytics-server'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Yacht ID is required' },
                { status: 400 }
            )
        }

        const insights = await getOwnerYachtInsights(id)

        if (!insights) {
            return NextResponse.json(
                { success: false, message: 'Yacht not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: insights,
        })
    } catch (error) {
        console.error('Owner insights error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to get yacht insights' },
            { status: 500 }
        )
    }
}
