// WhatsApp Business Automation Service
// Message templates, deep links, click tracking, and Business API readiness

import { siteConfig } from '@/lib/constants'

// ===========================================
// TYPES
// ===========================================

export type WhatsAppContext =
  | 'yacht_inquiry'
  | 'charter_inquiry'
  | 'sell_yacht'
  | 'general_inquiry'
  | 'admin_reply'

export type AdminReplyTemplate =
  | 'availability'
  | 'price_negotiable'
  | 'charter_confirm'
  | 'follow_up'
  | 'thank_you'
  | 'schedule_viewing'
  | 'request_callback'
  | 'documents_needed'
  | 'offer_accepted'
  | 'custom'

export interface MessageTemplateData {
  yachtTitle?: string
  yachtPrice?: string
  customerName?: string
  inquiryId?: string
  charterDate?: string
  charterDuration?: string
  price?: string
  date?: string
  time?: string
}

// ===========================================
// MESSAGE TEMPLATES - Customer Initiated
// ===========================================

const messageTemplates: Record<WhatsAppContext, (data: MessageTemplateData) => { en: string; ar: string }> = {
  yacht_inquiry: (data) => ({
    en: `Hello! I'm interested in ${data.yachtTitle || 'your yachts'}${data.yachtPrice ? ` (${data.yachtPrice})` : ''}. Please provide more information about availability and specifications.`,
    ar: `مرحباً! أنا مهتم بـ ${data.yachtTitle || 'يخوتكم'}${data.yachtPrice ? ` (${data.yachtPrice})` : ''}. يرجى تقديم المزيد من المعلومات حول التوفر والمواصفات.`,
  }),

  charter_inquiry: (data) => ({
    en: `Hello! I'd like to charter ${data.yachtTitle || 'a yacht'}${data.charterDate ? ` on ${data.charterDate}` : ''}${data.charterDuration ? ` for ${data.charterDuration}` : ''}. Please let me know about availability and pricing.`,
    ar: `مرحباً! أود استئجار ${data.yachtTitle || 'يخت'}${data.charterDate ? ` في ${data.charterDate}` : ''}${data.charterDuration ? ` لمدة ${data.charterDuration}` : ''}. يرجى إعلامي بالتوفر والأسعار.`,
  }),

  sell_yacht: () => ({
    en: `Hello! I'm interested in selling my yacht through Bimo Yacht. Can we discuss the listing process and valuation?`,
    ar: `مرحباً! أنا مهتم ببيع يختي من خلال بيمو يخت. هل يمكننا مناقشة عملية الإدراج والتقييم؟`,
  }),

  general_inquiry: () => ({
    en: `Hello! I have a question about your yacht services. I'd like to learn more about what you offer.`,
    ar: `مرحباً! لدي سؤال حول خدمات اليخوت الخاصة بكم. أود معرفة المزيد عما تقدمونه.`,
  }),

  admin_reply: (data) => ({
    en: `Hello ${data.customerName || ''}! Thank you for your inquiry${data.yachtTitle ? ` about ${data.yachtTitle}` : ''}. ${data.inquiryId ? `[Ref: ${data.inquiryId}]` : ''}`,
    ar: `مرحباً ${data.customerName || ''}! شكراً لاستفسارك${data.yachtTitle ? ` حول ${data.yachtTitle}` : ''}. ${data.inquiryId ? `[المرجع: ${data.inquiryId}]` : ''}`,
  }),
}

// ===========================================
// ADMIN QUICK REPLY TEMPLATES
// ===========================================

