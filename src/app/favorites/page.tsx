// Favorites Page
// Display user's saved yachts with share functionality

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Share2, Trash2, Ship, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFavoritesStore } from '@/lib/stores'
import { YachtCard } from '@/components/yacht/YachtCard'
import { Button } from '@/components/ui/Button'
import { YachtCardData } from '@/lib/types'

export default function FavoritesPage() {
  const t = useTranslations('favorites')
  const searchParams = useSearchParams()
  const { favorites, favoritesData, clearFavorites, getShareableLink, loadFromShareLink } = useFavoritesStore()
  const [yachts, setYachts] = useState<YachtCardData[]>([])
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
  
  // Fetch yacht data for favorites
  useEffect(() => {
    async function fetchFavorites() {
      if (favorites.length === 0) {
        setYachts([])
        setIsLoading(false)
        return
      }
      
      try {
        const response = await fetch(`/api/yachts?ids=${favorites.join(',')}`)
        if (response.ok) {
          const data = await response.json()
          setYachts(data.yachts || [])
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
        // Fall back to cached data
        const cachedYachts = Object.values(favoritesData).filter(Boolean)
        setYachts(cachedYachts as YachtCardData[])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFavorites()
  }, [favorites, favoritesData])
  
  const handleShare = async () => {
    const link = getShareableLink()
    if (!link) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Favorite Yachts - Bimo Yacht',
          text: 'Check out my favorite yachts!',
          url: link,
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return (
    <div className="min-h-screen bg-jet pt-24 pb-16">
      <div className="container-luxury">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-white/60">
              {t('subtitle')} • {favorites.length} {favorites.length === 1 ? 'yacht' : 'yachts'}
            </p>
          </div>
          
          {favorites.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="hidden sm:flex"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : t('shareList')}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all favorites?')) {
                    clearFavorites()
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('clearAll')}
              </Button>
            </div>
          )}
        </div>
        
        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 animate-pulse aspect-[4/3] rounded-lg" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Heart className="w-16 h-16 mx-auto mb-6 text-white/20" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yachts.map((yacht, index) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <YachtCard yacht={yacht} showFavorite showCompare />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
