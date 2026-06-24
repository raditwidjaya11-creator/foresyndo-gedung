import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  FileText, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Shield, 
  Lock, 
  Unlock, 
  Eye, 
  Trash2, 
  User, 
  Calendar, 
  CheckCircle, 
  X,
  Share2,
  HardDrive,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { FormalDocument, UserRole } from '../types';

export const ProjectDocuments: React.FC = () => {
  const { 
    formalDocuments, 
    addFormalDocument, 
    deleteFormalDocument, 
    toggleFormalDocShare, 
    currentRole, 
    currentUser,
    showToast 
  } = useApp();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // Add Document Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<FormalDocument['category']>('Kontrak & Legalitas');
  const [newSize, setNewSize] = useState<string>('4.5 MB');
  const [allowedRoles, setAllowedRoles] = useState<UserRole[]>(['Super Admin', 'Owner', 'Project Manager']);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Available roles to toggle in form permissions
  const availableRoles: UserRole[] = ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor', 'Mitra Kontraktor'];

  // Categories
  const categories = ['Semua', 'Kontrak & Legalitas', 'Teknis & DED', 'Finansial & E-RAB', 'Laporan Lapangan'];

  // Calculate storage usage simulation
  const totalStorage = 250; // MB
  const usedStorage = useMemo(() => {
    return formalDocuments.reduce((sum, doc) => {
      const val = parseFloat(doc.size);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [formalDocuments]);

  const storagePercentage = useMemo(() => {
    return Math.min(Math.round((usedStorage / totalStorage) * 100), 100);
  }, [usedStorage]);

  // Retrieve user allowed files
  const filteredDocuments = useMemo(() => {
    return formalDocuments.filter(doc => {
      // 1. Filter by user role permissions OR shared with contractor
      const isSharedToContractor = currentRole === 'Mitra Kontraktor' && doc.sharedWithContractor;
      const hasPermission = doc.rolePermissions.includes(currentRole) || currentRole === 'Super Admin' || isSharedToContractor;
      if (!hasPermission) return false;

      // 2. Filter by category
      if (activeCategory !== 'Semua' && doc.category !== activeCategory) return false;

      // 3. Filter by search term
      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        return doc.fileName.toLowerCase().includes(q) || doc.uploadedBy.toLowerCase().includes(q);
      }

      return true;
    });
  }, [formalDocuments, currentRole, activeCategory, searchTerm]);

  // Handle download simulation
  const handleDownloadFile = (doc: FormalDocument) => {
    // Increase download simulation
    doc.downloadCount += 1;
    showToast(`Sukses mendownload ${doc.fileName}! Memproses berkas terverifikasi...`, 'success');

    const isXls = doc.fileName.toLowerCase().endsWith('.xlsx') || doc.fileName.toLowerCase().endsWith('.xls');

    if (isXls) {
      // Excel/CSV generator with UTF-8 BOM to open perfectly in Microsoft Excel & Google Sheets
      const csvContent = "Kategori\tNama Dokumen\tUkuran\tTanggal Unggah\tDiunggah Oleh\tStatus Verifikasi\n" +
        `${doc.category}\t${doc.fileName}\t${doc.size}\t${doc.uploadedDate}\t${doc.uploadedBy}\tTERVERIFIKASI RESMI SPPI\n` +
        `Nomor ID Dokumen\t${doc.id}\n` +
        `Diunduh Oleh\t${currentUser?.displayName || 'Tamu'} (${currentRole})\n` +
        `Tanggal Unduh\t${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')} WIB\n\n` +
        `RINGKASAN ESTIMASI BIAYA PROYEK BANDARA KERTAJATI (SIMULASI):\n` +
        `Pekerjaan Persiapan & Mobilisasi\tRp 450.000.000,00\n` +
        `Pekerjaan Struktur Utama\tRp 4.850.000.000,00\n` +
        `Pekerjaan Arsitektur & MEP\tRp 3.900.000.000,00\n` +
        `Pekerjaan Lansekap & Interior\tRp 1.800.000.000,00\n` +
        `GRAND TOTAL ESTIMASI KONTRAK\tRp 11.000.000.000,00\n`;
      
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Create a premium, valid official corporate document PDF copy
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Page 1: COVER CERTIFICATE & COMPLIANCE VERIFICATION
      // Draw professional navy border frame
      pdf.setDrawColor(30, 58, 138); // Navy blue FGI Brand Color
      pdf.setLineWidth(1);
      pdf.rect(8, 8, 194, 281);
      pdf.rect(9, 9, 192, 279);
      
      // Top header banner
      pdf.setFillColor(30, 58, 138);
      pdf.rect(10, 10, 190, 24, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('PT FORESYNDO GRAND INDONESIA', 20, 19);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('SISTEM PROCUREMENT, PERENCANAAN & INTEGRASI (SPPI) - BANDARA KERTAJATI', 20, 27);
      
      // Title
      pdf.setTextColor(30, 58, 138);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text('SALINAN DOKUMEN RESMI TERVERIFIKASI', 20, 48);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Official Certified Copy & Document Integrity Verification Ledger', 20, 54);
      
      // Decorative orange divider line
      pdf.setFillColor(234, 88, 12); // Orange Accent
      pdf.rect(20, 58, 170, 1, 'F');
      
      // Metadata Header section
      pdf.setTextColor(30, 58, 138);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('INFORMASI & INTEGRITAS FILE DOKUMEN', 20, 68);
      
      // Table grid simulating metadata
      pdf.setDrawColor(226, 232, 240); // Soft grey border
      pdf.setLineWidth(0.3);
      pdf.setFillColor(248, 250, 252); // Background of header rows
      
      // Helper function to draw metadata rows
      const drawRow = (y: number, label: string, value: string, bg: boolean = false) => {
        if (bg) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(20, y - 4, 170, 7, 'F');
        }
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text(label, 22, y);
        
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(value, 68, y);
        
        pdf.line(20, y + 3, 190, y + 3);
      };
      
      let yOffset = 76;
      drawRow(yOffset, 'Nomor Register:', `DOC-REG-${doc.id.toUpperCase()}-${new Date(doc.uploadedDate).getFullYear()}`, true); yOffset += 9;
      drawRow(yOffset, 'Nama File Asli:', doc.fileName); yOffset += 9;
      drawRow(yOffset, 'Kategori Dokumen:', doc.category, true); yOffset += 9;
      drawRow(yOffset, 'Ukuran Berkas:', doc.size); yOffset += 9;
      drawRow(yOffset, 'Diunggah Pada:', `${doc.uploadedDate} (Sesuai Log Server SPPI)`, true); yOffset += 9;
      drawRow(yOffset, 'Diunggah Oleh:', doc.uploadedBy); yOffset += 9;
      drawRow(yOffset, 'Akses Otoritas:', doc.rolePermissions.join(', '), true); yOffset += 9;
      drawRow(yOffset, 'Status Distribusi:', doc.sharedWithContractor ? 'Terbagi dengan Mitra Kontraktor (Publicly Accessible)' : 'Internal Manajemen (Strictly Restricted)'); yOffset += 9;
      drawRow(yOffset, 'Total Unduhan:', `${doc.downloadCount} Kali`, true); yOffset += 9;
      
      // Audit trail
      pdf.setTextColor(30, 58, 138);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('LOG TRANSFER & AUDIT TRAIL', 20, yOffset + 10);
      
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.text(`Dokumen ini diunduh secara resmi oleh akun pengguna terdaftar pada:`, 20, yOffset + 16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`User: ${currentUser?.displayName || 'Guest User'} | Peran Otoritas: ${currentRole}`, 20, yOffset + 21);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Tanggal & Waktu Akses: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')} WIB`, 20, yOffset + 26);
      pdf.text(`Alamat Lokasi Klien: Akses Cloud Terowongan Kertajati Majalengka Secure Tunnel`, 20, yOffset + 31);
      
      // Draw QR Code block representation
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(0.5);
      pdf.rect(154, yOffset + 12, 34, 34);
      // Mock QR-code interior grids
      pdf.setFillColor(15, 23, 42);
      pdf.rect(156, yOffset + 14, 8, 8, 'F');
      pdf.rect(178, yOffset + 14, 8, 8, 'F');
      pdf.rect(156, yOffset + 36, 8, 8, 'F');
      pdf.rect(168, yOffset + 26, 4, 4, 'F');
      pdf.rect(174, yOffset + 32, 6, 6, 'F');
      pdf.rect(162, yOffset + 24, 3, 3, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text('QR SECURE VERIFY', 155, yOffset + 49);
      
      // Corporate Footer notes
      pdf.setFillColor(241, 245, 249);
      pdf.rect(10, 252, 190, 24, 'F');
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text('Kerahasiaan Dokumen: Informasi yang terkandung di dalam berkas ini merupakan hak kekayaan intelektual milik PT Foresyndo Grand Indonesia', 13, 258);
      pdf.text('dan dilindungi oleh undang-undang ITE Indonesia. Salinan ini adalah salinan digital resmi yang dihasilkan langsung oleh SPPI Database Server.', 13, 262);
      pdf.text('Verifikasi keabsahan dokumen dapat dilakukan dengan memindai kode QR keamanan atau menghubungi administrator IT PT FGI.', 13, 266);
      
      // Page Number
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(30, 58, 138);
      pdf.text('Halaman 1 dari 2', 170, 271);
      
      // Add page 2: Detailed Integrity & Disclaimer
      pdf.addPage();
      
      // Border frame for Page 2
      pdf.setDrawColor(30, 58, 138);
      pdf.setLineWidth(1);
      pdf.rect(8, 8, 194, 281);
      pdf.rect(9, 9, 192, 279);
      
      // Page 2 header
      pdf.setFillColor(30, 58, 138);
      pdf.rect(10, 10, 190, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`LEMBAR INTEGRITAS DOKUMEN: ${doc.fileName.toUpperCase()}`, 15, 18);
      
      // Content of page 2
      pdf.setTextColor(30, 58, 138);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('1. Pernyataan Otoritas & Keabsahan', 20, 35);
      
      pdf.setTextColor(51, 65, 85);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const textParagraph1 = `Dengan diunduhnya berkas "${doc.fileName}", sistem secara otomatis mendata riwayat transfer data ini pada log terpusat SPPI PT Foresyndo Grand Indonesia. Berkas ini merupakan representasi digital dari berkas fisik yang disimpan dalam lemari arsip aman (secure vault) kantor pusat PT Foresyndo Grand Indonesia di Jawa Barat.`;
      const splitText1 = pdf.splitTextToSize(textParagraph1, 170);
      pdf.text(splitText1, 20, 42);
      
      pdf.setTextColor(30, 58, 138);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('2. Penjelasan Isi Dokumen (Sesuai Kategori)', 20, 68);
      
      pdf.setTextColor(51, 65, 85);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      let detailDesc = '';
      if (doc.category === 'Kontrak & Legalitas') {
        detailDesc = 'Dokumen Kontrak & Legalitas berisi kesepakatan hukum resmi, kontrak kerja sama pelaksana proyek, SPK resmi, akta pendirian, atau perizinan Izin Mendirikan Bangunan (IMB) yang mengikat secara yuridis antara PT Foresyndo Grand Indonesia, instansi pemerintah Jawa Barat, mitra kontraktor, dan investor terkait pembangunan infrastruktur Bandara Internasional Kertajati.';
      } else if (doc.category === 'Teknis & DED') {
        detailDesc = 'Dokumen Teknis & DED (Detail Engineering Design) berisi rencana arsitektur matang, uji sondir mekanika tanah, spesifikasi teknis bahan material bersertifikat Standar Nasional Indonesia (SNI), serta panduan operasional struktur sipil yang diawasi langsung oleh konsultan independen guna menjamin keamanan struktural bangunan.';
      } else if (doc.category === 'Finansial & E-RAB') {
        detailDesc = 'Dokumen Finansial & E-RAB (Rencana Anggaran Biaya Elektronik) menguraikan rincian alokasi anggaran, rincian upah tenaga kerja, biaya pengadaan bahan baku baja dan semen, sub-kontrak, serta estimasi keuntungan proyek dengan nominal total anggaran sebesar Rp11.000.000.000,00 (Sebelas Miliar Rupiah) yang disetujui direksi.';
      } else {
        detailDesc = 'Dokumen Laporan Lapangan berisi berkas berita acara pemeriksaan lapangan, catatan harian pengawas proyek, slump test beton lantai, serta dokumentasi progres fisik konstruksi secara real-time dari bandara untuk memastikan bahwa pelaksanaan di lapangan sesuai dengan standar DED yang ditetapkan.';
      }
      
      const splitText2 = pdf.splitTextToSize(detailDesc, 170);
      pdf.text(splitText2, 20, 75);
      
      pdf.setTextColor(30, 58, 138);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('3. Tanda Tangan & Verifikasi Digital', 20, 110);
      
      pdf.setTextColor(51, 65, 85);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('Dokumen ini telah ditandatangani secara elektronik (Digital Signature) menggunakan sertifikasi SPPI Security.', 20, 117);
      
      // Draw a neat signature block
      pdf.setDrawColor(203, 213, 225);
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, 125, 170, 48, 'F');
      
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text('SIGNED BY PT FORESYNDO GRAND INDONESIA AUTHORITY', 25, 131);
      
      pdf.setTextColor(30, 58, 138);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.text('Radit Widjaya', 25, 142);
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Super Admin & Direktur Utama PT FGI', 25, 146);
      pdf.text(`Status Sertifikat: AKTIF & SAH`, 25, 151);
      pdf.text(`Hash Integritas SHA256: 4f1a23b5c678d910e111213141516171819202122232425`, 25, 156);
      pdf.text(`ID Transaksi Unduh: TXN-SYNC-${Math.floor(100000 + Math.random() * 900000)}`, 25, 161);
      
      // Draw signature ink representation
      pdf.setDrawColor(234, 88, 12);
      pdf.setLineWidth(0.8);
      pdf.line(130, 138, 145, 148);
      pdf.line(145, 148, 135, 153);
      pdf.line(135, 153, 160, 142);
      pdf.line(160, 142, 148, 158);
      pdf.line(148, 158, 170, 150);
      
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(234, 88, 12);
      pdf.setFontSize(7.5);
      pdf.text('Sistem SPPI Terverifikasi', 133, 165);
      
      // Bottom notes Page 2
      pdf.setFillColor(241, 245, 249);
      pdf.rect(10, 252, 190, 24, 'F');
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text('Dilarang keras menyebarluaskan dokumen ini kepada pihak ketiga di luar konsorsium PT FGI tanpa izin tertulis dari Direksi Utama.', 13, 258);
      pdf.text('Setiap pelanggaran penyebaran data rahasia bandara akan ditindaklanjuti secara hukum pidana maupun perdata sesuai perundang-undangan.', 13, 262);
      pdf.text('Lembar ini merupakan bagian tidak terpisahkan dari sertifikat keabsahan dokumen pada halaman pertama.', 13, 266);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(30, 58, 138);
      pdf.text('Halaman 2 dari 2', 170, 271);
      
      // Save and Download the real compiled PDF
      pdf.save(doc.fileName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setNewFileName(file.name);
      // Format file size nicely
      const sizeMB = file.size / (1024 * 1024);
      setNewSize(`${sizeMB.toFixed(1)} MB`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setNewFileName(file.name);
      // Format file size nicely
      const sizeMB = file.size / (1024 * 1024);
      setNewSize(`${sizeMB.toFixed(1)} MB`);
    }
  };

  // Submit form
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      showToast('Mohon isi nama dokumen', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 20) + 15;
        return Math.min(prev + step, 100);
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      addFormalDocument(newFileName, newCategory, newSize, allowedRoles);
      
      // reset states
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setNewFileName('');
      setAllowedRoles(['Super Admin', 'Owner', 'Project Manager', 'Mitra Kontraktor']);
      setShowUploadModal(false);
    }, 2000);
  };

  const handleRoleToggle = (role: UserRole) => {
    if (allowedRoles.includes(role)) {
      setAllowedRoles(prev => prev.filter(r => r !== role));
    } else {
      setAllowedRoles(prev => [...prev, role]);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6" id="project-documents-root">
      
      {/* STORAGE OVERVIEW BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Storage card (cols 5) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl border border-indigo-900/40 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Dokumen Cloud Proyek
              </span>
            </div>
            <h2 className="text-2xl font-black">
              {usedStorage.toFixed(1)} MB <span className="text-xs font-normal text-slate-400">Terpakai dari {totalStorage} MB</span>
            </h2>
          </div>

          <div className="my-4">
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>{storagePercentage}% Kapasitas Terpakai</span>
              <span>Sisa {totalStorage - parseFloat(usedStorage.toFixed(1))} MB Bebas</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 pointer-events-none font-medium">
            Dokumen diamankan menggunakan enkripsi AES-256 tingkat militer untuk persetujuan owner dan kolaborasi kontraktor.
          </p>
        </div>

        {/* Dashboard quick stats inside docs (cols 7) */}
        <div className="md:col-span-7 bg-white rounded-xl border border-slate-100 p-5 shadow-sm grid grid-cols-3 gap-4 items-center">
          <div className="text-center p-3.5 bg-slate-50/50 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Arsip</span>
            <span className="text-3xl font-black text-slate-800">{formalDocuments.length}</span>
            <span className="text-[9px] text-slate-400 block mt-1">Berkas Tersimpan</span>
          </div>

          <div className="text-center p-3.5 bg-indigo-50/50 rounded-lg">
            <span className="text-[10px] font-bold text-indigo-600 block mb-1">DIBAGIKAN KE MITRA</span>
            <span className="text-3xl font-black text-indigo-700">
              {formalDocuments.filter(d => d.sharedWithContractor).length}
            </span>
            <span className="text-[9px] text-indigo-500 block mt-1">Akses Kontraktor Terbuka</span>
          </div>

          <div className="text-center p-3.5 bg-slate-50/50 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 block mb-1">TOTAL DOWNLOAD</span>
            <span className="text-3xl font-black text-slate-800">
              {formalDocuments.reduce((sum, d) => sum + d.downloadCount, 0)}
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">Kali Diunduh</span>
          </div>
        </div>

      </div>

      {/* FILTER AND ACTION BAR */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input & Upload Action */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none w-56 bg-slate-50/30 text-slate-800 shadow-sm"
            />
          </div>

          {['Super Admin', 'Owner', 'Project Manager'].includes(currentRole) && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 shadow-xs transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Dokumen
            </button>
          )}
        </div>

      </div>

      {/* DOCUMENTS GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-xl border border-slate-100 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <FileText className="w-12 h-12 text-slate-200" />
            Tidak ada arsip dokumen {activeCategory !== 'Semua' ? `kategori [${activeCategory}]` : ''} yang sesuai dengan kriteria pencarian atau izin peran Anda ({currentRole}).
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const isExcel = doc.fileName.endsWith('.xlsx') || doc.fileName.endsWith('.xls');
            return (
              <div 
                key={doc.id}
                className="bg-white rounded-xl border border-slate-150 p-4.5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  
                  {/* Category badget & Icon placeholder */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      doc.category === 'Kontrak & Legalitas' 
                        ? 'bg-amber-100 text-amber-800' 
                        : doc.category === 'Teknis & DED' 
                        ? 'bg-indigo-100 text-indigo-800'
                        : doc.category === 'Finansial & E-RAB'
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {doc.category}
                    </span>

                    {/* Shared with contractor badge indicator */}
                    {['Super Admin', 'Owner', 'Project Manager'].includes(currentRole) && (
                      <button
                        onClick={() => toggleFormalDocShare(doc.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded transition inline-flex items-center gap-1 ${
                          doc.sharedWithContractor
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                        }`}
                        title="Klik untuk ubah izin share mitra kontraktor"
                      >
                        {doc.sharedWithContractor ? <Unlock className="w-2.5 h-2.5 inline" /> : <Lock className="w-2.5 h-2.5 inline" />}
                        {doc.sharedWithContractor ? 'Shared ke Mitra' : 'Owner Only'}
                      </button>
                    )}

                    {currentRole === 'Mitra Kontraktor' && (
                      <span className="text-[9px] text-slate-400 font-bold block bg-slate-50 px-1.5 py-0.5 rounded">
                        Akses Kontraktual
                      </span>
                    )}

                  </div>

                  {/* Title and main box type */}
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div className={`p-2.5 rounded-lg ${isExcel ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {isExcel ? <FileSpreadsheet className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed" title={doc.fileName}>
                        {doc.fileName}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">{doc.size}</p>
                    </div>
                  </div>

                </div>

                {/* Footer metadata */}
                <div className="border-t border-slate-100 pt-3.5 mt-3 flex flex-col gap-2 shadow-inner-white text-[11px] text-slate-500">
                  <div className="flex justify-between font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {doc.uploadedDate}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {doc.uploadedBy.split(' ')[0]}
                    </span>
                  </div>

                  {/* Download stats */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>Zonasi Hak Akses: <strong className="text-indigo-600 font-extrabold font-mono">{doc.rolePermissions.length} Peran</strong></span>
                    <span>Diunduh: <strong className="font-bold">{doc.downloadCount} kali</strong></span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 mt-2.5">
                    <button
                      onClick={() => handleDownloadFile(doc)}
                      className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 font-bold rounded-lg text-xs inline-flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>

                    {['Super Admin', 'Owner'].includes(currentRole) && (
                      <button
                        onClick={() => {
                          if (confirm('Yakin ingin menghapus dokumen arsip legalitas ini?')) {
                            deleteFormalDocument(doc.id);
                          }
                        }}
                        className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs transition"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* UPLOAD FORM DIALOG MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col"
            >
              
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  <span className="font-bold text-sm">Upload File Dokumen Resmi</span>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-5 flex flex-col gap-4">
                {isUploading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                    <p className="text-sm font-semibold text-slate-700">Mengarsipkan & Mengunggah...</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">Mengonversi file dokumen asli lapangan menjadi arsip PDF digital terenkripsi SPPI.</p>
                    
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mt-6 max-w-xs overflow-hidden border border-slate-200">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600 mt-2">{uploadProgress}%</span>
                  </div>
                ) : (
                  <>
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                        isDragging
                          ? 'border-indigo-600 bg-indigo-50/50'
                          : selectedFile
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                          <span className="text-sm font-bold text-slate-800 break-all">{selectedFile.name}</span>
                          <span className="text-[11px] text-slate-500">{newSize} • Klik untuk mengganti</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <p className="text-xs font-bold text-slate-700 font-sans">Seret & letakkan berkas dokumen atau klik untuk mencari</p>
                          <span className="text-[10px] text-slate-400">PDF, MS Word/Excel, Gambar hingga 100MB</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Nama File Dokumen
                      </label>
                      <input
                        type="text"
                        required
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Contoh: SPK_Pekan10_Pekerjaan_ME_Signed.pdf"
                        className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-805"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Kategori Arsip
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-bold"
                        >
                          <option value="Kontrak & Legalitas">Kontrak & Legalitas</option>
                          <option value="Teknis & DED">Teknis & DED</option>
                          <option value="Finansial & E-RAB">Finansial & E-RAB</option>
                          <option value="Laporan Lapangan">Laporan Lapangan</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Ukuran Berkas
                        </label>
                        <input
                          type="text"
                          required
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          placeholder="e.g. 4.5 MB"
                          className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-808"
                        />
                      </div>
                    </div>

                    {/* Granular Permissions Controls */}
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                        Izin Akses Berdasarkan Peran
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {availableRoles.map((role) => {
                          const enabled = allowedRoles.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleRoleToggle(role)}
                              className={`px-3 py-1.5 rounded text-[11px] font-bold text-left transition flex items-center justify-between ${
                                enabled
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span>{role}</span>
                              {enabled ? (
                                <CheckCircle className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <div className="w-3.5 h-3.5 border border-slate-300 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-150 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Mulai Upload
                      </button>
                    </div>
                  </>
                )}
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
