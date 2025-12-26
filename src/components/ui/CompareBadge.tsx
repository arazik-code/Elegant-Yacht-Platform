'use client'

// Compare Badge Component
// Shows scale icon with count badge in header

import Link from 'next/link'
import { Scale } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCompareStore } from '@/lib/stores'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface CompareBadgeProps {
  className?: string
  showLabel?: boolean
}

export function CompareBadge({ className, showLabel = false }: CompareBadgeProps) {
  const { compareList } = useCompareStore()
  const count = compareList.length

  // Prevent hydration mismatch by only showing count after mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Link
      href="/compare"
      className={cn(
        'relative group flex items-center gap-2 p-2 text-muted-foreground hover:text-gold transition-colors',
        className
      )}
      title={`Compare Yachts${mounted && count > 0 ? ` (${count}/3)` : ''}`}
    >
      <div className="relative">
        <Scale
          className={cn(
            "w-5 h-5 transition-colors",
            mounted && count > 0 && "text-gold"
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
                       bg-gold text-jet text-xs font-bold 
                       rounded-full flex items-center justify-center
                       px-1"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="hidden sm:inline text-sm">
          Compare
        </span>
      )}
    </Link>
  )
}