export const adminQuickReplies: Record<AdminReplyTemplate, {
  label: { en: string; ar: string }
  message: (data: MessageTemplateData) => { en: string; ar: string }
  icon: string
  color: string
}> = {
  availability: {
    label: { en: 'Confirm Availability', ar: 'تأكيد التوفر' },
    message: (data) => ({
      en: `Hi ${data.customerName || 'there'}! Great news - ${data.yachtTitle || 'the yacht'} is currently available. Would you like to schedule a viewing or discuss further details?`,
      ar: `مرحباً ${data.customerName || ''}! أخبار سارة - ${data.yachtTitle || 'اليخت'} متوفر حالياً. هل تود جدولة معاينة أو مناقشة مزيد من التفاصيل؟`,
    }),
    icon: '✅',
    color: 'green',
  },

  price_negotiable: {
    label: { en: 'Price Negotiable', ar: 'السعر قابل للتفاوض' },
    message: (data) => ({
      en: `Hi ${data.customerName || 'there'}! Thank you for your interest in ${data.yachtTitle || 'our yacht'}. The price is negotiable and we're open to discussing offers. Would you like to make an offer?`,
      ar: `مرحباً ${data.customerName || ''}! شكراً لاهتمامك بـ ${data.yachtTitle || 'يختنا'}. السعر قابل للتفاوض ونحن منفتحون لمناقشة العروض. هل تود تقديم عرض؟`,
    }),
    icon: '💰',
    color: 'yellow',
  },

  charter_confirm: {
    label: { en: 'Charter Details', ar: 'تفاصيل الإيجار' },
    message: (data) => ({
      en: `Hi ${data.customerName || 'there'}! Great choice! ${data.yachtTitle || 'The yacht'} is available for charter${data.date ? ` on ${data.date}` : ''}. I'll send you the charter agreement and full details shortly. Is there anything specific you'd like to know?`,
      ar: `مرحباً ${data.customerName || ''}! خيار رائع! ${data.yachtTitle || 'اليخت'} متاح للإيجار${data.date ? ` في ${data.date}` : ''}. سأرسل لك اتفاقية الإيجار والتفاصيل الكاملة قريباً. هل هناك شيء محدد تود معرفته؟`,
    }),
    icon: '⛵',
    color: 'blue',
  },

  follow_up: {
    label: { en: 'Follow Up', ar: 'متابعة' },
    message: (data) => ({
      en: `Hi ${data.customerName || 'there'}! I'm following up on your inquiry about ${data.yachtTitle || 'our yachts'}. Have you had a chance to consider our offer? I'd be happy to answer any questions you might have.`,
      ar: `مرحباً ${data.customerName || ''}! أتابع استفسارك حول ${data.yachtTitle || 'يخوتنا'}. هل أتيحت لك الفرصة للنظر في عرضنا؟ سأكون سعيداً للإجابة على أي أسئلة لديك.`,
    }),
    icon: '📞',
    color: 'purple',
  },

  thank_you: {
    label: { en: 'Thank You', ar: 'شكراً' },
    message: (data) => ({
      en: `Dear ${data.customerName || 'valued customer'}, thank you for choosing Bimo Yacht! We truly appreciate your trust in us. If you need anything else, don't hesitate to reach out. We look forward to serving you again! ⚓`,
      ar: `عزيزي ${data.customerName || 'العميل الكريم'}، شكراً لاختيارك بيمو يخت! نقدر حقاً ثقتك بنا. إذا احتجت أي شيء آخر، لا تتردد في التواصل معنا. نتطلع لخدمتك مرة أخرى! ⚓`,
    }),
    icon: '🙏',
    color: 'gold',
  },

  schedule_viewing: {
    label: { en: 'Schedule Viewing', ar: 'جدولة معاينة' },
    message: (data) => ({
      en: `Hi ${data.customerName || 'there'}! I'd love to arrange a viewing of ${data.yachtTitle || 'the yacht'} for you. When would be a convenient time? We're available ${data.date ? `on ${data.date}` : 'throughout the week'}.`,
      ar: `مرحباً ${data.customerName || ''}! يسعدني ترتيب معاينة ${data.yachtTitle || 'اليخت'} لك. متى يناسبك الوقت؟ نحن متاحون ${data.date ? `في ${data.date}` : 'طوال الأسبوع'}.`,
    }),
    icon: '📅',
    color: 'teal',
  },

  request_callback: {
    label: { en: 'Request Callback', ar: 'طلب معاودة الاتصال' },
    message: (data) => ({
      en: `Hi ${data.customerName || 'there'}! Would you prefer a phone call to discuss ${data.yachtTitle || 'your yacht requirements'} in detail? Please let me know a convenient time and I'll call you.`,
      ar: `مرحباً ${data.customerName || ''}! هل تفضل مكالمة هاتفية لمناقشة ${data.yachtTitle || 'متطلبات اليخت الخاصة بك'} بالتفصيل؟ يرجى إعلامي بالوقت المناسب وسأتصل بك.`,
    }),
    icon: '📱',
    color: 'orange',
  },

  documents_needed: {
    label: { en: 'Documents Needed', ar: 'المستندات المطلوبة' },
    message: (data) => ({
      en: `Hi ${data.customerName || 'there'}! To proceed with your ${data.yachtTitle ? `inquiry about ${data.yachtTitle}` : 'request'}, we'll need a few documents: valid ID/passport and proof of address. Once we have these, we can move forward quickly!`,
      ar: `مرحباً ${data.customerName || ''}! للمضي قدماً في ${data.yachtTitle ? `استفسارك حول ${data.yachtTitle}` : 'طلبك'}، سنحتاج بعض المستندات: هوية/جواز سفر ساري وإثبات عنوان. بمجرد استلامها، يمكننا المتابعة بسرعة!`,
    }),
    icon: '📄',
    color: 'gray',
  },

  offer_accepted: {
    label: { en: 'Offer Accepted', ar: 'تم قبول العرض' },
    message: (data) => ({
      en: `Congratulations ${data.customerName || ''}! 🎉 Your offer for ${data.yachtTitle || 'the yacht'}${data.price ? ` at ${data.price}` : ''} has been accepted! Let's discuss the next steps. When can we meet to finalize the details?`,
      ar: `مبروك ${data.customerName || ''}! 🎉 تم قبول عرضك لـ ${data.yachtTitle || 'اليخت'}${data.price ? ` بسعر ${data.price}` : ''}! دعنا نناقش الخطوات التالية. متى يمكننا اللقاء لإتمام التفاصيل؟`,
    }),
    icon: '🎉',
    color: 'green',
  },

  custom: {
    label: { en: 'Custom Message', ar: 'رسالة مخصصة' },
    message: () => ({
      en: '',
      ar: '',
    }),
    icon: '✏️',
    color: 'blue',
  },
}

