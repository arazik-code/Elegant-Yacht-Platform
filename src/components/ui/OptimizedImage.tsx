'use client'

// Optimized Image Component
// Progressive loading with blur placeholder and lazy loading

import Image, { ImageProps } from 'next/image'
import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  optimizeCloudinaryUrl,
  getBlurPlaceholder,
  BREAKPOINTS,
  QUALITY
} from '@/lib/image-optimization'

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'placeholder' | 'blurDataURL'> {
  src: string | undefined
  preset?: 'thumbnail' | 'card' | 'gallery' | 'hero' | 'full'
  enableBlur?: boolean
  fadeIn?: boolean
  aspectRatio?: string
}

export function OptimizedImage({
  src,
  preset = 'card',
  enableBlur = true,
  fadeIn = true,
  aspectRatio,
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [blurDataUrl, setBlurDataUrl] = useState<string>('')

  // Generate blur placeholder on mount
  useEffect(() => {
    if (!enableBlur || !src) return

    const blurUrl = getBlurPlaceholder(src)

    // Create tiny placeholder
    const img = document.createElement('img')
    img.src = blurUrl
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 10
      canvas.height = 10
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, 10, 10)
        setBlurDataUrl(canvas.toDataURL('image/webp', 0.5))
      }
    }
  }, [src, enableBlur])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-muted/10 to-muted/5 flex items-center justify-center',
          aspectRatio,
          className
        )}
      >
        <svg
          className="w-12 h-12 text-muted-foreground/20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  // Get optimized URL
  const optimizedSrc = optimizeCloudinaryUrl(src, {
    quality: QUALITY[preset],
  })

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatio,
        className
      )}
    >
      {/* Blur placeholder */}
      {enableBlur && blurDataUrl && !isLoaded && (
        <div
          className="absolute inset-0 scale-110 blur-lg"
          style={{
            backgroundImage: `url(${blurDataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted/5 via-muted/10 to-muted/5 animate-pulse" />
      )}

      {/* Main image */}
      <Image
        src={optimizedSrc}
        alt={alt}
        className={cn(
          'object-cover',
          fadeIn && 'transition-opacity duration-500',
          fadeIn && !isLoaded && 'opacity-0',
          fadeIn && isLoaded && 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  )
}

// Lazy loaded image that only loads when visible
interface LazyImageProps extends OptimizedImageProps {
  rootMargin?: string
}

export function LazyImage({
  rootMargin = '200px',
  ...props
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} className={props.className}>
      {isVisible ? (
        <OptimizedImage {...props} />
      ) : (
        <div
          className={cn(
            'bg-gradient-to-r from-muted/5 via-muted/10 to-muted/5 animate-pulse',
            props.className
          )}
        />
      )}
    </div>
  )
}

// Responsive image with srcset
interface ResponsiveImageProps extends OptimizedImageProps {
  sizes?: string
}

export function ResponsiveImage({
  src,
  preset = 'card',
  sizes,
  ...props
}: ResponsiveImageProps) {
  const breakpoints = BREAKPOINTS[preset]
  const quality = QUALITY[preset]

  // Generate srcset
  const srcSet = breakpoints
    .map(width => {
      const url = optimizeCloudinaryUrl(src, { width, quality })
      return `${url} ${width}w`
    })
    .join(', ')

  // Default sizes based on preset
  const defaultSizes = {
    thumbnail: '100px',
    card: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    gallery: '(max-width: 768px) 100vw, 50vw',
    hero: '100vw',
    full: '100vw',
  }

  return (
    <OptimizedImage
      src={src}
      preset={preset}
      sizes={sizes || defaultSizes[preset]}
      {...props}
    />
  )
}

// Background image with optimization
interface OptimizedBackgroundProps {
  src: string | undefined
  className?: string
  overlay?: boolean
  overlayClassName?: string
  children?: React.ReactNode
  preset?: 'card' | 'hero' | 'full'
}

export function OptimizedBackground({
  src,
  className,
  overlay = true,
  overlayClassName,
  children,
  preset = 'hero',
}: OptimizedBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const optimizedSrc = src
    ? optimizeCloudinaryUrl(src, {
      width: preset === 'hero' ? 1920 : 1200,
      quality: QUALITY[preset],
    })
    : ''

  useEffect(() => {
    if (!optimizedSrc) return

    const img = document.createElement('img')
    img.src = optimizedSrc
    img.onload = () => setIsLoaded(true)
  }, [optimizedSrc])

  return (
    <div
      className={cn('relative overflow-hidden', className)}
    >
      {/* Background image */}
      <div
        className={cn(
          'absolute inset-0 bg-cover bg-center transition-opacity duration-700',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundImage: `url(${optimizedSrc})` }}
      />

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-muted/2 animate-pulse" />
      )}

      {/* Overlay */}
      {overlay && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-b from-jet/50 via-jet/30 to-jet',
            overlayClassName
          )}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
