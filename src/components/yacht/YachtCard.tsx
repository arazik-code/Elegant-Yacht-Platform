'use client'

// Luxury Yacht Card Component
// Used in grids and carousels throughout the site

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Anchor, Users, Bed, Ruler, Heart, Scale } from 'lucide-react'
import { cn, formatCurrency, formatPriceShort } from '@/lib/utils'
import { useFavoritesStore, useCompareStore } from '@/lib/stores'
import { useTranslations } from 'next-intl'

interface YachtCardProps {
  yacht: {
    id: string
    slug: string
    title: string
    type: 'SALE' | 'CHARTER' | string
    price?: number | null
    priceOnRequest?: boolean
    charterPricePerWeek?: number | null
    currency?: string
    lengthFeet?: number | null
    brand?: string | null
    year?: number | null
    cabins?: number | null
    guestCapacity?: number | null
    featured?: boolean
    showPrice?: boolean
    media?: Array<{
      url: string
      type: string
      isCover: boolean
    }>
  }
  index?: number
  priority?: boolean
  showFavorite?: boolean
  showCompare?: boolean
}

export function YachtCard({ yacht, index = 0, priority = false, showFavorite = false, showCompare = false }: YachtCardProps) {
  const t = useTranslations('yachts')

  // Get cover image
  const coverImage = yacht.media?.find(m => m.isCover)?.url
    || yacht.media?.[0]?.url
    || '/images/luxury%20yackht.jfif'

  // Favorites and compare stores
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const { isInCompare, toggleCompare, canAddMore } = useCompareStore()

  const yachtIsFavorite = isFavorite(yacht.id)
  const yachtInCompare = isInCompare(yacht.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(yacht.id, yacht as any)
  }

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleCompare(yacht.id, yacht as any)
  }

  // Format price display
  const getPriceDisplay = () => {
    if (yacht.type === 'CHARTER') {
      if (yacht.charterPricePerWeek) {
        return `${t('from')} ${formatCurrency(Number(yacht.charterPricePerWeek), yacht.currency)} /${t('perWeek') || 'week'}`
      }
    }

    if (yacht.priceOnRequest || !yacht.showPrice) {
      return t('priceOnRequest')
    }

    if (yacht.price) {
      return formatCurrency(Number(yacht.price), yacht.currency)
    }

    return t('priceOnRequest')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group card-luxury"
    >
      <Link href={`/yachts/${yacht.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-yacht overflow-hidden">
          <Image
            src={coverImage}
            alt={yacht.title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-700 
                     group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-jet via-transparent to-transparent 
                        opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

          {/* Type Badge */}
          <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1',
              'text-xs font-semibold uppercase tracking-wider',
              yacht.type === 'SALE'
                ? 'bg-gold/90 text-jet'
                : 'bg-navy/90 text-white'
            )}>
              {yacht.type === 'SALE' ? t('forSale') : t('forCharter')}
            </span>
          </div>

          {/* Featured Badge */}
          {yacht.featured && (
            <div className={cn(
              "absolute top-4",
              (showFavorite || showCompare) ? "right-14 rtl:right-auto rtl:left-14" : "right-4 rtl:right-auto rtl:left-4"
            )}>
              <span className="inline-flex items-center gap-1 px-2 py-1 
                           bg-background/80 backdrop-blur-sm text-gold 
                           text-xs font-medium border border-gold/30">
                ★ {t('featured')}
              </span>
            </div>
          )}

          {/* Favorite & Compare Buttons */}
          {(showFavorite || showCompare) && (
            <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex flex-col gap-2 z-10">
              {showFavorite && (
                <button
                  onClick={handleFavoriteClick}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                    "bg-background/60 backdrop-blur-sm border border-white/20",
                    "hover:bg-background/80 hover:border-gold/50",
                    yachtIsFavorite && "bg-red-500/80 border-red-500/50"
                  )}
                  title={yachtIsFavorite ? t('removeFromFavorites') : t('addToFavorites')}
                >
                  <Heart
                    className={cn(
                      "w-4 h-4 transition-colors",
                      yachtIsFavorite ? "text-white fill-white" : "text-foreground"
                    )}
                  />
                </button>
              )}
              {showCompare && (
                <button
                  onClick={handleCompareClick}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full transition-all",
                    "bg-background/60 backdrop-blur-sm border border-white/20",
                    "hover:bg-background/80 hover:border-gold/50",
                    yachtInCompare && "bg-gold/80 border-gold/50",
                    !canAddMore() && !yachtInCompare && "opacity-50 cursor-not-allowed"
                  )}
                  title={yachtInCompare ? t('removeFromCompare') : t('addToCompare')}
                  disabled={!canAddMore() && !yachtInCompare}
                >
                  <Scale
                    className={cn(
                      "w-4 h-4 transition-colors",
                      yachtInCompare ? "text-jet" : "text-foreground"
                    )}
                  />
                </button>
              )}
            </div>
          )}

          {/* Quick Specs Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4
                        translate-y-full group-hover:translate-y-0
                        transition-transform duration-500 ease-out">
            <div className="flex items-center justify-center gap-6 text-white/90 text-sm">
              {yacht.lengthFeet && (
                <span className="flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  {yacht.lengthFeet}ft
                </span>
              )}
              {yacht.cabins && (
                <span className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  {yacht.cabins} Cabins
                </span>
              )}
              {yacht.guestCapacity && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {yacht.guestCapacity} Guests
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Brand & Year */}
          <div className="flex items-center gap-2 text-xs text-gold mb-2">
            {yacht.brand && <span>{yacht.brand}</span>}
            {yacht.brand && yacht.year && <span>•</span>}
            {yacht.year && <span>{yacht.year}</span>}
          </div>

          {/* Title */}
          <h3 className="text-xl font-display font-semibold text-foreground mb-3
                       group-hover:text-gold transition-colors duration-300">
            {yacht.title}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">
              {getPriceDisplay()}
            </p>

            {/* Arrow */}
            <span className="flex items-center justify-center w-10 h-10 
                         bg-muted/50 group-hover:bg-gold/10
                         border border-border group-hover:border-gold/30
                         transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-gold 
                                   transition-colors group-hover:translate-x-0.5 rtl:rotate-180" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

// Skeleton loader for YachtCard
export function YachtCardSkeleton() {
  return (
    <div className="card-luxury animate-pulse">
      <div className="aspect-yacht bg-muted" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-6 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  )
}
