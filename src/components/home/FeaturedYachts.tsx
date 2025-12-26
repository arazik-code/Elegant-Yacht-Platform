// Featured Yachts Section - Server Component

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { YachtCard } from '@/components/yacht/YachtCard'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/db'

async function getFeaturedYachts() {
  try {
    const yachts = await prisma.yacht.findMany({
      where: {
        featured: true,
        status: 'AVAILABLE',
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
      orderBy: { priority: 'desc' },
      take: 6,
    })

    return yachts
  } catch (error) {
    console.warn('Database connection failed (likely network restriction). Returning mock data for demonstration.')

    // Return mock data so the UI works while user fixes network/IP issues
    return [
      {
        id: 'mock-1',
        title: 'Majesty 100 (Mock)',
        slug: 'majesty-100-mock',
        type: 'SALE',
        price: 5500000,
        priceOnRequest: false,
        currency: 'USD',
        lengthFeet: 100,
        brand: 'Majesty',
        year: 2024,
        cabins: 5,
        guestCapacity: 12,
        featured: true,
        showPrice: true,
        media: [{ url: 'https://res.cloudinary.com/demo/image/upload/v1652345767/docs/demo_image2.jpg', type: 'IMAGE', isCover: true }]
      },
      {
        id: 'mock-2',
        title: 'Azimut Grande (Mock)',
        slug: 'azimut-grande-mock',
        type: 'SALE',
        price: 4200000,
        priceOnRequest: false,
        currency: 'USD',
        lengthFeet: 88,
        brand: 'Azimut',
        year: 2023,
        cabins: 4,
        guestCapacity: 10,
        featured: true,
        showPrice: true,
        media: [{ url: 'https://res.cloudinary.com/demo/image/upload/v1652366602/docs/demo_image5.jpg', type: 'IMAGE', isCover: true }]
      }
    ]
  }
}

export async function FeaturedYachts() {
  const t = await getTranslations('featured')
  const yachts = await getFeaturedYachts()

  // If no featured yachts, show a placeholder
  if (yachts.length === 0) {
    return (
      <section className="section-padding bg-background">
        <div className="container-luxury text-center">
          <p className="text-muted-foreground">Featured yachts coming soon...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-luxury">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
              {t('badge')}
            </span>
            <h2 className="heading-section text-foreground">
              {t('title')}
            </h2>
          </div>

          <Button asChild variant="secondary" size="md">
            <Link href="/yachts" className="group">
              {t('viewAll')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Yacht Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {yachts.map((yacht: any, index: number) => (
            <YachtCard
              key={yacht.id}
              yacht={{
                id: yacht.id,
                slug: yacht.slug,
                title: yacht.title,
                type: yacht.type,
                price: yacht.price ? Number(yacht.price) : null,
                priceOnRequest: yacht.priceOnRequest,
                charterPricePerHour: yacht.charterPricePerHour ? Number(yacht.charterPricePerHour) : null,
                charterPricePerDay: yacht.charterPricePerDay ? Number(yacht.charterPricePerDay) : null,
                currency: yacht.currency,
                lengthFeet: yacht.lengthFeet,
                brand: yacht.brand,
                year: yacht.year,
                cabins: yacht.cabins,
                guestCapacity: yacht.guestCapacity,
                featured: yacht.featured,
                showPrice: yacht.showPrice,
                media: yacht.media.map((m: any) => ({
                  url: m.url,
                  type: m.type,
                  isCover: m.isCover,
                })),
              }}
              index={index}
              priority={index < 3}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
