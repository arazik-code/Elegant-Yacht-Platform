// Security Headers Configuration
// CSP and other security headers for Next.js

// Content Security Policy directives
export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",  // Required for Next.js
    "'unsafe-eval'",    // Required for Next.js dev
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://connect.facebook.net',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",  // Required for styled-components/emotion
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://res.cloudinary.com',
    'https://images.clerk.dev',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://www.facebook.com',
  ],
  'media-src': [
    "'self'",
    'https://res.cloudinary.com',
  ],
  'connect-src': [
    "'self'",
    'https://api.clerk.dev',
    'https://api.clerk.com',
    'wss://*.clerk.dev',
    'https://res.cloudinary.com',
    'https://api.cloudinary.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://www.facebook.com',
    'https://connect.facebook.net',
    process.env.NEXT_PUBLIC_API_URL || '',
  ],
  'frame-src': [
    "'self'",
    'https://www.google.com',
    'https://www.facebook.com',
    'https://accounts.clerk.dev',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'self'"],
  'upgrade-insecure-requests': [],
}

/**
 * Build CSP header string
 */
export function buildCSP(isDev: boolean = false): string {
  const directives = { ...cspDirectives }
  
  // Add development-specific sources
  if (isDev) {
    directives['connect-src'].push('ws://localhost:*')
    directives['script-src'].push("'unsafe-eval'")
  }
  
  return Object.entries(directives)
    .filter(([, values]) => values.length > 0 || values.length === 0)
    .map(([key, values]) => {
      if (values.length === 0) return key
      return `${key} ${values.filter(Boolean).join(' ')}`
    })
    .join('; ')
}

/**
 * All security headers
 */
export function getSecurityHeaders(isDev: boolean = false) {
  return {
    'Content-Security-Policy': buildCSP(isDev),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}
