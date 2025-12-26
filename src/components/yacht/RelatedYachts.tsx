// Related Yachts Component - Server Component

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { YachtCard } from '@/components/yacht/YachtCard'
import prisma from '@/lib/db'

interface RelatedYachtsProps {
  currentYachtId: string
  type: 'SALE' | 'CHARTER'
  brand?: string | null
  locale?: string
}

const translations = {
  en: {
    youMayLike: 'You May Also Like',
    similarYachts: 'Similar Yachts',
    viewAll: 'View All',
    sale: 'Yachts for Sale',
    charter: 'Charter Yachts'
  },
  ar: {
    youMayLike: 'قد يعجبك أيضاً',
    similarYachts: 'يخوت مشابهة',
    viewAll: 'عرض الكل',
    sale: 'يخوت للبيع',
    charter: 'يخوت للإيجار'
  }
}

async function getRelatedYachts(currentId: string, type: string, brand: string | null) {
  try {
    // First try to find yachts of the same brand
    let yachts = await prisma.yacht.findMany({
      where: {
        id: { not: currentId },
        status: 'AVAILABLE',
        type: type as 'SALE' | 'CHARTER',
        ...(brand ? { brand } : {}),
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
      orderBy: [
        { featured: 'desc' },
        { priority: 'desc' },
      ],
      take: 3,
    })

    // If not enough results, fill with same type
    if (yachts.length < 3) {
      const moreYachts = await prisma.yacht.findMany({
        where: {
          id: { not: currentId, notIn: yachts.map((y: any) => y.id) },
          status: 'AVAILABLE',
          type: type as 'SALE' | 'CHARTER',
        },
        include: {
          media: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
        orderBy: [
          { featured: 'desc' },
          { priority: 'desc' },
        ],
        take: 3 - yachts.length,
      })
      yachts = [...yachts, ...moreYachts]
    }

    return yachts
  } catch (error) {
    console.warn('Error fetching related yachts (likely network restriction):', error)
    return []
  }
}

export async function RelatedYachts({ currentYachtId, type, brand, locale = 'en' }: RelatedYachtsProps) {
  const yachts = await getRelatedYachts(currentYachtId, type, brand ?? null)
  const t = translations[locale as 'en' | 'ar'] || translations.en
  const isRtl = locale === 'ar'

  if (yachts.length === 0) {
    return null
  }

  return (
    <section className="section-padding bg-card border-t border-border" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container-luxury">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className={`text-gold text-sm font-medium tracking-widest uppercase mb-2 block ${isRtl ? 'font-arabic' : ''}`}>
              {t.youMayLike}
            </span>
            <h2 className={`heading-section text-foreground ${isRtl ? 'font-arabic' : ''}`}>
              {t.similarYachts}
            </h2>
          </div>

          <Link
            href={`/yachts?type=${type}`}
            className={`hidden md:flex items-center gap-2 text-gold hover:text-gold-300 transition-colors group ${isRtl ? 'font-arabic' : ''}`}
          >
            {t.viewAll}
            {isRtl ?
              <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1 rotate-180" /> :
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            }
          </Link>
        </div>

        {/* Grid */}
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
            />
          ))}
        </div>

        {/* Mobile Link */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href={`/yachts?type=${type}`}
            className={`inline-flex items-center gap-2 text-gold ${isRtl ? 'font-arabic' : ''}`}
          >
            {t.viewAll} {type === 'SALE' ? (isRtl ? 'لليخوت' : 'Yachts for Sale') : (isRtl ? 'للتأجير' : 'Charter Yachts')}
            {isRtl ?
              <ArrowRight className="w-4 h-4 rotate-180" /> :
              <ArrowRight className="w-4 h-4" />
            }
          </Link>
        </div>
      </div>
    </section>
  )
}
