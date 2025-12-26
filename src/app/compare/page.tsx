// Compare Page - Luxury Visual Comparison
// Card-based layout, no Excel tables, advisor not seller

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Scale, Plus, X, Share2, Ship, Check, Minus, Anchor, Users, Bed, Ruler, Calendar, DollarSign } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCompareStore } from '@/lib/stores'
import { Button } from '@/components/ui/Button'
import { Yacht } from '@/lib/types'
import { formatCurrency, cn } from '@/lib/utils'
import { useLocaleInfo } from '@/components/providers'

// Key specs to compare (focused, no overload)
const keySpecs = [
  { key: 'lengthFeet', label: { en: 'Length', ar: 'الطول' }, icon: Ruler, format: (v: number) => `${v} ft`, higherBetter: true },
  { key: 'price', label: { en: 'Price', ar: 'السعر' }, icon: DollarSign, format: (v: number, y: Yacht) => y.priceOnRequest ? 'POA' : formatCurrency(v, y.currency), higherBetter: false },
  { key: 'year', label: { en: 'Year Built', ar: 'سنة البناء' }, icon: Calendar, format: (v: number) => String(v), higherBetter: true },
  { key: 'cabins', label: { en: 'Cabins', ar: 'الكبائن' }, icon: Bed, format: (v: number) => String(v), higherBetter: true },
  { key: 'guestCapacity', label: { en: 'Guests', ar: 'الضيوف' }, icon: Users, format: (v: number) => String(v), higherBetter: true },
]

// Key amenities for luxury comparison
const keyAmenities = [
  { key: 'jacuzzi', label: { en: 'Jacuzzi', ar: 'جاكوزي' } },
  { key: 'beachClub', label: { en: 'Beach Club', ar: 'نادي الشاطئ' } },
  { key: 'gym', label: { en: 'Gym', ar: 'صالة رياضية' } },
  { key: 'cinema', label: { en: 'Cinema', ar: 'سينما' } },
  { key: 'helipad', label: { en: 'Helipad', ar: 'مهبط طائرات' } },
]

