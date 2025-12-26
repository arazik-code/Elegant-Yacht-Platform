// About Page Client Component

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Shield, Award, Users, Instagram, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

export function AboutContent() {
  const t = useTranslations('about')
  const tCommon = useTranslations('common')
  const tCta = useTranslations('cta')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const milestones = [
    { year: '2018', title: t('milestones.founded.title'), desc: t('milestones.founded.desc') },
    { year: '2020', title: t('milestones.100k.title'), desc: t('milestones.100k.desc') },
    { year: '2022', title: t('milestones.licensed.title'), desc: t('milestones.licensed.desc') },
    { year: '2023', title: t('milestones.500k.title'), desc: t('milestones.500k.desc') },
    { year: '2024', title: t('milestones.900k.title'), desc: t('milestones.900k.desc') },
  ]

  const values = [
    {
      icon: Shield,
      title: t('values.trust.title'),
      description: t('values.trust.desc'),
    },
    {
      icon: Award,
      title: t('values.quality.title'),
      description: t('values.quality.desc'),
    },
    {
      icon: Heart,
      title: t('values.client.title'),
      description: t('values.client.desc'),
    },
    {
      icon: Users,
      title: t('values.team.title'),
      description: t('values.team.desc'),
    },
  ]

  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-yacht.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        </div>

        <div className="container-luxury relative text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 mx-auto
                       bg-gold/10 border border-gold/30 text-gold text-sm font-medium">
            <Shield className="w-4 h-4" />
            {t('hero.badge')}
          </span>

          <h1 className="text-display-md md:text-display-lg font-display font-bold text-foreground mb-6">
            {t('hero.titlePrefix')} <span className="text-gold">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="text-body-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <section className="section-padding bg-card">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`relative aspect-square ${isRtl ? 'lg:order-2' : ''}`}>
              <Image
                src="/images/luxury%20yackht%207.jfif"
                alt={t('founder.name')}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 border border-gold/20" />
            </div>

            <div className={isRtl ? 'lg:order-1' : ''}>
              <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
                {t('founder.badge')}
              </span>
              <h2 className="heading-section text-foreground mb-6">
                {t('founder.name')}
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t('founder.p1')}</p>
                <p>{t('founder.p2')}</p>
                <p>{t('founder.p3')}</p>
                <p className="text-foreground font-medium">
                  "{t('founder.quote')}"
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild variant="primary">
                  <a
                    href={getWhatsAppLink(siteConfig.whatsapp, 'Hello Ebrahim! I came from the website.')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {t('founder.contact')}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-5 h-5" />
                    {t('founder.follow')}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-16 bg-background border-y border-border">
        <div className="container-luxury">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-gold mb-2">
                900K+
              </div>
              <p className="text-muted-foreground">{t('stats.followers')}</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-gold mb-2">
                DED
              </div>
              <p className="text-muted-foreground">{t('stats.licensed')}</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-gold mb-2">
                100+
              </div>
              <p className="text-muted-foreground">{t('stats.yachtsSold')}</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold text-gold mb-2">
                UAE
              </div>
              <p className="text-muted-foreground">{t('stats.location')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
              {t('values.badge')}
            </span>
            <h2 className="heading-section text-foreground">
              {t('values.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="group p-6 bg-muted/50 border border-border
                         hover:border-gold/30 transition-all duration-300"
              >
                <div className="w-12 h-12 mb-4 flex items-center justify-center
                             bg-gold/10 group-hover:bg-gold/20 transition-colors">
                  <value.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-card">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
              {t('journey.badge')}
            </span>
            <h2 className="heading-section text-foreground">
              {t('journey.title')}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, i) => (
              <div
                key={i}
                className={`relative pb-8 last:pb-0 ${isRtl ? 'pr-8 border-r' : 'pl-8 border-l'} border-border`}
              >
                <div className={`absolute top-0 w-4 h-4
                             bg-gold border-4 border-card rounded-full ${isRtl ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}`} />
                <div className="text-gold font-semibold mb-1">{milestone.year}</div>
                <h3 className="text-foreground font-semibold mb-1">{milestone.title}</h3>
                <p className="text-muted-foreground text-sm">{milestone.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DED License */}
      <section className="py-16 bg-background border-y border-border">
        <div className="container-luxury">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <Shield className="w-10 h-10 text-gold" />
              <span className="text-2xl font-display font-bold text-foreground">{t('license.title')}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t('license.description')}
            </p>
            <p className="text-muted-foreground text-sm">
              {t('license.number')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-luxury text-center">
          <h2 className="text-display-sm font-display font-bold text-foreground mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="primary">
              <Link href="/yachts">
                {tCta('browse')}
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                {tCommon('contactUs')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
