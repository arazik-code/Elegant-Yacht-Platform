// Contact Page

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Youtube,
  Check,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { contactSchema, type ContactFormData } from '@/lib/validations'
import { siteConfig } from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

export default function ContactPage() {
  const t = useTranslations('contact')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactMethods = [
    {
      icon: MessageCircle,
      title: t('methods.whatsapp'),
      value: siteConfig.whatsapp,
      href: getWhatsAppLink(siteConfig.whatsapp, 'Hello! I have a question.'),
      primary: true,
    },
    {
      icon: Phone,
      title: t('methods.phone'),
      value: siteConfig.phone,
      href: `tel:${siteConfig.phone}`,
    },
    {
      icon: Mail,
      title: t('methods.email'),
      value: siteConfig.email,
      href: `mailto:${siteConfig.email}`,
    },
    {
      icon: MapPin,
      title: t('methods.location'),
      value: t('methods.locationValue'),
      href: 'https://maps.google.com/?q=Dubai+Marina',
    },
  ]

  const subjectOptions = [
    { value: '', label: t('form.subjectSelect') },
    { value: 'buy-yacht', label: t('form.subjects.buy') },
    { value: 'sell-yacht', label: t('form.subjects.sell') },
    { value: 'charter', label: t('form.subjects.charter') },
    { value: 'partnership', label: t('form.subjects.partnership') },
    { value: 'media', label: t('form.subjects.media') },
    { value: 'other', label: t('form.subjects.other') },
  ]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      const message = `📧 NEW CONTACT FORM MESSAGE

From: ${data.name}
Phone: ${data.phone || 'Not provided'}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

—
Sent via bimoyacht.com contact form`

      const whatsappUrl = getWhatsAppLink(siteConfig.whatsapp, message)
      window.open(whatsappUrl, '_blank')

      setIsSubmitted(true)
      reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/yackht%204k.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50" />
        </div>

        <div className="container-luxury relative text-center">
          <h1 className="text-display-md md:text-display-lg font-display font-bold text-foreground mb-6">
            {t('hero.titlePrefix')} <span className="text-gold">{t('hero.titleHighlight')}</span>
          </h1>

          <p className="text-body-xl text-muted-foreground max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container-luxury">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method, i) => (
              <a
                key={i}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`group p-6 text-center transition-all duration-300
                         ${method.primary
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-muted/50 border border-border hover:border-gold/30'
                  }`}
              >
                <method.icon className={`w-6 h-6 mx-auto mb-3 
                  ${method.primary ? 'text-white' : 'text-gold'}`}
                />
                <div className={`font-semibold mb-1 
                  ${method.primary ? 'text-white' : 'text-foreground group-hover:text-gold'}`}>
                  {method.title}
                </div>
                <div className={`text-sm 
                  ${method.primary ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {method.value}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="section-padding">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-card border border-border p-8 md:p-10">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center
                               bg-green-500/20 rounded-full">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    {t('form.success.title')}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('form.success.message')}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setIsSubmitted(false)}
                  >
                    {t('form.success.sendAnother')}
                  </Button>
                </motion.div>
              ) : (
                <>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    {t('form.title')}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {t('form.subtitle')}
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label={t('form.name')}
                        placeholder={t('form.namePlaceholder')}
                        {...register('name')}
                        error={errors.name?.message}
                      />
                      <Input
                        label={t('form.phone')}
                        placeholder={t('form.phonePlaceholder')}
                        {...register('phone')}
                        error={errors.phone?.message}
                      />
                    </div>

                    <Input
                      label={t('form.email')}
                      type="email"
                      placeholder={t('form.emailPlaceholder')}
                      {...register('email')}
                      error={errors.email?.message}
                    />

                    <NativeSelect
                      label={t('form.subject')}
                      {...register('subject')}
                      error={errors.subject?.message}
                    >
                      {subjectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </NativeSelect>

                    <Textarea
                      label={t('form.message')}
                      placeholder={t('form.messagePlaceholder')}
                      rows={5}
                      {...register('message')}
                      error={errors.message?.message}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? t('form.submitting') : t('form.submit')}
                    </Button>
                  </form>
                </>
              )}
            </div>

            {/* Map + Info */}
            <div className="space-y-6">
              {/* Map */}
              <div className="relative aspect-[4/3] w-full bg-muted border border-border overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14438.889888888889!2d55.13!3d25.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0x3e8e4eeba9ab2dd6!2sDubai%20Marina!5e0!3m2!1sen!2sae!4v1234567890123"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale"
                />
              </div>

              {/* Office Hours */}
              <div className="p-6 bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-gold" />
                  <h3 className="text-foreground font-semibold">{t('hours.title')}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('hours.weekdays')}</span>
                    <span className="text-foreground">{t('hours.weekdaysTimes')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('hours.saturday')}</span>
                    <span className="text-foreground">{t('hours.saturdayTimes')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('hours.sunday')}</span>
                    <span className="text-muted-foreground/80">{t('hours.sundayTimes')}</span>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground text-sm">
                  {t('hours.whatsappNote')}
                </p>
              </div>

              {/* Social */}
              <div className="p-6 bg-card border border-border">
                <h3 className="text-foreground font-semibold mb-4">{t('social.title')}</h3>
                <div className="flex gap-4">
                  <a
                    href={siteConfig.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center
                             bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400
                             hover:opacity-80 transition-opacity"
                  >
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href={siteConfig.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center
                             bg-red-600 hover:bg-red-500 transition-colors"
                  >
                    <Youtube className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href={siteConfig.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center
                             bg-black border border-white/20 hover:border-white/40 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container-luxury text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('cta.subtitle')}
          </p>
          <Button asChild size="lg" variant="whatsapp">
            <a
              href={getWhatsAppLink(siteConfig.whatsapp, 'Hello! I have a question.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('cta.whatsapp')}
            </a>
          </Button>
        </div>
      </section>
    </main>
  )
}
