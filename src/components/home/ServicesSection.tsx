'use client'

// Services Section

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Anchor, Calendar, Ship } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ServicesSection() {
  const t = useTranslations('services')

  const services = [
    {
      icon: Anchor,
      title: t('sales.title'),
      description: t('sales.description'),
      href: '/yachts?type=SALE',
      image: '/images/luxury%20yackht%202.jfif',
    },
    {
      icon: Calendar,
      title: t('charter.title'),
      description: t('charter.description'),
      href: '/charter',
      image: '/images/luxury%20yackht%203.jfif',
    },
    {
      icon: Ship,
      title: t('sell.title'),
      description: t('sell.description'),
      href: '/sell-your-yacht',
      image: '/images/luxury%20yackht%204.jfif',
    },
  ]

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <div className="absolute inset-0 bg-gradient-radial from-gold/20 via-transparent to-transparent" />
      </div>

      <div className="container-luxury relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block"
          >
            {t('badge')}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="heading-section text-foreground mb-4"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Link
                href={service.href}
                className="group block h-full"
              >
                <div className="relative h-full bg-background border border-border 
                             overflow-hidden transition-all duration-500
                             hover:border-gold/30 hover:shadow-luxury">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-700
                               group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t 
                                 from-background via-background/50 to-transparent" />

                    {/* Icon overlay */}
                    <div className="absolute top-6 left-6 rtl:left-auto rtl:right-6">
                      <div className="w-14 h-14 flex items-center justify-center
                                   bg-gold/10 backdrop-blur-sm border border-gold/30
                                   group-hover:bg-gold group-hover:border-gold
                                   transition-all duration-500">
                        <service.icon className="w-6 h-6 text-gold 
                                               group-hover:text-jet transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-display font-semibold text-foreground mb-3
                                group-hover:text-gold transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Link */}
                    <span className="inline-flex items-center gap-2 text-gold text-sm font-medium">
                      {t('learnMore')}
                      <ArrowRight className="w-4 h-4 transition-transform 
                                          group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
