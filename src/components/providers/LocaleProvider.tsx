'use client'

// Locale Provider
// Wraps the app with RTL support and locale-specific font handling

import { useLocale } from 'next-intl'
import { useEffect } from 'react'
import { isRtlLocale, localeFonts, type Locale } from '@/i18n/config'

interface LocaleProviderProps {
  children: React.ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const locale = useLocale() as Locale
  const isRtl = isRtlLocale(locale)
  const fonts = localeFonts[locale]
  
  // Update document direction and lang attribute
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('dir', isRtl ? 'rtl' : 'ltr')
    html.setAttribute('lang', locale)
    
    // Update font CSS variables for the locale
    html.style.setProperty('--font-body', fonts.body)
    html.style.setProperty('--font-heading', fonts.display)
    
    // Add/remove RTL class for Tailwind utilities
    if (isRtl) {
      html.classList.add('rtl')
    } else {
      html.classList.remove('rtl')
    }
    
    return () => {
      html.classList.remove('rtl')
    }
  }, [locale, isRtl, fonts])
  
  return <>{children}</>
}

// Hook to get current locale info
export function useLocaleInfo() {
  const locale = useLocale() as Locale
  const isRtl = isRtlLocale(locale)
  const fonts = localeFonts[locale]
  
  return {
    locale,
    isRtl,
    direction: isRtl ? 'rtl' : 'ltr',
    fonts,
  }
}
