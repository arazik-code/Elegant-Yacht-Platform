// Server-side Analytics Service
// Tracks events to database for admin dashboard reporting

import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

// ===========================================
// TYPES
// ===========================================

export type EventType =
  | 'page_view'
  | 'yacht_view'
  | 'inquiry_submit'
  | 'whatsapp_click'
  | 'filter_used'
  | 'search'
  | 'add_to_favorites'
  | 'add_to_compare'
  | 'sell_yacht_submit'
  | 'admin_action'

export interface TrackEventData {
  eventType: EventType
  eventData?: Prisma.InputJsonValue
  sessionId?: string
  userId?: string
  page?: string
  referrer?: string
  userAgent?: string
  ipAddress?: string
  country?: string
  city?: string
  yachtId?: string
  inquiryId?: string
}

export interface AnalyticsSummary {
  totalPageViews: number
  totalYachtViews: number
  totalInquiries: number
  totalWhatsAppClicks: number
  conversionRate: number
  topYachts: Array<{ yachtId: string; title: string; views: number; inquiries: number }>
  sourceBreakdown: Array<{ source: string; count: number; percentage: number }>
  monthlyGrowth: Array<{ month: string; pageViews: number; inquiries: number; conversions: number }>
  conversionFunnel: {
    pageViews: number
    yachtViews: number
    inquiries: number
    whatsAppClicks: number
  }
}

// ===========================================
// TRACK EVENTS
// ===========================================

/**
 * Track an analytics event to the database
 */
export async function trackEvent(data: TrackEventData): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType: data.eventType,
        eventData: data.eventData || {},
        sessionId: data.sessionId,
        userId: data.userId,
        page: data.page,
        referrer: data.referrer,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        country: data.country,
        city: data.city,
        yachtId: data.yachtId,
        inquiryId: data.inquiryId,
      },
    })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

/**
 * Track yacht view
 */
export async function trackYachtView(
  yachtId: string,
  yachtTitle: string,
  headers?: Headers
): Promise<void> {
  await trackEvent({
    eventType: 'yacht_view',
    eventData: { yachtTitle },
    yachtId,
    userAgent: headers?.get('user-agent') || undefined,
    referrer: headers?.get('referer') || undefined,
  })
}

/**
 * Track inquiry submission
 */
export async function trackInquirySubmit(
  inquiryId: string,
  inquiryType: string,
  yachtId?: string,
  source?: string
): Promise<void> {
  await trackEvent({
    eventType: 'inquiry_submit',
    eventData: { inquiryType, source },
    inquiryId,
    yachtId,
  })
}

/**
 * Track sell yacht submission
 */
export async function trackSellYachtSubmit(
  submissionId?: string
): Promise<void> {
  await trackEvent({
    eventType: 'sell_yacht_submit',
    eventData: { submissionId },
  })
}

/**
 * Track admin action
 */
export async function trackAdminAction(
  action: string,
  entityType: string,
  entityId?: string,
  adminId?: string
): Promise<void> {
  await trackEvent({
    eventType: 'admin_action',
    eventData: { action, entityType, entityId, adminId },
  })
}

// ===========================================
// ANALYTICS QUERIES
// ===========================================

/**
 * Get analytics summary for a date range
 */
