// Dynamic XML Sitemap API

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimoyacht.com'

export async function GET(request: NextRequest) {
  try {
    // Fetch all published yachts
    const yachts = await prisma.yacht.findMany({
      where: { status: 'AVAILABLE' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })
    
    // Fetch all published blog posts
    let blogPosts: { slug: string; updatedAt: Date }[] = []
    try {
      blogPosts = await prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
      })
    } catch {
      // BlogPost model may not exist yet
    }
    
    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/yachts', priority: '0.9', changefreq: 'daily' },
      { url: '/charter', priority: '0.9', changefreq: 'daily' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/sell-your-yacht', priority: '0.8', changefreq: 'monthly' },
      { url: '/favorites', priority: '0.5', changefreq: 'weekly' },
      { url: '/compare', priority: '0.5', changefreq: 'weekly' },
    ]
    
    // Build XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Static Pages -->
  ${staticPages.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${page.url}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}${page.url}" />
  </url>`).join('')}
  
  <!-- Yachts -->
  ${yachts.map(yacht => `
  <url>
    <loc>${SITE_URL}/yachts/${yacht.slug}</loc>
    <lastmod>${yacht.updatedAt.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/yachts/${yacht.slug}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/yachts/${yacht.slug}" />
  </url>`).join('')}
  
  <!-- Blog Posts -->
  ${blogPosts.map(post => `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}/blog/${post.slug}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/blog/${post.slug}" />
  </url>`).join('')}
  
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
    
  } catch (error) {
    console.error('Sitemap error:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
