// Rate Limiting Service
// Token bucket algorithm for API rate limiting

interface RateLimitEntry {
  tokens: number
  lastRefill: number
  blocked?: boolean
  blockUntil?: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// IP blocklist for temporary bans
const blockedIPs = new Map<string, number>() // IP -> unblock timestamp

// Configuration for different endpoints
export const rateLimitConfig = {
  // General API endpoints
  api: {
    tokensPerInterval: 100,  // 100 requests
    interval: 60 * 1000,     // per minute
    blockAfterViolations: 5, // Block after 5 rate limit hits
    blockDuration: 15 * 60 * 1000, // 15 minute block
  },
  // Auth/login endpoints
  auth: {
    tokensPerInterval: 5,
    interval: 60 * 1000,
    blockAfterViolations: 3,
    blockDuration: 30 * 60 * 1000, // 30 minute block
  },
  // Form submissions (stricter)
  forms: {
    tokensPerInterval: 5,
    interval: 60 * 1000,
    blockAfterViolations: 3,
    blockDuration: 60 * 60 * 1000, // 1 hour block
  },
  // AI search (moderate)
  aiSearch: {
    tokensPerInterval: 20,
    interval: 60 * 1000,
    blockAfterViolations: 10,
    blockDuration: 5 * 60 * 1000, // 5 minute block
  },
  // Admin actions (higher limit but monitored)
  admin: {
    tokensPerInterval: 50,
    interval: 60 * 1000,
    blockAfterViolations: 10,
    blockDuration: 5 * 60 * 1000, // 5 minute block
  },
  // Sensitive admin operations (stricter)
  adminSensitive: {
    tokensPerInterval: 20,
    interval: 60 * 1000,
    blockAfterViolations: 5,
    blockDuration: 15 * 60 * 1000, // 15 minute block
  },
}

export type RateLimitType = keyof typeof rateLimitConfig

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number // milliseconds
  blocked?: boolean
  blockResetIn?: number
}

// Track violations per IP for progressive blocking
const violationCounts = new Map<string, number>()

/**
 * Check if an IP is blocked
 */
function isIPBlocked(ip: string): { blocked: boolean; resetIn?: number } {
  const blockUntil = blockedIPs.get(ip)
  if (!blockUntil) return { blocked: false }
  
  const now = Date.now()
  if (now >= blockUntil) {
    blockedIPs.delete(ip)
    violationCounts.delete(ip)
    return { blocked: false }
  }
  
  return { blocked: true, resetIn: blockUntil - now }
}

/**
 * Block an IP temporarily
 */
function blockIP(ip: string, duration: number): void {
  blockedIPs.set(ip, Date.now() + duration)
}

/**
 * Record a rate limit violation
 */
function recordViolation(ip: string, type: RateLimitType): boolean {
  const config = rateLimitConfig[type]
  const count = (violationCounts.get(ip) || 0) + 1
  violationCounts.set(ip, count)
  
  if (count >= config.blockAfterViolations) {
    blockIP(ip, config.blockDuration)
    return true // IP is now blocked
  }
  
  return false
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): RateLimitResult {
  const now = Date.now()
  
  // Check if IP is blocked
  const blockStatus = isIPBlocked(identifier)
  if (blockStatus.blocked) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: blockStatus.resetIn || 0,
      blocked: true,
      blockResetIn: blockStatus.resetIn,
    }
  }
  
  const config = rateLimitConfig[type]
  const key = `${type}:${identifier}`
  
  let entry = rateLimitStore.get(key)
  
  if (!entry) {
    // First request - create new entry
    entry = {
      tokens: config.tokensPerInterval - 1,
      lastRefill: now,
    }
    rateLimitStore.set(key, entry)
    
    return {
      allowed: true,
      remaining: entry.tokens,
      resetIn: config.interval,
    }
  }
  
  // Calculate time since last refill
  const timePassed = now - entry.lastRefill
  
  // Refill tokens based on time passed
  if (timePassed >= config.interval) {
    entry.tokens = config.tokensPerInterval
    entry.lastRefill = now
  } else {
    // Partial refill
    const tokensToAdd = Math.floor(
      (timePassed / config.interval) * config.tokensPerInterval
    )
    entry.tokens = Math.min(
      config.tokensPerInterval,
      entry.tokens + tokensToAdd
    )
    if (tokensToAdd > 0) {
      entry.lastRefill = now
    }
  }
  
  // Check if request is allowed
  if (entry.tokens > 0) {
    entry.tokens--
    rateLimitStore.set(key, entry)
    
    return {
      allowed: true,
      remaining: entry.tokens,
      resetIn: config.interval - (now - entry.lastRefill),
    }
  }
  
  // Rate limited - record violation
  const wasBlocked = recordViolation(identifier, type)
  
  return {
    allowed: false,
    remaining: 0,
    resetIn: config.interval - (now - entry.lastRefill),
    blocked: wasBlocked,
  }
}

/**
 * Generate rate limit headers
 */
export function getRateLimitHeaders(result: RateLimitResult, type: RateLimitType = 'api') {
  const config = rateLimitConfig[type]
  
  return {
    'X-RateLimit-Limit': String(config.tokensPerInterval),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetIn / 1000)),
  }
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  const maxAge = 5 * 60 * 1000 // 5 minutes
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRefill > maxAge) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
