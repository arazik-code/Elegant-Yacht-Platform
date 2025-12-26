'use client'

// reCAPTCHA v3 React Integration
// Client-side hook and provider for invisible reCAPTCHA

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

interface RecaptchaContextType {
  isLoaded: boolean
  isEnabled: boolean
  executeRecaptcha: (action: string) => Promise<string | null>
}

const RecaptchaContext = createContext<RecaptchaContextType>({
  isLoaded: false,
  isEnabled: false,
  executeRecaptcha: async () => null,
})

export function useRecaptcha() {
  return useContext(RecaptchaContext)
}

interface RecaptchaProviderProps {
  children: ReactNode
  siteKey?: string
}

export function RecaptchaProvider({ children, siteKey }: RecaptchaProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const effectiveSiteKey = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  useEffect(() => {
    // Skip if no site key or already loaded
    if (!effectiveSiteKey) {
      console.warn('reCAPTCHA site key not configured')
      return
    }

    if (typeof window !== 'undefined' && window.grecaptcha) {
      setIsLoaded(true)
      return
    }

    // Load reCAPTCHA script
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${effectiveSiteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      window.grecaptcha.ready(() => {
        setIsLoaded(true)
      })
    }

    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup (optional - script persists across navigations)
    }
  }, [effectiveSiteKey])

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!isLoaded || !effectiveSiteKey) {
      console.warn('reCAPTCHA not ready')
      return null
    }

    try {
      const token = await window.grecaptcha.execute(effectiveSiteKey, { action })
      return token
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error)
      return null
    }
  }, [isLoaded, effectiveSiteKey])

  return (
    <RecaptchaContext.Provider
      value={{
        isLoaded,
        isEnabled: !!effectiveSiteKey,
        executeRecaptcha,
      }}
    >
      {children}
    </RecaptchaContext.Provider>
  )
}

/**
 * Hook for form submissions with reCAPTCHA
 */
export function useRecaptchaForm(action: string) {
  const { isLoaded, isEnabled, executeRecaptcha } = useRecaptcha()
  const [isVerifying, setIsVerifying] = useState(false)

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!isEnabled) return null
    if (!isLoaded) {
      console.warn('reCAPTCHA not loaded yet')
      return null
    }

    setIsVerifying(true)
    try {
      const token = await executeRecaptcha(action)
      return token
    } finally {
      setIsVerifying(false)
    }
  }, [action, isLoaded, isEnabled, executeRecaptcha])

  return {
    isEnabled,
    isLoaded,
    isVerifying,
    getToken,
  }
}
