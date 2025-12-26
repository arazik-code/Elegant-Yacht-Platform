// Security Utilities
// IP detection, Cloudflare support, and security helpers

import { NextRequest } from 'next/server'

/**
 * Get real client IP address with Cloudflare support
 * Order of priority:
 * 1. CF-Connecting-IP (Cloudflare)
 * 2. True-Client-IP (Akamai, Cloudflare Enterprise)
 * 3. X-Real-IP (Nginx, other proxies)
 * 4. X-Forwarded-For (standard proxy header - first IP)
 * 5. Request IP (direct connection)
 */
export function getClientIP(req: NextRequest): string {
  // Cloudflare headers (most reliable when behind CF)
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
  
  // Fallback
  return 'unknown'
}

/**
 * Get Cloudflare-specific headers for analytics/logging
 */
export function getCloudflareInfo(req: NextRequest) {
  return {
    ip: req.headers.get('cf-connecting-ip'),
    country: req.headers.get('cf-ipcountry'),
    ray: req.headers.get('cf-ray'),
    visitor: req.headers.get('cf-visitor'),
    // Connection info
    httpVersion: req.headers.get('cf-connecting-ip-version'),
    tlsVersion: req.headers.get('cf-tls-version'),
    // Bot detection
    isBotManaged: req.headers.get('cf-bot-score') !== null,
    botScore: req.headers.get('cf-bot-score'),
  }
}

/**
 * Check if request is from a known bad IP range
 * You can add your own blocklist here
 */
const blockedIPRanges: string[] = [
  // Add blocked IP ranges/addresses here
  // '192.168.1.0/24',
]

export function isBlockedIP(ip: string): boolean {
  // Simple exact match for now
  return blockedIPRanges.includes(ip)
}

/**
 * Validate request origin
 */
export function isValidOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  
  // Allow same-origin requests
  if (!origin) return true
  
  // Check if origin matches host
  try {
    const originUrl = new URL(origin)
    return originUrl.host === host
  } catch {
    return false
  }
}

/**
 * Suspicious request detection
 */
export function detectSuspiciousRequest(req: NextRequest): {
  isSuspicious: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  
  const userAgent = req.headers.get('user-agent') || ''
  
  // Check for missing user agent
  if (!userAgent) {
    reasons.push('Missing user-agent')
  }
  
  // Check for common bot patterns (beyond legitimate bots)
  const suspiciousBotPatterns = [
    /python-requests/i,
    /curl\//i,
    /wget\//i,
    /scrapy/i,
    /phantom/i,
    /headless/i,
  ]
  
  for (const pattern of suspiciousBotPatterns) {
    if (pattern.test(userAgent)) {
      reasons.push(`Suspicious user-agent: ${pattern.source}`)
    }
  }
  
  // Check for suspicious headers
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor && forwardedFor.split(',').length > 10) {
    reasons.push('Excessive proxy chain')
  }
  
  return {
    isSuspicious: reasons.length > 0,
    reasons,
  }
}

/**
 * Generate a nonce for CSP script-src
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

/**
 * Honeypot field validation
 * Returns true if the submission appears to be from a bot
 */
export function isHoneypotTriggered(data: Record<string, any>): boolean {
  // Common honeypot field names
  const honeypotFields = [
    'website',
    'url',
    'fax',
    'company_url',
    '_honeypot',
    'hp_field',
  ]
  
  for (const field of honeypotFields) {
    if (data[field] && String(data[field]).trim() !== '') {
      return true
    }
  }
  
  return false
}

/**
 * Time-based form validation
 * Returns true if form was submitted too quickly (likely bot)
 */
export function isSubmittedTooFast(
  formLoadTime: number,
  minSecondsRequired: number = 3
): boolean {
  const submissionTime = Date.now()
  const timeSpent = (submissionTime - formLoadTime) / 1000
  
  return timeSpent < minSecondsRequired
}
