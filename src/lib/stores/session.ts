'use client'

// Session Tracking Store
// Tracks user browsing behavior for inquiry context intelligence

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ViewedYacht {
    id: string
    title: string
    viewedAt: number // timestamp
    timeSpent: number // seconds
}

interface SessionState {
    // Session data
    sessionStartedAt: number
    yachtsViewed: ViewedYacht[]
    currentYachtId: string | null
    currentYachtStartTime: number | null

    // Actions
    trackYachtView: (yacht: { id: string; title: string }) => void
    leaveCurrentYacht: () => void
    getSessionContext: () => SessionContext
    clearSession: () => void
}

export interface SessionContext {
    yachtsViewed: ViewedYacht[]
    totalYachtsViewed: number
    uniqueYachtsViewed: number
    totalTimeSpent: number
    sessionDuration: number
    mostViewedYacht: ViewedYacht | null
}

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            sessionStartedAt: Date.now(),
            yachtsViewed: [],
            currentYachtId: null,
            currentYachtStartTime: null,

            trackYachtView: (yacht: { id: string; title: string }) => {
                const state = get()

                // If viewing a different yacht, record time spent on previous one
                if (state.currentYachtId && state.currentYachtId !== yacht.id && state.currentYachtStartTime) {
                    const timeSpent = Math.floor((Date.now() - state.currentYachtStartTime) / 1000)

                    set((s) => {
                        const existingIndex = s.yachtsViewed.findIndex(y => y.id === state.currentYachtId)

                        if (existingIndex >= 0) {
                            // Update existing yacht with additional time
                            const updated = [...s.yachtsViewed]
                            updated[existingIndex] = {
                                ...updated[existingIndex],
                                timeSpent: updated[existingIndex].timeSpent + timeSpent,
                            }
                            return { yachtsViewed: updated }
                        }
                        return s
                    })
                }

                // Start tracking new yacht
                set((s) => {
                    const existingIndex = s.yachtsViewed.findIndex(y => y.id === yacht.id)

                    if (existingIndex >= 0) {
                        // Already viewed, just update current
                        return {
                            currentYachtId: yacht.id,
                            currentYachtStartTime: Date.now(),
                        }
                    }

                    // New yacht view
                    return {
                        yachtsViewed: [
                            ...s.yachtsViewed,
                            {
                                id: yacht.id,
                                title: yacht.title,
                                viewedAt: Date.now(),
                                timeSpent: 0,
                            },
                        ],
                        currentYachtId: yacht.id,
                        currentYachtStartTime: Date.now(),
                    }
                })
            },

            leaveCurrentYacht: () => {
                const state = get()

                if (state.currentYachtId && state.currentYachtStartTime) {
                    const timeSpent = Math.floor((Date.now() - state.currentYachtStartTime) / 1000)

                    set((s) => {
                        const existingIndex = s.yachtsViewed.findIndex(y => y.id === state.currentYachtId)

                        if (existingIndex >= 0) {
                            const updated = [...s.yachtsViewed]
                            updated[existingIndex] = {
                                ...updated[existingIndex],
                                timeSpent: updated[existingIndex].timeSpent + timeSpent,
                            }
                            return {
                                yachtsViewed: updated,
                                currentYachtId: null,
                                currentYachtStartTime: null,
                            }
                        }

                        return {
                            currentYachtId: null,
                            currentYachtStartTime: null,
                        }
                    })
                }
            },

            getSessionContext: (): SessionContext => {
                const state = get()

                // Calculate current yacht time if still viewing
                let yachtsWithCurrentTime = [...state.yachtsViewed]
                if (state.currentYachtId && state.currentYachtStartTime) {
                    const currentTime = Math.floor((Date.now() - state.currentYachtStartTime) / 1000)
                    const idx = yachtsWithCurrentTime.findIndex(y => y.id === state.currentYachtId)
                    if (idx >= 0) {
                        yachtsWithCurrentTime[idx] = {
                            ...yachtsWithCurrentTime[idx],
                            timeSpent: yachtsWithCurrentTime[idx].timeSpent + currentTime,
                        }
                    }
                }

                const totalTimeSpent = yachtsWithCurrentTime.reduce((sum, y) => sum + y.timeSpent, 0)
                const uniqueYachts = new Set(yachtsWithCurrentTime.map(y => y.id)).size
                const sessionDuration = Math.floor((Date.now() - state.sessionStartedAt) / 1000)

                // Find most viewed yacht
                const sorted = [...yachtsWithCurrentTime].sort((a, b) => b.timeSpent - a.timeSpent)

                return {
                    yachtsViewed: yachtsWithCurrentTime,
                    totalYachtsViewed: yachtsWithCurrentTime.length,
                    uniqueYachtsViewed: uniqueYachts,
                    totalTimeSpent,
                    sessionDuration,
                    mostViewedYacht: sorted[0] || null,
                }
            },

            clearSession: () => {
                set({
                    sessionStartedAt: Date.now(),
                    yachtsViewed: [],
                    currentYachtId: null,
                    currentYachtStartTime: null,
                })
            },
        }),
        {
            name: 'bimo-yacht-session',
            storage: createJSONStorage(() => sessionStorage), // Use session storage (cleared on tab close)
            partialize: (state) => ({
                sessionStartedAt: state.sessionStartedAt,
                yachtsViewed: state.yachtsViewed,
                currentYachtId: state.currentYachtId,
                currentYachtStartTime: state.currentYachtStartTime,
            }),
        }
    )
)

// Calculate intent level from context
export function calculateIntentLevel(context: {
    favorites?: string[]
    compareList?: string[]
    yachtsViewed?: ViewedYacht[]
    sessionDuration?: number
}): { level: 'HIGH' | 'MEDIUM' | 'LOW'; score: number; signals: string[] } {
    let score = 20 // Base score for submitting inquiry
    const signals: string[] = ['Submitted inquiry (+20)']

    // Favorites
    if (context.favorites && context.favorites.length > 0) {
        score += 10
        signals.push(`${context.favorites.length} favorites (+10)`)
    }

    // Compare list
    if (context.compareList && context.compareList.length > 0) {
        score += 15
        signals.push(`${context.compareList.length} in compare (+15)`)
    }

    // Yachts viewed
    if (context.yachtsViewed && context.yachtsViewed.length > 1) {
        const viewPoints = Math.min(context.yachtsViewed.length * 5, 25) // Cap at 25
        score += viewPoints
        signals.push(`${context.yachtsViewed.length} yachts viewed (+${viewPoints})`)
    }

    // Session duration
    if (context.sessionDuration) {
        if (context.sessionDuration > 900) { // > 15 min
            score += 20
            signals.push('Session > 15min (+20)')
        } else if (context.sessionDuration > 300) { // > 5 min
            score += 10
            signals.push('Session > 5min (+10)')
        }
    }

    // Determine level
    let level: 'HIGH' | 'MEDIUM' | 'LOW'
    if (score >= 60) {
        level = 'HIGH'
    } else if (score >= 30) {
        level = 'MEDIUM'
    } else {
        level = 'LOW'
    }

    return { level, score, signals }
}