// ===========================================
// LINK GENERATION
// ===========================================

/**
 * Generate WhatsApp deep link
 */
export function generateWhatsAppLink(
  context: WhatsAppContext,
  data: MessageTemplateData = {},
  locale: 'en' | 'ar' = 'en',
  phone?: string
): string {
  const template = messageTemplates[context](data)
  const message = template[locale]
  const targetPhone = phone || siteConfig.whatsapp

  // Clean phone number
  const cleanPhone = targetPhone.replace(/\D/g, '')

  // Build URL
  const baseUrl = 'https://api.whatsapp.com/send'
  const encodedMessage = encodeURIComponent(message)

  return `${baseUrl}?phone=${cleanPhone}&text=${encodedMessage}`
}

/**
 * Generate admin reply WhatsApp link with template
 */
export function generateAdminReplyLink(
  phone: string,
  templateId: AdminReplyTemplate,
  data: MessageTemplateData = {},
  locale: 'en' | 'ar' = 'en'
): string {
  const template = adminQuickReplies[templateId]
  const message = template.message(data)[locale]

  const cleanPhone = formatPhoneForWhatsApp(phone)

  const baseUrl = 'https://api.whatsapp.com/send'
  const encodedMessage = encodeURIComponent(message)

  return `${baseUrl}?phone=${cleanPhone}&text=${encodedMessage}`
}

/**
 * Generate WhatsApp click tracking URL
 * This goes through our API for analytics before redirecting
 */
export function generateTrackedWhatsAppLink(
  context: WhatsAppContext,
  data: MessageTemplateData & { inquiryId?: string; yachtId?: string } = {},
  locale: 'en' | 'ar' = 'en'
): string {
  const params = new URLSearchParams({
    context,
    locale,
    ...(data.yachtTitle && { yacht: data.yachtTitle }),
    ...(data.yachtId && { yachtId: data.yachtId }),
    ...(data.inquiryId && { inquiryId: data.inquiryId }),
  })

  return `/api/whatsapp/redirect?${params.toString()}`
}

/**
 * Generate tracked admin reply link
 */
export function generateTrackedAdminReplyLink(
  inquiryId: string,
  templateId: AdminReplyTemplate,
  phone: string,
  data?: MessageTemplateData,
  locale: 'en' | 'ar' = 'en'
): string {
  const params = new URLSearchParams({
    context: 'admin_reply',
    templateId,
    inquiryId,
    phone,
    locale,
    ...(data?.customerName && { customerName: data.customerName }),
    ...(data?.yachtTitle && { yacht: data.yachtTitle }),
  })

  return `/api/whatsapp/redirect?${params.toString()}`
}

