'use client'

// Language Switcher Component
// Elegant dropdown for EN/AR switching with RTL support

import { useState, useRef, useEffect, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { locales, localeNames, localeFlags, type Locale, LOCALE_COOKIE, isRtlLocale } from '@/i18n/config'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'minimal'
  className?: string
}

export function LanguageSwitcher({ variant = 'dropdown', className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale
  const isRtl = isRtlLocale(locale)
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      // Set cookie with 1 year expiry
      document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`

      // Reload page to apply new locale
      window.location.reload()
    })
    setIsOpen(false)
  }

  // Minimal variant - just shows flag icons
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            disabled={isPending}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-full text-lg',
              'transition-all duration-200',
              locale === loc
                ? 'bg-gold/20 ring-1 ring-gold'
                : 'hover:bg-muted'
            )}
            aria-label={localeNames[loc]}
          >
            {localeFlags[loc]}
          </button>
        ))}
      </div>
    )
  }

  // Buttons variant - horizontal button group
  if (variant === 'buttons') {
    return (
      <div className={cn('flex items-center gap-0.5 bg-muted rounded-lg p-1', className)}>
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            disabled={isPending}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium',
              'transition-all duration-200',
              locale === loc
                ? 'bg-gold text-jet'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <span className="mr-1.5">{localeFlags[loc]}</span>
            {loc.toUpperCase()}
          </button>
        ))}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'text-foreground/80 hover:text-foreground',
          'bg-muted/50 hover:bg-muted',
          'transition-all duration-200',
          'border border-border hover:border-border/80',
          isPending && 'opacity-50 cursor-wait'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {localeFlags[locale]} {locale.toUpperCase()}
        </span>
        <ChevronDown className={cn(
          'w-3.5 h-3.5 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full mt-2 py-1 min-w-[140px]',
              'bg-popover border border-border rounded-lg',
              'shadow-xl shadow-black/20',
              'z-50',
              isRtl ? 'left-0' : 'right-0'
            )}
            role="listbox"
          >
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                disabled={isPending}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5',
                  'text-sm font-medium transition-colors duration-150',
                  locale === loc
                    ? 'text-gold bg-gold/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                role="option"
                aria-selected={locale === loc}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-lg">{localeFlags[loc]}</span>
                  <span>{localeNames[loc]}</span>
                </span>
                {locale === loc && <Check className="w-4 h-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
