import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailStyles } from './components/EmailLayout';

interface InquiryConfirmationEmailProps {
  // Customer details
  customerName: string;
  
  // Inquiry details
  inquiryType: 'purchase' | 'charter' | 'general';
  message: string;
  
  // Yacht details (if applicable)
  yachtName?: string;
  yachtImage?: string;
  
  // Contact details
  whatsappNumber?: string;
  phoneNumber?: string;
  
  // Settings
  footerContent?: string;
}

export const InquiryConfirmationEmail: React.FC<InquiryConfirmationEmailProps> = ({
  customerName,
  inquiryType,
  message,
  yachtName,
  whatsappNumber = '+971XXXXXXXXX',
  phoneNumber = '+971XXXXXXXXX',
  footerContent,
}) => {
  const inquiryTypeLabel = {
    purchase: 'purchase inquiry',
    charter: 'charter inquiry',
    general: 'inquiry',
  }[inquiryType];

  const firstName = customerName.split(' ')[0];
  const previewText = `Thank you for your inquiry, ${firstName}! We'll be in touch shortly.`;

  return (
    <EmailLayout preview={previewText} footerContent={footerContent}>
      {/* Success Badge */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ✓ Inquiry Received
        </div>
      </div>

      {/* Main Heading */}
      <Text style={{ ...emailStyles.heading, textAlign: 'center' }}>
        Thank You, {firstName}!
      </Text>

      <Text style={{ ...emailStyles.paragraph, textAlign: 'center' }}>
        We've received your {inquiryTypeLabel}
        {yachtName ? ` regarding <strong>${yachtName}</strong>` : ''} and our team is already reviewing it.
      </Text>

      <Hr style={emailStyles.divider} />

      {/* What to Expect */}
      <Section>
        <Text style={emailStyles.subheading}>What Happens Next?</Text>
        
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: emailStyles.gold,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: emailStyles.navy,
              fontWeight: 'bold',
              marginRight: '16px',
              flexShrink: 0,
            }}
          >
            1
          </div>
          <div>
            <Text style={{ ...emailStyles.value, margin: '0 0 4px 0' }}>
              Review Your Request
            </Text>
            <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
              Our yacht specialists are reviewing your inquiry right now.
            </Text>
          </div>
        </div>

        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: emailStyles.gold,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: emailStyles.navy,
              fontWeight: 'bold',
              marginRight: '16px',
              flexShrink: 0,
            }}
          >
            2
          </div>
          <div>
            <Text style={{ ...emailStyles.value, margin: '0 0 4px 0' }}>
              Personal Contact
            </Text>
            <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
              A dedicated broker will reach out within 24 hours.
            </Text>
          </div>
        </div>

        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: emailStyles.gold,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: emailStyles.navy,
              fontWeight: 'bold',
              marginRight: '16px',
              flexShrink: 0,
            }}
          >
            3
          </div>
          <div>
            <Text style={{ ...emailStyles.value, margin: '0 0 4px 0' }}>
              Tailored Experience
            </Text>
            <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
              We'll provide personalized options matching your requirements.
            </Text>
          </div>
        </div>
      </Section>

      <Hr style={emailStyles.divider} />

      {/* Your Inquiry Summary */}
      <Section style={emailStyles.infoBox}>
        <Text style={{ ...emailStyles.subheading, marginTop: 0 }}>
          Your Inquiry
        </Text>
        
        {yachtName && (
          <>
            <Text style={emailStyles.label}>Yacht of Interest</Text>
            <Text style={emailStyles.value}>{yachtName}</Text>
          </>
        )}
        
        <Text style={emailStyles.label}>Message</Text>
        <Text style={{ ...emailStyles.paragraph, fontStyle: 'italic', margin: 0 }}>
          "{message.length > 200 ? message.substring(0, 200) + '...' : message}"
        </Text>
      </Section>

      <Hr style={emailStyles.divider} />

      {/* Contact Options */}
      <Section style={{ textAlign: 'center' }}>
        <Text style={emailStyles.subheading}>Need Immediate Assistance?</Text>
        <Text style={emailStyles.paragraph}>
          Our team is available 7 days a week to help you find your perfect yacht.
        </Text>

        <div style={{ marginTop: '24px' }}>
          <Link
            href={`https://wa.me/${whatsappNumber?.replace(/[^0-9]/g, '')}`}
            style={{
              ...emailStyles.button,
              backgroundColor: '#25D366',
              color: 'white',
              marginRight: '12px',
            }}
          >
            💬 WhatsApp Us
          </Link>
          <Link
            href={`tel:${phoneNumber}`}
            style={emailStyles.button}
          >
            📞 Call Now
          </Link>
        </div>
      </Section>

      <Hr style={emailStyles.divider} />

      {/* Browse More */}
      <Section style={{ textAlign: 'center' }}>
        <Text style={{ ...emailStyles.paragraph, color: '#6b7280' }}>
          While you wait, explore more of our exclusive yacht collection:
        </Text>
        <Link
          href="https://bimoyacht.com/yachts"
          style={{ color: emailStyles.gold, fontWeight: 'bold' }}
        >
          Browse All Yachts →
        </Link>
      </Section>
    </EmailLayout>
  );
};

export default InquiryConfirmationEmail;
