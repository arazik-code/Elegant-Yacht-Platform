'use client'

// Trust Badges Section

import { motion } from 'framer-motion'
import { Shield, MapPin, Instagram, Award } from 'lucide-react'
import { useTranslations } from 'next-intl'

const iconMap = {
  Shield,
  MapPin,
  Instagram,
  Award,
}

export function TrustBadges() {
  const t = useTranslations('trust')

  const trustBadges = [
    {
      icon: 'Shield',
      title: t('badges.certified.title'),
      description: t('badges.certified.description'),
    },
    {
      icon: 'MapPin',
      title: t('badges.dubai.title'),
      description: t('badges.dubai.description'),
    },
    {
      icon: 'Instagram',
      title: t('badges.followers.title'),
      description: t('badges.followers.description'),
    },
    {
      icon: 'Award',
      title: t('badges.service.title'),
      description: t('badges.service.description'),
    },
  ]

  return (
    <section className="relative py-16 bg-card border-y border-border">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(201, 162, 77, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container-luxury relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {trustBadges.map((badge, index) => {
            const Icon = iconMap[badge.icon as keyof typeof iconMap]

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-4">
                  {/* Icon container */}
                  <div className="w-16 h-16 flex items-center justify-center
                               bg-gold/10 border border-gold/30
                               group-hover:bg-gold/20 group-hover:border-gold/50
                               transition-all duration-300">
                    <Icon className="w-7 h-7 text-gold" />
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gold/10 blur-xl opacity-0 
                               group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <h3 className="text-foreground font-semibold mb-1">
                  {badge.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {badge.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
