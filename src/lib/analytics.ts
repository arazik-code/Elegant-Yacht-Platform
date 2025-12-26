// Analytics Tracking Service
// Google Analytics 4 + Meta Pixel + Custom Events + Server-side tracking

'use client'

import { useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// ===========================================
// TYPES
// ===========================================

interface AnalyticsEvent {
  name: string
  params?: Record<string, unknown>
}

interface YachtViewEvent {
  yachtId: string
  yachtTitle: string
  yachtType: 'SALE' | 'CHARTER'
  price?: number
  currency?: string
}

interface InquiryEvent {
  yachtId?: string
  yachtTitle?: string
  inquiryType: 'yacht' | 'charter' | 'sell' | 'general'
  source?: string
}

interface FilterEvent {
  filterType: string
  filterValue: string | number
}

// ===========================================
// THIRD-PARTY INTEGRATIONS
// ===========================================

// Define window extension for analytics
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

// GA4 Event Tracking
function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

// Meta Pixel Event Tracking
function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args)
  }
}

// ===========================================
// SERVER-SIDE TRACKING
// ===========================================

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Track event to server
async function trackToServer(
  eventType: string,
  eventData?: Record<string, unknown>,
  yachtId?: string,
  inquiryId?: string
): Promise<void> {
  try {
    await fetch('/api/admin/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        eventData,
        sessionId: getSessionId(),
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        yachtId,
        inquiryId,
      }),
    })
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.debug('Analytics tracking failed:', error)
  }
}

// ===========================================
// CORE TRACKING FUNCTIONS
// ===========================================

export const analytics = {
  // Page view
  pageView: (url: string, title?: string) => {
    gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
      page_title: title,
    })
    fbq('track', 'PageView')
    
    // Track to server
    trackToServer('page_view', { url, title })
  },
  
  // Custom event
  event: ({ name, params }: AnalyticsEvent) => {
    gtag('event', name, params)
    
    // Map to Meta Pixel events
    const metaEventMap: Record<string, string> = {
      yacht_view: 'ViewContent',
      inquiry_submit: 'Lead',
      whatsapp_click: 'Contact',
      add_to_favorites: 'AddToWishlist',
      add_to_compare: 'AddToCart',
    }
    
    if (metaEventMap[name]) {
      fbq('track', metaEventMap[name], params)
    }
  },
  
  // Yacht view
  yachtView: (data: YachtViewEvent) => {
    analytics.event({
      name: 'yacht_view',
      params: {
        content_type: 'yacht',
        content_id: data.yachtId,
        content_name: data.yachtTitle,
        yacht_type: data.yachtType,
        value: data.price,
        currency: data.currency || 'AED',
      },
    })
    
    fbq('track', 'ViewContent', {
      content_type: 'yacht',
      content_ids: [data.yachtId],
      content_name: data.yachtTitle,
      value: data.price,
      currency: data.currency || 'AED',
    })
    
    // Track to server
    trackToServer('yacht_view', {
      yachtTitle: data.yachtTitle,
      yachtType: data.yachtType,
      price: data.price,
      currency: data.currency,
    }, data.yachtId)
  },
  
  // Inquiry submission
  inquirySubmit: (data: InquiryEvent) => {
    analytics.event({
      name: 'inquiry_submit',
      params: {
        yacht_id: data.yachtId,
        yacht_title: data.yachtTitle,
        inquiry_type: data.inquiryType,
        source: data.source,
      },
    })
    
    fbq('track', 'Lead', {
      content_category: data.inquiryType,
      content_name: data.yachtTitle,
    })
    
    // GA4 conversion
    gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_CONVERSION_ID,
      value: 1,
      currency: 'AED',
    })
    
    // Track to server
    trackToServer('inquiry_submit', {
      inquiryType: data.inquiryType,
      yachtTitle: data.yachtTitle,
      source: data.source,
    }, data.yachtId)
  },
  
  // WhatsApp click
  whatsappClick: (yachtId?: string, yachtTitle?: string, context?: string) => {
    analytics.event({
      name: 'whatsapp_click',
      params: {
        yacht_id: yachtId,
        yacht_title: yachtTitle,
        context: context || 'general',
      },
    })
    
    fbq('track', 'Contact', {
      content_name: yachtTitle,
    })
    
    // Server tracking handled by WhatsApp redirect API
  },
  
  // Filter usage
  filterUsed: (data: FilterEvent) => {
    analytics.event({
      name: 'filter_used',
      params: {
        filter_type: data.filterType,
        filter_value: data.filterValue,
      },
    })
    
    // Track to server
    trackToServer('filter_used', {
      filter_type: data.filterType,
      filter_value: data.filterValue,
    })
  },
  
  // Favorites
  addToFavorites: (yachtId: string, yachtTitle: string) => {
    analytics.event({
      name: 'add_to_favorites',
      params: {
        content_type: 'yacht',
        content_id: yachtId,
        content_name: yachtTitle,
      },
    })
    
    fbq('track', 'AddToWishlist', {
      content_ids: [yachtId],
      content_name: yachtTitle,
    })
    
    // Track to server
    trackToServer('add_to_favorites', { yachtTitle }, yachtId)
  },
  
  // Compare
  addToCompare: (yachtId: string, yachtTitle: string) => {
    analytics.event({
      name: 'add_to_compare',
      params: {
        content_type: 'yacht',
        content_id: yachtId,
        content_name: yachtTitle,
      },
    })
    
    // Track to server
    trackToServer('add_to_compare', { yachtTitle }, yachtId)
  },
  
  // Sell yacht form
  sellYachtSubmit: (submissionId?: string) => {
    analytics.event({
      name: 'sell_yacht_submit',
      params: { submissionId },
    })
    
    fbq('track', 'SubmitApplication')
    
    gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_SELL_CONVERSION_ID,
    })
    
    // Track to server
    trackToServer('sell_yacht_submit', { submissionId })
  },
  
  // Search
  search: (query: string, resultsCount: number) => {
    analytics.event({
      name: 'search',
      params: {
        search_term: query,
        results_count: resultsCount,
      },
    })
    
    fbq('track', 'Search', {
      search_string: query,
    })
    
    // Track to server
    trackToServer('search', { query, resultsCount })
  },
  
  // Admin action
  adminAction: (action: string, entityType: string, entityId?: string) => {
    trackToServer('admin_action', { action, entityType, entityId })
  },
}

// ===========================================
// HOOKS
// ===========================================

// Analytics Provider Hook
export function usePageTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      analytics.pageView(url)
    }
  }, [pathname, searchParams])
}

// Favorites/Compare event listeners
export function useAnalyticsListeners() {
  useEffect(() => {
    const handleFavoriteAdd = (e: CustomEvent) => {
      const { yachtId, yachtData } = e.detail
      analytics.addToFavorites(yachtId, yachtData?.title || 'Unknown')
    }
    
    const handleCompareAdd = (e: CustomEvent) => {
      const { yachtId, yachtData } = e.detail
      analytics.addToCompare(yachtId, yachtData?.title || 'Unknown')
    }
    
    window.addEventListener('favorites:add', handleFavoriteAdd as EventListener)
    window.addEventListener('compare:add', handleCompareAdd as EventListener)
    
    return () => {
      window.removeEventListener('favorites:add', handleFavoriteAdd as EventListener)
      window.removeEventListener('compare:add', handleCompareAdd as EventListener)
    }
  }, [])
}
