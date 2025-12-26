// Email Template - Admin New Inquiry Alert

import { emailLayout } from './layout'
import { siteConfig } from '@/lib/constants'

interface AdminInquiryAlertProps {
  inquiryId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  yachtTitle?: string
  yachtId?: string
  message?: string
  source: string
  timestamp: Date
}

export function adminInquiryAlertEmail({
  inquiryId,
  customerName,
  customerPhone,
  customerEmail,
  yachtTitle,
  yachtId,
  message,
  source,
  timestamp,
}: AdminInquiryAlertProps): { subject: string; html: string; text: string } {
  const formattedDate = timestamp.toLocaleString('en-AE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dubai',
  })
  
  const subject = yachtTitle
    ? `🔔 New Inquiry: ${yachtTitle} - ${customerName}`
    : `🔔 New Inquiry from ${customerName}`
  
  const content = `
    <h1>New Inquiry Received</h1>
    
    <p>
      A new inquiry has been submitted on ${siteConfig.name}. Please respond within 24 hours.
    </p>
    
    <div class="info-box">
      <p><strong>Priority:</strong> High - New Lead</p>
    </div>
    
    <h2>Customer Details</h2>
    <table class="details-table">
      <tr>
        <td>Name</td>
        <td><strong>${customerName}</strong></td>
      </tr>
      <tr>
        <td>Phone</td>
        <td>
          <a href="tel:${customerPhone}">${customerPhone}</a>
          &nbsp;•&nbsp;
          <a href="https://wa.me/${customerPhone.replace(/\D/g, '')}">WhatsApp</a>
        </td>
      </tr>
      ${customerEmail ? `
      <tr>
        <td>Email</td>
        <td><a href="mailto:${customerEmail}">${customerEmail}</a></td>
      </tr>
      ` : ''}
      <tr>
        <td>Source</td>
        <td>${source}</td>
      </tr>
      <tr>
        <td>Received</td>
        <td>${formattedDate}</td>
      </tr>
    </table>
    
    ${yachtTitle ? `
    <h2>Yacht of Interest</h2>
    <table class="details-table">
      <tr>
        <td>Yacht</td>
        <td>
          <strong>${yachtTitle}</strong>
          ${yachtId ? `<br><a href="${siteConfig.url}/admin/yachts/${yachtId}">View in Admin</a>` : ''}
        </td>
      </tr>
    </table>
    ` : ''}
    
    ${message ? `
    <h2>Message</h2>
    <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 4px;">
      <p style="margin: 0; white-space: pre-wrap;">${message}</p>
    </div>
    ` : ''}
    
    <p style="margin-top: 32px;">
      <a href="${siteConfig.url}/admin/inquiries" class="button">View All Inquiries</a>
    </p>
    
    <p style="margin-top: 24px;">
      <strong>Quick Actions:</strong><br>
      <a href="tel:${customerPhone}">📞 Call Customer</a> &nbsp;•&nbsp;
      <a href="https://wa.me/${customerPhone.replace(/\D/g, '')}">💬 WhatsApp</a>
      ${customerEmail ? ` &nbsp;•&nbsp; <a href="mailto:${customerEmail}">✉️ Email</a>` : ''}
    </p>
  `
  
  const text = `New inquiry from ${customerName} (${customerPhone})${yachtTitle ? ` for ${yachtTitle}` : ''}. ${message || ''}`
  
  return {
    subject,
    html: emailLayout({
      preview: `New inquiry from ${customerName}`,
      children: content,
    }),
    text,
  }
}
