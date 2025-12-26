// Charter Page

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, MapPin, Sparkles, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { YachtCard } from '@/components/yacht/YachtCard'
import { siteConfig, charterRoutes } from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

export default function CharterPage() {
  const t = useTranslations('charter')
  const tYachts = useTranslations('yachts')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const [yachts, setYachts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchYachts() {
      try {
        const res = await fetch('/api/yachts?type=CHARTER&limit=6')
        const data = await res.json()
        setYachts(data.yachts || [])
      } catch (error) {
        console.error('Error fetching yachts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchYachts()
  }, [])

  const features = [
    { icon: Clock, titleKey: 'features.hours.title', descKey: 'features.hours.desc' },
    { icon: Users, titleKey: 'features.guests.title', descKey: 'features.guests.desc' },
    { icon: MapPin, titleKey: 'features.routes.title', descKey: 'features.routes.desc' },
    { icon: Sparkles, titleKey: 'features.crew.title', descKey: 'features.crew.desc' },
  ]

  return (
    <main className="min-h-screen bg-jet pt-20">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/yackht%204k.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-jet via-jet/80 to-transparent" />
        </div>

        <div className="container-luxury relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-6
                         bg-gold/10 border border-gold/30 text-gold text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {t('hero.badge')}
            </span>

            <h1 className="text-display-md md:text-display-lg font-display font-bold text-white mb-6">
              {t('hero.title')} <span className="text-gold">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-body-xl text-white/70 mb-8">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="primary">
                <a
                  href={getWhatsAppLink(siteConfig.whatsapp, 'Hello! I\'d like to book a yacht charter.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('bookNow')}
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#yachts">
                  {t('hero.viewFleet')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-navy border-y border-white/5">
        <div className="container-luxury">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center
                             bg-gold/10 border border-gold/30">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-white font-semibold mb-1">{t(feature.titleKey)}</h3>
                <p className="text-white/50 text-sm">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
              {t('routes.badge')}
            </span>
            <h2 className="heading-section text-white">
              {t('routes.title')}
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {charterRoutes.map((route) => (
              <span
                key={route}
                className="px-6 py-3 bg-white/5 border border-white/10
                         text-white hover:border-gold/30 hover:text-gold
                         transition-colors cursor-default"
              >
                {route}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Charter Fleet */}
      <section id="yachts" className="section-padding bg-navy">
        <div className="container-luxury">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
                {t('fleet.badge')}
              </span>
              <h2 className="heading-section text-white">
                {t('fleet.title')}
              </h2>
            </div>

            <Button asChild variant="secondary">
              <Link href="/yachts?type=CHARTER">
                {tCommon('viewDetails')}
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rtl:rotate-180' : ''}`} />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-white/50">{tCommon('loading')}</p>
            </div>
          ) : yachts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yachts.map((yacht: any, index: number) => (
                <YachtCard
                  key={yacht.id}
                  yacht={{
                    id: yacht.id,
                    slug: yacht.slug,
                    title: yacht.title,
                    type: yacht.type,
                    charterPricePerWeek: yacht.charterPricePerWeek ? Number(yacht.charterPricePerWeek) : null,
                    currency: yacht.currency,
                    lengthFeet: yacht.lengthFeet,
                    brand: yacht.brand,
                    year: yacht.year,
                    guestCapacity: yacht.guestCapacity,
                    cabins: yacht.cabins,
                    featured: yacht.featured,
                    showPrice: yacht.showPrice,
                    media: (yacht.media || []).map((m: any) => ({
                      url: m.url,
                      type: m.type,
                      isCover: m.isCover,
                    })),
                  }}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/50">{t('fleet.empty')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-jet">
        <div className="container-luxury text-center">
          <h2 className="text-display-sm font-display font-bold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="primary">
              <a
                href={getWhatsAppLink(siteConfig.whatsapp, 'Hello! I\'d like to book a yacht charter.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('cta.whatsapp')}
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href={`tel:${siteConfig.phone}`}>
                <Phone className="w-4 h-4" />
                {siteConfig.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
