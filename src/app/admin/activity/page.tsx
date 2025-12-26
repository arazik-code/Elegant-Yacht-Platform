'use client'

// Admin Activity/Audit Logs Page
// View system activity and audit trail

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  adminEmail?: string
  adminName?: string
  changes?: Record<string, { before: any; after: any }>
  metadata?: Record<string, any>
  createdAt: string
}

interface ActivitySummary {
  total: number
  byDay: Record<string, number>
  byAction: Record<string, number>
  byAdmin: Record<string, number>
  recentLogs: any[]
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [summary, setSummary] = useState<ActivitySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'summary' | 'logs'>('summary')
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
  })
  
  // Fetch summary
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/admin/audit-logs?view=summary&days=7')
        if (res.ok) {
          const data = await res.json()
          setSummary(data)
        }
      } catch (error) {
        console.error('Failed to fetch summary:', error)
      }
    }
    
    fetchSummary()
  }, [])
  
  // Fetch logs
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.entityType) params.set('entityType', filters.entityType)
        if (filters.action) params.set('action', filters.action)
        
        const res = await fetch(`/api/admin/audit-logs?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setLogs(data.logs)
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLogs()
  }, [filters])
  
  const actionColors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    PUBLISH: 'bg-purple-100 text-purple-700',
    ARCHIVE: 'bg-gray-100 text-gray-700',
    BULK_UPDATE: 'bg-amber-100 text-amber-700',
    BULK_DELETE: 'bg-red-100 text-red-700',
    IMPORT: 'bg-cyan-100 text-cyan-700',
    EXPORT: 'bg-indigo-100 text-indigo-700',
    LOGIN: 'bg-emerald-100 text-emerald-700',
  }
  
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-jet">Activity Log</h1>
        <p className="text-gray-600 mt-1">Monitor system activity and audit trail</p>
      </div>
      
      {/* View Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setView('summary')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'summary'
              ? 'bg-gold text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setView('logs')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'logs'
              ? 'bg-gold text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Logs
        </button>
      </div>
      
      {/* Summary View */}
      {view === 'summary' && summary && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Actions (7 days)</p>
              <p className="text-3xl font-bold text-jet mt-1">{summary.total}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Active Admins</p>
              <p className="text-3xl font-bold text-jet mt-1">
                {Object.keys(summary.byAdmin).length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Most Common Action</p>
              <p className="text-xl font-bold text-jet mt-1">
                {Object.entries(summary.byAction)
                  .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Today's Actions</p>
              <p className="text-3xl font-bold text-jet mt-1">
                {summary.byDay[new Date().toISOString().split('T')[0]] || 0}
              </p>
            </div>
          </div>
          
          {/* Activity by Action */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-jet mb-4">Activity by Type</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(summary.byAction).map(([action, count]) => (
                <div
                  key={action}
                  className={`px-4 py-2 rounded-lg ${actionColors[action] || 'bg-gray-100 text-gray-700'}`}
                >
                  <span className="font-medium">{action}</span>
                  <span className="ml-2 text-sm opacity-70">({count})</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-jet mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {summary.recentLogs.map((log: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0"
                >
                  <span className={`px-2 py-1 text-xs rounded-full ${actionColors[log.action] || 'bg-gray-100'}`}>
                    {log.action}
                  </span>
                  <span className="text-gray-600">{log.entityType}</span>
                  <span className="text-sm text-gray-400 ml-auto">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Full Logs View */}
      {view === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <select
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold/20 focus:border-gold"
            >
              <option value="">All Entity Types</option>
              <option value="Yacht">Yacht</option>
              <option value="Inquiry">Inquiry</option>
              <option value="Admin">Admin</option>
              <option value="SiteSettings">Settings</option>
              <option value="BlogPost">Blog</option>
            </select>
            
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold/20 focus:border-gold"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="PUBLISH">Publish</option>
              <option value="ARCHIVE">Archive</option>
              <option value="BULK_UPDATE">Bulk Update</option>
              <option value="IMPORT">Import</option>
              <option value="EXPORT">Export</option>
            </select>
          </div>
          
          {/* Logs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No activity logs found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Entity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Admin
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${actionColors[log.action] || 'bg-gray-100'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-jet">{log.entityType}</p>
                            {log.entityName && (
                              <p className="text-sm text-gray-500">{log.entityName}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {log.adminName || log.adminEmail || 'System'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <details className="text-sm">
                              <summary className="cursor-pointer text-blue-600 hover:underline">
                                {Object.keys(log.changes).length} field(s) changed
                              </summary>
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                {Object.entries(log.changes).map(([field, values]) => (
                                  <div key={field} className="mb-1">
                                    <span className="font-medium">{field}:</span>{' '}
                                    <span className="text-red-600 line-through">
                                      {JSON.stringify(values.before).substring(0, 30)}
                                    </span>{' '}
                                    →{' '}
                                    <span className="text-green-600">
                                      {JSON.stringify(values.after).substring(0, 30)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                          {log.metadata && (
                            <span className="text-xs text-gray-400">
                              {JSON.stringify(log.metadata).substring(0, 50)}...
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
