// Email Template - Base Layout
// Luxury branded email template

import { siteConfig } from '@/lib/constants'

interface EmailLayoutProps {
  preview?: string
  children: string
  footerText?: string
}

export function emailLayout({ preview, children, footerText }: EmailLayoutProps): string {
  const year = new Date().getFullYear()
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  ${preview ? `<meta name="x-apple-disable-message-reformatting">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->` : ''}
  <title>${siteConfig.name}</title>
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    
    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background-color: #0B0B0B;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0E1A2B;
    }
    
    /* Header */
    .header {
      padding: 32px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #C9A24D;
      text-decoration: none;
      letter-spacing: 2px;
    }
    
    /* Content */
    .content {
      padding: 40px 24px;
    }
    
    .content h1 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    
    .content h2 {
      color: #C9A24D;
      font-size: 18px;
      font-weight: 600;
      margin: 24px 0 12px 0;
    }
    
    .content p {
      color: rgba(255,255,255,0.8);
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    
    .content a {
      color: #C9A24D;
      text-decoration: none;
    }
    
    .content a:hover {
      text-decoration: underline;
    }
    
    /* Button */
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #C9A24D;
      color: #0B0B0B !important;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 0;
      margin: 16px 0;
    }
    
    .button:hover {
      background-color: #D2B150;
    }
    
    /* Info Box */
    .info-box {
      background-color: rgba(255,255,255,0.05);
      border-left: 3px solid #C9A24D;
      padding: 16px 20px;
      margin: 24px 0;
    }
    
    .info-box p {
      margin: 0;
      font-size: 14px;
    }
    
    .info-box strong {
      color: #ffffff;
    }
    
    /* Details Table */
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }
    
    .details-table td {
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      vertical-align: top;
    }
    
    .details-table td:first-child {
      color: rgba(255,255,255,0.6);
      width: 120px;
      font-size: 14px;
    }
    
    .details-table td:last-child {
      color: #ffffff;
      font-size: 14px;
    }
    
    /* Footer */
    .footer {
      padding: 24px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.1);
      background-color: #0B0B0B;
    }
    
    .footer p {
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      margin: 0 0 8px 0;
    }
    
    .footer a {
      color: #C9A24D;
      text-decoration: none;
    }
    
    .social-links {
      margin: 16px 0;
    }
    
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: rgba(255,255,255,0.5);
      text-decoration: none;
    }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .content {
        padding: 32px 16px;
      }
    }
  </style>
</head>
<body>
  ${preview ? `<div style="display:none;font-size:1px;color:#0B0B0B;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preview}</div>` : ''}
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0B0B0B;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0">
          <!-- Header -->
          <tr>
            <td class="header">
              <a href="${siteConfig.url}" class="logo">BIMO YACHT</a>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content">
              ${children}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer">
              <div class="social-links">
                <a href="${siteConfig.instagram}">Instagram</a>
                <a href="${siteConfig.snapchat}">Snapchat</a>
                <a href="${siteConfig.tiktok}">TikTok</a>
              </div>
              <p>${footerText || `© ${year} ${siteConfig.name}. All rights reserved.`}</p>
              <p>${siteConfig.address}</p>
              <p>
                <a href="${siteConfig.url}">Visit our website</a> • 
                <a href="tel:${siteConfig.phone}">${siteConfig.phone}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
