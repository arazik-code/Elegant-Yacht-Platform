// Email Template - Sell Yacht Confirmation (to owner)

import { emailLayout } from './layout'
import { siteConfig } from '@/lib/constants'

interface SellYachtConfirmationProps {
  ownerName: string
  yachtBrand: string
  yachtModel: string
  yachtYear: number
  yachtLength: number
  askingPrice?: number
  condition: string
  locale?: 'en' | 'ar'
}

export function sellYachtConfirmationEmail({
  ownerName,
  yachtBrand,
  yachtModel,
  yachtYear,
  yachtLength,
  askingPrice,
  condition,
  locale = 'en',
}: SellYachtConfirmationProps): { subject: string; html: string; text: string } {
  const isArabic = locale === 'ar'
  
  const subjects = {
    en: `We received your ${yachtYear} ${yachtBrand} ${yachtModel} listing request`,
    ar: `استلمنا طلب إدراج يختك ${yachtYear} ${yachtBrand} ${yachtModel}`,
  }
  
  const conditionLabels = {
    EXCELLENT: isArabic ? 'ممتازة' : 'Excellent',
    GOOD: isArabic ? 'جيدة' : 'Good',
    FAIR: isArabic ? 'مقبولة' : 'Fair',
  }
  
  const content = isArabic ? `
    <h1 style="text-align: right;">عزيزي ${ownerName}،</h1>
    
    <p style="text-align: right;">
      شكراً لاختيارك بيمو يخت لبيع يختك. لقد استلمنا طلب الإدراج الخاص بك وسيراجع فريق التقييم لدينا التفاصيل قريباً.
    </p>
    
    <h2 style="text-align: right;">تفاصيل اليخت المقدم</h2>
    <table class="details-table" style="text-align: right;">
      <tr>
        <td>العلامة التجارية</td>
        <td><strong>${yachtBrand}</strong></td>
      </tr>
      <tr>
        <td>الموديل</td>
        <td>${yachtModel}</td>
      </tr>
      <tr>
        <td>السنة</td>
        <td>${yachtYear}</td>
      </tr>
      <tr>
        <td>الطول</td>
        <td>${yachtLength} قدم</td>
      </tr>
      <tr>
        <td>الحالة</td>
        <td>${conditionLabels[condition as keyof typeof conditionLabels] || condition}</td>
      </tr>
      ${askingPrice ? `
      <tr>
        <td>السعر المطلوب</td>
        <td>AED ${askingPrice.toLocaleString()}</td>
      </tr>
      ` : ''}
    </table>
    
    <div class="info-box" style="text-align: right;">
      <p><strong>الخطوات التالية:</strong></p>
      <p>١. سيتواصل معك خبير التقييم لدينا خلال 48 ساعة</p>
      <p>٢. سنجدول معاينة لليخت إذا لزم الأمر</p>
      <p>٣. ستتلقى تقييماً شاملاً للسوق</p>
      <p>٤. بمجرد الموافقة، سنبدأ بتسويق يختك</p>
    </div>
    
    <p style="text-align: right;">
      مع أطيب التحيات،<br>
      <strong>فريق بيمو يخت</strong>
    </p>
  ` : `
    <h1>Dear ${ownerName},</h1>
    
    <p>
      Thank you for choosing Bimo Yacht to sell your yacht. We have received your listing request and our valuation team will review the details shortly.
    </p>
    
    <h2>Submitted Yacht Details</h2>
    <table class="details-table">
      <tr>
        <td>Brand</td>
        <td><strong>${yachtBrand}</strong></td>
      </tr>
      <tr>
        <td>Model</td>
        <td>${yachtModel}</td>
      </tr>
      <tr>
        <td>Year</td>
        <td>${yachtYear}</td>
      </tr>
      <tr>
        <td>Length</td>
        <td>${yachtLength} ft</td>
      </tr>
      <tr>
        <td>Condition</td>
        <td>${conditionLabels[condition as keyof typeof conditionLabels] || condition}</td>
      </tr>
      ${askingPrice ? `
      <tr>
        <td>Asking Price</td>
        <td>AED ${askingPrice.toLocaleString()}</td>
      </tr>
      ` : ''}
    </table>
    
    <div class="info-box">
      <p><strong>What happens next:</strong></p>
      <p>1. Our valuation expert will contact you within 48 hours</p>
      <p>2. We'll schedule an inspection if needed</p>
      <p>3. You'll receive a comprehensive market valuation</p>
      <p>4. Once approved, we'll begin marketing your yacht</p>
    </div>
    
    <p>
      Best regards,<br>
      <strong>Bimo Yacht Team</strong>
    </p>
  `
  
  const text = isArabic
    ? `عزيزي ${ownerName}، شكراً لتقديم يختك ${yachtBrand} ${yachtModel} للبيع. سيتواصل معك فريقنا قريباً.`
    : `Dear ${ownerName}, Thank you for submitting your ${yachtBrand} ${yachtModel} for sale. Our team will contact you shortly.`
  
  return {
    subject: subjects[locale],
    html: emailLayout({
      preview: subjects[locale],
      children: content,
    }),
    text,
  }
}
