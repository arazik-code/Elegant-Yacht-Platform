// Home Page - Bimo Yacht
// Luxury yacht sales & charter landing page

import { Suspense } from 'react'
import { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustBadges } from '@/components/home/TrustBadges'
import { FeaturedYachts } from '@/components/home/FeaturedYachts'
import { ServicesSection } from '@/components/home/ServicesSection'
import { InstagramSection } from '@/components/home/InstagramSection'
import { CTASection } from '@/components/home/CTASection'
import { siteConfig } from '@/lib/constants'

// Revalidate homepage every 60 seconds
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Luxury Yachts for Sale & Charter in Dubai',
  description: 'Bimo Yacht - Dubai\'s premier luxury yacht brokerage. Browse exclusive yachts for sale and charter. DED Licensed, 900K+ Instagram followers. WhatsApp for instant inquiry.',
  openGraph: {
    title: `${siteConfig.name} | Luxury Yachts Dubai`,
    description: 'Dubai\'s premier luxury yacht brokerage. Exclusive yachts for sale and charter.',
    images: ['/og-image.jpg'],
  },
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section - Fullscreen with video */}
      <HeroSection />
      
      {/* Trust Badges */}
      <TrustBadges />
      
      {/* Featured Yachts */}
      <Suspense fallback={<FeaturedYachtsSkeleton />}>
        <FeaturedYachts />
      </Suspense>
      
      {/* Services Section */}
      <ServicesSection />
      
      {/* Instagram Credibility */}
      <InstagramSection />
      
      {/* Final CTA */}
      <CTASection />
    </>
  )
}

function FeaturedYachtsSkeleton() {
  return (
    <section className="section-padding bg-jet">
      <div className="container-luxury">
        <div className="text-center mb-12">
          <div className="h-4 bg-white/5 rounded w-32 mx-auto mb-4 animate-pulse" />
          <div className="h-10 bg-white/5 rounded w-64 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-luxury animate-pulse">
              <div className="aspect-yacht bg-white/5" />
              <div className="p-6 space-y-3">
                <div className="h-3 bg-white/5 rounded w-1/3" />
                <div className="h-6 bg-white/5 rounded w-2/3" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
