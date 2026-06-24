import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  X,
  Highlighter,
  RotateCcw,
  EyeOff,
  PenTool,
  Download
} from 'lucide-react';
import { DrawingFile, DrawingPage, DrawingComment, UserRole } from '../types';

export const DrawingViewer: React.FC = () => {
  const { 
    drawingFiles, 
    addDrawingComment, 
    addDrawingFile, 
    updateDrawingVersion,
    clearAllDrawings,
    resetDrawingsToDefault,
    currentRole, 
    currentUser,
    showToast 
  } = useApp();

  // Active files and sheets state
  const [activeDrawingId, setActiveDrawingId] = useState<string>(
    drawingFiles.length > 0 ? drawingFiles[0].id : ''
  );
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  // Keep activeDrawingId synchronized if drawingFiles changes
  useEffect(() => {
    if (drawingFiles.length > 0) {
      if (!activeDrawingId || !drawingFiles.some(f => f.id === activeDrawingId)) {
        setActiveDrawingId(drawingFiles[0].id);
        setActivePageNum(1);
      }
    } else {
      setActiveDrawingId('');
      setActivePageNum(1);
    }
  }, [drawingFiles, activeDrawingId]);
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
  const [isRootDragging, setIsRootDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Version Control Upload States
  const [uploadType, setUploadType] = useState<'new' | 'version'>('new');
  const [selectedParentDrawingId, setSelectedParentDrawingId] = useState<string>('');
  const [newDrawingVersionCode, setNewDrawingVersionCode] = useState<string>('v1.1');
  const [newDrawingChangeNotes, setNewDrawingChangeNotes] = useState<string>('');

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

  // Initialize upload modal state when it is opened
  useEffect(() => {
    if (showUploadModal) {
      if (activeDrawingId) {
        setSelectedParentDrawingId(activeDrawingId);
      } else if (drawingFiles.length > 0) {
        setSelectedParentDrawingId(drawingFiles[0].id);
      }
      setUploadType('new');
      setNewDrawingVersionCode('v1.1');
      setNewDrawingChangeNotes('');
    }
  }, [showUploadModal, activeDrawingId, drawingFiles]);

  // Pre-fill filename when uploadType is set to 'version'
  useEffect(() => {
    if (uploadType === 'version' && selectedParentDrawingId) {
      const parent = drawingFiles.find(d => d.id === selectedParentDrawingId);
      if (parent) {
        // Strip extension if it exists to match input expectations
        const rawName = parent.fileName.replace(/\.[^/.]+$/, "");
        setNewFileName(rawName);
        
        // Suggest next version code
        if (parent.version) {
          const match = parent.version.match(/^v(\d+)\.(\d+)$/);
          if (match) {
            const major = parseInt(match[1]);
            const minor = parseInt(match[2]);
            setNewDrawingVersionCode(`v${major}.${minor + 1}`);
          } else {
            setNewDrawingVersionCode('v1.1');
          }
        } else {
          setNewDrawingVersionCode('v1.1');
        }
      }
    } else if (uploadType === 'new') {
      setNewFileName('');
    }
  }, [uploadType, selectedParentDrawingId, drawingFiles]);

  // High-fidelity construction drawing Markup & Sticky Note Annotation states
  const [annotationMode, setAnnotationMode] = useState<'none' | 'pen' | 'highlighter' | 'sticky'>('none');
  const [markupColor, setMarkupColor] = useState<string>('#EF4444'); // Bright red default
  const [brushSize, setBrushSize] = useState<number>(4);
  const [stickyColor, setStickyColor] = useState<string>('yellow'); // yellow, pink, green, blue
  const [annotationsVisible, setAnnotationsVisible] = useState<boolean>(true);
  const [imageBounds, setImageBounds] = useState<{ width: number; height: number }>({ width: 750, height: 480 });
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  const pageKey = `${activeDrawingId}_${activePageNum}`;

  // Local storage cache key for drawn markup files
  const [allPageAnnotations, setAllPageAnnotations] = useState<Record<string, {
    lines: Array<{
      points: Array<{ x: number; y: number }>;
      color: string;
      width: number;
      isHighlighter: boolean;
    }>;
    stickyNotes: Array<{
      id: string;
      x: number;
      y: number;
      text: string;
      color: string;
      author: string;
      date: string;
      isCollapsed?: boolean;
    }>;
  }>>(() => {
    const cached = localStorage.getItem('sppi_drawing_annotations');
    return cached ? JSON.parse(cached) : {};
  });

  // Automatically sync page annotations to storage
  useEffect(() => {
    localStorage.setItem('sppi_drawing_annotations', JSON.stringify(allPageAnnotations));
  }, [allPageAnnotations]);

  const pageAnnotations = useMemo(() => {
    return allPageAnnotations[pageKey] || { lines: [], stickyNotes: [] };
  }, [allPageAnnotations, pageKey]);

  const containerRef = useRef<HTMLDivElement>(null);
  const drawingImageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentLinePoints, setCurrentLinePoints] = useState<Array<{ x: number; y: number }>>([]);

  // Retrieve active drawing file object
  const activeDrawing = useMemo<DrawingFile | undefined>(() => {
    return drawingFiles.find(d => d.id === activeDrawingId) || drawingFiles[0];
  }, [drawingFiles, activeDrawingId]);

  // Handle drawing selection swap and reset version
  useEffect(() => {
    if (activeDrawing) {
      setActivePageNum(1);
      setSelectedVersion(activeDrawing.version || 'v1.0');
    } else {
      setSelectedVersion('');
    }
  }, [activeDrawingId, activeDrawing]);

  // Retrieve pages of the selected drawing version
  const activePages = useMemo(() => {
    if (!activeDrawing) return [];
    if (!selectedVersion || selectedVersion === (activeDrawing.version || 'v1.0')) {
      return activeDrawing.pages;
    }
    const verEntry = activeDrawing.versions?.find(v => v.version === selectedVersion);
    return verEntry ? verEntry.pages : activeDrawing.pages;
  }, [activeDrawing, selectedVersion]);

  // Compute available versions list for the active drawing
  const availableVersions = useMemo(() => {
    if (!activeDrawing) return [];
    if (activeDrawing.versions && activeDrawing.versions.length > 0) {
      return activeDrawing.versions;
    }
    return [
      {
        version: activeDrawing.version || 'v1.0',
        uploadedDate: activeDrawing.uploadedDate,
        uploadedBy: activeDrawing.uploadedBy,
        changeNotes: 'Inisiasi gambar kerja awal',
        pages: activeDrawing.pages
      }
    ];
  }, [activeDrawing]);

  // Ensure active page is within bounds when swapping drawings or versions
  const activePage = useMemo<DrawingPage | undefined>(() => {
    if (activePages.length === 0) return undefined;
    return activePages.find(p => p.pageNumber === activePageNum) || activePages[0];
  }, [activePages, activePageNum]);

  // Handle measurement of image dimensions to resize canvas correctly
  const handleImageLoad = () => {
    if (drawingImageRef.current) {
      const { clientWidth, clientHeight } = drawingImageRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        setImageBounds({ width: clientWidth, height: clientHeight });
      }
    }
  };

  // Re-run dimension estimation on zoom, page, or document swap
  useEffect(() => {
    const timer = setTimeout(() => {
      handleImageLoad();
    }, 200);
    return () => clearTimeout(timer);
  }, [activePageNum, activeDrawingId, zoomLevel]);

  // Window resize support
  useEffect(() => {
    window.addEventListener('resize', handleImageLoad);
    return () => window.removeEventListener('resize', handleImageLoad);
  }, []);

  // REDRAW CANVAS PATHS EFFECT
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flush old pixels
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!annotationsVisible) return;

    // Sub-routine to render a vector path normalized to percentages (0-100)
    const drawLinePath = (points: Array<{x: number, y: number}>, color: string, cbWidth: number, isHighlighter: boolean) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = cbWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (isHighlighter) {
        ctx.globalAlpha = 0.45;
      } else {
        ctx.globalAlpha = 1.0;
      }

      // Convert percentage coordinates into canvas pixels
      const vx = (val: number) => (val / 100) * canvas.width;
      const vy = (val: number) => (val / 100) * canvas.height;

      ctx.moveTo(vx(points[0].x), vy(points[0].y));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(vx(points[i].x), vy(points[i].y));
      }
      ctx.stroke();
    };

    // Render registered page markups
    pageAnnotations.lines.forEach(l => {
      drawLinePath(l.points, l.color, l.width, l.isHighlighter);
    });

    // Render current active line being drawn drag-and-drop
    if (currentLinePoints.length > 1) {
      drawLinePath(currentLinePoints, markupColor, brushSize, annotationMode === 'highlighter');
    }

    ctx.globalAlpha = 1.0;
  }, [pageAnnotations.lines, currentLinePoints, annotationsVisible, annotationMode, markupColor, brushSize, imageBounds]);

  // CANVAS DRAWING MOUSE EVENTS
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    if (annotationMode === 'none') return;

    if (annotationMode === 'sticky') {
      handleAddStickyNoteAt(offsetX, offsetY);
      setAnnotationMode('none'); // Return to select/neutral mode after drop
      return;
    }

    setIsDrawing(true);
    const px = (offsetX / rect.width) * 100;
    const py = (offsetY / rect.height) * 100;
    setCurrentLinePoints([{ x: px, y: py }]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || annotationMode === 'none' || annotationMode === 'sticky') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentLinePoints(prev => [...prev, { x: px, y: py }]);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentLinePoints.length > 1) {
      setAllPageAnnotations(prev => {
        const pageData = prev[pageKey] || { lines: [], stickyNotes: [] };
        const newLine = {
          points: currentLinePoints,
          color: markupColor,
          width: brushSize,
          isHighlighter: annotationMode === 'highlighter'
        };
        return {
          ...prev,
          [pageKey]: {
            ...pageData,
            lines: [...pageData.lines, newLine]
          }
        };
      });
      showToast('Coretan markup berhasil ditambahkan!', 'success');
    }
    setCurrentLinePoints([]);
  };

  // TOUCH SUPPORT FOR CANVAS
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (annotationMode === 'none' || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;

    if (annotationMode === 'sticky') {
      handleAddStickyNoteAt(offsetX, offsetY);
      setAnnotationMode('none');
      e.preventDefault();
      return;
    }

    setIsDrawing(true);
    const px = (offsetX / rect.width) * 100;
    const py = (offsetY / rect.height) * 100;
    setCurrentLinePoints([{ x: px, y: py }]);
    e.preventDefault();
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || annotationMode === 'none' || annotationMode === 'sticky' || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const px = ((touch.clientX - rect.left) / rect.width) * 100;
    const py = ((touch.clientY - rect.top) / rect.height) * 100;
    setCurrentLinePoints(prev => [...prev, { x: px, y: py }]);
    e.preventDefault();
  };

  // STICKY NOTES MANIPULATIONS
  const handleAddStickyNoteAt = (offsetX: number, offsetY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const px = (offsetX / canvas.width) * 100;
    const py = (offsetY / canvas.height) * 100;

    const newSticky = {
      id: `sticky_${Date.now()}`,
      x: px,
      y: py,
      text: 'Catatan penting: Klik di sini untuk mengganti instruksi gambar kerja.',
      color: stickyColor,
      author: currentUser?.displayName || 'Stakeholder Proyek',
      date: new Date().toLocaleDateString('id-ID'),
      isCollapsed: false
    };

    setAllPageAnnotations(prev => {
      const pageData = prev[pageKey] || { lines: [], stickyNotes: [] };
      return {
        ...prev,
        [pageKey]: {
          ...pageData,
          stickyNotes: [...pageData.stickyNotes, newSticky]
        }
      };
    });
    showToast('Catatan tempel (sticky note) berhasil diletakkan!', 'success');
  };

  const handleToggleStickyColor = (id: string) => {
    setAllPageAnnotations(prev => {
      const pageData = prev[pageKey] || { lines: [], stickyNotes: [] };
      const colors: Array<'yellow' | 'pink' | 'green' | 'blue'> = ['yellow', 'pink', 'green', 'blue'];
      const stickyNotes = pageData.stickyNotes.map(n => {
        if (n.id === id) {
          const currentIdx = colors.indexOf(n.color as any);
          const nextColor = colors[(currentIdx + 1) % colors.length];
          return { ...n, color: nextColor };
        }
        return n;
      });
      return { ...prev, [pageKey]: { ...pageData, stickyNotes } };
    });
  };

  const handleCollapseSticky = (id: string) => {
    setAllPageAnnotations(prev => {
      const pageData = prev[pageKey] || { lines: [], stickyNotes: [] };
      const stickyNotes = pageData.stickyNotes.map(n => {
        if (n.id === id) return { ...n, isCollapsed: true };
        return n;
      });
      return { ...prev, [pageKey]: { ...pageData, stickyNotes } };
    });
  };

  const handleExpandSticky = (id: string) => {
    setAllPageAnnotations(prev => {
      const pageData = prev[pageKey] || { lines: [], stickyNotes: [] };
      const stickyNotes = pageData.stickyNotes.map(n => {
        if (n.id === id) return { ...n, isCollapsed: false };
        return n;
      });
      return { ...prev, [pageKey]: { ...pageData, stickyNotes } };
    });
  };

  const handleDeleteSticky = (id: string) => {
    setAllPageAnnotations(prev => {
      const pageData = prev[pageKey] || { lines: [], stickyNotes: [] };
      const stickyNotes = pageData.stickyNotes.filter(n => n.id !== id);
      return { ...prev, [pageKey]: { ...pageData, stickyNotes } };
    });
    showToast('Catatan tempel terhapus', 'info');
  };

  const handleUpdateStickyText = (id: string, text: string) => {
    setAllPageAnnotations(prev => {
      const pageData = prev[pageKey] || { lines: [], stickyNotes: [] };
      const stickyNotes = pageData.stickyNotes.map(n => {
        if (n.id === id) return { ...n, text };
        return n;
      });
      return { ...prev, [pageKey]: { ...pageData, stickyNotes } };
    });
  };

  const handleUndoLastLine = () => {
    setAllPageAnnotations(prev => {
      const pageData = prev[pageKey] || { lines: [], stickyNotes: [] };
      if (pageData.lines.length === 0) return prev;
      return {
        ...prev,
        [pageKey]: {
          ...pageData,
          lines: pageData.lines.slice(0, -1)
        }
      };
    });
    showToast('Membatalkan (Undo) coretan terakhir', 'info');
  };

  const handleClearAllPageAnnotations = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua coretan dan catatan tempel di halaman gambar ini?')) {
      setAllPageAnnotations(prev => {
        return {
          ...prev,
          [pageKey]: { lines: [], stickyNotes: [] }
        };
      });
      showToast('Seluruh coretan & catatan tempel halaman ini telah dibersihkan!', 'warning');
    }
  };

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

  // Convert img to base64 safely 
  const getBase64Image = (imgUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataURL);
          } catch (e) {
            resolve(imgUrl);
          }
        } else {
          resolve(imgUrl);
        }
      };
      img.onerror = () => {
        resolve(imgUrl);
      };
      img.src = imgUrl;
    });
  };

  // Function to export Drawing page as high-fidelity PDF report
  const handleExportPDF = async () => {
    if (!activePage) {
      showToast('Tidak ada gambar aktif untuk diekspor!', 'error');
      return;
    }

    setIsExportingPDF(true);
    showToast('Sedang mempersiapkan rendering berkas PDF teknik...', 'info');

    try {
      // Create jsPDF in Landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // A4 Landscape dimensions: 297mm x 210mm
      const pageWidth = 297;
      const pageHeight = 210;

      // Draw background pattern/header frame for drawing sheet look
      doc.setFillColor(15, 23, 42); // slate-900 border accent
      doc.rect(0, 0, pageWidth, 5, 'F'); // top thin border
      doc.rect(0, pageHeight - 5, pageWidth, 5, 'F'); // bottom thin border

      // Primary header text
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text('LAPORAN EVALUASI & REVISI GAMBAR KERJA (DED)', 15, 14);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Proyek: PEMBANGUNAN RUMAH KOST JATI TUJUH MAJALENGKA | Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID')}`, 15, 19);

      // Page specification stamps on the top-right
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text(`${activePage.pageCode}`, pageWidth - 15, 14, { align: 'right' });

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Kategori: ${activeDrawing?.category || 'Umum'} (Halaman ${activePageNum} dari ${activeDrawing?.totalPage})`, pageWidth - 15, 19, { align: 'right' });

      // Separator line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.4);
      doc.line(15, 22, pageWidth - 15, 22);

      // Process and insert drawing plan image
      let base64Img = activePage.image;
      if (base64Img.startsWith('http') || base64Img.startsWith('/')) {
        base64Img = await getBase64Image(activePage.image);
      }

      // Calculate placement dimensions of the plan
      const imageRatio = imageBounds.width / imageBounds.height || 1.4; // fallback to generic ratios if 0
      let imgW = 267; // max screen width (297 - 30)
      let imgH = 267 / imageRatio;

      if (imgH > 165) {
        imgH = 165;
        imgW = 165 * imageRatio;
      }

      const imgX = 15 + (267 - imgW) / 2;
      const imgY = 24 + (165 - imgH) / 2;

      // Draw outer background border for the plan
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.rect(imgX - 1, imgY - 1, imgW + 2, imgH + 2, 'FD');

      // Check if image format is PNG or JPEG
      const isPng = base64Img.toLowerCase().includes('.png') || base64Img.startsWith('data:image/png');
      const format = isPng ? 'PNG' : 'JPEG';

      // Attempt to embed static drawing plan
      try {
        doc.addImage(base64Img, format, imgX, imgY, imgW, imgH);
      } catch (err) {
        // Fallback placeholder with warning if image render fails
        doc.setFillColor(241, 245, 249);
        doc.rect(imgX, imgY, imgW, imgH, 'F');
        doc.setFontSize(10);
        doc.setTextColor(220, 38, 38);
        doc.text('Gagal memuat visual gambar asli. Melakukan rendering annotations di atas kanvas kosong.', pageWidth / 2, imgY + imgH / 2, { align: 'center' });
      }

      // Draw markup vector lines onto the PDF image box
      if (pageAnnotations.lines && pageAnnotations.lines.length > 0) {
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : { r: 239, g: 68, b: 68 };
        };

        pageAnnotations.lines.forEach(l => {
          if (l.points.length < 2) return;
          const pdfLineWidth = (l.width / 4) * 0.45;
          doc.setLineWidth(pdfLineWidth);
          const rgb = hexToRgb(l.color);
          doc.setDrawColor(rgb.r, rgb.g, rgb.b);

          // Configure translucent highlighter effects where browser-compatible
          // @ts-ignore
          if (l.isHighlighter && typeof doc.GState === 'function') {
            // @ts-ignore
            doc.setGState(new doc.GState({ opacity: 0.45 }));
          } else {
            // @ts-ignore
            if (typeof doc.GState === 'function') {
              // @ts-ignore
              doc.setGState(new doc.GState({ opacity: 1.0 }));
            }
          }

          // Output point to point connection
          for (let i = 0; i < l.points.length - 1; i++) {
            const p1 = l.points[i];
            const p2 = l.points[i + 1];
            const x1 = imgX + (p1.x / 100) * imgW;
            const y1 = imgY + (p1.y / 100) * imgH;
            const x2 = imgX + (p2.x / 100) * imgW;
            const y2 = imgY + (p2.y / 100) * imgH;
            doc.line(x1, y1, x2, y2);
          }
        });

        // Reset system opacity GState
        // @ts-ignore
        if (typeof doc.GState === 'function') {
          // @ts-ignore
          doc.setGState(new doc.GState({ opacity: 1.0 }));
        }
      }

      // Plot STICKY NOTES markers on top of the plan as visual hotkeys
      if (pageAnnotations.stickyNotes && pageAnnotations.stickyNotes.length > 0) {
        const colorsMapRGB: Record<string, { r: number; g: number; b: number }> = {
          yellow: { r: 217, g: 119, b: 6 }, // dark amber
          pink: { r: 225, g: 29, b: 72 }, // deep rose
          green: { r: 5, g: 150, b: 105 }, // emerald
          blue: { r: 13, g: 148, b: 136 } // teal
        };

        pageAnnotations.stickyNotes.forEach((note, idx) => {
          const ptX = imgX + (note.x / 100) * imgW;
          const ptY = imgY + (note.y / 100) * imgH;
          const config = colorsMapRGB[note.color] || colorsMapRGB.yellow;

          // Drawing circles & numbers inside
          doc.setFillColor(config.r, config.g, config.b);
          doc.setDrawColor(255, 255, 255);
          doc.setLineWidth(0.4);
          doc.circle(ptX, ptY, 4, 'FD'); // 4mm circle diameter

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.text(`M${idx + 1}`, ptX, ptY + 0.9, { align: 'center' });
        });
      }

      // Plot stakeholder comments / markers as well (Indigo color)
      if (activePage.comments && activePage.comments.length > 0) {
        activePage.comments.forEach((comm, idx) => {
          if (comm.pin) {
            const ptX = imgX + (comm.pin.x / 100) * imgW;
            const ptY = imgY + (comm.pin.y / 100) * imgH;

            doc.setFillColor(79, 70, 229); // indigo-600
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.4);
            doc.circle(ptX, ptY, 4, 'FD');

            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(`P${idx + 1}`, ptX, ptY + 0.9, { align: 'center' });
          }
        });
      }

      // Output drawing title/metadata stamp
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`${activePage.pageCode}: ${activePage.title}`, imgX + 3, imgY + imgH - 3);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(115, 115, 115);
      doc.text('Sketsa ini berisi coretan modifikasi revisi struktur resmi tim teknis SPPI', imgX + 3, imgY + imgH - 0.5);

      // PAGE 2: PUNCH LIST & TECHNICAL COMMENT CRITIQUE TABLE
      if (
        (pageAnnotations.stickyNotes && pageAnnotations.stickyNotes.length > 0) ||
        (activePage.comments && activePage.comments.length > 0)
      ) {
        doc.addPage('landscape');

        // Page Header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 5, 'F');
        doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text('REKAP DAFTAR REVISI & CATATAN PENILAIAN TEKNIS (PUNCH LIST)', 15, 15);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Detail masukan gambar kerja lembar: ${activePage.pageCode} - ${activePage.title}`, 15, 19);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(15, 22, pageWidth - 15, 22);

        let curY = 27;

        // Table 1: Sticky note / memo annotations from user
        if (pageAnnotations.stickyNotes && pageAnnotations.stickyNotes.length > 0) {
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(`1. Memo Tambahan & Catatan Tempel Halaman (${pageAnnotations.stickyNotes.length} item)`, 15, curY);
          curY += 4;

          const stickyRows = pageAnnotations.stickyNotes.map((note, ix) => [
            `M${ix + 1}`,
            `X:${Math.round(note.x)}%, Y:${Math.round(note.y)}%`,
            note.color.toUpperCase(),
            note.author,
            note.date,
            note.text
          ]);

          autoTable(doc, {
            head: [['Ref', 'Koordinat', 'Warna Kategori', 'Pengunggah / Author', 'Tanggal', 'Instruksi Kerja & Deskripsi Koreksi']],
            body: stickyRows,
            startY: curY,
            margin: { left: 15, right: 15 },
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontStyle: 'bold' }, // golden/amber theme
            columnStyles: {
              0: { cellWidth: 10, fontStyle: 'bold' },
              1: { cellWidth: 25 },
              2: { cellWidth: 30 },
              3: { cellWidth: 40 },
              4: { cellWidth: 25 },
              5: { cellWidth: 135 }
            },
            theme: 'grid'
          });

          // Update curY based on previous autoTable height
          // @ts-ignore
          curY = doc.lastAutoTable.finalY + 8;
        }

        // Table 2: Formal Pinpoint Comments
        if (activePage.comments && activePage.comments.length > 0) {
          if (curY > 180) {
            doc.addPage('landscape');
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageWidth, 5, 'F');
            doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');
            curY = 15;
          }

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text(`2. Komentar Evaluasi & Pinpoint Kolaborasi (${activePage.comments.length} Masukan)`, 15, curY);
          curY += 4;

          const commentRows = activePage.comments.map((comm, ix) => [
            comm.pin ? `P${ix + 1}` : 'Umum',
            comm.pin ? `X:${Math.round(comm.pin.x)}%, Y:${Math.round(comm.pin.y)}%` : '-',
            comm.sender,
            comm.role === 'owner' ? 'Owner / Pemilik' : comm.role === 'contractor' ? 'Kontraktor Utama' : 'Konsultan Pengawas / QS',
            comm.time,
            comm.text
          ]);

          autoTable(doc, {
            head: [['Ref', 'Koordinat Pin', 'Nama Stakeholder', 'Peran Sektor', 'Waktu', 'Komentar Evaluasi Teknik']],
            body: commentRows,
            startY: curY,
            margin: { left: 15, right: 15 },
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' }, // indigo theme
            columnStyles: {
              0: { cellWidth: 15, fontStyle: 'bold' },
              1: { cellWidth: 25 },
              2: { cellWidth: 35 },
              3: { cellWidth: 45 },
              4: { cellWidth: 25 },
              5: { cellWidth: 120 }
            },
            theme: 'grid'
          });
        }
      }

      // Download PDF File with clean descriptive naming
      const formattedTitle = activePage.title.toLowerCase().replace(/\s+/g, '_');
      const filename = `Revisi_${activePage.pageCode}_${formattedTitle}.pdf`;
      doc.save(filename);
      showToast(`Berkas PDF "${filename}" berhasil diekspor!`, 'success');

    } catch (e: any) {
      console.error(e);
      showToast('Gagal melakukan generasi PDF: ' + e.message, 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

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

  const handleRootDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const canUpload = ['Super Admin', 'Owner', 'Project Manager', 'Konsultan'].includes(currentRole);
    if (!canUpload) return;
    setIsRootDragging(true);
  };

  const handleRootDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRootDragging(false);
  };

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRootDragging(false);

    const canUpload = ['Super Admin', 'Owner', 'Project Manager', 'Konsultan'].includes(currentRole);
    if (!canUpload) {
      showToast('Peran Anda tidak memiliki izin untuk mengunggah gambar kerja baru.', 'error');
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isAllowedType = file.type === 'application/pdf' || file.type.startsWith('image/') || file.name.endsWith('.pdf');
      if (!isAllowedType) {
        showToast('Tipe berkas tidak didukung. Harap unggah berkas PDF atau gambar.', 'error');
        return;
      }
      setSelectedFile(file);
      setNewFileName(file.name);
      setShowUploadModal(true);
      showToast(`Berkas "${file.name}" siap diunggah. Silakan lengkapi formulir detail pengerjaan.`, 'info');
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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setNewFileName(file.name);
    }
  };

  // Convert and compress selected image file to base64
  const getCompressedImageDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve('');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } else {
            resolve(e.target?.result as string || '');
          }
        };
        img.onerror = () => {
          resolve(e.target?.result as string || '');
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Simulating an upload with real progress bar and image loading
  const handleUploadDrawingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      showToast('Mohon lampirkan file atau isi nama berkas PDF', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let uploadedImageSrc = '';
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        uploadedImageSrc = await getCompressedImageDataURL(selectedFile);
      }
    }

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
      
      const defaultCategoryFallback = 
        newFileCategory === 'Arsitektur' 
          ? 'https://images.unsplash.com/photo-1503387762-592dedb802d7?q=80&w=1200' 
          : newFileCategory === 'Struktur & Sipil'
          ? 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=1200'
          : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200';

      const finalPageImage = uploadedImageSrc || defaultCategoryFallback;

      for (let i = 1; i <= newFilePagesCount; i++) {
        generatedPages.push({
          pageCode: `${newFileCategory === 'Arsitektur' ? 'A' : newFileCategory === 'Struktur & Sipil' ? 'S' : 'V'}-0${i}`,
          title: `Halaman Detail Kerja ${newFileCategory} #${i}`,
          description: `Gambar DED hasil konversi digital PDF terverifikasi untuk kategori pekerjaan: ${newFileCategory}.`,
          category: newFileCategory,
          scale: '1:100',
          image: finalPageImage,
          specifications: ['Sesuai standar teknis SNI', 'Menjalani approval bersama owner'],
        });
      }

      if (uploadType === 'version' && selectedParentDrawingId) {
        updateDrawingVersion(selectedParentDrawingId, newDrawingVersionCode, newDrawingChangeNotes || 'Pembaruan versi gambar teknik', newFilePagesCount, generatedPages);
        setActiveDrawingId(selectedParentDrawingId);
        setSelectedVersion(newDrawingVersionCode);
      } else {
        addDrawingFile(finalName, newFilePagesCount, generatedPages);
      }
      
      // Reset upload states
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setNewFileName('');
      setShowUploadModal(false);

      if (uploadedImageSrc) {
        showToast('Gambar berhasil diproses dan disematkan langsung!', 'success');
      } else {
        showToast('Kiat: Unggah file gambar (PNG/JPG) untuk rendering denah langsung di layar!', 'info');
      }
    }, 2000);
  };

  return (
    <div 
      className="w-full flex flex-col gap-6 relative" 
      id="drawing-viewer-root"
      onDragOver={handleRootDragOver}
    >
      {/* GLOBAL DRAG OVERLAY FOR AUTHORIZED ROLES */}
      {isRootDragging && (
        <div 
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={handleRootDragLeave}
          onDrop={handleRootDrop}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-[4px] border-4 border-dashed border-indigo-500 rounded-2xl z-[100] flex flex-col items-center justify-center text-center p-6"
        >
          <div className="bg-white text-indigo-600 p-6 rounded-full shadow-2xl mb-4 transform scale-110 animate-bounce">
            <Upload className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Lepaskan Berkas Gambar / PDF di Sini
          </h3>
          <p className="text-sm text-slate-300 mt-2 font-medium max-w-md leading-relaxed">
            Lepaskan berkas di area mana saja untuk mengunggah gambar kerja baru. Otorisasi aktif sebagai: <span className="text-indigo-400 font-bold">{currentRole}</span>.
          </p>
        </div>
      )}
      
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
              disabled={drawingFiles.length === 0}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-60"
            >
              {drawingFiles.length > 0 ? (
                drawingFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.fileName} ({file.totalPage} Hlm)
                  </option>
                ))
              ) : (
                <option value="">(Belum Ada Gambar Kerja)</option>
              )}
            </select>
          </div>

          {/* VERSION CONTROL SELECTOR */}
          {activeDrawing && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs font-semibold text-slate-400 font-mono hidden lg:inline">Versi:</span>
              <select
                value={selectedVersion}
                onChange={(e) => {
                  setSelectedVersion(e.target.value);
                  setPendingPin(null);
                  setIsPlacingPin(false);
                  showToast(`Menampilkan Gambar Versi: ${e.target.value}`, 'info');
                }}
                className="px-3 py-2 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-lg text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                title="Pilih Versi Gambar Kerja"
              >
                {availableVersions.map((ver) => (
                  <option key={ver.version} value={ver.version}>
                    {ver.version} {ver.version === (activeDrawing.version || 'v1.0') ? '★ (Terbaru)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {['Super Admin', 'Owner', 'Project Manager'].includes(currentRole) && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
              {drawingFiles.length > 0 ? (
                <button
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin mengosongkan semua data gambar kerja dari sistem?')) {
                      clearAllDrawings();
                    }
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Kosongkan Semua Gambar Kerja"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Kosongkan Data</span>
                </button>
              ) : (
                <button
                  onClick={resetDrawingsToDefault}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Kembalikan Gambar Bawaan (Default)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Reset Default</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CORE INTERACTIVE VIEWPORT CONTAINER */}
      {drawingFiles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR: THUMBNAIL NAVIGATOR (cols 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-3 shadow-sm h-[680px] overflow-y-auto flex flex-row lg:flex-col gap-3">
          <div className="hidden lg:block pb-2 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
              Halaman Gambar
            </span>
          </div>

          {activePages.map((page) => (
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
                  const currentIndex = activePages.findIndex(p => p.pageNumber === activePageNum);
                  if (currentIndex > 0) {
                    setActivePageNum(activePages[currentIndex - 1].pageNumber);
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
                {activePageNum} / {activePages.length}
              </span>

              <button
                onClick={() => {
                  const currentIndex = activePages.findIndex(p => p.pageNumber === activePageNum);
                  if (currentIndex > -1 && currentIndex < activePages.length - 1) {
                    setActivePageNum(activePages[currentIndex + 1].pageNumber);
                    setPendingPin(null);
                    setIsPlacingPin(false);
                  }
                }}
                disabled={activePageNum === (activePages.length || 1)}
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

              <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className={`p-1.5 rounded transition font-medium flex items-center gap-1.5 text-[11px] ${
                  isExportingPDF
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/85'
                }`}
                title="Ekspor Gambar & Anotasi ke PDF (DED)"
              >
                {isExportingPDF ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Ekspor PDF</span>
              </button>
            </div>
          </div>

          {/* Sub Toolbar for High-Fidelity App Annotation & Markup Tools */}
          <div className="bg-slate-900 border-b border-slate-800 p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-inner">
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 bg-indigo-500/10 text-indigo-400 font-mono font-black text-[9px] rounded uppercase tracking-wider">
                ALAT REVISI TEKNIS (MARKUP)
              </span>
              <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
              
              {/* Tool Mode Toggles */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setAnnotationMode('none')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                    annotationMode === 'none'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Mode navigasi standar"
                >
                  <span>Monev Geser (Pan)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAnnotationMode('pen');
                    setIsPlacingPin(false);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                    annotationMode === 'pen'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Gunakan pena coretan merah"
                >
                  <PenTool className="w-3 h-3" />
                  <span>Coret Pena</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAnnotationMode('highlighter');
                    setIsPlacingPin(false);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                    annotationMode === 'highlighter'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Gunakan highlighter transparan"
                >
                  <Highlighter className="w-3 h-3" />
                  <span>Stabilo Area</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAnnotationMode('sticky');
                    setIsPlacingPin(false);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1 ${
                    annotationMode === 'sticky'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Klik di atas gambar untuk menempelkan memo"
                >
                  <FileText className="w-3 h-3" />
                  <span>Memo Tempel</span>
                </button>
              </div>
            </div>

            {/* Custom Tool Controls depending on mode */}
            <div className="flex items-center gap-3">
              {/* PEN/HIGHLIGHTER STYLING TOOLS */}
              {(annotationMode === 'pen' || annotationMode === 'highlighter') && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-[10px] text-slate-400">Warna:</span>
                  <div className="flex items-center gap-1">
                    {['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#A855F7'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setMarkupColor(c)}
                        className={`w-4 h-4 rounded-full border transition-transform ${
                          markupColor === c ? 'scale-125 border-white ring-2 ring-indigo-500/50' : 'border-transparent scale-90 opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <div className="h-4 w-[1px] bg-slate-800"></div>

                  <span className="text-[10px] text-slate-400 font-sans">Ketebalan:</span>
                  <select
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 transform scale-90 select-none cursor-pointer"
                  >
                    <option value={2}>Sangat Tipis (2px)</option>
                    <option value={4}>Sedang (4px)</option>
                    <option value={8}>Tebal (8px)</option>
                    <option value={14}>Ekstra Lebar (14px)</option>
                  </select>
                </div>
              )}

              {/* STICKY STYLINGS */}
              {annotationMode === 'sticky' && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-[10px] text-slate-400">Warna Memo:</span>
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    {[
                      { key: 'yellow', hex: '#FEF3C7', label: 'Kuning' },
                      { key: 'pink', hex: '#FFE4E6', label: 'Merah Muda' },
                      { key: 'green', hex: '#D1FAE5', label: 'Hijau' },
                      { key: 'blue', hex: '#E0F2FE', label: 'Biru' }
                    ].map((col) => (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => setStickyColor(col.key)}
                        className={`w-3.5 h-3.5 rounded-sm border transition-all ${
                          stickyColor === col.key
                            ? 'ring-2 ring-indigo-400 border-white scale-110'
                            : 'border-slate-600 scale-90 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS (UNDO, EYE, TRASH) */}
              <div className="flex items-center gap-1.5 ml-2 bg-slate-950/45 p-1 rounded-lg border border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setAnnotationsVisible(prev => !prev)}
                  className={`p-1.5 rounded transition ${
                    annotationsVisible ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800'
                  }`}
                  title={annotationsVisible ? "Sembunyikan coretan & catatan" : "Tampilkan coretan & catatan"}
                >
                  {annotationsVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                </button>
                
                <button
                  type="button"
                  onClick={handleUndoLastLine}
                  disabled={pageAnnotations.lines.length === 0}
                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-35 disabled:pointer-events-none rounded hover:bg-slate-800 transition"
                  title="Undo coretan terakhir"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleClearAllPageAnnotations}
                  disabled={pageAnnotations.lines.length === 0 && pageAnnotations.stickyNotes.length === 0}
                  className="p-1.5 text-slate-400 hover:text-red-400 disabled:opacity-35 disabled:pointer-events-none rounded hover:bg-slate-800 transition"
                  title="Hapus seluruh coretan & memo halaman ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950 relative min-h-0 select-none">
            
            {/* INSTRUCTIONS OR PLACING MODE TOP HEADER BAR */}
            {isPlacingPin && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-slate-950 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md z-20 flex items-center gap-1 px-4 animate-bounce animate-duration-1000">
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

            {/* FLOATING MARKUP NOTICE ROW */}
            {annotationMode !== 'none' && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-1.5 border border-indigo-400 animate-pulse">
                {annotationMode === 'pen' && (
                  <>
                    <PenTool className="w-3 h-3 text-rose-300" />
                    <span>Mode Coretan Aktif: Seret kursor/jari pada gambar teknik untuk menggambar</span>
                  </>
                )}
                {annotationMode === 'highlighter' && (
                  <>
                    <Highlighter className="w-3 h-3 text-amber-300" />
                    <span>Mode Stabilo Aktif: Gunakan untuk menandai area kritis konstruksi</span>
                  </>
                )}
                {annotationMode === 'sticky' && (
                  <>
                    <FileText className="w-3 h-3 text-teal-300" />
                    <span>Mode Catatan Tempel: Klik lokasi tertentu pada gambar konstruksi untuk meletakkan memo</span>
                  </>
                )}
                <button 
                  onClick={() => setAnnotationMode('none')}
                  className="ml-2 bg-indigo-700 hover:bg-indigo-800 rounded px-1 text-[9px] font-mono"
                >
                  Batal
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
                onLoad={handleImageLoad}
                onClick={handleImageClick}
                className={`max-w-full max-h-[500px] object-contain rounded border border-slate-800 ${
                  isPlacingPin ? 'cursor-cell border-yellow-400/80 ring-2 ring-yellow-400/20' : 'cursor-default'
                }`}
                referrerPolicy="no-referrer"
              />

              {/* TRANSPARENT VECTOR DRAWING OVERLAY */}
              <canvas
                ref={canvasRef}
                width={imageBounds.width}
                height={imageBounds.height}
                style={{ width: `${imageBounds.width}px`, height: `${imageBounds.height}px` }}
                className={`absolute top-0 left-0 z-10 hover:cursor-crosshair ${
                  annotationMode === 'none' ? 'pointer-events-none' : 'pointer-events-auto'
                }`}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasMouseUp}
              />

              {/* INTERACTIVE STICKY NOTATIONS */}
              {annotationsVisible && pageAnnotations.stickyNotes.map((note) => {
                const colorsMap: Record<string, { bg: string; border: string; text: string; input: string }> = {
                  yellow: {
                    bg: 'bg-amber-100/95 hover:bg-amber-100',
                    border: 'border-amber-300/80',
                    text: 'text-amber-900',
                    input: 'bg-amber-50/75 text-amber-950 focus:ring-amber-500'
                  },
                  pink: {
                    bg: 'bg-rose-100/95 hover:bg-rose-100',
                    border: 'border-rose-300/80',
                    text: 'text-rose-900',
                    input: 'bg-rose-50/75 text-rose-950 focus:ring-rose-500'
                  },
                  green: {
                    bg: 'bg-emerald-100/95 hover:bg-emerald-100',
                    border: 'border-emerald-300/80',
                    text: 'text-emerald-900',
                    input: 'bg-emerald-50/75 text-emerald-950 focus:ring-emerald-500'
                  },
                  blue: {
                    bg: 'bg-sky-100/95 hover:bg-sky-100',
                    border: 'border-sky-300/80',
                    text: 'text-sky-900',
                    input: 'bg-sky-50/75 text-sky-950 focus:ring-sky-500'
                  }
                };

                const currentColors = colorsMap[note.color] || colorsMap.yellow;

                return (
                  <div
                    key={note.id}
                    className="absolute z-20 group select-text pointer-events-auto sticky-note-entrance"
                    style={{ left: `${note.x}%`, top: `${note.y}%` }}
                  >
                    {!note.isCollapsed ? (
                      <div className={`p-2.5 rounded-lg shadow-xl border ${currentColors.bg} ${currentColors.border} w-52 text-left text-xs transition relative flex flex-col gap-1.5`}>
                        {/* Header toolbar */}
                        <div className="flex items-center justify-between border-b pb-1 border-black/10 select-none">
                          <span className="font-extrabold font-sans text-[9px] opacity-75 truncate max-w-[100px]">
                            {note.author} ({note.date})
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStickyColor(note.id);
                              }}
                              className="w-3.5 h-3.5 rounded-full border border-black/25 bg-gradient-to-r from-yellow-350 via-rose-350 to-sky-350 shadow-inner"
                              title="Ganti warna memo"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCollapseSticky(note.id);
                              }}
                              className="text-slate-600 hover:text-slate-950 font-bold px-1 hover:bg-black/5 rounded text-[10px]"
                              title="Tutup (Minimize)"
                            >
                              −
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSticky(note.id);
                              }}
                              className="text-red-600 hover:text-rose-700 p-0.5 hover:bg-black/5 rounded"
                              title="Hapus Memo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Text Editing Area */}
                        <textarea
                          value={note.text}
                          onChange={(e) => {
                            handleUpdateStickyText(note.id, e.target.value);
                          }}
                          className={`w-full text-[10px] font-medium p-1 rounded border border-black/10 resize-none h-14 focus:outline-none focus:ring-1 ${currentColors.input}`}
                          placeholder="Tulis koreksi di sini..."
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleExpandSticky(note.id)}
                        className={`p-1.5 rounded-full border shadow-md flex items-center justify-center ${currentColors.bg} ${currentColors.border} hover:scale-110 active:scale-95 transition-transform`}
                        title={`Klik untuk memperbesar memo: "${note.text.substring(0, 15)}...`}
                      >
                        <FileText className={`w-3.5 h-3.5 ${currentColors.text}`} />
                      </button>
                    )}
                  </div>
                );
              })}

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
              <div className="flex flex-col gap-5">
                {/* VERSION TIMELINE SECTION */}
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                    Silsilah Versi Gambar Kerja (VCS)
                  </span>

                  <div className="space-y-3">
                    {availableVersions.map((ver) => {
                      const isCurrentViewed = selectedVersion === ver.version;
                      const isLatestInFile = ver.version === (activeDrawing.version || 'v1.0');

                      return (
                        <div 
                          key={ver.version}
                          className={`p-3 rounded-xl border text-xs transition relative overflow-hidden ${
                            isCurrentViewed 
                              ? 'border-indigo-400 bg-indigo-50/20 shadow-xs ring-2 ring-indigo-500/10' 
                              : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                          }`}
                        >
                          {isCurrentViewed && (
                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-bl">
                              Sedang Dibuka
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-extrabold rounded text-[10px] font-mono">
                              {ver.version}
                            </span>
                            {isLatestInFile && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">
                                TERBARU
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 text-slate-600">
                            <p className="font-semibold text-slate-800 leading-normal pl-1">
                              {ver.changeNotes || 'Inisiasi gambar kerja awal'}
                            </p>

                            <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-2">
                              <span>{ver.uploadedDate} &bull; {ver.uploadedBy.split(' ')[0]}</span>
                              {!isCurrentViewed && (
                                <button
                                  onClick={() => {
                                    setSelectedVersion(ver.version);
                                    setActivePageNum(1);
                                    showToast(`Beralih ke gambar versi ${ver.version}`, 'success');
                                  }}
                                  className="text-[9px] font-bold text-indigo-600 hover:underline cursor-pointer bg-transparent border-0"
                                >
                                  Muat Versi &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ACTIVITY AUDIT LOG SECTION */}
                <div className="border-t border-slate-100 pt-4 mt-1">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                    Log Aktivitas & Audit Lapangan
                  </span>

                  <div className="relative border-l border-slate-150 pl-4 ml-2 space-y-4 text-xs text-slate-600 max-h-[220px] overflow-y-auto pr-1">
                    {activeDrawing.changeHistory ? (
                      activeDrawing.changeHistory.map((history, idx) => (
                        <div key={idx} className="relative">
                          {/* Dot marker */}
                          <div className="absolute -left-[20.5px] top-1 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white"></div>
                          
                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                            <span className="text-[9px] font-mono text-indigo-600 block mb-0.5">
                              {history.date} &bull; {history.user}
                            </span>
                            <p className="text-slate-700 font-semibold leading-relaxed text-[11px]">
                              {history.action}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">Belum ada riwayat audit terekam.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center select-none">
            <span className="text-[10px] text-slate-400 font-bold block">
              SISTEM PROTEKSI SPPI &bull; VERSI REVISI {activePages[0]?.pageCode.startsWith('A') ? 'REV-3' : 'REV-1'}
            </span>
          </div>

        </div>

      </div>
      ) : (
        /* STUNNING EMPTY STATE SCREEN */
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center max-w-3xl mx-auto my-6 w-full">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Katalog Gambar Kerja Kosong</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
            Tidak ada dokumen gambar teknik (DED) yang aktif saat ini. Anda dapat mengunggah berkas PDF/Gambar baru atau menyeret berkas ke area mana pun di layar ini untuk memprosesnya secara instan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            {['Super Admin', 'Owner', 'Project Manager', 'Konsultan'].includes(currentRole) ? (
              <>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Upload className="w-4 h-4" />
                  Unggah Gambar Pertama
                </button>
                <button
                  onClick={resetDrawingsToDefault}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Gunakan Gambar Standar (Default)
                </button>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 max-w-sm">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Hanya Super Admin, Owner, Project Manager, atau Konsultan yang diizinkan mengunggah gambar kerja baru.</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                                    {/* UPLOAD TYPE SWITCHER (VCS INTEGRATION) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase block">
                        Tipe Unggahan Gambar Kerja
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setUploadType('new')}
                          className={`py-1.5 text-xs font-bold rounded-md transition ${
                            uploadType === 'new'
                              ? 'bg-white text-indigo-600 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Gambar Kerja Baru
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadType('version')}
                          className={`py-1.5 text-xs font-bold rounded-md transition ${
                            uploadType === 'version'
                              ? 'bg-white text-indigo-600 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Revisi Versi Baru
                        </button>
                      </div>
                    </div>

                    {/* CONDITIONAL FIELD: PARENT DRAWING FOR REVISION */}
                    {uploadType === 'version' && drawingFiles.length > 0 && (
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Pilih Gambar Yang Direvisi (Induk)
                        </label>
                        <select
                          value={selectedParentDrawingId}
                          onChange={(e) => setSelectedParentDrawingId(e.target.value)}
                          className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-bold"
                        >
                          {drawingFiles.map((df) => (
                            <option key={df.id} value={df.id}>
                              {df.fileName} (Versi Aktif: {df.version || 'v1.0'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* DYNAMIC METADATA INPUTS */}
                    {uploadType === 'new' ? (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                            Nama Berkas PDF Baru
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
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                              Nomor Versi Baru
                            </label>
                            <input
                              type="text"
                              required
                              value={newDrawingVersionCode}
                              onChange={(e) => setNewDrawingVersionCode(e.target.value)}
                              placeholder="Contoh: v1.1"
                              className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-bold font-mono text-center"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                              Jumlah Halaman Revisi
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
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                            Deskripsi Perubahan / Riwayat Revisi
                          </label>
                          <textarea
                            required
                            rows={2}
                            value={newDrawingChangeNotes}
                            onChange={(e) => setNewDrawingChangeNotes(e.target.value)}
                            placeholder="Contoh: Pembalokan struktur utama lantai 2 disesuaikan dengan beban gempa SNI-2026."
                            className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 text-xs leading-normal"
                          />
                        </div>
                      </>
                    )}

                    <div className="bg-indigo-50 rounded-lg p-3 text-xs leading-relaxed text-indigo-700 font-medium font-sans">
                      {uploadType === 'new' 
                        ? 'Sistem otomatis mengonversi file ini secara lokal. Halaman detail dihasilkan otomatis untuk kelancaran preview kolaboratif.' 
                        : 'Gambar versi revisi baru akan terikat pada dokumen induk ini. Pengguna lain dapat melacak riwayat perubahan serta memilih versi lewat dropdown VCS.'}
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
