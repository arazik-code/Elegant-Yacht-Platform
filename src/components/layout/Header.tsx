'use client'

// Luxury Header Component
// Sticky navigation with transparent-to-solid transition

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { navigationLinks, siteConfig } from '@/lib/constants'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { FavoritesBadge } from '@/components/ui/FavoritesBadge'
import { CompareBadge } from '@/components/ui/CompareBadge'
import { useLocaleInfo } from '@/components/providers'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AISearch } from '@/components/search/AISearch'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations('nav')
  const { isRtl } = useLocaleInfo()

  // Handle scroll for transparent → solid header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const pathname = usePathname()

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-border py-3'
            : 'bg-transparent py-5'
        )}
      >
        <div className="container-luxury">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="relative z-10 flex items-center gap-3 group"
            >
              {/* Logo placeholder - replace with actual logo */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-gold/10 rounded-full group-hover:bg-gold/20 transition-colors" />
                <span className="text-gold font-display font-bold text-xl">B</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-foreground font-display font-bold text-xl tracking-tight">
                  Bimo
                </span>
                <span className="text-gold font-display font-bold text-xl tracking-tight ml-1">
                  Yacht
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-5 py-2 text-sm font-medium text-foreground/80 
                           hover:text-gold transition-colors duration-300
                           after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2
                           after:w-0 after:h-[2px] after:bg-gold
                           after:transition-all after:duration-300
                           hover:after:w-4/5"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            {/* Right Actions */}
            <div className="flex items-center gap-3 sm:gap-4">


              <div className="flex items-center gap-2">
                {/* Compare Badge */}
                <CompareBadge className="hidden md:flex bg-muted/50 hover:bg-muted" />

                {/* Favorites Badge */}
                <FavoritesBadge className="hidden md:flex bg-muted/50 hover:bg-muted" />
              </div>

              <div className="w-px h-6 bg-border/50 hidden md:block" />

              {/* Theme & Language */}
              <div className="hidden md:flex items-center gap-2">
                <ThemeToggle />
                <LanguageSwitcher variant="minimal" />
              </div>



              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative z-10 p-2 text-foreground hover:text-gold transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.nav
              initial={{ x: isRtl ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'absolute top-0 bottom-0 w-full max-w-sm bg-card border-border flex flex-col',
                isRtl ? 'left-0 border-r' : 'right-0 border-l'
              )}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <span className="text-gold font-display font-bold text-xl">
                  {t('menu')}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Language Switcher - Mobile */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <LanguageSwitcher variant="buttons" />
                <ThemeToggle />
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-6">
                {navigationLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-6 py-4
                               text-lg font-medium text-foreground/80 
                               hover:text-gold hover:bg-muted/50
                               transition-colors border-b border-border"
                    >
                      <span>{t(link.labelKey)}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-6 border-t border-border space-y-4">
                {/* Compare Link */}
                <Link
                  href="/compare"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-muted-foreground hover:text-gold transition-colors"
                >
                  <CompareBadge showLabel />
                </Link>

                {/* Favorites Link */}
                <Link
                  href="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-muted-foreground hover:text-gold transition-colors"
                >
                  <FavoritesBadge showLabel />
                </Link>

                {/* Phone */}
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>{siteConfig.phone}</span>
                </a>

                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/${siteConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4
                           bg-[#25D366] text-white font-semibold
                           hover:bg-[#20BD5A] transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('whatsapp')}
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