export async function getAnalyticsSummary(
  startDate: Date,
  endDate: Date
): Promise<AnalyticsSummary> {
  const dateFilter = {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
  }

  // Get event counts
  const [
    totalPageViews,
    totalYachtViews,
    totalInquiries,
    totalWhatsAppClicks,
  ] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { ...dateFilter, eventType: 'page_view' },
    }),
    prisma.analyticsEvent.count({
      where: { ...dateFilter, eventType: 'yacht_view' },
    }),
    prisma.inquiry.count({
      where: dateFilter,
    }),
    prisma.whatsAppClick.count({
      where: dateFilter,
    }),
  ])

  // Calculate conversion rate (inquiries / yacht views)
  const conversionRate = totalYachtViews > 0
    ? (totalInquiries / totalYachtViews) * 100
    : 0

  // Get top performing yachts
  const topYachtsData = await prisma.analyticsEvent.groupBy({
    by: ['yachtId'],
    where: {
      ...dateFilter,
      eventType: 'yacht_view',
      yachtId: { not: null },
    },
    _count: { yachtId: true },
    orderBy: { _count: { yachtId: 'desc' } },
    take: 10,
  })

  // Get yacht details and inquiry counts
  const topYachts = await Promise.all(
    topYachtsData.map(async (item) => {
      if (!item.yachtId) return null

      const [yacht, inquiryCount] = await Promise.all([
        prisma.yacht.findUnique({
          where: { id: item.yachtId },
          select: { id: true, title: true },
        }),
        prisma.inquiry.count({
          where: { yachtId: item.yachtId, ...dateFilter },
        }),
      ])

      return yacht ? {
        yachtId: yacht.id,
        title: yacht.title,
        views: item._count.yachtId,
        inquiries: inquiryCount,
      } : null
    })
  )

  // Get source breakdown from inquiries
  const sourceData = await prisma.inquiry.groupBy({
    by: ['source'],
    where: dateFilter,
    _count: { source: true },
  })

  const totalSourceCount = sourceData.reduce((acc, s) => acc + s._count.source, 0)
  const sourceBreakdown = sourceData.map((s) => ({
    source: s.source || 'UNKNOWN',
    count: s._count.source,
    percentage: totalSourceCount > 0
      ? (s._count.source / totalSourceCount) * 100
      : 0,
  }))

  // Get monthly growth data
  const monthlyGrowth = await getMonthlyGrowth(startDate, endDate)

  return {
    totalPageViews,
    totalYachtViews,
    totalInquiries,
    totalWhatsAppClicks,
    conversionRate,
    topYachts: topYachts.filter((y): y is NonNullable<typeof y> => y !== null),
    sourceBreakdown,
    monthlyGrowth,
    conversionFunnel: {
      pageViews: totalPageViews,
      yachtViews: totalYachtViews,
      inquiries: totalInquiries,
      whatsAppClicks: totalWhatsAppClicks,
    },
  }
}

/**
 * Get monthly growth data
 */
async function getMonthlyGrowth(
  startDate: Date,
  endDate: Date
): Promise<Array<{ month: string; pageViews: number; inquiries: number; conversions: number }>> {
  const months: Array<{ month: string; pageViews: number; inquiries: number; conversions: number }> = []

  const currentDate = new Date(startDate)
  currentDate.setDate(1) // Start from first of month

  while (currentDate <= endDate) {
    const monthStart = new Date(currentDate)
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    const [pageViews, inquiries, conversions] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          eventType: 'page_view',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.inquiry.count({
        where: { createdAt: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.whatsAppClick.count({
        where: { createdAt: { gte: monthStart, lte: monthEnd } },
      }),
    ])

    months.push({
      month: monthStart.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
      pageViews,
      inquiries,
      conversions,
    })

    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return months
}

/**
 * Get real-time stats (last 24 hours)
 */
export async function getRealTimeStats(): Promise<{
  activeVisitors: number
  todayPageViews: number
  todayInquiries: number
  todayWhatsAppClicks: number
}> {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

  const [activeVisitors, todayPageViews, todayInquiries, todayWhatsAppClicks] = await Promise.all([
    // Active visitors (unique sessions in last 15 minutes)
    prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: fifteenMinutesAgo },
        sessionId: { not: null },
      },
      select: { sessionId: true },
      distinct: ['sessionId'],
    }).then((results) => results.length),

    prisma.analyticsEvent.count({
      where: {
        eventType: 'page_view',
        createdAt: { gte: twentyFourHoursAgo },
      },
    }),

    prisma.inquiry.count({
      where: { createdAt: { gte: twentyFourHoursAgo } },
    }),

    prisma.whatsAppClick.count({
      where: { createdAt: { gte: twentyFourHoursAgo } },
    }),
  ])

  return {
    activeVisitors,
    todayPageViews,
    todayInquiries,
    todayWhatsAppClicks,
  }
}

/**
 * Get filter usage stats
 */
