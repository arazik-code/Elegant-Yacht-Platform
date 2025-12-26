// Admin Inquiries Page with Deal Closure & Sales Memory
// Shows outcome badges, notes, follow-up dates, and context intelligence

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Eye, Clock, Mail, Phone, Heart, Scale, Target,
  Calendar, ChevronDown, ChevronUp, Check, X, Loader2, DollarSign,
  AlertCircle, Bell
} from 'lucide-react'
import { AdminWhatsAppActions } from '@/components/admin/AdminWhatsAppActions'
import { cn } from '@/lib/utils'

interface InquiryContext {
  favorites?: string[]
  compareList?: string[]
  yachtsViewed?: { id: string; title: string; timeSpent: number }[]
  sessionDuration?: number
  totalTimeSpent?: number
}

interface Inquiry {
  id: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  status: string
  source: string | null
  context: InquiryContext | null
  notes: string | null
  outcome: string | null
  outcomeNotes: string | null
  outcomeDate: string | null
  followUpDate: string | null
  dealValue: number | null
  soldYachtId: string | null
  createdAt: string
  yacht: { id: string; title: string; slug: string } | null
}

// Calculate intent level from context
function calculateIntentLevel(context: InquiryContext | null): {
  level: 'HIGH' | 'MEDIUM' | 'LOW'
  score: number
  emoji: string
  color: string
} {
  if (!context) return { level: 'LOW', score: 20, emoji: '💤', color: 'bg-gray-500/20 text-gray-400' }

  let score = 20
  if (context.favorites && context.favorites.length > 0) score += 10
  if (context.compareList && context.compareList.length > 0) score += 15
  if (context.yachtsViewed && context.yachtsViewed.length > 1) {
    score += Math.min(context.yachtsViewed.length * 5, 25)
  }
  if (context.sessionDuration) {
    if (context.sessionDuration > 900) score += 20
    else if (context.sessionDuration > 300) score += 10
  }

  if (score >= 60) return { level: 'HIGH', score, emoji: '🔥', color: 'bg-red-500/20 text-red-400' }
  if (score >= 30) return { level: 'MEDIUM', score, emoji: '⚡', color: 'bg-yellow-500/20 text-yellow-400' }
  return { level: 'LOW', score, emoji: '💤', color: 'bg-gray-500/20 text-gray-400' }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  return `${mins}m`
}

