import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
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
    showToast(`Sukses mendownload ${doc.fileName}! Memulai transfer data...`, 'success');

    // Web download logic
    const dummyText = `KONTEN REKADATA UTAMA SPPI: ${doc.fileName}\nKategori: ${doc.category}\nDiunduh oleh: ${currentUser?.displayName || 'Tamu'} sebagai ${currentRole}`;
    const blob = new Blob([dummyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
