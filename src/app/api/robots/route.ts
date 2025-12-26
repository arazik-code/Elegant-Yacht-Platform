// Robots.txt API

import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimoyacht.com'

export async function GET() {
  const robots = `# Bimo Yacht Robots.txt
# https://bimoyacht.com

User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin
Disallow: /admin/*
Disallow: /api/admin/*

# Disallow auth routes
Disallow: /sign-in
Disallow: /sign-up

# Disallow utility pages
Disallow: /offline
Disallow: /_next/

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay (optional, be kind to servers)
Crawl-delay: 1
`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
