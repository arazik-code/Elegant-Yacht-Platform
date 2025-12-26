// Owner Yacht Performance Dashboard
// Clean, transparent view for yacht owners

import { Suspense } from 'react'
import Link from 'next/link'
import { Eye, MessageSquare, Clock, TrendingUp, TrendingDown, Star, ArrowLeft, BarChart3 } from 'lucide-react'
import { getOwnerYachtInsights } from '@/lib/analytics-server'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

// Performance status styling
const statusConfig = {
    EXCELLENT: { label: 'Excellent', color: 'bg-green-500/20 text-green-400', icon: '⭐' },
    GOOD: { label: 'Good', color: 'bg-blue-500/20 text-blue-400', icon: '👍' },
    AVERAGE: { label: 'Average', color: 'bg-yellow-500/20 text-yellow-400', icon: '📊' },
    BELOW_AVERAGE: { label: 'Needs Attention', color: 'bg-red-500/20 text-red-400', icon: '📉' },
}

async function OwnerInsightsContent({ yachtId }: { yachtId: string }) {
    const insights = await getOwnerYachtInsights(yachtId)

    if (!insights) {
        notFound()
    }

    const { yacht, performance, timeOnMarket, comparison, trend } = insights
    const statusStyle = statusConfig[comparison.status]

    return (
        <div className="min-h-screen bg-jet">
            {/* Header */}
            <div className="bg-navy/50 border-b border-white/10">
                <div className="container-luxury py-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Bimo Yacht
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                                {yacht.title}
                            </h1>
                            <p className="text-white/60">
                                Performance Report • Listed {timeOnMarket.days} days ago
                            </p>
                        </div>

                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusStyle.color}`}>
                            <span className="text-lg">{statusStyle.icon}</span>
                            <span className="font-semibold">{statusStyle.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-luxury py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Views */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Eye className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white/50 text-sm">Views (30 days)</p>
                                <p className="text-3xl font-bold text-white">{performance.views}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {comparison.viewsVsAverage >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={comparison.viewsVsAverage >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {comparison.viewsVsAverage >= 0 ? '+' : ''}{comparison.viewsVsAverage}% vs average
                            </span>
                        </div>
                    </div>

                    {/* Inquiries */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gold/20 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-gold" />
                            </div>
                            <div>
                                <p className="text-white/50 text-sm">Inquiries (30 days)</p>
                                <p className="text-3xl font-bold text-white">{performance.inquiries}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {comparison.inquiriesVsAverage >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={comparison.inquiriesVsAverage >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {comparison.inquiriesVsAverage >= 0 ? '+' : ''}{comparison.inquiriesVsAverage}% vs average
                            </span>
                        </div>
                    </div>

                    {/* Time on Market */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <Clock className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white/50 text-sm">Days on Market</p>
                                <p className="text-3xl font-bold text-white">{timeOnMarket.days}</p>
                            </div>
                        </div>
                        <p className="text-white/50 text-sm">
                            Average for similar: {timeOnMarket.averageDaysForSimilar} days
                        </p>
                    </div>
                </div>

                {/* Performance Score */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-5 h-5 text-gold" />
                        <h2 className="text-lg font-semibold text-white">Performance Score</h2>
                    </div>

                    <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-3">
                        <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold to-amber-400 rounded-full transition-all"
                            style={{ width: `${comparison.performanceScore}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-white/50">Score: {comparison.performanceScore}/100</span>
                        <span className={statusStyle.color.replace('bg-', 'text-').split(' ')[1]}>
                            {statusStyle.label}
                        </span>
                    </div>

                    <p className="text-white/60 text-sm mt-4">
                        {comparison.status === 'EXCELLENT' && 'Your yacht is performing exceptionally well compared to similar listings!'}
                        {comparison.status === 'GOOD' && 'Your yacht is getting solid interest. Keep up the good work!'}
                        {comparison.status === 'AVERAGE' && 'Your yacht is performing at market average. Consider updating photos or description.'}
                        {comparison.status === 'BELOW_AVERAGE' && 'Your listing could use some attention. Contact us for promotional options.'}
                    </p>
                </div>

                {/* Views Trend */}
                {trend.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gold" />
                            Views Trend (Last 30 Days)
                        </h2>

                        <div className="h-32 flex items-end gap-1">
                            {trend.map((day, i) => {
                                const maxViews = Math.max(...trend.map(t => t.views))
                                const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0

                                return (
                                    <div
                                        key={i}
                                        className="flex-1 bg-gold/60 hover:bg-gold transition-colors rounded-t"
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                        title={`${day.date}: ${day.views} views`}
                                    />
                                )
                            })}
                        </div>

                        <div className="flex justify-between text-xs text-white/40 mt-2">
                            <span>{trend[0]?.date}</span>
                            <span>{trend[trend.length - 1]?.date}</span>
                        </div>
                    </div>
                )}

                {/* Additional Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-white">{performance.conversionRate.toFixed(1)}%</p>
                        <p className="text-white/50 text-sm">Conversion Rate</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-white">{performance.whatsAppClicks}</p>
                        <p className="text-white/50 text-sm">WhatsApp Clicks</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-white">{yacht.type}</p>
                        <p className="text-white/50 text-sm">Listing Type</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-white">{new Date(yacht.listingDate).toLocaleDateString()}</p>
                        <p className="text-white/50 text-sm">Listed On</p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-white/40 text-sm">
                        This report is updated in real-time. Contact your Bimo Yacht advisor for marketing recommendations.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default async function OwnerYachtPage({ params }: PageProps) {
    const { id } = await params

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-jet flex items-center justify-center">
                <div className="animate-pulse text-white/50">Loading performance data...</div>
            </div>
        }>
            <OwnerInsightsContent yachtId={id} />
        </Suspense>
    )
}
