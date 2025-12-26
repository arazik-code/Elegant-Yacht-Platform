// Admin Dashboard Page

import { Suspense } from 'react'
import Link from 'next/link'
import { Ship, MessageSquare, Eye, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import prisma from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import DashboardRealtimeStats from '@/components/admin/DashboardRealtimeStats'

async function getDashboardStats() {
  try {
    const [
      totalYachts,
      featuredYachts,
      saleYachts,
      charterYachts,
      soldYachts,
      totalInquiries,
      newInquiries,
      recentInquiriesRaw,
    ] = await Promise.all([
      prisma.yacht.count(),
      prisma.yacht.count({ where: { featured: true } }),
      prisma.yacht.count({ where: { type: 'SALE' } }),
      prisma.yacht.count({ where: { type: 'CHARTER' } }),
      prisma.yacht.count({ where: { status: 'SOLD' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          yacht: {
            select: { title: true, slug: true },
          },
        },
      }),
    ])

    // Convert dates to strings for client component
    const recentInquiries = recentInquiriesRaw.map(inquiry => ({
      ...inquiry,
      createdAt: inquiry.createdAt.toISOString(),
      yacht: inquiry.yacht ? { title: inquiry.yacht.title } : null
    }))

    return {
      totalYachts,
      featuredYachts,
      saleYachts,
      charterYachts,
      soldYachts,
      totalInquiries,
      newInquiries,
      recentInquiries,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalYachts: 0,
      featuredYachts: 0,
      saleYachts: 0,
      charterYachts: 0,
      soldYachts: 0,
      totalInquiries: 0,
      newInquiries: 0,
      recentInquiries: [],
    }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-white/60">
          Welcome back. Here's an overview of your yacht platform.
        </p>
      </div>

      {/* Real-time Stats Component */}
      <DashboardRealtimeStats initialStats={stats} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/yachts/new"
          className="p-6 bg-gold/10 border border-gold/30 hover:bg-gold/20 transition-colors group"
        >
          <Ship className="w-8 h-8 text-gold mb-3" />
          <h3 className="text-white font-semibold group-hover:text-gold transition-colors">
            Add New Yacht
          </h3>
          <p className="text-white/50 text-sm mt-1">
            Create a new yacht listing
          </p>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-colors group"
        >
          <Eye className="w-8 h-8 text-white/50 mb-3" />
          <h3 className="text-white font-semibold">
            View Website
          </h3>
          <p className="text-white/50 text-sm mt-1">
            Open public website in new tab
          </p>
        </Link>
      </div>
    </div>
  )
}
