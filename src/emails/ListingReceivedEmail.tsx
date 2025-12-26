import { Hr, Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailStyles } from './components/EmailLayout';

interface ListingReceivedEmailProps {
  // Owner details
  ownerName: string;
  ownerEmail: string;
  
  // Yacht details
  yachtName: string;
  yachtMake?: string;
  yachtModel?: string;
  yachtYear?: string;
  yachtLength?: string;
  askingPrice?: string;
  
  // Submission details
  submissionId: string;
  additionalNotes?: string;
  
  // Contact details
  whatsappNumber?: string;
  phoneNumber?: string;
  
  // Settings
  footerContent?: string;
}

export const ListingReceivedEmail: React.FC<ListingReceivedEmailProps> = ({
  ownerName,
  yachtName,
  yachtMake,
  yachtModel,
  yachtYear,
  yachtLength,
  askingPrice,
  submissionId,
  additionalNotes,
  whatsappNumber = '+971XXXXXXXXX',
  phoneNumber = '+971XXXXXXXXX',
  footerContent,
}) => {
  const firstName = ownerName.split(' ')[0];
  const previewText = `Your yacht listing for ${yachtName} has been received - Bimo Yacht`;

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
          ✓ Listing Received
        </div>
      </div>

      {/* Main Heading */}
      <Text style={{ ...emailStyles.heading, textAlign: 'center' }}>
        Thank You, {firstName}!
      </Text>

      <Text style={{ ...emailStyles.paragraph, textAlign: 'center' }}>
        We've received your listing submission for <strong>{yachtName}</strong>. 
        Our team is excited to help you sell your yacht.
      </Text>

      <Hr style={emailStyles.divider} />

      {/* Yacht Summary */}
      <Section style={emailStyles.infoBox}>
        <Text style={{ ...emailStyles.subheading, marginTop: 0, textAlign: 'center' }}>
          🛥️ Your Yacht Details
        </Text>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                <Text style={{ ...emailStyles.label, margin: 0 }}>Yacht Name</Text>
              </td>
              <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                <Text style={{ ...emailStyles.value, margin: 0 }}>{yachtName}</Text>
              </td>
            </tr>
            
            {yachtMake && (
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <Text style={{ ...emailStyles.label, margin: 0 }}>Make</Text>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                  <Text style={{ ...emailStyles.value, margin: 0 }}>{yachtMake}</Text>
                </td>
              </tr>
            )}
            
            {yachtModel && (
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <Text style={{ ...emailStyles.label, margin: 0 }}>Model</Text>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                  <Text style={{ ...emailStyles.value, margin: 0 }}>{yachtModel}</Text>
                </td>
              </tr>
            )}
            
            {yachtYear && (
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <Text style={{ ...emailStyles.label, margin: 0 }}>Year</Text>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                  <Text style={{ ...emailStyles.value, margin: 0 }}>{yachtYear}</Text>
                </td>
              </tr>
            )}
            
            {yachtLength && (
              <tr>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <Text style={{ ...emailStyles.label, margin: 0 }}>Length</Text>
                </td>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>
                  <Text style={{ ...emailStyles.value, margin: 0 }}>{yachtLength}</Text>
                </td>
              </tr>
            )}
            
            {askingPrice && (
              <tr>
                <td style={{ padding: '8px 0' }}>
                  <Text style={{ ...emailStyles.label, margin: 0 }}>Asking Price</Text>
                </td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>
                  <Text style={{ ...emailStyles.value, margin: 0, color: emailStyles.gold, fontWeight: 'bold' }}>
                    {askingPrice}
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {additionalNotes && (
          <>
            <Text style={{ ...emailStyles.label, marginTop: '16px' }}>Additional Notes</Text>
            <Text style={{ ...emailStyles.paragraph, fontStyle: 'italic', margin: 0 }}>
              "{additionalNotes}"
            </Text>
          </>
        )}
      </Section>

      <Hr style={emailStyles.divider} />

      {/* What Happens Next */}
      <Section>
        <Text style={emailStyles.subheading}>What Happens Next?</Text>

        <div style={emailStyles.highlightBox}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', width: '40px' }}>
                  <Text style={{ fontSize: '24px', margin: 0 }}>📋</Text>
                </td>
                <td>
                  <Text style={{ ...emailStyles.value, margin: '0 0 4px 0' }}>
                    Step 1: Review
                  </Text>
                  <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
                    Our team will review your yacht details within 24 hours.
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={emailStyles.highlightBox}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', width: '40px' }}>
                  <Text style={{ fontSize: '24px', margin: 0 }}>📞</Text>
                </td>
                <td>
                  <Text style={{ ...emailStyles.value, margin: '0 0 4px 0' }}>
                    Step 2: Consultation
                  </Text>
                  <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
                    A dedicated broker will contact you to discuss your listing.
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={emailStyles.highlightBox}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', width: '40px' }}>
                  <Text style={{ fontSize: '24px', margin: 0 }}>📸</Text>
                </td>
                <td>
                  <Text style={{ ...emailStyles.value, margin: '0 0 4px 0' }}>
                    Step 3: Professional Photography
                  </Text>
                  <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
                    We'll arrange professional photography and create your listing.
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={emailStyles.highlightBox}>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', width: '40px' }}>
                  <Text style={{ fontSize: '24px', margin: 0 }}>🌐</Text>
                </td>
                <td>
                  <Text style={{ ...emailStyles.value, margin: '0 0 4px 0' }}>
                    Step 4: Go Live
                  </Text>
                  <Text style={{ ...emailStyles.paragraph, margin: 0, fontSize: '13px' }}>
                    Your yacht will be listed on our platform and marketed globally.
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Hr style={emailStyles.divider} />

      {/* Why Bimo Yacht */}
      <Section style={emailStyles.infoBox}>
        <Text style={{ ...emailStyles.subheading, marginTop: 0, textAlign: 'center' }}>
          Why Sell With Bimo Yacht?
        </Text>
        
        <table style={{ width: '100%', marginTop: '16px' }}>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                <Text style={{ fontSize: '24px', margin: '0 0 8px 0' }}>🌍</Text>
                <Text style={{ ...emailStyles.value, margin: 0, fontSize: '12px' }}>
                  Global Reach
                </Text>
              </td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                <Text style={{ fontSize: '24px', margin: '0 0 8px 0' }}>💎</Text>
                <Text style={{ ...emailStyles.value, margin: 0, fontSize: '12px' }}>
                  Premium Service
                </Text>
              </td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                <Text style={{ fontSize: '24px', margin: '0 0 8px 0' }}>🤝</Text>
                <Text style={{ ...emailStyles.value, margin: 0, fontSize: '12px' }}>
                  Expert Brokers
                </Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Hr style={emailStyles.divider} />

      {/* Contact Options */}
      <Section style={{ textAlign: 'center' }}>
        <Text style={emailStyles.subheading}>Have Questions?</Text>
        <Text style={emailStyles.paragraph}>
          Our team is here to help you through the entire selling process.
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

      {/* Reference Number */}
      <Text style={{ fontSize: '10px', color: '#9ca3af', marginTop: '24px', textAlign: 'center' }}>
        Reference Number: {submissionId}
      </Text>
    </EmailLayout>
  );
};

export default ListingReceivedEmail;
