// Enhanced Middleware - Auth, Rate Limiting, Security, Cloudflare Support

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, NextRequest } from 'next/server'
import { checkRateLimit, getRateLimitHeaders, RateLimitType } from '@/lib/rate-limit'

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])

const isApiRoute = createRouteMatcher([
  '/api(.*)',
])

const isFormSubmission = createRouteMatcher([
  '/api/inquiries',
  '/api/contact',
  '/api/sell-yacht',
])

const isAISearch = createRouteMatcher([
  '/api/ai-search',
])

const isSensitiveEndpoint = createRouteMatcher([
  '/api/admin/yachts(.*)',
  '/api/admin/inquiries(.*)',
  '/api/admin/settings(.*)',
])

/**
 * Get client IP address with Cloudflare support
 * Priority: CF-Connecting-IP > True-Client-IP > X-Real-IP > X-Forwarded-For
 */
function getClientIP(req: NextRequest): string {
  // Cloudflare (most reliable when behind CF)
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP.trim()

  // Cloudflare Enterprise / Akamai
  const trueClientIP = req.headers.get('true-client-ip')
  if (trueClientIP) return trueClientIP.trim()

  // Nginx / other proxies
  const realIP = req.headers.get('x-real-ip')
  if (realIP) return realIP.trim()

  // Standard proxy header - get first IP (original client)
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim())
    if (ips.length > 0 && ips[0]) return ips[0]
  }

  return 'unknown'
}

/**
 * Apply rate limiting to request
 */
function applyRateLimit(req: NextRequest, type: RateLimitType = 'api') {
  const ip = getClientIP(req)
  const result = checkRateLimit(ip, type)

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: getRateLimitHeaders(result, type),
      }
    )
  }

  return null // Allowed
}

/**
 * Basic bot/suspicious request detection
 */
function isSuspiciousRequest(req: NextRequest): boolean {
  const userAgent = req.headers.get('user-agent') || ''

  // Block requests with no user agent on form submissions
  if (!userAgent) return true

  // Block common automated tools on sensitive endpoints
  const suspiciousPatterns = [
    /python-requests/i,
    /curl\//i,
    /wget\//i,
    /scrapy/i,
    /phantom/i,
    /selenium/i,
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent)) return true
  }

  return false
}

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url)
  const clientIP = getClientIP(req)

  // Block suspicious requests on form submissions
  if (isFormSubmission(req) && isSuspiciousRequest(req)) {
    return NextResponse.json(
      { error: 'Request blocked' },
      { status: 403 }
    )
  }

  // Apply rate limiting to API routes
  if (isApiRoute(req)) {
    let limitType: RateLimitType = 'api'

    if (isFormSubmission(req)) {
      limitType = 'forms'
    } else if (isAISearch(req)) {
      limitType = 'aiSearch'
    } else if (isSensitiveEndpoint(req)) {
      // Stricter rate limiting for sensitive admin endpoints
      limitType = 'admin'
    } else if (isProtectedRoute(req)) {
      limitType = 'admin'
    }

    const rateLimitResponse = applyRateLimit(req, limitType)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  // Protect admin routes
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      // API routes return 401, pages redirect
      if (url.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  // Add security headers to response
  const response = NextResponse.next()

  // Add client IP for downstream use
  response.headers.set('X-Client-IP', clientIP)

  // Content Security Policy (strict but allows necessary resources)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://*.clerk.accounts.dev https://js.clerk.dev",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' https://*.cloudinary.com https://res.cloudinary.com https://*.clerk.dev https://*.clerk.accounts.dev https://img.clerk.com data: blob:",
    "media-src 'self' https://*.cloudinary.com https://res.cloudinary.com blob:",
    "connect-src 'self' https://*.clerk.dev https://*.clerk.accounts.dev https://api.clerk.dev https://www.google-analytics.com https://generativelanguage.googleapis.com https://*.cloudinary.com",
    "frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com https://*.clerk.accounts.dev",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspDirectives)

  // Other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  return response
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
