// Email Service Configuration
// Uses Resend for transactional emails with React Email templates

import { Resend } from 'resend';
import { render } from '@react-email/components';
import { prisma } from './db';
import { InquiryAlertEmail } from '@/emails/InquiryAlertEmail';
import { InquiryConfirmationEmail } from '@/emails/InquiryConfirmationEmail';
import { ListingReceivedEmail } from '@/emails/ListingReceivedEmail';
import { DailyDigestEmail } from '@/emails/DailyDigestEmail';
import React from 'react';

// Initialize Resend client lazily to avoid build errors when API key is not set
let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// From address for all emails
const FROM_EMAIL = process.env.EMAIL_FROM || 'Bimo Yacht <notifications@bimoyacht.com>';
const ADMIN_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimoyacht.com';

// Types
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

import { getSettings } from '@/lib/settings';

// ... other imports

// Email subject translations
const emailSubjects = {
  en: {
    inquiryConfirmation: 'Thank you for your inquiry - Bimo Yacht',
    inquiryAlert: (type: string, name: string, yacht?: string) =>
      `🔔 New ${type} Inquiry from ${name}${yacht ? ` - ${yacht}` : ''}`,
    listingReceived: 'Your yacht listing has been received - Bimo Yacht',
    listingAlert: (yacht: string, owner: string) =>
      `🚢 New Yacht Listing: ${yacht} from ${owner}`,
    dailyDigest: (count: number, date: string) =>
      `📊 Daily Digest: ${count} inquiries - ${date}`,
  },
  ar: {
    inquiryConfirmation: 'شكراً لاستفسارك - بيمو لليخوت',
    inquiryAlert: (type: string, name: string, yacht?: string) =>
      `🔔 استفسار ${type} جديد من ${name}${yacht ? ` - ${yacht}` : ''}`,
    listingReceived: 'تم استلام طلب إدراج يختك - بيمو لليخوت',
    listingAlert: (yacht: string, owner: string) =>
      `🚢 إدراج يخت جديد: ${yacht} من ${owner}`,
    dailyDigest: (count: number, date: string) =>
      `📊 الملخص اليومي: ${count} استفسار - ${date}`,
  },
} as const;

type Locale = 'en' | 'ar';

// Get site settings
async function getEmailSettings() {
  return await getSettings();
}

