'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

interface RealTimeStats {
    activeVisitors: number
    todayPageViews: number
    todayInquiries: number
    todayWhatsAppClicks: number
}

interface AnalyticsRealtimeStatsProps {
    initialStats: RealTimeStats | null
}

export default function AnalyticsRealtimeStats({ initialStats }: AnalyticsRealtimeStatsProps) {
    const [stats, setStats] = useState<RealTimeStats | null>(initialStats)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/analytics?action=realtime')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Failed to update realtime stats:', error)
            }
        }

        // Poll every 5 seconds for analytics (more frequent for "active visitors")
        const interval = setInterval(fetchStats, 5000)
        return () => clearInterval(interval)
    }, [])

    if (!stats) return null

    return (
        <div className="bg-gradient-to-r from-gold/10 to-transparent border border-gold/20 p-4">
            <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-gold animate-pulse" />
                <span className="text-gold font-medium text-sm">Real-time (Last 24 Hours)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <p className="text-white/50 text-xs">Active Visitors (15m)</p>
                    <p className="text-2xl font-bold text-white tabular-nums animate-in fade-in duration-300 key-[value]">
                        {stats.activeVisitors}
                    </p>
                </div>
                <div>
                    <p className="text-white/50 text-xs">Page Views</p>
                    <p className="text-2xl font-bold text-white tabular-nums">
                        {stats.todayPageViews.toLocaleString()}
                    </p>
                </div>
                <div>
                    <p className="text-white/50 text-xs">Inquiries</p>
                    <p className="text-2xl font-bold text-green-400 tabular-nums">
                        {stats.todayInquiries}
                    </p>
                </div>
                <div>
                    <p className="text-white/50 text-xs">WhatsApp Clicks</p>
                    <p className="text-2xl font-bold text-[#25D366] tabular-nums">
                        {stats.todayWhatsAppClicks}
                    </p>
                </div>
            </div>
        </div>
    )
}
