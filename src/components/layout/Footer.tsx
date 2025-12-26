// Luxury Footer Component
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Phone, Mail, MapPin, ArrowUpRight, Youtube } from 'lucide-react'
import { navigationLinks, siteConfig } from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useSettings } from '@/context/SettingsContext'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const { settings } = useSettings()

  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  // Fallback values
  const siteName = settings?.siteName || siteConfig.name
  const siteTagline = settings?.siteTagline || t('description')
  const whatsappNumber = settings?.whatsappNumber || siteConfig.whatsapp
  const phone = settings?.phone || siteConfig.phone
  const email = settings?.email || siteConfig.email
  const address = settings?.address || siteConfig.address
  const googleMapsEmbed = settings?.googleMapsEmbed || siteConfig.mapUrl
  const instagramUrl = settings?.instagramUrl || siteConfig.instagram
  const youtubeUrl = settings?.youtubeUrl || siteConfig.youtube
  const tiktokUrl = settings?.tiktokUrl || siteConfig.tiktok
  const footerText = settings?.footerText || `© ${currentYear} ${siteConfig.name}. ${t('allRightsReserved')}`

  return (
    <footer className="relative bg-card border-t border-border">
      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      {/* Main Footer Content */}
      <div className="container-luxury py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center bg-gold/10 rounded-full">
                  <span className="text-gold font-display font-bold text-lg">{siteName.charAt(0)}</span>
                </div>
                <div>
                  <span className="text-foreground font-display font-bold text-xl">{siteName.split(' ')[0]}</span>
                  <span className="text-gold font-display font-bold text-xl ms-1">{siteName.split(' ').slice(1).join(' ')}</span>
                </div>
              </div>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              {siteTagline}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 
                           text-gold text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                {settings?.dedLicenseNumber ? `DED: ${settings.dedLicenseNumber}` : t('dedLicensed')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 
                           text-gold text-xs font-medium rounded-full">
                🇦🇪 {t('uaeBased')}
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-display font-semibold mb-6">{t('quickLinks')}</h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-gold 
                             transition-colors duration-300 inline-flex items-center gap-1"
                  >
                    {tNav(link.labelKey)}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 
                                           transition-all group-hover:opacity-100 
                                           group-hover:translate-x-0 rtl:rotate-90" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-foreground font-display font-semibold mb-6">{t('servicesTitle')}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/yachts?type=SALE"
                  className="text-muted-foreground text-sm hover:text-gold transition-colors"
                >
                  {t('services.sales')}
                </Link>
              </li>
              <li>
                <Link
                  href="/charter"
                  className="text-muted-foreground text-sm hover:text-gold transition-colors"
                >
                  {t('services.charter')}
                </Link>
              </li>
              <li>
                <Link
                  href="/sell-your-yacht"
                  className="text-muted-foreground text-sm hover:text-gold transition-colors"
                >
                  {t('services.sell')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground text-sm hover:text-gold transition-colors"
                >
                  {t('services.management')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground text-sm hover:text-gold transition-colors"
                >
                  {t('services.consultation')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-display font-semibold mb-6">{t('contactUs')}</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={getWhatsAppLink(whatsappNumber, settings?.whatsappMessage || t('whatsappMessage'))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-muted-foreground hover:text-[#25D366] 
                           transition-colors group"
                >
                  <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="text-sm">{t('whatsappUs')}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone}`}
                  className="flex items-start gap-3 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Phone className="w-5 h-5 mt-0.5 shrink-0" />
                  <span className="text-sm">{phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-3 text-muted-foreground hover:text-gold transition-colors"
                >
                  <Mail className="w-5 h-5 mt-0.5 shrink-0" />
                  <span className="text-sm">{email}</span>
                </a>
              </li>
              <li>
                <a
                  href={googleMapsEmbed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-muted-foreground hover:text-gold transition-colors"
                >
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0" />
                  <span className="text-sm">{address}</span>
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 
                         hover:bg-gold/10 border border-border hover:border-gold/30
                         text-muted-foreground hover:text-gold transition-all group"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-sm font-medium">{siteConfig.instagramHandle}</span>
                <span className="text-xs text-gold">{siteConfig.instagramFollowers}</span>
              </a>
              <a
                href={siteConfig.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 
                         hover:bg-gold/10 border border-border hover:border-gold/30
                         text-muted-foreground hover:text-gold transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span className="text-sm font-medium">TikTok</span>
              </a>
              <a
                href={siteConfig.snapchat}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 
                         hover:bg-gold/10 border border-border hover:border-gold/30
                         text-muted-foreground hover:text-gold transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.166 3c.796 0 3.495.223 4.769 3.073.426.954.323 2.561.239 3.95l-.012.21c-.014.252-.026.49-.026.624 0 .178.102.354.378.474.403.176.81.263 1.209.263.193 0 .38-.022.542-.068.1-.029.193-.043.284-.043.239 0 .441.088.567.247.168.212.183.511.042.815-.257.556-.89.997-1.882 1.31-.13.041-.247.082-.353.124-.399.157-.544.255-.597.349-.102.179-.044.503.147.789a.83.83 0 0 0 .069.094c.454.595 1.008 1.133 1.532 1.52.517.381.998.637 1.47.783.173.053.418.138.481.385.057.226-.054.483-.33.77-.614.642-1.466.87-2.278 1.087l-.104.028c-.177.047-.301.195-.397.474-.082.238-.244.483-.656.483-.107 0-.228-.015-.364-.046a5.36 5.36 0 0 0-.992-.113c-.337 0-.638.036-.92.108-.429.109-.813.359-1.248.642-.75.49-1.601 1.045-3.045 1.045-.053 0-.109-.002-.162-.005l-.131.005c-1.444 0-2.295-.555-3.045-1.044-.435-.283-.819-.534-1.248-.643a3.66 3.66 0 0 0-.92-.108c-.413 0-.742.055-.992.113-.136.031-.257.046-.364.046-.461 0-.594-.298-.656-.483-.096-.279-.22-.427-.397-.474l-.104-.028c-.812-.217-1.664-.445-2.278-1.087-.276-.287-.387-.544-.33-.77.063-.247.308-.332.481-.385.472-.146.953-.402 1.47-.789-.053-.094-.198-.192-.597-.349a5.858 5.858 0 0 0-.353-.124c-.992-.313-1.625-.754-1.882-1.31-.141-.304-.126-.603.042-.815.126-.159.328-.247.567-.247.091 0 .184.014.284.043.162.046.349.068.542.068.399 0 .806-.087 1.209-.263.276-.12.378-.296.378-.474 0-.134-.012-.372-.026-.624l-.012-.21c-.084-1.389-.187-2.996.239-3.95C8.505 3.223 11.204 3 12 3h.166z" />
                </svg>
                <span className="text-sm font-medium">Snapchat</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-luxury py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              {footerText}
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                {t('privacyPolicy')}
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                {t('terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