// Admin email address for notifications
export function getAdminEmails(): string[] {
  const emails = process.env.ADMIN_EMAILS || '';
  return emails.split(',').map((e) => e.trim()).filter(Boolean);
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn('Email service not configured. RESEND_API_KEY is missing.');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      tags: options.tags,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email to multiple recipients
 */
export async function sendBulkEmail(
  recipients: string[],
  options: Omit<EmailOptions, 'to'>
): Promise<SendEmailResult[]> {
  const results = await Promise.all(
    recipients.map((to) => sendEmail({ ...options, to }))
  );
  return results;
}

// ============================================
// INQUIRY ALERT EMAIL (To Admin)
// ============================================
interface SendInquiryAlertParams {
  inquiryId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
  inquiryType: 'purchase' | 'charter' | 'general';
  yachtName?: string;
  yachtPrice?: string;
  yachtSlug?: string;
}

export async function sendInquiryAlertEmail(
  params: SendInquiryAlertParams
): Promise<SendEmailResult> {
  try {
    const settings = await getEmailSettings();

    // Check if email notifications are enabled
    if (settings.emailNotifyInquiry === false) {
      console.log('Inquiry alert emails are disabled');
      return { success: true, messageId: 'disabled' };
    }

    // Get admin email
    const adminEmail = settings.adminEmailAddress || process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('No admin email configured');
      return { success: false, error: 'No admin email configured' };
    }

    const emailHtml = await render(
      React.createElement(InquiryAlertEmail, {
        ...params,
        footerContent: settings.emailFooterContent,
        adminUrl: ADMIN_URL,
      })
    );

    const inquiryTypeLabel = {
      purchase: 'Purchase',
      charter: 'Charter',
      general: 'General',
    }[params.inquiryType];

    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🔔 New ${inquiryTypeLabel} Inquiry from ${params.customerName}${params.yachtName ? ` - ${params.yachtName}` : ''}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send inquiry alert email:', error);
      return { success: false, error: error.message };
    }

    console.log('Inquiry alert email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending inquiry alert email:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// INQUIRY CONFIRMATION EMAIL (To Customer)
// ============================================
interface SendInquiryConfirmationParams {
  customerEmail: string;
  customerName: string;
  inquiryType: 'purchase' | 'charter' | 'general';
  message: string;
  yachtName?: string;
  locale?: Locale;
}

export async function sendInquiryConfirmationEmail(
  params: SendInquiryConfirmationParams
): Promise<SendEmailResult> {
  try {
    const settings = await getEmailSettings();

    const emailHtml = await render(
      React.createElement(InquiryConfirmationEmail, {
        customerName: params.customerName,
        inquiryType: params.inquiryType,
        message: params.message,
        yachtName: params.yachtName,
        whatsappNumber: settings.whatsappNumber,
        phoneNumber: settings.phone,
        footerContent: settings.emailFooterContent,
      })
    );

    const locale = params.locale || 'en';
    const subjects = emailSubjects[locale];

    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: subjects.inquiryConfirmation,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log('Confirmation email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// LISTING RECEIVED EMAIL (To Yacht Owner)
// ============================================
interface SendListingReceivedParams {
  ownerName: string;
  ownerEmail: string;
  yachtName: string;
  yachtMake?: string;
  yachtModel?: string;
  yachtYear?: string;
  yachtLength?: string;
  askingPrice?: string;
  submissionId: string;
  additionalNotes?: string;
}

export async function sendListingReceivedEmail(
  params: SendListingReceivedParams
): Promise<SendEmailResult> {
  try {
    const settings = await getEmailSettings();

    // Check if listing emails are enabled
    if (settings.emailNotifyListing === false) {
      console.log('Listing received emails are disabled');
      return { success: true, messageId: 'disabled' };
    }

    const emailHtml = await render(
      React.createElement(ListingReceivedEmail, {
        ...params,
        whatsappNumber: settings.whatsappNumber,
        phoneNumber: settings.phone,
        footerContent: settings.emailFooterContent,
      })
    );

    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.ownerEmail,
      subject: `Your yacht listing has been received - Bimo Yacht`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send listing received email:', error);
      return { success: false, error: error.message };
    }

    console.log('Listing received email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending listing received email:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// ADMIN ALERT FOR NEW LISTING (To Admin)
// ============================================
interface SendListingAlertParams {
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  yachtName: string;
  yachtMake?: string;
  yachtModel?: string;
  askingPrice?: string;
  submissionId: string;
}

export async function sendListingAlertToAdmin(
  params: SendListingAlertParams
): Promise<SendEmailResult> {
  try {
    const settings = await getEmailSettings();

    const adminEmail = settings.adminEmailAddress || process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('No admin email configured');
      return { success: false, error: 'No admin email configured' };
    }

    // Using a simple HTML for admin listing alert
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #0a1628; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
            .header { background: #1a2d4a; padding: 24px; text-align: center; border-bottom: 3px solid #C9A962; }
            .header h1 { color: #C9A962; margin: 0; font-size: 24px; }
            .content { padding: 32px; }
            .highlight { background: #fffbeb; border: 1px solid #C9A962; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
            .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 16px 0; }
            .label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
            .value { color: #111827; font-size: 14px; margin-bottom: 16px; }
            .button { display: inline-block; background: #C9A962; color: #0a1628; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>BIMO YACHT</h1>
            </div>
            <div class="content">
              <div class="highlight">
                <strong>🚢 New Yacht Listing Submission</strong>
              </div>
              
              <div class="info-box">
                <div class="label">Owner Name</div>
                <div class="value">${params.ownerName}</div>
                
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${params.ownerEmail}">${params.ownerEmail}</a></div>
                
                ${params.ownerPhone
        ? `
                <div class="label">Phone</div>
                <div class="value"><a href="tel:${params.ownerPhone}">${params.ownerPhone}</a></div>
                `
        : ''
      }
                
                <div class="label">Yacht Name</div>
                <div class="value">${params.yachtName}</div>
                
                ${params.yachtMake
        ? `
                <div class="label">Make</div>
                <div class="value">${params.yachtMake}</div>
                `
        : ''
      }
                
                ${params.yachtModel
        ? `
                <div class="label">Model</div>
                <div class="value">${params.yachtModel}</div>
                `
        : ''
      }
                
                ${params.askingPrice
        ? `
                <div class="label">Asking Price</div>
                <div class="value" style="color: #C9A962; font-weight: bold;">${params.askingPrice}</div>
                `
        : ''
      }
              </div>
              
              <p style="text-align: center; margin-top: 24px;">
                <a href="${ADMIN_URL}/admin" class="button">View in Admin Dashboard</a>
              </p>
              
              <p style="font-size: 10px; color: #9ca3af; margin-top: 24px; text-align: center;">
                Reference: ${params.submissionId}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🚢 New Yacht Listing: ${params.yachtName} from ${params.ownerName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send listing alert email:', error);
      return { success: false, error: error.message };
    }

    console.log('Listing alert email sent to admin:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending listing alert email:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// DAILY DIGEST EMAIL
// ============================================
export async function sendDailyDigestEmail(): Promise<SendEmailResult> {
  try {
    const settings = await getEmailSettings();

    // Check if daily digest is enabled
    if (settings.emailDailyDigest === false) {
      console.log('Daily digest emails are disabled');
      return { success: true, messageId: 'disabled' };
    }

    const adminEmail = settings.adminEmailAddress || process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error('No admin email configured');
      return { success: false, error: 'No admin email configured' };
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's inquiries
    const todaysInquiries = await prisma.inquiry.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get yacht names for inquiries that have yachtId
    const yachtIds = todaysInquiries
      .filter((i) => i.yachtId)
      .map((i) => i.yachtId as string);

    const yachts = yachtIds.length > 0
      ? await prisma.yacht.findMany({
        where: { id: { in: yachtIds } },
        select: { id: true, title: true },
      })
      : [];

    const yachtMap = new Map(yachts.map((y) => [y.id, y.title]));

    // Get all pending inquiries (NEW status)
    const pendingInquiries = await prisma.inquiry.count({
      where: {
        status: 'NEW',
      },
    });

    // Get total inquiries
    const totalInquiries = await prisma.inquiry.count();

    // Format date
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Map InquiryStatus enum to email template status
    const mapStatus = (status: string): 'pending' | 'contacted' | 'closed' => {
      switch (status) {
        case 'NEW':
        case 'QUALIFIED':
          return 'pending';
        case 'CONTACTED':
          return 'contacted';
        case 'CLOSED':
          return 'closed';
        default:
          return 'pending';
      }
    };

    // Format inquiries for email
    const formattedInquiries = todaysInquiries.map((inquiry) => ({
      id: inquiry.id,
      customerName: inquiry.name,
      customerEmail: inquiry.email || '',
      inquiryType: 'general' as const,
      yachtName: inquiry.yachtId ? yachtMap.get(inquiry.yachtId) : undefined,
      createdAt: new Date(inquiry.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: mapStatus(inquiry.status),
    }));

    const emailHtml = await render(
      React.createElement(DailyDigestEmail, {
        date: dateFormatter.format(today),
        totalInquiries,
        newInquiries: todaysInquiries.length,
        pendingInquiries,
        inquiries: formattedInquiries,
        footerContent: settings.emailFooterContent,
        adminUrl: ADMIN_URL,
      })
    );

    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `📊 Daily Digest: ${todaysInquiries.length} inquiries - ${dateFormatter.format(today)}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send daily digest email:', error);
      return { success: false, error: error.message };
    }

    console.log('Daily digest email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending daily digest email:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// TEST EMAIL
// ============================================
export async function sendTestEmail(to: string): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured. Please set RESEND_API_KEY.' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Test Email from Bimo Yacht',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #C9A962;">✅ Email Configuration Working!</h1>
          <p>This is a test email from Bimo Yacht.</p>
          <p>If you received this, your email configuration is set up correctly.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #6b7280; font-size: 12px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send test email:', error);
      return { success: false, error: error.message };
    }

    console.log('Test email sent:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, error: String(error) };
  }
}

export { getResendClient as resend };

