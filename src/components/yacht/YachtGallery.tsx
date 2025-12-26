'use client'

// Yacht Gallery Component with Lightbox

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Play, Expand } from 'lucide-react'

interface MediaItem {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO'
  alt?: string
  isCover: boolean
}

interface YachtGalleryProps {
  media: MediaItem[]
  title: string
  locale?: string
}

const translations = {
  en: {
    noImages: 'No images available',
    viewGallery: 'View Gallery',
    more: 'more'
  },
  ar: {
    noImages: 'لا توجد صور متاحة',
    viewGallery: 'عرض المعرض',
    more: 'المزيد'
  }
}

export function YachtGallery({ media, title, locale = 'en' }: YachtGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const t = translations[locale as 'en' | 'ar'] || translations.en
  const isRtl = locale === 'ar'

  const images = media.filter(m => m.type === 'IMAGE')
  const videos = media.filter(m => m.type === 'VIDEO')

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[21/9] bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">{t.noImages}</p>
      </div>
    )
  }

  return (
    <>
      {/* Main Gallery */}
      <section className="relative bg-card" dir="ltr">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
          {/* Main Image */}
          <div className="lg:col-span-3 relative aspect-[16/9] lg:aspect-[21/12]">
            <Image
              src={images[currentIndex]?.url || images[0].url}
              alt={`${title} - Main Image`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 75vw"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2
                           w-12 h-12 flex items-center justify-center
                           bg-background/80 backdrop-blur-sm text-foreground
                           hover:bg-gold hover:text-jet
                           transition-all duration-300"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                           w-12 h-12 flex items-center justify-center
                           bg-background/80 backdrop-blur-sm text-foreground
                           hover:bg-gold hover:text-jet
                           transition-all duration-300"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Expand Button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className={`absolute bottom-4 right-4
                       px-4 py-2 flex items-center gap-2
                       bg-background/80 backdrop-blur-sm text-foreground
                       hover:bg-gold hover:text-jet
                       transition-all duration-300 ${isRtl ? 'font-arabic flex-row-reverse' : ''}`}
            >
              <Expand className="w-4 h-4" />
              <span className="text-sm font-medium">{t.viewGallery}</span>
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-4
                         px-3 py-1.5 bg-background/80 backdrop-blur-sm
                         text-foreground/80 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-1">
            {images.slice(0, 4).map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative aspect-[4/3] overflow-hidden
                         transition-all duration-300
                         ${currentIndex === index
                    ? 'ring-2 ring-gold ring-inset'
                    : 'hover:opacity-80'
                  }`}
              >
                <Image
                  src={image.url}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 25vw, 12.5vw"
                />

                {/* Show more overlay on 4th image */}
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <span className="text-foreground font-semibold">
                      +{images.length - 4} {t.more}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
          >
            {/* Close button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-10
                       w-12 h-12 flex items-center justify-center
                       bg-muted/10 text-foreground hover:bg-gold hover:text-jet
                       transition-all duration-300"
              aria-label="Close gallery"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Image */}
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-16">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full h-full max-w-6xl"
              >
                <Image
                  src={images[currentIndex].url}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </motion.div>
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2
                           w-14 h-14 flex items-center justify-center
                           bg-muted/10 text-foreground hover:bg-gold hover:text-jet
                           transition-all duration-300"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                           w-14 h-14 flex items-center justify-center
                           bg-muted/10 text-foreground hover:bg-gold hover:text-jet
                           transition-all duration-300"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                         flex items-center gap-2 overflow-x-auto
                         max-w-full px-4 py-2 no-scrollbar">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-16 h-12 flex-shrink-0 overflow-hidden
                           transition-all duration-300
                           ${currentIndex === index
                      ? 'ring-2 ring-gold opacity-100'
                      : 'opacity-50 hover:opacity-100'
                    }`}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="absolute top-4 left-4 px-3 py-1.5
                         bg-muted/10 backdrop-blur-sm text-foreground text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
