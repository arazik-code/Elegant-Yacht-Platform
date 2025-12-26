// Cloudinary Image Optimization Utilities
// Advanced image CDN tuning with responsive breakpoints and blur placeholders

import { Yacht } from '@/lib/types'

// Cloudinary base URL pattern
const CLOUDINARY_REGEX = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.*)/

// Responsive breakpoints for different contexts
export const BREAKPOINTS = {
  thumbnail: [100, 200, 300],
  card: [300, 450, 600, 750],
  gallery: [400, 600, 800, 1000, 1200],
  hero: [640, 960, 1280, 1920, 2560],
  full: [800, 1200, 1600, 2000, 2400],
}

// Quality presets
export const QUALITY = {
  thumbnail: 60,
  card: 70,
  gallery: 75,
  hero: 80,
  full: 85,
}

// Format options
export type ImageFormat = 'auto' | 'webp' | 'avif' | 'jpg' | 'png'

export interface CloudinaryOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb' | 'crop'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
  quality?: number | 'auto' | 'auto:low' | 'auto:good' | 'auto:best'
  format?: ImageFormat
  blur?: number // 1-2000
  dpr?: number | 'auto'
  aspectRatio?: string // e.g., '16:9', '4:3', '1:1'
  effect?: string
  background?: string
}

/**
 * Transform a Cloudinary URL with optimizations
 */