export async function getFilterUsageStats(
  startDate: Date,
  endDate: Date
): Promise<Array<{ filter: string; value: string; count: number }>> {
  const filterEvents = await prisma.analyticsEvent.findMany({
    where: {
      eventType: 'filter_used',
      createdAt: { gte: startDate, lte: endDate },
    },
    select: { eventData: true },
  })

  const filterCounts = new Map<string, number>()

  for (const event of filterEvents) {
    const data = event.eventData as { filter_type?: string; filter_value?: string } | null
    if (data?.filter_type && data?.filter_value) {
      const key = `${data.filter_type}:${data.filter_value}`
      filterCounts.set(key, (filterCounts.get(key) || 0) + 1)
    }
  }

  return Array.from(filterCounts.entries())
    .map(([key, count]) => {
      const [filter, value] = key.split(':')
      return { filter, value, count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(
  startDate: Date,
  endDate: Date
): Promise<{
  stages: Array<{ name: string; count: number; percentage: number }>
  dropoffRates: Array<{ from: string; to: string; rate: number }>
}> {
  const dateFilter = { createdAt: { gte: startDate, lte: endDate } }

  const [pageViews, yachtViews, inquiries, whatsAppClicks] = await Promise.all([
    prisma.analyticsEvent.count({ where: { ...dateFilter, eventType: 'page_view' } }),
    prisma.analyticsEvent.count({ where: { ...dateFilter, eventType: 'yacht_view' } }),
    prisma.inquiry.count({ where: dateFilter }),
    prisma.whatsAppClick.count({ where: dateFilter }),
  ])

  const stages = [
    { name: 'Page Views', count: pageViews, percentage: 100 },
    { name: 'Yacht Views', count: yachtViews, percentage: pageViews > 0 ? (yachtViews / pageViews) * 100 : 0 },
    { name: 'Inquiries', count: inquiries, percentage: pageViews > 0 ? (inquiries / pageViews) * 100 : 0 },
    { name: 'WhatsApp Clicks', count: whatsAppClicks, percentage: pageViews > 0 ? (whatsAppClicks / pageViews) * 100 : 0 },
  ]

  const dropoffRates = [
    {
      from: 'Page Views',
      to: 'Yacht Views',
      rate: pageViews > 0 ? ((pageViews - yachtViews) / pageViews) * 100 : 0
    },
    {
      from: 'Yacht Views',
      to: 'Inquiries',
      rate: yachtViews > 0 ? ((yachtViews - inquiries) / yachtViews) * 100 : 0
    },
    {
      from: 'Inquiries',
      to: 'WhatsApp Clicks',
      rate: inquiries > 0 ? ((inquiries - whatsAppClicks) / inquiries) * 100 : 0
    },
  ]

  return { stages, dropoffRates }
}

/**
 * Get comparison stats between current and previous period
 */
export async function getComparisonStats(
  startDate: Date,
  endDate: Date
): Promise<{
  current: {
    pageViews: number
    yachtViews: number
    inquiries: number
    whatsAppClicks: number
  }
  previous: {
    pageViews: number
    yachtViews: number
    inquiries: number
    whatsAppClicks: number
  }
  changes: {
    pageViews: number
    yachtViews: number
    inquiries: number
    whatsAppClicks: number
  }
}> {
  // Calculate the period length
  const periodLength = endDate.getTime() - startDate.getTime()

  // Previous period is the same length, ending where current starts
  const prevEndDate = new Date(startDate.getTime() - 1) // 1ms before current start
  const prevStartDate = new Date(prevEndDate.getTime() - periodLength)

  const currentFilter = { createdAt: { gte: startDate, lte: endDate } }
  const prevFilter = { createdAt: { gte: prevStartDate, lte: prevEndDate } }

  // Fetch current period stats
  const [
    currPageViews,
    currYachtViews,
    currInquiries,
    currWhatsAppClicks,
    prevPageViews,
    prevYachtViews,
    prevInquiries,
    prevWhatsAppClicks,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { ...currentFilter, eventType: 'page_view' } }),
    prisma.analyticsEvent.count({ where: { ...currentFilter, eventType: 'yacht_view' } }),
    prisma.inquiry.count({ where: currentFilter }),
    prisma.whatsAppClick.count({ where: currentFilter }),
    prisma.analyticsEvent.count({ where: { ...prevFilter, eventType: 'page_view' } }),
    prisma.analyticsEvent.count({ where: { ...prevFilter, eventType: 'yacht_view' } }),
    prisma.inquiry.count({ where: prevFilter }),
    prisma.whatsAppClick.count({ where: prevFilter }),
  ])

  // Calculate percentage changes
  const calcChange = (curr: number, prev: number): number => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return ((curr - prev) / prev) * 100
  }

  return {
    current: {
      pageViews: currPageViews,
      yachtViews: currYachtViews,
      inquiries: currInquiries,
      whatsAppClicks: currWhatsAppClicks,
    },
    previous: {
      pageViews: prevPageViews,
      yachtViews: prevYachtViews,
      inquiries: prevInquiries,
      whatsAppClicks: prevWhatsAppClicks,
    },
    changes: {
      pageViews: calcChange(currPageViews, prevPageViews),
      yachtViews: calcChange(currYachtViews, prevYachtViews),
      inquiries: calcChange(currInquiries, prevInquiries),
      whatsAppClicks: calcChange(currWhatsAppClicks, prevWhatsAppClicks),
    },
  }
}

