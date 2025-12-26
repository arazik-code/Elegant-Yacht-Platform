// Admin Featured Listings Management Page
// Quick toggle and priority management for featured yachts

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Eye, ArrowUp, ArrowDown, Loader2, Ship } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, cn } from '@/lib/utils'

interface YachtItem {
    id: string
    title: string
    slug: string
    type: string
    featured: boolean
    priority: number
    price: number | null
    currency: string
    lengthFeet: number | null
    brand: string | null
    year: number | null
    coverImage: string | null
}

export default function AdminFeaturedPage() {
    const [yachts, setYachts] = useState<YachtItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    const fetchYachts = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/featured')
            if (res.ok) {
                const data = await res.json()
                setYachts(data.yachts || [])
            }
        } catch (error) {
            console.error('Failed to fetch yachts:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchYachts()
    }, [fetchYachts])

    const toggleFeatured = async (yachtId: string, currentValue: boolean) => {
        setUpdating(yachtId)
        try {
            const res = await fetch('/api/admin/featured', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ yachtId, featured: !currentValue }),
            })

            if (res.ok) {
                setYachts(yachts.map(y =>
                    y.id === yachtId ? { ...y, featured: !currentValue } : y
                ))
            }
        } catch (error) {
            console.error('Failed to update:', error)
        } finally {
            setUpdating(null)
        }
    }

    const updatePriority = async (yachtId: string, delta: number) => {
        const yacht = yachts.find(y => y.id === yachtId)
        if (!yacht) return

        const newPriority = Math.max(0, Math.min(10, yacht.priority + delta))
        if (newPriority === yacht.priority) return

        setUpdating(yachtId)
        try {
            const res = await fetch('/api/admin/featured', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ yachtId, priority: newPriority }),
            })

            if (res.ok) {
                setYachts(yachts.map(y =>
                    y.id === yachtId ? { ...y, priority: newPriority } : y
                ))
            }
        } catch (error) {
            console.error('Failed to update priority:', error)
        } finally {
            setUpdating(null)
        }
    }

    const featuredYachts = yachts.filter(y => y.featured)
    const regularYachts = yachts.filter(y => !y.featured)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-bold text-white">Featured Listings</h1>
                <p className="text-white/60">
                    Manage featured yachts and priority ranking • {featuredYachts.length} featured
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                </div>
            ) : (
                <>
                    {/* Featured Section */}
                    <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 fill-gold" />
                            Featured Yachts ({featuredYachts.length})
                        </h2>

                        {featuredYachts.length === 0 ? (
                            <p className="text-white/50 text-center py-8">
                                No featured yachts yet. Toggle the star on any yacht below to feature it.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {featuredYachts
                                    .sort((a, b) => b.priority - a.priority)
                                    .map((yacht) => (
                                        <YachtRow
                                            key={yacht.id}
                                            yacht={yacht}
                                            isUpdating={updating === yacht.id}
                                            onToggleFeatured={() => toggleFeatured(yacht.id, yacht.featured)}
                                            onPriorityUp={() => updatePriority(yacht.id, 1)}
                                            onPriorityDown={() => updatePriority(yacht.id, -1)}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* All Yachts Section */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Ship className="w-5 h-5" />
                            All Yachts ({regularYachts.length})
                        </h2>

                        <div className="space-y-3">
                            {regularYachts.map((yacht) => (
                                <YachtRow
                                    key={yacht.id}
                                    yacht={yacht}
                                    isUpdating={updating === yacht.id}
                                    onToggleFeatured={() => toggleFeatured(yacht.id, yacht.featured)}
                                    onPriorityUp={() => updatePriority(yacht.id, 1)}
                                    onPriorityDown={() => updatePriority(yacht.id, -1)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

function YachtRow({
    yacht,
    isUpdating,
    onToggleFeatured,
    onPriorityUp,
    onPriorityDown,
}: {
    yacht: YachtItem
    isUpdating: boolean
    onToggleFeatured: () => void
    onPriorityUp: () => void
    onPriorityDown: () => void
}) {
    return (
        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            {/* Image */}
            <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0">
                {yacht.coverImage ? (
                    <Image
                        src={yacht.coverImage}
                        alt={yacht.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-navy flex items-center justify-center">
                        <Ship className="w-6 h-6 text-white/20" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Link
                    href={`/admin/yachts/${yacht.id}`}
                    className="text-white font-medium hover:text-gold transition-colors truncate block"
                >
                    {yacht.title}
                </Link>
                <p className="text-white/50 text-sm">
                    {yacht.brand} • {yacht.year} • {yacht.lengthFeet}ft
                    {yacht.price && ` • ${formatCurrency(yacht.price, yacht.currency)}`}
                </p>
            </div>

            {/* Type Badge */}
            <span className={cn(
                'px-2 py-1 text-xs font-medium rounded',
                yacht.type === 'SALE'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-purple-500/20 text-purple-400'
            )}>
                {yacht.type}
            </span>

            {/* Priority Controls (only for featured) */}
            {yacht.featured && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={onPriorityDown}
                        disabled={isUpdating || yacht.priority <= 0}
                        className="p-1 text-white/50 hover:text-white disabled:opacity-30"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm text-white/70">
                        {yacht.priority}
                    </span>
                    <button
                        onClick={onPriorityUp}
                        disabled={isUpdating || yacht.priority >= 10}
                        className="p-1 text-white/50 hover:text-white disabled:opacity-30"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Featured Toggle */}
            <button
                onClick={onToggleFeatured}
                disabled={isUpdating}
                className={cn(
                    'p-2 rounded-lg transition-colors',
                    yacht.featured
                        ? 'bg-gold/20 text-gold hover:bg-gold/30'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                )}
            >
                {isUpdating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Star className={cn('w-5 h-5', yacht.featured && 'fill-gold')} />
                )}
            </button>

            {/* View Link */}
            <Link
                href={`/yachts/${yacht.slug}`}
                target="_blank"
                className="p-2 text-white/50 hover:text-gold transition-colors"
            >
                <Eye className="w-5 h-5" />
            </Link>
        </div>
    )
}
