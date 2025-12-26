// SEO Helper Functions

import { Metadata } from 'next'
import { siteConfig } from './constants'

const SITE_URL = siteConfig.url || 'https://bimoyacht.com'

// Supported locales
export const LOCALES = ['en', 'ar'] as const
export type SupportedLocale = (typeof LOCALES)[number]

// Generate canonical URL
export function getCanonicalUrl(path: string = '/', locale?: SupportedLocale): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(cleanPath, SITE_URL)
  
  // Add locale prefix if not default (en)
  if (locale && locale !== 'en') {
    url.pathname = `/${locale}${url.pathname}`
  }
  
  return url.toString()
}

// Generate hreflang alternates for multi-language SEO
export function getHreflangAlternates(path: string = '/'): Record<string, string> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  return {
    'en': `${SITE_URL}${cleanPath}`,
    'ar': `${SITE_URL}/ar${cleanPath}`,
    'x-default': `${SITE_URL}${cleanPath}`,
  }
}

// Generate alternates object for Next.js metadata
export function getMetadataAlternates(path: string = '/') {
  return {
    canonical: getCanonicalUrl(path),
    languages: getHreflangAlternates(path),
  }
}

// Generate page metadata with SEO best practices
export function generatePageMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  noIndex = false,
}: {
  title: string
  description: string
  path?: string
  image?: string | { url: string; width?: number; height?: number; alt?: string }
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  keywords?: string[]
  noIndex?: boolean
}): Metadata {
  const canonical = getCanonicalUrl(path)
  const alternates = getMetadataAlternates(path)
  
  const ogImage = image 
    ? (typeof image === 'string' 
        ? { url: image, width: 1200, height: 630, alt: title }
        : image)
    : { url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: siteConfig.name }
  
  const metadata: Metadata = {
    title,
    description,
    keywords: keywords || [...siteConfig.keywords],
    alternates,
    
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      locale: 'en_AE',
      images: [ogImage],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
      }),
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [typeof ogImage === 'string' ? ogImage : ogImage.url],
    },
    
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
    },
  }
  
  return metadata
}

// Generate yacht structured data (JSON-LD)
export function generateYachtJsonLd(yacht: {
  name: string
  slug: string
  description?: string
  price?: number
  currency?: string
  length?: number
  year?: number
  manufacturer?: string
  model?: string
  images?: string[]
  condition?: string
}) {
  const url = `${SITE_URL}/yachts/${yacht.slug}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    name: yacht.name,
    description: yacht.description || `Luxury yacht: ${yacht.name}`,
    url,
    image: yacht.images?.[0] || `${SITE_URL}/og-image.jpg`,
    brand: yacht.manufacturer ? {
      '@type': 'Brand',
      name: yacht.manufacturer,
    } : undefined,
    model: yacht.model,
    offers: yacht.price ? {
      '@type': 'Offer',
      price: yacht.price,
      priceCurrency: yacht.currency || 'AED',
      availability: 'https://schema.org/InStock',
      url,
    } : undefined,
    additionalProperty: [
      yacht.length && {
        '@type': 'PropertyValue',
        name: 'Length',
        value: yacht.length,
        unitCode: 'MTR',
      },
      yacht.year && {
        '@type': 'PropertyValue',
        name: 'Year',
        value: yacht.year,
      },
      yacht.condition && {
        '@type': 'PropertyValue',
        name: 'Condition',
        value: yacht.condition,
      },
    ].filter(Boolean),
  }
}

// Generate blog article structured data (JSON-LD)
export function generateArticleJsonLd(article: {
  title: string
  slug: string
  description?: string
  content?: string
  coverImage?: string
  authorName?: string
  publishedAt?: Date | string
  modifiedAt?: Date | string
  category?: string
  tags?: string[]
}) {
  const url = `${SITE_URL}/blog/${article.slug}`
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: article.title,
    description: article.description || article.content?.substring(0, 160),
    url,
    image: article.coverImage || `${SITE_URL}/og-image.jpg`,
    datePublished: article.publishedAt 
      ? new Date(article.publishedAt).toISOString() 
      : undefined,
    dateModified: article.modifiedAt 
      ? new Date(article.modifiedAt).toISOString() 
      : article.publishedAt 
        ? new Date(article.publishedAt).toISOString()
        : undefined,
    author: article.authorName ? {
      '@type': 'Person',
      name: article.authorName,
    } : {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.category,
    keywords: article.tags?.join(', '),
  }
}

// Generate breadcrumb structured data
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

// Generate FAQ structured data
export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Generate local business structured data
export function generateLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Dubai Marina',
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.0805,
      longitude: 55.1403,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '21:00',
      },
    ],
    priceRange: '$$$$',
    sameAs: [
      siteConfig.instagram,
      siteConfig.youtube,
      siteConfig.tiktok,
    ].filter(Boolean),
  }
}

// Generate website search action (sitelinks searchbox)
export function generateWebsiteSearchJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: siteConfig.name,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/yachts?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
