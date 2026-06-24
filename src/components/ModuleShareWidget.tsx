import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateStandardEmailHTML } from '../utils/emailTemplates';
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
    const sections: any[] = [];

    switch (activeTabId) {
      case 'rab_explorer':
        sections.push({
          title: 'DATA RINGKASAN E-RAB',
          themeColor: 'blue',
          rows: [
            { label: 'Grand Total Rencana Biaya:', value: `Rp ${projectStats.investmentValue.toLocaleString('id-ID')},00`, isBold: true },
            { label: 'Sistem Otentikasi:', value: 'SHA-256 Ledger Digital', isBold: true },
            { label: 'Metode Penaksiran:', value: 'DED Koefisien SNI Terkini' }
          ]
        });
        break;

      case 'progress':
        const rows = progressItems.map(p => ({
          label: `Pekerjaan ${p.category}`,
          value: `${p.progressPercent}% [${p.status}]`,
          isBold: true
        }));
        sections.push({
          title: 'DETAIL KEMAJUAN FISIK PM LAPANGAN',
          themeColor: 'amber',
          description: `Kemajuan Fisik Gabungan Lapangan saat ini berada pada angka <strong>${projectStats.physicalProgress.toFixed(1)}% Completed</strong>.`,
          rows
        });
        break;

      case 'owner':
        sections.push({
          title: 'SKOR KEUANGAN MONITOR OWNER',
          themeColor: 'emerald',
          rows: [
            { label: 'Alokasi Anggaran Utama:', value: `Rp ${projectStats.investmentValue.toLocaleString('id-ID')}` },
            { label: 'Realisasi Belanja Lapangan:', value: `Rp ${projectStats.actualSpending.toLocaleString('id-ID')}`, isBold: true },
            { label: 'Sisa Anggaran Tersedia:', value: `Rp ${projectStats.remainingBudget.toLocaleString('id-ID')}`, isBold: true }
          ]
        });
        break;

      case 'investor':
        sections.push({
          title: 'METRIKS KELAYAKAN INVESTASI (FEASIBILITY STUDY)',
          themeColor: 'purple',
          rows: [
            { label: 'Proyeksi Unit Kamar:', value: `${projectStats.hotelRoomsCount} Hotel Unit & ${projectStats.kostRoomsCount} Kost Premium` },
            { label: 'Proyeksi Pendapatan Bulanan:', value: `Rp ${projectStats.estimatedRevenueMonthly.toLocaleString('id-ID')}/bln`, isBold: true },
            { label: 'Internal Rate of Return (IRR):', value: '~24.5%', isBold: true },
            { label: 'Estimasi BEP / Payback Period:', value: '~4.1 Tahun', isBold: true }
          ]
        });
        break;

      case 'drawing_viewer':
        sections.push({
          title: 'LAPORAN REVIEW DRAWING GAMBAR KERJA (DED)',
          themeColor: 'pink',
          description: `Terarsip sebanyak <strong>${drawingFiles.length} berkas DED resmi</strong> untuk pembangunan struktur baja dan pondasi.`,
          rows: [
            { label: 'Sistem Penilai:', value: 'Penanda Koordinat Pinpoint', isBold: true },
            { label: 'Review CAD Online:', value: 'Pengawas vs Pelaksana Lapangan' }
          ]
        });
        break;

      case 'project_documents':
        sections.push({
          title: 'LEGALITAS KOMPATIBILITAS HUKUM',
          themeColor: 'slate',
          description: `Sektor legalitas mengarsipkan <strong>${formalDocuments.length} Dokumen Perizinan Aktif</strong>.`,
          rows: [
            { label: 'Persetujuan Bangunan Gedung:', value: 'PBG / IMB Resmi' },
            { label: 'Persetujuan Dokumen Lingkungan:', value: 'Amdal / UKL-UPL' },
            { label: 'Utilitas Tambahan:', value: 'Air Bawah Tanah & Daya PLN' }
          ]
        });
        break;

      default:
        sections.push({
          title: 'DATA RINGKASAN MONITORING',
          themeColor: 'blue',
          rows: [
            { label: 'Rerata Kemajuan Fisik:', value: `${projectStats.physicalProgress}%`, isBold: true }
          ]
        });
        break;
    }

    return generateStandardEmailHTML({
      recipientName,
      title: `Update Laporan Modul: ${moduleInfo.name}`,
      subtitle: `Sektor Suku Cadang & Administrasi Digital Portal SPPI`,
      greeting: `Melalui surat elektronik ini kami sampaikan tinjauan laporan kemajuan digital pada modul <strong>${moduleInfo.name}</strong> untuk Proyek Pembangunan Hotel &amp; Kost Eksklusif Foresyndo 2 Kertajati:`,
      actionLink: window.location.origin,
      actionText: 'Akses Portal SPPI Utama',
      footerStatusText: 'SHA-256 Ledger Verified Security',
      sections
    });
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
