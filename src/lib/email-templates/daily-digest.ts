// Email Template - Daily Inquiry Digest (to admin)

import { emailLayout } from './layout'
import { siteConfig } from '@/lib/constants'

interface InquirySummary {
  id: string
  name: string
  phone: string
  email?: string
  yachtTitle?: string
  status: string
  createdAt: Date
}

interface DailyDigestProps {
  date: Date
  newInquiries: InquirySummary[]
  pendingCount: number
  contactedCount: number
  closedCount: number
  topYachts: { title: string; count: number }[]
}

export function dailyDigestEmail({
  date,
  newInquiries,
  pendingCount,
  contactedCount,
  closedCount,
  topYachts,
}: DailyDigestProps): { subject: string; html: string; text: string } {
  const formattedDate = date.toLocaleDateString('en-AE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Dubai',
  })
  
  const subject = `📊 Daily Digest: ${newInquiries.length} new inquiries - ${formattedDate}`
  
  const inquiryRows = newInquiries.map(inquiry => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <strong style="color: #ffffff;">${inquiry.name}</strong><br>
        <span style="color: rgba(255,255,255,0.6); font-size: 13px;">
          ${inquiry.phone}
          ${inquiry.email ? ` • ${inquiry.email}` : ''}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.8);">
        ${inquiry.yachtTitle || 'General Inquiry'}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <span style="display: inline-block; padding: 4px 8px; background: ${
          inquiry.status === 'NEW' ? 'rgba(201,162,77,0.2)' :
          inquiry.status === 'CONTACTED' ? 'rgba(59,130,246,0.2)' :
          'rgba(34,197,94,0.2)'
        }; color: ${
          inquiry.status === 'NEW' ? '#C9A24D' :
          inquiry.status === 'CONTACTED' ? '#3B82F6' :
          '#22C55E'
        }; font-size: 12px; border-radius: 4px;">
          ${inquiry.status}
        </span>
      </td>
    </tr>
  `).join('')
  
  const topYachtRows = topYachts.map(yacht => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #ffffff;">
        ${yacht.title}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #C9A24D; text-align: right;">
        ${yacht.count} inquiries
      </td>
    </tr>
  `).join('')
  
  const content = `
    <h1>Daily Inquiry Digest</h1>
    <p style="color: rgba(255,255,255,0.6);">${formattedDate}</p>
    
    <!-- Stats Cards -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td width="25%" style="padding: 4px;">
          <div style="background: rgba(201,162,77,0.1); padding: 16px; text-align: center; border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #C9A24D;">${newInquiries.length}</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;">New Today</div>
          </div>
        </td>
        <td width="25%" style="padding: 4px;">
          <div style="background: rgba(239,68,68,0.1); padding: 16px; text-align: center; border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #EF4444;">${pendingCount}</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;">Pending</div>
          </div>
        </td>
        <td width="25%" style="padding: 4px;">
          <div style="background: rgba(59,130,246,0.1); padding: 16px; text-align: center; border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #3B82F6;">${contactedCount}</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;">Contacted</div>
          </div>
        </td>
        <td width="25%" style="padding: 4px;">
          <div style="background: rgba(34,197,94,0.1); padding: 16px; text-align: center; border-radius: 8px;">
            <div style="font-size: 28px; font-weight: bold; color: #22C55E;">${closedCount}</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;">Closed</div>
          </div>
        </td>
      </tr>
    </table>
    
    ${newInquiries.length > 0 ? `
    <h2>Today's Inquiries</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
      <thead>
        <tr>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase;">Customer</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase;">Interest</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${inquiryRows}
      </tbody>
    </table>
    ` : `
    <div class="info-box">
      <p>No new inquiries received today.</p>
    </div>
    `}
    
    ${topYachts.length > 0 ? `
    <h2>Top Performing Yachts</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
      ${topYachtRows}
    </table>
    ` : ''}
    
    <p style="margin-top: 32px;">
      <a href="${siteConfig.url}/admin/inquiries" class="button">View All Inquiries</a>
    </p>
  `
  
  const text = `Daily Digest for ${formattedDate}: ${newInquiries.length} new inquiries, ${pendingCount} pending, ${contactedCount} contacted, ${closedCount} closed.`
  
  return {
    subject,
    html: emailLayout({
      preview: `${newInquiries.length} new inquiries today`,
      children: content,
    }),
    text,
  }
}