/**
 * Get analytics stats for a specific yacht
 */
export async function getYachtStats(
  yachtId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  yachtId: string
  totalViews: number
  totalInquiries: number
  totalWhatsAppClicks: number
  conversionRate: number
  viewsByDay: Array<{ date: string; views: number }>
  inquirySources: Array<{ source: string; count: number }>
}> {
  const now = new Date()
  const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const start = startDate || defaultStart
  const end = endDate || now

  const dateFilter = { createdAt: { gte: start, lte: end } }

  // Get aggregate stats
  const [totalViews, totalInquiries, totalWhatsAppClicks] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { yachtId, eventType: 'yacht_view', ...dateFilter },
    }),
    prisma.inquiry.count({
      where: { yachtId, ...dateFilter },
    }),
    prisma.whatsAppClick.count({
      where: { yachtId, ...dateFilter },
    }),
  ])

  // Get views by day for trend
  const viewEvents = await prisma.analyticsEvent.findMany({
    where: { yachtId, eventType: 'yacht_view', ...dateFilter },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Group by day
  const viewsByDayMap = new Map<string, number>()
  for (const event of viewEvents) {
    const dateKey = event.createdAt.toISOString().split('T')[0]
    viewsByDayMap.set(dateKey, (viewsByDayMap.get(dateKey) || 0) + 1)
  }

  const viewsByDay = Array.from(viewsByDayMap.entries()).map(([date, views]) => ({
    date,
    views,
  }))

  // Get inquiry sources for this yacht
  const inquirySourceData = await prisma.inquiry.groupBy({
    by: ['source'],
    where: { yachtId, ...dateFilter },
    _count: { source: true },
  })

  const inquirySources = inquirySourceData.map((s) => ({
    source: s.source || 'UNKNOWN',
    count: s._count.source,
  }))

  // Calculate conversion rate
  const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0

  return {
    yachtId,
    totalViews,
    totalInquiries,
    totalWhatsAppClicks,
    conversionRate,
    viewsByDay,
    inquirySources,
  }
}

/**
 * Get quick stats for multiple yachts (for admin list badges)
 */
export async function getYachtQuickStats(
  yachtIds: string[]
): Promise<Map<string, { views: number; inquiries: number }>> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const dateFilter = { createdAt: { gte: thirtyDaysAgo } }

  // Get views per yacht
  const viewsData = await prisma.analyticsEvent.groupBy({
    by: ['yachtId'],
    where: {
      yachtId: { in: yachtIds },
      eventType: 'yacht_view',
      ...dateFilter,
    },
    _count: { yachtId: true },
  })

  // Get inquiries per yacht
  const inquiriesData = await prisma.inquiry.groupBy({
    by: ['yachtId'],
    where: {
      yachtId: { in: yachtIds },
      ...dateFilter,
    },
    _count: { yachtId: true },
  })

  const result = new Map<string, { views: number; inquiries: number }>()

  // Initialize all yachts with 0
  for (const id of yachtIds) {
    result.set(id, { views: 0, inquiries: 0 })
  }

  // Fill in views
  for (const item of viewsData) {
    if (item.yachtId) {
      const existing = result.get(item.yachtId) || { views: 0, inquiries: 0 }
      existing.views = item._count.yachtId
      result.set(item.yachtId, existing)
    }
  }

  // Fill in inquiries
  for (const item of inquiriesData) {
    if (item.yachtId) {
      const existing = result.get(item.yachtId) || { views: 0, inquiries: 0 }
      existing.inquiries = item._count.yachtId
      result.set(item.yachtId, existing)
    }
  }

  return result
}

