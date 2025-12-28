// Yachts Listing Page

import { Suspense } from 'react'
import { Metadata } from 'next'
import { YachtFilters } from '@/components/yacht/YachtFilters'
import { YachtGrid } from '@/components/yacht/YachtGrid'
import { siteConfig } from '@/lib/constants'
import { getTranslations } from 'next-intl/server'
import { getMetadataAlternates, generateBreadcrumbJsonLd } from '@/lib/seo'

// Revalidate page every 60 seconds (ISR)
export const revalidate = 60

// Enable dynamic rendering with ISR for search params
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Luxury Yachts for Sale & Charter',
  description: 'Browse our exclusive collection of luxury yachts for sale and charter in Dubai. Majesty, Azimut, Sunseeker, Ferretti and more.',
  alternates: getMetadataAlternates('/yachts'),
  openGraph: {
    title: 'Luxury Yachts for Sale & Charter | Bimo Yacht',
    description: 'Browse our exclusive collection of luxury yachts in Dubai.',
  },
}

interface YachtsPageProps {
  searchParams: Promise<{
    type?: string
    brand?: string
    minLength?: string
    maxLength?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }>
}

export default async function YachtsPage({ searchParams }: YachtsPageProps) {
  const resolvedParams = await searchParams
  const t = await getTranslations('yachts')

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Hero Header */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/yacht-sell.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        </div>
        <div className="container-luxury relative">
          <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
            {t('badge')}
          </span>
          <h1 className="text-display-md md:text-display-lg font-display font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-body-lg text-muted-foreground max-w-2xl">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="section-padding">
        <div className="container-luxury">
          {/* Filters */}
          <YachtFilters searchParams={resolvedParams} />

          {/* Yacht Grid */}
          <Suspense fallback={<YachtGridSkeleton />}>
            <YachtGrid searchParams={resolvedParams} />
          </Suspense>
        </div>
      </section>
    </main>
  )
}

function YachtGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="card-luxury animate-pulse">
          <div className="aspect-yacht bg-muted" />
          <div className="p-6 space-y-3">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-6 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
