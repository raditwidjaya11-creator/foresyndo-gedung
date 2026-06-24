/**
 * Types & Interfaces for Foresyndo 2 - Hotel, Kost Eksklusif & Mitra Kontraktor Portal
 */

export type UserRole = 'Super Admin' | 'Owner' | 'Project Manager' | 'Konsultan' | 'Investor' | 'Mitra Kontraktor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyName?: string;
}

export interface AccountCredential {
  role: UserRole;
  title: string;
  representative: string;
  email: string;
  password: string;
}

export interface ProgressItem {
  id: string;
  category: 'Persiapan' | 'Pondasi' | 'Basement' | 'Struktur' | 'Arsitektur' | 'MEP' | 'Interior' | 'Landscape';
  progressPercent: number; // 0 - 100
  status: 'Belum Mulai' | 'Berjalan' | 'Selesai' | 'Tertunda';
  lastUpdated: string;
  updatedBy: string;
}

export interface ProjectDoc {
  id: string;
  type: 'Photo' | 'Drone Video' | 'Time Lapse';
  title: string;
  description: string;
  url: string;
  date: string;
  category?: string;
}

export interface ProjectStats {
  physicalProgress: number;
  financialProgress: number;
  investmentValue: number; // in IDR
  actualSpending: number; // in IDR
  remainingBudget: number; // in IDR
  hotelRoomsCount: number;
  kostRoomsCount: number;
  estimatedRevenueMonthly: number; // in IDR
  targetDate: string;
}

export interface InvestmentMetrics {
  investmentValue: number;
  projectValue: number;
  roi: number; // percentages
  npv: number; // in IDR
  irr: number; // percentages
  bepYears: number;
}

export interface ExperienceItem {
  id: string;
  projectName: string;
  year: number;
  value: number; // in IDR
  owner: string;
  location: string;
}

export interface ContractorProfile {
  id: string;
  companyName: string;
  directorName: string;
  nib: string;
  npwp: string;
  sbu: string;
  qualification: 'Kecil' | 'Menengah' | 'Besar';
  address: string;
  phone: string;
  email: string;
  website: string;
  
  // Upload statuses (simulated files)
  documents: {
    aktaPerusahaan: boolean;
    nib: boolean;
    npwp: boolean;
    sbu: boolean;
    ktpDirektur: boolean;
    portofolio: boolean;
    isoCert: boolean;
  };

  experiences: ExperienceItem[];

  // AI Scoring Outputs
  legalScore: number; // 0-100 (30% weight)
  experienceScore: number; // 0-100 (30% weight)
  financeScore: number; // 0-100 (20% weight)
  hrScore: number; // 0-100 (20% weight)
  totalScore: number; // 0-100
  grade: 'Grade A' | 'Grade B' | 'Grade C';
  status: 'Direkomendasikan' | 'Perlu Review' | 'Tidak Lolos';
  verificationStatus: 'Disetujui' | 'Revisi' | 'Ditolak' | 'Pending';
  submittedAt: string;
}

export interface TenderPackage {
  id: string;
  packageName: string;
  hpsValue: number; // in IDR
  location: string;
  schedule: string;
  documentUrl: string;
  status: 'Dibuka' | 'Evaluasi' | 'Selesai';
  category: 'Kontraktor Gedung' | 'Kontraktor Jalan' | 'Kontraktor Infrastruktur' | 'Kontraktor MEP' | 'Interior' | 'Landscape';
}

export interface BidSubmission {
  id: string;
  tenderId: string;
  contractorId: string;
  contractorName: string;
  bidAmount: number; // in IDR
  proposalDoc: boolean; // did upload Surat Penawaran
  rabDoc: boolean; // did upload RAB
  scheduleDoc: boolean; // did upload Jadwal Pelaksanaan
  profileDoc: boolean; // did upload Company Profile
  submittedAt: string;
  status: 'Diajukan' | 'Evaluasi' | 'Pemenang' | 'Gugur';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface WeeklyChartData {
  week: string;
  planned: number;
  actual: number;
}

export interface MonthlyCashFlow {
  month: string;
  inflow: number;
  outflow: number;
}

export interface DrawingComment {
  id: string;
  user: string;
  role: UserRole;
  text: string;
  date: string;
  pin?: { x: number; y: number }; // Coordinates as percentages (0-100) for visual pins
}

export interface DrawingPage {
  pageNumber: number;
  pageCode: string;
  title: string;
  image: string;
  category: 'Arsitektur' | 'Struktur & Sipil' | 'Visualisasi 3D';
  scale: string;
  description: string;
  specifications: string[];
  aiAnalysis: {
    type: string;
    summary: string;
    dims: string;
    notes: string;
  };
  comments: DrawingComment[];
}

export interface DrawingFile {
  id: string;
  fileName: string;
  fileUrl: string;
  totalPage: number;
  uploadedDate: string;
  uploadedBy: string;
  pages: DrawingPage[];
  version?: string; // e.g., 'v1.0'
  versions?: Array<{
    version: string;
    uploadedDate: string;
    uploadedBy: string;
    changeNotes: string;
    pages: DrawingPage[];
  }>;
  changeHistory?: Array<{
    date: string;
    user: string;
    action: string;
  }>;
}

export interface FormalDocument {
  id: string;
  fileName: string;
  category: 'Kontrak & Legalitas' | 'Teknis & DED' | 'Finansial & E-RAB' | 'Laporan Lapangan';
  size: string;
  uploadedDate: string;
  uploadedBy: string;
  rolePermissions: UserRole[];
  downloadCount: number;
  sharedWithContractor: boolean;
}