/**
 * Get favorites analytics for admin dashboard
 * Shows most favorited yachts and favorites trends
 */
export async function getFavoritesAnalytics(
  startDate: Date,
  endDate: Date
): Promise<{
  totalFavorites: number
  topFavoritedYachts: Array<{
    yachtId: string
    yachtTitle: string
    favoriteCount: number
    inquiryCount: number
    conversionRate: number
  }>
  favoritesTrend: Array<{ date: string; count: number }>
}> {
  const dateFilter = { createdAt: { gte: startDate, lte: endDate } }

  // Get total favorites events in period
  const totalFavorites = await prisma.analyticsEvent.count({
    where: { eventType: 'add_to_favorites', ...dateFilter },
  })

  // Get top favorited yachts
  const favoritesData = await prisma.analyticsEvent.groupBy({
    by: ['yachtId'],
    where: {
      eventType: 'add_to_favorites',
      yachtId: { not: null },
      ...dateFilter,
    },
    _count: { yachtId: true },
    orderBy: { _count: { yachtId: 'desc' } },
    take: 10,
  })

  // Get yacht details and inquiry counts for top favorited
  const topFavoritedYachts = await Promise.all(
    favoritesData.map(async (item) => {
      if (!item.yachtId) return null

      const [yacht, inquiryCount] = await Promise.all([
        prisma.yacht.findUnique({
          where: { id: item.yachtId },
          select: { id: true, title: true },
        }),
        prisma.inquiry.count({
          where: { yachtId: item.yachtId, ...dateFilter },
        }),
      ])

      if (!yacht) return null

      const favoriteCount = item._count.yachtId
      const conversionRate = favoriteCount > 0
        ? (inquiryCount / favoriteCount) * 100
        : 0

      return {
        yachtId: yacht.id,
        yachtTitle: yacht.title,
        favoriteCount,
        inquiryCount,
        conversionRate,
      }
    })
  )

  // Get favorites trend (by day)
  const favoritesEvents = await prisma.analyticsEvent.findMany({
    where: { eventType: 'add_to_favorites', ...dateFilter },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const trendMap = new Map<string, number>()
  for (const event of favoritesEvents) {
    const dateKey = event.createdAt.toISOString().split('T')[0]
    trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1)
  }

  const favoritesTrend = Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }))

  return {
    totalFavorites,
    topFavoritedYachts: topFavoritedYachts.filter(
      (y): y is NonNullable<typeof y> => y !== null
    ),
    favoritesTrend,
  }
}

/**
 * Get owner-facing yacht performance insights
 * Shows views, inquiries, time on market, and comparison vs average
 */