const outcomeConfig = {
  WON: { label: 'Won', color: 'bg-green-500/20 text-green-400 border-green-500/30', emoji: '🟢' },
  LOST: { label: 'Lost', color: 'bg-red-500/20 text-red-400 border-red-500/30', emoji: '🔴' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', emoji: '🟡' },
}

const statusConfig = {
  NEW: 'bg-blue-500/20 text-blue-400',
  CONTACTED: 'bg-yellow-500/20 text-yellow-400',
  QUALIFIED: 'bg-purple-500/20 text-purple-400',
  CLOSED: 'bg-green-500/20 text-green-400',
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchInquiries = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter) params.set('filter', filter)
      const res = await fetch(`/api/admin/inquiries?${params}`)
      if (res.ok) {
        const data = await res.json()
        setInquiries(data.inquiries || [])
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  const updateInquiry = async (id: string, data: Record<string, unknown>) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const result = await res.json()
        setInquiries(inquiries.map(inq =>
          inq.id === id ? { ...inq, ...result.inquiry } : inq
        ))
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setUpdating(null)
    }
  }

  const filters = [
    { value: '', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'in-progress', label: '🟡 In Progress' },
    { value: 'won', label: '🟢 Won' },
    { value: 'lost', label: '🔴 Lost' },
    { value: 'follow-up', label: '🔔 Follow-up Due' },
  ]

  // Filter inquiries with follow-ups due today or overdue
  const today = new Date().toISOString().split('T')[0]
  const followUpDue = inquiries.filter(inq =>
    inq.followUpDate && inq.followUpDate.split('T')[0] <= today && !inq.outcome
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Inquiries</h1>
          <p className="text-white/60">{inquiries.length} total inquiries</p>
        </div>

        {/* Follow-up Alert */}
        {followUpDue.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">{followUpDue.length} follow-up(s) due</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-2 text-sm transition-colors',
              filter === f.value
                ? 'bg-gold text-jet'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const context = inquiry.context || {}
            const intent = calculateIntentLevel(context)
            const isExpanded = expandedId === inquiry.id
            const outcome = inquiry.outcome as keyof typeof outcomeConfig | null
            const followUpDueDate = inquiry.followUpDate ? new Date(inquiry.followUpDate) : null
            const isFollowUpDue = followUpDueDate && followUpDueDate <= new Date() && !inquiry.outcome

            return (
              <div
                key={inquiry.id}
                className={cn(
                  "bg-white/5 border border-white/10 hover:border-white/20 transition-colors",
                  isFollowUpDue && "border-orange-500/30"
                )}
              >
                {/* Main Row */}
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header with Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{inquiry.name}</h3>

                        {/* Status Badge */}
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium',
                          statusConfig[inquiry.status as keyof typeof statusConfig] || 'bg-white/10 text-white/50'
                        )}>
                          {inquiry.status}
                        </span>

                        {/* Outcome Badge */}
                        {outcome && outcomeConfig[outcome] && (
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium border rounded',
                            outcomeConfig[outcome].color
                          )}>
                            {outcomeConfig[outcome].emoji} {outcomeConfig[outcome].label}
                          </span>
                        )}

                        {/* Intent Badge */}
                        <span className={cn('px-2 py-0.5 text-xs font-medium flex items-center gap-1', intent.color)}>
                          <span>{intent.emoji}</span>
                          {intent.level}
                        </span>

                        {/* Follow-up Due Alert */}
                        {isFollowUpDue && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Follow-up due
                          </span>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-3">
                        {inquiry.email && (
                          <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 hover:text-gold">
                            <Mail className="w-4 h-4" /> {inquiry.email}
                          </a>
                        )}
                        {inquiry.phone && (
                          <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 hover:text-gold">
                            <Phone className="w-4 h-4" /> {inquiry.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Yacht Link */}
                      {inquiry.yacht && (
                        <Link
                          href={`/yachts/${inquiry.yacht.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sm text-gold hover:underline mb-2"
                        >
                          <Eye className="w-3 h-3" /> {inquiry.yacht.title}
                        </Link>
                      )}

                      {/* Deal Value */}
                      {inquiry.dealValue && (
                        <div className="flex items-center gap-2 text-green-400 text-sm mt-1">
                          <DollarSign className="w-4 h-4" />
                          Deal Value: {inquiry.dealValue.toLocaleString()} AED
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Outcome Buttons - Always visible for state changes */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateInquiry(inquiry.id, { outcome: outcome === 'WON' ? null : 'WON' })}
                          disabled={updating === inquiry.id}
                          className={cn(
                            'p-2 rounded transition-colors',
                            outcome === 'WON'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          )}
                          title={outcome === 'WON' ? 'Click to clear' : 'Mark as Won'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateInquiry(inquiry.id, { outcome: outcome === 'LOST' ? null : 'LOST' })}
                          disabled={updating === inquiry.id}
                          className={cn(
                            'p-2 rounded transition-colors',
                            outcome === 'LOST'
                              ? 'bg-red-500 text-white'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          )}
                          title={outcome === 'LOST' ? 'Click to clear' : 'Mark as Lost'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateInquiry(inquiry.id, { outcome: outcome === 'IN_PROGRESS' ? null : 'IN_PROGRESS' })}
                          disabled={updating === inquiry.id}
                          className={cn(
                            'p-2 rounded transition-colors',
                            outcome === 'IN_PROGRESS'
                              ? 'bg-yellow-500 text-jet'
                              : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          )}
                          title={outcome === 'IN_PROGRESS' ? 'Click to clear' : 'Mark as In Progress'}
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>

                      {inquiry.phone && (
                        <AdminWhatsAppActions
                          inquiryId={inquiry.id}
                          phone={inquiry.phone}
                          customerName={inquiry.name}
                          yachtTitle={inquiry.yacht?.title}
                        />
                      )}

                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-white/50 rounded"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-5 bg-navy/30 space-y-4">
                    {/* Message */}
                    {inquiry.message && (
                      <div>
                        <p className="text-white/50 text-xs mb-1">Message</p>
                        <p className="text-white/80 text-sm bg-white/5 p-3 rounded">{inquiry.message}</p>
                      </div>
                    )}

                    {/* Sales Memory Section */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Notes */}
                      <div>
                        <label className="text-white/50 text-xs mb-1 block">Private Notes</label>
                        <textarea
                          defaultValue={inquiry.notes || ''}
                          placeholder="Add sales notes..."
                          className="w-full bg-white/5 border border-white/10 rounded p-3 text-white text-sm resize-none h-24 focus:border-gold focus:outline-none"
                          onBlur={(e) => {
                            if (e.target.value !== inquiry.notes) {
                              updateInquiry(inquiry.id, { notes: e.target.value })
                            }
                          }}
                        />
                      </div>

                      {/* Follow-up Date */}
                      <div>
                        <label className="text-white/50 text-xs mb-1 block">Follow-up Date</label>
                        <input
                          type="date"
                          defaultValue={inquiry.followUpDate?.split('T')[0] || ''}
                          className="w-full bg-white/5 border border-white/10 rounded p-3 text-white text-sm focus:border-gold focus:outline-none"
                          onChange={(e) => updateInquiry(inquiry.id, { followUpDate: e.target.value || null })}
                        />

                        {/* Deal Value Input */}
                        <label className="text-white/50 text-xs mb-1 block mt-4">Deal Value (AED)</label>
                        <input
                          type="number"
                          defaultValue={inquiry.dealValue || ''}
                          placeholder="Enter deal value..."
                          className="w-full bg-white/5 border border-white/10 rounded p-3 text-white text-sm focus:border-gold focus:outline-none"
                          onBlur={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : null
                            if (value !== inquiry.dealValue) {
                              updateInquiry(inquiry.id, { dealValue: value })
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Context Intelligence */}
                    {Object.keys(context).length > 0 && (
                      <div className="p-4 bg-navy/50 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-gold" />
                          <span className="text-sm font-medium text-gold">Context Intelligence</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {context.sessionDuration !== undefined && (
                            <div>
                              <p className="text-white/50 text-xs mb-1">Session</p>
                              <p className="text-white font-medium">{formatDuration(context.sessionDuration)}</p>
                            </div>
                          )}
                          {context.yachtsViewed && context.yachtsViewed.length > 0 && (
                            <div>
                              <p className="text-white/50 text-xs mb-1">Yachts Viewed</p>
                              <p className="text-white font-medium">{context.yachtsViewed.length} yachts</p>
                            </div>
                          )}
                          {context.favorites && context.favorites.length > 0 && (
                            <div>
                              <p className="text-white/50 text-xs mb-1">Favorites</p>
                              <p className="text-white font-medium flex items-center gap-1">
                                <Heart className="w-3 h-3 text-red-400" /> {context.favorites.length}
                              </p>
                            </div>
                          )}
                          {context.compareList && context.compareList.length > 0 && (
                            <div>
                              <p className="text-white/50 text-xs mb-1">Comparing</p>
                              <p className="text-white font-medium flex items-center gap-1">
                                <Scale className="w-3 h-3 text-gold" /> {context.compareList.length}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {inquiries.length === 0 && (
            <div className="text-center py-12 bg-white/5 border border-white/10">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No inquiries found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
