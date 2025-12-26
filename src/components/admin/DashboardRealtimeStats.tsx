'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Ship, MessageSquare, Eye, TrendingUp, AlertCircle, Clock } from 'lucide-react'

interface DashboardStats {
    totalYachts: number
    featuredYachts: number
    saleYachts: number
    charterYachts: number
    soldYachts: number
    totalInquiries: number
    newInquiries: number
    recentInquiries: Array<{
        id: string
        name: string
        email: string | null
        yacht: { title: string } | null
        status: string
        createdAt: string
    }>
}

interface DashboardRealtimeStatsProps {
    initialStats: DashboardStats
}

function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    href,
}: {
    title: string
    value: number | string
    icon: React.ElementType
    trend?: string
    href?: string
}) {
    const content = (
        <div className="p-6 bg-white/5 border border-white/10 hover:border-gold/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gold/10">
                    <Icon className="w-5 h-5 text-gold" />
                </div>
                {trend && (
                    <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1 animate-in fade-in zoom-in-95 duration-300 key-[value]">
                {value}
            </p>
            <p className="text-white/50 text-sm">{title}</p>
        </div>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }

    return content
}

export default function DashboardRealtimeStats({ initialStats }: DashboardRealtimeStatsProps) {
    const [stats, setStats] = useState<DashboardStats>(initialStats)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/dashboard/stats')
                if (res.ok) {
                    const data = await res.json()
                    setStats(data)
                }
            } catch (error) {
                console.error('Failed to update stats:', error)
            }
        }

        // Poll every 10 seconds
        const interval = setInterval(fetchStats, 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Yachts"
                    value={stats.totalYachts}
                    icon={Ship}
                    href="/admin/yachts"
                />
                <StatCard
                    title="Featured"
                    value={stats.featuredYachts}
                    icon={Eye}
                    href="/admin/yachts?filter=featured"
                />
                <StatCard
                    title="New Inquiries"
                    value={stats.newInquiries}
                    icon={MessageSquare}
                    trend={stats.newInquiries > 0 ? 'New' : undefined}
                    href="/admin/inquiries?filter=new"
                />
                <StatCard
                    title="Total Inquiries"
                    value={stats.totalInquiries}
                    icon={MessageSquare}
                    href="/admin/inquiries"
                />
            </div>

            {/* Yacht Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm mb-1">For Sale</p>
                    <p className="text-xl font-semibold text-white">{stats.saleYachts} yachts</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm mb-1">For Charter</p>
                    <p className="text-xl font-semibold text-white">{stats.charterYachts} yachts</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10">
                    <p className="text-white/50 text-sm mb-1">Sold</p>
                    <p className="text-xl font-semibold text-white">{stats.soldYachts} yachts</p>
                </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-white/5 border border-white/10">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gold" />
                        Recent Inquiries
                        {stats.newInquiries > 0 && (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-gold"></span>
                            </span>
                        )}
                    </h2>
                    <Link
                        href="/admin/inquiries"
                        className="text-gold text-sm hover:underline"
                    >
                        View All
                    </Link>
                </div>

                {stats.recentInquiries.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {stats.recentInquiries.map((inquiry) => (
                            <div key={inquiry.id} className="p-4 flex items-center justify-between animate-in fade-in slide-in-from-right-2 duration-300">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">
                                        {inquiry.name}
                                    </p>
                                    <p className="text-white/50 text-sm truncate">
                                        {inquiry.yacht?.title || 'General Inquiry'} • {inquiry.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 text-xs font-medium
                    ${inquiry.status === 'NEW'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : inquiry.status === 'CONTACTED'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-green-500/20 text-green-400'
                                        }`}
                                    >
                                        {inquiry.status}
                                    </span>
                                    <span className="text-white/40 text-sm flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(inquiry.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <p className="text-white/50">No inquiries yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
