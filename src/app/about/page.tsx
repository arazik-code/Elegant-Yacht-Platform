// About Page

import { Metadata } from 'next'
import { AboutContent } from '@/components/about/AboutContent'
import { getMetadataAlternates, generateLocalBusinessJsonLd } from '@/lib/seo'
import { siteConfig } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About Bimo Yacht | Dubai Luxury Yacht Specialists',
  description: 'Learn about Bimo Yacht, founded by Ebrahim Al Bimo. 900K+ Instagram followers, DED licensed, and Dubai\'s trusted luxury yacht broker since 2018.',
  alternates: getMetadataAlternates('/about'),
  openGraph: {
    title: 'About Bimo Yacht | Dubai Luxury Yacht Specialists',
    description: 'Learn about Bimo Yacht, founded by Ebrahim Al Bimo. Dubai\'s trusted luxury yacht broker.',
    type: 'website',
  },
}

export default function AboutPage() {
  // Local Business structured data
  const localBusinessSchema = generateLocalBusinessJsonLd()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <AboutContent />
    </>
  )
}
