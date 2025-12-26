// Admin Audit Logs API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAuditLogs, getActivitySummary, EntityType, AuditAction } from '@/lib/audit'

// GET /api/admin/audit-logs - Get audit logs
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view')
    
    // Summary view for dashboard
    if (view === 'summary') {
      const days = parseInt(searchParams.get('days') || '7')
      const summary = await getActivitySummary(days)
      return NextResponse.json(summary)
    }
    
    // Full logs view
    const options: any = {}
    
    if (searchParams.get('entityType')) {
      options.entityType = searchParams.get('entityType') as EntityType
    }
    if (searchParams.get('entityId')) {
      options.entityId = searchParams.get('entityId')
    }
    if (searchParams.get('adminId')) {
      options.adminId = searchParams.get('adminId')
    }
    if (searchParams.get('action')) {
      options.action = searchParams.get('action') as AuditAction
    }
    if (searchParams.get('startDate')) {
      options.startDate = new Date(searchParams.get('startDate')!)
    }
    if (searchParams.get('endDate')) {
      options.endDate = new Date(searchParams.get('endDate')!)
    }
    
    options.limit = parseInt(searchParams.get('limit') || '50')
    options.offset = parseInt(searchParams.get('offset') || '0')
    
    const result = await getAuditLogs(options)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Audit logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
