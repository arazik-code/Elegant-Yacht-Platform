// Admin Analytics Dashboard
// Conversion funnel, top yachts, source breakdown, monthly growth charts

import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Download,
} from 'lucide-react'
import { getAnalyticsSummary, getRealTimeStats, getConversionFunnel, getComparisonStats } from '@/lib/analytics-server'
import AnalyticsRealtimeStats from '@/components/admin/AnalyticsRealtimeStats'

interface PageProps {
  searchParams: Promise<{
    period?: string
  }>
}

async function getAnalyticsData(period: string = '30d') {
  const endDate = new Date()
  let startDate: Date

  switch (period) {
    case '7d':
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '365d':
      startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default: // 30d
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  try {
    const [summary, realtime, funnel, comparison] = await Promise.all([
      getAnalyticsSummary(startDate, endDate),
      getRealTimeStats(),
      getConversionFunnel(startDate, endDate),
      getComparisonStats(startDate, endDate),
    ])

    return { summary, realtime, funnel, comparison, error: null }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return {
      summary: null,
      realtime: null,
      funnel: null,
      comparison: null,
      error: 'Failed to load analytics data'
    }
  }
}

export default async function AnalyticsDashboard({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const period = resolvedParams.period || '30d'
  const { summary, realtime, funnel, comparison, error } = await getAnalyticsData(period)

  const periodLabels: Record<string, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '365d': 'Last Year',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-gold" />
            Analytics Dashboard
          </h1>
          <p className="text-white/60">Track performance and conversions</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {Object.entries(periodLabels).map(([value, label]) => (
            <Link
              key={value}
              href={`/admin/analytics?period=${value}`}
              className={`px-4 py-2 text-sm transition-colors
                ${period === value
                  ? 'bg-gold text-jet'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Export Dropdown */}
        <div className="flex gap-2 items-center">
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 mt-1 py-1 w-48 bg-jet border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <a
                href={`/api/admin/analytics/export?type=inquiries&period=${period}`}
                className="block px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
              >
                📋 Inquiries (CSV)
              </a>
              <a
                href={`/api/admin/analytics/export?type=yacht-performance&period=${period}`}
                className="block px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
              >
                🚢 Yacht Performance (CSV)
              </a>
              <a
                href={`/api/admin/analytics/export?type=sources&period=${period}`}
                className="block px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
              >
                📊 Source Breakdown (CSV)
              </a>
              <a
                href={`/api/admin/analytics/export?type=daily-events&period=${period}`}
                className="block px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
              >
                📈 Daily Events (CSV)
              </a>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-center">
          {error}
        </div>
      ) : (
        <>
          {/* Real-time Stats */}
          <AnalyticsRealtimeStats initialStats={realtime} />

          {/* Main Stats Grid */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Page Views"
                value={summary.totalPageViews.toLocaleString()}
                icon={<Eye className="w-5 h-5" />}
                change={comparison?.changes.pageViews}
              />
              <StatCard
                title="Yacht Views"
                value={summary.totalYachtViews.toLocaleString()}
                icon={<Users className="w-5 h-5" />}
                change={comparison?.changes.yachtViews}
              />
              <StatCard
                title="Inquiries"
                value={summary.totalInquiries.toString()}
                icon={<MessageSquare className="w-5 h-5" />}
                change={comparison?.changes.inquiries}
                highlight
              />
              <StatCard
                title="Conversion Rate"
                value={`${summary.conversionRate.toFixed(2)}%`}
                icon={<TrendingUp className="w-5 h-5" />}
                trend={summary.conversionRate > 2 ? 'up' : 'down'}
              />
            </div>
          )}

          {/* Conversion Funnel */}
          {funnel && (
            <div className="bg-white/5 border border-white/10 p-6">
              <h2 className="text-lg font-display font-semibold text-white mb-4">
                Conversion Funnel
              </h2>
              <div className="space-y-4">
                {funnel.stages.map((stage, index) => (
                  <div key={stage.name} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/80 text-sm">{stage.name}</span>
                      <span className="text-white font-medium">
                        {stage.count.toLocaleString()}
                        <span className="text-white/50 text-xs ml-2">
                          ({stage.percentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-8 bg-white/5 relative overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${index === 0 ? 'bg-gold/50' :
                          index === 1 ? 'bg-blue-500/50' :
                            index === 2 ? 'bg-green-500/50' :
                              'bg-[#25D366]/50'
                          }`}
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                    {index < funnel.dropoffRates.length && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-red-400/80">
                        <ArrowDownRight className="w-3 h-3" />
                        {funnel.dropoffRates[index].rate.toFixed(1)}% drop-off
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Performing Yachts */}
            {summary && (
              <div className="bg-white/5 border border-white/10 p-6">
                <h2 className="text-lg font-display font-semibold text-white mb-4">
                  Top Performing Yachts
                </h2>
                <div className="space-y-3">
                  {summary.topYachts.length > 0 ? (
                    summary.topYachts.slice(0, 5).map((yacht, index) => (
                      <div
                        key={yacht.yachtId}
                        className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className={`w-6 h-6 flex items-center justify-center text-sm font-bold
                          ${index === 0 ? 'bg-gold text-jet' :
                            index === 1 ? 'bg-gray-400 text-jet' :
                              index === 2 ? 'bg-amber-700 text-white' :
                                'bg-white/10 text-white/50'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {yacht.title}
                          </p>
                          <p className="text-white/50 text-xs">
                            {yacht.views} views • {yacht.inquiries} inquiries
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-sm font-medium">
                            {yacht.views > 0
                              ? ((yacht.inquiries / yacht.views) * 100).toFixed(1)
                              : 0
                            }%
                          </p>
                          <p className="text-white/40 text-xs">conv.</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/50 text-center py-4">No data available</p>
                  )}
                </div>
              </div>
            )}

            {/* Source Breakdown */}
            {summary && (
              <div className="bg-white/5 border border-white/10 p-6">
                <h2 className="text-lg font-display font-semibold text-white mb-4">
                  Inquiry Source Breakdown
                </h2>
                <div className="space-y-3">
                  {summary.sourceBreakdown.length > 0 ? (
                    summary.sourceBreakdown.map((source) => (
                      <div key={source.source} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 text-sm flex items-center gap-2">
                            {source.source === 'INSTAGRAM' && '📸'}
                            {source.source === 'WEBSITE' && '🌐'}
                            {source.source === 'WHATSAPP' && '💬'}
                            {source.source === 'REFERRAL' && '🤝'}
                            {source.source}
                          </span>
                          <span className="text-white font-medium">
                            {source.count}
                            <span className="text-white/50 text-xs ml-2">
                              ({source.percentage.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${source.source === 'INSTAGRAM' ? 'bg-pink-500' :
                              source.source === 'WEBSITE' ? 'bg-blue-500' :
                                source.source === 'WHATSAPP' ? 'bg-[#25D366]' :
                                  'bg-gold'
                              }`}
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/50 text-center py-4">No data available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Monthly Growth Chart */}
          {summary && summary.monthlyGrowth.length > 0 && (
            <div className="bg-white/5 border border-white/10 p-6">
              <h2 className="text-lg font-display font-semibold text-white mb-4">
                Monthly Growth
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-white/50 font-normal">Month</th>
                      <th className="text-right py-2 text-white/50 font-normal">Page Views</th>
                      <th className="text-right py-2 text-white/50 font-normal">Inquiries</th>
                      <th className="text-right py-2 text-white/50 font-normal">Conversions</th>
                      <th className="text-right py-2 text-white/50 font-normal">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.monthlyGrowth.map((month, index) => {
                      const prevMonth = summary.monthlyGrowth[index - 1]
                      const growth = prevMonth && prevMonth.inquiries > 0
                        ? ((month.inquiries - prevMonth.inquiries) / prevMonth.inquiries) * 100
                        : 0

                      return (
                        <tr key={month.month} className="border-b border-white/5">
                          <td className="py-3 text-white">{month.month}</td>
                          <td className="py-3 text-right text-white/80">
                            {month.pageViews.toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-green-400 font-medium">
                            {month.inquiries}
                          </td>
                          <td className="py-3 text-right text-[#25D366]">
                            {month.conversions}
                          </td>
                          <td className="py-3 text-right">
                            {index > 0 && (
                              <span className={`flex items-center justify-end gap-1 ${growth > 0 ? 'text-green-400' : growth < 0 ? 'text-red-400' : 'text-white/50'
                                }`}>
                                {growth > 0 ? <ArrowUpRight className="w-3 h-3" /> :
                                  growth < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                                {Math.abs(growth).toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  trend,
  change,
  highlight = false,
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | null
  change?: number
  highlight?: boolean
}) {
  // Determine trend from change if not explicitly provided
  const displayTrend = trend ?? (change !== undefined ? (change >= 0 ? 'up' : 'down') : null)
  const displayChange = change !== undefined ? Math.abs(change).toFixed(1) : null

  return (
    <div className={`p-4 border ${highlight
      ? 'bg-gold/10 border-gold/30'
      : 'bg-white/5 border-white/10'
      }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={highlight ? 'text-gold' : 'text-white/50'}>{icon}</span>
        {displayTrend && displayChange && (
          <span className={`flex items-center gap-1 text-xs ${displayTrend === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
            {displayTrend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {displayChange}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/50 text-xs">{title}</p>
      {displayChange && (
        <p className="text-white/30 text-[10px] mt-1">vs prev. period</p>
      )}
    </div>
  )
}
