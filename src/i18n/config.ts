// Internationalization Configuration
// Supports English and Arabic with RTL

export const locales = ['en', 'ar'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  ar: '🇦🇪',
}

export const rtlLocales: Locale[] = ['ar']

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRtlLocale(locale) ? 'rtl' : 'ltr'
}

// Font families per locale
export const localeFonts: Record<Locale, { body: string; display: string }> = {
  en: {
    body: 'var(--font-inter)',
    display: 'var(--font-display)',
  },
  ar: {
    body: 'var(--font-ibm-plex-arabic)',
    display: 'var(--font-ibm-plex-arabic)',
  },
}

// Cookie name for language preference
export const LOCALE_COOKIE = 'NEXT_LOCALE'

// Locale detection options
export const localeDetection = {
  lookupCookie: LOCALE_COOKIE,
  cookieMinutes: 60 * 24 * 365, // 1 year
  cookieSecure: process.env.NODE_ENV === 'production',
}
