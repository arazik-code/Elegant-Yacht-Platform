// next-intl Configuration
// This file is required at the root for next-intl to work with App Router

import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export const locales = ['en', 'ar'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined
  
  // Fallback to Accept-Language header
  let locale: Locale = defaultLocale
  
  if (localeCookie && locales.includes(localeCookie)) {
    locale = localeCookie
  } else {
    const headersList = await headers()
    const acceptLanguage = headersList.get('accept-language')
    
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2))
        .find(lang => locales.includes(lang as Locale)) as Locale | undefined
      
      if (preferredLocale) {
        locale = preferredLocale
      }
    }
  }
  
  // Load messages for the determined locale
  let messages
  try {
    messages = (await import(`./src/i18n/messages/${locale}.json`)).default
  } catch {
    // Fallback to English if locale file doesn't exist
    messages = (await import(`./src/i18n/messages/en.json`)).default
    locale = 'en'
  }
  
  return {
    locale,
    messages,
    timeZone: 'Asia/Dubai',
    now: new Date(),
  }
})
