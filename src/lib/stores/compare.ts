'use client'

// Yacht Comparison System
// Compare up to 3 yachts side by side

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { YachtCardData } from '@/lib/types'

const MAX_COMPARE_ITEMS = 3

interface CompareState {
  compareList: string[] // Array of yacht IDs
  compareData: Record<string, YachtCardData> // Cached yacht data

  // Actions
  addToCompare: (yachtId: string, yachtData?: YachtCardData) => boolean
  removeFromCompare: (yachtId: string) => void
  toggleCompare: (yachtId: string, yachtData?: YachtCardData) => boolean
  isInCompare: (yachtId: string) => boolean
  clearCompare: () => void
  getCompareCount: () => number
  canAddMore: () => boolean

  // Share functionality
  getShareableLink: () => string
  loadFromShareLink: (ids: string[]) => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareList: [],
      compareData: {},

      addToCompare: (yachtId: string, yachtData?: YachtCardData) => {
        const state = get()

        // Check if already in list
        if (state.compareList.includes(yachtId)) return false

        // Check max limit
        if (state.compareList.length >= MAX_COMPARE_ITEMS) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('compare:max-reached', {
              detail: { maxItems: MAX_COMPARE_ITEMS }
            }))
          }
          return false
        }

        set((state) => {
          const newCompareList = [...state.compareList, yachtId]
          const newCompareData = yachtData
            ? { ...state.compareData, [yachtId]: yachtData }
            : state.compareData

          // Track event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('compare:add', {
              detail: { yachtId, yachtData }
            }))
          }

          return {
            compareList: newCompareList,
            compareData: newCompareData,
          }
        })

        return true
      },

      removeFromCompare: (yachtId: string) => {
        set((state) => {
          const newCompareList = state.compareList.filter(id => id !== yachtId)
          const newCompareData = { ...state.compareData }
          delete newCompareData[yachtId]

          // Track event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('compare:remove', {
              detail: { yachtId }
            }))
          }

          return {
            compareList: newCompareList,
            compareData: newCompareData,
          }
        })
      },

      toggleCompare: (yachtId: string, yachtData?: YachtCardData) => {
        const { compareList, addToCompare, removeFromCompare } = get()

        if (compareList.includes(yachtId)) {
          removeFromCompare(yachtId)
          return false
        } else {
          return addToCompare(yachtId, yachtData)
        }
      },

      isInCompare: (yachtId: string) => {
        return get().compareList.includes(yachtId)
      },

      clearCompare: () => {
        set({ compareList: [], compareData: {} })

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('compare:clear'))
        }
      },

      getCompareCount: () => {
        return get().compareList.length
      },

      canAddMore: () => {
        return get().compareList.length < MAX_COMPARE_ITEMS
      },

      getShareableLink: () => {
        const { compareList } = get()
        if (compareList.length === 0) return ''

        const baseUrl = typeof window !== 'undefined'
          ? window.location.origin
          : ''
        const params = new URLSearchParams({
          ids: compareList.join(','),
        })

        return `${baseUrl}/compare?${params.toString()}`
      },

      loadFromShareLink: (ids: string[]) => {
        const validIds = ids.slice(0, MAX_COMPARE_ITEMS)
        set((state) => ({
          compareList: [...new Set([...state.compareList, ...validIds])].slice(0, MAX_COMPARE_ITEMS),
        }))
      },
    }),
    {
      name: 'bimo-yacht-compare',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        compareList: state.compareList,
        compareData: state.compareData,
      }),
    }
  )
)

// Hook for compare button
export function useCompare(yachtId: string, yachtData?: YachtCardData) {
  const { isInCompare, toggleCompare, compareList, canAddMore } = useCompareStore()

  return {
    isInCompare: isInCompare(yachtId),
    toggle: () => toggleCompare(yachtId, yachtData),
    count: compareList.length,
    canAddMore: canAddMore(),
  }
}

// Comparison specs for the comparison table
export const comparisonSpecs = [
  { key: 'price', label: { en: 'Price', ar: 'السعر' }, type: 'currency' },
  { key: 'lengthFeet', label: { en: 'Length', ar: 'الطول' }, type: 'length' },
  { key: 'brand', label: { en: 'Brand', ar: 'العلامة التجارية' }, type: 'text' },
  { key: 'year', label: { en: 'Year', ar: 'السنة' }, type: 'number' },
  { key: 'cabins', label: { en: 'Cabins', ar: 'الكبائن' }, type: 'number' },
  { key: 'guestCapacity', label: { en: 'Guest Capacity', ar: 'سعة الضيوف' }, type: 'number' },
  { key: 'charterPricePerWeek', label: { en: 'Charter/Week', ar: 'الإيجار/أسبوع' }, type: 'currency' },
] as const
