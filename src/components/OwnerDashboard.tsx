import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Layers, 
  Sliders, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  ClipboardCheck, 
  Wrench, 
  Sparkles,
  RefreshCw,
  Clock,
  Percent,
  Plus,
  CheckCircle,
  FileText,
  AlertTriangle,
  Briefcase,
  Image as ImageIcon,
  Search,
  MessageSquare,
  ZoomIn,
  Check,
  Edit,
  Trash2,
  User,
  Info,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Compass,
  Upload,
  Eye,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Live Assets Import for PDF Blueprint Viewer
import frontImage from '../assets/images/majalengka_kost_front_1781714630858.jpg';
import poolImage from '../assets/images/majalengka_kost_pool_1781714653066.jpg';
import blueprintImage from '../assets/images/majalengka_kost_blueprint_1781714675636.jpg';

export const OwnerDashboard: React.FC = () => {
  const { 
    projectStats, 
    progressItems, 
    weeklyData, 
    monthlyCashflow, 
    generateReport, 
    currentRole,
    addNotification,
    showToast,
    currentUser,
    drawingFiles,
    addDrawingFile,
    addDrawingComment,
    setActiveTab
  } = useApp();

  // Active hover states on chart to make it dynamic
  const [activeWeekIdx, setActiveWeekIdx] = useState<number | null>(null);
  const [activeCashIdx, setActiveCashIdx] = useState<number | null>(null);

  // States for drawings dynamic upload modal
  const [showUploadDrawingModal, setShowUploadDrawingModal] = useState<boolean>(false);
  const [newDrawingFileName, setNewDrawingFileName] = useState<string>('');
  const [newDrawingFilePagesCount, setNewDrawingFilePagesCount] = useState<number>(3);
  const [newDrawingFileCategory, setNewDrawingFileCategory] = useState<'Arsitektur' | 'Struktur & Sipil' | 'Visualisasi 3D'>('Struktur & Sipil');
  const [selectedDrawingFile, setSelectedDrawingFile] = useState<File | null>(null);
  const [isDrawingDragging, setIsDrawingDragging] = useState<boolean>(false);
  const [isDrawingUploading, setIsDrawingUploading] = useState<boolean>(false);
  const [drawingUploadProgress, setDrawingUploadProgress] = useState<number>(0);

  const drawingFileInputRef = React.useRef<HTMLInputElement>(null);

  const [commentsMap, setCommentsMap] = useState<Record<string, Array<{user: string, role: string, text: string, date: string}>>>(() => {
    const saved = localStorage.getItem('sppi_pdf_comments');
    if (saved) return JSON.parse(saved);
    return {
      "A 01": [
        { user: "Radit Widjaya", role: "Super Admin", text: "Fasad utama sangat memuaskan, sangat proporsional dengan ornamen pintu lengkung gedung.", date: "2026-06-18 10:15" }
      ],
      "A 02": [
        { user: "Budi Santoso", role: "Project Manager", text: "Selasar kolam renang pastikan menggunakan batu alam anti-slip demi tingkat keselamatan prima.", date: "2026-06-19 14:20" },
        { user: "ArchiPlan Specialist", role: "Konsultan", text: "Layout lobi utama sudah dioptimasi untuk kelancaran arus keluar masuk tamu.", date: "2026-06-19 16:10" }
      ],
      "A 04": [
        { user: "Budi Santoso", role: "Project Manager", text: "Modul kolom struktur K-350 mutlak diperiksa tulangan utamanya sebelum jadwal cor akhir pekan.", date: "2026-06-20 09:30" }
      ],
      "A 05": [
        { user: "H. Sulaiman", role: "Investor", text: "Pondasi bored pile 12m memberi rasa aman tinggi untuk pencegahan risiko getaran tanah.", date: "2026-06-15 11:45" }
      ],
      "A 12": [
        { user: "PT. Foresyndo Global Indonesia", role: "Owner", text: "Visualisasi 3D outdoor sangat menjual secara estetika komersial kost harian/bulanan.", date: "2026-06-17 15:50" }
      ],
      "A 16": [
        { user: "Radit Widjaya", role: "Super Admin", text: "Cafe kontainer ini menjadi ikon penarik minat pasar milenial.", date: "2026-06-19 08:30" }
      ]
    };
  });

  // Save comments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sppi_pdf_comments', JSON.stringify(commentsMap));
  }, [commentsMap]);

  const handleDrawingDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrawingDragging(true);
  };

  const handleDrawingDragLeave = () => {
    setIsDrawingDragging(false);
  };

  const handleDrawingFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrawingDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedDrawingFile(file);
      setNewDrawingFileName(file.name);
    }
  };

  const handleDrawingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedDrawingFile(file);
      setNewDrawingFileName(file.name);
    }
  };

  const handleDrawingUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrawingFileName.trim()) {
      if (showToast) showToast('Mohon lampirkan file atau isi nama berkas PDF', 'error');
      return;
    }

    setIsDrawingUploading(true);
    setDrawingUploadProgress(0);

    const interval = setInterval(() => {
      setDrawingUploadProgress(prev => {
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
      setDrawingUploadProgress(100);

      const extension = newDrawingFileName.toLowerCase().endsWith('.pdf') ? '' : '.pdf';
      const finalName = newDrawingFileName.trim() + extension;

      // Build simulated pages
      const simulatedPages = [];
      for (let i = 1; i <= newDrawingFilePagesCount; i++) {
        simulatedPages.push({
          pageCode: `${newDrawingFileCategory === 'Arsitektur' ? 'A' : newDrawingFileCategory === 'Struktur & Sipil' ? 'S' : 'V'}-0${i}`,
          title: `Lembar Kerja ${newDrawingFileCategory} #${i}`,
          description: `Gambar DED hasil konversi digital PDF terverifikasi untuk kategori: ${newDrawingFileCategory}.`,
          category: newDrawingFileCategory,
          scale: '1:100',
          specifications: ['Pematuhan teknis standar SNI', 'Menjalani approval bersama owner'],
        });
      }

      addDrawingFile(finalName, newDrawingFilePagesCount, simulatedPages);

      setIsDrawingUploading(false);
      setDrawingUploadProgress(0);
      setSelectedDrawingFile(null);
      setNewDrawingFileName('');
      setShowUploadDrawingModal(false);

      if (showToast) {
        showToast(`Sukses menambahkan berkas ${finalName} ke katalog Gambar Kerja!`, 'success');
      }
    }, 2000);
  };

  // Formatter for Currency
  const formatIDR = (num: number) => {
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(2)} Milyar`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  // Vendor termins payments database
  const [vendorTermins, setVendorTermins] = useState<any[]>([
    {
      id: 'vt1',
      vendorName: 'PT. Adhi Graha Perkasa',
      scope: 'Pondasi & Superstruktur',
      terminName: 'Termin I (DP 20%)',
      contractValue: 2254947000,
      disbursedValue: 2254947000,
      status: 'Lunas',
      dueDate: '2026-03-05',
      month: 'Mar'
    },
    {
      id: 'vt2',
      vendorName: 'PT. Adhi Graha Perkasa',
      scope: 'Struktur Lt 1 - Lt 4',
      terminName: 'Termin II (Progres 50%)',
      contractValue: 3382421000,
      disbursedValue: 3382421000,
      status: 'Lunas',
      dueDate: '2026-05-12',
      month: 'Mei'
    },
    {
      id: 'vt3',
      vendorName: 'PT. Tri Karya MEP Specialist',
      scope: 'Instalasi Kelistrikan & Lift',
      terminName: 'Termin II (Termin MEP)',
      contractValue: 1850000000,
      disbursedValue: 1850000000,
      status: 'Lunas',
      dueDate: '2026-06-14',
      month: 'Jun'
    },
    {
      id: 'vt4',
      vendorName: 'CV. Majalengka Mandiri Jaya',
      scope: 'Landscape Taman & Fasad',
      terminName: 'Termin I (DP Konstruksi)',
      contractValue: 760000000,
      disbursedValue: 630444020,
      status: 'Proses Verifikasi',
      dueDate: '2026-06-18',
      month: 'Jun'
    },
    {
      id: 'vt5',
      vendorName: 'PT. Megah Indah Furniture',
      scope: 'Interior Kamar Sektor A/B',
      terminName: 'Termin I (Pabrikasi DP)',
      contractValue: 1200000000,
      disbursedValue: 0,
      status: 'Menunggu Milestones',
      dueDate: '2026-07-20',
      month: 'Jul'
    },
  ]);

  // Form inputs for recording new Vendor Termin Claims
  const [showAddTermin, setShowAddTermin] = useState(false);
  const [newVendor, setNewVendor] = useState('PT. Adhi Graha Perkasa');
  const [newScope, setNewScope] = useState('');
  const [newTerminName, setNewTerminName] = useState('Termin I');
  const [newContractVal, setNewContractVal] = useState(500000000);
  const [newMonth, setNewMonth] = useState('Jul');

  // Handle addition of a new Vendor Payment Claim
  const handleAddTermin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScope) return;

    const newTerminObj = {
      id: `vt_${Date.now()}`,
      vendorName: newVendor,
      scope: newScope,
      terminName: newTerminName,
      contractValue: Number(newContractVal),
      disbursedValue: 0,
      status: 'Proses Verifikasi',
      dueDate: '2026-07-15',
      month: newMonth
    };

    setVendorTermins(prev => [newTerminObj, ...prev]);
    setShowAddTermin(false);
    setNewScope('');
    
    if (addNotification) {
      addNotification(
        'Klaim Termin Baru Diajukan',
        `Klaim tagihan diajukan oleh ${newVendor} sebesar Rp ${newContractVal.toLocaleString('id-ID')} untuk diverifikasi.`,
        'warning'
      );
    }
    if (showToast) {
      showToast('Klaim tagihan termin vendor baru berhasil diajukan!', 'success');
    }
  };

  // ---------------------------------------------------------
  // INTERACTIVE PDF BLUEPRINT & RENDER SLIDESHOW STATE/LOGIC
  // ---------------------------------------------------------
  
  // Synchronized to context drawingFiles layout pages dynamically
  const pdfSheets = useMemo<Array<{
    id: number;
    page: string;
    title: string;
    category: 'Arsitektur' | 'Struktur & Sipil' | 'Visualisasi 3D';
    image: string;
    scale: string;
    description: string;
    specifications: string[];
    fileId?: string;
    pageNumber?: number;
  }>>(() => {
    let list: any[] = [];
    let counter = 1;
    drawingFiles.forEach(file => {
      file.pages.forEach(p => {
        list.push({
          id: counter++,
          page: p.pageCode,
          title: p.title,
          category: p.category,
          image: p.image,
          scale: p.scale,
          description: p.description,
          specifications: p.specifications,
          fileId: file.id,
          pageNumber: p.pageNumber
        });
      });
    });

    if (list.length > 0) return list;

    // Fallback if empty
    return [
      {
        id: 1,
        page: "A 01",
        title: "3D Render - Lanskap Fasad Depan Utama",
        category: "Visualisasi 3D",
        image: frontImage,
        scale: "NTS",
        description: "Perspektif visualisasi 3D udara tampak depan gedung utama.",
        specifications: ["Berdasar DED disetujui", "Material penutup GRC", "Pilar tinggi klasik"]
      }
    ];
  }, [drawingFiles]);

  const mergedCommentsMap = useMemo(() => {
    const map: Record<string, Array<{user: string, role: string, text: string, date: string}>> = {};
    
    // Add default comments map first
    const defaultComments: Record<string, Array<{user: string, role: string, text: string, date: string}>> = {
      "A 01": [
        { user: "Radit Widjaya", role: "Super Admin", text: "Fasad utama sangat memuaskan, sangat proporsional dengan ornamen pintu lengkung gedung.", date: "2026-06-18 10:15" }
      ],
      "A 02": [
        { user: "Budi Santoso", role: "Project Manager", text: "Selasar kolam renang pastikan menggunakan batu alam anti-slip demi tingkat keselamatan prima.", date: "2026-06-19 14:20" },
        { user: "ArchiPlan Specialist", role: "Konsultan", text: "Layout lobi utama sudah dioptimasi untuk kelancaran arus keluar masuk tamu.", date: "2026-06-19 16:10" }
      ],
      "A 04": [
        { user: "Budi Santoso", role: "Project Manager", text: "Modul kolom struktur K-350 mutlak diperiksa tulangan utamanya sebelum jadwal cor akhir pekan.", date: "2026-06-20 09:30" }
      ],
      "A 05": [
        { user: "H. Sulaiman", role: "Investor", text: "Pondasi bored pile 12m memberi rasa aman tinggi untuk pencegahan risiko getaran tanah.", date: "2026-06-15 11:45" }
      ],
      "A 12": [
        { user: "PT. Foresyndo Global Indonesia", role: "Owner", text: "Visualisasi 3D outdoor sangat menjual secara estetika komersial kost harian/bulanan.", date: "2026-06-17 15:50" }
      ],
      "A 16": [
        { user: "Radit Widjaya", role: "Super Admin", text: "Cafe kontainer ini menjadi ikon penarik minat pasar milenial.", date: "2026-06-19 08:30" }
      ]
    };

    Object.keys(defaultComments).forEach(k => {
      map[k] = [...defaultComments[k]];
    });

    // Layer the reactive local comments from state map if present
    Object.keys(commentsMap).forEach(k => {
      commentsMap[k].forEach(c => {
        const ext = (map[k] || []).some(e => e.text === c.text && e.user === c.user);
        if (!ext) {
          if (!map[k]) map[k] = [];
          map[k].unshift(c);
        }
      });
    });
    
    // Flatten in context drawing comments
    drawingFiles.forEach(file => {
      file.pages.forEach(page => {
        if (!map[page.pageCode]) {
          map[page.pageCode] = [];
        }
        page.comments.forEach(c => {
          const exists = map[page.pageCode].some(existing => existing.text === c.text && existing.user === c.user);
          if (!exists) {
            map[page.pageCode].unshift({
              user: c.user,
              role: c.role,
              text: c.text,
              date: c.date
            });
          }
        });
      });
    });

    return map;
  }, [commentsMap, drawingFiles]);

  // Fallback sheets cache reference helper
  const oldPdfSheetsDummy = [
    {
      id: 1,
      page: "A 01",
      title: "Lanskap Utama - Front Aerial Render",
      category: "Visualisasi 3D",
      image: frontImage,
      scale: "NTS (Non-Technical Scale)",
      description: "Perspektif visualisasi 3D udara tampak depan gedung utama Rumah Kost Jati Tujuh Majalengka.",
      specifications: [
        "Fasad Klasik Modern dengan pilar kokoh setinggi 6 lantai",
        "Atasan beton bertulang dengan tandon air dan tangki sirkulasi udara luar",
        "Warna cat utama eksterior: Premium Warm Ochre & Khaki",
        "Gerbang entrance melengkung klasik Eropa"
      ]
    },
    {
      id: 2,
      page: "A 02",
      title: "Denah Tata Letak Lantai 1",
      category: "Arsitektur",
      image: blueprintImage,
      scale: "1:100",
      description: "Denah lantai dasar (Ground floor plan) yang merinci ruang penunjang publik, resepsionis, tangga sirkulasi ganda, unit kamar primer K1 s/d K6, kolam renang outdoor, serta cafe bar.",
      specifications: [
        "Lebar Bangunan Utama: 12,00 Meter",
        "Panjang Bangunan Utama: 20,00 Meter",
        "Fasilitas Utama: Teras Utama, Lift/Tangga, Lobi Resepsionis",
        "Unit Kamar Terpasang: Kamar K1, K2, K3, K4, K5, K6",
        "Fasilitas Outdoor: Kolam Renang Resort, Cafe Minimalis"
      ]
    },
    {
      id: 3,
      page: "A 03",
      title: "Denah Tipikal Lantai 2 s/d Lantai 7",
      category: "Arsitektur",
      image: blueprintImage,
      scale: "1:100",
      description: "Layout pembagian kamar kost eksklusif yang diulang secara vertikal dari tingkat 2 hingga tingkat teratas untuk optimalisasi kapasitas sewa.",
      specifications: [
        "Pola simetris koridor tengah (double loaded corridor) selebar 2,40 meter",
        "12 Kamar per lantai lengkap dengan kamar mandi dalam",
        "Balkon jemur udara di masing-masing kamar",
        "Core sirkulasi lift & tangga ganda di bagian tengah"
      ]
    },
    {
      id: 4,
      page: "A 04",
      title: "Denah Ukuran & Struktur Utama (Grid As Balok)",
      category: "Struktur & Sipil",
      image: blueprintImage,
      scale: "1:100",
      description: "Gambar kerja teknik sipil yang merinci pembagian grid as balok dan kolom pengaku struktur utama proyek Jati Tujuh Majalengka.",
      specifications: [
        "Lebar bentang horizontal total: 12,70 meter (modul 4,80m + 2,40m + 4,80m)",
        "Bentang vertikal total sepanjang: 20,08 meter (modul 4,00m + 4,00m + 4,00m + 4,00m + 4,55m)",
        "Kolom struktur utama: Beton Bertulang K-350 ukuran 40x40 cm",
        "Dimensi balok induk: Beton bertulang 30x60 cm"
      ]
    },
    {
      id: 5,
      page: "A 05",
      title: "Denah Pondasi Bored Pile & Sloof",
      category: "Struktur & Sipil",
      image: blueprintImage,
      scale: "1:100",
      description: "Perencanaan konfigurasi letak tiang bor beton (bored pile) sedalam 12 meter dan balok pengikat atas sloof.",
      specifications: [
        "Diameter tiang bor: 400 mm",
        "Jumlah titik bored pile terpasang: 24 titik pondasi utama",
        "Mutu beton pondasi: K-350 slump tinggi waterproof",
        "Sloof beton bertulang: Ukuran 30x50 cm mutu baja tulangan BJTS-40"
      ]
    },
    {
      id: 6,
      page: "A 06",
      title: "Gambar Potongan Utama A-A Melintang",
      category: "Struktur & Sipil",
      image: blueprintImage,
      scale: "1:125",
      description: "Potongan melintang tegak bangunan dari pondasi bored-pile bawah tanah, struktur kolom 7 lantai, tangga sirkulasi beton, hingga tandon air atap.",
      specifications: [
        "Tinggi bersih antar lantai: 3,40 meter",
        "Tinggi kumulatif bangunan: 24,80 meter",
        "Ketebalan plat lantai beton: 12 cm dengan wiremesh double layer",
        "Konstruksi dak atap: Cor monolitik tebal 15 cm dilapisi waterproof membrane"
      ]
    },
    {
      id: 7,
      page: "A 07",
      title: "Gambar Tampak Depan Arsitektural",
      category: "Arsitektur",
      image: frontImage,
      scale: "1:100",
      description: "Elevasi tampak lurus depan arsitektural gedung yang menyajikan detail simetri estetika pilar utama, jendela melengkung klasik, dan ornamen gerbang bundar.",
      specifications: [
        "Gaya arsitektur: Neo-Klasik Modern Eropa",
        "Material lis profil fasad: Precast GRC kokoh tahan cuaca",
        "Cat pelindung eksterior: Jotun Jotashield Extreme s/d 10 tahun",
        "Railing balkon utama: Klasik Roman Steel"
      ]
    },
    {
      id: 8,
      page: "A 08",
      title: "Gambar Tampak Samping Kiri",
      category: "Arsitektur",
      image: blueprintImage,
      scale: "1:100",
      description: "Gambar proyeksi lurus tampak kiri struktur dinding penahan utama, saluran pembuangan air hujan (talang), dan detail jendela modular.",
      specifications: [
        "Finishing dinding: Cat wheathershield anti-lumut",
        "Sistem talang air: Pipa PVC Wavin AW 4 inch tertutup di dalam kolom as",
        "Kusen jendela: Aluminium Alexindo anodized silver"
      ]
    },
    {
      id: 9,
      page: "A 09",
      title: "Gambar Tampak Samping Kanan",
      category: "Arsitektur",
      image: blueprintImage,
      scale: "1:100",
      description: "Elemen estetika tampak kanan gedung utama, merinci pembagian bidang dinding, jendela pencahayaan koridor, hingga penempatan tangga servis luar.",
      specifications: [
        "Sirkulasi udara koridor optimal dengan ventilasi louver aluminium",
        "Struktur dinding kedap suara bata ringan (hebel) 10 cm dilapis plester acian"
      ]
    },
    {
      id: 10,
      page: "A 10",
      title: "Gambar Tampak Belakang",
      category: "Arsitektur",
      image: blueprintImage,
      scale: "1:100",
      description: "Gambar tampak belakang gedung mengilustrasikan susunan jendela kamar belakang, area jemur komunal, serta pembuangan utilitas.",
      specifications: [
        "Pipa air bersih & kotor: Merek Rucika AW tersembunyi ber-shaft rapi",
        "Akses pintu keluar darurat darat (ground fire escape door)"
      ]
    },
    {
      id: 11,
      page: "A 11",
      title: "3D Render - Komparasi Tampak & Potongan Ruangan",
      category: "Visualisasi 3D",
      image: frontImage,
      scale: "NTS",
      description: "Tampilan render 3D komparatif berdampingan memperlihatkan visual bangunan tampak depan luar di sisi kiri, dan potongan 3D penampang interior kamar di sisi kanan.",
      specifications: [
        "Lobby resepsionis mewah di lantai dasar tampak langsung",
        "Pencahayaan lorong menggunakan LED Strip warm-white 3000K",
        "Pintu kamar kost: Engineering Wood motif Jati ber-smart lock"
      ]
    },
    {
      id: 12,
      page: "A 12",
      title: "3D Render - Perspektif Udara Samping Kanan (Realistik)",
      category: "Visualisasi 3D",
      image: poolImage,
      scale: "NTS",
      description: "Visualisasi berwarna dengan pencahayaan sinar matahari siang hari, mengabadikan integrasi bangunan utama kost, kolam renang bernuansa resort, serta bar cafe di halaman belakang.",
      specifications: [
        "Konsep open-space halaman belakang semi-komersial",
        "Dinding pembatas keliling setinggi 2.20 meter dilapis batu alam paras jogja"
      ]
    },
    {
      id: 13,
      page: "A 13",
      title: "3D Render - Perspektif Potongan Perspektif Struktur 3D Terbuka",
      category: "Visualisasi 3D",
      image: frontImage,
      scale: "NTS",
      description: "Rincian render 3D miring memperlihatkan penampang gedung terbuka secara menyeluruh, menggambarkan tata layout interior, penempatan furniture, dan alur sirkulasi vertikal tangga.",
      specifications: [
        "Konfigurasi furnitur modular space-saving",
        "Peralatan elektronik hemat energi (Inverter AC & LED TV)"
      ]
    },
    {
      id: 14,
      page: "A 14",
      title: "3D Render - Perspektif Belakang Struktur Terbuka",
      category: "Visualisasi 3D",
      image: frontImage,
      scale: "NTS",
      description: "Fasad arsitektural belakang gedung kost ditinjau dari render struktur terbuka, memperlihatkan rincian koridor lift, balkon, dan area taman santai penunjang.",
      specifications: [
        "Taman vertical-garden pada dinding belakang",
        "Area parkir motor berpaving-block berkapasitas 30 unit"
      ]
    },
    {
      id: 15,
      page: "A 15",
      title: "3D Render - Detail Teras & Gerbang Masuk Utama (Entrance)",
      category: "Visualisasi 3D",
      image: frontImage,
      scale: "NTS",
      description: "Render bersudut rendah (low-angle) berfokus pada kemegahan gerbang lengkung utama, anak-anak tangga marmer dengan aksen lampu tangga tersembunyi, dan lanskap asri penunjangnya.",
      specifications: [
        "Lampu sorot fasad (up-light) LED 12W warm white tahan air IP66",
        "Ramp aksesibilitas difabel berlapis ubin bertekstur kasar"
      ]
    },
    {
      id: 16,
      page: "A 16",
      title: "3D Render - Desain Cafe Container Outdoor",
      category: "Visualisasi 3D",
      image: poolImage,
      scale: "NTS",
      description: "Visualisasi detail mini cafe dari modifikasi kontainer kargo 20-feet, dilapisi warna cat arang, dilengkapi pelingku lantai kayu komposit ulin dan kanopi lipat baja hitam.",
      specifications: [
        "Kontainer baja corten tahan karat",
        "Lantai deck komposit kayu plastik (WPC) tahan air & rayap",
        "Pencahayaan gantung bertema industrial retro"
      ]
    },
    {
      id: 17,
      page: "A 17",
      title: "3D Render - Kolam Renang Resort & Cafe Lanskap Belakang",
      category: "Visualisasi 3D",
      image: poolImage,
      scale: "NTS",
      description: "Visualisasi 3D area rekreasi air halaman belakang secara close-up, memamerkan keindahan air jernih kolam renang resort, pancuran batu alam, pilar klasikal, dan vegetasi palem asri.",
      specifications: [
        "Finishing dinding air terjun buatan: Batu andesit bakar alur",
        "Dek santai kayu (wooden sun deck) dengan kursi santai rotan sintetis"
      ]
    }
  ];

  const [selectedPdfPageId, setSelectedPdfPageId] = useState<number>(1);
  const [pdfSearchQuery, setPdfSearchQuery] = useState<string>('');
  const [pdfFilterCategory, setPdfFilterCategory] = useState<string>('Semua');
  const [commentInput, setCommentInput] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);



  // Handle adding comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const activeSheet = pdfSheets.find(s => s.id === selectedPdfPageId);
    if (!activeSheet) return;

    const newComment = {
      user: currentUser?.displayName || 'User SPPI',
      role: currentRole || 'Guest',
      text: commentInput.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setCommentsMap(prev => {
      const pageKey = activeSheet.page;
      const currentComments = prev[pageKey] || [];
      return {
        ...prev,
        [pageKey]: [newComment, ...currentComments]
      };
    });

    // Synchronize to unified context database
    if (activeSheet.fileId && activeSheet.pageNumber) {
      addDrawingComment(activeSheet.fileId, activeSheet.pageNumber, commentInput.trim());
    }

    setCommentInput('');
    if (showToast) {
      showToast(`Berhasil menambahkan catatan verifikasi untuk Lembar ${activeSheet.page}!`, 'success');
    }
  };

  // Filter sheets
  const filteredPdfSheets = useMemo(() => {
    return pdfSheets.filter(sheet => {
      const matchSearch = sheet.title.toLowerCase().includes(pdfSearchQuery.toLowerCase()) || 
                          sheet.page.toLowerCase().includes(pdfSearchQuery.toLowerCase()) ||
                          sheet.description.toLowerCase().includes(pdfSearchQuery.toLowerCase());
      const matchCat = pdfFilterCategory === 'Semua' || sheet.category === pdfFilterCategory;
      return matchSearch && matchCat;
    });
  }, [pdfSheets, pdfSearchQuery, pdfFilterCategory]);

  const activePdfSheet = useMemo(() => {
    return pdfSheets.find(s => s.id === selectedPdfPageId) || pdfSheets[0];
  }, [pdfSheets, selectedPdfPageId]);

  // Handle approval / payout status of vendor payment
  const handleDisburseTermin = (id: string) => {
    setVendorTermins(prev => prev.map(item => {
      if (item.id === id) {
        if (addNotification) {
          addNotification(
            'Pencairan Dana Termin Vendor Selesai',
            `Dana sebesar Rp ${item.contractValue.toLocaleString('id-ID')} telah dicairkan ke rekening resmi ${item.vendorName}.`,
            'success'
          );
        }
        if (showToast) {
          showToast(`Pembayaran Termin ${item.terminName} berhasil dicairkan!`, 'success');
        }
        return {
          ...item,
          status: 'Lunas',
          disbursedValue: item.contractValue
        };
      }
      return item;
    }));
  };

  // Recharts Cashflow comparison computations
  const visualCashflowData = useMemo(() => {
    // Collect monthly aggregates based on monthlyCashflow + vendor disbursements
    const summaryMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agst'];
    
    return summaryMonths.map(m => {
      // Find starting inflows/outflows from AppContext
      const matchedMonthData = monthlyCashflow.find(f => f.month.toLowerCase() === m.toLowerCase());
      const baseInflow = matchedMonthData ? matchedMonthData.inflow : (m === 'Jul' ? 1500000000 : m === 'Agst' ? 1400000000 : 0);
      
      // Calculate vendor disbursements in this specific month
      const matchedTermins = vendorTermins.filter(v => v.month === m);
      const totalVendorClaimed = matchedTermins.reduce((acc, t) => acc + t.contractValue, 0);
      const totalVendorPaid = matchedTermins.reduce((acc, t) => acc + t.disbursedValue, 0);

      return {
        month: m,
        danaCair: baseInflow, // Available liquid funds inflow
        terminTagihan: totalVendorClaimed, // Claims submitted by vendors
        terminTerbayar: totalVendorPaid, // Actual cash outflow paid out
      };
    });
  }, [monthlyCashflow, vendorTermins]);

  // Total disbursements & outstanding claims calculation
  const cashflowStats = useMemo(() => {
    const totalCair = visualCashflowData.reduce((acc, d) => acc + d.danaCair, 0);
    const totalTagihan = visualCashflowData.reduce((acc, d) => acc + d.terminTagihan, 0);
    const totalTerbayar = vendorTermins.reduce((acc, t) => acc + t.disbursedValue, 0);
    
    return {
      totalCair,
      totalTagihan,
      totalTerbayar,
      outstanding: totalTagihan - totalTerbayar
    };
  }, [visualCashflowData, vendorTermins]);

  // High Quality PDF Presentation Generator
  const generatePDFReport = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Top Header Solid Bar
      doc.setFillColor(30, 58, 138); // Navy
      doc.rect(0, 0, 210, 8, 'F');

      // Brand Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(30, 58, 138);
      doc.text('PT. FORESYNDO GLOBAL INDONESIA', 14, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Gedung Perkantoran Dirgantara Kertajati, Majalengka, Jawa Barat', 14, 25);
      doc.text('Email: info@foresyndo.co.id | Kontak Hub: +62 21-789-0453', 14, 29);

      // Separator
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 33, 196, 33);

      // Title Section
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(234, 88, 12); // Corporate Orange
      doc.text('LAPORAN RINGKASAN PROYEK - MONITOR DIREKSI OWNER', 14, 42);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Identitas Proyek  : Foresyndo 2 - Hotel & Kost Eksklusif Kertajati`, 14, 48);
      doc.text(`Tanggal Cetak     : ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB`, 14, 53);
      doc.text(`Status Kelayakan  : Operasional Lapangan Lancar (Verified Auditor)`, 14, 58);

      // Section 1 Table: KPI Summary
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('I. INDIKATOR UTAMA EVALUASI PROYEK (KPI)', 14, 68);

      const kpiRows = [
        ['Progres Fisik Konstruksi Rata-rata', `${projectStats.physicalProgress}%`, 'Target serah terima akhir Dec 2026'],
        ['Realisasi Keuangan Kumulatif', `${projectStats.financialProgress}%`, projectStats.financialProgress === 0 ? 'Deviasi Kurva-S: 0.0% (ON-SCHEDULE)' : 'Deviasi Kurva-S: +3.5% (AHEAD)'],
        ['Nilai Investasi Proyek (RAB)', formatIDR(projectStats.investmentValue), 'Sesuai Rincian E-RAB Resmi Terkunci'],
        ['Biaya Aktual Realisasi Lapangan', formatIDR(projectStats.actualSpending), 'Teralokasikan penuh ke kemajuan konstruksi'],
        ['Sisa Alokasi Cadangan Likuid', formatIDR(projectStats.remainingBudget), 'Likuiditas aman terkontrol di bank penampung'],
        ['Kapasitas Total Unit Kamar', `${projectStats.hotelRoomsCount} Hotel / ${projectStats.kostRoomsCount} Kost`, '7 Lantai + 1 Lantai Basement Sipil lengkap']
      ];

      autoTable(doc, {
        head: [['Deskripsi Parameter Indikator', 'Nilai Evaluasi', 'Keterangan Target']],
        body: kpiRows,
        startY: 72,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { font: 'Helvetica', fontSize: 8.5 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 65 },
          1: { cellWidth: 45, textColor: [30, 58, 138], fontStyle: 'bold' },
          2: { cellWidth: 75 }
        }
      });

      // Section 2: Progres Fisik Sektoral
      const currY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('II. RINCIAN PERSENTASE FISIK LAPANGAN SEKTORAL', 14, currY);

      const progRows = progressItems.map((item: any) => [
        item.category,
        `${item.progressPercent}%`,
        item.status,
        item.lastUpdated,
        item.updatedBy
      ]);

      autoTable(doc, {
        head: [['Kategori Konstruksi', 'Volume Selesai', 'Status Pekerjaan', 'Tanggal Update', 'Verifikator']],
        body: progRows,
        startY: currY + 4,
        theme: 'grid',
        headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { font: 'Helvetica', fontSize: 8.5 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold', textColor: [30, 58, 138] },
          2: { fontStyle: 'bold' }
        }
      });

      // Page Break for Cashflow Details
      doc.addPage();
      
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, 210, 8, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('PT. FORESYNDO GLOBAL INDONESIA - BREAKDOWN ARUS KAS VENDOR', 14, 20);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 23, 196, 23);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('III. DETAIL LAPORAN TERMIN & KLAIM PEMBAYARAN VENDOR', 14, 30);

      const vtRows = vendorTermins.map((item: any) => [
        item.vendorName,
        item.scope,
        item.terminName,
        formatIDR(item.contractValue),
        formatIDR(item.disbursedValue),
        item.status
      ]);

      autoTable(doc, {
        head: [['Nama Kontraktor (Vendor)', 'Jenis Lingkup Kerja', 'Klasifikasi Termin', 'Nilai Kontrak', 'Pencairan Cair', 'Status']],
        body: vtRows,
        startY: 34,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { font: 'Helvetica', fontSize: 8 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          5: { fontStyle: 'bold', textColor: [16, 185, 129] }
        }
      });

      // Recalculated Monthly summary
      const monthlyY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('IV. REKAPITULASI DANA CAIR & OUTFLOW BULANAN (REAL-TIME)', 14, monthlyY);

      const monRows = visualCashflowData.map((d: any) => [
        d.month,
        formatIDR(d.danaCair),
        formatIDR(d.terminTagihan),
        formatIDR(d.terminTerbayar),
        formatIDR(d.danaCair - d.terminTerbayar)
      ]);

      autoTable(doc, {
        head: [['Bulan', 'Dana Cair Masuk', 'Total Klaim Permintaan', 'Total Terbayar Vendor', 'Sisa Surplus Kas']],
        body: monRows,
        startY: monthlyY + 4,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { font: 'Helvetica', fontSize: 8 },
        columnStyles: {
          0: { fontStyle: 'bold' },
          4: { fontStyle: 'bold', textColor: [30, 58, 138] }
        }
      });

      // Digital Signatures
      const sigY = (doc as any).lastAutoTable.finalY + 15;
      const verifiedYVal = sigY + 30 > 297 ? 240 : sigY;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('REKAPITULASI LAPORAN DIAUDIT & DISAHKAN SECARA ELEKTRONIK:', 14, verifiedYVal);

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text('Dipersiapkan Oleh:', 24, verifiedYVal + 8);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('[Tanda Tangan Digital Autentik]', 24, verifiedYVal + 14);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 58, 138);
      doc.text('RADIT WIDJAYA', 24, verifiedYVal + 22);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Super Admin / Lead Auditor', 24, verifiedYVal + 25);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 58, 138);
      doc.text('Disetujui Oleh Direksi PT. FGI:', 130, verifiedYVal + 8);
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('[QR Code Autentikasi Direksi]', 130, verifiedYVal + 14);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 58, 138);
      doc.text('DIREKTION BRAND PT. FGI', 130, verifiedYVal + 22);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Owner-Representative PT. FGI', 130, verifiedYVal + 25);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Laporan Ringkasan Utama Project owner terkompilasi aman dan sah untuk presentasi.', 14, 285);

      doc.save('Foresyndo2_Laporan_Utama_Owner_Executive.pdf');
      if (showToast) {
        showToast('Berhasil mengunduh Laporan PDF Ringkasan Proyek! Siap dipresentasikan.', 'success');
      }
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast('Gagal memproses ekspor PDF resmi.', 'error');
      }
    }
  };

  // SVG dimensions for Kurva S
  const widthS = 650;
  const heightS = 220;
  const paddingS = 35;

  // S-Curve computations for SVG coordinate mappings
  const pointsPlanned = weeklyData.map((d, i) => {
    const x = paddingS + (i / (weeklyData.length - 1)) * (widthS - 2 * paddingS);
    const y = heightS - paddingS - (d.planned / 100) * (heightS - 2 * paddingS);
    return { x, y, val: d.planned, label: d.week };
  });

  const pointsActual = weeklyData.map((d, i) => {
    const x = paddingS + (i / (weeklyData.length - 1)) * (widthS - 2 * paddingS);
    const y = heightS - paddingS - (d.actual / 100) * (heightS - 2 * paddingS);
    return { x, y, val: d.actual, label: d.week };
  });

  // Render SVG Path strings
  const plannedPath = pointsPlanned.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Only draw actual path where data points are recorded (> 0)
  const actualValids = pointsActual.filter((_, i) => weeklyData[i].actual > 0);
  const actualPath = actualValids.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Cash Flow Calculations
  const maxCash = Math.max(...monthlyCashflow.map(d => Math.max(d.inflow, d.outflow)));

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-550">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] glow-orange"></span>
            PROYEK FORESYNDO 2 &bull; OWNER SECTOR CONTROL
          </div>
          <h1 className="text-2xl font-bold text-[#1E3A8A] mt-1">Sistem Pemantauan Direksi Direktur</h1>
          <p className="text-slate-500 text-sm font-light mt-0.5">Analisis kemajuan realisasi fisik konstruksi sipil dan anggaran penyerapan biaya.</p>
        </div>

        {/* EXPORT ACTION DRIVERS */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => generateReport('progress')}
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-mono font-bold rounded-lg text-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#EA580C]" /> Excel Progress
          </button>
          <button 
            onClick={() => generateReport('cashflow')}
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-mono font-bold rounded-lg text-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#EA580C]" /> Excel Cashflow
          </button>
          <button 
            onClick={generatePDFReport}
            className="px-4 py-2 bg-[#EA580C] hover:bg-orange-600 text-xs font-mono font-bold rounded-lg text-white transition flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Download className="w-4 h-4" /> Cetak PDF Owner
          </button>
        </div>
      </div>

      {/* CORE KPI SUMMARY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Progres Fisik Rata-rata</span>
            <TrendingUp className="w-4.5 h-4.5 text-[#EA580C]" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#1E3A8A] font-display">{projectStats.physicalProgress}%</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-[#EA580C]" style={{ width: `${projectStats.physicalProgress}%` }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-3 text-right">Target akhir Dec 2026</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Realisasi Keuangan</span>
            <DollarSign className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#1E3A8A] font-display">{projectStats.financialProgress}%</p>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${projectStats.financialProgress}%` }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-3 text-right">Deviasi target: {projectStats.financialProgress === 0 ? '0.0% (ON-SCHEDULE)' : '+3.5%'}</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Nilai Anggaran Proyek</span>
            <ArrowUpRight className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="mt-4">
            <p className="text-lg font-bold text-[#1E3A8A] font-mono">{formatIDR(projectStats.investmentValue)}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-light">Lahan milik PT. Foresyndo Indonesia</p>
          </div>
          <div className="border-t border-slate-100 pt-2 float-right mt-3">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Biaya Aktual:</span>
              <span className="text-slate-600 font-bold">{formatIDR(projectStats.actualSpending)}</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Sisa Cadangan Anggaran</span>
            <ArrowDownLeft className="w-4.5 h-4.5 text-[#EA580C]" />
          </div>
          <div className="mt-4">
            <p className="text-lg font-bold text-[#1E3A8A] font-mono">{formatIDR(projectStats.remainingBudget)}</p>
            <p className="text-[11px] text-[#EA580C] mt-1 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Arus kas likuid kondusif
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-3 text-right">Kapasitas aman pembangunan</p>
        </div>
      </div>

      {/* DETAILED METRICS METADATA ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-corporate-blue-500/10 rounded-lg text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Target Penyelesaian Konstruksi</p>
            <p className="text-sm font-bold text-[#1E3A8A] mt-0.5">31 DESEMBER 2026</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-corporate-orange-500/10 rounded-lg text-[#EA580C]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Kapasitas Kamar</p>
            <p className="text-sm font-bold text-[#1E3A8A] mt-0.5">{projectStats.hotelRoomsCount} Hotel | {projectStats.kostRoomsCount} Kost Eksklusif</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Target Laba Kotor Bulanan</p>
            <p className="text-sm font-bold text-[#1E3A8A] mt-0.5">{formatIDR(projectStats.estimatedRevenueMonthly)} / Bln</p>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* S-CURVE (Planned vs Actual over Weeks) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                <Percent className="text-[#EA580C] w-5 h-5" /> Visibilitas Kurva S Progres Mingguan
              </h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">Membandingkan perencanaan target master (Planned) dengan pengerjaan aktual dilapangan (Actual).</p>
            </div>
            
            <div className="flex gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                <span className="w-3 h-1.5 bg-blue-500 rounded"></span> Planned
              </div>
              <div className="flex items-center gap-1.5 text-[#EA580C] font-bold">
                <span className="w-3 h-1.5 bg-[#EA580C] rounded"></span> Actual Progress
              </div>
            </div>
          </div>

          {/* Interactive Custom SVG Chart */}
          <div className="relative pt-2">
            <svg viewBox={`0 0 ${widthS} ${heightS}`} className="w-full overflow-visible font-mono text-[9px] text-slate-500">
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((level, i) => {
                const y = heightS - paddingS - (level / 100) * (heightS - 2 * paddingS);
                return (
                  <g key={i}>
                    <line x1={paddingS} y1={y} x2={widthS - paddingS} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
                    <text x={paddingS - 8} y={y + 3} textAnchor="end" fill="#64748b" className="font-bold">{level}%</text>
                  </g>
                );
              })}

              {/* Planned S-Curve Path */}
              <path d={plannedPath} fill="none" stroke="#3b82f6" strokeWidth="2.5" opacity="0.6" />
              
              {/* Actual S-Curve Path */}
              <path d={actualPath} fill="none" stroke="#ea580c" strokeWidth="3.5" strokeLinecap="round" />

              {/* Planned Marker Dots */}
              {pointsPlanned.map((p, i) => (
                <circle 
                  key={`p-${i}`} 
                  cx={p.x} 
                  cy={p.y} 
                  r="3.5" 
                  className="fill-blue-600 hover:fill-[#EA580C] cursor-pointer transition-colors"
                  onMouseEnter={() => setActiveWeekIdx(i)}
                  onMouseLeave={() => setActiveWeekIdx(null)}
                />
              ))}

              {/* Actual Marker Dots */}
              {pointsActual.map((p, i) => {
                if (weeklyData[i].actual === 0) return null;
                return (
                  <circle 
                    key={`a-${i}`} 
                    cx={p.x} 
                    cy={p.y} 
                    r="4.5" 
                    className="fill-[#EA580C] stroke-white stroke-2 hover:fill-blue-600 cursor-pointer transition-colors"
                    onMouseEnter={() => setActiveWeekIdx(i)}
                    onMouseLeave={() => setActiveWeekIdx(null)}
                  />
                );
              })}

              {/* Timelines labels */}
              {weeklyData.map((d, i) => {
                const x = paddingS + (i / (weeklyData.length - 1)) * (widthS - 2 * paddingS);
                return (
                  <text key={i} x={x} y={heightS - paddingS + 18} textAnchor="middle" fill="#64748b" className="font-mono text-[8.5px] font-bold">
                    {d.week}
                  </text>
                );
              })}
            </svg>

            {/* Hover details overlay inside S-Curve */}
            {activeWeekIdx !== null && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs space-y-1 shadow-lg font-mono text-slate-800">
                <p className="text-[#1E3A8A] font-bold border-b border-slate-100 pb-1 text-center">{weeklyData[activeWeekIdx].week}</p>
                <div className="flex justify-between gap-6 pt-1 text-[10px]">
                  <span className="text-blue-600 font-semibold">Target Planned: {weeklyData[activeWeekIdx].planned}%</span>
                  <span className="text-[#EA580C] font-bold">Realisasi Lapangan: {weeklyData[activeWeekIdx].actual > 0 ? `${weeklyData[activeWeekIdx].actual}%` : 'Menunggu'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CASH FLOW (Dual columns monthly comparison) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                <Clock className="text-[#EA580C] w-5 h-5" /> Arus Kas Masuk &amp; Keluar
              </h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">Visual perbandingan modal investasi masuk lawan pengeluaran harian vendor.</p>
            </div>
          </div>

          {/* Graphical Bars layout */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between h-40 items-end gap-3 px-2">
              {monthlyCashflow.map((flow, idx) => {
                const inHeight = (flow.inflow / maxCash) * 120;
                const outHeight = (flow.outflow / maxCash) * 120;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="flex items-end gap-1 w-full justify-center">
                      {/* Inflow bar */}
                      <div 
                        className="w-3.5 bg-blue-500/90 rounded-t hover:bg-blue-400 transition-all cursor-pointer relative"
                        style={{ height: `${inHeight}px` }}
                        onMouseEnter={() => setActiveCashIdx(idx)}
                        onMouseLeave={() => setActiveCashIdx(null)}
                      />
                      {/* Outflow bar */}
                      <div 
                        className="w-3.5 bg-orange-500/90 rounded-t hover:bg-orange-400 transition-all cursor-pointer relative"
                        style={{ height: `${outHeight}px` }}
                        onMouseEnter={() => setActiveCashIdx(idx)}
                        onMouseLeave={() => setActiveCashIdx(null)}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 font-bold mt-1 uppercase">{flow.month}</span>
                  </div>
                );
              })}
            </div>

            {/* Hover details overlay for Cash Flow */}
            {activeCashIdx !== null ? (
              <div className="bg-white border border-slate-200 p-3 rounded-lg text-xs space-y-1 font-mono text-center text-slate-800 shadow-lg">
                <p className="text-[#1E3A8A] font-bold">Laporan Kas Bulan {monthlyCashflow[activeCashIdx].month}</p>
                <div className="flex justify-around pt-1 text-[11px]">
                  <span className="text-blue-600 font-bold">Masuk: Rp {(monthlyCashflow[activeCashIdx].inflow / 1000000000).toFixed(2)}M</span>
                  <span className="text-[#EA580C] font-bold">Keluar: Rp {(monthlyCashflow[activeCashIdx].outflow / 1000000000).toFixed(2)}M</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-[10px] text-slate-500 text-center font-mono leading-relaxed">
                * Arahkan kursor ke pilar grafik batang untuk mengevaluasi ringkasan detail neraca bulanan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION: LAPORAN ARUS KAS PROYEK (VISUALISASI KOMPARASI REAL-TIME DANA CAIR VS TERMIN VENDOR) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                <Briefcase className="text-[#EA580C] w-5 h-5" /> Laporan Arus Kas Proyek &amp; Termin Vendor
              </h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Membandingkan alokasi dana cair (Capital Injection) dengan tagihan termin pembayaran kontraktor pelaksana proyek.
              </p>
            </div>
            
            <button
              onClick={() => setShowAddTermin(!showAddTermin)}
              className="px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white font-mono font-bold text-[10.5px] rounded-lg transition-all flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Input Termin Baru
            </button>
          </div>
        </div>

        {/* INPUT FORM ACCORDION */}
        {showAddTermin && (
          <form onSubmit={handleAddTermin} className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid md:grid-cols-5 gap-3 items-end animate-fadeIn">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">PILIH VENDOR</label>
              <select
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-[#EA580C]"
              >
                <option value="PT. Adhi Graha Perkasa">PT. Adhi Graha Perkasa</option>
                <option value="PT. Tri Karya MEP Specialist">PT. Tri Karya MEP Specialist</option>
                <option value="CV. Majalengka Mandiri Jaya">CV. Majalengka Mandiri Jaya</option>
                <option value="PT. Megah Indah Furniture">PT. Megah Indah Furniture</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">LINGKUP PEKERJAAN</label>
              <input
                type="text"
                placeholder="cth: Instalasi Lift, Finishing Kolam"
                value={newScope}
                onChange={(e) => setNewScope(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-[#EA580C]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NAMA TERMIN / MILISTONE</label>
              <input
                type="text"
                placeholder="cth: Termin III (75% Fisik)"
                value={newTerminName}
                onChange={(e) => setNewTerminName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-[#EA580C]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">NILAI KONTRAK TERMIN (IDR)</label>
              <input
                type="number"
                value={newContractVal}
                onChange={(e) => setNewContractVal(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold outline-none focus:border-[#EA580C]"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">BULAN PROYEKSI</label>
                <select
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none focus:border-[#EA580C]"
                >
                  <option value="Jan">Januari</option>
                  <option value="Feb">Februari</option>
                  <option value="Mar">Maret</option>
                  <option value="Apr">April</option>
                  <option value="Mei">Mei</option>
                  <option value="Jun">Juni</option>
                  <option value="Jul">Juli</option>
                  <option value="Agst">Agustus</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-[#EA580C] hover:bg-orange-600 text-white font-mono font-bold text-xs p-2.5 rounded-lg transition-all shadow cursor-pointer justify-center"
              >
                Kirim
              </button>
            </div>
          </form>
        )}

        {/* METRICS ROW FOR CASHFLOW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">TOTAL DANA CAIR (CAPITAL INFLOW)</span>
            <span className="text-sm md:text-base font-extrabold text-[#1E3A8A] font-mono">{formatIDR(cashflowStats.totalCair)}</span>
          </div>
          <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">TOTAL TAGIHAN KLAIM TERMIN</span>
            <span className="text-sm md:text-base font-extrabold text-[#EA580C] font-mono">{formatIDR(cashflowStats.totalTagihan)}</span>
          </div>
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">TERMIN TELAH CAIR DI-TERBAYAR</span>
            <span className="text-sm md:text-base font-extrabold text-emerald-700 font-mono">{formatIDR(cashflowStats.totalTerbayar)}</span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-slate-400 block font-bold">KLAIM OUTSTANDING (PROSES VERIFIKASI)</span>
            <span className="text-sm md:text-base font-extrabold text-slate-600 font-mono">{formatIDR(cashflowStats.outstanding)}</span>
          </div>
        </div>

        {/* COMPARISON CHART AND TABLE GRID */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* RECHARTS CHANNELS */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#1E3A8A] font-mono block">PROYEKSI GRAFIK ARUS KAS (RECHARTS DUAL BARS)</span>
              <div className="flex gap-3 text-[9px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 my-auto bg-[#3B82F6] rounded"></span> Dana Cair</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 my-auto bg-[#F97316] rounded"></span> Total Klaim</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2 my-auto bg-[#10B981] rounded"></span> Terbayar</span>
              </div>
            </div>

            <div className="h-[240px] w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visualCashflowData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '10px' }} />
                  <YAxis 
                    stroke="#64748b" 
                    tickFormatter={(val) => `Rp ${(val / 1000000000).toFixed(1)}M`}
                    style={{ fontSize: '9px' }} 
                  />
                  <RechartsTooltip 
                    formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                    contentStyle={{ fontFamily: 'monospace', fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Bar dataKey="danaCair" name="Dana Cair Proyek" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="terminTagihan" name="Total Tagihan" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="terminTerbayar" name="Terbayar Vendor" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-[10px] text-slate-500 font-light leading-relaxed">
              * Batang <strong>Dana Cair</strong> merepresentasikan ketersediaan likuiditas yang siap diluncurkan dari modal pemegang saham harian, sedangkan <strong>Total Tagihan</strong> adalah total akumulasi klaim termin vendor, baik yang statusnya lunas terbayar maupun sedang dalam verifikasi lapangan.
            </p>
          </div>

          {/* REAL TIME VENDOR TERMIN DETAILS TABLE */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-bold text-[#1E3A8A] font-mono block">SISTEM KLAIM STATUS INTEGRASI TERMIN KONTRAKTOR</span>
            
            <div className="overflow-x-auto max-h-[300px] border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E3A8A] text-white font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Kontraktor / Scope</th>
                    <th className="p-3">Termin / Nilai</th>
                    <th className="p-3">Bulan</th>
                    <th className="p-3">Status / Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {vendorTermins.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <strong className="text-slate-800 font-bold block">{item.vendorName}</strong>
                        <span className="text-[10px] text-slate-450 block font-light">{item.scope}</span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-semibold text-slate-700 block">{item.terminName}</span>
                        <span className="text-[11px] text-orange-600 block font-bold">{formatIDR(item.contractValue)}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600 uppercase font-mono">{item.month}</td>
                      <td className="p-3">
                        {item.status === 'Lunas' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Lunas Terbayar
                          </span>
                        ) : item.status === 'Proses Verifikasi' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Proses Verifikasi
                            </span>
                            
                            {(currentRole === 'Owner' || currentRole === 'Super Admin' || currentRole === 'Project Manager') && (
                              <button
                                onClick={() => handleDisburseTermin(item.id)}
                                className="block w-full text-center py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[9px] rounded transition shadow cursor-pointer uppercase"
                              >
                                Cairkan Dana
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                            <Clock className="w-3 h-3" /> Belum Jatuh Tempo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-3 text-orange-850">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
              <div className="text-[10px] font-sans leading-relaxed">
                <strong className="text-orange-950 font-bold block mb-0.5">Aturan Otoritas Pembayaran &bull; Sistem Audit</strong>
                Hanya akun dengan peran <strong>Owner</strong>, <strong>Super Admin</strong>, atau <strong>Project Manager</strong> yang berhak melakukan persetujuan dan pencairan dana harian untuk status <em>Proses Verifikasi</em>. Kontraktor eksternal hanya dapat mengajukan tagihan awal.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* INTERACTIVE PDF BLUEPRINT & RENDER SLIDESHOW */}
      <div id="pdf-view-section" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#EA580C] font-semibold">
              <Sparkles className="w-4 h-4 animate-pulse" /> TERVERIFIKASI &bull; {pdfSheets.length} LEMBAR DED RESMI
            </div>
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2 mt-0.5">
              <FileText className="text-[#EA580C] w-5 h-5 animate-bounce" /> Portal PDF Visualisasi &amp; Dokumen Kerja Kerja (DED)
            </h3>
            <p className="text-xs text-slate-500 font-light">Klik lembar kerja PDF/Render di bawah untuk meninjau deskripsi teknis penunjang, ornamen struktur, dan menambahkan keterangan verifikasi lapangan kolaboratif.</p>
          </div>
          
          {/* SEARCH & ACCENT INFOBADGE */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 font-mono text-xs">
            <Info className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Keterangan Terikat Asli PDF</span>
          </div>
        </div>

        {/* SECTION: FILE GAMBAR BANGUNAN (DRAWING CATALOG & DYNAMIC UPLOAD) */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                File Gambar Bangunan (Drawing Catalog)
              </h4>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">Daftar lembar kerja PDF cetak konstruksi yang diunggah secara resmi oleh tim arsitek dan pengawas lapangan.</p>
            </div>

            {['Super Admin', 'Owner', 'Project Manager'].includes(currentRole) && (
              <button
                onClick={() => setShowUploadDrawingModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-[10px] rounded-lg shadow-sm transition inline-flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload PDF
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {drawingFiles.map((file) => {
              // Find if any page of this file is currently highlighted
              const isActiveFile = pdfSheets.some(s => s.fileId === file.id && s.id === selectedPdfPageId);

              return (
                <div 
                  key={file.id}
                  className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                    isActiveFile 
                      ? 'bg-indigo-50/50 border-indigo-400 shadow-md ring-2 ring-indigo-500/20' 
                      : 'bg-white border-slate-200 hover:border-slate-350 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        PDF DRAWING
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono font-bold">
                        {file.totalPage} LMS
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 line-clamp-1 leading-relaxed" title={file.fileName}>
                      {file.fileName}
                    </h5>

                    <div className="space-y-1 mt-2 text-[10px] text-slate-450 font-mono">
                      <div className="flex justify-between">
                        <span>Tanggal:</span>
                        <span className="text-slate-650 font-semibold">{file.uploadedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Oleh:</span>
                        <span className="text-slate-650 font-semibold">{file.uploadedBy.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 border-t border-slate-100 pt-2.5 mt-2.5">
                    <button
                      onClick={() => {
                        // Find first page of this file in pdfSheets flat list and activate it
                        const firstPage = pdfSheets.find(s => s.fileId === file.id);
                        if (firstPage) {
                          setSelectedPdfPageId(firstPage.id);
                          if (showToast) {
                            showToast(`Memuat lembar kerja dari berkas: ${file.fileName}`, 'info');
                          }
                        }
                      }}
                      className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold font-mono text-[9px] rounded-lg text-center transition cursor-pointer"
                    >
                      Preview Halaman
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('drawing_viewer');
                        if (showToast) {
                          showToast(`Membuka berkas ${file.fileName} dalam Mode Interaktif Fullscreen`, 'info');
                        }
                      }}
                      className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg text-center transition cursor-pointer"
                      title="Membuka di standalone Gambar Kerja"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FILTERS & SEARCH ROW */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          {/* Category Pill Buttons */}
          <div className="flex flex-wrap gap-1">
            {['Semua', 'Arsitektur', 'Struktur & Sipil', 'Visualisasi 3D'].map((cat) => {
              const count = pdfSheets.filter(s => cat === 'Semua' || s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setPdfFilterCategory(cat);
                    // Reset selected page if filtered out
                    const filtered = pdfSheets.filter(s => cat === 'Semua' || s.category === cat);
                    if (filtered.length > 0 && !filtered.some(s => s.id === selectedPdfPageId)) {
                      setSelectedPdfPageId(filtered[0].id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 cursor-pointer ${
                    pdfFilterCategory === cat
                      ? 'bg-[#1E3A8A] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat} <span className={`text-[10px] ml-1 px-1.5 py-0.2 rounded ${pdfFilterCategory === cat ? 'bg-orange-500/35 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Cari Lembar Kerja..."
              value={pdfSearchQuery}
              onChange={(e) => setPdfSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 placeholder-slate-400 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* DOUBLE COLUMN BENTO */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: 17 SHEET SELECTOR */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-1">Daftar Lembar Proyek ({filteredPdfSheets.length})</div>
            <div className="max-h-[640px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              {filteredPdfSheets.map((sheet) => {
                const isSelected = sheet.id === selectedPdfPageId;
                const commentCount = mergedCommentsMap[sheet.page]?.length || 0;
                
                return (
                  <button
                    key={sheet.id}
                    onClick={() => {
                      setSelectedPdfPageId(sheet.id);
                      if (showToast) {
                        showToast(`Menampilkan halaman PDF: ${sheet.page} - ${sheet.title}`, 'info');
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-50 to-blue-50/20 border-orange-400 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {/* Badge */}
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex flex-col items-center justify-center font-mono text-[10px] font-bold ${
                      isSelected
                        ? 'bg-[#EA580C] text-white shadow-sm'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      <span>PG</span>
                      <span className="text-xs -mt-1">{sheet.page.replace('A ', '')}</span>
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-650 px-1.5 py-0.2 rounded-md font-semibold tracking-wide">
                          {sheet.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 block shrink-0">
                          Skl: {sheet.scale}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mt-1 leading-snug">
                        {sheet.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 font-light line-clamp-1">
                        {sheet.description}
                      </p>
                    </div>

                    {/* Counter of notes if any */}
                    {commentCount > 0 && (
                      <div className="shrink-0 self-center flex items-center justify-center bg-orange-100 text-[#EA580C] px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono border border-orange-200">
                        <MessageSquare className="w-2.5 h-2.5 mr-0.5" />
                        {commentCount}
                      </div>
                    )}
                  </button>
                );
              })}

              {filteredPdfSheets.length === 0 && (
                <div className="p-8 text-center text-slate-450 border border-dashed border-slate-200 rounded-2xl bg-slate-50 font-sans">
                  Tidak ada halaman PDF yang cocok dengan kata kunci pencarian.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE DETAILS, LIGHTBOX, AND ACTION INPUTS */}
          <div className="lg:col-span-8 space-y-6 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 pt-6 lg:pt-0">
            
            {/* HERO ACTIVE IMAGE VIEWPORT */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-205 shadow-md group bg-slate-950">
                {/* PDF overlay stamp */}
                <div className="absolute top-3 left-3 z-10 bg-slate-900/85 backdrop-blur text-white px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold border border-slate-700 shadow flex items-center gap-1.5 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span>LEMBAR RESMI: {activePdfSheet.page}</span>
                </div>

                {/* Right Maximize controller */}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-3 right-3 z-10 p-2.5 bg-[#EA580C]/90 hover:bg-orange-600 text-white rounded-xl shadow-lg hover:scale-105 transition duration-150 cursor-pointer flex items-center justify-center"
                  title="Perbesar / Zoom Gambar"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Main Image tag */}
                <img
                  src={activePdfSheet.image}
                  alt={activePdfSheet.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-[360px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-700 ease-out cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                />

                {/* Bottom title band overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent p-4 pt-12 flex flex-col justify-end pointer-events-none">
                  <span className="text-[10px] font-mono uppercase text-orange-400 font-bold tracking-widest">{activePdfSheet.category}</span>
                  <h4 className="text-white text-base font-bold tracking-tight drop-shadow-sm">{activePdfSheet.title}</h4>
                </div>
              </div>

              {/* SHEET NAVIGATION */}
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    const currentIndex = pdfSheets.findIndex(s => s.id === selectedPdfPageId);
                    const prevIdx = currentIndex > 0 ? currentIndex - 1 : pdfSheets.length - 1;
                    setSelectedPdfPageId(pdfSheets[prevIdx].id);
                  }}
                  className="p-1 px-2 text-xs font-mono text-[#1E3A8A] font-bold border border-slate-200 bg-white hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-orange-500" /> Lembar Sblm
                </button>

                <div className="text-[11px] font-mono text-slate-500">
                  Slide <strong className="text-slate-900 font-extrabold font-mono">{pdfSheets.findIndex(s => s.id === selectedPdfPageId) + 1}</strong> dari <strong className="text-slate-900 font-extrabold font-mono">{pdfSheets.length}</strong> Halaman
                </div>

                <button
                  onClick={() => {
                    const currentIndex = pdfSheets.findIndex(s => s.id === selectedPdfPageId);
                    const nextIdx = currentIndex < pdfSheets.length - 1 ? currentIndex + 1 : 0;
                    setSelectedPdfPageId(pdfSheets[nextIdx].id);
                  }}
                  className="p-1 px-2 text-xs font-mono text-[#1E3A8A] font-bold border border-slate-200 bg-white hover:bg-slate-100 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
                >
                  Lembar Slanj <ChevronRight className="w-4 h-4 text-orange-500" />
                </button>
              </div>
            </div>

            {/* METADATA EXPLANATION CARD */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Nomor Lembar PDF</span>
                  <span className="font-bold text-[#1E3A8A]">{activePdfSheet.page}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Skala Gambar Teknik</span>
                  <span className="font-bold text-slate-800 font-mono">{activePdfSheet.scale}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Kategori Gambar</span>
                  <span className="font-semibold text-orange-650 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] inline-block animate-ping"></span>
                    {activePdfSheet.category}
                  </span>
                </div>
              </div>

              {/* Paragraph detail */}
              <div className="space-y-2">
                <h5 className="text-[11.5px] font-mono uppercase tracking-wider text-slate-550 font-bold">Penjelasan Deskripsi Kerja &amp; Analisis DED:</h5>
                <p className="text-sm font-sans text-slate-700 leading-relaxed font-light">
                  {activePdfSheet.description}
                </p>
              </div>

              {/* Specifications Sublist */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h5 className="text-[11.5px] font-mono uppercase tracking-wider text-[#1E3A8A] font-bold">Rincian Spesifikasi &amp; Atribut Konstruksi:</h5>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs font-sans text-slate-650">
                  {activePdfSheet.specifications.map((spec, sIdx) => {
                    return (
                      <li key={sIdx} className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition">
                        <Check className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                        <span className="leading-tight text-slate-700">{spec}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* REAL-TIME COLLABORATIVE FOOTNOTES & REMARKS (TAMBAH KETERANGAN) */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h4 className="text-sm font-bold text-[#1E3A8A] flex items-center gap-1.5 font-sans">
                  <MessageSquare className="w-4.5 h-4.5 text-[#EA580C]" /> Catatan Verifikasi &amp; Keterangan Lapangan
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Collaborative Remarks map</span>
              </div>

              {/* COMMENTS LOG LIST */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {(mergedCommentsMap[activePdfSheet.page] || []).length > 0 ? (
                  (mergedCommentsMap[activePdfSheet.page] || []).map((com, index) => {
                    const isSystemRole = ['Owner', 'Super Admin', 'Project Manager'].includes(com.role);
                    return (
                      <div key={index} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex gap-3 anim-fadeIn">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSystemRole ? 'bg-orange-100 text-[#EA580C]' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap justify-between items-center gap-x-2 text-[11px]">
                            <span className="font-extrabold text-slate-800 font-sans truncate">{com.user}</span>
                            <span className="text-[9.5px] text-slate-400 font-mono font-medium">{com.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                              com.role === 'Super Admin' ? 'bg-indigo-50 text-indigo-650 border border-indigo-200' :
                              com.role === 'Owner' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              com.role === 'Project Manager' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {com.role}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-normal font-sans pt-1">
                            {com.text}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs italic font-sans">
                    Belum ada catatan keterangan masukan untuk Lembar {activePdfSheet.page} ini. Silakan sampaikan memo penilai pertama di bawah.
                  </div>
                )}
              </div>

              {/* REMARKS INPUT FORM */}
              <form onSubmit={handleAddComment} className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Edit className="w-3.5 h-3.5 text-[#EA580C]" /> Sampaikan Keterangan Verifikasi Baru (Lembar {activePdfSheet.page}):
                </div>
                
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    placeholder={`Tulis memo tanggapan, usulan audit, atau catatan lapangan resmi untuk lembar ${activePdfSheet.page} : ${activePdfSheet.title}...`}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    required
                    className="flex-1 p-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-705 placeholder-slate-400 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition shadow-inner"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 self-end bg-[#EA580C] hover:bg-orange-600 active:bg-orange-700 text-[#1E3A8A] hover:text-white font-mono font-bold text-xs rounded-xl shadow transition duration-150 shrink-0 cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Simpan</span>
                  </button>
                </div>
                
                <p className="text-[9.5px] text-slate-400 font-mono leading-tight">
                  Status verifikator otomatis dilampirkan menggunakan identitas aktif: <strong className="font-bold text-[#1E3A8A]">{currentUser?.displayName || 'Tamu'} ({currentRole})</strong>.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* INTERACTIVE FULLSCREEN LIGHTBOX MODAL */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 anim-fadeIn">
            {/* Top close panel */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-center z-20">
              <div className="text-white drop-shadow">
                <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">{activePdfSheet.category}</span>
                <h4 className="text-base font-bold font-sans">{activePdfSheet.page} - {activePdfSheet.title}</h4>
              </div>
              
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-full transition duration-150 cursor-pointer flex items-center justify-center shadow-lg border border-slate-700"
                title="Tutup Detil Gambar"
              >
                <Maximize2 className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Middle Zoomed Image in Frame */}
            <div className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center">
              <img
                src={activePdfSheet.image}
                alt={activePdfSheet.title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain rounded-xl border border-slate-850 shadow-2xl"
              />
            </div>

            {/* Bottom Scale & info banner indicator */}
            <div className="absolute bottom-4 z-20 bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-xs p-3 rounded-xl max-w-xl text-center shadow-xl">
              Skala Teknis: <strong className="text-orange-400 font-bold">{activePdfSheet.scale}</strong> &bull; Slide {pdfSheets.findIndex(s => s.id === selectedPdfPageId) + 1} dari {pdfSheets.length} Halaman &bull; SNI Terverifikasi
            </div>
          </div>
        )}
      </div>

      {/* CORE WORK DIVISIONS STATUS LIST */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
              <ClipboardCheck className="text-[#EA580C] w-5 h-5" /> Matriks Kategori Pekerjaan Konstruksi
            </h3>
            <p className="text-xs text-slate-500 font-light mt-0.5">Detail pengerjaan fisik struktur rincian 1 Basement &amp; 7 Lantai FORESYNDO 2.</p>
          </div>
          
          {currentRole !== 'Owner' && currentRole !== 'Investor' && (
            <div className="text-xs text-[#EA580C] bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 font-mono font-bold">
              Mode Edit Aktif (Akses: {currentRole})
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {progressItems.map((item) => (
            <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-[#1E3A8A]/20 hover:shadow-sm transition flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#1E3A8A] text-sm">{item.category}</span>
                  <span className={`px-2 py-0.5 rounded-[5px] text-[10px] uppercase font-semibold font-mono ${item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : item.status === 'Berjalan' ? 'bg-orange-50 text-[#EA580C] border border-orange-255' : 'bg-slate-200 text-slate-600'}`}>
                    {item.status}
                  </span>
                </div>
                
                {/* Progress bar inside list indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-[#EA580C] transition-all duration-500 rounded-full"
                      style={{ width: `${item.progressPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-700">{item.progressPercent}%</span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-550 font-mono font-medium">
                  <span>Update: {item.lastUpdated}</span>
                  <span>Oleh: {item.updatedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DRAWING UPLOAD MODAL FOR THE OWNER DASHBOARD (Anti-Slop, High-Fidelity Drag & Drop) */}
      <AnimatePresence>
        {showUploadDrawingModal && (
          <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col"
            >
              <div className="bg-[#1E3A8A] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Upload className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-sm text-white">Unggah Lembar Gambar Kerja Baru</span>
                </div>
                <button
                  onClick={() => setShowUploadDrawingModal(false)}
                  className="p-1 hover:bg-[#11224F] rounded transition text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDrawingUploadSubmit} className="p-5 flex flex-col gap-4">
                {isDrawingUploading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <RefreshCw className="w-10 h-10 text-[#1E3A8A] animate-spin mb-4" />
                    <p className="text-sm font-semibold text-slate-700">Mengonversi & Unggah Berkas...</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs font-sans">Mengonversi file gambar asli lapangan menjadi pangkalan denah digital interaktif.</p>
                    
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mt-6 max-w-xs overflow-hidden border border-slate-200">
                      <div 
                        className="bg-[#EA580C] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${drawingUploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#EA580C] mt-2">{drawingUploadProgress}%</span>
                  </div>
                ) : (
                  <>
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDrawingDragOver}
                      onDragLeave={handleDrawingDragLeave}
                      onDrop={handleDrawingFileDrop}
                      onClick={() => drawingFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                        isDrawingDragging
                          ? 'border-[#1E3A8A] bg-[#1E3A8A]/10'
                          : selectedDrawingFile
                          ? 'border-emerald-500 bg-emerald-50/10'
                          : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="file"
                        ref={drawingFileInputRef}
                        onChange={handleDrawingFileChange}
                        accept=".pdf,image/*"
                        className="hidden"
                      />
                      {selectedDrawingFile ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mb-1" />
                          <span className="text-sm font-bold text-slate-800 break-all">{selectedDrawingFile.name}</span>
                          <span className="text-[11px] text-slate-500">{(selectedDrawingFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <p className="text-xs font-bold text-slate-700 font-sans">Seret & letakkan file gambar atau klik untuk mencari</p>
                          <span className="text-[10px] text-slate-400">PDF, CAD Render, PNG/JPG hingga 50MB</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Nama File PDF Gambar
                      </label>
                      <input
                        type="text"
                        required
                        value={newDrawingFileName}
                        onChange={(e) => setNewDrawingFileName(e.target.value)}
                        placeholder="Contoh: DED_Sipil_ModulKolomUtama.pdf"
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
                          value={newDrawingFilePagesCount}
                          onChange={(e) => setNewDrawingFilePagesCount(parseInt(e.target.value) || 1)}
                          className="w-full text-sm px-3.5 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                          Kategori Gambar
                        </label>
                        <select
                          value={newDrawingFileCategory}
                          onChange={(e) => setNewDrawingFileCategory(e.target.value as any)}
                          className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-bold"
                        >
                          <option value="Arsitektur">Arsitektur</option>
                          <option value="Struktur & Sipil">Struktur & Sipil</option>
                          <option value="Visualisasi 3D">Visualisasi 3D</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 text-xs leading-relaxed text-[#1E3A8A] font-medium font-sans">
                      Data gambar dikirimkan ke pangkas visualisasi. Lembar halaman terstruktur terpasang sinkron untuk kemudahan peninjauan revisi atau PIN komentar di dashboard.
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowUploadDrawingModal(false)}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-150 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#11224F] text-white rounded-lg text-xs font-semibold cursor-pointer"
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
