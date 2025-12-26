import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailStyles } from './components/EmailLayout';

interface InquiryItem {
  id: string;
  customerName: string;
  customerEmail: string;
  inquiryType: 'purchase' | 'charter' | 'general';
  yachtName?: string;
  createdAt: string;
  status: 'pending' | 'contacted' | 'closed';
}

interface DailyDigestEmailProps {
  // Date
  date: string;
  
  // Stats
  totalInquiries: number;
  newInquiries: number;
  pendingInquiries: number;
  
  // Inquiry list
  inquiries: InquiryItem[];
  
  // Optional stats
  pageViews?: number;
  topYachts?: Array<{ name: string; views: number }>;
  
  // Settings
  footerContent?: string;
  adminUrl?: string;
}

export const DailyDigestEmail: React.FC<DailyDigestEmailProps> = ({
  date,
  totalInquiries,
  newInquiries,
  pendingInquiries,
  inquiries,
  pageViews,
  topYachts,
  footerContent,
  adminUrl = 'https://bimoyacht.com/admin',
}) => {
  const previewText = `Daily Digest: ${newInquiries} new inquiries - ${date}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'contacted':
        return '#3b82f6';
      case 'closed':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getInquiryTypeEmoji = (type: string) => {
    switch (type) {
      case 'purchase':
        return '💰';
      case 'charter':
        return '⛵';
      default:
        return '💬';
    }
  };

  return (
    <EmailLayout preview={previewText} footerContent={footerContent}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text style={{ ...emailStyles.label, margin: 0 }}>DAILY DIGEST</Text>
        <Text style={{ ...emailStyles.heading, margin: '8px 0 0 0' }}>{date}</Text>
      </div>

      <Hr style={emailStyles.divider} />

      {/* Quick Stats */}
      <Section>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center', padding: '16px' }}>
                <Text
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: emailStyles.gold,
                    margin: 0,
                  }}
                >
                  {newInquiries}
                </Text>
                <Text style={{ ...emailStyles.label, margin: '4px 0 0 0' }}>
                  New Today
                </Text>
              </td>
              <td style={{ textAlign: 'center', padding: '16px', borderLeft: '1px solid #e5e7eb' }}>
                <Text
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: '#f59e0b',
                    margin: 0,
                  }}
                >
                  {pendingInquiries}
                </Text>
                <Text style={{ ...emailStyles.label, margin: '4px 0 0 0' }}>
                  Pending
                </Text>
              </td>
              <td style={{ textAlign: 'center', padding: '16px', borderLeft: '1px solid #e5e7eb' }}>
                <Text
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: emailStyles.navy,
                    margin: 0,
                  }}
                >
                  {totalInquiries}
                </Text>
                <Text style={{ ...emailStyles.label, margin: '4px 0 0 0' }}>
                  Total
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {pageViews && (
        <div
          style={{
            ...emailStyles.infoBox,
            textAlign: 'center',
            padding: '12px',
          }}
        >
          <Text style={{ margin: 0, fontSize: '14px' }}>
            📊 <strong>{pageViews.toLocaleString()}</strong> page views today
          </Text>
        </div>
      )}

      <Hr style={emailStyles.divider} />

      {/* Today's Inquiries */}
      <Section>
        <Text style={emailStyles.subheading}>
          📥 Today's Inquiries ({inquiries.length})
        </Text>

        {inquiries.length === 0 ? (
          <div style={{ ...emailStyles.infoBox, textAlign: 'center' }}>
            <Text style={{ ...emailStyles.paragraph, margin: 0 }}>
              No new inquiries today. Check back tomorrow!
            </Text>
          </div>
        ) : (
          inquiries.map((inquiry, index) => (
            <div
              key={inquiry.id}
              style={{
                ...emailStyles.infoBox,
                marginBottom: index < inquiries.length - 1 ? '12px' : 0,
              }}
            >
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ marginRight: '8px' }}>
                          {getInquiryTypeEmoji(inquiry.inquiryType)}
                        </span>
                        <Text style={{ ...emailStyles.value, margin: 0 }}>
                          {inquiry.customerName}
                        </Text>
                        <span
                          style={{
                            marginLeft: '8px',
                            backgroundColor: getStatusColor(inquiry.status),
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {inquiry.status}
                        </span>
                      </div>
                      
                      <Text style={{ ...emailStyles.paragraph, margin: '0 0 4px 0', fontSize: '13px' }}>
                        <Link href={`mailto:${inquiry.customerEmail}`} style={{ color: emailStyles.gold }}>
                          {inquiry.customerEmail}
                        </Link>
                      </Text>
                      
                      {inquiry.yachtName && (
                        <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
                          🛥️ {inquiry.yachtName}
                        </Text>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'top', textAlign: 'right', width: '80px' }}>
                      <Text style={{ ...emailStyles.label, margin: 0 }}>
                        {inquiry.createdAt}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        )}
      </Section>

      {/* Top Yachts */}
      {topYachts && topYachts.length > 0 && (
        <>
          <Hr style={emailStyles.divider} />
          
          <Section>
            <Text style={emailStyles.subheading}>🔥 Top Yachts Today</Text>
            
            <div style={emailStyles.infoBox}>
              {topYachts.map((yacht, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: index < topYachts.length - 1 ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  <Text style={{ ...emailStyles.value, margin: 0 }}>
                    {index + 1}. {yacht.name}
                  </Text>
                  <Text style={{ ...emailStyles.label, margin: 0 }}>
                    {yacht.views} views
                  </Text>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      <Hr style={emailStyles.divider} />

      {/* Pending Action Required */}
      {pendingInquiries > 0 && (
        <div style={emailStyles.highlightBox}>
          <Text style={{ margin: 0, fontWeight: 'bold', color: emailStyles.navy }}>
            ⚠️ Action Required: {pendingInquiries} pending {pendingInquiries === 1 ? 'inquiry needs' : 'inquiries need'} attention
          </Text>
        </div>
      )}

      {/* CTA */}
      <Section style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link href={`${adminUrl}/inquiries`} style={emailStyles.button}>
          Open Admin Dashboard
        </Link>
      </Section>

      <Hr style={emailStyles.divider} />

      {/* Quick Tips */}
      <Section>
        <Text style={{ ...emailStyles.paragraph, fontSize: '12px', color: '#6b7280' }}>
          💡 <strong>Pro Tip:</strong> Responding to inquiries within 1 hour 
          increases your chances of conversion by 7x. Use the WhatsApp 
          integration for instant communication.
        </Text>
      </Section>

      {/* Unsubscribe Notice */}
      <Text style={{ fontSize: '10px', color: '#9ca3af', marginTop: '24px', textAlign: 'center' }}>
        You're receiving this because you have daily digest enabled.{' '}
        <Link href={`${adminUrl}/settings`} style={{ color: '#9ca3af' }}>
          Manage email preferences
        </Link>
      </Text>
    </EmailLayout>
  );
};

export default DailyDigestEmail;