export async function getOwnerYachtInsights(
  yachtId: string
): Promise<{
  yacht: { id: string; title: string; type: string; listingDate: Date }
  performance: {
    views: number
    inquiries: number
    whatsAppClicks: number
    conversionRate: number
  }
  timeOnMarket: {
    days: number
    listingDate: Date
    averageDaysForSimilar: number
  }
  comparison: {
    viewsVsAverage: number      // percentage difference
    inquiriesVsAverage: number  // percentage difference
    performanceScore: number    // 0-100
    status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE'
  }
  trend: Array<{ date: string; views: number }>
} | null> {
  // Get yacht details
  const yacht = await prisma.yacht.findUnique({
    where: { id: yachtId },
    select: {
      id: true,
      title: true,
      type: true,
      price: true,
      lengthFeet: true,
      createdAt: true,
    },
  })

  if (!yacht) return null

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get this yacht's stats (last 30 days)
  const [views, inquiries, whatsAppClicks] = await Promise.all([
    prisma.analyticsEvent.count({
      where: { yachtId, eventType: 'yacht_view', createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.inquiry.count({
      where: { yachtId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.whatsAppClick.count({
      where: { yachtId, createdAt: { gte: thirtyDaysAgo } },
    }),
  ])

  // Calculate time on market
  const daysOnMarket = Math.floor((now.getTime() - yacht.createdAt.getTime()) / (24 * 60 * 60 * 1000))

  // Get average stats for similar yachts (same type, similar price range)
  const similarYachts = await prisma.yacht.findMany({
    where: {
      id: { not: yachtId },
      type: yacht.type,
      status: 'AVAILABLE',
      // Similar price range (±30%)
      ...(yacht.price ? {
        price: {
          gte: yacht.price * 0.7,
          lte: yacht.price * 1.3,
        },
      } : {}),
    },
    select: { id: true, createdAt: true },
    take: 50,
  })

  // Calculate average views/inquiries for similar yachts
  let avgViews = 0
  let avgInquiries = 0
  let avgDaysOnMarket = 0

  if (similarYachts.length > 0) {
    const similarIds = similarYachts.map(y => y.id)

    const [similarViewsTotal, similarInquiriesTotal] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          yachtId: { in: similarIds },
          eventType: 'yacht_view',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.inquiry.count({
        where: {
          yachtId: { in: similarIds },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ])

    avgViews = Math.round(similarViewsTotal / similarYachts.length)
    avgInquiries = Math.round(similarInquiriesTotal / similarYachts.length)
    avgDaysOnMarket = Math.round(
      similarYachts.reduce((sum, y) =>
        sum + Math.floor((now.getTime() - y.createdAt.getTime()) / (24 * 60 * 60 * 1000)), 0
      ) / similarYachts.length
    )
  }

  // Calculate comparison percentages
  const viewsVsAverage = avgViews > 0 ? ((views - avgViews) / avgViews) * 100 : 0
  const inquiriesVsAverage = avgInquiries > 0 ? ((inquiries - avgInquiries) / avgInquiries) * 100 : 0

  // Calculate performance score (0-100)
  let performanceScore = 50 // Base score
  performanceScore += Math.min(viewsVsAverage / 2, 25)   // +25 max for views above avg
  performanceScore += Math.min(inquiriesVsAverage / 2, 25) // +25 max for inquiries above avg
  performanceScore = Math.max(0, Math.min(100, performanceScore))

  // Determine status
  let status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'BELOW_AVERAGE'
  if (performanceScore >= 75) {
    status = 'EXCELLENT'
  } else if (performanceScore >= 55) {
    status = 'GOOD'
  } else if (performanceScore >= 40) {
    status = 'AVERAGE'
  } else {
    status = 'BELOW_AVERAGE'
  }

  // Get views trend (last 30 days)
  const viewEvents = await prisma.analyticsEvent.findMany({
    where: { yachtId, eventType: 'yacht_view', createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  const trendMap = new Map<string, number>()
  for (const event of viewEvents) {
    const dateKey = event.createdAt.toISOString().split('T')[0]
    trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1)
  }

  const trend = Array.from(trendMap.entries()).map(([date, views]) => ({ date, views }))

  return {
    yacht: {
      id: yacht.id,
      title: yacht.title,
      type: yacht.type,
      listingDate: yacht.createdAt,
    },
    performance: {
      views,
      inquiries,
      whatsAppClicks,
      conversionRate: views > 0 ? (inquiries / views) * 100 : 0,
    },
    timeOnMarket: {
      days: daysOnMarket,
      listingDate: yacht.createdAt,
      averageDaysForSimilar: avgDaysOnMarket,
    },
    comparison: {
      viewsVsAverage: Math.round(viewsVsAverage),
      inquiriesVsAverage: Math.round(inquiriesVsAverage),
      performanceScore: Math.round(performanceScore),
      status,
    },
    trend,
  }
}

