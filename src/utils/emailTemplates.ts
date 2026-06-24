/**
 * Standardized Modern Email Template Generator
 * PT. Foresyndo Global Indonesia - Project Controls & Contract Engineering
 */

export interface EmailRowItem {
  label: string;
  value: string;
  isBold?: boolean;
}

export interface EmailSection {
  title: string;
  themeColor: 'blue' | 'emerald' | 'amber' | 'purple' | 'pink' | 'slate';
  description?: string;
  rows?: EmailRowItem[];
  customHTML?: string;
}

interface EmailTemplatePayload {
  recipientName: string;
  title: string;
  subtitle?: string;
  greeting?: string;
  sections: EmailSection[];
  actionLink?: string;
  actionText?: string;
  footerStatusText?: string;
}

export const generateStandardEmailHTML = ({
  recipientName,
  title,
  subtitle = 'Sistem Pengawasan Proyek Terintegrasi',
  greeting,
  sections,
  actionLink = 'https://foresyndoglobalindonesia.my.id',
  actionText = 'Akses Portal SPPI Utama',
  footerStatusText = 'SHA-256 Ledger Digital Verified'
}: EmailTemplatePayload): string => {
  
  // Theme styling mapping for left accents and section headers
  const themeMap = {
    blue: { border: '#1e3a8a', text: '#1e3a8a', bg: '#f8fafc' },
    emerald: { border: '#10b981', text: '#0f766e', bg: '#f0fdf4' },
    amber: { border: '#f59e0b', text: '#b45309', bg: '#fffbeb' },
    purple: { border: '#8b5cf6', text: '#6d28d9', bg: '#faf5ff' },
    pink: { border: '#ec4899', text: '#be185d', bg: '#fdf2f8' },
    slate: { border: '#475569', text: '#334155', bg: '#f8fafc' }
  };

  const sectionsHTML = sections.map((sec) => {
    const theme = themeMap[sec.themeColor || 'blue'];
    
    // Render key-value table if standard data rows is defined
    let standardDataHTML = '';
    if (sec.rows && sec.rows.length > 0) {
      const rowElements = sec.rows.map((r, i) => `
        <tr style="border-bottom: 1px solid #f1f5f9; ${i === sec.rows!.length - 1 ? 'border-bottom: none;' : ''}">
          <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 500;">${r.label}</td>
          <td style="padding: 10px 0; text-align: right; font-weight: ${r.isBold ? 'bold' : 'normal'}; color: #0f172a; font-size: 13px;">${r.value}</td>
        </tr>
      `).join('');
      
      standardDataHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tbody>
            ${rowElements}
          </tbody>
        </table>
      `;
    }

    return `
      <!-- Dynamic Modern Section Card -->
      <div style="background-color: #ffffff; border-radius: 12px; padding: 22px; margin-bottom: 24px; border: 1px solid #e2e8f0; border-left: 5px solid ${theme.border}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: ${theme.text}; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; font-family: sans-serif;">
          ${sec.title}
        </h3>
        
        ${sec.description ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: #475569; line-height: 1.5; font-style: normal;">${sec.description}</p>` : ''}
        ${standardDataHTML}
        ${sec.customHTML || ''}
      </div>
    `;
  }).join('');

  const currentYear = new Date().getFullYear();
  const defaultGreeting = greeting || `Melalui surat elektronik ini kami sampaikan tinjauan laporan kemajuan digital resmi dari portal SPPI untuk Proyek Pembangunan Hotel &amp; Kost Eksklusif Foresyndo 2 Kertajati:`;

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 40px 15px; margin: 0; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #f8fafc; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.06), 0 10px 15px -8px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
        
        <!-- Corporate Modern Accent Header with FGI Brand -->
        <div style="background-color: #1e3a8a; padding: 32px 28px; border-bottom: 4px solid #ea580c; text-align: left; position: relative;">
          <p style="margin: 0 0 6px 0; color: #f97316; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: bold; font-family: monospace;">
            PT. Foresyndo Global Indonesia
          </p>
          <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.2;">
            ${title}
          </h1>
          ${subtitle ? `<p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; font-weight: 500; font-family: sans-serif;">${subtitle}</p>` : ''}
        </div>

        <!-- Corporate Summary Body Area -->
        <div style="padding: 28px 24px;">
          <p style="font-size: 14.5px; line-height: 1.6; color: #1e293b; margin-top: 0; margin-bottom: 24px;">
            Yth. <strong>Bapak/Ibu ${recipientName}</strong>,<br/><br/>
            ${defaultGreeting}
          </p>

          <!-- Render All Structured Dynamic Section Cards -->
          ${sectionsHTML}

          <!-- View Action Link Button Callout -->
          <div style="text-align: center; margin: 35px 0 20px 0;">
            <a href="${actionLink}" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 13px 28px; font-size: 13.5px; font-weight: bold; border-radius: 10px; box-shadow: 0 5px 12px -1px rgba(234, 88, 12, 0.25); font-family: sans-serif; transition: all 150ms ease-in-out;">
              ${actionText}
            </a>
          </div>

          <!-- Bottom Security Clearance Indicators -->
          <p style="font-size: 12px; line-height: 1.5; color: #64748b; text-align: center; margin-top: 30px;">
            Halaman audit ini dilindungi tanda tangan kriptografis resmi FGI.<br/>
            Keamanan Validasi: <strong>${footerStatusText}</strong>
          </p>
        </div>

        <!-- Classic Industrial Corporate Footer Area -->
        <div style="background-color: #f1f5f9; padding: 20px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          <p style="margin: 0; font-weight: 600; color: #64748b;">&copy; ${currentYear} PT. Foresyndo Global Indonesia. Hak Cipta Dilindungi.</p>
          <p style="margin: 5px 0 0 0;">Unit Procurement, Purchasing, and Project Controls - Kertajati Integrated Digital Hub</p>
        </div>
        
      </div>
    </body>
    </html>
  `;
};
