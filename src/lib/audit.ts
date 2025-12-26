// Audit Logging Service
// Tracks all admin actions for compliance and debugging

import { headers } from 'next/headers'
import prisma from '@/lib/db'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'BULK_UPDATE'
  | 'BULK_DELETE'
  | 'IMPORT'
  | 'EXPORT'
  | 'STATUS_CHANGE'
  | 'ASSIGN'
  | 'SETTINGS_UPDATE'

export type EntityType =
  | 'Yacht'
  | 'Inquiry'
  | 'Admin'
  | 'SiteSettings'
  | 'BlogPost'
  | 'Media'

interface AuditLogInput {
  action: AuditAction
  entityType: EntityType
  entityId?: string
  entityName?: string
  changes?: Record<string, { before: any; after: any }>
  metadata?: Record<string, any>
  adminId?: string
  adminEmail?: string
  adminName?: string | null
  clerkId?: string
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                      headersList.get('x-real-ip') ||
                      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        changes: input.changes || undefined,
        metadata: input.metadata || undefined,
        adminId: input.adminId,
        adminEmail: input.adminEmail,
        adminName: input.adminName,
        clerkId: input.clerkId,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    // Don't let audit logging errors break the main flow
    console.error('Audit log error:', error)
  }
}

/**
 * Get changes between two objects
 */
export function getChanges(
  before: Record<string, any>,
  after: Record<string, any>,
  includeFields?: string[]
): Record<string, { before: any; after: any }> {
  const changes: Record<string, { before: any; after: any }> = {}
  
  const fields = includeFields || Object.keys({ ...before, ...after })
  
  for (const field of fields) {
    const beforeVal = before[field]
    const afterVal = after[field]
    
    // Skip undefined values
    if (afterVal === undefined) continue
    
    // Compare values
    const beforeStr = JSON.stringify(beforeVal)
    const afterStr = JSON.stringify(afterVal)
    
    if (beforeStr !== afterStr) {
      changes[field] = { before: beforeVal, after: afterVal }
    }
  }
  
  return changes
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(options: {
  entityType?: EntityType
  entityId?: string
  adminId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  const where: any = {}
  
  if (options.entityType) where.entityType = options.entityType
  if (options.entityId) where.entityId = options.entityId
  if (options.adminId) where.adminId = options.adminId
  if (options.action) where.action = options.action
  
  if (options.startDate || options.endDate) {
    where.createdAt = {}
    if (options.startDate) where.createdAt.gte = options.startDate
    if (options.endDate) where.createdAt.lte = options.endDate
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ])
  
  return { logs, total }
}

/**
 * Get activity summary for dashboard
 */
export async function getActivitySummary(days: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  const logs = await prisma.auditLog.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      action: true,
      entityType: true,
      adminEmail: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  
  // Group by day
  const byDay: Record<string, number> = {}
  const byAction: Record<string, number> = {}
  const byAdmin: Record<string, number> = {}
  
  for (const log of logs) {
    const day = log.createdAt.toISOString().split('T')[0]
    byDay[day] = (byDay[day] || 0) + 1
    byAction[log.action] = (byAction[log.action] || 0) + 1
    if (log.adminEmail) {
      byAdmin[log.adminEmail] = (byAdmin[log.adminEmail] || 0) + 1
    }
  }
  
  return {
    total: logs.length,
    byDay,
    byAction,
    byAdmin,
    recentLogs: logs.slice(0, 10),
  }
}
