'use client'

// Favorites/Wishlist System
// Client-side state management with localStorage persistence

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { YachtCardData } from '@/lib/types'

interface FavoritesState {
  favorites: string[] // Array of yacht IDs
  favoritesData: Record<string, YachtCardData> // Cached yacht data for display
  
  // Actions
  addFavorite: (yachtId: string, yachtData?: YachtCardData) => void
  removeFavorite: (yachtId: string) => void
  toggleFavorite: (yachtId: string, yachtData?: YachtCardData) => void
  isFavorite: (yachtId: string) => boolean
  clearFavorites: () => void
  getFavoritesCount: () => number
  
  // Share functionality
  getShareableLink: () => string
  loadFromShareLink: (ids: string[]) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoritesData: {},
      
      addFavorite: (yachtId: string, yachtData?: YachtCardData) => {
        set((state) => {
          if (state.favorites.includes(yachtId)) return state
          
          const newFavorites = [...state.favorites, yachtId]
          const newFavoritesData = yachtData 
            ? { ...state.favoritesData, [yachtId]: yachtData }
            : state.favoritesData
          
          // Track event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('favorites:add', { 
              detail: { yachtId, yachtData } 
            }))
          }
          
          return { 
            favorites: newFavorites,
            favoritesData: newFavoritesData,
          }
        })
      },
      
      removeFavorite: (yachtId: string) => {
        set((state) => {
          const newFavorites = state.favorites.filter(id => id !== yachtId)
          const newFavoritesData = { ...state.favoritesData }
          delete newFavoritesData[yachtId]
          
          // Track event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('favorites:remove', { 
              detail: { yachtId } 
            }))
          }
          
          return { 
            favorites: newFavorites,
            favoritesData: newFavoritesData,
          }
        })
      },
      
      toggleFavorite: (yachtId: string, yachtData?: YachtCardData) => {
        const { favorites, addFavorite, removeFavorite } = get()
        if (favorites.includes(yachtId)) {
          removeFavorite(yachtId)
        } else {
          addFavorite(yachtId, yachtData)
        }
      },
      
      isFavorite: (yachtId: string) => {
        return get().favorites.includes(yachtId)
      },
      
      clearFavorites: () => {
        set({ favorites: [], favoritesData: {} })
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('favorites:clear'))
        }
      },
      
      getFavoritesCount: () => {
        return get().favorites.length
      },
      
      getShareableLink: () => {
        const { favorites } = get()
        if (favorites.length === 0) return ''
        
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : ''
        const params = new URLSearchParams({
          ids: favorites.join(','),
        })
        
        return `${baseUrl}/favorites?${params.toString()}`
      },
      
      loadFromShareLink: (ids: string[]) => {
        set((state) => ({
          favorites: [...new Set([...state.favorites, ...ids])],
        }))
      },
    }),
    {
      name: 'bimo-yacht-favorites',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        favorites: state.favorites,
        favoritesData: state.favoritesData,
      }),
    }
  )
)

// Hook for favorite button with optimistic updates
export function useFavorite(yachtId: string, yachtData?: YachtCardData) {
  const { isFavorite, toggleFavorite, favorites } = useFavoritesStore()
  
  return {
    isFavorite: isFavorite(yachtId),
    toggle: () => toggleFavorite(yachtId, yachtData),
    count: favorites.length,
  }
}
