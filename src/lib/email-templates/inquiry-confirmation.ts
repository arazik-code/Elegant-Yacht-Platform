// Email Template - Inquiry Confirmation (to customer)

import { emailLayout } from './layout'
import { siteConfig } from '@/lib/constants'

interface InquiryConfirmationProps {
  customerName: string
  yachtTitle?: string
  inquiryType: 'yacht' | 'charter' | 'sell' | 'general'
  message?: string
  locale?: 'en' | 'ar'
}

export function inquiryConfirmationEmail({
  customerName,
  yachtTitle,
  inquiryType,
  message,
  locale = 'en',
}: InquiryConfirmationProps): { subject: string; html: string; text: string } {
  const isArabic = locale === 'ar'
  
  const subjects = {
    en: yachtTitle 
      ? `We received your inquiry about ${yachtTitle}`
      : 'Thank you for contacting Bimo Yacht',
    ar: yachtTitle
      ? `لقد استلمنا استفسارك حول ${yachtTitle}`
      : 'شكراً لتواصلك مع بيمو يخت',
  }
  
  const content = isArabic ? `
    <h1 style="text-align: right;">مرحباً ${customerName}،</h1>
    
    <p style="text-align: right;">
      شكراً لتواصلك مع بيمو يخت. لقد استلمنا استفسارك وسيتواصل معك فريقنا خلال 24 ساعة.
    </p>
    
    ${yachtTitle ? `
    <div class="info-box" style="text-align: right;">
      <p><strong>اليخت المطلوب:</strong> ${yachtTitle}</p>
    </div>
    ` : ''}
    
    ${message ? `
    <h2 style="text-align: right;">رسالتك:</h2>
    <p style="text-align: right; background: rgba(255,255,255,0.05); padding: 16px; border-radius: 4px;">
      ${message}
    </p>
    ` : ''}
    
    <p style="text-align: right;">
      في غضون ذلك، يمكنك التواصل معنا مباشرة عبر:
    </p>
    
    <table class="details-table" style="text-align: right;">
      <tr>
        <td>واتساب</td>
        <td><a href="https://wa.me/${siteConfig.whatsapp}">+971 50 156 6633</a></td>
      </tr>
      <tr>
        <td>الهاتف</td>
        <td><a href="tel:${siteConfig.phone}">${siteConfig.phone}</a></td>
      </tr>
      <tr>
        <td>البريد الإلكتروني</td>
        <td><a href="mailto:${siteConfig.email}">${siteConfig.email}</a></td>
      </tr>
    </table>
    
    <p style="text-align: right;">
      مع أطيب التحيات،<br>
      <strong>فريق بيمو يخت</strong>
    </p>
  ` : `
    <h1>Hello ${customerName},</h1>
    
    <p>
      Thank you for reaching out to Bimo Yacht. We have received your inquiry and our team will contact you within 24 hours.
    </p>
    
    ${yachtTitle ? `
    <div class="info-box">
      <p><strong>Yacht of Interest:</strong> ${yachtTitle}</p>
    </div>
    ` : ''}
    
    ${message ? `
    <h2>Your Message:</h2>
    <p style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 4px;">
      ${message}
    </p>
    ` : ''}
    
    <p>
      In the meantime, feel free to reach out to us directly:
    </p>
    
    <table class="details-table">
      <tr>
        <td>WhatsApp</td>
        <td><a href="https://wa.me/${siteConfig.whatsapp}">+971 50 156 6633</a></td>
      </tr>
      <tr>
        <td>Phone</td>
        <td><a href="tel:${siteConfig.phone}">${siteConfig.phone}</a></td>
      </tr>
      <tr>
        <td>Email</td>
        <td><a href="mailto:${siteConfig.email}">${siteConfig.email}</a></td>
      </tr>
    </table>
    
    <p>
      Best regards,<br>
      <strong>Bimo Yacht Team</strong>
    </p>
  `
  
  const text = isArabic
    ? `مرحباً ${customerName}، شكراً لتواصلك مع بيمو يخت. سيتواصل معك فريقنا خلال 24 ساعة.`
    : `Hello ${customerName}, Thank you for contacting Bimo Yacht. Our team will contact you within 24 hours.`
  
  return {
    subject: subjects[locale],
    html: emailLayout({
      preview: subjects[locale],
      children: content,
    }),
    text,
  }
}
