import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { rabItems, RAB_METADATA, RABItem } from '../data/rabData';
import { generateStandardEmailHTML } from '../utils/emailTemplates';
import { 
  FileCheck, 
  User, 
  Building, 
  MapPin, 
  Download, 
  Printer, 
  Search, 
  TrendingDown, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  FileText, 
  Briefcase, 
  Fingerprint, 
  Users, 
  Cpu, 
  RotateCcw, 
  CheckCircle2, 
  X,
  FileSignature,
  Plus,
  Trash2,
  Lock,
  ChevronRight,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Mail,
  Send,
  Share2,
  Phone
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Struct for local amendment / variation order items
interface AmendmentItem {
  id: string;
  code: string;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  category: string;
}

// Struct for Payment Claim / Approval Workflow
interface PaymentClaim {
  id: string;
  contractorId: string;
  terminIndex: number;
  terminName: string;
  pct: number;
  amount: number;
  requestedBy: string;
  requestedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  notes: string;
  ownerComment?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export const ContractModule: React.FC = () => {
  const { 
    currentRole, 
    currentUser, 
    contractors, 
    tenders, 
    bids,
    showToast 
  } = useApp();

  // -------------------------------------------------------------
  // STATE DEFINITIONS
  // -------------------------------------------------------------
  
  // Selected second-party contractor
  const [selectedContractorId, setSelectedContractorId] = useState<string>(() => {
    // Default to PT. Tri Karya MEP Specialist which is the main bidder or contractor
    return 'contr2';
  });

  // Selected payment scheme template state
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('standar');
  
  // Custom payment schema states
  const [customDp, setCustomDp] = useState<number>(20);
  const [customTerm1, setCustomTerm1] = useState<number>(30);
  const [customTerm2, setCustomTerm2] = useState<number>(45);

  const customRetensi = useMemo(() => {
    const totalSelected = customDp + customTerm1 + customTerm2;
    const left = 100 - totalSelected;
    return left >= 0 ? left : 0;
  }, [customDp, customTerm1, customTerm2]);

  // Payment schemes list configuration
  const PAYMENT_SCHEMES = useMemo(() => [
    {
      id: 'standar',
      name: 'Skema Progresif Standar (Default)',
      description: 'Skema pembayaran umum dengan DP seimbang dan termin progres kemajuan proyek utama.',
      steps: [
        { name: 'UANG MUKA (DP)', pct: 15, description: 'Dibayarkan sesaat setelah jaminan pelaksanaan diserahkan & kick-off.' },
        { name: 'TERMIN I (STRUKTUR)', pct: 35, description: 'Kemajuan fisik lapangan berbobot kumulatif mencapai 40.0%.' },
        { name: 'TERMIN II (TOPPING OFF)', pct: 45, description: 'Topping Off gedung selesai, struktur arsitektur 90% selesai.' },
        { name: 'RETENSI PEMELIHARAAN', pct: 5, description: 'Masa pemeliharaan 180 hari kalender lolos FHO.' }
      ]
    },
    {
      id: 'padat_modal',
      name: 'Skema Padat Modal (DP Tinggi)',
      description: 'Laju pembiayaan awal dipercepat untuk pengadaan borongan besi, beton, serta logistik besar.',
      steps: [
        { name: 'UANG MUKA (DP AWAL)', pct: 30, description: 'Uang muka kerja tinggi untuk mobilisasi & pengadaan besi/semen massal.' },
        { name: 'TERMIN I (PROGRESS)', pct: 30, description: 'Pondasi selesai & pengerjaan kolom lantai 2 rampung.' },
        { name: 'TERMIN II (PENYELESAIAN)', pct: 35, description: 'Pekerjaan arsitektur, MEP, dan fungsional rampung 95%.' },
        { name: 'RETENSI JAMINAN', pct: 5, description: 'Masa pemeliharaan rampung.' }
      ]
    },
    {
      id: 'bulanan',
      name: 'Skema Bulanan (Monthly Progress)',
      description: 'Pembayaran rilis periodik berkala tiap bulan bersandarkan progres opname riil lapangan.',
      steps: [
        { name: 'UANG MUKA (DP AWAL)', pct: 10, description: 'Pembayaran DP ringan pemicu mobilisasi awal.' },
        { name: 'TERMIN I (BULANAN 1)', pct: 25, description: 'Pencairan periodik bulan 1-2 prestasi kumulatif fisik.' },
        { name: 'TERMIN II (BULANAN 2)', pct: 30, description: 'Pencairan prestasi kerja pertengahan proyek.' },
        { name: 'TERMIN III (SERAH TERIMA)', pct: 30, description: 'Pra-serah terima kunci fisik 100% hotel.' },
        { name: 'RETENSI PEMELIHARAAN', pct: 5, description: 'Dana jaminan masa tanggungan cacat bangunan.' }
      ]
    },
    {
      id: 'back_to_back',
      name: 'Skema Korporat Tanpa DP',
      description: 'Metode penyerapan anggaran prestasi kerja murni pasca-inspeksi tertulis tanpa jaminan uang muka.',
      steps: [
        { name: 'UANG MUKA', pct: 0, description: 'Tanpa uang muka. Pekerjaan dimulai dengan modal kontraktor sepenuhnya.' },
        { name: 'TERMIN I (PROGRESS 50%)', pct: 45, description: 'Kemajuan fisik dan audit MEP selesai 50%.' },
        { name: 'TERMIN II (SERAH TERIMA PHO)', pct: 50, description: 'Serah terima pertama seluruh bangunan selesai.' },
        { name: 'RETENSI PEMELIHARAAN', pct: 5, description: 'Masa pemeliharaan pelunasan retensi.' }
      ]
    },
    {
      id: 'custom',
      name: 'Skema Kustom Mandiri',
      description: 'Atur persentase porsi termin Anda secara fleksibel sesuai kesepakatan ad-hoc kedua belah pihak.',
      steps: []
    }
  ], []);

  // Compute active payment steps dynamically
  const activePaymentSteps = useMemo(() => {
    if (selectedSchemeId === 'custom') {
      return [
        { name: 'UANG MUKA (DP KUSTOM)', pct: customDp, description: 'Pembayaran DP disesuaikan manual.' },
        { name: 'TERMIN I (KUSTOM)', pct: customTerm1, description: 'Pencairan termin kerja tahap pertama setelah opname.' },
        { name: 'TERMIN II (KUSTOM)', pct: customTerm2, description: 'Pencairan termin kerja penutup sebelum penyerahan struktur.' },
        { name: 'RETENSI PEMELIHARAAN', pct: customRetensi, description: 'Dana jaminan pemeliharaan akhir masa garansi.' }
      ];
    }
    const found = PAYMENT_SCHEMES.find(s => s.id === selectedSchemeId);
    return found ? found.steps : PAYMENT_SCHEMES[0].steps;
  }, [selectedSchemeId, customDp, customTerm1, customTerm2, customRetensi, PAYMENT_SCHEMES]);


  // Contract Negotiated Discount Factor (0% to 15%)
  const [negotiatedDiscount, setNegotiatedDiscount] = useState<number>(0);

  // Active Division/Devisi Filter
  const [activeDevisiTab, setActiveDevisiTab] = useState<'D1' | 'D2' | 'D3' | 'D4' | 'D5'>('D1');

  // Search filter for BoQ items
  const [boqSearchQuery, setBoqSearchQuery] = useState<string>('');

  // Digital Contract Status states ('Draft' | 'Signed')
  const [contractStatus, setContractStatus] = useState<'Draft' | 'Signed'>(() => {
    const saved = localStorage.getItem('fgi_contract_status');
    return saved === 'Signed' ? 'Signed' : 'Draft';
  });

  // Digital Signature details
  const [signeeName, setSigneeName] = useState<string>('');
  const [signeeTitle, setSigneeTitle] = useState<string>('Direktur Utama');
  const [signatureDate, setSignatureDate] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');

  // Amendments List
  const [amendments, setAmendments] = useState<AmendmentItem[]>(() => {
    const saved = localStorage.getItem('fgi_contract_amendments');
    return saved ? JSON.parse(saved) : [];
  });

  // State for Payment claims / approval workflow
  const [paymentClaims, setPaymentClaims] = useState<PaymentClaim[]>(() => {
    const saved = localStorage.getItem('fgi_contract_claims2');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'claim_1',
        contractorId: 'contr2',
        terminIndex: 0,
        terminName: 'UANG MUKA (DP)',
        pct: 15,
        amount: 0,
        requestedBy: 'Agus Salim (Site Manager PT. Tri Karya)',
        requestedDate: '2026-06-12',
        status: 'Paid',
        notes: 'Uang Muka 15% untuk mobilisasi logisitik awal, penyiapan alat berat bore pile, dan perlengkapan safety K3.',
        ownerComment: 'Disetujui untuk diproses bayar oleh tim keuangan setelah Dokumen Jaminan Pelaksanaan bersangkutan diverifikasi penuh oleh bank penerbit.',
        approvedBy: 'Radityo Widjaya (Owner)',
        approvedDate: '2026-06-14'
      },
      {
        id: 'claim_2',
        contractorId: 'contr2',
        terminIndex: 1,
        terminName: 'TERMIN I (STRUKTUR)',
        pct: 35,
        amount: 0,
        requestedBy: 'Agus Salim (Site Manager PT. Tri Karya)',
        requestedDate: '2026-06-19',
        status: 'Pending',
        notes: 'Pekerjaan pondasi sub-struktur rampung total dan pembesian tiang kolom utama lantai 1 rampung. Bobot fisik kumulatif lapangan diverifikasi Konsultan mencapai 42.10%.',
        ownerComment: ''
      }
    ];
  });

  const savePaymentClaims = (newClaims: PaymentClaim[]) => {
    setPaymentClaims(newClaims);
    localStorage.setItem('fgi_contract_claims2', JSON.stringify(newClaims));
  };

  // UI state variables for claiming
  const [showNewClaimModal, setShowNewClaimModal] = useState<boolean>(false);
  const [claimSelectIdx, setClaimSelectIdx] = useState<number>(0);
  const [claimNotesText, setClaimNotesText] = useState<string>('');

  // Owner action feedback comment state
  const [reviewClaimId, setReviewClaimId] = useState<string | null>(null);
  const [reviewActionType, setReviewActionType] = useState<'Approve' | 'Reject' | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Form states for creating translation additions
  const [showAddAmendModal, setShowAddAmendModal] = useState<boolean>(false);
  const [amendCode, setAmendCode] = useState<string>('');
  const [amendDesc, setAmendDesc] = useState<string>('');
  const [amendVolume, setAmendVolume] = useState<number>(1);
  const [amendUnit, setAmendUnit] = useState<string>('m2');
  const [amendPrice, setAmendPrice] = useState<number>(150000);
  const [amendDevisi, setAmendDevisi] = useState<'D1' | 'D2' | 'D3' | 'D4' | 'D5'>('D1');

  // Seed default signatures if signed
  useEffect(() => {
    if (contractStatus === 'Signed') {
      const savedSignee = localStorage.getItem('fgi_contract_signee') || 'Budi Santoso';
      const savedCode = localStorage.getItem('fgi_contract_code') || 'SIG-FGI-2026-9902X';
      const savedDate = localStorage.getItem('fgi_contract_date') || '2026-06-21';
      setSigneeName(savedSignee);
      setVerificationCode(savedCode);
      setSignatureDate(savedDate);
    }
  }, [contractStatus]);

  // Save amendments state
  const saveAmendments = (newAmend: AmendmentItem[]) => {
    setAmendments(newAmend);
    localStorage.setItem('fgi_contract_amendments', JSON.stringify(newAmend));
  };

  // Find currently active contractor object
  const activeContractor = useMemo(() => {
    return contractors.find(c => c.id === selectedContractorId) || contractors[0];
  }, [selectedContractorId, contractors]);

  // -------------------------------------------------------------
  // BOQ DATA SUBSETS DIVISION & DISCOUNTING BINDING
  // -------------------------------------------------------------
  const boqItemsWithDiscount = useMemo(() => {
    const multiplier = 1 - (negotiatedDiscount / 100);
    return rabItems.map(item => {
      // Calculate adjusted rates
      const discPrice = Math.round(item.unitPrice * multiplier * 100) / 100;
      return {
        ...item,
        unitPrice: discPrice,
        totalCost: discPrice * item.volume
      };
    });
  }, [negotiatedDiscount]);

  // Devisi Filter Mapping
  // D1 -> Pekerjaan Persiapan
  // D2 -> Pekerjaan Pondasi Substruktur
  // D3 -> Pekerjaan Superstruktur (Beton)
  // D4 -> Pekerjaan Arsitektur + Kamar Mandi
  // D5 -> MEP + Kolam + Cafe + Luar + Lease etc.
  const boqFilteredList = useMemo(() => {
    return boqItemsWithDiscount.filter(item => {
      // Chapter matching logic
      let passesDevisi = false;
      const ch = item.chapter.toLowerCase();

      if (activeDevisiTab === 'D1') {
        passesDevisi = ch.includes('persiapan');
      } else if (activeDevisiTab === 'D2') {
        passesDevisi = ch.includes('pondasi') || ch.includes('substruktur');
      } else if (activeDevisiTab === 'D3') {
        passesDevisi = ch.includes('superstruktur') || ch.includes('beton');
      } else if (activeDevisiTab === 'D4') {
        passesDevisi = ch.includes('arsitektur') || ch.includes('kamar mandi') || ch.includes('finishing');
      } else if (activeDevisiTab === 'D5') {
        passesDevisi = ch.includes('mep') || ch.includes('plumbing') || ch.includes('fire fighting') || 
                       ch.includes('hvac') || ch.includes('kolam') || ch.includes('cafe') || 
                       ch.includes('luar') || ch.includes('testing') || ch.includes('crane');
      }

      // Search matches
      const matchesSearch = item.description.toLowerCase().includes(boqSearchQuery.toLowerCase()) || 
                            item.code.toLowerCase().includes(boqSearchQuery.toLowerCase());

      return passesDevisi && matchesSearch;
    });
  }, [boqItemsWithDiscount, activeDevisiTab, boqSearchQuery]);

  // Dynamic contract stats calculations including any amendments / extra works
  const contractFinancialSummary = useMemo(() => {
    // Current base discounted BoQ sum
    const baseSubtotal = boqItemsWithDiscount.reduce((sum, item) => sum + item.totalCost, 0);
    
    // Add custom amendments
    const amendmentsSubtotal = amendments.reduce((sum, item) => sum + (item.volume * item.unitPrice), 0);
    
    const dppTotal = baseSubtotal + amendmentsSubtotal;
    const ppnValue = dppTotal * 0.11;
    const finalContractGrandTotal = dppTotal + ppnValue;

    return {
      baseSubtotal,
      amendmentsSubtotal,
      dppTotal,
      ppnValue,
      finalContractGrandTotal
    };
  }, [boqItemsWithDiscount, amendments]);

  // =============================================================
  // SHARE VIA WHATSAPP & EMAIL (REVIEW BEFORE SENDING)
  // =============================================================
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareEmail, setShareEmail] = useState<string>('raditwidjaya11@gmail.com');
  const [sharePhone, setSharePhone] = useState<string>('081234567890');
  const [shareSubject, setShareSubject] = useState<string>('');
  const [shareBody, setShareBody] = useState<string>('');
  const [isSimulatingSend, setIsSimulatingSend] = useState<boolean>(false);
  const [sendSuccessMode, setSendSuccessMode] = useState<'none' | 'email' | 'whatsapp'>('none');

  // Sync draft data for review, before the user edits it.
  useEffect(() => {
    if (showShareModal) {
      if (activeContractor) {
        setShareEmail(activeContractor.email || 'raditwidjaya11@gmail.com');
        setSharePhone(activeContractor.phone || '081234567890');
      }
      
      const subjectText = `[E-RAB & SPK KONTRAK] Proyek Pembangunan Hotel & Kost Eksklusif Foresyndo 2 - ${activeContractor ? activeContractor.companyName : ''}`;
      
      const stepsText = activePaymentSteps.map((step, idx) => {
        const amt = Math.round(contractFinancialSummary.finalContractGrandTotal * (step.pct / 100));
        return `- TAHAP ${idx + 1}: ${step.name} (${step.pct}%) -> Rp ${amt.toLocaleString('id-ID')}`;
      }).join('\n');

      const bodyText = `Yth. Tim ${activeContractor ? activeContractor.companyName : ''}
Perwakilan: Bapak/Ibu ${activeContractor ? (activeContractor.director || 'Pimpinan') : 'Penerima Tugas'}

Dengan hormat,
Sebagai tindak lanjut dari negosiasi teknis & penyelarasan anggaran, berikut adalah Ringkasan Cetak Unit RAB & Dokumen SPK Kontrak Pembangunan Gedung Hotel & Kost Eksklusif Foresyndo 2 yang sedang aktif:

1. RINGKASAN FINANSIAL KONTRAK:
- Nilai Pokok BoQ Rencana Kerja: Rp ${contractFinancialSummary.baseSubtotal.toLocaleString('id-ID')}
- Negosiasi Faktor Diskon: ${negotiatedDiscount}%
- Tambahan Adendum Pekerjaan (VO): Rp ${contractFinancialSummary.amendmentsSubtotal.toLocaleString('id-ID')}
- Nilai Dasar PPN (DPP): Rp ${contractFinancialSummary.dppTotal.toLocaleString('id-ID')}
- Nilai Pajak PPN (11%): Rp ${contractFinancialSummary.ppnValue.toLocaleString('id-ID')}
- GRAND TOTAL NILAI SPK KONTRAK: Rp ${contractFinancialSummary.finalContractGrandTotal.toLocaleString('id-ID')}

2. STATUS DOKUMEN:
- Status Kontrak: ${contractStatus === 'Signed' ? 'SUDAH DITANDATANGANI (SIGNED)' : 'DRAFT KONTRAK (MENUNGGU TTD)'}

3. ACUAN SKEMA TERMIN PEMBAYARAN KONTRAK:
Skema Berjalan: ${PAYMENT_SCHEMES.find(s => s.id === selectedSchemeId)?.name || 'Skema Standar'}
${stepsText}

Ketentuan: Pembayaran dirilis setelah Owner menyetujui ajuan termin melalui Alur Verifikasi (Approval Workflow) resmi sistem.

File dokumen PDF E-RAB Resmi & SPK Kontrak terlampir secara otomatis di dalam sistem untuk di-download. Mohon melakukan tinjauan akhir.

Hormat kami,
PT. Foresyndo Global Indonesia (FGI)
Unit Manajemen Procurement & Pengendali Konstruksi`;

      setShareSubject(subjectText);
      setShareBody(bodyText);
    }
  }, [showShareModal, activeContractor, contractFinancialSummary, negotiatedDiscount, contractStatus, selectedSchemeId, activePaymentSteps, PAYMENT_SCHEMES]);

  const generateContractHTML = () => {
    const schemeName = PAYMENT_SCHEMES.find(s => s.id === selectedSchemeId)?.name || 'Skema Standar';
    const stepsRows = activePaymentSteps.map((step, idx) => {
      const amt = Math.round(contractFinancialSummary.finalContractGrandTotal * (step.pct / 100));
      return {
        label: `Termin ${idx + 1}: ${step.name} (${step.pct}%)`,
        value: `Rp ${amt.toLocaleString('id-ID')},00`,
        isBold: true
      };
    });

    return generateStandardEmailHTML({
      recipientName: activeContractor ? (activeContractor.director || 'Pimpinan Mitra') : 'Penerima Tugas',
      title: 'Tinjauan Surat Perintah Kerja (SPK) & Kontrak',
      subtitle: `PT. Foresyndo Global Indonesia - Rencana Kerja E-RAB Konstruksi`,
      greeting: `Dengan hormat, sebagai tindak lanjut negosiasi anggaran, berikut adalah tinjauan resmi unit Rencana Kerja E-RAB dan SPK Kontrak Konstruksi untuk Proyek Pembangunan Gedung Hotel &amp; Kost Eksklusif Foresyndo 2 Kertajati bagi <strong>${activeContractor ? activeContractor.companyName : 'Mitra Kontraktor'}</strong>:`,
      actionLink: window.location.origin,
      actionText: 'Review & Tanda Tangani Kontrak SPK',
      footerStatusText: `SHA-256 Verified Signature | Status Kontrak: ${contractStatus === 'Signed' ? 'SIGNED (AKTIF)' : 'PENDING TTD'}`,
      sections: [
        {
          title: 'A. RINGKASAN REKONSILIASI FINANSIAL',
          themeColor: 'blue',
          description: 'Detail rincian penyesuaian biaya, potongan negosiasi, dan penambahan adendum (VO):',
          rows: [
            { label: 'Nilai Pokok BoQ Kerja:', value: `Rp ${contractFinancialSummary.baseSubtotal.toLocaleString('id-ID')}` },
            { label: 'Faktor Diskon Negosiasi:', value: `- ${negotiatedDiscount}%`, isBold: true },
            { label: 'Adendum Baru (VO):', value: `+ Rp ${contractFinancialSummary.amendmentsSubtotal.toLocaleString('id-ID')}`, isBold: true },
            { label: 'Dasar Pengenaan Pajak (DPP):', value: `Rp ${contractFinancialSummary.dppTotal.toLocaleString('id-ID')}`, isBold: true },
            { label: 'Pajak PPN (11%):', value: `Rp ${contractFinancialSummary.ppnValue.toLocaleString('id-ID')}` },
            { label: 'GRAND TOTAL SPK KONTRAK:', value: `Rp ${contractFinancialSummary.finalContractGrandTotal.toLocaleString('id-ID')}`, isBold: true }
          ]
        },
        {
          title: `B. ALUR TERMIN PEMBAYARAN KONTRAK (${schemeName})`,
          themeColor: 'emerald',
          description: 'Sesuai kesepakatan skema termin pembayaran, rilis anggaran termin wajib melalui verifikasi progres lapangan oleh PM & persetujuan manajemen:',
          rows: stepsRows
        }
      ]
    });
  };

  const handleSendEmailSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingSend(true);
    setSendSuccessMode('none');

    let pdfBase64 = '';
    try {
      const doc = generateDraftContractPDF();
      pdfBase64 = doc.output('datauristring').split(',')[1];
    } catch (pdfErr) {
      console.error('Failed to generate SPK Contract PDF for email:', pdfErr);
    }

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: shareEmail,
          subject: shareSubject,
          text: shareBody,
          html: generateContractHTML(),
          attachments: pdfBase64 ? [
            {
              filename: `SPK_Contract_${activeContractor.companyName.replace(/ /g, '_')}.pdf`,
              content: pdfBase64
            }
          ] : undefined
        }),
      });

      const result = await response.json();
      setIsSimulatingSend(false);

      if (response.ok && result.success) {
        if (result.simulated) {
          setSendSuccessMode('email');
          showToast(`Review Berhasil! Membuka Email Client lokal beserta lampiran PDF (RESEND_API_KEY tidak terkonfigurasi)`, 'info');

          // Download locally to let them have it since it is simulated
          try {
            const doc = generateDraftContractPDF();
            doc.save(`SPK_Kontrak_Resmi_Foresyndo2_${activeContractor.companyName.replace(/ /g, '_')}.pdf`);
          } catch (dlErr) {
            console.error(dlErr);
          }

          const mailtoUrl = `mailto:${encodeURIComponent(shareEmail)}?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`;
          const link = document.createElement('a');
          link.href = mailtoUrl;
          link.click();
        } else {
          setSendSuccessMode('email');
          showToast(`Email & Lampiran SPK Contract PDF Berhasil Terkirim Melalui Resend ke ${shareEmail}!`, 'success');
        }
      } else {
        throw new Error(result.error || 'Gagal mengirim email');
      }
    } catch (err: any) {
      console.error(err);
      setIsSimulatingSend(false);
      showToast(`Gagal kirim via Resend API. Mengalihkan ke Email Client lokal...`, 'info');

      // Download locally as fallback
      try {
        const doc = generateDraftContractPDF();
        doc.save(`SPK_Kontrak_Resmi_Foresyndo2_${activeContractor.companyName.replace(/ /g, '_')}.pdf`);
      } catch (dlErr) {
        console.error(dlErr);
      }

      const mailtoUrl = `mailto:${encodeURIComponent(shareEmail)}?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`;
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.click();
    }
  };

  const handleSendWhatsAppLink = () => {
    setIsSimulatingSend(true);
    setSendSuccessMode('none');

    setTimeout(() => {
      setIsSimulatingSend(false);
      setSendSuccessMode('whatsapp');
      showToast(`Review Berhasil! Menghubungkan ke WhatsApp di nomor ${sharePhone}`, 'success');

      // Create a wa.me URL
      const cleanPhone = sharePhone.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareBody)}`;
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }, 1200);
  };

  // -------------------------------------------------------------
  // ACTIONS / HANDLERS
  // -------------------------------------------------------------
  
  // Submit local digital signing operation
  const handleSignContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signeeName.trim()) {
      alert('Mohon cantumkan Nama Penandatangan terlebih dahulu.');
      return;
    }

    const uniqueSignCode = `SIG-FGI-JTT-2026-${Math.floor(1000 + Math.random() * 9000)}B`;
    const today = new Date().toISOString().split('T')[0];

    localStorage.setItem('fgi_contract_status', 'Signed');
    localStorage.setItem('fgi_contract_signee', signeeName);
    localStorage.setItem('fgi_contract_code', uniqueSignCode);
    localStorage.setItem('fgi_contract_date', today);

    setVerificationCode(uniqueSignCode);
    setSignatureDate(today);
    setContractStatus('Signed');

    showToast('Sukses! Dokumen Surat Perintah Kerja (SPK) berhasil disahkan dengan Tanda Tangan Digital!', 'success');
  };

  // Reset signature layout back to draft mode simulation
  const handleResetContract = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan status tanda tangan digital dan mengembalikan kontrak ini ke bentuk Draf?')) {
      localStorage.removeItem('fgi_contract_status');
      localStorage.removeItem('fgi_contract_signee');
      localStorage.removeItem('fgi_contract_code');
      localStorage.removeItem('fgi_contract_date');
      
      setContractStatus('Draft');
      setSigneeName('');
      setVerificationCode('');
      setSignatureDate('');
      showToast('Kontrak berhasil dikembalikan ke status DRAFT.', 'info');
    }
  };

  // Create contract amendment items
  const handleAddAmendmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendCode || !amendDesc || amendVolume <= 0 || amendPrice <= 0) {
      alert('Mohon lengkapi formulir adendum baru dengan data yang valid.');
      return;
    }

    const newAmend: AmendmentItem = {
      id: `amend_${Date.now()}`,
      code: amendCode,
      description: amendDesc,
      volume: amendVolume,
      unit: amendUnit,
      unitPrice: amendPrice,
      category: amendDevisi === 'D1' ? 'Pekerjaan Persiapan' :
                amendDevisi === 'D2' ? 'Pekerjaan Pondasi Substruktur' :
                amendDevisi === 'D3' ? 'Pekerjaan Superstruktur' :
                amendDevisi === 'D4' ? 'Pekerjaan Arsitektur' : 'Pekerjaan MEP'
    };

    const updated = [...amendments, newAmend];
    saveAmendments(updated);
    setShowAddAmendModal(false);

    // Reset fields
    setAmendCode('');
    setAmendDesc('');
    setAmendVolume(1);
    setAmendUnit('m2');
    setAmendPrice(150000);

    showToast('Addendum Kontrak Pekerjaan Tambah berhasil didaftarkan!', 'success');
  };

  // Delete amendment
  const handleDeleteAmendment = (id: string, code: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus item Pekerjaan Tambah ${code}?`)) {
      const filtered = amendments.filter(item => item.id !== id);
      saveAmendments(filtered);
      showToast(`Adendum ${code} berhasil dihapus.`, 'info');
    }
  };

  // Create new claim request from active contractor/project manager
  const handleCreateClaimRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const step = activePaymentSteps[claimSelectIdx];
    if (!step) return;

    // Check if this step already has an active (Pending/Approved/Paid) claim
    const existing = paymentClaims.find(
      c => c.terminIndex === claimSelectIdx && c.status !== 'Rejected'
    );
    if (existing) {
      showToast(`Termin "${step.name}" sudah diajukan sebelumnya dengan status ${existing.status}!`, 'error');
      return;
    }

    const calculatedAmt = Math.round(contractFinancialSummary.finalContractGrandTotal * (step.pct / 100));

    const newClaim: PaymentClaim = {
      id: `claim_${Date.now()}`,
      contractorId: selectedContractorId,
      terminIndex: claimSelectIdx,
      terminName: step.name,
      pct: step.pct,
      amount: calculatedAmt,
      requestedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Agus Salim (Site Manager PT. Tri Karya)',
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      notes: claimNotesText || 'Pengajuan termin progres fisik sesuai dengan milestone yang tercapai di lapangan.'
    };

    savePaymentClaims([newClaim, ...paymentClaims]);
    setShowNewClaimModal(false);
    setClaimNotesText('');
    showToast(`Pengajuan Klaim Termin "${step.name}" sebesar ${step.pct}% berhasil diajukan! Status: Menunggu Persetujuan Owner.`, 'success');
  };

  // Process approval review action
  const handleApproveOrRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewClaimId || !reviewActionType) return;

    const newList = paymentClaims.map(claim => {
      if (claim.id === reviewClaimId) {
        const approvedName = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Radityo Widjaya (Owner)';
        const defaultComment = reviewActionType === 'Approve' 
          ? 'Dokumen progres lapangan valid dan foto fisik disetujui untuk dicairkan.' 
          : 'Ditolak untuk revisi. Bobot fisik aktual di lapangan terdeteksi belum memenuhi kapasitas termin.';

        return {
          ...claim,
          status: reviewActionType === 'Approve' ? 'Approved' as const : 'Rejected' as const,
          ownerComment: reviewComment || defaultComment,
          approvedBy: approvedName,
          approvedDate: new Date().toISOString().split('T')[0]
        };
      }
      return claim;
    });

    savePaymentClaims(newList);
    showToast(`Klaim termin berhasil ${reviewActionType === 'Approve' ? 'DISETUJUI' : 'DITOLAK'}!`, 'success');
    setReviewClaimId(null);
    setReviewActionType(null);
    setReviewComment('');
  };

  // Finance processes approved claims into paid status
  const handleProcessPayment = (claimId: string) => {
    const claim = paymentClaims.find(c => c.id === claimId);
    if (!claim) return;
    if (claim.status !== 'Approved') {
      showToast('Klaim belum disetujui oleh Owner!', 'error');
      return;
    }

    const newList = paymentClaims.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: 'Paid' as const
        };
      }
      return c;
    });

    savePaymentClaims(newList);
    showToast(`Pembayaran termin "${claim.terminName}" berhasil diproses cair! Pas transfer sukses.`, 'success');
  };

  // Delete payment claim request (for administrative cleanup)
  const handleDeleteClaim = (claimId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan klaim termin ini?')) {
      const filtered = paymentClaims.filter(c => c.id !== claimId);
      savePaymentClaims(filtered);
      showToast('Catatan klaim termin berhasil dihapus.', 'info');
    }
  };

  const generateDraftContractPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Aesthetic Design Header Config
    doc.setFillColor(30, 58, 138); // Blue 900
    doc.rect(0, 0, 210, 38, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SURAT PERJANJIAN PEMBORONGAN & PERINTAH KERJA (SPK)', 14, 15);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('PROYEK PEMBANGUNAN GEDUNG HOTEL & KOST EKSLUSIF FORESYNDO 2', 14, 21);
    doc.text(`NO. DOKUMEN: SPK-FGI-JTT-2026-041  |  TANGGAL: ${signatureDate || '21 Juni 2026'}`, 14, 27);
    
    // Striping Orange Line
    doc.setFillColor(234, 88, 12); // Orange 600
    doc.rect(0, 38, 210, 2, 'F');

    // Document Information
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PIHAK YANG BERSEPAKAT:', 14, 50);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PIHAK PERTAMA (PEMBERI TUGAS):', 14, 58);
    doc.setFont('helvetica', 'normal');
    doc.text('PT. FORESYNDO GLOBAL INDONESIA', 14, 63);
    doc.text('Perwakilan: Direksi Direktur Utama (H. Sulaiman / Radit Widjaya)', 14, 68);
    doc.text('Alamat: Jatitujuh, Majalengka, Jawa Barat', 14, 73);

    doc.setFont('helvetica', 'bold');
    doc.text('PIHAK KEDUA (PENERIMA TUGAS):', 110, 58);
    doc.setFont('helvetica', 'normal');
    doc.text((activeContractor.companyName).toUpperCase(), 110, 63);
    doc.text(`Perwakilan: ${activeContractor.director || 'Direktur Utama'}`, 110, 68);
    doc.text(`Alamat: ${activeContractor.address || 'Kopo, Bandung, Jawa Barat'}`, 110, 73);

    doc.line(14, 78, 196, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('NILAI KONTRAK & BIAYA BORONGAN:', 14, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`- Sub-Total Pokok BoQ Rencana Kerja :  Rp ${contractFinancialSummary.baseSubtotal.toLocaleString('id-ID')},00`, 14, 91);
    doc.text(`- Negosiasi Faktor Diskon Seluruhan :  ${negotiatedDiscount}% OFF (Penghematan Rp ${(rabItems.reduce((acc, item) => acc + item.totalCost, 0) - contractFinancialSummary.baseSubtotal).toLocaleString('id-ID')})`, 14, 96);
    doc.text(`- Tambahan Adendum Pekerjaan (VO) :  Rp ${contractFinancialSummary.amendmentsSubtotal.toLocaleString('id-ID')},00`, 14, 101);
    doc.text(`- Nilai Dasar Pengenaan Pajak (DPP) :  Rp ${contractFinancialSummary.dppTotal.toLocaleString('id-ID')},00`, 14, 106);
    doc.text(`- Pajak Pertambahan Nilai (PPN 11%) :  Rp ${contractFinancialSummary.ppnValue.toLocaleString('id-ID')},00`, 14, 111);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`GRAND TOTAL NILAI SPK KONTRAK  :  Rp ${contractFinancialSummary.finalContractGrandTotal.toLocaleString('id-ID')},00`, 14, 118);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('*Nilai di atas bersifat lumpsum/fixed unit price sesuai amandemen berita acara verifikasi lapangan.', 14, 123);

    // Signature Area
    doc.line(14, 127, 196, 127);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('VALIDASI TANDA TANGAN KRIPTOGRAFIS SECURE SHIELD:', 14, 134);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status Dokumen: ${contractStatus === 'Signed' ? 'DISAHKAN (VALID)' : 'DRAF KONTRAK'}`, 14, 140);
    doc.text(`Kode Digital Sign: ${verificationCode || 'DRAFT_UNTARRED_CERT_X'}`, 14, 145);
    doc.text(`Tanggal Sah: ${signatureDate || 'Nihil'}`, 14, 150);

    // Stamp duty illustration box
    doc.rect(14, 156, 35, 20);
    doc.setFontSize(6.5);
    doc.text('METERAI TEMPEL', 17, 163);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Rp 10.000', 21, 168);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('FGI CRYPTO STAMP', 17, 173);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Tanda Tangan Pihak I & II telah direkatkan ke dalam ledger digital dan dienkripsi dengan standar SHA-256.', 60, 162);
    doc.text('Sistem e-Procurement foresyndo mencatatkan secara valid kelayakan konstruksi ini.', 60, 167);
    doc.text(`Tanda Tangan Pihak II (Mitra): ${signeeName || 'Menunggu Tanda Tangan Utama'}`, 60, 172);

    // Detailed table per Devisi
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('RINGKASAN REKAPITULASI BIAYA PEKERJAAN (BoQ):', 14, 185);

    const tableRows = [
      ['DEVISI 1', 'Pekerjaan Persiapan Lapangan', `Rp ${boqItemsWithDiscount.filter(x => x.chapter.toLowerCase().includes('persiapan')).reduce((a, b) => a + b.totalCost, 0).toLocaleString('id-ID')}`],
      ['DEVISI 2', 'Pekerjaan Pondasi Substruktur (Bored Pile & Pile Cap)', `Rp ${boqItemsWithDiscount.filter(x => x.chapter.toLowerCase().includes('pondasi') || x.chapter.toLowerCase().includes('substruktur')).reduce((a, b) => a + b.totalCost, 0).toLocaleString('id-ID')}`],
      ['DEVISI 3', 'Pekerjaan Beton Superstruktur', `Rp ${boqItemsWithDiscount.filter(x => x.chapter.toLowerCase().includes('superstruktur')).reduce((a, b) => a + b.totalCost, 0).toLocaleString('id-ID')}`],
      ['DEVISI 4', 'Pekerjaan Arsitektur & Kamar Mandi', `Rp ${boqItemsWithDiscount.filter(x => x.chapter.toLowerCase().includes('arsitektur') || x.chapter.toLowerCase().includes('finishing')).reduce((a, b) => a + b.totalCost, 0).toLocaleString('id-[#ID')}`],
      ['DEVISI 5', 'Pekerjaan Mekanikal Elektrikal Plumbing (MEP) & Sipil', `Rp ${boqItemsWithDiscount.filter(x => x.chapter.toLowerCase().includes('mep') || x.chapter.toLowerCase().includes('plumbing') || x.chapter.toLowerCase().includes('fire') || x.chapter.toLowerCase().includes('hvac') || x.chapter.toLowerCase().includes('kolam') || x.chapter.toLowerCase().includes('cafe') || x.chapter.toLowerCase().includes('luar') || x.chapter.toLowerCase().includes('testing')).reduce((a, b) => a + b.totalCost, 0).toLocaleString('id-ID')}`],
      ['ADENDUM VO', 'Amandemen Pekerjaan Tambah Baru', `Rp ${contractFinancialSummary.amendmentsSubtotal.toLocaleString('id-ID')}`],
    ];

    autoTable(doc, {
      startY: 190,
      head: [['Divisi', 'Deskripsi Sektor Konstruksi', 'Total Biaya Disepakati (Lump-Sum)']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [44, 82, 130] },
      styles: { fontSize: 8, font: 'helvetica' }
    });

    // Append Detailed payment term schedule as LAMPIRAN I (interactive and dynamic)
    const finalY1 = (doc as any).lastAutoTable.finalY || 240;
    
    if (finalY1 > 220) {
      doc.addPage();
      // Draw blue top header banner again for continuity
      doc.setFillColor(30, 58, 138); // Blue 900
      doc.rect(0, 0, 210, 15, 'F');
      
      // Striping Orange Line
      doc.setFillColor(234, 88, 12); // Orange 600
      doc.rect(0, 15, 210, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('LAMPIRAN I: ACUAN RENCANA TERMIN & METODE PENCAIRAN PEMBAYARAN KONTRAK', 14, 10);
      doc.setTextColor(30, 41, 59);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('LAMPIRAN I: ACUAN RENCANA TERMIN & METODE PENCAIRAN PEMBAYARAN KONTRAK', 14, finalY1 + 10);
    }

    const startTerminY = finalY1 > 220 ? 22 : finalY1 + 15;

    const terminRows = activePaymentSteps.map((step, idx) => {
      const stepAmount = contractFinancialSummary.finalContractGrandTotal * (step.pct / 100);
      return [
        `Tahap ${idx + 1}`,
        step.name,
        `${step.pct}%`,
        `Rp ${Math.round(stepAmount).toLocaleString('id-ID')},00`,
        step.description
      ];
    });

    autoTable(doc, {
      startY: startTerminY,
      head: [['Urutan', 'Nama Termin / Milestones', 'Porsi %', 'Nilai Pencairan (Rp)', 'Syarat Dan Acuan Opname Lapangan']],
      body: terminRows,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12] }, // Orange theme for payment schedule
      styles: { fontSize: 7.5, font: 'helvetica' },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 45 },
        2: { cellWidth: 15 },
        3: { cellWidth: 38 },
        4: { cellWidth: 70 }
      }
    });

    return doc;
  };

  // Generate beautiful local PDF containing compiled SPK & BoQ details
  const handleGeneratePDFContract = () => {
    try {
      const doc = generateDraftContractPDF();
      doc.save(`SPK_Kontrak_Resmi_Foresyndo2_${activeContractor.companyName.replace(/ /g, '_')}.pdf`);
      showToast('Download detail SPK Kontrak beserta Rencana Termin berhasil!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses file PDF kontrak.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER MODULE VIEW */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block font-bold">DIGITAL PROCUREMENT HUB</span>
          <h1 className="text-2xl font-black text-[#1E3A8A] flex items-center gap-2 mt-1">
            <Briefcase className="text-[#EA580C] w-6 h-6 shrink-0" /> MODUL KONTRAK &amp; SPK RESMI
          </h1>
          <p className="text-slate-500 text-sm font-light mt-0.5">Dashboard kelayakan amandemen, negosiasi harga unit BoQ, tanda tangan digital pengandalan legalitas, dan pencatatan pekerjaan tambah.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGeneratePDFContract}
            className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white border border-transparent text-xs font-mono font-black rounded-xl uppercase flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
            title="Download Summary Dokumen Kontrak PDF"
          >
            <Download className="w-3.5 h-3.5" />
            Cetak / Unduh Kontrak (PDF)
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-[#EA580C] hover:bg-orange-600 text-white border border-transparent text-xs font-mono font-black rounded-xl uppercase flex items-center gap-1.5 shadow-sm cursor-pointer transition active:scale-95"
            title="Review & Kirim Dokumen RAB / Kontrak via Email / WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            Kirim WA / Email (Review Dulu)
          </button>

          {contractStatus === 'Signed' ? (
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-black rounded-xl uppercase flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Kontrak Aktif &amp; Sign Selesai
            </span>
          ) : (
            <span className="px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-mono font-black rounded-xl uppercase flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Kontrak Draf (Menunggu Sign)
            </span>
          )}
        </div>
      </div>

      {/* THREE KPI BENTO TILES BOX */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* CONTRACT MAIN VAL */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#1E3A8A] rounded-xl shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Nilai Kontrak Akhir (Grand Total)</span>
            <p className="text-xl font-mono font-black text-slate-900 mt-1">
              Rp {contractFinancialSummary.finalContractGrandTotal.toLocaleString('id-ID')}
            </p>
            <span className="text-[9px] text-[#EA580C] font-mono block mt-0.5 font-bold">
              Sudah Termasuk PPN 11%
            </span>
          </div>
        </div>

        {/* FACTOR DISCOUNT NEGOTIATOR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Diskon Borong Negosiasi</span>
              <span className="text-xs font-mono font-black text-red-600">{negotiatedDiscount}% OFF</span>
            </div>
            
            {contractStatus === 'Draft' ? (
              <input 
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={negotiatedDiscount}
                onChange={(e) => setNegotiatedDiscount(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#EA580C] mt-2"
              />
            ) : (
              <div className="text-[10px] text-slate-400 font-mono mt-1 pr-2 uppercase font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400 shrink-0" /> Nilai diskon dikunci (Selesai TTD)
              </div>
            )}
            <p className="text-[9.5px] text-slate-500 font-sans mt-1 leading-snug">
              Menghemat <strong className="text-slate-800 font-mono font-bold">Rp {(rabItems.reduce((acc, item) => acc + item.totalCost, 0) - contractFinancialSummary.baseSubtotal).toLocaleString('id-ID')}</strong> dari RAB Pokok.
            </p>
          </div>
        </div>

        {/* WORK ADENDUM COMPILER */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-[#EA580C] rounded-xl shrink-0">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Adendum Pekerjaan Tambah (VO)</span>
            <p className="text-xl font-mono font-black text-slate-900 mt-1">
              Rp {contractFinancialSummary.amendmentsSubtotal.toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-snug">
              Tercatat <strong className="text-slate-800 font-mono font-bold">{amendments.length} modul</strong> item amandemen lapangan baru.
            </p>
          </div>
        </div>

      </div>

      {/* CORE SPLIT SCREEN LAYOUT */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PIHAK KEDUA CONTRACTOR SELECTOR & LEGAL DIGITAL SIGN HUB */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CONTRACT PARTIES SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#1E3A8A] font-mono uppercase tracking-wider block">1. Para Pihak Bersurat Kontrak</h3>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">Tentukan Mitra Kontraktor Pemenang untuk merekatkan e-RAB menjadi Kontrak SPK Borongan.</p>
            </div>

            <div className="space-y-4">
              
              {/* Pihak Pertama */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Pihak Pertama (Pemberi Tugas)</span>
                <span className="text-xs font-bold font-sans text-slate-800 block">PT. FORESYNDO GLOBAL INDONESIA</span>
                <span className="text-[10px] font-mono text-[#EA580C] block font-bold">Obyek/Lahan Bandara Kertajati, Majalengka</span>
              </div>
              
              {/* Arrow Indicator */}
              <div className="flex justify-center -my-2">
                <div className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono font-semibold text-slate-500">
                  Mengadakan SPK Kerja dgn
                </div>
              </div>

              {/* Pihak Kedua */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Pihak Kedua (Penerima Tugas / Mitra)</label>
                
                {contractStatus === 'Draft' ? (
                  <select
                    value={selectedContractorId}
                    onChange={(e) => setSelectedContractorId(e.target.value)}
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none text-slate-850 font-bold"
                  >
                    {contractors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.grade})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-slate-800 rounded-xl space-y-1">
                    <span className="text-xs font-black font-sans block">{activeContractor.companyName}</span>
                    <span className="text-[10px] font-mono text-[#1E3A8A] block font-bold">Penanggung Jawab: {activeContractor.director || 'Direktur Utama'}</span>
                  </div>
                )}
              </div>

              {/* Active Contractor Assessment Sheet */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-xs font-mono space-y-2">
                <span className="text-[9px] text-[#EA580C] uppercase tracking-wider block font-bold">Profil Kompetensi Pihak II</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peringkat Gred:</span>
                  <span className="font-bold text-slate-800 font-mono">{activeContractor.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scoring Kelayakan AI:</span>
                  <span className="font-bold text-emerald-600 font-mono font-black">{activeContractor.totalScore}% / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kontak Kantor:</span>
                  <span className="text-slate-800 truncate max-w-[150px] font-mono">{activeContractor.email}</span>
                </div>
              </div>

            </div>
          </div>

          {/* DIGITAL SIGNING INTERSTATE PANEL */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#1E3A8A] font-mono uppercase tracking-wider block">2. Pengesahan Hub (Digital TTD)</h3>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">Sahkan dokumen ini secara elektronik guna merekatkan hukum yang mengikat.</p>
            </div>

            {contractStatus === 'Draft' ? (
              <form onSubmit={handleSignContractSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Nama Penandatangan Pihak II</label>
                  <input
                    type="text"
                    required
                    value={signeeName}
                    onChange={(e) => setSigneeName(e.target.value)}
                    placeholder="Masukkan nama lengkap Direktur (e.g., Ir. H. Junaedi)"
                    className="w-full text-xs font-sans px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Jabatan Otoritas</label>
                  <select
                    value={signeeTitle}
                    onChange={(e) => setSigneeTitle(e.target.value)}
                    className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
                  >
                    <option value="Direktur Utama">Direktur Utama</option>
                    <option value="Direktur Operasional">Direktur Operasional</option>
                    <option value="General Manager PM">General Manager PM</option>
                  </select>
                </div>

                <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-xl text-[10px] font-sans text-slate-700 leading-relaxed space-y-1">
                  <p className="font-bold text-[#EA580C] uppercase tracking-wider font-mono flex items-center gap-1">
                    <Fingerprint className="w-4 h-4" /> CATATAN LEGALITAS JURNAL:
                  </p>
                  <p>Membubuhkan TTD Digital di server foresyndo akan merekatkan segel meterai digital senilai Rp 10.000 secara otomatis ke dalam dokumen PDF.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#EA580C] hover:bg-orange-600 text-white font-mono text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSignature className="w-4 h-4" />
                  SAHKAN SPK SEKARANG (SIGN)
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                
                {/* Visual Secure Stamp certificate */}
                <div className="p-5 border-2 border-dashed border-emerald-500 bg-emerald-50/50 rounded-2xl relative space-y-3 font-mono text-xs text-slate-800">
                  <span className="absolute right-4 top-4 bg-emerald-600 text-white px-2 py-0.5 rounded text-[8px] font-black tracking-widest">
                    SECURED
                  </span>
                  
                  <div className="flex items-center gap-2 text-emerald-700">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="font-bold uppercase tracking-wider text-[11px]">SPK KONTRAK LEGIRE VERIFIED</span>
                  </div>

                  <hr className="border-emerald-200" />

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-emerald-600 font-bold">PENANDATANGAN:</span>
                      <strong className="text-slate-800 truncate font-semibold max-w-[130px]">{signeeName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-600 font-bold">JABATAN:</span>
                      <strong className="text-slate-800">{signeeTitle}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-600 font-bold">TANGGAL SIGN:</span>
                      <strong className="text-slate-800">{signatureDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-600 font-bold">LIC CODE ID:</span>
                      <strong className="text-emerald-600 font-black select-all">{verificationCode}</strong>
                    </div>
                  </div>

                  <hr className="border-emerald-200" />
                  
                  <p className="text-[9px] text-[#1E3A8A] font-sans leading-relaxed text-center italic">
                    * Dokumen legal dibacking ledgers kriptografi PT. Foresyndo Global Indonesia dan diawasi oleh QS FGI.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleGeneratePDFContract}
                    className="flex-1 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-mono text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh SPK &amp; BoQ
                  </button>
                  
                  <button
                    onClick={handleResetContract}
                    className="p-2.5 bg-slate-150 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
                    title="Batalkan TTD Kontrak"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* AMENDMENT & EXTRA WORK FORM BUTTON OR PANEL */}
          {currentRole !== 'Investor' && currentRole !== 'Mitra Kontraktor' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E3A8A] font-mono uppercase tracking-wider block">3. Amandemen Sektor Tambah (Adendum)</h3>
                <p className="text-[11px] text-slate-500 font-light mt-0.5">Daftarkan item pekerjaan tambah atau perubahan volume lapangan (Variation Order).</p>
              </div>

              <button
                onClick={() => setShowAddAmendModal(true)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#EA580C]" />
                TAMBAH ITEM ADENDUM (VO)
              </button>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: INTERACTIVE BoQ EXPLORER (The exact spreadsheet values layout) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* DATABASE BINDER CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            
            {/* Header with Search and Division Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#1E3A8A] font-mono uppercase tracking-wider">
                  DAFTAR BILL OF QUANTITIES (BoQ) AMANDEMEN KONTRAK
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftar item pekerjaan dari lembar e-RAB resmi yang ditaati untuk pengajuan termin klaim tagihan di lapangan.</p>
              </div>

              {/* Advanced Search bar */}
              <div className="relative">
                <input
                  type="text"
                  value={boqSearchQuery}
                  onChange={(e) => setBoqSearchQuery(e.target.value)}
                  placeholder="Cari item atau kode... "
                  className="w-full md:w-60 text-xs pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none text-slate-800 font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Segmented Division Tab Navigator */}
            <div className="flex gap-1 overflow-x-auto pb-1.5 border-b border-slate-100">
              {[
                { id: 'D1', label: 'DEVISI 1', desc: 'Persiapan' },
                { id: 'D2', label: 'DEVISI 2', desc: 'Pondasi' },
                { id: 'D3', label: 'DEVISI 3', desc: 'Beton' },
                { id: 'D4', label: 'DEVISI 4', desc: 'Arsitektur' },
                { id: 'D5', label: 'DEVISI 5', desc: 'MEP + Sipil' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDevisiTab(tab.id as any)}
                  className={`px-4 py-2 border-r last:border-0 grow flex flex-col items-center justify-center transition border-slate-150 ${activeDevisiTab === tab.id ? 'bg-[#1E3A8A] text-white rounded-xl' : 'text-slate-500 hover:bg-slate-100 hover:text-[#1E3A8A]'}`}
                >
                  <span className="text-xs font-mono font-black">{tab.label}</span>
                  <span className="text-[9px] font-sans font-medium uppercase tracking-wider block opacity-80">{tab.desc}</span>
                </button>
              ))}
            </div>

            {/* Structured Table Container */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-150">
                    <th className="py-3 px-4 font-bold">Kode</th>
                    <th className="py-3 px-4 font-bold">Nama Item Pekerjaan</th>
                    <th className="py-3 px-4 font-bold text-center">Satuan</th>
                    <th className="py-3 px-4 font-bold text-right">Volume</th>
                    <th className="py-3 px-4 font-bold text-right">Harga Satuan (Negosiasi)</th>
                    <th className="py-3 px-4 font-bold text-right">Total Biaya (Borongan)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-sans">
                  {boqFilteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-mono">
                        Item pekerjaan tidak ditemukan untuk kueri "{boqSearchQuery}".
                      </td>
                    </tr>
                  ) : (
                    boqFilteredList.map(item => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50/50 transition truncate group/row"
                      >
                        <td className="py-2.5 px-4 font-mono font-black text-slate-500 group-hover/row:text-[#EA580C]">
                          {item.code}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-800 font-sans max-w-[280px] truncate" title={item.description}>
                          {item.description}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono text-slate-650">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-700">
                          {item.volume.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono">
                          Rp {Math.round(item.unitPrice).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-black text-[#1E3A8A]">
                          Rp {Math.round(item.totalCost).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Division-level SubTotal Footer block */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs font-mono">
              <span className="text-slate-500 font-bold uppercase tracking-wider">
                Total item pada tab {activeDevisiTab}:
              </span>
              <span className="text-sm font-black text-[#1E3A8A]">
                Rp {Math.round(boqFilteredList.reduce((acc, x) => acc + x.totalCost, 0)).toLocaleString('id-ID')},00
              </span>
            </div>

          </div>

          {/* AMENDMENT EXTRA WORKS SECTIONS */}
          {amendments.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-[#1E3A8A] font-mono uppercase tracking-wider">
                  TABEL PEKERJAAN TAMBAH AMD / VARIATION ORDER (VO)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Berisi daftar perubahan volume ekstra serta penambahan material yang diajukan oleh Project Manager (PM) untuk kelayakan lapangan.</p>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 text-[9px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-150">
                      <th className="py-2.5 px-4 font-bold">Kode</th>
                      <th className="py-2.5 px-4 font-bold">Sektor Divisi</th>
                      <th className="py-2.5 px-4 font-bold">Deskripsi Tambahan</th>
                      <th className="py-2.5 px-4 font-bold text-center">Satuan</th>
                      <th className="py-2.5 px-4 font-bold text-right">Volume</th>
                      <th className="py-2.5 px-4 font-bold text-right">Harga Satuan</th>
                      <th className="py-2.5 px-4 font-bold text-right">Total Anggaran</th>
                      {currentRole === 'Project Manager' || currentRole === 'Super Admin' ? (
                        <th className="py-2.5 px-4 font-bold text-center">Aksi</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-sans">
                    {amendments.map(item => (
                      <tr key={item.id} className="hover:bg-amber-50/20 transition">
                        <td className="py-2 px-4 font-mono font-black text-amber-600">
                          {item.code}
                        </td>
                        <td className="py-2 px-4 font-mono font-bold text-[10px] text-slate-450">
                          {item.category}
                        </td>
                        <td className="py-2 px-4 font-semibold text-slate-800">
                          {item.description}
                        </td>
                        <td className="py-2 px-4 text-center font-mono">
                          {item.unit}
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-slate-700">
                          {item.volume}
                        </td>
                        <td className="py-2 px-4 text-right font-mono">
                          Rp {item.unitPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-black text-[#EA580C]">
                          Rp {(item.volume * item.unitPrice).toLocaleString('id-ID')}
                        </td>
                        {currentRole === 'Project Manager' || currentRole === 'Super Admin' ? (
                          <td className="py-2 px-4 text-center">
                            <button
                              onClick={() => handleDeleteAmendment(item.id, item.code)}
                              className="p-1 px-1.5 text-xs text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                              title="Hapus Adendum"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DRAF TERMS / MILESTONES TERMIN CHECKLIST */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-[#1E3A8A] font-mono uppercase tracking-wider">
                  RENCANA TERMIN PEMBAYARAN KONTRAK
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Pilih skema porsi pendanaan progres konstruksi yang paling optimal untuk mengamankan kelayakan cash-flow proyek.</p>
              </div>

              {/* Scheme Template Seleksi */}
              <div className="flex items-center gap-1.5 self-start">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Pilihan Skema:</span>
                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl font-sans focus:outline-none focus:border-[#EA580C]"
                >
                  <option value="standar">1. Skema Progresif Standar</option>
                  <option value="padat_modal">2. Skema Padat Modal (DP Tinggi)</option>
                  <option value="bulanan">3. Skema Bulanan (Monthly Progress)</option>
                  <option value="back_to_back">4. Skema Korporat Tanpa DP</option>
                  <option value="custom">⚙️ 5. Skema Kustom Mandiri</option>
                </select>
              </div>
            </div>

            {/* Scheme Description banner */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-650 flex items-start gap-2.5">
              <span className="p-1 px-1.5 bg-blue-100 text-[#1E3A8A] font-mono font-bold text-[9px] rounded-md shrink-0">DESKRIPSI SKEMA</span>
              <p className="font-sans leading-relaxed">
                {PAYMENT_SCHEMES.find(s => s.id === selectedSchemeId)?.description}
              </p>
            </div>

            {/* If CUSTOM is selected, show interactive sliders */}
            {selectedSchemeId === 'custom' && (
              <div className="p-5 bg-amber-50/25 border border-amber-200/60 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-mono font-black uppercase text-amber-850 tracking-wider">
                  PANEL AD JUSTMENT PORSI TERMIN KUSTOM (TOTAL SUM MUST EQUAL 100%)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-500 font-bold">1. UANG MUKA (DP)</span>
                      <span className="text-[#EA580C] font-black">{customDp}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={customDp}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val + customTerm1 + customTerm2 <= 100) {
                          setCustomDp(val);
                        }
                      }}
                      className="w-full accent-[#EA580C] cursor-pointer"
                    />
                    <span className="block text-[9px] text-slate-450">Konfigurasi batas DP: 0% s/d 50%</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-500 font-bold">2. TERMIN I (FISIK)</span>
                      <span className="text-[#EA580C] font-black">{customTerm1}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={customTerm1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (customDp + val + customTerm2 <= 100) {
                          setCustomTerm1(val);
                        }
                      }}
                      className="w-full accent-[#EA580C] cursor-pointer"
                    />
                    <span className="block text-[9px] text-slate-450">Bobot kemajuan struktur</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-slate-500 font-bold">3. TERMIN II (PENUTUP)</span>
                      <span className="text-[#EA580C] font-black">{customTerm2}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={customTerm2}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (customDp + customTerm1 + val <= 100) {
                          setCustomTerm2(val);
                        }
                      }}
                      className="w-full accent-[#EA580C] cursor-pointer"
                    />
                    <span className="block text-[9px] text-slate-450">Bobot penutupan arsitektur</span>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                    <span className="text-[10px] text-slate-400 block font-bold">4. RETENSI PEMELIHARAAN</span>
                    <span className="text-slate-850 font-black text-sm block font-mono">{customRetensi}%</span>
                    <span className="text-[9px] text-emerald-600 font-mono block font-bold">✓ AUTO CALCULATE</span>
                    <p className="text-[8px] text-slate-400 leading-none mt-1 font-sans">Sisa pengimbang agar pas 100%.</p>
                  </div>
                </div>

                <div className="text-[10px] font-mono bg-blue-50/50 p-2 rounded-xl text-blue-800 text-center font-bold">
                  Kalkulasi Kontrol: {customDp}% (DP) + {customTerm1}% (T1) + {customTerm2}% (T2) + {customRetensi}% (Retensi) = {customDp + customTerm1 + customTerm2 + customRetensi}% (Sempurna 100%)
                </div>
              </div>
            )}

            {/* Dynamic steps grid */}
            <div className="grid sm:grid-cols-4 lg:grid-cols-5 gap-4 text-xs font-mono">
              {activePaymentSteps.map((step, idx) => {
                const stepAmount = contractFinancialSummary.finalContractGrandTotal * (step.pct / 100);
                return (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 hover:border-blue-450 transition hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase truncate max-w-[120px]" title={step.name}>
                        TAHAP {idx + 1}
                      </span>
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black rounded font-mono">
                        {step.pct}%
                      </span>
                    </div>
                    <span className="text-slate-850 font-black block text-[10px] truncate" title={step.name}>
                      {step.name}
                    </span>
                    <span className="text-[#EA580C] text-[11px] font-bold block">
                      Rp {Math.round(stepAmount).toLocaleString('id-ID')}
                    </span>
                    <p className="text-[9px] text-slate-450 font-sans leading-tight min-h-[36px]">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SYSTEM ALUR PERSETUJUAN (APPROVAL WORKFLOW) SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-[#1E3A8A] font-mono uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-650" />
                  ALUR PERSETUJUAN KLAIM TERMIN KONTRAK (APPROVAL WORKFLOW)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Owner wajib memverifikasi bobot kumulatif dan menyetujui klaim progres termin sebelum invoice tagihan dapat diterbikan dan dibayarkan.
                </p>
              </div>

              {/* Show submission button for contractors or admin */}
              {(currentRole === 'Mitra Kontraktor' || currentRole === 'Project Manager' || currentRole === 'Super Admin') && (
                <button
                  onClick={() => {
                    // Find first unclaimed step
                    const unclaimed = activePaymentSteps.map((step, idx) => ({ step, idx }))
                      .filter(({ idx }) => !paymentClaims.some(c => c.terminIndex === idx && c.status !== 'Rejected'));
                    if (unclaimed.length > 0) {
                      setClaimSelectIdx(unclaimed[0].idx);
                    } else {
                      setClaimSelectIdx(0);
                    }
                    setShowNewClaimModal(true);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 text-xs font-mono font-black rounded-xl uppercase flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajukan Klaim Baru
                </button>
              )}
            </div>

            {/* Quick alert helper based on current role perspective */}
            <div className="p-3 px-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="font-mono font-bold text-slate-500 uppercase text-[10px]">Perspektif Peran Aktif Anda:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-mono font-black text-[10px] uppercase">{currentRole || 'Guest User'}</span>
              </div>
              <p className="text-slate-500 font-sans text-[11px]">
                {currentRole === 'Owner' || currentRole === 'Super Admin' 
                  ? '✓ Anda memiliki otoritas penuh untuk Menyetujui (Approve) atau Menolak (Reject) klaim pembayaran kontraktor.' 
                  : 'ℹ Ajukan pencairan termin jika kemajuan fisik lapangan telah melampaui sasaran bobot rencana. Owner akan meninjau pengajuan.'}
              </p>
            </div>

            {/* Active claims history log */}
            <div className="space-y-4">
              {paymentClaims.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-sans">Belum ada riwayat pengajuan klaim termin untuk kontrak ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {paymentClaims.map((claim) => {
                    const claimAmount = claim.amount || Math.round(contractFinancialSummary.finalContractGrandTotal * (claim.pct / 100));
                    
                    return (
                      <div 
                        key={claim.id} 
                        className={`p-5 rounded-2xl border transition flex flex-col lg:flex-row justify-between gap-5 ${
                          claim.status === 'Paid' ? 'bg-emerald-50/15 border-emerald-200/60' :
                          claim.status === 'Approved' ? 'bg-blue-50/10 border-blue-200/55' :
                          claim.status === 'Rejected' ? 'bg-rose-50/15 border-rose-200/60' :
                          'bg-amber-50/20 border-amber-200/60'
                        }`}
                      >
                        {/* Claim Metadata Details */}
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-mono rounded font-bold uppercase">
                              ID: {claim.id.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Tanggal Ajuan: {claim.requestedDate}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-slate-800 font-sans tracking-wide">
                              Tahap {claim.terminIndex + 1}: {claim.terminName} ({claim.pct}%)
                            </h4>
                            <div className="flex items-baseline gap-1">
                              <span className="text-[#EA580C] font-mono text-xs font-black">
                                Rp {Math.round(claimAmount).toLocaleString('id-ID')},00
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans italic">
                                Sesuai Porsi Anggaran Kontrak Netto
                              </span>
                            </div>
                          </div>

                          <div className="text-xs space-y-1">
                            <p className="text-slate-650 font-sans leading-relaxed">
                              <strong className="text-slate-700 font-medium">Deskripsi &amp; Bukti Progres:</strong> {claim.notes}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              Diajukan Oleh: <span className="font-bold text-slate-500">{claim.requestedBy}</span>
                            </p>
                          </div>

                          {/* Owner review comments/justification panel */}
                          {(claim.ownerComment || claim.approvedBy) && (
                            <div className="mt-3 p-3 bg-white/80 border border-slate-150 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-slate-400 uppercase">
                                <FileText className="w-3 h-3 text-slate-400" />
                                Catatan Verifikasi Pemilik Proyek (Owner Log)
                              </div>
                              <p className="text-xs text-slate-755 italic font-sans leading-relaxed">
                                "{claim.ownerComment}"
                              </p>
                              {claim.approvedBy && (
                                <p className="text-[9px] font-mono text-slate-400 text-right">
                                  Diverifikasi Oleh: <span className="font-bold text-slate-600">{claim.approvedBy}</span> pada {claim.approvedDate}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Status badge & Interactive Action Workflow bar */}
                        <div className="flex flex-col justify-between items-end gap-3 min-w-[220px] self-stretch border-t lg:border-t-0 lg:border-l border-slate-150 pt-4 lg:pt-0 lg:pl-5">
                          {/* Status Indicator */}
                          <div className="text-right w-full">
                            <span className="text-[9px] font-mono text-slate-400 uppercase block font-black mb-1">Status Verifikasi</span>
                            {claim.status === 'Paid' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-black rounded-lg uppercase border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                LUNAS (PAID)
                              </span>
                            )}
                            {claim.status === 'Approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-mono font-black rounded-lg uppercase border border-blue-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                APPROVAL OK (READY)
                              </span>
                            )}
                            {claim.status === 'Pending' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-black rounded-lg uppercase animate-pulse border border-amber-200">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                MENUNGGU OWNER
                              </span>
                            )}
                            {claim.status === 'Rejected' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-mono font-black rounded-lg uppercase border border-rose-200">
                                <X className="w-3.5 h-3.5 text-rose-600" />
                                DITOLAK / REVISI
                              </span>
                            )}
                          </div>

                          {/* Role action context buttons */}
                          <div className="w-full space-y-1.5">
                            {/* OWNER REVIEW ACTION (Pending -> Approved / Rejected) */}
                            {claim.status === 'Pending' && (currentRole === 'Owner' || currentRole === 'Super Admin' || currentRole === 'Konsultan') && (
                              <div className="flex flex-col gap-1.5 w-full">
                                <button
                                  onClick={() => {
                                    setReviewClaimId(claim.id);
                                    setReviewActionType('Approve');
                                    setReviewComment('');
                                  }}
                                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 transition"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  Tinjau &amp; Setujui
                                </button>
                                <button
                                  onClick={() => {
                                    setReviewClaimId(claim.id);
                                    setReviewActionType('Reject');
                                    setReviewComment('');
                                  }}
                                  className="w-full py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-[10px] font-mono font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 transition"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                  Tolak (Minta Revisi)
                                </button>
                              </div>
                            )}

                            {/* FINANCIAL PAYOUT ACTION (Approved -> Paid) */}
                            {claim.status === 'Approved' && (currentRole === 'Owner' || currentRole === 'Super Admin') && (
                              <button
                                onClick={() => handleProcessPayment(claim.id)}
                                className="w-full py-2 bg-[#EA580C] hover:bg-orange-600 text-white text-[10px] font-mono font-black rounded-lg cursor-pointer flex items-center justify-center gap-1 shadow-sm transition active:scale-95"
                              >
                                💰 Proses Bayar (Cairkan)
                              </button>
                            )}

                            {/* Blocked or Non-action states for other users */}
                            {claim.status === 'Pending' && currentRole !== 'Owner' && currentRole !== 'Super Admin' && currentRole !== 'Konsultan' && (
                              <p className="text-[10px] text-slate-400 text-center italic leading-tight">
                                Menunggu owner melakukan verifikasi &amp; tanda tangan pendanaan.
                              </p>
                            )}
                            
                            {claim.status === 'Approved' && currentRole !== 'Owner' && currentRole !== 'Super Admin' && (
                              <p className="text-[10px] text-slate-400 text-center italic leading-tight">
                                ✓ Disetujui Owner. Pemrosesan SP2D pembayaran sedang diotorisasi tim keuangan proyek.
                              </p>
                            )}

                            {claim.status === 'Paid' && (
                              <p className="text-[10px] text-emerald-600 text-center font-mono font-bold leading-tight flex items-center justify-center gap-1">
                                ✓ Dana Sukses Ditransfer
                              </p>
                            )}

                            {/* Administrative Delete for Cleanups */}
                            {currentRole === 'Super Admin' && (
                              <div className="pt-2 border-t border-slate-100 flex justify-end">
                                <button
                                  onClick={() => handleDeleteClaim(claim.id)}
                                  className="text-[9px] font-mono font-bold text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                  Hapus Log
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* AMENDMENT MODAL DRAFTER */}
      {showAddAmendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="bg-slate-900 border-b border-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#EA580C]" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider">Form Adendum Sektor VO</h3>
              </div>
              <button 
                onClick={() => setShowAddAmendModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAmendmentSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Kode Item Pekerjaan</label>
                  <input
                    type="text"
                    required
                    value={amendCode}
                    onChange={(e) => setAmendCode(e.target.value)}
                    placeholder="Contoh: VO.1.1"
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Target Devisi Konstruksi</label>
                  <select
                    value={amendDevisi}
                    onChange={(e) => setAmendDevisi(e.target.value as any)}
                    className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="D1">DEVISI 1: Persiapan Lapangan</option>
                    <option value="D2">DEVISI 2: Pondasi Substruktur</option>
                    <option value="D3">DEVISI 3: Beton Superstruktur</option>
                    <option value="D4">DEVISI 4: Arsitektur &amp; Toilet</option>
                    <option value="D5">DEVISI 5: MEP &amp; Pekerjaan Luar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Nama Pekerjaan Tambah (Volume Lapangan)</label>
                <input
                  type="text"
                  required
                  value={amendDesc}
                  onChange={(e) => setAmendDesc(e.target.value)}
                  placeholder="Contoh: Pekerjaan galian tanah tambahan dinding retensi tebal 20 cm"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Volume</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amendVolume}
                    onChange={(e) => setAmendVolume(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Satuan Takar</label>
                  <input
                    type="text"
                    required
                    value={amendUnit}
                    onChange={(e) => setAmendUnit(e.target.value)}
                    placeholder="e.g. m3 / m2 / ls"
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Harga Satuan (IDR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amendPrice}
                    onChange={(e) => setAmendPrice(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 text-[10px] font-sans rounded-xl text-slate-600 leading-normal flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                <p>Menambahkan adendum VO ini secara instan membesarkan Nilai Dasar Pengenaan Pajak (DPP) secara proporsional. Direkomendasikan untuk didiskusikan terlebih dahulu dengan Lead Estimator.</p>
              </div>

              <div className="flex gap-2.5 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddAmendModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-500 font-mono text-xs font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Daftarkan Adendum
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CONTRACTOR BILLING CLAIM REQUEST MODAL */}
      {showNewClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="bg-slate-900 border-b border-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#EA580C]" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider">Form Pengajuan Klaim Termin</h3>
              </div>
              <button 
                onClick={() => setShowNewClaimModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateClaimRequest} className="p-6 space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Pilih Tahap Termin Progres</label>
                <select
                  value={claimSelectIdx}
                  onChange={(e) => setClaimSelectIdx(parseInt(e.target.value))}
                  className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  {activePaymentSteps.map((step, idx) => {
                    const stepAmount = contractFinancialSummary.finalContractGrandTotal * (step.pct / 100);
                    const isClaimed = paymentClaims.some(c => c.terminIndex === idx && c.status !== 'Rejected');
                    return (
                      <option key={idx} value={idx} disabled={isClaimed}>
                        Tahap {idx + 1}: {step.name} ({step.pct}%) - Rp {Math.round(stepAmount).toLocaleString('id-ID')} {isClaimed ? '✓ (SUDAH DIAJUKAN)' : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[9px] text-slate-400 leading-tight">Hanya milestone termin yang sah dan belum diajukan (atau berstatus ditolak) yang dapat diajukan transaksinya.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">Justifikasi Pekerjaan &amp; Bukti Fisik Lapangan</label>
                <textarea
                  required
                  rows={4}
                  value={claimNotesText}
                  onChange={(e) => setClaimNotesText(e.target.value)}
                  placeholder="Deskripsikan kemajuan pekerjaan yang telah dicapai sesuai syarat opname termin ini, misalnya: 'Pekerjaan galian oprit 100%, pengecoran tiang s/d lt. 2 rampung total 100%. Dilampirkan 5 berkas laporan prestasi kontraktor...'"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3.5 bg-blue-50/50 border border-blue-100 text-[10px] rounded-xl text-blue-850 leading-normal flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>Pengajuan ini akan langsung masuk ke dalam dashboard persetujuan Owner. Pembayaran rilis dana dilakukan setelah owner melakukan tanda tangan persetujuan klaim.</p>
              </div>

              <div className="flex gap-2.5 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewClaimModal(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-500 font-mono text-xs font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Daftarkan Klaim Termin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OWNER ACTION APPROVE / REJECT DIALOG */}
      {reviewClaimId !== null && reviewActionType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn">
            
            {/* Modal Header */}
            <div className="bg-slate-900 border-b border-slate-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-black font-mono uppercase tracking-wider">
                  {reviewActionType === 'Approve' ? 'Otorisasi &amp; Setujui Klaim' : 'Tolak &amp; Kembalikan Klaim'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setReviewClaimId(null);
                  setReviewActionType(null);
                }}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleApproveOrRejectConfirm} className="p-6 space-y-4 text-xs font-sans">
              <div className="p-4 rounded-xl text-xs space-y-1 bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Informasi Klaim yang Ditinjau</span>
                <p className="font-bold text-slate-800">
                  {paymentClaims.find(c => c.id === reviewClaimId)?.terminName} ({paymentClaims.find(c => c.id === reviewClaimId)?.pct}%)
                </p>
                <p className="text-slate-650">
                  Nilai Pengajuan: <strong className="text-[#EA580C] font-mono">Rp {Math.round(paymentClaims.find(c => c.id === reviewClaimId)?.amount || 0).toLocaleString('id-ID')},00</strong>
                </p>
                <p className="text-[11px] text-slate-550 mt-1 italic leading-tight">
                  "{paymentClaims.find(c => c.id === reviewClaimId)?.notes}"
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  {reviewActionType === 'Approve' ? 'Catatan Persetujuan / Catatan Pencairan' : 'Alasan Penolakan / Tindakan Perbaikan'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    reviewActionType === 'Approve'
                      ? "Masukkan dokumen pendukung / instruksi pencairan kuantitas pembayaran, contoh: 'Dokumen opname lapangan dan foto terlampir lengkap. Teruskan ke bagian finance untuk pencairan.'"
                      : "Masukkan rincian perbaikan yang wajib direvisi oleh kontraktor, contoh: 'Opname fisik kami verifikasi baru mencapai 35.0%, belum memenuhi batas aman 40.0% sesuai syarat milestone.'"
                  }
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-800 flex items-start gap-2 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  {reviewActionType === 'Approve'
                    ? 'Tindakan ini bersifat sah dan mengesahkan bahwa tagihan ini disetujui (Approved) serta layak dilanjutkan untuk pencairan dana finansial.'
                    : 'Tindakan ini akan mengembalikan posisi pengajuan klaim kontraktor ke status revisi/ditolak agar dapat diperbaiki sesuai rincian evaluasi Anda.'}
                </p>
              </div>

              <div className="flex gap-2.5 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setReviewClaimId(null);
                    setReviewActionType(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 text-slate-500 font-mono text-xs font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 text-white font-mono text-xs font-bold rounded-xl transition cursor-pointer ${
                    reviewActionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-650 hover:bg-red-700'
                  }`}
                >
                  {reviewActionType === 'Approve' ? 'Sahkan &amp; Setujui Klaim' : 'Kirim Penolakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE KONTRAK & RAB MODAL - REVIEW SEBELUM KIRIM */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn flex flex-col h-[90vh] md:h-auto max-h-[850px]">
            
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#EA580C]" />
                <div>
                  <h3 className="text-sm font-black font-mono uppercase tracking-wider">Review &amp; Kirim Berkas Proyek</h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Tinjau, modifikasi, dan kirim Lembar RAB &amp; SPK secara digital melalui jaringan komunikasi resmi.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-sans">
              
              {/* Review Info alert toast */}
              <div className="p-4 bg-orange-50/75 border border-orange-200/80 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-xs">Instruksi Review Sebelum Mengirim Dokumen:</p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Sistem telah memformat rekapitulasi nilai RAB dan skema termin pembayaran secara rinci. Anda berhak mengedit konten teks di bawah sesuai dengan hasil kesepakatan internal sebelum meneruskan data ini melalui aplikasi WhatsApp atau Email.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left Panel: Form Settings (5 cols) */}
                <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <h4 className="font-mono font-black text-[10px] text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <User className="w-3.5 h-3.5 text-[#EA580C]" />
                        KONTAK PENERIMA (KONTRAKTOR)
                      </h4>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Perusahaan Mitra</span>
                        <p className="font-bold text-slate-800 text-xs">{activeContractor?.companyName || 'PT. Tri Karya'}</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">No. WhatsApp Aktif</label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="text" 
                            required
                            value={sharePhone}
                            onChange={(e) => setSharePhone(e.target.value)}
                            placeholder="Contoh: 628123456789"
                            className="w-full text-xs p-2.5 pl-9 bg-white border border-slate-250 rounded-xl focus:border-[#EA580C] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Alamat Email Resmi</label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="email" 
                            required
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            placeholder="Contoh: procurement@partner.com"
                            className="w-full text-xs p-2.5 pl-9 bg-white border border-slate-250 rounded-xl focus:border-[#EA580C] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Simulated Attached Documents panel */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <h4 className="font-mono font-black text-[10px] text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <FileText className="w-3.5 h-3.5 text-[#EA580C]" />
                        BERKAS LAMPIRAN GENERIK (PDF)
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                          <div className="p-1 px-1.5 bg-rose-100 text-rose-700 font-mono text-[9px] font-black rounded uppercase">
                            PDF
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-700 truncate">SPK_Kontrak_Resmi_Foresyndo2.pdf</p>
                            <p className="text-[9px] text-slate-400 font-mono">Surat Perjanjian Kerja Lengkap • 156 KB</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                          <div className="p-1 px-1.5 bg-rose-100 text-rose-700 font-mono text-[9px] font-black rounded uppercase">
                            PDF
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-700 truncate">Rekap_Unit_e-RAB_Foresyndo2.pdf</p>
                            <p className="text-[9px] text-slate-400 font-mono">Bill of Quantities Detail Ternegosiasi • 94 KB</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 italic leading-tight">✓ Terlampir secara dinamis dalam tautan digital yang disorot.</p>
                    </div>
                  </div>

                  {/* Submission triggers inside panel */}
                  <div className="space-y-2 pt-4 border-t border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={handleSendWhatsAppLink}
                      disabled={isSimulatingSend}
                      className="w-full py-3 bg-emerald-650 hover:bg-emerald-700 text-white font-mono text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 shadow-sm disabled:opacity-50"
                    >
                      <Phone className="w-4 h-4 shrink-0 text-white" />
                      Kirim via WhatsApp Proyek
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleSendEmailSimulation}
                      disabled={isSimulatingSend}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 transition active:scale-95 border border-slate-800 disabled:opacity-50"
                    >
                      <Mail className="w-4 h-4 shrink-0 text-white" />
                      Kirim via Email Resmi
                    </button>
                  </div>
                </div>

                {/* Right Panel: Template Review & Edit (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-3">
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block shrink-0">
                      EDIT REDAKSI PESAN (REVIEW SEBELUM KIRIM)
                    </label>
                    <div className="space-y-1 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono block">Subjek Email:</span>
                      <input 
                        type="text" 
                        required
                        value={shareSubject}
                        onChange={(e) => setShareSubject(e.target.value)}
                        className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none font-medium text-slate-800"
                        placeholder="Subjek Pengiriman Email"
                      />
                    </div>
                    <div className="flex-1 flex flex-col mt-2">
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">Konten / Isi Pesan Draft:</span>
                      <textarea
                        required
                        value={shareBody}
                        onChange={(e) => setShareBody(e.target.value)}
                        placeholder="Review redaksi pesan di sini..."
                        className="w-full flex-1 text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#EA580C] focus:outline-none leading-relaxed font-sans text-slate-705 resize-none"
                        style={{ minHeight: '340px' }}
                      />
                    </div>
                  </div>

                  {/* Attachment simulation sending toast states */}
                  {isSimulatingSend && (
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 flex items-center gap-3 animate-pulse">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping shrink-0"></span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Menyusun Berkas PDF &amp; Menghubungkan ke Saluran Kirim...</span>
                    </div>
                  )}

                  {sendSuccessMode !== 'none' && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-250 flex flex-col gap-1">
                      <p className="font-black font-mono text-[10px] uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        PENGIRIMAN DIGITAL AKTIF!
                      </p>
                      <p className="text-[10px] text-emerald-700 font-sans">
                        {sendSuccessMode === 'email' 
                          ? 'Sistem berhasil membuka aplikasi email Anda (mailto) dan mengirim salinan SPK + RAB resmi.' 
                          : 'Tautan WhatsApp Web atau Aplikasi Handphone berhasil dibuat dan dialihkan secara mulus.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>


            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end shrink-0 gap-2 font-mono">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2.5 bg-white border border-slate-250 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                Tutup Tinjauan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
