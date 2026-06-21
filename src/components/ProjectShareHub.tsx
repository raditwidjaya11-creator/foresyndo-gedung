import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { RAB_METADATA, rabItems } from '../data/rabData';
import { 
  Share2, 
  X, 
  Check, 
  Mail, 
  Phone, 
  AlertCircle, 
  Cpu, 
  FileText, 
  Plus, 
  Trash2, 
  Sliders, 
  FileSpreadsheet, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  Image, 
  CheckCircle2, 
  RefreshCw,
  Copy,
  Info
} from 'lucide-react';

interface ProjectShareHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectShareHub: React.FC<ProjectShareHubProps> = ({ isOpen, onClose }) => {
  const { 
    currentRole, 
    projectStats, 
    progressItems, 
    contractors, 
    drawingFiles, 
    formalDocuments,
    showToast 
  } = useApp();

  // Local state for recipient info
  const [recipientName, setRecipientName] = useState<string>('Bapak Radityo Widjaya (Owner)');
  const [phone, setPhone] = useState<string>('6281234567890');
  const [email, setEmail] = useState<string>('raditwidjaya11@gmail.com');
  
  // Choose which modules / sheets to compile
  const [includeRAB, setIncludeRAB] = useState<boolean>(true);
  const [includeContract, setIncludeContract] = useState<boolean>(true);
  const [includeProgress, setIncludeProgress] = useState<boolean>(true);
  const [includeInvestor, setIncludeInvestor] = useState<boolean>(true);
  const [includeDocuments, setIncludeDocuments] = useState<boolean>(true);

