// Sell Your Yacht Page

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Shield, Users, TrendingUp, Camera, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { sellYachtSchema, type SellYachtFormData } from '@/lib/validations'
import { siteConfig, yachtBrands } from '@/lib/constants'
import { getWhatsAppLink } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'

export default function SellYourYachtPage() {
  const t = useTranslations('sell')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const benefits = [
    {
      icon: Users,
      titleKey: 'benefits.reach.title',
      descKey: 'benefits.reach.desc',
    },
    {
      icon: Shield,
      titleKey: 'benefits.licensed.title',
      descKey: 'benefits.licensed.desc',
    },
    {
      icon: TrendingUp,
      titleKey: 'benefits.premium.title',
      descKey: 'benefits.premium.desc',
    },
    {
      icon: Camera,
      titleKey: 'benefits.photo.title',
      descKey: 'benefits.photo.desc',
    },
    {
      icon: Clock,
      titleKey: 'benefits.fast.title',
      descKey: 'benefits.fast.desc',
    },
    {
      icon: MessageCircle,
      titleKey: 'benefits.support.title',
      descKey: 'benefits.support.desc',
    },
  ]

  const yearOptions = [
    { value: '', label: t('form.yearSelect') },
    ...Array.from({ length: 30 }, (_, i) => {
      const year = new Date().getFullYear() - i
      return { value: year.toString(), label: year.toString() }
    }),
  ]

  const lengthOptions = [
    { value: '', label: t('form.lengthSelect') },
    { value: '30', label: '30 ft' },
    { value: '40', label: '40 ft' },
    { value: '50', label: '50 ft' },
    { value: '60', label: '60 ft' },
    { value: '80', label: '80 ft' },
    { value: '100', label: '100 ft' },
    { value: '120', label: '120 ft' },
    { value: '150', label: '150+ ft' },
  ]

  const conditionOptions = [
    { value: 'EXCELLENT', label: t('form.conditionExcellent') },
    { value: 'GOOD', label: t('form.conditionGood') },
    { value: 'FAIR', label: t('form.conditionFair') },
  ]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SellYachtFormData>({
    resolver: zodResolver(sellYachtSchema),
    defaultValues: {
      priceNegotiable: true,
      condition: 'GOOD',
    }
  })

  const onSubmit = async (data: SellYachtFormData) => {
    setIsSubmitting(true)

    try {
      // Submit to API for email notifications
      const apiResponse = await fetch('/api/sell-yacht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!apiResponse.ok) {
        console.error('API submission failed')
      }

      // Prepare WhatsApp message
      const message = `🚤 NEW YACHT LISTING REQUEST

Owner: ${data.name}
Phone: ${data.phone}
Email: ${data.email}

YACHT DETAILS:
• Brand: ${data.yachtBrand}
• Model: ${data.yachtModel}
• Year: ${data.yachtYear}
• Length: ${data.yachtLength} ft
• Condition: ${data.condition}
• Asking Price: ${data.askingPrice ? `$${data.askingPrice.toLocaleString()}` : 'To be discussed'}
• Location: ${data.location || 'Not specified'}

Additional Notes: ${data.notes || 'None'}

—
Submitted via bimoyacht.com`

      // Open WhatsApp with pre-filled message
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
    <main className="min-h-screen bg-gray-50 dark:bg-jet pt-20">
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
            <source src={siteConfig.heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-jet via-jet/90 to-jet/70" />
        </div>

        <div className="container-luxury relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-6
                         bg-gold/10 border border-gold/30 text-gold text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              {t('hero.badge')}
            </span>

            <h1 className="text-display-md md:text-display-lg font-display font-bold text-white mb-6">
              {t('hero.title')} <span className="text-gold">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-body-xl text-white/70 mb-8">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-white/80">
                <Check className="w-5 h-5 text-gold" />
                {t('hero.freeValuation')}
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Check className="w-5 h-5 text-gold" />
                {t('hero.professionalPhotos')}
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Check className="w-5 h-5 text-gold" />
                {t('hero.noUpfrontFees')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white dark:bg-navy border-y border-gray-200 dark:border-white/5">
        <div className="container-luxury">
          <div className="text-center mb-12">
            <span className="text-gold text-sm font-medium tracking-widest uppercase mb-3 block">
              {t('benefits.badge')}
            </span>
            <h2 className="heading-section text-gray-900 dark:text-white">
              {t('benefits.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10
                         hover:border-gold/30 transition-all duration-300"
              >
                <div className="w-12 h-12 mb-4 flex items-center justify-center
                             bg-gold/10 group-hover:bg-gold/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t(benefit.titleKey)}</h3>
                <p className="text-gray-600 dark:text-white/60 text-sm leading-relaxed">{t(benefit.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="form" className="section-padding">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div className="bg-white dark:bg-navy/50 border border-gray-200 dark:border-white/10 p-8 md:p-10 shadow-sm dark:shadow-none">
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
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('form.success.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-white/60 mb-6">
                    {t('form.success.message')}
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setIsSubmitted(false)}
                  >
                    {t('form.success.submitAnother')}
                  </Button>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                    {t('form.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-white/60 mb-8">
                    {t('form.subtitle')}
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Owner Details */}
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

                    {/* Yacht Details */}
                    <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                      <h4 className="text-gray-900 dark:text-white font-semibold mb-4">{t('form.yachtDetails')}</h4>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <NativeSelect
                          label={t('form.brand')}
                          {...register('yachtBrand')}
                          error={errors.yachtBrand?.message}
                        >
                          <option value="">{t('form.brandSelect')}</option>
                          {yachtBrands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                          <option value="Other">{t('form.other')}</option>
                        </NativeSelect>

                        <Input
                          label={t('form.model')}
                          placeholder={t('form.modelPlaceholder')}
                          {...register('yachtModel')}
                          error={errors.yachtModel?.message}
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <NativeSelect
                          label={t('form.year')}
                          {...register('yachtYear', { valueAsNumber: true })}
                          error={errors.yachtYear?.message}
                        >
                          {yearOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </NativeSelect>

                        <NativeSelect
                          label={t('form.length')}
                          {...register('yachtLength', { valueAsNumber: true })}
                          error={errors.yachtLength?.message}
                        >
                          {lengthOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </NativeSelect>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                        <NativeSelect
                          label={t('form.condition')}
                          {...register('condition')}
                          error={errors.condition?.message}
                        >
                          {conditionOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </NativeSelect>

                        <Input
                          label={t('form.location')}
                          placeholder={t('form.locationPlaceholder')}
                          {...register('location')}
                          error={errors.location?.message}
                        />
                      </div>

                      <div className="mt-4">
                        <Input
                          label={t('form.askingPrice')}
                          type="number"
                          placeholder={t('form.askingPricePlaceholder')}
                          {...register('askingPrice', { valueAsNumber: true })}
                          error={errors.askingPrice?.message}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <Textarea
                      label={t('form.notes')}
                      placeholder={t('form.notesPlaceholder')}
                      rows={4}
                      {...register('notes')}
                      error={errors.notes?.message}
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

                    <p className="text-gray-500 dark:text-white/40 text-xs text-center">
                      {t('form.terms')}
                    </p>
                  </form>
                </>
              )}
            </div>

            {/* Info */}
            <div className="lg:sticky lg:top-28">
              <div className="bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 p-8">
                <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
                  {t('info.title')}
                </h3>
                <p className="text-gray-600 dark:text-white/70 mb-6 leading-relaxed">
                  {t('info.subtitle')}
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gold/20">
                      <span className="text-gold font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-semibold mb-1">{t('info.step1.title')}</h4>
                      <p className="text-gray-600 dark:text-white/60 text-sm">{t('info.step1.desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gold/20">
                      <span className="text-gold font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-semibold mb-1">{t('info.step2.title')}</h4>
                      <p className="text-gray-600 dark:text-white/60 text-sm">{t('info.step2.desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gold/20">
                      <span className="text-gold font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-semibold mb-1">{t('info.step3.title')}</h4>
                      <p className="text-gray-600 dark:text-white/60 text-sm">{t('info.step3.desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gold/20">
                      <span className="text-gold font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-semibold mb-1">{t('info.step4.title')}</h4>
                      <p className="text-gray-600 dark:text-white/60 text-sm">{t('info.step4.desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gold/20">
                      <span className="text-gold font-bold">5</span>
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-semibold mb-1">{t('info.step5.title')}</h4>
                      <p className="text-gray-600 dark:text-white/60 text-sm">{t('info.step5.desc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="mt-6 p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <p className="text-gray-600 dark:text-white/60 text-sm mb-4">
                  {t('info.quickContact')}
                </p>
                <Button asChild variant="whatsapp" className="w-full">
                  <a
                    href={getWhatsAppLink(siteConfig.whatsapp, 'Hello! I want to sell my yacht.')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {t('info.whatsapp')}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