export default function ComparePage() {
  const t = useTranslations('compare')
  const searchParams = useSearchParams()
  const { locale } = useLocaleInfo()
  const { compareList, removeFromCompare, clearCompare, getShareableLink, loadFromShareLink } = useCompareStore()
  const [yachts, setYachts] = useState<Yacht[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Load from share link if present
  useEffect(() => {
    const sharedIds = searchParams.get('ids')
    if (sharedIds) {
      const ids = sharedIds.split(',').filter(Boolean)
      loadFromShareLink(ids)
    }
  }, [searchParams, loadFromShareLink])

  // Fetch yacht data
  useEffect(() => {
    async function fetchYachts() {
      if (compareList.length === 0) {
        setYachts([])
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/yachts?ids=${compareList.join(',')}`)
        if (response.ok) {
          const data = await response.json()
          setYachts(data.yachts || [])
        }
      } catch (error) {
        console.error('Error fetching yachts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchYachts()
  }, [compareList])

  const handleShare = async () => {
    const link = getShareableLink()
    if (!link) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Yacht Comparison - Bimo Yacht',
          text: 'Compare these yachts!',
          url: link,
        })
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Find best value for highlighting
  const getBestIndex = (key: string, higherBetter: boolean) => {
    if (yachts.length < 2) return null

    const values = yachts
      .map((y, i) => ({ value: y[key as keyof Yacht] as number, index: i }))
      .filter(v => v.value !== null && v.value !== undefined && typeof v.value === 'number')

    if (values.length < 2) return null

    const sorted = [...values].sort((a, b) =>
      higherBetter ? b.value - a.value : a.value - b.value
    )
    return sorted[0]?.index
  }

  // Check if yacht has amenity (from amenities array or highlights)
  const hasAmenity = (yacht: Yacht, amenityKey: string) => {
    const amenities = yacht.amenitiesEn || []
    const highlights = yacht.highlightsEn || []
    const allFeatures = [...amenities, ...highlights].map(s => s.toLowerCase())

    const patterns: Record<string, string[]> = {
      jacuzzi: ['jacuzzi', 'hot tub', 'spa'],
      beachClub: ['beach club', 'beach', 'swim platform'],
      gym: ['gym', 'fitness', 'workout'],
      cinema: ['cinema', 'theater', 'movie'],
      helipad: ['helipad', 'helicopter'],
    }

    return patterns[amenityKey]?.some(pattern =>
      allFeatures.some(f => f.includes(pattern))
    ) ?? false
  }

  return (
    <div className="min-h-screen bg-jet pt-24 pb-16">
      <div className="container-luxury">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-white/60">
              {t('subtitle')} • {compareList.length}/3 yachts
            </p>
          </div>

          {compareList.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="hidden sm:flex"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Share'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Clear comparison?')) {
                    clearCompare()
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" />
                {t('clearAll')}
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 animate-pulse aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : compareList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Scale className="w-16 h-16 mx-auto mb-6 text-white/20" />
            <h2 className="text-2xl font-display font-semibold text-white mb-3">
              {t('empty')}
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              {t('emptyDesc')}
            </p>
            <Link href="/yachts">
              <Button size="lg">
                <Ship className="w-5 h-5 mr-2" />
                {t('explore')}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Yacht Cards - Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((index) => {
                const yacht = yachts[index]

                if (!yacht) {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="aspect-[3/4] border-2 border-dashed border-white/20 rounded-2xl 
                                 flex flex-col items-center justify-center text-white/40
                                 hover:border-gold/40 transition-colors"
                    >
                      <Plus className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">{t('addAnother')}</p>
                      <Link href="/yachts">
                        <Button variant="ghost" size="sm">
                          Browse Yachts
                        </Button>
                      </Link>
                    </motion.div>
                  )
                }

                const coverImage = yacht.media?.find(m => m.isCover) || yacht.media?.[0]

                return (
                  <motion.div
                    key={yacht.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    {/* Card */}
                    <div className="bg-navy/50 rounded-2xl overflow-hidden border border-white/10">
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCompare(yacht.id)}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/60 backdrop-blur-sm 
                                   rounded-full text-white/70 hover:text-white hover:bg-red-500/80 
                                   transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Image - Hero */}
                      <div className="aspect-[4/3] relative">
                        {coverImage ? (
                          <Image
                            src={coverImage.url}
                            alt={yacht.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-navy flex items-center justify-center">
                            <Ship className="w-16 h-16 text-white/20" />
                          </div>
                        )}

                        {/* Type Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={cn(
                            'px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full',
                            yacht.type === 'SALE'
                              ? 'bg-gold text-jet'
                              : 'bg-white/20 backdrop-blur-sm text-white'
                          )}>
                            {yacht.type === 'SALE' ? 'For Sale' : 'Charter'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <Link href={`/yachts/${yacht.slug}`}>
                          <h3 className="text-xl font-display font-semibold text-white 
                                       hover:text-gold transition-colors mb-1">
                            {yacht.title}
                          </h3>
                        </Link>
                        <p className="text-white/60 text-sm mb-4">
                          {yacht.brand} • {yacht.year} • {yacht.lengthFeet}ft
                        </p>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                          <Link href={`/yachts/${yacht.slug}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/yachts/${yacht.slug}#inquiry`} className="flex-1">
                            <Button size="sm" className="w-full">
                              Inquire
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Key Specs Comparison */}
            {yachts.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-navy/30 rounded-2xl p-8 border border-white/10"
              >
                <h2 className="text-lg font-display font-semibold text-gold mb-6 flex items-center gap-2">
                  <Anchor className="w-5 h-5" />
                  Key Specifications
                </h2>

                <div className="space-y-4">
                  {keySpecs.map((spec) => {
                    const bestIndex = getBestIndex(spec.key, spec.higherBetter)
                    const Icon = spec.icon

                    return (
                      <div
                        key={spec.key}
                        className="grid grid-cols-4 gap-4 items-center py-3 border-b border-white/5 last:border-0"
                      >
                        {/* Label */}
                        <div className="flex items-center gap-3 text-white/70">
                          <Icon className="w-4 h-4 text-gold/60" />
                          <span className="text-sm font-medium">
                            {spec.label[locale as 'en' | 'ar'] || spec.label.en}
                          </span>
                        </div>

                        {/* Values */}
                        {[0, 1, 2].map((index) => {
                          const yacht = yachts[index]
                          if (!yacht) {
                            return <div key={index} className="text-center text-white/20">—</div>
                          }

                          const value = yacht[spec.key as keyof Yacht] as number
                          const isBest = bestIndex === index && value !== null && value !== undefined

                          return (
                            <div
                              key={index}
                              className={cn(
                                "text-center text-sm font-medium transition-colors",
                                isBest ? "text-gold" : "text-white"
                              )}
                            >
                              <span className="flex items-center justify-center gap-1">
                                {value !== null && value !== undefined
                                  ? spec.format(value, yacht)
                                  : '—'
                                }
                                {isBest && <Check className="w-4 h-4" />}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Amenities Comparison */}
            {yachts.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-navy/30 rounded-2xl p-8 border border-white/10"
              >
                <h2 className="text-lg font-display font-semibold text-gold mb-6 flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  Features & Amenities
                </h2>

                <div className="space-y-4">
                  {keyAmenities.map((amenity) => (
                    <div
                      key={amenity.key}
                      className="grid grid-cols-4 gap-4 items-center py-3 border-b border-white/5 last:border-0"
                    >
                      {/* Label */}
                      <div className="text-white/70 text-sm font-medium">
                        {amenity.label[locale as 'en' | 'ar'] || amenity.label.en}
                      </div>

                      {/* Values */}
                      {[0, 1, 2].map((index) => {
                        const yacht = yachts[index]
                        if (!yacht) {
                          return <div key={index} className="text-center text-white/20">—</div>
                        }

                        const has = hasAmenity(yacht, amenity.key)

                        return (
                          <div
                            key={index}
                            className="flex justify-center"
                          >
                            {has ? (
                              <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-400" />
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                                <Minus className="w-4 h-4 text-white/30" />
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Need Help CTA */}
            {yachts.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-8"
              >
                <p className="text-white/60 mb-4">
                  Need help deciding? Our yacht advisors are here to assist.
                </p>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact an Advisor
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