// ===========================================
// PHONE UTILITIES
// ===========================================

/**
 * Format phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '')

  // Handle UAE numbers
  if (cleaned.startsWith('0')) {
    cleaned = '971' + cleaned.substring(1)
  } else if (!cleaned.startsWith('971') && cleaned.length === 9) {
    cleaned = '971' + cleaned
  }

  return cleaned
}

/**
 * Validate phone number for WhatsApp
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  // Basic validation: at least 9 digits
  return cleaned.length >= 9 && cleaned.length <= 15
}

// ===========================================
// CLICK TRACKING
// ===========================================

export interface WhatsAppClickEvent {
  context: WhatsAppContext
  yachtId?: string
  yachtTitle?: string
  inquiryId?: string
  templateId?: AdminReplyTemplate
  locale: string
  timestamp: Date
  userAgent?: string
  referrer?: string
  ipAddress?: string
  phone?: string
  customerName?: string
}

export function createWhatsAppClickEvent(
  params: URLSearchParams,
  headers: Headers
): WhatsAppClickEvent {
  return {
    context: (params.get('context') as WhatsAppContext) || 'general_inquiry',
    yachtId: params.get('yachtId') || undefined,
    yachtTitle: params.get('yacht') || undefined,
    inquiryId: params.get('inquiryId') || undefined,
    templateId: (params.get('templateId') as AdminReplyTemplate) || undefined,
    locale: params.get('locale') || 'en',
    timestamp: new Date(),
    userAgent: headers.get('user-agent') || undefined,
    referrer: headers.get('referer') || undefined,
    phone: params.get('phone') || undefined,
    customerName: params.get('customerName') || undefined,
  }
}

// ===========================================
// WHATSAPP BUSINESS API READY STRUCTURE
// ===========================================

/**
 * WhatsApp Business API message types (for future integration)
 * These match the official WhatsApp Business API message structure
 */
export interface WhatsAppBusinessMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'template' | 'text' | 'interactive'
  template?: {
    name: string
    language: { code: string }
    components?: Array<{
      type: 'body' | 'header' | 'button'
      parameters: Array<{ type: 'text'; text: string }>
    }>
  }
  text?: {
    body: string
    preview_url?: boolean
  }
  interactive?: {
    type: 'button' | 'list'
    body: { text: string }
    action: {
      buttons?: Array<{
        type: 'reply'
        reply: { id: string; title: string }
      }>
    }
  }
}

/**
 * Build WhatsApp Business API message (for future use when API is configured)
 */
export function buildBusinessApiMessage(
  to: string,
  templateName: string,
  languageCode: string = 'en',
  parameters: string[] = []
): WhatsAppBusinessMessage {
  return {
    messaging_product: 'whatsapp',
    to: formatPhoneForWhatsApp(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: parameters.length > 0 ? [{
        type: 'body',
        parameters: parameters.map(text => ({ type: 'text', text })),
      }] : undefined,
    },
  }
}

/**
 * Placeholder for WhatsApp Business API send function
 * This will be implemented when WhatsApp Business API is configured
 */
export async function sendWhatsAppBusinessMessage(
  _message: WhatsAppBusinessMessage
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Check if Business API is configured
  const apiToken = process.env.WHATSAPP_BUSINESS_API_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!apiToken || !phoneNumberId) {
    console.log('WhatsApp Business API not configured - using deep links instead')
    return {
      success: false,
      error: 'WhatsApp Business API not configured'
    }
  }

  // Future implementation:
  // const response = await fetch(
  //   `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${apiToken}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(message),
  //   }
  // )
  // return await response.json()

  return { success: false, error: 'Not implemented' }
}

// ===========================================
// ANALYTICS HELPERS
// ===========================================

/**
 * WhatsApp analytics summary interface
 */
export interface WhatsAppAnalyticsSummary {
  totalClicks: number
  clicksByContext: Record<string, number>
  clicksByDay: Array<{ date: string; count: number }>
  topYachts: Array<{ yachtId: string; title: string; count: number }>
}
