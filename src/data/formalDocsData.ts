import { FormalDocument } from '../types';

export const INITIAL_FORMAL_DOCUMENTS: FormalDocument[] = [
  {
    id: 'fdoc1',
    fileName: 'Legalitas_Persetujuan_IMB_Foresyndo2_Signed.pdf',
    category: 'Kontrak & Legalitas',
    size: '14.2 MB',
    uploadedDate: '2026-01-15',
    uploadedBy: 'Radit Widjaya (Super Admin)',
    rolePermissions: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan'],
    downloadCount: 34,
    sharedWithContractor: true
  },
  {
    id: 'fdoc2',
    fileName: 'SPK_Pelaksanaan_PT_Karya_Sejahtera_Abadi_Signed.pdf',
    category: 'Kontrak & Legalitas',
    size: '8.4 MB',
    uploadedDate: '2026-02-05',
    uploadedBy: 'Budi Santoso (Project Manager)',
    rolePermissions: ['Super Admin', 'Owner', 'Project Manager'],
    downloadCount: 18,
    sharedWithContractor: true
  },
  {
    id: 'fdoc3',
    fileName: 'Laporan_Pengujian_Sondir_Tanah_Kertajati_Jatitujuh.pdf',
    category: 'Teknis & DED',
    size: '22.8 MB',
    uploadedDate: '2026-01-20',
    uploadedBy: 'ArchiPlan Specialist (Konsultan)',
    rolePermissions: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Mitra Kontraktor'],
    downloadCount: 45,
    sharedWithContractor: true
  },
  {
    id: 'fdoc4',
    fileName: 'RAB_Official_Grand_Total_Foresyndo_11M.xlsx',
    category: 'Finansial & E-RAB',
    size: '5.2 MB',
    uploadedDate: '2026-02-10',
    uploadedBy: 'Radit Widjaya (Super Admin)',
    rolePermissions: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor'],
    downloadCount: 122,
    sharedWithContractor: false
  },
  {
    id: 'fdoc5',
    fileName: 'Analisis_Dampak_Lingkungan_AMDAL_2026_Final.pdf',
    category: 'Kontrak & Legalitas',
    size: '6.7 MB',
    uploadedDate: '2026-01-18',
    uploadedBy: 'Radit Widjaya (Super Admin)',
    rolePermissions: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor'],
    downloadCount: 11,
    sharedWithContractor: false
  },
  {
    id: 'fdoc6',
    fileName: 'Spesifikasi_Teknis_Bahan_Semen_dan_Besi_Beton_SNI.pdf',
    category: 'Teknis & DED',
    size: '12.4 MB',
    uploadedDate: '2026-03-01',
    uploadedBy: 'ArchiPlan Specialist (Konsultan)',
    rolePermissions: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Mitra Kontraktor'],
    downloadCount: 89,
    sharedWithContractor: true
  },
  {
    id: 'fdoc7',
    fileName: 'BA_Pemeriksaan_Sosial_Tetangga_Sekitar_Penetapan_Jalan.pdf',
    category: 'Laporan Lapangan',
    size: '1.8 MB',
    uploadedDate: '2026-03-15',
    uploadedBy: 'Budi Santoso (Project Manager)',
    rolePermissions: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan'],
    downloadCount: 9,
    sharedWithContractor: false
  },
  {
    id: 'fdoc8',
    fileName: 'Laporan_Uji_Tekan_Slump_Test_Boring_Beton_Lantai1.pdf',
    category: 'Laporan Lapangan',
    size: '4.5 MB',
    uploadedDate: '2026-05-18',
    uploadedBy: 'Budi Santoso (Project Manager)',
    rolePermissions: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Mitra Kontraktor'],
    downloadCount: 22,
    sharedWithContractor: true
  }
];
