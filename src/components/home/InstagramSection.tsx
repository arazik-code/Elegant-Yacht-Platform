'use client'

// Instagram Credibility Section

import { motion } from 'framer-motion'
import { Instagram, Users, Heart, MessageCircle } from 'lucide-react'
import { siteConfig } from '@/lib/constants'
import { useTranslations } from 'next-intl'

export function InstagramSection() {
  const t = useTranslations('instagram')

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background opacity-50" />

      {/* Instagram gradient overlay */}
      <div className="absolute top-0 right-0 w-1/2 h-full">
        <div className="absolute inset-0 opacity-10"
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          }}
        />
      </div>

      <div className="container-luxury relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
              {t('badge')}
            </span>
            <h2 className="heading-section text-foreground mb-6">
              {t('title')}{' '}
              <span className="text-gold">{siteConfig.instagramFollowers}</span>{' '}
              {t('titleSuffix')}
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8">
              {t('subtitle')}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-3xl font-display font-bold text-gold mb-1">
                  900K+
                </div>
                <div className="text-sm text-muted-foreground">{t('stats.followers')}</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-foreground mb-1">
                  1.2M+
                </div>
                <div className="text-sm text-muted-foreground">{t('stats.views')}</div>
              </div>
              <div>
                <div className="text-3xl font-display font-bold text-foreground mb-1">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">{t('stats.sold')}</div>
              </div>
            </div>

            {/* Instagram Button */}
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4
                       bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888]
                       text-white font-semibold
                       hover:shadow-lg hover:shadow-pink-500/30
                       transition-all duration-300 group"
            >
              <Instagram className="w-5 h-5" />
              <span>{t('follow')} {siteConfig.instagramHandle}</span>
            </a>
          </motion.div>

          {/* Instagram Feed Preview (Placeholder Grid) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                '/images/insta-1.jpg',
                '/images/insta-2.jpg',
                '/images/insta-3.jpg',
                '/images/insta-4.jpg',
                '/images/service-sales.jpg',
                '/images/service-charter.jpg',
                '/images/service-sell.jpg',
                '/images/insta-1.jpg', // Reusing for grid effect
                '/images/insta-2.jpg',
              ].map((img, i) => (
                <motion.a
                  key={i}
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative aspect-square bg-muted overflow-hidden
                           group cursor-pointer"
                  style={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-4 text-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{1200 + (i * 142 % 3000)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{25 + (i * 37 % 100)}</span>
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 rtl:-right-auto rtl:-left-4 w-32 h-32 
                         border border-gold/20 -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
