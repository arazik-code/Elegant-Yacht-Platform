'use client'

// Yacht Description Component with Tabs for EN/AR

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Star, Sparkles } from 'lucide-react'

interface YachtDescriptionProps {
  descriptionEn?: string | null
  descriptionAr?: string | null
  highlightsEn?: string[]
  highlightsAr?: string[]
  amenitiesEn?: string[]
  amenitiesAr?: string[]
  locale?: string
}

const translations = {
  en: {
    description: 'Description',
    highlights: 'Highlights',
    amenities: 'Amenities',
    noDesc: 'No description available.',
    english: 'English',
    arabic: 'العربية'
  },
  ar: {
    description: 'الوصف',
    highlights: 'المميزات',
    amenities: 'وسائل الراحة',
    noDesc: 'لا يوجد وصف متاح.',
    english: 'English',
    arabic: 'العربية'
  }
}

export function YachtDescription({
  descriptionEn,
  descriptionAr,
  highlightsEn = [],
  highlightsAr = [],
  amenitiesEn = [],
  amenitiesAr = [],
  locale = 'en'
}: YachtDescriptionProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>(locale as 'en' | 'ar')

  // Sync with global locale changes
  useEffect(() => {
    if (locale) {
      setLanguage(locale as 'en' | 'ar')
    }
  }, [locale])

  const description = language === 'en' ? descriptionEn : descriptionAr
  const highlights = language === 'en' ? highlightsEn : highlightsAr
  const amenities = language === 'en' ? amenitiesEn : amenitiesAr

  const t = translations[language] || translations.en
  const isRtl = language === 'ar'

  return (
    <section className="space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Section Header with Language Toggle */}
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-display font-semibold text-foreground flex items-center gap-3 ${isRtl ? 'font-arabic' : ''}`}>
          <FileText className="w-6 h-6 text-gold" />
          {t.description}
        </h2>

        {/* Language Toggle */}
        {descriptionAr && (
          <div className="flex items-center gap-1 p-1 bg-muted/30 border border-border">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 text-sm font-medium transition-all
                       ${language === 'en'
                  ? 'bg-gold text-jet'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {t.english}
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-4 py-1.5 text-sm font-medium transition-all font-arabic
                       ${language === 'ar'
                  ? 'bg-gold text-jet'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {t.arabic}
            </button>
          </div>
        )}
      </div>

      {/* Description Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={language}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          dir={isRtl ? 'rtl' : 'ltr'}
          className={isRtl ? 'font-arabic text-right' : ''}
        >
          {description ? (
            <p className="text-body-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          ) : (
            <p className="text-muted-foreground/40 italic">
              {t.noDesc}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-lg font-display font-semibold text-foreground flex items-center gap-2 ${isRtl ? 'font-arabic' : ''}`}>
            <Star className="w-5 h-5 text-gold" />
            {t.highlights}
          </h3>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-gold/5 border border-gold/20"
              >
                <span className="w-8 h-8 flex items-center justify-center
                             bg-gold/10 text-gold text-sm font-bold">
                  {index + 1}
                </span>
                <span className={`text-foreground/80 ${isRtl ? 'font-arabic' : ''}`}>
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-lg font-display font-semibold text-foreground flex items-center gap-2 ${isRtl ? 'font-arabic' : ''}`}>
            <Sparkles className="w-5 h-5 text-gold" />
            {t.amenities}
          </h3>
          <div
            className="flex flex-wrap gap-2"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {amenities.map((amenity, index) => (
              <span
                key={index}
                className={`inline-flex px-4 py-2 bg-muted/30 border border-border
                         text-muted-foreground text-sm hover:border-gold/30 hover:text-gold
                         transition-colors ${isRtl ? 'font-arabic' : ''}`}
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
