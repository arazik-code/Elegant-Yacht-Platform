'use client'

// Yacht Filters Component

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { yachtBrands } from '@/lib/constants'

interface YachtFiltersProps {
  searchParams: {
    type?: string
    brand?: string
    minLength?: string
    maxLength?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
  }
}

export function YachtFilters({ searchParams }: YachtFiltersProps) {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search)

    if (value && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to page 1 when filters change
    params.delete('page')

    router.push(`/yachts?${params.toString()}`)
  }, [router])

  const clearFilters = useCallback(() => {
    router.push('/yachts')
  }, [router])

  const hasActiveFilters = searchParams.type || searchParams.brand ||
    searchParams.minLength || searchParams.maxLength ||
    searchParams.minPrice || searchParams.maxPrice

  return (
    <div className="mb-8">
      {/* Filter Toggle for Mobile */}
      <div className="flex items-center justify-between gap-4 mb-6 lg:hidden">
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="flex-1"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-gold" />
          )}
        </Button>

        <Select
          value={searchParams.sort || 'newest'}
          onValueChange={(value) => updateFilter('sort', value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="length-desc">Length: Largest</SelectItem>
            <SelectItem value="length-asc">Length: Smallest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Filters */}
      <div className={`
        ${showFilters ? 'block' : 'hidden'} lg:block
        p-6 bg-card border border-border mb-8
      `}>
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Type Filter */}
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-2">Type</label>
            <Select
              value={searchParams.type || 'ALL'}
              onValueChange={(value) => updateFilter('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="SALE">For Sale</SelectItem>
                <SelectItem value="CHARTER">For Charter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brand Filter */}
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-2">Brand</label>
            <Select
              value={searchParams.brand || 'ALL'}
              onValueChange={(value) => updateFilter('brand', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Brands</SelectItem>
                {yachtBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Length Filter */}
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-2">Length</label>
            <Select
              value={`${searchParams.minLength || ''}-${searchParams.maxLength || ''}`}
              onValueChange={(value) => {
                const [min, max] = value.split('-')
                updateFilter('minLength', min || null)
                updateFilter('maxLength', max || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">Any Length</SelectItem>
                <SelectItem value="0-50">Under 50ft</SelectItem>
                <SelectItem value="50-80">50 - 80ft</SelectItem>
                <SelectItem value="80-100">80 - 100ft</SelectItem>
                <SelectItem value="100-150">100 - 150ft</SelectItem>
                <SelectItem value="150-">150ft+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort - Desktop */}
          <div className="flex-1 hidden lg:block">
            <label className="block text-sm text-muted-foreground mb-2">Sort By</label>
            <Select
              value={searchParams.sort || 'newest'}
              onValueChange={(value) => updateFilter('sort', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="length-desc">Length: Largest</SelectItem>
                <SelectItem value="length-asc">Length: Smallest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {searchParams.type && searchParams.type !== 'ALL' && (
            <FilterBadge
              label={searchParams.type === 'SALE' ? 'For Sale' : 'For Charter'}
              onRemove={() => updateFilter('type', null)}
            />
          )}
          {searchParams.brand && searchParams.brand !== 'ALL' && (
            <FilterBadge
              label={searchParams.brand}
              onRemove={() => updateFilter('brand', null)}
            />
          )}
          {(searchParams.minLength || searchParams.maxLength) && (
            <FilterBadge
              label={`${searchParams.minLength || '0'} - ${searchParams.maxLength || '∞'} ft`}
              onRemove={() => {
                updateFilter('minLength', null)
                updateFilter('maxLength', null)
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5
                   bg-gold/10 border border-gold/30 text-gold text-sm">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-foreground transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}
