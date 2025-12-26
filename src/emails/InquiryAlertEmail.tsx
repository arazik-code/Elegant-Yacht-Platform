import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailStyles } from './components/EmailLayout';

interface InquiryAlertEmailProps {
  // Inquiry details
  inquiryId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  message: string;
  inquiryType: 'purchase' | 'charter' | 'general';
  
  // Yacht details (if applicable)
  yachtName?: string;
  yachtPrice?: string;
  yachtSlug?: string;
  
  // Settings
  footerContent?: string;
  adminUrl?: string;
}

export const InquiryAlertEmail: React.FC<InquiryAlertEmailProps> = ({
  inquiryId,
  customerName,
  customerEmail,
  customerPhone,
  message,
  inquiryType,
  yachtName,
  yachtPrice,
  yachtSlug,
  footerContent,
  adminUrl = 'https://bimoyacht.com/admin',
}) => {
  const inquiryTypeLabel = {
    purchase: 'Purchase Inquiry',
    charter: 'Charter Inquiry',
    general: 'General Inquiry',
  }[inquiryType];

  const previewText = `New ${inquiryTypeLabel} from ${customerName}${yachtName ? ` for ${yachtName}` : ''}`;

  return (
    <EmailLayout preview={previewText} footerContent={footerContent}>
      {/* Alert Badge */}
      <div style={emailStyles.highlightBox}>
        <Text style={{ margin: 0, fontWeight: 'bold', color: emailStyles.navy }}>
          🔔 New {inquiryTypeLabel}
        </Text>
      </div>

      {/* Main Heading */}
      <Text style={emailStyles.heading}>
        You have a new inquiry{yachtName ? ` for ${yachtName}` : ''}
      </Text>

      <Text style={emailStyles.paragraph}>
        A potential client has submitted an inquiry through your website. Here are the details:
      </Text>

      {/* Customer Details */}
      <Section style={emailStyles.infoBox}>
        <Text style={{ ...emailStyles.subheading, marginTop: 0 }}>
          Customer Information
        </Text>
        
        <Text style={emailStyles.label}>Name</Text>
        <Text style={emailStyles.value}>{customerName}</Text>
        
        <Text style={emailStyles.label}>Email</Text>
        <Text style={emailStyles.value}>
          <Link href={`mailto:${customerEmail}`} style={{ color: emailStyles.gold }}>
            {customerEmail}
          </Link>
        </Text>
        
        {customerPhone && (
          <>
            <Text style={emailStyles.label}>Phone</Text>
            <Text style={emailStyles.value}>
              <Link href={`tel:${customerPhone}`} style={{ color: emailStyles.gold }}>
                {customerPhone}
              </Link>
            </Text>
          </>
        )}
        
        <Text style={emailStyles.label}>Inquiry Type</Text>
        <Text style={emailStyles.value}>{inquiryTypeLabel}</Text>
      </Section>

      {/* Yacht Details (if applicable) */}
      {yachtName && (
        <Section style={emailStyles.infoBox}>
          <Text style={{ ...emailStyles.subheading, marginTop: 0 }}>
            Yacht of Interest
          </Text>
          
          <Text style={emailStyles.label}>Yacht</Text>
          <Text style={emailStyles.value}>{yachtName}</Text>
          
          {yachtPrice && (
            <>
              <Text style={emailStyles.label}>Listed Price</Text>
              <Text style={emailStyles.value}>{yachtPrice}</Text>
            </>
          )}
          
          {yachtSlug && (
            <Link
              href={`https://bimoyacht.com/yachts/${yachtSlug}`}
              style={{ ...emailStyles.button, marginTop: '8px' }}
            >
              View Yacht Listing →
            </Link>
          )}
        </Section>
      )}

      {/* Message */}
      <Section>
        <Text style={emailStyles.subheading}>Message</Text>
        <div
          style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            borderLeft: `4px solid ${emailStyles.gold}`,
          }}
        >
          <Text style={{ ...emailStyles.paragraph, margin: 0, fontStyle: 'italic' }}>
            "{message}"
          </Text>
        </div>
      </Section>

      <Hr style={emailStyles.divider} />

      {/* Action Buttons */}
      <Section style={{ textAlign: 'center' }}>
        <Link
          href={`${adminUrl}/inquiries`}
          style={emailStyles.button}
        >
          View in Admin Dashboard
        </Link>
        
        <Text style={{ ...emailStyles.paragraph, marginTop: '16px' }}>
          <Link
            href={`mailto:${customerEmail}?subject=Re: Your Inquiry at Bimo Yacht`}
            style={{ color: emailStyles.gold }}
          >
            Reply directly via email →
          </Link>
        </Text>
      </Section>

      <Hr style={emailStyles.divider} />

      {/* Quick Response Tips */}
      <Section>
        <Text style={{ ...emailStyles.paragraph, fontSize: '12px', color: '#6b7280' }}>
          💡 <strong>Tip:</strong> Responding within 30 minutes significantly increases conversion rates. 
          Consider calling the customer if a phone number is provided.
        </Text>
      </Section>

      {/* Inquiry Reference */}
      <Text style={{ fontSize: '10px', color: '#9ca3af', marginTop: '24px' }}>
        Inquiry ID: {inquiryId}
      </Text>
    </EmailLayout>
  );
};

export default InquiryAlertEmail;
