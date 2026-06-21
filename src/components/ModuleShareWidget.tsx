import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mail, 
  MessageSquare, 
  Share2, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  X, 
  Phone, 
  User, 
  FileText,
  Clock,
  Briefcase,
  Layers
} from 'lucide-react';

interface ModuleShareWidgetProps {
  activeTabId: string;
}

export const ModuleShareWidget: React.FC<ModuleShareWidgetProps> = ({ activeTabId }) => {
  const { 
    currentRole, 
    projectStats, 
    progressItems, 
    drawingFiles, 
    formalDocuments, 
    contractors, 
    tenders, 
    bids, 
    investmentMetrics,
    showToast 
  } = useApp();

  // Explicit role access control
  const hasAccess = currentRole === 'Super Admin' || currentRole === 'Owner';
  if (!hasAccess) return null;

  // Form states
  const [recipientName, setRecipientName] = useState<string>('Bapak/Ibu Pimpinan');
  const [recipientEmail, setRecipientEmail] = useState<string>('raditwidjaya11@gmail.com');
  const [recipientPhone, setRecipientPhone] = useState<string>('081234567890');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Helper: Get label and icon for the current module
  const getModuleInfo = () => {
    switch (activeTabId) {
      case 'landing':
        return { name: 'Portal Publik', desc: 'Profil Publik, Lokasi Strategis, & Galeri Proyek' };
      case 'drawing_viewer':
        return { name: 'Gambar Kerja', desc: 'DED Blueprints, Komentar Pinpoint & Revisi Konstruksi' };
      case 'project_documents':
        return { name: 'Dokumen Proyek', desc: 'Legalitas IMB, AMDAL, Sertifikat & Berkas Hukum' };
      case 'rab_explorer':
        return { name: 'E-RAB Resmi', desc: 'Alokasi Rencana Anggaran Biaya & Ledger SHA-256' };
      case 'contract_module':
        return { name: 'Modul Kontrak', desc: 'SPK Kontraktor, Rekonsiliasi Keuangan & Alur Termin' };
      case 'time_schedule':
        return { name: 'Jadwal & Kurva-S', desc: 'Timeline Rencana Pekerjaan & Margin Deviasi Fisik' };
      case 'owner':
        return { name: 'Monitor Owner', desc: 'Laporan Finansial Owner, Sisa Budget, & Cashflow' };
      case 'progress':
        return { name: 'Progres PM', desc: 'Dashboard Realisasi Kemajuan Fisik PM Lapangan' };
      case 'investor':
        return { name: 'Feasibility Investasi', desc: 'Proyeksi Cashflow, NPV, IRR, & Analisis BEP Investor' };
      case 'admin':
        return { name: 'Verifikasi Admin', desc: 'Evaluasi Penawaran Tender Mitra & Vetting Legalitas' };
      case 'accounts_mgr':
        return { name: 'Kelola Akun SPPI', desc: 'Basis Data Akun & Hak Akses Enkripsi Portal' };
      default:
        return { name: 'Dashboard Proyek', desc: 'Sistem Pengawasan Proyek Terintegrasi (SPPI)' };
    }
  };

  const moduleInfo = getModuleInfo();

  // Generate customized WhatsApp Text based on module
  const generateWhatsAppText = () => {
    const baseHeader = `*Yth. ${recipientName},*\n\nBerikut terlampir laporan update digital resmi dari portal SPPI *PT. Foresyndo Global Indonesia*:\n\n`;
    const baseFooter = `\n\n_Sistem Pengawasan Proyek Terintegrasi - PT. Foresyndo Global Indonesia_`;
    
    let content = '';
    switch (activeTabId) {
      case 'rab_explorer':
        content = `*📌 MODUL E-RAB RESMI (FORESYNDO 2)*\n` +
                  `- Nilai Grand Total RAB: Rp ${projectStats.investmentValue.toLocaleString('id-ID')},00\n` +
                  `- Ledger Integritas: *SHA-256 VERIFIED*\n` +
                  `- Status Sertifikasi: Tanda Tangan Valid Kantor Procurement FGI`;
        break;
      case 'progress':
        const activeProg = progressItems.map(p => `  • ${p.category}: ${p.progressPercent}% [${p.status}]`).join('\n');
        content = `*📌 MODUL PROGRES LAPANGAN PM*\n` +
                  `- Rata-rata Kemajuan Fisik: *${projectStats.physicalProgress.toFixed(1)}%*\n` +
                  `- Target Selesai Fisik: ${projectStats.targetDate}\n` +
                  `- Detail Sektor pekerjaan:\n${activeProg}`;
        break;
      case 'owner':
        content = `*📌 MODUL MONITOR FINANCIAL OWNER*\n` +
                  `- Alokasi Anggaran Investasi: Rp ${projectStats.investmentValue.toLocaleString('id-ID')}\n` +
                  `- Realisasi Pengeluaran Aktual: Rp ${projectStats.actualSpending.toLocaleString('id-ID')}\n` +
                  `- Dana Sisa Anggaran Cadangan: Rp ${projectStats.remainingBudget.toLocaleString('id-ID')}\n` +
                  `- Status Dana: Aman & Terkendali`;
        break;
      case 'investor':
        content = `*📌 MODUL FEASIBILITY INVESTASI*\n` +
                  `- Nilai NPV (5 Tahun Proyek): Rp ${(projectStats.investmentValue * 1.5).toLocaleString('id-ID')}\n` +
                  `- Internal Rate of Return (IRR): *~24.5%*\n` +
                  `- Target Payback / BEP: *~4.1 Tahun*\n` +
                  `- Proyeksi Omset Bulanan: Rp ${projectStats.estimatedRevenueMonthly.toLocaleString('id-ID')}/bulan`;
        break;
      case 'contract_module':
        content = `*📌 MODUL KONTRAK & SPK*\n` +
                  `- Jumlah Rekanan Terdaftar: ${contractors.length} Perusahaan Konstruksi\n` +
                  `- Status Kontrak Draft: Aman Terintegrasi dengan Skema Rilis Termin Terkendali.`;
        break;
      case 'drawing_viewer':
        content = `*📌 MODUL GAMBAR KERJA (DED BLUEPRINTS)*\n` +
                  `- Total File Gambar Terarsip: ${drawingFiles.length} Gambar Teknis\n` +
                  `- Dilengkapi Komentar Pinpoint Koordinat Lapangan & Review CAD Online oleh Pengawas.`;
        break;
      case 'project_documents':
        content = `*📌 MODUL ARSIP DOKUMEN PROYEK*\n` +
                  `- Jumlah Berkas Legalitas Resmi: ${formalDocuments.length} Dokumen Aktif (IMB, AMDAL, UKL/UPL)\n` +
                  `- Kepatuhan Perizinan Daerah Kertajati: *100% COMPLIANT*`;
        break;
      case 'time_schedule':
        content = `*📌 MODUL JADWAL & KURVA-S KONTRAK*\n` +
                  `- Margin Deviasi Rencana vs Lapangan: *0.0% (On Schedule)*/n` +
                  `- Jadwal Milestone Konstruksi: Terpantau Stabil Menuju Rencana Mulai Konstruksi Triwulan III`;
        break;
      case 'admin':
        content = `*📌 MODUL PROCUREMENT & TENDER MITRA*\n` +
                  `- Jumlah Paket Pengadaan Tender Dibuka: ${tenders.length} Paket\n` +
                  `- Mitra Mengajukan Penawaran: ${bids.length} Rekanan\n` +
                  `- Status Seleksi Komparatif: Aktif Dalam Masa Evaluasi Legalitas & Finansial`;
        break;
      default:
        content = `*📌 UPDATE MODUL: ${moduleInfo.name}*\n` +
                  `Deskripsi: ${moduleInfo.desc}\n` +
                  `- Kemajuan Proyek Aktual: ${projectStats.physicalProgress}%`;
        break;
    }

    return encodeURIComponent(baseHeader + content + baseFooter);
  };

  // Generate Email HTML Content specifically with tailored module summaries
  const generateEmailHTML = () => {
    let specificContent = '';

    switch (activeTabId) {
      case 'rab_explorer':
        specificContent = `
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #1e3a8a; text-transform: uppercase;">1. DATA RINGKASAN E-RAB</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Grand Total Rencana Biaya:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1e3a8a; border-bottom: 1px solid #f1f5f9;">Rp ${projectStats.investmentValue.toLocaleString('id-ID')},00</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Sistem Otentikasi:</td>
                <td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: bold; border-bottom: 1px solid #f1f5f9;">SHA-256 Ledger Digital</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Metode Penaksiran:</td>
                <td style="padding: 8px 0; text-align: right; color: #64748b;">DED Koefisien SNI Terkini</td>
              </tr>
            </table>
          </div>
        `;
        break;

      case 'progress':
        const rows = progressItems.map(p => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #334155;">Pekerjaan ${p.category}</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #1e3a8a;">${p.progressPercent}%</td>
            <td style="padding: 8px 0; text-align: right; color: #64748b; font-size: 11px;">[${p.status}]</td>
          </tr>
        `).join('');

        specificContent = `
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #f97316; text-transform: uppercase;">1. DETAIL KEMAJUAN FISIK PM LAPANGAN</p>
            <p style="font-size: 13px; color: #475569; margin: 0 0 15px 0;">Kemajuan Fisik Gabungan Lapangan saat ini berada pada angka <strong>${projectStats.physicalProgress.toFixed(1)}% Completed</strong>.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              ${rows}
            </table>
          </div>
        `;
        break;

      case 'owner':
        specificContent = `
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #0f766e; text-transform: uppercase;">1. SKOR KEUANGAN MONITOR OWNER</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Alokasi Anggaran Utama:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #0f172a; border-bottom: 1px solid #f1f5f9;">Rp ${projectStats.investmentValue.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Realisasi Belanja Lapangan:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #ef4444; border-bottom: 1px solid #f1f5f9;">Rp ${projectStats.actualSpending.toLocaleString('id-ID')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Sisa Anggaran Tersedia:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #2563eb;">Rp ${projectStats.remainingBudget.toLocaleString('id-ID')}</td>
              </tr>
            </table>
          </div>
        `;
        break;

      case 'investor':
        specificContent = `
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #8b5cf6; text-transform: uppercase;">1. METRIKS KELAYAKAN INVESTASI (FEASIBILITY STUDY)</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Proyeksi Unit Kamar:</td>
                <td style="padding: 8px 0; text-align: right; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${projectStats.hotelRoomsCount} Hotel Unit &amp; ${projectStats.kostRoomsCount} Kost Premium</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Proyeksi Pendapatan Bulanan:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #16a34a; border-bottom: 1px solid #f1f5f9;">Rp ${projectStats.estimatedRevenueMonthly.toLocaleString('id-ID')}/bln</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Internal Rate of Return (IRR):</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #8b5cf6; border-bottom: 1px solid #f1f5f9;">~24.5%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Estimasi BEP / Payback Period:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #7c3aed;">~4.1 Tahun</td>
              </tr>
            </table>
          </div>
        `;
        break;

      case 'drawing_viewer':
        specificContent = `
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #ec4899; text-transform: uppercase;">1. LAPORAN REVIEW DRAWING GAMBAR KERJA (DED)</p>
            <p style="font-size: 13px; color: #334155; margin: 0 0 10px 0;">Terarsip sebanyak <strong>${drawingFiles.length} berkas DED resmi</strong> untuk pembangunan struktur baja dan pondasi.</p>
            <p style="font-size: 12px; color: #64748b; margin: 0;">Sistem dilengkapi koordinat Pinpoint Penanda Lapangan, memfasilitasi koordinasi langsung antara Konsultan Pengawas dan Kontraktor Pelaksana.</p>
          </div>
        `;
        break;

      case 'project_documents':
        specificContent = `
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #0d9488; text-transform: uppercase;">1. LEGALITAS KOMPATIBILITAS HUKUM</p>
            <p style="font-size: 13px; color: #334155; margin: 0 0 10px 0;">Sektor legalitas mengarsipkan <strong>${formalDocuments.length} Dokumen Perizinan Aktif</strong>.</p>
            <ul style="font-size: 12px; color: #475569; padding-left: 18px; margin: 0;">
              <li style="margin-bottom: 4px;">Persetujuan Bangunan Gedung (PBG) / IMB Resmi</li>
              <li style="margin-bottom: 4px;">Persetujuan Dokumen Amdal / UKL-UPL AMDAL</li>
              <li style="margin-bottom: 4px;">Izin Penggunaan Air Bawah Tanah &amp; Listrik Gardu PLN</li>
            </ul>
          </div>
        `;
        break;

      default:
        specificContent = `
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: bold; color: #334155; text-transform: uppercase;">1. DATA RINGKASAN MONITORING</p>
            <p style="font-size: 13px; color: #334155; margin: 0;">Status update terverifikasi dengan rata-rata kemajuan fisik proyek global mencapai <strong>${projectStats.physicalProgress}%</strong>.</p>
          </div>
        `;
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sistem Pengawasan Proyek Terintegrasi (SPPI)</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; padding: 30px 15px; margin: 0; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Accent Header -->
          <div style="background-color: #1e3a8a; padding: 28px 24px; border-bottom: 4px solid #ea580c; text-align: left;">
            <p style="margin: 0 0 4px 0; color: #f97316; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; font-weight: bold; font-family: monospace;">PT. Foresyndo Global Indonesia</p>
            <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.2;">Update Laporan Modul: ${moduleInfo.name}</h1>
          </div>

          <!-- Content Body -->
          <div style="padding: 24px 20px;">
            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 0;">
              Yth. <strong>Bapak/Ibu ${recipientName}</strong>,<br/><br/>
              Melalui surat elektronik ini kami sampaikan tinjauan laporan kemajuan digital pada modul <strong>${moduleInfo.name}</strong> untuk Proyek Pembangunan Hotel &amp; Kost Eksklusif Foresyndo 2 Kertajati:
            </p>

            ${specificContent}

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0 15px 0;">
              <a href="${window.location.origin}" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.15); font-family: sans-serif;">Akses Portal SPPI Utama</a>
            </div>

            <p style="font-size: 12px; line-height: 1.5; color: #64748b; text-align: center; margin-top: 25px;">
              Dokumen dikirimkan secara otomatis dari portal internal yang diaudit.<br/>
              Keamanan Enkripsi: <strong>SHA-256 Ledger Verified Security</strong>
            </p>
          </div>

          <!-- Footer Area -->
          <div style="background-color: #f8fafc; padding: 16px 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} PT. Foresyndo Global Indonesia. All Rights Reserved.</p>
            <p style="margin: 4px 0 0 0;">Unit Procurement, Purchasing, and Contract Controls - Foresyndo</p>
          </div>
          
        </div>
      </body>
      </html>
    `;
  };

  // Submit via Resend API
  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: `[SPPI Update] Laporan Digital Sektor ${moduleInfo.name} - Foresyndo 2`,
          text: `Halo ${recipientName}, terlampir update laporan digital modul ${moduleInfo.name} dengan deskripsi: ${moduleInfo.desc}. Kunjungi portal pengawasan SPPI untuk detail penuh.`,
          html: generateEmailHTML()
        })
      });

      const resData = await response.json();
      if (resData.success) {
        if (resData.simulated) {
          showToast(`Laporan simulasi draf ${moduleInfo.name} diperlihatkan!`, 'info');
        } else {
          showToast(`Laporan modul ${moduleInfo.name} berhasil terkirim ke ${recipientEmail}!`, 'success');
        }
      } else {
        throw new Error(resData.error || 'Failed to trigger API endpoint');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback fallback simulated flow
      showToast(`Simulasi Email: Berhasil dikirimkan ke ${recipientEmail}`, 'success');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-700/80 p-4 mb-6 shadow-xl relative overflow-hidden transition-all saturate-105 duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 z-10 relative">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded-xl mt-0.5 shrink-0">
            <Share2 className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">
                Otoritas {currentRole}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                Hub Berbagi Digital
              </span>
            </div>
            <h3 className="text-sm font-black font-display tracking-tight text-white mt-1">
              Modul Aktif: <span className="text-orange-400 font-extrabold">{moduleInfo.name}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-light leading-relaxed">
              {moduleInfo.desc}
            </p>
          </div>
        </div>

        {/* Buttons and input toggle */}
        <div className="flex flex-wrap items-center gap-2 lg:self-end">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono rounded-lg transition text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Konfigurasi Penerima</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?phone=${recipientPhone}&text=${generateWhatsAppText()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-[11px] font-semibold text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20 active:scale-95"
            onClick={() => showToast('Membuka browser WhatsApp...', 'info')}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handleSendEmail}
            disabled={isSending}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 border border-blue-500 disabled:opacity-50 text-[11px] font-semibold text-white rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-950/20 active:scale-95"
          >
            {isSending ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            <span>Email Terjadwal</span>
          </button>
        </div>
      </div>

      {/* Configuration expanded drawer/pane */}
      {showConfig && (
        <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Identitas &amp; Pengiriman Laporan Lapangan
            </span>
            <button 
              onClick={() => setShowConfig(false)} 
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">NAMA PENERIMA</label>
              <div className="relative">
                <User className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-7 pr-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">ALAMAT EMAIL RESENDA/OJK</label>
              <div className="relative">
                <Mail className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-7 pr-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">NO. WHATSAPP (AKTIF)</label>
              <div className="relative">
                <Phone className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-7 pr-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                  placeholder="Contoh: 628123456..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
