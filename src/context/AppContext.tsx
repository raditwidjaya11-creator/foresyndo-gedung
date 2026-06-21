import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  AccountCredential,
  ProgressItem,
  ProjectDoc,
  ProjectStats,
  ContractorProfile,
  TenderPackage,
  BidSubmission,
  AppNotification,
  WeeklyChartData,
  MonthlyCashFlow,
  InvestmentMetrics,
  ExperienceItem,
  DrawingFile,
  DrawingComment,
  FormalDocument
} from '../types';
import { RAB_METADATA, rabItems } from '../data/rabData';
import { INITIAL_DRAWINGS } from '../data/drawingData';
import { INITIAL_FORMAL_DOCUMENTS } from '../data/formalDocsData';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  changeUserRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Accounts Management (Editable exclusively by Super Admin)
  accounts: AccountCredential[];
  updateAccount: (role: UserRole, email: string, password: string, representative?: string) => void;
  addAccount: (account: AccountCredential) => void;
  deleteAccount: (email: string) => void;
  
  // Collections/State
  projectStats: ProjectStats;
  updateProjectStats: (stats: Partial<ProjectStats>) => void;
  
  progressItems: ProgressItem[];
  updateProgressItem: (id: string, percent: number, status: ProgressItem['status']) => void;
  
  projectDocs: ProjectDoc[];
  addProjectDoc: (doc: Omit<ProjectDoc, 'id'>) => void;
  deleteProjectDoc: (id: string) => void;

  // New Drawing Files states
  drawingFiles: DrawingFile[];
  addDrawingComment: (drawingId: string, pageNumber: number, text: string, pin?: { x: number; y: number }) => void;
  addDrawingFile: (fileName: string, totalPage: number, pages: any[]) => void;

  // New Formal Documents states
  formalDocuments: FormalDocument[];
  addFormalDocument: (fileName: string, category: FormalDocument['category'], size: string, permissions: UserRole[]) => void;
  deleteFormalDocument: (id: string) => void;
  toggleFormalDocShare: (id: string) => void;
  
  contractors: ContractorProfile[];
  registerContractor: (profile: Omit<ContractorProfile, 'id' | 'legalScore' | 'experienceScore' | 'financeScore' | 'hrScore' | 'totalScore' | 'grade' | 'status' | 'verificationStatus' | 'submittedAt'>) => ContractorProfile;
  updateContractorStatus: (id: string, status: ContractorProfile['verificationStatus']) => void;
  addContractorExperience: (contractorId: string, exp: Omit<ExperienceItem, 'id'>) => void;
  
  tenders: TenderPackage[];
  addTender: (tender: Omit<TenderPackage, 'id'>) => void;
  updateTenderStatus: (id: string, status: TenderPackage['status']) => void;
  
  bids: BidSubmission[];
  submitBid: (bid: Omit<BidSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  updateBidStatus: (id: string, status: BidSubmission['status']) => void;
  
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Analytics
  weeklyData: WeeklyChartData[];
  monthlyCashflow: MonthlyCashFlow[];
  investmentMetrics: InvestmentMetrics;
  setInvestmentMetrics: React.Dispatch<React.SetStateAction<InvestmentMetrics>>;
  
  // Reports Utility
  generateReport: (category: 'progress' | 'cashflow' | 'investor' | 'mitra' | 'tender') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_ACCOUNTS: AccountCredential[] = [
  {
    role: 'Owner',
    title: 'Direksi Owner PT. FGI',
    representative: 'PT. Foresyndo Global Indonesia',
    email: 'owner@foresyndo.co.id',
    password: 'owner2026',
  },
  {
    role: 'Super Admin',
    title: 'Super Admin (Lead Auditor)',
    representative: 'Radit Widjaya',
    email: 'raditwidjaya11@gmail.com',
    password: 'admin2026',
  },
  {
    role: 'Project Manager',
    title: 'Project Manager (PM Lapangan)',
    representative: 'Budi Santoso',
    email: 'pm.majalengka@foresyndo.com',
    password: 'pm2026',
  },
  {
    role: 'Konsultan',
    title: 'Konsultan Pengawas',
    representative: 'ArchiPlan Specialist',
    email: 'consultant@archiplan.co.id',
    password: 'consultant2026',
  },
  {
    role: 'Investor',
    title: 'Investor FORESYNDO 2',
    representative: 'H. Sulaiman',
    email: 'investor_utama@capitalinfo.com',
    password: 'investor2026',
  },
  {
    role: 'Mitra Kontraktor',
    title: 'Mitra Kontraktor / Vendor',
    representative: 'PT. Karya Sejahtera Abadi',
    email: 'kontraktor@karyasejahtera.com',
    password: 'kontraktor2026',
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current simulating role and user Info
  const [currentRole, setCurrentRole] = useState<UserRole>('Owner');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('landing');

  // Accounts state with local storage cache persistence
  const [accounts, setAccounts] = useState<AccountCredential[]>(() => {
    const cached = localStorage.getItem('sppi_accounts');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Error parsing accounts from localStorage:', e);
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem('sppi_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const updateAccount = (role: UserRole, email: string, password: string, representative?: string) => {
    setAccounts(prev => prev.map(acc => {
      const matchRep = representative ? acc.representative === representative : true;
      if (acc.role === role && matchRep) {
        return { ...acc, email, password };
      }
      return acc;
    }));
  };

  const addAccount = (account: AccountCredential) => {
    setAccounts(prev => {
      if (prev.some(acc => acc.email.toLowerCase() === account.email.toLowerCase())) {
        return prev;
      }
      return [...prev, account];
    });
  };

  const deleteAccount = (email: string) => {
    setAccounts(prev => prev.filter(acc => acc.email.toLowerCase() !== email.toLowerCase()));
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const changeUserRole = (role: UserRole) => {
    setCurrentRole(role);
    const matchedAccount = accounts.find(a => a.role === role);
    let email = matchedAccount ? matchedAccount.email : 'user@examples.com';
    let displayName = matchedAccount ? matchedAccount.representative : 'User Account';
    let companyName: string | undefined = undefined;

    if (role === 'Mitra Kontraktor') {
      companyName = displayName;
    }

    setCurrentUser({
      uid: `${role.toLowerCase().replace(' ', '_')}_user_999`,
      email,
      displayName,
      role,
      companyName
    });

    addNotification(
      'Role Simulasi Berubah',
      `Anda sekarang menggunakan sistem sebagai mode: ${role}. Tampilan dan kontrol disesuaikan.`,
      'info'
    );
  };

  // 1. PROJECT STATS (Summary metadata)
  const [projectStats, setProjectStats] = useState<ProjectStats>({
    physicalProgress: 0.0,
    financialProgress: 0.0,
    investmentValue: RAB_METADATA.grandTotal, // Aligned with official RAB: 11,274,738,917 IDR
    actualSpending: 0,   // 0% financially spent
    remainingBudget: RAB_METADATA.grandTotal,  // Full budget remaining
    hotelRoomsCount: 48,
    kostRoomsCount: 36,
    estimatedRevenueMonthly: 438120000, // 438.12 Juta IDR (aligned with Investor Module projections)
    targetDate: '2026-12-31'
  });

  const updateProjectStats = (newStats: Partial<ProjectStats>) => {
    setProjectStats(prev => {
      const updated = { ...prev, ...newStats };
      if (newStats.investmentValue !== undefined || newStats.actualSpending !== undefined) {
        updated.remainingBudget = updated.investmentValue - updated.actualSpending;
      }
      return updated;
    });
    showToast('Laporan Keuangan Utama Proyek berhasil diperbarui!', 'success');
  };

  // 2. CONSTRUCTION PROGRESS
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([
    { id: 'prog1', category: 'Persiapan', progressPercent: 0, status: 'Belum Mulai', lastUpdated: '2026-06-20', updatedBy: 'Project Manager' },
    { id: 'prog2', category: 'Pondasi', progressPercent: 0, status: 'Belum Mulai', lastUpdated: '2026-06-20', updatedBy: 'Project Manager' },
    { id: 'prog3', category: 'Basement', progressPercent: 0, status: 'Belum Mulai', lastUpdated: '2026-06-20', updatedBy: 'Project Manager' },
    { id: 'prog4', category: 'Struktur', progressPercent: 0, status: 'Belum Mulai', lastUpdated: '2026-06-20', updatedBy: 'Project Manager' },
    { id: 'prog5', category: 'Arsitektur', progressPercent: 0, status: 'Belum Mulai', lastUpdated: '2026-06-20', updatedBy: 'Project Manager' },
    { id: 'prog6', category: 'MEP', progressPercent: 0, status: 'Belum Mulai', lastUpdated: '2026-06-20', updatedBy: 'Project Manager' },
    { id: 'prog7', category: 'Interior', progressPercent: 0, status: 'Belum Mulai', lastUpdated: '2026-06-20', updatedBy: 'Project Manager' },
    { id: 'prog8', category: 'Landscape', progressPercent: 0, status: 'Belum Mulai', lastUpdated: '2026-06-20', updatedBy: 'Project Manager' }
  ]);

  const updateProgressItem = (id: string, percent: number, status: ProgressItem['status']) => {
    setProgressItems(prev => prev.map(item => {
      if (item.id === id) {
        const timestamp = new Date().toISOString().split('T')[0];
        return {
          ...item,
          progressPercent: percent,
          status,
          lastUpdated: timestamp,
          updatedBy: currentUser?.displayName || 'PM Admin'
        };
      }
      return item;
    }));

    // Re-calculate global progress
    setTimeout(() => {
      setProgressItems(currentItems => {
        const total = currentItems.reduce((acc, curr) => acc + curr.progressPercent, 0);
        const avg = parseFloat((total / currentItems.length).toFixed(1));
        setProjectStats(prev => ({
          ...prev,
          physicalProgress: avg
        }));
        return currentItems;
      });
    }, 50);

    addNotification(
      'Progres Konstruksi Diperbarui',
      `Kategori pekerjaan diperbarui: ${percent}% dengan status [${status}].`,
      'success'
    );
    showToast('Item Progres Konstruksi berhasil disimpan!', 'success');
  };

  // 3. PROJECT DOCUMENTATION
  const [projectDocs, setProjectDocs] = useState<ProjectDoc[]>([
    {
      id: 'doc1',
      type: 'Photo',
      title: 'Pemasangan Bekisting Tiang Kolom Lantai 5',
      description: 'Laporan harian pengerjaan struktur kolom inti utama sektor timur.',
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600',
      date: '2026-06-16',
      category: 'Struktur'
    },
    {
      id: 'doc2',
      type: 'Photo',
      title: 'Instalasi Jalur Kabel MDP Basement',
      description: 'Review instalasi tray perkabelan daya dari konsultan kelistrikan.',
      url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600',
      date: '2026-06-15',
      category: 'MEP'
    },
    {
      id: 'doc3',
      type: 'Drone Video',
      title: 'Video Aerial Progres Mingguan - Sisi Udara',
      description: 'Rekaman drone resolusi tinggi memperlihatkan kemajuan pembangunan struktur atap & fasad hotel.',
      url: 'https://images.unsplash.com/photo-1508847154043-be12a26c86c5?q=80&w=600', // Mock representation
      date: '2026-06-14'
    },
    {
      id: 'doc4',
      type: 'Time Lapse',
      title: 'Kompilasi Time Lapse Pembangunan Fondasi s/d Lantai 4',
      description: 'Visualisasi perubahan progres fisik dari masa persiapan lahan maret hingga sekarang.',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600',
      date: '2026-06-10'
    }
  ]);

  const addProjectDoc = (newDoc: Omit<ProjectDoc, 'id'>) => {
    const doc: ProjectDoc = {
      ...newDoc,
      id: `doc_${Date.now()}`
    };
    setProjectDocs(prev => [doc, ...prev]);
    addNotification('Dokumen Konstruksi Ditambahkan', `Dokumentasi baru dengan tipe [${doc.type}] diunggah: ${doc.title}`, 'info');
    showToast('Dokumentasi baru berhasil diunggah!', 'success');
  };

  const deleteProjectDoc = (id: string) => {
    setProjectDocs(prev => prev.filter(doc => doc.id !== id));
    showToast('Dokumen berhasil dihapus dari galeri', 'info');
  };

  // --------------------------------------------------------------------
  // 3.5. DRAWING FILES (Gambar Kerja) & FORMAL DOCUMENTS STATES & LOGIC
  // --------------------------------------------------------------------
  const [drawingFiles, setDrawingFiles] = useState<DrawingFile[]>(() => {
    const cached = localStorage.getItem('sppi_drawings');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { console.error('Error parsing sppi_drawings:', e); }
    }
    return INITIAL_DRAWINGS;
  });

  const [formalDocuments, setFormalDocuments] = useState<FormalDocument[]>(() => {
    const cached = localStorage.getItem('sppi_formal_documents');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { console.error('Error parsing sppi_formal_documents:', e); }
    }
    return INITIAL_FORMAL_DOCUMENTS;
  });

  useEffect(() => {
    localStorage.setItem('sppi_drawings', JSON.stringify(drawingFiles));
  }, [drawingFiles]);

  useEffect(() => {
    localStorage.setItem('sppi_formal_documents', JSON.stringify(formalDocuments));
  }, [formalDocuments]);

  const addDrawingComment = (drawingId: string, pageNumber: number, text: string, pin?: { x: number; y: number }) => {
    setDrawingFiles(prev => prev.map(draw => {
      if (draw.id === drawingId) {
        const pages = draw.pages.map(page => {
          if (page.pageNumber === pageNumber) {
            const newComment: DrawingComment = {
              id: `com_${Date.now()}`,
              user: currentUser?.displayName || 'Tamu Proyek',
              role: currentRole,
              text,
              date: new Date().toISOString().split('T')[0],
              pin
            };
            return {
              ...page,
              comments: [...page.comments, newComment]
            };
          }
          return page;
        });

        const changeHistory = draw.changeHistory ? [
          ...draw.changeHistory,
          {
            date: new Date().toISOString().split('T')[0],
            user: currentUser?.displayName || 'Tamu',
            action: `Menambahkan komentar pada Halaman ${pageNumber}: "${text.substring(0, 30)}..."`
          }
        ] : [{
          date: new Date().toISOString().split('T')[0],
          user: currentUser?.displayName || 'Tamu',
          action: `Menambahkan komentar pada Halaman ${pageNumber}: "${text.substring(0, 30)}..."`
        }];

        return { ...draw, pages, changeHistory };
      }
      return draw;
    }));
    
    addNotification(
      'Komentar Gambar Kerja Baru',
      `Catatan revisi baru diunggah oleh ${currentUser?.displayName || 'Tamu'} pada Halaman ${pageNumber}.`,
      'info'
    );
    showToast('Komentar / catatan pinpoint berhasil disimpan!', 'success');
  };

  const addDrawingFile = (fileName: string, totalPage: number, pages: any[]) => {
    // We can use pages array directly or import a fallback drawing image
    const blueprintFallback = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200';
    
    const newDraw: DrawingFile = {
      id: `draw_${Date.now()}`,
      fileName,
      fileUrl: '#',
      totalPage,
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser?.displayName || 'Staff Teknis',
      pages: pages.map((p, idx) => ({
        pageNumber: idx + 1,
        pageCode: p.pageCode || `PG-0${idx + 1}`,
        title: p.title || `Halaman Detail Teknik ${idx + 1}`,
        image: p.image || blueprintFallback,
        category: p.category || 'Arsitektur',
        scale: p.scale || '1:100',
        description: p.description || 'Gambar penjelasan teknik penunjang kelengkapan DED.',
        specifications: p.specifications || ['Kepatuhan standar teknas SNI', 'Review mutu berkala'],
        aiAnalysis: p.aiAnalysis || {
          type: p.category === 'Arsitektur' ? 'Denah Arsitektural Umum' : p.category === 'Struktur & Sipil' ? 'Konstruksi Struktur & Beton' : 'Render Visualisasi Lanskap',
          summary: p.description || 'Gambar penunjang yang mendeskripsikan elemen tata letak atau detail penulangan konstruksi.',
          dims: 'Skala referensi terlampir.',
          notes: 'Pelajari rencana pembalokan dan kolom sebelum memulai perancit baja tulangan.'
        },
        comments: []
      })),
      changeHistory: [{
        date: new Date().toISOString().split('T')[0],
        user: currentUser?.displayName || 'Staff',
        action: 'Mengunggah file PDF gambar resmi'
      }]
    };

    setDrawingFiles(prev => [newDraw, ...prev]);
    addNotification('Gambar Kerja Baru', `Menerima dokumen gambar teknik: ${fileName}`, 'success');
    showToast('Gambar Kerja berhasil diunggah!', 'success');
  };

  const addFormalDocument = (fileName: string, category: FormalDocument['category'], size: string, permissions: UserRole[]) => {
    const newDoc: FormalDocument = {
      id: `fdoc_${Date.now()}`,
      fileName,
      category,
      size,
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser?.displayName || 'Staf Tata Usaha',
      rolePermissions: permissions,
      downloadCount: 0,
      sharedWithContractor: permissions.includes('Mitra Kontraktor')
    };

    setFormalDocuments(prev => [newDoc, ...prev]);
    addNotification('Dokumen Proyek Diunggah', `Dokumen legalitas/teknis berhasil diarsipkan: ${fileName}`, 'success');
    showToast('Dokumen proyek berhasil diunggah!', 'success');
  };

  const deleteFormalDocument = (id: string) => {
    setFormalDocuments(prev => prev.filter(doc => doc.id !== id));
    showToast('Dokumen proyek dihapus', 'info');
  };

  const toggleFormalDocShare = (id: string) => {
    setFormalDocuments(prev => prev.map(doc => {
      if (doc.id === id) {
        const nextShared = !doc.sharedWithContractor;
        const updatedPermissions = nextShared
          ? Array.from(new Set([...doc.rolePermissions, 'Mitra Kontraktor' as UserRole]))
          : doc.rolePermissions.filter(p => p !== 'Mitra Kontraktor');
        
        addNotification(
          nextShared ? 'Akses Kontraktor Dibuka' : 'Akses Kontraktor Ditutup',
          `Berkas [${doc.fileName}] sekarang ${nextShared ? 'Tersedia' : 'Dicabut'} untuk akses pihak Kontraktor.`,
          'info'
        );

        return {
          ...doc,
          sharedWithContractor: nextShared,
          rolePermissions: updatedPermissions
        };
      }
      return doc;
    }));
    showToast('Status pembagian dokumen diperbarui!', 'success');
  };

  // 4. CONTRACTORS & VERIFICATION DATABASE
  const [contractors, setContractors] = useState<ContractorProfile[]>([
    {
      id: 'contr1',
      companyName: 'PT. Adhi Graha Perkasa',
      directorName: 'Ir. Hermawan Baskoro',
      nib: '9120003482711',
      npwp: '01.234.567.8-012.000',
      sbu: 'BG-004-Gedung Bertingkat',
      qualification: 'Besar',
      address: 'Metropolitan Tower Lt. 12, Jl. TB Simatupang, Jakarta Selatan',
      phone: '021-7890453',
      email: 'baskoro@adhigraha.co.id',
      website: 'www.adhigraha.co.id',
      documents: {
        aktaPerusahaan: true,
        nib: true,
        npwp: true,
        sbu: true,
        ktpDirektur: true,
        portofolio: true,
        isoCert: true
      },
      experiences: [
        { id: 'exp1_1', projectName: 'Aston Hotel & Suites Cirebon', year: 2023, value: 54000000000, owner: 'PT. Cirebon Indah', location: 'Cirebon' },
        { id: 'exp1_2', projectName: 'Kost Premium Astari Majalengka', year: 2024, value: 12500000000, owner: 'CV. Astari Berjaya', location: 'Majalengka' }
      ],
      legalScore: 100,
      experienceScore: 92,
      financeScore: 85,
      hrScore: 90,
      totalScore: 92.5,
      grade: 'Grade A',
      status: 'Direkomendasikan',
      verificationStatus: 'Disetujui',
      submittedAt: '2026-05-10'
    },
    {
      id: 'contr2',
      companyName: 'PT. Tri Karya MEP Specialist',
      directorName: 'Setiadi Wijaya',
      nib: '8120009941203',
      npwp: '02.441.221.7-412.000',
      sbu: 'MK-001-Kelistrikan Terintegrasi',
      qualification: 'Menengah',
      address: 'Rukan Golden Boulevard Sektor 3 Blok D/8, BSD City, Tangerang',
      phone: '021-5312345',
      email: 'tender@trikaryamep.com',
      website: 'www.trikaryamep.com',
      documents: {
        aktaPerusahaan: true,
        nib: true,
        npwp: true,
        sbu: true,
        ktpDirektur: true,
        portofolio: true,
        isoCert: false
      },
      experiences: [
        { id: 'exp2_1', projectName: 'Instalasi MEP Mal Kertajati Plaza', year: 2024, value: 18500000000, owner: 'Kertajati Realty Group', location: 'Majalengka' }
      ],
      legalScore: 85,
      experienceScore: 72,
      financeScore: 80,
      hrScore: 75,
      totalScore: 78.5,
      grade: 'Grade B',
      status: 'Perlu Review',
      verificationStatus: 'Pending',
      submittedAt: '2026-06-12'
    },
    {
      id: 'contr3',
      companyName: 'CV. Majalengka Mandiri Jaya',
      directorName: 'Andi Sugianto',
      nib: '7120008431102',
      npwp: '03.111.442.1-411.000',
      sbu: 'PL-005-Pekerjaan Sipil Lokal',
      qualification: 'Kecil',
      address: 'Jl. KH Abdul Halim No. 124, Jatitujuh, Majalengka',
      phone: '0812-3456-7890',
      email: 'majalengkamandiri@gmail.com',
      website: 'www.majalengkamandiri.com',
      documents: {
        aktaPerusahaan: true,
        nib: true,
        npwp: true,
        sbu: false,
        ktpDirektur: true,
        portofolio: false,
        isoCert: false
      },
      experiences: [
        { id: 'exp3_1', projectName: 'Drainase Jalan Lingkar Jatitujuh', year: 2025, value: 3800000000, owner: 'DPUPR Majalengka', location: 'Majalengka' }
      ],
      legalScore: 55,
      experienceScore: 40,
      financeScore: 60,
      hrScore: 50,
      totalScore: 50.5,
      grade: 'Grade C',
      status: 'Tidak Lolos',
      verificationStatus: 'Revisi',
      submittedAt: '2026-06-05'
    }
  ]);

  const addContractorExperience = (contractorId: string, exp: Omit<ExperienceItem, 'id'>) => {
    setContractors(prev => prev.map(c => {
      if (c.id === contractorId) {
        const newExp: ExperienceItem = {
          ...exp,
          id: `exp_${Date.now()}`
        };
        const updatedExperiences = [...c.experiences, newExp];
        
        // Recalculate experience points
        const totalExpVal = updatedExperiences.reduce((sum, item) => sum + item.value, 0);
        let expScore = Math.min(100, Math.floor((totalExpVal / 30000000000) * 100)); // cap at 100 for 30Milyar
        if (expScore < 30) expScore = 30 + updatedExperiences.length * 15;
        expScore = Math.min(100, expScore);

        const newTotal = parseFloat(((c.legalScore * 0.3) + (expScore * 0.3) + (c.financeScore * 0.2) + (c.hrScore * 0.2)).toFixed(1));
        const newGrade = newTotal >= 82 ? 'Grade A' : newTotal >= 65 ? 'Grade B' : 'Grade C';
        const newStatus = newTotal >= 82 ? 'Direkomendasikan' : newTotal >= 65 ? 'Perlu Review' : 'Tidak Lolos';

        return {
          ...c,
          experiences: updatedExperiences,
          experienceScore: expScore,
          totalScore: newTotal,
          grade: newGrade,
          status: newStatus
        };
      }
      return c;
    }));
    showToast('Data Portofolio Pengalaman berhasil ditambahkan!', 'success');
  };

  const registerContractor = (rawProfile: Omit<ContractorProfile, 'id' | 'legalScore' | 'experienceScore' | 'financeScore' | 'hrScore' | 'totalScore' | 'grade' | 'status' | 'verificationStatus' | 'submittedAt'>) => {
    // Math logic scoring
    const docUploadedCount = Object.values(rawProfile.documents).filter(Boolean).length;
    const maxDocs = Object.keys(rawProfile.documents).length;
    const legalScore = Math.floor((docUploadedCount / maxDocs) * 100);

    const experienceScore = 50; // Starting base
    const financeScore = rawProfile.qualification === 'Besar' ? 90 : rawProfile.qualification === 'Menengah' ? 75 : 60;
    const hrScore = rawProfile.documents.portofolio ? 80 : 50;
    const totalScore = parseFloat(((legalScore * 0.3) + (experienceScore * 0.3) + (financeScore * 0.2) + (hrScore * 0.2)).toFixed(1));

    const grade = totalScore >= 80 ? 'Grade A' : totalScore >= 60 ? 'Grade B' : 'Grade C';
    let status: 'Direkomendasikan' | 'Perlu Review' | 'Tidak Lolos' = 'Perlu Review';
    if (totalScore >= 80) status = 'Direkomendasikan';
    else if (totalScore < 60) status = 'Tidak Lolos';

    const newContractor: ContractorProfile = {
      ...rawProfile,
      id: `contr_${Date.now()}`,
      legalScore,
      experienceScore,
      financeScore,
      hrScore,
      totalScore,
      grade,
      status,
      verificationStatus: 'Pending',
      submittedAt: new Date().toISOString().split('T')[0],
      experiences: []
    };

    setContractors(prev => [newContractor, ...prev]);

    addNotification(
      'Pendaftaran Mitra Baru',
      `Kontraktor baru melakukan registrasi: ${newContractor.companyName} peringkat skor awal ${newContractor.totalScore} [${newContractor.grade}].`,
      'info'
    );

    showToast('Registrasi kualifikasi mitra kontraktor berhasil!', 'success');
    return newContractor;
  };

  const updateContractorStatus = (id: string, veriStatus: ContractorProfile['verificationStatus']) => {
    setContractors(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          verificationStatus: veriStatus
        };
      }
      return c;
    }));

    const contr = contractors.find(c => c.id === id);
    if (contr) {
      addNotification(
        'Verifikasi Berubah',
        `Hasil verifikasi admin untuk ${contr.companyName}: [${veriStatus}].`,
        veriStatus === 'Disetujui' ? 'success' : 'warning'
      );
    }
    showToast(`Status verifikasi mitra diubah menjadi: ${veriStatus}`, 'success');
  };

  // 5. E-TENDER MODULE
  const tend1Hps = rabItems.filter(i => ['Pekerjaan MEP - Listrik', 'Pekerjaan MEP - Plumbing', 'Pekerjaan MEP - Fire Fighting', 'Pekerjaan MEP - HVAC'].includes(i.chapter)).reduce((sum, item) => sum + item.totalCost, 0);
  const tend2Hps = rabItems.filter(i => ['Pekerjaan Arsitektur', 'Pekerjaan Finishing Kamar Mandi', 'Pekerjaan Kolam Renang'].includes(i.chapter)).reduce((sum, item) => sum + item.totalCost, 0);
  const tend3Hps = rabItems.filter(i => ['Pekerjaan Persiapan', 'Pekerjaan Cafe', 'Pekerjaan Luar'].includes(i.chapter)).reduce((sum, item) => sum + item.totalCost, 0);
  const tend4Hps = rabItems.filter(i => ['Pekerjaan Pondasi Substruktur', 'Pekerjaan Superstruktur'].includes(i.chapter)).reduce((sum, item) => sum + item.totalCost, 0);

  const [tenders, setTenders] = useState<TenderPackage[]>([
    {
      id: 'tend1',
      packageName: 'Pengadaan & Instalasi Kelistrikan MEP Terintegrasi',
      hpsValue: tend1Hps,
      location: 'FORESYNDO 2 - Jatitujuh Majalengka',
      schedule: '15 Juni - 30 Juni 2026',
      documentUrl: '#download-tor-mep',
      status: 'Dibuka',
      category: 'Kontraktor MEP'
    },
    {
      id: 'tend2',
      packageName: 'Pekerjaan Interior Furnishing Kamar Hotel & Kost (7 Lantai)',
      hpsValue: tend2Hps,
      location: 'FORESYNDO 2 - Jatitujuh Majalengka',
      schedule: '18 Juni - 05 Juli 2026',
      documentUrl: '#download-tor-interior',
      status: 'Dibuka',
      category: 'Interior'
    },
    {
      id: 'tend3',
      packageName: 'Pembuatan Landscape Taman, Kanopi Utama & Fasad Pencahayaan',
      hpsValue: tend3Hps,
      location: 'FORESYNDO 2 - Jatitujuh Majalengka',
      schedule: '20 Juni - 10 Juli 2026',
      documentUrl: '#download-tor-landscape',
      status: 'Dibuka',
      category: 'Landscape'
    },
    {
      id: 'tend4',
      packageName: 'Pekerjaan Struktur Utama, Pondasi Bored Pile & Plat Lantai',
      hpsValue: tend4Hps,
      location: 'FORESYNDO 2 - Jatitujuh Majalengka',
      schedule: '22 Juni - 15 Juli 2026',
      documentUrl: '#download-tor-struktur',
      status: 'Dibuka',
      category: 'Kontraktor Gedung'
    }
  ]);

  const addTender = (item: Omit<TenderPackage, 'id'>) => {
    const newTender: TenderPackage = {
      ...item,
      id: `tend_${Date.now()}`
    };
    setTenders(prev => [newTender, ...prev]);
    addNotification('Paket Tender Baru', `Paket tender dirilis: ${newTender.packageName} (HPS: Rp ${newTender.hpsValue.toLocaleString('id-ID')})`, 'info');
    showToast('Paket tender baru berhasil dibuka!', 'success');
  };

  const updateTenderStatus = (id: string, status: TenderPackage['status']) => {
    setTenders(prev => prev.map(t => (t.id === id ? { ...t, status } : t)));
    showToast(`Status Tender diperbarui ke [${status}]`, 'success');
  };

  // 6. TENDER BIDS
  const [bids, setBids] = useState<BidSubmission[]>([
    {
      id: 'bid1',
      tenderId: 'tend1',
      contractorId: 'contr2',
      contractorName: 'PT. Tri Karya MEP Specialist',
      bidAmount: Math.floor(tend1Hps * 0.93), // Realistic 7% bid discount from HPS
      proposalDoc: true,
      rabDoc: true,
      scheduleDoc: true,
      profileDoc: true,
      submittedAt: '2026-06-16',
      status: 'Evaluasi'
    }
  ]);

  const submitBid = (rawBid: Omit<BidSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newBid: BidSubmission = {
      ...rawBid,
      id: `bid_${Date.now()}`,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Diajukan'
    };
    setBids(prev => [newBid, ...prev]);

    addNotification(
      'Penawaran Tender Baru',
      `Penawaran diajukan untuk tender oleh ${newBid.contractorName} sebesar Rp ${newBid.bidAmount.toLocaleString('id-ID')}.`,
      'success'
    );
    showToast('Penawaran tender berhasil dikirimkan!', 'success');
  };

  const updateBidStatus = (id: string, status: BidSubmission['status']) => {
    setBids(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    const bid = bids.find(b => b.id === id);
    if (bid) {
      addNotification(
        'Update Evaluasi Penawaran',
        `Kemitraan penawaran oleh ${bid.contractorName} diubah ke status [${status}].`,
        status === 'Pemenang' ? 'success' : 'info'
      );
    }
    showToast(`Penawaran ditandai sebagai: ${status}`, 'success');
  };

  // 7. NOTIFICATIONS QUEUE
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif1',
      title: 'Selamat Datang di Portal FORESYNDO 2',
      message: 'Portal interaktif Manajemen Proyek, Investasi, dan E-Tender PT. Foresyndo Global Indonesia siap digunakan.',
      timestamp: '2026-06-17 08:30',
      read: false,
      type: 'info'
    },
    {
      id: 'notif2',
      title: 'Penawaran Tender Baru',
      message: 'PT. Tri Karya MEP Specialist telah mengirim dokumen kelayakan penawaran untuk Paket MEP Listrik.',
      timestamp: '2026-06-16 14:15',
      read: true,
      type: 'success'
    }
  ]);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title,
        message,
        timestamp,
        read: false,
        type
      },
      ...prev
    ]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Kotak notifikasi dikosongkan', 'info');
  };

  // 8. GRAPH/ANALYTICS DATA
  const [weeklyData] = useState<WeeklyChartData[]>([
    { week: 'M-1 Mei', planned: 52, actual: 0 },
    { week: 'M-2 Mei', planned: 55, actual: 0 },
    { week: 'M-3 Mei', planned: 58, actual: 0 },
    { week: 'M-4 Mei', planned: 61, actual: 0 },
    { week: 'M-1 Jun', planned: 63, actual: 0 },
    { week: 'M-2 Jun', planned: 66, actual: 0 },
    { week: 'M-3 Jun', planned: 68.5, actual: 0 }, // Saat ini
    { week: 'M-4 Jun', planned: 71, actual: 0 },
    { week: 'M-1 Jul', planned: 74, actual: 0 },
    { week: 'M-2 Jul', planned: 77, actual: 0 }
  ]);

  const [monthlyCashflow] = useState<MonthlyCashFlow[]>([
    { month: 'Jan', inflow: 1100000000, outflow: 0 },
    { month: 'Feb', inflow: 1300000000, outflow: 0 },
    { month: 'Mar', inflow: 1500000000, outflow: 0 },
    { month: 'Apr', inflow: 1800000000, outflow: 0 },
    { month: 'Mei', inflow: 1600000000, outflow: 0 },
    { month: 'Jun', inflow: 1900000000, outflow: 0 } // No cashflow actual outflow yet (progress is zero)
  ]);

  const [investmentMetrics, setInvestmentMetrics] = useState<InvestmentMetrics>({
    investmentValue: RAB_METADATA.grandTotal,
    projectValue: Math.floor(RAB_METADATA.grandTotal * 1.25),
    roi: 18.4,
    npv: 2200000000,
    irr: 21.6,
    bepYears: 5.4
  });

  // 9. EXPORT REPORTS ENGINE (Simulates download PDF/Excel as formatted text/csv with feedback)
  const generateReport = (category: 'progress' | 'cashflow' | 'investor' | 'mitra' | 'tender') => {
    let reportContent = '';
    let fileName = '';
    
    const formattedHeader = `
============================================================
              PT. FORESYNDO GLOBAL INDONESIA               
               REKAPITULASI PROYEK FORESYNDO 2              
============================================================
Tanggal Cetak : ${new Date().toLocaleString('id-ID')}
Kategori      : ${category.toUpperCase()} LAPORAN DIGITAL
Status Proyek : Persiapan Lapangan - Progres ${projectStats.physicalProgress}%
Lokasi        : Jatitujuh, Majalengka, Jawa Barat
------------------------------------------------------------\n`;

    if (category === 'progress') {
      fileName = 'Foresyndo2_Progres_Konstruksi.txt';
      reportContent = formattedHeader + `DAFTAR PROGRES FISIK PEKERJAAN KONSTRUKSI:\n\n` +
        progressItems.map(item => 
          `- Pekerjaan ${item.category.padEnd(12)} : ${item.progressPercent}% [${item.status}] (Updated: ${item.lastUpdated} oleh ${item.updatedBy})`
        ).join('\n') + `\n\nTotal Rata-rata Progres Fisik Saat Ini: ${projectStats.physicalProgress}%\n`;
    } 
    else if (category === 'cashflow') {
      fileName = 'Foresyndo2_Arus_Kas.csv';
      reportContent = `Bulan,Dana Masuk (Inflow IDR),Pekerjaan Keluar (Outflow IDR),Sisa Surplus (IDR)\n` +
        monthlyCashflow.map(flow => 
          `${flow.month},${flow.inflow},${flow.outflow},${flow.inflow - flow.outflow}`
        ).join('\n') + `\n\nSisa Anggaran Proyek Sekarang:,${projectStats.remainingBudget}\n`;
    } 
    else if (category === 'investor') {
      fileName = 'Foresyndo2_Analisis_Investasi.txt';
      reportContent = formattedHeader + `KEY FINANCIAL & FEASIBILITY ANALYSIS:\n\n` +
        `* Nilai Modal Investasi : Rp ${investmentMetrics.investmentValue.toLocaleString('id-ID')}\n` +
        `* Nilai Buku Aset       : Rp ${investmentMetrics.projectValue.toLocaleString('id-ID')}\n` +
        `* NPV (Net Present Val) : Rp ${investmentMetrics.npv.toLocaleString('id-ID')}\n` +
        `* IRR (Internal Rate)   : ${investmentMetrics.irr}%\n` +
        `* Rata-rata ROI Tahunan : ${investmentMetrics.roi}%\n` +
        `* BEP (Payback Period)  : ${investmentMetrics.bepYears} Tahun\n\n` +
        `------------------------------------------------------------\n` +
        `Kapasitas Pendapatan Bulanan Terproyeksi (Hotel + Kost): Rp ${projectStats.estimatedRevenueMonthly.toLocaleString('id-ID')}/bulan\n`;
    } 
    else if (category === 'mitra') {
      fileName = 'Foresyndo2_Mitra_Kontraktor.txt';
      reportContent = formattedHeader + `DAFTAR REKANAN MITRA KONTRAKTOR TERDAFTAR:\n\n` +
        contractors.map(c => 
          `${c.companyName} (${c.qualification})\n` +
          `  - Direktur     : ${c.directorName}\n` +
          `  - Grade / Skor : ${c.grade} (${c.totalScore} Pts)\n` +
          `  - Status / Ver : ${c.status} [Verifikasi: ${c.verificationStatus}]\n` +
          `  - Email/Telp   : ${c.email} / ${c.phone}\n` +
          `  - Alamat       : ${c.address}`
        ).join('\n\n');
    } 
    else if (category === 'tender') {
      fileName = 'Foresyndo2_Tender_Dan_Penawaran.txt';
      reportContent = formattedHeader + `DAFTAR TENDER DAN PENAWARAN MITRA:\n\n` +
        tenders.map(t => {
          const matchingBids = bids.filter(b => b.tenderId === t.id);
          return `TENDER: ${t.packageName}\n` +
            `  - HPS           : Rp ${t.hpsValue.toLocaleString('id-ID')}\n` +
            `  - Sektor/Status : ${t.category} / ${t.status}\n` +
            `  - Penawaran Masuk: ${matchingBids.length} mitra\n` +
            matchingBids.map(b => `    * ${b.contractorName}: Rp ${b.bidAmount.toLocaleString('id-ID')} [Status: ${b.status}]`).join('\n') + `\n`;
        }).join('\n');
    }

    // Creating actual Blob download in browser
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`Sukses mengekspor ${fileName}! Memulai unduhan otomatis...`, 'success');
  };

  // Automated state actions to make the applet feel alive (adds interactive alerts periodically)
  useEffect(() => {
    const interval = setTimeout(() => {
      addNotification(
        'Rilis Tender Facade Lighting',
        'Owner merilis paket pengerjaan Fasad Landscape Taman & Penerangan Utama di modul E-Tender.',
        'info'
      );
    }, 15000);
    return () => clearTimeout(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        changeUserRole,
        activeTab,
        setActiveTab,
        accounts,
        updateAccount,
        addAccount,
        deleteAccount,
        projectStats,
        updateProjectStats,
        progressItems,
        updateProgressItem,
        projectDocs,
        addProjectDoc,
        deleteProjectDoc,
        drawingFiles,
        addDrawingComment,
        addDrawingFile,
        formalDocuments,
        addFormalDocument,
        deleteFormalDocument,
        toggleFormalDocShare,
        contractors,
        registerContractor,
        updateContractorStatus,
        addContractorExperience,
        tenders,
        addTender,
        updateTenderStatus,
        bids,
        submitBid,
        updateBidStatus,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        weeklyData,
        monthlyCashflow,
        investmentMetrics,
        setInvestmentMetrics,
        generateReport,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
