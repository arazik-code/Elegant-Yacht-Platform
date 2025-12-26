'use client'

// Yacht Inquiry Sidebar - Sticky CTA Component

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Calendar, MessageCircle, Check, Loader2, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { inquirySchema, type InquiryFormData } from '@/lib/validations'
import { formatCurrency } from '@/lib/utils'
import { siteConfig } from '@/lib/constants'
import { generateTrackedWhatsAppLink } from '@/lib/whatsapp'
import { useRecaptchaForm } from '@/components/providers/RecaptchaProvider'
import { useFavoritesStore, useCompareStore, useSessionStore } from '@/lib/stores'

interface YachtInquiryProps {
  yacht: {
    id: string
    title: string
    type: 'SALE' | 'CHARTER'
    price?: number | null
    priceOnRequest?: boolean
    showPrice?: boolean
    charterPricePerWeek?: number | null
    charterPricePerSeasonWinter?: number | null
    charterPricePerSeasonSummer?: number | null
    currency?: string
  }
  locale?: string
}

const translations = {
  en: {
    from: 'From',
    winter: 'Winter Season',
    summer: 'Summer Season',
    askingPrice: 'Asking Price',
    priceOnRequest: 'Price on Request',
    week: '/week',
    inquireWhatsApp: 'Inquire on WhatsApp',
    callUs: 'Call Us',
    scheduleView: 'Schedule View',
    requestInfo: 'Request Information',
    inquirySent: 'Inquiry Sent!',
    respondShortly: "We'll respond shortly. You can also continue on WhatsApp.",
    sendAnother: 'Send Another Inquiry',
    name: 'Your Name *',
    phone: 'Phone Number *',
    email: 'Email (optional)',
    message: 'Message (optional)',
    send: 'Send Inquiry',
    sending: 'Sending...',
    protected: 'Protected by reCAPTCHA',
    fastResponse: 'Fast Response',
    dedLicensed: 'DED Licensed'
  },
  ar: {
    from: 'يبدأ من',
    winter: 'الموسم الشتوي',
    summer: 'الموسم الصيفي',
    askingPrice: 'السعر المطلوب',
    priceOnRequest: 'السعر عند الطلب',
    week: '/أسبوع',
    inquireWhatsApp: 'تواصل عبر واتساب',
    callUs: 'اتصل بنا',
    scheduleView: 'حجز معاينة',
    requestInfo: 'طلب معلومات',
    inquirySent: 'تم الإرسال!',
    respondShortly: 'سنرد عليك قريباً. يمكنك أيضاً المتابعة عبر واتساب.',
    sendAnother: 'إرسال استفسار آخر',
    name: 'الاسم *',
    phone: 'رقم الهاتف *',
    email: 'البريد الإلكتروني (اختياري)',
    message: 'الرسالة (اختياري)',
    send: 'إرسال الاستفسار',
    sending: 'جاري الإرسال...',
    protected: 'محمي بواسطة reCAPTCHA',
    fastResponse: 'رد سريع',
    dedLicensed: 'مرخص من الدائرة الاقتصادية'
  }
}