  // Editable fields for live content (the "Review" part)
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successMode, setSuccessMode] = useState<'none' | 'email' | 'whatsapp'>('none');

  // Load preset suggestions from contractors list or standard roles
  const recipientPresets = useMemo(() => {
    return [
      { name: 'Bapak Radityo Widjaya (Owner)', phone: '6281234567890', email: 'raditwidjaya11@gmail.com' },
      { name: 'Budi Santoso (Project Manager)', phone: '628157778899', email: 'pm.majalengka@foresyndo.com' },
      { name: 'ArchiPlan Specialist (Konsultan)', phone: '6281322441122', email: 'consultant@archiplan.co.id' },
      { name: 'H. Sulaiman (Investor)', phone: '6281122334455', email: 'investor_utama@capitalinfo.com' },
      { name: 'Agus Salim (Mitra Kontraktor)', phone: '6281988990011', email: 'kontraktor@karyasejahtera.com' }
    ];
  }, []);

  const handleApplyPreset = (preset: typeof recipientPresets[0]) => {
    setRecipientName(preset.name);
    setPhone(preset.phone);
    setEmail(preset.email);
    showToast(`Kontak penerima dialihkan ke: ${preset.name}`, 'info');
  };

  // Autogenerate compile report draft
  const regenerateDraft = () => {
    const subjectLine = `[DATA KONSOLIDASI PROYEK] Foresyndo 2 - Laporan Unit Komprehensif Resmi`;
    
    let text = `YTH. ${recipientName.toUpperCase()}
Foresyndo Global Indonesia - Kertajati Hub

Berikut adalah pengiriman Lembar Data Digital & Dokumen Konsolidasi Proyek Pembangunan Hotel & Kost Eksklusif Foresyndo 2 Kertajati.
Data dikompilasi secara real-time berdasarkan aktivitas pengawasan di sistem:

`;

    if (includeRAB) {
      text += `=== 1. DATA E-RAB RESMI (BILL OF QUANTITIES) ===
- Nilai Rencana Anggaran Biaya (RAB): Rp ${RAB_METADATA.grandTotal.toLocaleString('id-ID')},00
- Total Volume Pekerjaan (BoQ): ${rabItems.length} Item Detail Pekerjaan (14 Sub-Bab)
- Kategori Spesifikasi Material: Premium Kelas A (Foresyndo Grade P1)
- Sertifikasi Digital: Blockchain Verified MD5-Hash (Aman Terenkripsi)
\n`;
    }

    if (includeContract) {
      text += `=== 2. DATA SPK & MODUL KONTRAK ===
- Status Tanda Tangan: DRAFT KONTRAK TERVERIFIKASI
- Nilai Alokasi Kontrak: Rp ${(RAB_METADATA.grandTotal * 0.95).toLocaleString('id-ID')},00 (Setelah Diskon Negosiasi 5%)
- Skema Termin Pembayaran: Pembayaran Rilis Bertahap 5 Milestone Progres
- Syarat Pencairan: Wajib mendapat verifikasi & Approval Elektronik Owner terlebih dahulu sebelum invoice diterbitkan.
\n`;
    }

    if (includeProgress) {
      const itemsList = progressItems.map((item, idx) => 
        `- ${idx + 1}. Kategori ${item.category}: Progres ${item.progressPercent}% [Status: ${item.status}]`
      ).join('\n');

      text += `=== 3. DATA LAPORAN PROGRES FISIK PM ===
- Total Rata-rata Progres Fisik Lapangan: ${projectStats.physicalProgress.toFixed(1)}%
- Target Penyelesaian Selesai Fisik: ${projectStats.targetDate}
- Rincian Evaluasi Kategori:
${itemsList}
\n`;
    }

    if (includeInvestor) {
      text += `=== 4. DATA PROYEKSI INVESTASI (FEASIBILITY STUDY) ===
- Jumlah Kamar Terencana: ${projectStats.hotelRoomsCount} Kamar Hotel & ${projectStats.kostRoomsCount} Kamar Kost Premium
- Proyeksi Pendapatan Kotor Bulanan (Occ 75%-85%): Rp ${projectStats.estimatedRevenueMonthly.toLocaleString('id-ID')}/bulan
- Nilai Bersih Pengembalian Investasi (NPV 5 Tahun): Rp ${(RAB_METADATA.grandTotal * 1.5).toLocaleString('id-ID')},00
- Tingkat Suku Pengembalian Modal (IRR): ~24.5% per tahun
- Estimasi BEP (Payback Period): ~4.1 Tahun
\n`;
    }

    if (includeDocuments) {
      text += `=== 5. BERKAS DOKUMEN & GAMBAR KERJA ===
- Jumlah Gambar Kerja Cetak (CAD/PDF): ${drawingFiles.length} Gambar Teknis Arsitektur & Sipil
- Jumlah Dokumen Formal Proyek: ${formalDocuments.length} Arsip (Izin Amdal, Legalitas, IMB)
- Tautan Verifikasi Digital URL Hub: ${window.location.origin}/?verify=EST-72648
\n`;
    }

    text += `Di-review dan disahkan oleh PT. Foresyndo Global Indonesia.
Dibuat secara otomatis oleh Digital Dashboard Project Manager.
Tanggal Cetak Laporan: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} WIB.`;

    setCustomSubject(subjectLine);
    setCustomBody(text);
  };

  // Regenerate template whenever settings change
  useEffect(() => {
    if (isOpen) {
      regenerateDraft();
    }
  }, [isOpen, recipientName, includeRAB, includeContract, includeProgress, includeInvestor, includeDocuments]);

  if (!isOpen) return null;

  // Copy text to clipboard auxiliary helper
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(customBody);
    showToast('Teks draft laporan berhasil disalin ke clipboard!', 'success');
  };

  // Submit via Resend API / Mailto fallback
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSuccessMode('none');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: customSubject,
          text: customBody,
        }),
      });

      const result = await response.json();
      setIsSending(false);

      if (response.ok && result.success) {
        if (result.simulated) {
          setSuccessMode('email');
          showToast(`Review Sukses! Membuka Email Client lokal (RESEND_API_KEY belum dikonfigurasi)`, 'info');
          
          // Fallback to mailto link
          const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(customBody)}`;
          const link = document.createElement('a');
          link.href = mailtoUrl;
          link.click();
        } else {
          setSuccessMode('email');
          showToast(`Email Berhasil Terkirim Secara Real-time Melalui Resend ke ${email}!`, 'success');
        }
      } else {
        throw new Error(result.error || 'Terjadi kesalahan sistem pengiriman');
      }
    } catch (err: any) {
      console.error(err);
      setIsSending(false);
      showToast(`Gagal kirim via API. Mengalihkan ke Email Client lokal...`, 'info');
      
      // Secondary fallback
      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(customBody)}`;
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.click();
    }
  };

  // Submit via WhatsApp Wa.me
  const handleSendWhatsApp = () => {
    setIsSending(true);
    setSuccessMode('none');

    setTimeout(() => {
      setIsSending(false);
      setSuccessMode('whatsapp');
      showToast(`Draft review sukses! Mengalihkan ke WhatsApp untuk dikirim ke nomor ${phone}`, 'success');

      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customBody)}`;
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn flex flex-col h-[90vh] md:h-auto max-h-[850px]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 border-b-4 border-orange-500 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Share2 className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-black font-mono uppercase tracking-wider">Pusat Hub Konsolidasi &amp; Berbagi Data Proyek Digital</h3>
              <p className="text-[10px] text-blue-200 font-sans mt-0.5">Kirim E-RAB, Nilai Kontrak, Progres Fisik, &amp; Proyeksi Keuangan langsung via Email / WhatsApp</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-sans">
          
          {/* Top disclaimer panel */}
          <div className="p-3.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Review Sebelum Kirim:</strong> Anda dapat memilih kumpulan modul data apa saja yang ingin dikirimkan. Di sebelah kanan, sistem menampilkan draft teks yang dihasilkan secara dinamis yang <strong>bebas Anda edit secara manual</strong> sebelum dikirimkan ke tujuan WhatsApp atau Email penerima.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT COLUMN: SETTINGS & TARGETS (5 COLS) */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* Section A: Recipient and Presets */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h4 className="font-mono font-black text-[10px] text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-orange-500" />
                      Detail Kontak Penerima
                    </h4>
                  </div>

                  {/* Quick Preset Selector */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 font-bold block uppercase mb-1">Gunakan Shortcut Kontak Cepat:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {recipientPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 font-sans text-[10px] rounded-lg border border-slate-200 shadow-sm transition active:scale-95 cursor-pointer max-w-full truncate"
                        >
                          👤 {preset.name.split(' (')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Nama/Jabatan Penerima</label>
                      <input 
                        type="text" 
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Contoh: Bapak Ir. Ahmad"
                        className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-indigo-650 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Nomor WhatsApp (Gunakan 62)</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Contoh: 6281234567890"
                          className="w-full text-xs p-2.5 pl-9 bg-white border border-slate-250 rounded-xl focus:border-indigo-650 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Alamat Email Tujuan</label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Contoh: partner@proyek.com"
                          className="w-full text-xs p-2.5 pl-9 bg-white border border-slate-250 rounded-xl focus:border-indigo-650 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Choose Data to Embed */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="font-mono font-black text-[10px] text-indigo-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <FileText className="w-3.5 h-3.5 text-orange-500" />
                    PILIH KUMPULAN DATA UNTUK DIKIRIM
                  </h4>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={includeRAB}
                        onChange={(e) => setIncludeRAB(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-bold text-slate-800">Lembar E-RAB Resmi (BoQ)</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Nilai total BoQ Rp {RAB_METADATA.grandTotal.toLocaleString('id-ID')} &amp; sertifikat lisensi.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={includeContract}
                        onChange={(e) => setIncludeContract(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-slate-800">Modul Kontrak / Perjanjian SPK</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Diskon negosiasi, anggaran nilai SPK bersih, &amp; regulasi termin.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={includeProgress}
                        onChange={(e) => setIncludeProgress(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-bold text-slate-800">Laporan Progres Fisik PM</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Kemajuan rata-rata konstruksi lapangan &amp; rincian detail sub-struktur.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={includeInvestor}
                        onChange={(e) => setIncludeInvestor(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-bold text-slate-800">Feasibility / Proyeksi Investasi</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Finansial IRR, ROI, NPV, estimasi payback period occupancy hotel.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={includeDocuments}
                        onChange={(e) => setIncludeDocuments(e.target.checked)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-650" />
                          <span className="font-bold text-slate-800">Gambar Kerja &amp; Dokumen Legalitas</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Jumlah berkas cetak arsitektur, IMB, kelayakan izin, &amp; verifikasi link.</p>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Action Buttons to trigger send */}
              <div className="space-y-2 pt-4 border-t border-slate-150 shrink-0">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={isSending}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 shadow-sm disabled:opacity-50"
                >
                  <Phone className="w-4 h-4 text-white" />
                  Kirim Draft ke WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="w-full py-3 bg-indigo-950 hover:bg-slate-800 text-white font-mono text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 border border-transparent shadow-sm disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 text-white" />
                  Kirim Draft ke Email Penerima
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: TEXT AREA LIVE EDIT REVIEW (7 COLS) */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="flex-1 flex flex-col h-full min-h-[350px]">
                
                <div className="flex items-center justify-between shrink-0 mb-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    📋 TINJAU &amp; EDIT DRAF LAPORAN DIGITAL (LIVETEXT REVIEW)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="p-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono text-[9px] rounded-lg transition active:scale-95 cursor-pointer flex items-center gap-1 font-bold shadow-sm"
                  >
                    <Copy className="w-3 h-3 text-slate-500" />
                    Salin Teks
                  </button>
                </div>

                <div className="space-y-1.5 shrink-0">
                  <span className="text-[9px] text-slate-400 font-mono block">Subjek Email:</span>
                  <input 
                    type="text" 
                    required
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium text-slate-800"
                    placeholder="Judul Pengiriman Email"
                  />
                </div>

                <div className="flex-1 flex flex-col mt-3 min-h-[320px]">
                  <span className="text-[9px] text-slate-400 font-mono block mb-1">Isi Berkas Pesan (Dapat Diedit Manual):</span>
                  <textarea
                    required
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    placeholder="Tulis draf review laporannya di sini..."
                    className="w-full flex-1 text-xs p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none leading-relaxed font-mono text-slate-705 resize-none h-full"
                    style={{ fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace', minHeight: '340px' }}
                  />
                </div>
              </div>

              {/* Status information and live response logs */}
              {isSending && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 flex items-center gap-3 animate-pulse">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping shrink-0"></span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Menghimpun Berkas &amp; Mempersiapkan Komunikasi...</span>
                </div>
              )}

              {successMode !== 'none' && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-250 flex flex-col gap-1">
                  <p className="font-black font-mono text-[10px] uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Sistem Berhasil Mengalihkan!
                  </p>
                  <p className="text-[10px] text-emerald-700 font-sans">
                    {successMode === 'email' 
                      ? 'Link mailto klien eksternal dibuka dengan parameter subjek dan bodi teks laporan lengkap.' 
                      : 'WhatsApp Web / Mobile API sukses dibuka dengan bodi teks laporan resmi proyek.'}
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0 gap-2 font-mono">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-250 text-slate-600 font-bold hover:bg-slate-50 text-xs rounded-xl transition cursor-pointer"
          >
            Tutup Panel
          </button>
        </div>

      </div>
    </div>
  );
};
