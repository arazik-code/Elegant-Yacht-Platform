import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  footerContent?: string;
}

// Brand colors
const colors = {
  gold: '#C9A962',
  goldLight: '#D4B978',
  navy: '#0a1628',
  navyLight: '#1a2d4a',
  white: '#FFFFFF',
  gray: '#9ca3af',
  grayLight: '#e5e7eb',
};

const main = {
  backgroundColor: colors.navy,
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: colors.navyLight,
  padding: '32px 40px',
  textAlign: 'center' as const,
  borderBottom: `3px solid ${colors.gold}`,
};

const logoText = {
  color: colors.gold,
  fontSize: '28px',
  fontWeight: 'bold' as const,
  margin: '0',
  letterSpacing: '2px',
};

const tagline = {
  color: colors.gray,
  fontSize: '12px',
  margin: '8px 0 0 0',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
};

const content = {
  backgroundColor: colors.white,
  padding: '40px',
};

const footer = {
  backgroundColor: colors.navyLight,
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderTop: `1px solid ${colors.gold}`,
};

const footerText = {
  color: colors.gray,
  fontSize: '12px',
  margin: '0',
  lineHeight: '20px',
};

const socialLinks = {
  margin: '16px 0 0 0',
};

const socialLink = {
  color: colors.gold,
  textDecoration: 'none',
  fontSize: '12px',
  margin: '0 8px',
};

export const EmailLayout: React.FC<EmailLayoutProps> = ({
  preview,
  children,
  footerContent = '© Bimo Yacht - Premium Yacht Brokerage in Dubai',
}) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>BIMO YACHT</Text>
            <Text style={tagline}>Premium Yacht Brokerage</Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>{footerContent}</Text>
            <div style={socialLinks}>
              <a href="https://instagram.com/bimoyacht" style={socialLink}>
                Instagram
              </a>
              <span style={{ color: colors.gray }}>|</span>
              <a href="https://wa.me/971XXXXXXXXX" style={socialLink}>
                WhatsApp
              </a>
              <span style={{ color: colors.gray }}>|</span>
              <a href="mailto:info@bimoyacht.com" style={socialLink}>
                Email
              </a>
            </div>
            <Text style={{ ...footerText, marginTop: '16px', fontSize: '10px' }}>
              Dubai Marina, Dubai, UAE
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Shared styles for use in templates
export const emailStyles = {
  heading: {
    color: '#0a1628',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    margin: '0 0 24px 0',
    lineHeight: '32px',
  },
  subheading: {
    color: '#0a1628',
    fontSize: '18px',
    fontWeight: '600' as const,
    margin: '24px 0 16px 0',
  },
  paragraph: {
    color: '#374151',
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  label: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '0 0 4px 0',
  },
  value: {
    color: '#111827',
    fontSize: '14px',
    margin: '0 0 16px 0',
    fontWeight: '500' as const,
  },
  divider: {
    borderTop: '1px solid #e5e7eb',
    margin: '24px 0',
  },
  button: {
    backgroundColor: '#C9A962',
    color: '#0a1628',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
    fontSize: '14px',
    display: 'inline-block',
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    margin: '16px 0',
  },
  highlightBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #C9A962',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
  },
  gold: '#C9A962',
  navy: '#0a1628',
};

export default EmailLayout;
