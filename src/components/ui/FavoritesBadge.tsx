'use client'

// Favorites Badge Component
// Shows heart icon with count badge in header

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFavoritesStore } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface FavoritesBadgeProps {
  className?: string
  showLabel?: boolean
}

export function FavoritesBadge({ className, showLabel = false }: FavoritesBadgeProps) {
  const { favorites } = useFavoritesStore()
  const count = favorites.length

  // Prevent hydration mismatch by only showing count after mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Link
      href="/favorites"
      className={cn(
        'relative group flex items-center gap-2 p-2 text-muted-foreground hover:text-gold transition-colors',
        className
      )}
      title={`My Favorites${mounted && count > 0 ? ` (${count})` : ''}`}
    >
      <div className="relative">
        <Heart
          className={cn(
            "w-5 h-5 transition-colors",
            mounted && count > 0 && "text-red-400"
          )}
        />

        {/* Count Badge */}
        <AnimatePresence>
          {mounted && count > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 min-w-[18px] h-[18px] 
                       bg-red-500 text-white text-xs font-bold 
                       rounded-full flex items-center justify-center
                       px-1"
            >
              {count > 99 ? '99+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="hidden sm:inline text-sm">
          Favorites
        </span>
      )}
    </Link>
  )
}
