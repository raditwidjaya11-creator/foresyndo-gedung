import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Sparkles, 
  Plus, 
  MapPin, 
  Compass, 
  FileText, 
  History, 
  CornerDownRight, 
  Upload, 
  Trash2, 
  HelpCircle,
  Clock,
  CheckCircle,
  Eye,
  Info,
  Send,
  RefreshCw,
  X
} from 'lucide-react';
import { DrawingFile, DrawingPage, DrawingComment, UserRole } from '../types';

export const DrawingViewer: React.FC = () => {
  const { 
    drawingFiles, 
    addDrawingComment, 
    addDrawingFile, 
    currentRole, 
    currentUser,
    showToast 
  } = useApp();

  // Active files and sheets state
  const [activeDrawingId, setActiveDrawingId] = useState<string>(
    drawingFiles.length > 0 ? drawingFiles[0].id : ''
  );
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // e.g. 1 = 100%, 1.5 = 150%
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [activeTabPanel, setActiveTabPanel] = useState<'ai' | 'comments' | 'history'>('ai');

  // New Upload Form State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [newFilePagesCount, setNewFilePagesCount] = useState<number>(3);
  const [newFileCategory, setNewFileCategory] = useState<'Arsitektur' | 'Struktur & Sipil' | 'Visualisasi 3D'>('Arsitektur');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Annotation/Pin Placement State
  const [isPlacingPin, setIsPlacingPin] = useState<boolean>(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [commentReplyTarget, setCommentReplyTarget] = useState<string | null>(null);

  // AI Chat Assistant State
  const [aiChatVisible, setAiChatVisible] = useState<boolean>(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { 
      sender: 'ai', 
      text: 'Halo! Saya AI Asisten Gambar SPPI. Tunjuk halaman gambar mana saja, saya bisa membantu melihat spesifikasi kekuatan kolom beton, klasifikasi denah arsitektural rincian, atau membacakan dimensi teknis penahan beban gempa untuk kontraktor. Mau tanya apa hari ini?', 
      time: 'Baru saja' 
    }
  ]);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [activePinDetail, setActivePinDetail] = useState<DrawingComment | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const drawingImageRef = useRef<HTMLImageElement>(null);

  // Retrieve active drawing file object
  const activeDrawing = useMemo<DrawingFile | undefined>(() => {
    return drawingFiles.find(d => d.id === activeDrawingId) || drawingFiles[0];
  }, [drawingFiles, activeDrawingId]);

  // Handle drawing selection swap
  useEffect(() => {
    if (activeDrawing) {
      setActivePageNum(1);
    }
  }, [activeDrawingId]);

  // Ensure active page is within bounds when swapping drawings
  const activePage = useMemo<DrawingPage | undefined>(() => {
    if (!activeDrawing) return undefined;
    return activeDrawing.pages.find(p => p.pageNumber === activePageNum) || activeDrawing.pages[0];
  }, [activeDrawing, activePageNum]);

  // Fullscreen support
  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        showToast('Gagal masuk mode layar penuh: ' + err.message, 'error');
      });
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleZoomReset = () => setZoomLevel(1);

  // Clicking on image to place comment pin
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPlacingPin || !drawingImageRef.current || !activeDrawing || !activePage) return;
    
    const rect = drawingImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPendingPin({ x, y });
    showToast('Silahkan isi keterangan pin pada panel input di sebelah kanan', 'info');
    setActiveTabPanel('comments');
  };

  const handleSavePinComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDrawing || !activePage || !newCommentText.trim()) return;

    const pinCoordinates = pendingPin || undefined;
    addDrawingComment(activeDrawing.id, activePage.pageNumber, newCommentText, pinCoordinates);
    
    // Reset inputs
    setNewCommentText('');
    setPendingPin(null);
    setIsPlacingPin(false);
  };

  // Pre-configured questions inside drawing meta AI
  const handleAskQuickQuestion = (question: string) => {
    if (!activePage) return;
    
    const userMsg = { sender: 'user' as const, text: question, time: new Date().toLocaleTimeString('id-US', {hour: '2-digit', minute:'2-digit'}) };
    setChatMessages(prev => [...prev, userMsg]);

    // Simple delay for AI reply
    setTimeout(() => {
      let responseText = 'Mohon maaf, saya belum menemukan jawaban teknis spesifik untuk area ini. Pastikan Anda berpegang pada gambar sengkang baja SNI.';
      
      const q = question.toLowerCase();
      if (q.includes('kolom') || q.includes('balok') || q.includes('struktur')) {
        responseText = `Berdasarkan DED Lembar ${activePage.pageCode}, struktur kolom mengandalkan beton bertulang K-350 slump 12±2cm untuk menjamin daktilitas seismik. Dimensi Kolom Induk adalah 400x400mm bermutu rebar D16 ulir Krakatau Steel dengan beugel p-8 rapat jarak 100mm di tumpuan untuk menangani tegangan geser tinggi.`;
      } else if (q.includes('terbaca') || q.includes('ukuran') || q.includes('dimensi')) {
        responseText = `Lembar gambar ${activePage.pageCode} terbaca berskala resmi ${activePage.scale}. Ukuran denah utama adalah ${activePage.aiAnalysis.dims}. Detail partisi sekat kamar tidur adalah 3.25 x 4.5 Meter, koridor utama bersih selebar 2.10 Meter dengan dinding bata ringan Citicon setebal 100mm.`;
      } else if (q.includes('kontraktor') || q.includes('mitra') || q.includes('catatan')) {
        responseText = `Rekomendasi AI untuk kontraktor di lapangan:\n1. ${activePage.aiAnalysis.notes}\n2. Jaga kestabilan penulangan kait gempa sudut 135°.\n3. Periksa selimut beton minimum 40mm sebelum pengecoran bekisting dimulai.`;
      } else if (q.includes('kolam') || q.includes('balkon') || q.includes('cafe')) {
        responseText = `Analisis AI pada area kolam & estetika:\nTeras dek kolam menggunakan kayu anti-air (Ulin/Bengkirai) di atas sasis cor tumpu. Lampu sorot underwater wajib bertengangan rendah (12V AC/DC) dengan proteksi IP68 ter-grounding penuh ke kotak distribusi elektrik belakang cafe.`;
      } else if (q.includes('warna') || q.includes('dinding') || q.includes('cat')) {
        responseText = `Informasi Finishing: Fasad menggunakan cat perlindungan cuaca luar Jotun Weathershield warna Sandstone & Khaki Warm Ochre, dikombinasikan dengan partisi pilar beton sirkular klasik bertonasi megah. Rencana pengerjaan harus di-approval bersama owner.`;
      } else if (q.includes('tebal') || q.includes('plat') || q.includes('lantai')) {
        responseText = `Dari data spasial lembar ${activePage.pageCode || 'Struktur'}, pelat lantai struktur memiliki ketebalan nominal 120 mm dengan penulangan dua lapis mesh wire tumpuan-lapangan pembesian D10 ulir. Pastikan spacing ganjal beton cetak (tahu beton) terpasang merata.`;
      }

      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString('id-US', {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1000);
  };

  const submitChatQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    
    const q = customQuestion;
    setCustomQuestion('');
    handleAskQuickQuestion(q);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setNewFileName(file.name);
    }
  };

  // Simulating an upload with real progress bar
  const handleUploadDrawingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      showToast('Mohon lampirkan file atau isi nama berkas PDF', 'error');
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
        const step = Math.floor(Math.random() * 15) + 15;
        return Math.min(prev + step, 100);
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      const extension = newFileName.toLowerCase().endsWith('.pdf') ? '' : '.pdf';
      const finalName = newFileName + extension;

      // Build some simulated pages using blueprint fallbacks
      const generatedPages = [];
      for (let i = 1; i <= newFilePagesCount; i++) {
        generatedPages.push({
          pageCode: `${newFileCategory === 'Arsitektur' ? 'A' : newFileCategory === 'Struktur & Sipil' ? 'S' : 'V'}-0${i}`,
          title: `Halaman Detail Kerja ${newFileCategory} #${i}`,
          description: `Gambar DED hasil konversi digital PDF terverifikasi untuk kategori pekerjaan: ${newFileCategory}.`,
          category: newFileCategory,
          scale: '1:100',
          specifications: ['Sesuai standar teknis SNI', 'Menjalani approval bersama owner'],
        });
      }

      addDrawingFile(finalName, newFilePagesCount, generatedPages);
      
      // Reset upload states
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setNewFileName('');
      setShowUploadModal(false);
    }, 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6" id="drawing-viewer-root">
      
      {/* HEADER SECTION WITH DROPDOWN AND UPLOAD BUTTON */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Drawing Viewer Gambar Kerja</h1>
            <p className="text-xs text-slate-500">
              Analisis denah arsitektur, markup pinpoint area, serta konsultasi spesifikasi teknis lapangan berbasis AI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial">
            <label className="sr-only">Pilih Gambar Kerja</label>
            <select
              value={activeDrawingId}
              onChange={(e) => {
                setActiveDrawingId(e.target.value);
                setPendingPin(null);
                setIsPlacingPin(false);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white shadow-sm focus:border-indigo-500 focus:outline-none"
            >
              {drawingFiles.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.fileName} ({file.totalPage} Hlm)
                </option>
              ))}
            </select>
          </div>

          {['Super Admin', 'Owner', 'Project Manager', 'Konsultan'].includes(currentRole) && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm transition"
              id="upload-pdf-btn"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Unggah PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* CORE INTERACTIVE VIEWPORT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR: THUMBNAIL NAVIGATOR (cols 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-3 shadow-sm h-[680px] overflow-y-auto flex flex-row lg:flex-col gap-3">
          <div className="hidden lg:block pb-2 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
              Halaman Gambar
            </span>
          </div>

          {activeDrawing?.pages.map((page) => (
            <button
              key={page.pageNumber}
              onClick={() => {
                setActivePageNum(page.pageNumber);
                setPendingPin(null);
                setIsPlacingPin(false);
              }}
              className={`flex-shrink-0 flex lg:flex-col items-center gap-2 p-2 rounded-lg border text-left transition w-36 lg:w-full ${
                activePageNum === page.pageNumber
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-100 hover:border-slate-300 bg-slate-50/20'
              }`}
            >
              {/* Box Thumbnail */}
              <div className="w-12 h-12 lg:w-full lg:h-[76px] relative overflow-hidden rounded bg-slate-100 border border-slate-200">
                <img
                  src={page.image}
                  alt={page.title}
                  className="w-full h-full object-cover grayscale brightness-95"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1 left-1 bg-slate-900/80 text-[10px] px-1 rounded font-bold text-white uppercase">
                  {page.pageCode}
                </div>
              </div>
              <div className="min-w-0 pr-1 flex-1">
                <p className="text-[11px] font-bold text-slate-700 truncate block">
                  Hlm {page.pageNumber}: {page.pageCode}
                </p>
                <p className="text-[10px] text-slate-400 truncate hidden lg:block">
                  {page.title}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* CENTER: BIG DRAWING VIEWER WITH COORDINATES AND ZOOM (cols 7) */}
        <div 
          ref={containerRef}
          className={`lg:col-span-7 flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-md relative h-[680px] ${
            isFullScreen ? 'p-4' : ''
          }`}
        >
          {/* Viewer Toolbar */}
          <div className="bg-slate-900/95 border-b border-slate-800 p-3 flex items-center justify-between z-10">
            <div className="text-slate-200 text-xs truncate max-w-[50%]">
              <span className="bg-indigo-600 px-2 py-0.5 rounded font-mono font-bold mr-2 text-white">
                {activePage?.pageCode}
              </span>
              <span className="font-semibold">{activePage?.title}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-slate-300 font-mono text-[11px] px-1 min-w-[45px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-white rounded hover:bg-slate-800 transition mr-2"
                title="Reset Zoom"
              >
                Aktual
              </button>

              <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

              <button
                onClick={() => {
                  const currentIndex = activeDrawing?.pages.findIndex(p => p.pageNumber === activePageNum) ?? -1;
                  if (currentIndex > 0) {
                    setActivePageNum(activeDrawing!.pages[currentIndex - 1].pageNumber);
                    setPendingPin(null);
                    setIsPlacingPin(false);
                  }
                }}
                disabled={activePageNum === 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-slate-800 transition"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-slate-400 text-[11px] font-bold px-1.5">
                {activePageNum} / {activeDrawing?.totalPage}
              </span>

              <button
                onClick={() => {
                  const currentIndex = activeDrawing?.pages.findIndex(p => p.pageNumber === activePageNum) ?? -1;
                  if (currentIndex < (activeDrawing?.pages.length ?? 0) - 1) {
                    setActivePageNum(activeDrawing!.pages[currentIndex + 1].pageNumber);
                    setPendingPin(null);
                    setIsPlacingPin(false);
                  }
                }}
                disabled={activePageNum === (activeDrawing?.totalPage ?? 1)}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-slate-800 transition"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

              <button
                onClick={toggleFullScreen}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                title={isFullScreen ? "Keluar Layar Penuh" : "Layar Penuh"}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950 relative min-h-0 select-none">
            
            {/* INSTRUCTIONS OR PLACING MODE TOP HEADER BAR */}
            {isPlacingPin && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-slate-950 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md z-20 flex items-center gap-1 px-4 animate-bounce">
                <MapPin className="w-3.5 h-3.5 fill-slate-950" />
                <span>Mode Pinpoint: Klik sembarang posisi pada gambar cetak untuk meletakkan Pin</span>
                <button 
                  onClick={() => { setIsPlacingPin(false); setPendingPin(null); }}
                  className="ml-2 hover:bg-yellow-600 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Drawing Sheet Render Frame */}
            <div 
              className="relative transition-transform duration-100 ease-out inline-block origin-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                ref={drawingImageRef}
                src={activePage?.image}
                alt={activePage?.title}
                onClick={handleImageClick}
                className={`max-w-full max-h-[500px] object-contain rounded border border-slate-800 ${
                  isPlacingPin ? 'cursor-cell border-yellow-400/80 ring-2 ring-yellow-400/20' : 'cursor-default'
                }`}
                referrerPolicy="no-referrer"
              />

              {/* RENDER USER MARKUP PINS OVERLAY */}
              {activePage?.comments.map((comment) => (
                comment.pin && (
                  <button
                    key={comment.id}
                    onClick={() => {
                      setActivePinDetail(comment);
                      setActiveTabPanel('comments');
                    }}
                    className="absolute group z-10 transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition"
                    style={{ left: `${comment.pin.x}%`, top: `${comment.pin.y}%` }}
                  >
                    {/* Glowing pulse ring */}
                    <span className="absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75 animate-ping"></span>
                    <div className="relative p-1 bg-red-600 hover:bg-red-500 rounded-full border border-white text-white shadow-lg">
                      <MapPin className="w-3 h-3 fill-white" />
                    </div>

                    {/* Miniature Hover Popup box */}
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 text-slate-100 text-[10px] w-48 p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-xl z-20">
                      <div className="flex justify-between font-bold text-indigo-400 border-b border-slate-800 pb-1 mb-1">
                        <span>{comment.user}</span>
                        <span>{comment.role}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-300 leading-normal">{comment.text}</p>
                    </div>
                  </button>
                )
              ))}

              {/* PENDING PIN IN REAL-TIME PLACEMENT */}
              {pendingPin && (
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
                >
                  <span className="absolute inline-flex h-4 w-4 rounded-full bg-yellow-400 opacity-75 animate-pulse"></span>
                  <div className="p-1 bg-yellow-500 rounded-full border border-white text-slate-900 shadow-md">
                    <MapPin className="w-3.5 h-3.5 fill-slate-900" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="bg-slate-950 border-t border-slate-900 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 select-none">
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-400 font-bold">
                KATEGORI: {activePage?.category}
              </span>
              <span>Skala Dokumen: <strong className="text-amber-400 font-mono">{activePage?.scale}</strong></span>
            </div>
            <div>
              Klik di mana saja untuk pinpoint komentar / penelaahan revisi
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AI ASSISTANT, COMMENTS & HISTORY (cols 3) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col h-[680px]">
          
          {/* Navigation Tab Menu inside panel */}
          <div className="flex border-b border-slate-100 text-xs">
            <button
              onClick={() => setActiveTabPanel('ai')}
              className={`flex-1 py-3 text-center border-b-2 font-bold transition flex items-center justify-center gap-1.5 ${
                activeTabPanel === 'ai'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Asisten AI
            </button>
            <button
              onClick={() => setActiveTabPanel('comments')}
              className={`flex-1 py-3 text-center border-b-2 font-bold transition flex items-center justify-center gap-1.5 relative ${
                activeTabPanel === 'comments'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Komentar & Pin
              {activePage?.comments && activePage.comments.length > 0 && (
                <span className="absolute top-2 right-2 bg-rose-600 text-[9px] text-white font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {activePage.comments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTabPanel('history')}
              className={`flex-1 py-3 text-center border-b-2 font-bold transition flex items-center justify-center gap-1.5 ${
                activeTabPanel === 'history'
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Riwayat
            </button>
          </div>

          {/* ACTIVE PANEL INNER WRAPPER */}
          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            
            {/* PANEL A: AI ANALYSIS PLATFORM */}
            {activeTabPanel === 'ai' && activePage && (
              <div className="flex flex-col gap-4">
                
                {/* AI Core Reading Overview */}
                <div className="bg-indigo-50/60 rounded-lg p-3.5 border border-indigo-100/40 text-slate-700">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      AI Gambar Teknik
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-500 block">Tipe Pendekatan:</span>
                  <p className="text-xs font-bold text-slate-800 mb-2">{activePage.aiAnalysis.type}</p>

                  <span className="text-xs font-bold text-slate-500 block">Ringkasan Spasial:</span>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{activePage.aiAnalysis.summary}</p>

                  <span className="text-xs font-bold text-slate-500 block">Kajian Dimensi:</span>
                  <p className="text-xs text-slate-800 font-semibold mb-2">{activePage.aiAnalysis.dims}</p>

                  <div className="bg-white/80 rounded p-2 border border-indigo-100/50">
                    <span className="text-[10px] font-bold text-indigo-600 block mb-0.5">⚠️ DISKUSI TEKNIS KONTRAKTOR:</span>
                    <p className="text-[11px] text-slate-600 font-mono leading-normal">
                      {activePage.aiAnalysis.notes}
                    </p>
                  </div>
                </div>

                {/* Prompt Chat Box Area */}
                <div className="bg-slate-50 border border-slate-100 rounded-lg flex flex-col h-[280px]">
                  <div className="bg-slate-100 px-3 py-1.5 rounded-t-lg text-[10px] font-bold text-slate-500 flex justify-between items-center">
                    <span>KONSULTASI AI CETAK</span>
                    <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full inline-block animate-ping"></span>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto space-y-2 text-[11px]">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`p-2 rounded-lg max-w-[85%] leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Suggestion tags */}
                  <div className="p-2 border-t border-slate-100 bg-white/70 flex flex-wrap gap-1">
                    <button
                      onClick={() => handleAskQuickQuestion('Berapa ketebalan lantai struktur?')}
                      className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded"
                    >
                      Tebal Lantai?
                    </button>
                    <button
                      onClick={() => handleAskQuickQuestion('Apa rekomendasi pembersihan kolom?')}
                      className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded"
                    >
                      Besi Kolom?
                    </button>
                    <button
                      onClick={() => handleAskQuickQuestion('Bagaimana finishing eksterior?')}
                      className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded"
                    >
                      Finishing Fasad?
                    </button>
                  </div>

                  {/* Form Submission code */}
                  <form onSubmit={submitChatQuestion} className="p-1 w-full flex bg-white rounded-b-lg border-t border-slate-100">
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Tanya AI tentang gambar kerja..."
                      className="flex-1 text-xs px-2.5 py-1.5 focus:outline-none placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* PANEL B: COMMENTS AND PINPOINT MARKUPS */}
            {activeTabPanel === 'comments' && activePage && (
              <div className="flex flex-col gap-4">
                
                {/* Active selection of Comment */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">
                    Komentar Temuan & Rencana Revisi
                  </h3>
                  
                  {!isPlacingPin && (
                    <button
                      onClick={() => {
                        setIsPlacingPin(true);
                        setPendingPin(null);
                      }}
                      className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 px-2.5 py-1 rounded font-bold hover:bg-rose-100 transition flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      Add Pinpoint
                    </button>
                  )}
                </div>

                {/* If selected pin detail is focused, render spotlight header */}
                {activePinDetail && (
                  <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200 flex flex-col gap-1 text-xs text-slate-800">
                    <div className="flex justify-between items-center text-[10px] font-bold text-amber-800 uppercase">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 fill-amber-700 text-transparent" />
                        Pin Terpilih
                      </span>
                      <button 
                        onClick={() => setActivePinDetail(null)}
                        className="text-amber-800 font-bold hover:bg-amber-100 p-0.5 rounded"
                      >
                        Tampilkan Semua
                      </button>
                    </div>
                    <p className="font-bold text-slate-900">{activePinDetail.user} ({activePinDetail.role})</p>
                    <p className="italic text-slate-600">"{activePinDetail.text}"</p>
                  </div>
                )}

                {/* PLACING PENDING COMMENT SCREEN */}
                {isPlacingPin && pendingPin && (
                  <form onSubmit={handleSavePinComment} className="bg-yellow-50 rounded-lg border border-yellow-200 p-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-yellow-800 flex items-center gap-1">
                        <MapPin className="w-4 h-4 fill-yellow-600 text-transparent" />
                        Isi Komentar Pin (X: {Math.round(pendingPin.x)}%, Y: {Math.round(pendingPin.y)}%)
                      </span>
                    </div>

                    <textarea
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Masukkan catatan tinjauan arsitektur/kekeliruan, misalnya: Tinggi kolom tumpang terlalu mepet tangga atau instalasi stopkontak..."
                      rows={3}
                      required
                      className="w-full text-xs p-2.5 border border-slate-300 rounded focus:border-indigo-500 focus:outline-none bg-white text-slate-800"
                    />

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setPendingPin(null);
                        }}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded"
                      >
                        Reset Posisi Pin
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded inline-flex items-center gap-1"
                      >
                        Simpan Pin & Catatan
                      </button>
                    </div>
                  </form>
                )}

                {/* GENERAL LIST OF ALL COMMENTS */}
                <div className="space-y-3.5">
                  {activePage.comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
                      <MessageSquare className="w-8 h-8 text-slate-200" />
                      Belum ada catatan atau markup pada halaman ini.
                      {['Project Manager', 'Konsultan', 'Owner', 'Super Admin'].includes(currentRole) && (
                        <button
                          onClick={() => setIsPlacingPin(true)}
                          className="mt-1 text-indigo-600 font-bold hover:underline"
                        >
                          Tandai Gambar Sekarang &rarr;
                        </button>
                      )}
                    </div>
                  ) : (
                    activePage.comments
                      .filter(c => !activePinDetail || c.id === activePinDetail.id)
                      .map((comment) => (
                        <div 
                          key={comment.id}
                          className={`p-3 rounded-lg border text-xs text-slate-700 transition ${
                            activePinDetail?.id === comment.id 
                              ? 'border-amber-400 bg-amber-50/20 shadow-sm' 
                              : 'border-slate-100 bg-slate-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800">
                              {comment.user}
                            </span>
                            <span className="bg-slate-100 text-[10px] text-slate-500 px-1.5 rounded font-medium">
                              {comment.role}
                            </span>
                          </div>

                          <span className="text-[10px] text-slate-400 block mb-1.5">
                            {comment.date}
                          </span>

                          <p className="text-slate-600 leading-normal pl-2 border-l border-indigo-200">
                            {comment.text}
                          </p>

                          {comment.pin && (
                            <div className="mt-2 text-[10px] text-indigo-500 font-semibold flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 fill-indigo-500 text-transparent inline" />
                              Diposisi Gambar (X: {Math.round(comment.pin.x)}%, Y: {Math.round(comment.pin.y)}%)
                            </div>
                          )}
                        </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* PANEL C: REVISION AUDIT HISTORY */}
            {activeTabPanel === 'history' && activeDrawing && (
              <div className="flex flex-col gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Riwayat Perubahan PDF Drawing
                </span>

                <div className="relative border-l border-slate-150 pl-4 ml-2 space-y-5 text-xs text-slate-600">
                  {activeDrawing.changeHistory ? (
                    activeDrawing.changeHistory.map((history, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot marker */}
                        <div className="absolute -left-[20.5px] top-1 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white"></div>
                        
                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                          <span className="text-[10px] font-mono text-indigo-600 block mb-0.5">
                            {history.date} &bull; {history.user}
                          </span>
                          <p className="text-slate-700 leading-relaxed font-semibold">
                            {history.action}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">Belum ada riwayat terekam.</p>
                  )}
                </div>
              </div>
            )}

          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center select-none">
            <span className="text-[10px] text-slate-400 font-bold block">
              SISTEM PROTEKSI SPPI &bull; VERSI REVISI {activeDrawing?.pages[0]?.pageCode.startsWith('A') ? 'REV-3' : 'REV-1'}
            </span>
          </div>

        </div>

      </div>

      {/* UPLOAD SIMULATION MODAL */}
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
                  <span className="font-bold text-sm">Unggah Gambar PDF Kerja</span>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadDrawingSubmit} className="p-5 flex flex-col gap-4">
                {isUploading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                    <p className="text-sm font-semibold text-slate-700">Sedang Mengonversi & Mengunggah...</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">Mengonversi file cetak PDF asli ke lembar kerja ber-skala digital SPPI.</p>
                    
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
                        accept=".pdf,image/*"
                        className="hidden"
                      />
                      {selectedFile ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                          <span className="text-sm font-bold text-slate-800 break-all">{selectedFile.name}</span>
                          <span className="text-[11px] text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk ganti file</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <p className="text-xs font-bold text-slate-700 font-sans">Seret & letakkan file PDF atau klik untuk mencari</p>
                          <span className="text-[10px] text-slate-400">Dimensi standar, format PDF/Gambar hingga 50MB</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Nama Berkas PDF
                      </label>
                      <input
                        type="text"
                        required
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Contoh: DED_Fondasi_BorePile_ZonasiC.pdf"
                        className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Jumlah Halaman PDF
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={10}
                          value={newFilePagesCount}
                          onChange={(e) => setNewFilePagesCount(parseInt(e.target.value) || 1)}
                          className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Kategori Pengerjaan
                        </label>
                        <select
                          value={newFileCategory}
                          onChange={(e) => setNewFileCategory(e.target.value as any)}
                          className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-bold"
                        >
                          <option value="Arsitektur">Arsitektur</option>
                          <option value="Struktur & Sipil">Struktur & Sipil</option>
                          <option value="Visualisasi 3D">Visualisasi 3D</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-3 text-xs leading-relaxed text-indigo-700 font-medium font-sans">
                      Sistem otomatis mengonversi file ini secara lokal. Halaman detail dihasilkan otomatis untuk kelancaran preview kolaboratif di panggung visualisasi tanpa perlu mengunduh aplikasi eksternal.
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-150 text-slate-600 rounded-lg text-xs font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Mulai Mengunggah
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