export function optimizeCloudinaryUrl(
  url: string | undefined,
  options: CloudinaryOptions = {}
): string {
  if (!url) return ''
  
  const match = url.match(CLOUDINARY_REGEX)
  if (!match) return url

  const [, cloudName, rest] = match
  
  // Build transformation string
  const transforms: string[] = []

  // Format - use auto for best format based on browser
  transforms.push(`f_${options.format || 'auto'}`)

  // Quality - use auto for perceptual quality
  if (options.quality) {
    transforms.push(`q_${options.quality}`)
  } else {
    transforms.push('q_auto')
  }

  // DPR for retina displays
  if (options.dpr) {
    transforms.push(`dpr_${options.dpr}`)
  }

  // Dimensions
  if (options.width) transforms.push(`w_${options.width}`)
  if (options.height) transforms.push(`h_${options.height}`)

  // Crop mode
  if (options.crop) {
    transforms.push(`c_${options.crop}`)
  }

  // Gravity
  if (options.gravity) {
    transforms.push(`g_${options.gravity}`)
  }

  // Aspect ratio
  if (options.aspectRatio) {
    transforms.push(`ar_${options.aspectRatio.replace(':', '_')}`)
  }

  // Blur for placeholder
  if (options.blur) {
    transforms.push(`e_blur:${options.blur}`)
  }

  // Custom effect
  if (options.effect) {
    transforms.push(`e_${options.effect}`)
  }

  // Background color (for padding)
  if (options.background) {
    transforms.push(`b_${options.background}`)
  }

  const transformation = transforms.join(',')

  // Find where to insert transformation
  // Look for existing transformations or version
  const parts = rest.split('/')
  const versionIndex = parts.findIndex(p => p.startsWith('v') && /^v\d+/.test(p))
  
  if (versionIndex !== -1) {
    // Insert before version
    parts.splice(versionIndex, 0, transformation)
  } else {
    // Insert at beginning
    parts.unshift(transformation)
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${parts.join('/')}`
}

/**
 * Generate blur placeholder URL (tiny, heavily blurred)
 */
export function getBlurPlaceholder(url: string | undefined): string {
  return optimizeCloudinaryUrl(url, {
    width: 20,
    quality: 30,
    blur: 1000,
    format: 'webp',
  })
}

/**
 * Generate Low Quality Image Placeholder (LQIP)
 */
export function getLQIP(url: string | undefined): string {
  return optimizeCloudinaryUrl(url, {
    width: 50,
    quality: 20,
    blur: 500,
    format: 'webp',
  })
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  url: string | undefined,
  breakpoints: number[],
  options: Omit<CloudinaryOptions, 'width'> = {}
): string {
  if (!url) return ''

  return breakpoints
    .map(width => {
      const optimizedUrl = optimizeCloudinaryUrl(url, { ...options, width })
      return `${optimizedUrl} ${width}w`
    })
    .join(', ')
}

/**
 * Generate sizes attribute based on breakpoints
 */
export function generateSizes(
  config: { breakpoint: number; size: string }[],
  defaultSize = '100vw'
): string {
  const rules = config
    .sort((a, b) => b.breakpoint - a.breakpoint)
    .map(({ breakpoint, size }) => `(min-width: ${breakpoint}px) ${size}`)

  return [...rules, defaultSize].join(', ')
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  url: string | undefined,
  preset: 'thumbnail' | 'card' | 'gallery' | 'hero' | 'full' = 'card'
): {
  src: string
  blurDataURL: string
  srcSet: string
  quality: number
} {
  const breakpoints = BREAKPOINTS[preset]
  const quality = QUALITY[preset]

  return {
    src: optimizeCloudinaryUrl(url, { quality }),
    blurDataURL: getBlurPlaceholder(url),
    srcSet: generateSrcSet(url, breakpoints, { quality }),
    quality,
  }
}

/**
 * Preload critical images
 */
export function preloadImage(url: string, options: CloudinaryOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = optimizeCloudinaryUrl(url, options)
    img.onload = () => resolve()
    img.onerror = reject
  })
}

/**
 * Preload hero images for yacht
 */
export async function preloadYachtImages(yacht: Yacht): Promise<void> {
  const heroMedia = yacht.media?.find(m => m.isCover) || yacht.media?.[0]
  if (!heroMedia?.url) return

  // Preload main hero image
  await preloadImage(heroMedia.url, {
    width: 1200,
    quality: 80,
    crop: 'fill',
    gravity: 'auto',
  })
}

/**
 * Get optimized gallery images for a yacht
 */
export function getYachtGalleryImages(
  images: string[] | undefined,
  options: { 
    thumbnailWidth?: number
    fullWidth?: number
  } = {}
): Array<{
  thumbnail: string
  full: string
  blurDataURL: string
}> {
  if (!images?.length) return []

  const { thumbnailWidth = 300, fullWidth = 1600 } = options

  return images.map(url => ({
    thumbnail: optimizeCloudinaryUrl(url, {
      width: thumbnailWidth,
      crop: 'fill',
      gravity: 'auto',
      quality: 70,
    }),
    full: optimizeCloudinaryUrl(url, {
      width: fullWidth,
      quality: 85,
    }),
    blurDataURL: getBlurPlaceholder(url),
  }))
}

/**
 * Get video thumbnail from Cloudinary video
 */
export function getVideoThumbnail(
  videoUrl: string,
  options: { width?: number; time?: string } = {}
): string {
  const { width = 800, time = '0' } = options
  
  // Convert video URL to image URL
  return videoUrl
    .replace('/video/upload/', `/video/upload/w_${width},q_auto,f_auto,so_${time}/`)
    .replace(/\.(mp4|webm|mov)$/, '.jpg')
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)
  return `${width / divisor}:${height / divisor}`
}

/**
 * Image dimensions for different contexts
 */
export const IMAGE_DIMENSIONS = {
  yachtCard: { width: 600, height: 450 }, // 4:3
  yachtHero: { width: 1920, height: 1080 }, // 16:9
  yachtThumbnail: { width: 150, height: 150 }, // 1:1
  galleryThumb: { width: 200, height: 150 }, // 4:3
  galleryFull: { width: 1600, height: 1200 }, // 4:3
  avatar: { width: 80, height: 80 }, // 1:1
  ogImage: { width: 1200, height: 630 }, // Open Graph
}

/**
 * Get optimized image URL for specific context
 */
export function getContextualImage(
  url: string | undefined,
  context: keyof typeof IMAGE_DIMENSIONS
): string {
  if (!url) return ''
  
  const dimensions = IMAGE_DIMENSIONS[context]
  return optimizeCloudinaryUrl(url, {
    width: dimensions.width,
    height: dimensions.height,
    crop: 'fill',
    gravity: 'auto',
    quality: context.includes('Thumb') ? 70 : 80,
  })
}
