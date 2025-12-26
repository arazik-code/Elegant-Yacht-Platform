'use client'

// Lazy Loading Component Wrapper
// For code splitting and deferred loading of heavy components

import { Suspense, lazy, ComponentType, ReactNode, ComponentProps } from 'react'
import { useLazyLoad } from '@/hooks/useIntersectionObserver'
import { Skeleton } from '@/components/ui/Skeleton'

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<unknown> }>
  fallback?: ReactNode
  props?: Record<string, unknown>
  rootMargin?: string
  loadOnMount?: boolean
}

/**
 * Lazy load a component when it enters viewport
 */
export function LazyComponent({
  component,
  fallback,
  props = {},
  rootMargin = '200px',
  loadOnMount = false,
}: LazyComponentProps) {
  const [ref, shouldLoad] = useLazyLoad<HTMLDivElement>({ rootMargin })

  if (loadOnMount || shouldLoad) {
    const LazyComp = lazy(component) as ComponentType<Record<string, unknown>>
    
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComp {...props} />
      </Suspense>
    )
  }

  return (
    <div ref={ref}>
      {fallback || <DefaultFallback />}
    </div>
  )
}

function DefaultFallback() {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <Skeleton className="w-full h-full min-h-[200px]" />
    </div>
  )
}

/**
 * HOC to create a lazy-loaded version of any component
 */
export function withLazyLoad<T extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ReactNode
): ComponentType<T & { loadOnMount?: boolean; rootMargin?: string }> {
  return function LazyWrapped(props: T & { loadOnMount?: boolean; rootMargin?: string }) {
    const { loadOnMount, rootMargin, ...rest } = props
    
    return (
      <LazyComponent
        component={importFn as () => Promise<{ default: ComponentType<unknown> }>}
        fallback={fallback}
        props={rest}
        loadOnMount={loadOnMount}
        rootMargin={rootMargin}
      />
    )
  }
}

/**
 * Preload a component (useful for hover preloading)
 */
export function preloadComponent<T>(
  importFn: () => Promise<{ default: ComponentType<T> }>
): void {
  importFn()
}

// Pre-built lazy versions of heavy components
// These can be imported instead of the regular components

export const LazyYachtGallery = lazy(() => 
  import('@/components/yacht/YachtGallery').then(mod => ({ default: mod.YachtGallery }))
)

export const LazyYachtFilters = lazy(() => 
  import('@/components/yacht/YachtFilters').then(mod => ({ default: mod.YachtFilters }))
)

export const LazyYachtInquiry = lazy(() => 
  import('@/components/yacht/YachtInquiry').then(mod => ({ default: mod.YachtInquiry }))
)

export const LazyYachtSpecs = lazy(() => 
  import('@/components/yacht/YachtSpecs').then(mod => ({ default: mod.YachtSpecs }))
)

export const LazyRelatedYachts = lazy(() => 
  import('@/components/yacht/RelatedYachts').then(mod => ({ default: mod.RelatedYachts }))
)

// Suspense wrapper with consistent fallbacks
interface SuspenseWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  type?: 'gallery' | 'filters' | 'form' | 'card' | 'default'
}

export function SuspenseWrapper({ 
  children, 
  fallback, 
  type = 'default' 
}: SuspenseWrapperProps) {
  const getFallback = () => {
    if (fallback) return fallback
    
    switch (type) {
      case 'gallery':
        return <GalleryFallback />
      case 'filters':
        return <FiltersFallback />
      case 'form':
        return <FormFallback />
      case 'card':
        return <CardFallback />
      default:
        return <DefaultFallback />
    }
  }

  return (
    <Suspense fallback={getFallback()}>
      {children}
    </Suspense>
  )
}

function GalleryFallback() {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Skeleton className="col-span-2 row-span-2 aspect-[4/3]" />
      <Skeleton className="aspect-square" />
      <Skeleton className="aspect-square" />
      <Skeleton className="aspect-square" />
      <Skeleton className="aspect-square" />
    </div>
  )
}

function FiltersFallback() {
  return (
    <div className="flex gap-4 flex-wrap">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-10 w-32" />
      ))}
    </div>
  )
}

function FormFallback() {
  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  )
}

function CardFallback() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