export function YachtInquiry({ yacht, locale = 'en' }: YachtInquiryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedInquiryId, setSubmittedInquiryId] = useState<string | null>(null)

  const t = translations[locale as 'en' | 'ar'] || translations.en
  const isRtl = locale === 'ar'

  // reCAPTCHA integration
  const { isEnabled: recaptchaEnabled, getToken } = useRecaptchaForm('inquiry')

  const { favorites } = useFavoritesStore()
  const { compareList } = useCompareStore()
  const { getSessionContext } = useSessionStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      yachtId: yacht.id,
      source: 'WEBSITE',
    },
  })

  // Generate WhatsApp link for the yacht
  const context = yacht.type === 'CHARTER' ? 'charter_inquiry' : 'yacht_inquiry'
  const whatsappLink = generateTrackedWhatsAppLink(context, {
    yachtTitle: yacht.title,
    yachtId: yacht.id,
  })

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true)

    try {
      // Get reCAPTCHA token if enabled
      let recaptchaToken: string | null = null
      if (recaptchaEnabled) {
        recaptchaToken = await getToken()
      }

      // Get session context for intent intelligence
      const sessionContext = getSessionContext()

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
          context: {
            // User behavior data
            favorites,
            compareList,
            yachtsViewed: sessionContext.yachtsViewed,
            sessionDuration: sessionContext.sessionDuration,
            totalTimeSpent: sessionContext.totalTimeSpent,
            // Page context
            yachtContext: yacht,
            url: window.location.href,
            referrer: document.referrer || undefined,
          }
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setIsSuccess(true)
        setSubmittedInquiryId(result.inquiry?.id || null)
        reset()

        // Open WhatsApp with tracked link after form submission
        const postSubmitLink = generateTrackedWhatsAppLink(context, {
          yachtTitle: yacht.title,
          yachtId: yacht.id,
          inquiryId: result.inquiry?.id,
        })
        window.open(postSubmitLink, '_blank')
      } else {
        throw new Error('Failed to submit inquiry')
      }
    } catch (error) {
      console.error('Inquiry submission error:', error)
      alert('Failed to submit inquiry. Please try WhatsApp instead.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Price display logic
  const getPriceDisplay = () => {
    if (yacht.type === 'CHARTER') {
      if (yacht.charterPricePerWeek) {
        return {
          label: t.from,
          price: formatCurrency(yacht.charterPricePerWeek, yacht.currency),
          suffix: t.week,
        }
      }
      if (yacht.charterPricePerSeasonWinter) {
        return {
          label: t.winter,
          price: formatCurrency(yacht.charterPricePerSeasonWinter, yacht.currency),
          suffix: '',
        }
      }
    }

    if (yacht.priceOnRequest || !yacht.showPrice || !yacht.price) {
      return { label: '', price: t.priceOnRequest, suffix: '' }
    }

    return {
      label: t.askingPrice,
      price: formatCurrency(yacht.price, yacht.currency),
      suffix: '',
    }
  }

  const priceInfo = getPriceDisplay()

  return (
    <div className="sticky top-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border overflow-hidden"
      >
        {/* Price Header */}
        <div className="p-6 border-b border-border bg-gradient-to-br from-card to-muted/50">
          {priceInfo.label && (
            <span className={`text-muted-foreground text-sm ${isRtl ? 'font-arabic' : ''}`}>{priceInfo.label}</span>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-display font-bold text-gold">
              {priceInfo.price}
            </span>
            {priceInfo.suffix && (
              <span className={`text-muted-foreground ${isRtl ? 'font-arabic' : ''}`}>{priceInfo.suffix}</span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 space-y-3 border-b border-border">
          {/* Primary WhatsApp CTA */}
          <a
            href={whatsappLink}
            className={`flex items-center justify-center gap-3 w-full py-4
                     bg-[#25D366] text-white font-semibold
                     hover:bg-[#20BD5A] hover:shadow-lg
                     transition-all duration-300 ${isRtl ? 'font-arabic flex-row-reverse' : ''}`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t.inquireWhatsApp}
          </a>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${siteConfig.phone}`}
              className={`flex items-center justify-center gap-2 py-3
                       bg-muted/50 border border-border text-foreground/80
                       hover:border-gold/30 hover:text-gold
                       transition-colors text-sm ${isRtl ? 'font-arabic flex-row-reverse' : ''}`}
            >
              <Phone className="w-4 h-4" />
              {t.callUs}
            </a>
            <button
              onClick={() => {
                const formElement = document.getElementById('inquiry-form')
                formElement?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={`flex items-center justify-center gap-2 py-3
                       bg-muted/50 border border-border text-foreground/80
                       hover:border-gold/30 hover:text-gold
                       transition-colors text-sm ${isRtl ? 'font-arabic flex-row-reverse' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              {t.scheduleView}
            </button>
          </div>
        </div>

        {/* Inquiry Form */}
        <div id="inquiry-form" className="p-6">
          <h3 className={`text-lg font-display font-semibold text-foreground mb-4 ${isRtl ? 'font-arabic' : ''}`}>
            {t.requestInfo}
          </h3>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center
                           bg-[#25D366]/20 rounded-full">
                <Check className="w-8 h-8 text-[#25D366]" />
              </div>
              <h4 className={`text-foreground font-semibold mb-2 ${isRtl ? 'font-arabic' : ''}`}>{t.inquirySent}</h4>
              <p className={`text-muted-foreground text-sm mb-4 ${isRtl ? 'font-arabic' : ''}`}>
                {t.respondShortly}
              </p>
              <Button
                variant="secondary"
                onClick={() => setIsSuccess(false)}
                className={isRtl ? 'font-arabic' : ''}
              >
                {t.sendAnother}
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  placeholder={t.name}
                  {...register('name')}
                  error={errors.name?.message}
                  className={isRtl ? 'font-arabic text-right' : ''}
                />
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder={t.phone}
                  {...register('phone')}
                  error={errors.phone?.message}
                  className={isRtl ? 'font-arabic text-right' : ''}
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder={t.email}
                  {...register('email')}
                  error={errors.email?.message}
                  className={isRtl ? 'font-arabic text-right' : ''}
                />
              </div>

              <div>
                <Textarea
                  placeholder={t.message}
                  rows={3}
                  {...register('message')}
                  error={errors.message?.message}
                  className={isRtl ? 'font-arabic text-right' : ''}
                />
              </div>

              {/* Hidden honeypot field - bots will fill this */}
              <input
                type="text"
                name="website"
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <input type="hidden" {...register('yachtId')} />
              <input type="hidden" {...register('source')} />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className={`w-full ${isRtl ? 'font-arabic' : ''}`}
                loading={isSubmitting}
              >
                {isSubmitting ? t.sending : t.send}
              </Button>

              <p className={`text-muted-foreground/40 text-xs text-center flex items-center justify-center gap-1 ${isRtl ? 'font-arabic' : ''}`}>
                <Shield className="w-3 h-3" />
                {t.protected}
              </p>
            </form>
          )}
        </div>

        {/* Trust indicators */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
            <span className={`flex items-center gap-1.5 text-muted-foreground text-xs ${isRtl ? 'font-arabic flex-row-reverse' : ''}`}>
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              {t.fastResponse}
            </span>
            <span className={`flex items-center gap-1.5 text-muted-foreground text-xs ${isRtl ? 'font-arabic flex-row-reverse' : ''}`}>
              <span className="w-2 h-2 rounded-full bg-gold" />
              {t.dedLicensed}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
