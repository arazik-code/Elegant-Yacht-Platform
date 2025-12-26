// Admin Settings Page

'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Phone, Mail, Instagram, Globe, Bell, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

interface SettingsFormData {
  siteName: string
  siteTagline: string
  whatsappNumber: string
  phone: string
  email: string
  instagramUrl: string
  youtubeUrl: string
  tiktokUrl: string
  address: string
  googleMapsEmbed: string
  footerText: string
  // Email Notification Settings
  adminEmailAddress: string
  emailNotifyInquiry: boolean
  emailNotifyListing: boolean
  emailDailyDigest: boolean
  emailFooterContent: string
}

export default function AdminSettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [sendingTestEmail, setSendingTestEmail] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    defaultValues: {
      siteName: 'Bimo Yacht For Sale',
      siteTagline: 'Luxury Yachts in Dubai',
      whatsappNumber: '+971501234567',
      phone: '+971501234567',
      email: 'hello@bimoyacht.com',
      instagramUrl: 'https://instagram.com/bimoyacht',
      youtubeUrl: 'https://youtube.com/@bimoyacht',
      tiktokUrl: 'https://tiktok.com/@bimoyacht',
      address: 'Dubai Marina, Dubai, UAE',
      googleMapsEmbed: '',
      footerText: '© 2024 Bimo Yacht For Sale. DED Licensed. All rights reserved.',
      // Email defaults
      adminEmailAddress: '',
      emailNotifyInquiry: true,
      emailNotifyListing: true,
      emailDailyDigest: false,
      emailFooterContent: '© Bimo Yacht - Premium Yacht Brokerage in Dubai',
    },
  })

  // Watch email settings to show/hide related fields
  const emailNotifyInquiry = watch('emailNotifyInquiry')
  const emailNotifyListing = watch('emailNotifyListing')
  const emailDailyDigest = watch('emailDailyDigest')

  useEffect(() => {
    // Fetch settings on load
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const data = await response.json()
          // Update form values
          // We can use reset(data) but need to ensure data matches schema
          // For safety, let's just let react-hook-form handle it via defaultValues if we passed them,
          // but since we render client-side, we should reset.
          // However, defaultValues are already set. We need to override them.
          // Using reset() is the best way.
          // Note: we need to handle the case where some fields might be missing in DB data

          // Remove id and timestamps
          const { id, createdAt, updatedAt, ...formData } = data

          // Reset form with fetched data merged with defaults (to ensure all fields exist)
          // We can't access defaultValues easily here without recreating them or just relying on reset
          // Let's just reset with received data.

          // Helper to ensure boolean fields are boolean (sometimes API returns strings if using formData, but JSON is safe)

          reset(formData)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }

    fetchSettings()
  }, []) // We need to include 'reset' in dependency array if we destructured it.
  // Wait, I didn't destructure reset from useForm. I need to add that.

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true)
    setSaved(false)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      const updatedSettings = await response.json()

      // Update form with latest data
      const { id, createdAt, updatedAt, ...formData } = updatedSettings
      reset(formData)

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmailAddress) return

    setSendingTestEmail(true)
    setTestEmailResult(null)

    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmailAddress }),
      })

      const data = await response.json()

      if (data.success) {
        setTestEmailResult({ success: true, message: `Test email sent to ${testEmailAddress}` })
      } else {
        setTestEmailResult({ success: false, message: data.error || 'Failed to send test email' })
      }
    } catch (error) {
      setTestEmailResult({ success: false, message: 'Network error. Please try again.' })
    } finally {
      setSendingTestEmail(false)
      // Clear result after 5 seconds
      setTimeout(() => setTestEmailResult(null), 5000)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
        <p className="text-white/60">Configure your website settings</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* General Settings */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-gold" />
            General
          </h2>

          <Input
            label="Site Name"
            {...register('siteName')}
          />

          <Input
            label="Tagline"
            {...register('siteTagline')}
          />

          <Input
            label="Footer Copyright Text"
            {...register('footerText')}
          />
        </section>

        {/* Contact Settings */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-gold" />
            Contact Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="WhatsApp Number"
              placeholder="+971501234567"
              {...register('whatsappNumber')}
            />

            <Input
              label="Phone Number"
              placeholder="+971501234567"
              {...register('phone')}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            {...register('email')}
          />

          <Textarea
            label="Address"
            rows={2}
            {...register('address')}
          />

          <Textarea
            label="Google Maps Embed URL"
            placeholder="https://www.google.com/maps/embed?..."
            rows={2}
            {...register('googleMapsEmbed')}
          />
        </section>

        {/* Email Notifications Settings */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-gold" />
            Email Notifications
          </h2>

          <p className="text-sm text-white/60">
            Configure email notifications for inquiries, listings, and daily digests.
          </p>

          {/* Admin Email */}
          <Input
            label="Admin Email Address"
            type="email"
            placeholder="admin@bimoyacht.com"
            helperText="Email address where admin notifications will be sent"
            {...register('adminEmailAddress')}
          />

          {/* Toggle: Inquiry Notifications */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex-1">
              <label className="text-sm font-medium text-white block">
                New Inquiry Alerts
              </label>
              <p className="text-xs text-white/50 mt-1">
                Receive email when a new inquiry is submitted
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('emailNotifyInquiry')}
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          {/* Toggle: Listing Notifications */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex-1">
              <label className="text-sm font-medium text-white block">
                Yacht Listing Submissions
              </label>
              <p className="text-xs text-white/50 mt-1">
                Send confirmation emails when someone submits their yacht for sale
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('emailNotifyListing')}
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          {/* Toggle: Daily Digest */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex-1">
              <label className="text-sm font-medium text-white block">
                Daily Digest
              </label>
              <p className="text-xs text-white/50 mt-1">
                Receive a summary of daily activity (inquiries, stats)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                {...register('emailDailyDigest')}
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
            </label>
          </div>

          {/* Email Footer Content */}
          <Textarea
            label="Email Footer Content"
            placeholder="© Bimo Yacht - Premium Yacht Brokerage in Dubai"
            helperText="Custom footer text that appears in all email notifications"
            rows={2}
            {...register('emailFooterContent')}
          />
        </section>

        {/* Test Email Section */}
        <section className="bg-gold/10 border border-gold/30 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-gold" />
            Test Email Configuration
          </h2>

          <p className="text-sm text-white/60">
            Send a test email to verify your email configuration is working correctly.
          </p>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter email address"
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail || !testEmailAddress}
            >
              {sendingTestEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Test
                </>
              )}
            </Button>
          </div>

          {/* Test Email Result */}
          {testEmailResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${testEmailResult.success
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
              }`}>
              {testEmailResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{testEmailResult.message}</span>
            </div>
          )}
        </section>

        {/* Social Media Settings */}
        <section className="bg-white/5 border border-white/10 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Instagram className="w-5 h-5 text-gold" />
            Social Media
          </h2>

          <Input
            label="Instagram URL"
            placeholder="https://instagram.com/yourhandle"
            {...register('instagramUrl')}
          />

          <Input
            label="YouTube URL"
            placeholder="https://youtube.com/@yourchannel"
            {...register('youtubeUrl')}
          />

          <Input
            label="TikTok URL"
            placeholder="https://tiktok.com/@yourhandle"
            {...register('tiktokUrl')}
          />
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-green-400 text-sm">Settings saved successfully!</span>
          )}
          <Button type="submit" variant="primary" disabled={isSubmitting} className="ml-auto">
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <section className="bg-red-500/10 border border-red-500/30 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
        <p className="text-white/60 text-sm">
          These actions are irreversible. Please be careful.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            Clear All Inquiries
          </Button>
          <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            Reset Settings
          </Button>
        </div>
      </section>
    </div>
  )
}
