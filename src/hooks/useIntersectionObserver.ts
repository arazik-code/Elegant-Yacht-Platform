'use client'

// Advanced Intersection Observer Hooks
// For lazy loading, infinite scroll, and viewport animations

import { useEffect, useRef, useState, useCallback, type RefObject } from 'react'

export interface UseIntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  triggerOnce?: boolean
  enabled?: boolean
}

export interface IntersectionObserverEntry {
  isIntersecting: boolean
  intersectionRatio: number
  boundingClientRect: DOMRectReadOnly
  intersectionRect: DOMRectReadOnly
  time: number
}

/**
 * Hook to observe element intersection with viewport
 */
export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean, IntersectionObserverEntry | null] {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    triggerOnce = false,
    enabled = true,
  } = options

  const ref = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const hasTriggered = useRef(false)

  useEffect(() => {
    if (!enabled || !ref.current) return
    if (triggerOnce && hasTriggered.current) return

    const element = ref.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        
        setIsIntersecting(entry.isIntersecting)
        setEntry({
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          boundingClientRect: entry.boundingClientRect,
          intersectionRect: entry.intersectionRect,
          time: entry.time,
        })

        if (entry.isIntersecting && triggerOnce) {
          hasTriggered.current = true
          observer.disconnect()
        }
      },
      { root, rootMargin, threshold }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [enabled, root, rootMargin, threshold, triggerOnce])

  return [ref, isIntersecting, entry]
}

/**
 * Hook for lazy loading content when it enters viewport
 */
export function useLazyLoad<T extends Element = Element>(
  options: { rootMargin?: string; threshold?: number } = {}
): [RefObject<T>, boolean] {
  const { rootMargin = '200px', threshold = 0.01 } = options

  const [ref, isIntersecting] = useIntersectionObserver<T>({
    rootMargin,
    threshold,
    triggerOnce: true,
  })

  return [ref, isIntersecting]
}

/**
 * Hook for infinite scroll - triggers when sentinel is visible
 */
export function useInfiniteScroll<T extends Element = Element>(
  onLoadMore: () => void,
  options: { rootMargin?: string; threshold?: number; enabled?: boolean } = {}
): RefObject<T> {
  const { rootMargin = '400px', threshold = 0, enabled = true } = options
  
  const [ref, isIntersecting] = useIntersectionObserver<T>({
    rootMargin,
    threshold,
    enabled,
  })

  useEffect(() => {
    if (isIntersecting && enabled) {
      onLoadMore()
    }
  }, [isIntersecting, enabled, onLoadMore])

  return ref
}

/**
 * Hook for tracking element visibility percentage
 */
export function useElementVisibility<T extends Element = Element>(
  thresholds: number[] = [0, 0.25, 0.5, 0.75, 1]
): [RefObject<T>, number, boolean] {
  const [ref, isIntersecting, entry] = useIntersectionObserver<T>({
    threshold: thresholds,
  })

  const visibilityRatio = entry?.intersectionRatio ?? 0

  return [ref, visibilityRatio, isIntersecting]
}

/**
 * Hook for triggering animations when element enters viewport
 */
export function useAnimateOnScroll<T extends Element = Element>(
  options: { rootMargin?: string; threshold?: number } = {}
): [RefObject<T>, boolean] {
  const { rootMargin = '0px 0px -100px 0px', threshold = 0.1 } = options

  const [ref, hasEntered] = useLazyLoad<T>({
    rootMargin,
    threshold,
  })

  return [ref, hasEntered]
}

/**
 * Hook for preloading images when they approach viewport
 */
export function useImagePreload(
  src: string | undefined,
  rootMargin = '500px'
): { ref: RefObject<HTMLDivElement>; isLoaded: boolean; isPreloading: boolean } {
  const [ref, shouldLoad] = useLazyLoad<HTMLDivElement>({ rootMargin })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPreloading, setIsPreloading] = useState(false)

  useEffect(() => {
    if (!shouldLoad || !src || isLoaded) return

    setIsPreloading(true)

    const img = new Image()
    img.src = src
    img.onload = () => {
      setIsLoaded(true)
      setIsPreloading(false)
    }
    img.onerror = () => {
      setIsPreloading(false)
    }

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [shouldLoad, src, isLoaded])

  return { ref, isLoaded, isPreloading }
}

/**
 * Hook for progressive image loading with blur placeholder
 */
export function useProgressiveImage(
  lowQualitySrc: string | undefined,
  highQualitySrc: string | undefined
): { currentSrc: string | undefined; isFullyLoaded: boolean } {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc)
  const [isFullyLoaded, setIsFullyLoaded] = useState(false)

  useEffect(() => {
    if (!highQualitySrc) return

    const img = new Image()
    img.src = highQualitySrc
    img.onload = () => {
      setCurrentSrc(highQualitySrc)
      setIsFullyLoaded(true)
    }

    return () => {
      img.onload = null
    }
  }, [highQualitySrc])

  return { currentSrc, isFullyLoaded }
}

/**
 * Hook for detecting when user is scrolling
 */
export function useScrolling(delay = 150): boolean {
  const [isScrolling, setIsScrolling] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, delay)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [delay])

  return isScrolling
}

/**
 * Hook for detecting scroll direction
 */
export function useScrollDirection(): 'up' | 'down' | null {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up')
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollDirection
}
