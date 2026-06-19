import React, { useState, useRef } from 'react';
import { 
  Compass, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Maximize2, 
  Download, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Eye,
  Info,
  ChevronRight,
  Sparkles,
  Check,
  MousePointer,
  HelpCircle,
  Printer,
  MessageSquare,
  Pin,
  Send,
  Trash2,
  User
} from 'lucide-react';

// Live Assets Import
import frontImage from '../assets/images/majalengka_kost_front_1781714630858.jpg';
import poolImage from '../assets/images/majalengka_kost_pool_1781714653066.jpg';
import blueprintImage from '../assets/images/majalengka_kost_blueprint_1781714675636.jpg';

interface SheetInfo {
  id: number;
  page: string;
  title: string;
  category: string;
  image: string;
  isTechnical: boolean;
  scale: string;
  description: string;
  specifications: string[];
  hotspots?: { x: number; y: number; label: string; details: string }[];
  dimensions?: { x1: number; y1: number; x2: number; y2: number; value: string; label: string }[];
}

export interface DrawingComment {
  id: string;
  sheetId: number;
  senderName: string;
  role: string;
  category: string;
  text: string;
  urgency: "Rendah" | "Sedang" | "Tinggi" | "Kritis";
  x?: number;
  y?: number;
  date: string;
  status: "Diproses" | "Selesai" | "Ditolak" | "Terbuka";
}

export const BlueprintViewer: React.FC = () => {
  const [activeSheetId, setActiveSheetId] = useState<number>(2); // Default to Page 2 (Denah Lantai 1)
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [zoom, setZoom] = useState<number>(100);
  const [measuringMode, setMeasuringMode] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [measurementResult, setMeasurementResult] = useState<string | null>(null);
  const [layerGrid, setLayerGrid] = useState<boolean>(true);
  const [layerDetails, setLayerDetails] = useState<boolean>(true);
  const [layerText, setLayerText] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<{ label: string; details: string; x?: number; y?: number } | null>(null);
  const [isExportModelOpen, setIsExportModelOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>("pdf-package");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for comments / "masukan"
  const [comments, setComments] = useState<DrawingComment[]>([
    {
      id: "c1",
      sheetId: 2,
      senderName: "Bpk. Radit Widjaya",
      role: "Owner",
      category: "Revisi Desain",
      text: "Sirkulasi limpahan kolam renang (overflow) mohon diposisikan tersembunyi sedekat mungkin dengan deck kayu agar estetika asri tetap terjaga.",
      urgency: "Sedang",
      x: 82,
      y: 42,
      date: "18 Juni 2026",
      status: "Selesai"
    },
    {
      id: "c2",
      sheetId: 2,
      senderName: "Ir. Ahmad Subagja",
      role: "Konsultan",
      category: "Instalasi MEP",
      text: "Saluran inlet pembuangan kolam renang harus dihubungkan ke tangki filtrasi di ruang mesin bawah sebelum disalurkan kembali ke pancuran resort.",
      urgency: "Tinggi",
      x: 75,
      y: 58,
      date: "19 Juni 2026",
      status: "Diproses"
    },
    {
      id: "c3",
      sheetId: 4,
      senderName: "Ir. Ahmad Subagja",
      role: "Konsultan",
      category: "Koreksi Struktur",
      text: "Ketebalan plat lantai pada as 4-C dekat elevator lift perlu dipastikan 12cm dengan wiremesh m8 double layer untuk meredam resonansi.",
      urgency: "Tinggi",
      x: 70,
      y: 35,
      date: "17 Juni 2026",
      status: "Terbuka"
    },
    {
      id: "c4",
      sheetId: 7,
      senderName: "Bpk. Radit Widjaya",
      role: "Owner",
      category: "Revisi Desain",
      text: "Pilar fasad depan apakah bisa dilapisi marmer tipis Travertine creme alami? Silakan dianalisis peningkatan anggarannya di tabel RAB.",
      urgency: "Sedang",
      x: 37,
      y: 65,
      date: "19 Juni 2026",
      status: "Terbuka"
    }
  ]);

  const [pinningMode, setPinningMode] = useState<boolean>(false);
  const [newCommentName, setNewCommentName] = useState<string>("Bpk. Radit Widjaya");
  const [newCommentRole, setNewCommentRole] = useState<string>("Owner");
  const [newCommentCategory, setNewCommentCategory] = useState<string>("Revisi Desain");
  const [newCommentText, setNewCommentText] = useState<string>("");
  const [newCommentUrgency, setNewCommentUrgency] = useState<"Rendah" | "Sedang" | "Tinggi" | "Kritis">("Sedang");
  const [newCommentX, setNewCommentX] = useState<number | null>(null);
  const [newCommentY, setNewCommentY] = useState<number | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const [view3D, setView3D] = useState<boolean>(false);
  const [isometricHeight, setIsometricHeight] = useState<number>(35);

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // 17 Sheets list exactly matching the images & labels in the PDF screenshot uploads
  const sheets: SheetInfo[] = [
    {
      id: 1,
      page: "A 01",
      title: "Lanskap Utama - Front Aerial Render",
      category: "Visualisasi 3D",
      image: frontImage,
      isTechnical: false,
      scale: "NTS (Non-Technical Scale)",
      description: "Perspektif visualisasi 3D udara tampak depan gedung utama Rumah Kost Jati Tujuh Majalengka.",
      specifications: [
        "Fasad Klasik Modern dengan pilar kokoh",
        "Atasan beton bertulang dengan tangki sirkulasi udara luar",
        "Warna cat utama: Premium Warm Ochre & Khaki",
        "Gerbang entrance melengkung klasik Eropa"
      ],
      hotspots: [
        { x: 37, y: 72, label: "Entrance Utama", details: "Gerbang melengkung megah dengan tinggi elevasi 4,20 meter bermaterial granit poles kasar." },
        { x: 42, y: 55, label: "Fasad Lantai 1", details: "Kaca tempered monolitik setebal 12mm dengan bingkai aluminium powder-coated hitam doff." },
        { x: 30, y: 22, label: "Balkon Kamar", details: "Railing balkon klasik besi tempa semi-tembaga berornamen ulir setinggi 90 cm." }
      ]
    },
    {
      id: 2,
      page: "A 02",
      title: "Denah Tata Letak Lantai 1",
      category: "Arsitektur",
      image: blueprintImage,
      isTechnical: true,
      scale: "1:100",
      description: "Denah lantai dasar (Ground floor plan) yang merinci ruang penunjang publik, resepsionis, tangga, unit kamar primer, kolam renang outdoor, serta cafe bar.",
      specifications: [
        "Lebar Bangunan Utama: 12,00 Meter",
        "Panjang Bangunan Utama: 20,00 Meter",
        "Fasilitas Utama: Teras Utama, Lift/Tangga, Lobi Resepsionis",
        "Unit Kamar Terpasang: Kamar K1, K2, K3, K4, K5, K6",
        "Fasilitas Outdoor: Kolam Renang Resort, Cafe Minimalis"
      ],
      dimensions: [
        { x1: 20, y1: 15, x2: 80, y2: 15, value: "12,70 m", label: "Lebar Lahan Tapak" },
        { x1: 15, y1: 20, x2: 15, y2: 85, value: "20,08 m", label: "Panjang Lahan Tapak" },
        { x1: 20, y1: 72, x2: 50, y2: 72, value: "4,80 m", label: "Bentang Kanan" },
        { x1: 50, y1: 72, x2: 65, y2: 72, value: "2,40 m", label: "Bentang Koridor" }
      ],
      hotspots: [
        { x: 26, y: 50, label: "Teras Depan Utama", details: "Akses masuk utama bangunan dengan tangga berundak dilapisi batu alam andesit kelabu bakar." },
        { x: 35, y: 58, label: "Loby Utama Luas", details: "Area kumpul/tunggu nyaman dengan set kursi lounge dan meja bulat bertanda bulat di gambar." },
        { x: 35, y: 44, label: "Meja Resepsionis", details: "Meja layanan penerima tamu dengan finishing custom dekat core tangga sirkulasi." },
        { x: 36, y: 39, label: "Tangga Core Pertama", details: "Tangga beton sirkulasi lurus pertama selebar 120 cm menuju akses unit lantai atas." },
        { x: 42, y: 39, label: "Tangga Core Kedua", details: "Tangga beton sirkulasi sejajar tangga pertama, melayani sirkulasi evakuasi darurat ganda." },
        { x: 50, y: 39, label: "Unit Kamar Kost K1", details: "Kamar tipe standar baris atas (K1 - K3) dengan penempatan kamar mandi dalam." },
        { x: 58, y: 59, label: "Unit Kamar Kost K5", details: "Kamar tipe standar baris bawah (K4 - K6), dilengkapi ventilasi alami menghadap taman samping." },
        { x: 84, y: 54, label: "Kolam Renang Resort", details: "Kolam renang berukuran bersih 4,20 x 8,50 meter berlapis mosaik alami, lengkap dengan pool deck." },
        { x: 84, y: 28, label: "Cafe & Lounge Outdoor", details: "Fasilitas makan minum santai semi terbuka di sisi atas kolam renang dengan tangga baja spiral." }
      ]
    },
    {
      id: 3,
      page: "A 03",
      title: "Denah Tipikal Lantai 2 s/d Lantai 7",
      category: "Arsitektur",
      image: blueprintImage,
      isTechnical: true,
      scale: "1:100",
      description: "Layout pembagian kamar kost eksklusif yang diulang secara vertikal dari tingkat 2 hingga tingkat teratas untuk optimalisasi kapasitas sewa.",
      specifications: [
        "Pola simetris koridor tengah (doubleloaded corridor)",
        "Lebar koridor sirkulasi: 2,40 meter",
        "12 Kamar per lantai lengkap dengan kamar mandi dalam",
        "Balkon jemur udara di masing-masing kamar"
      ],
      dimensions: [
        { x1: 30, y1: 20, x2: 70, y2: 20, value: "12,00 m", label: "Lebar Kamar Tipikal" }
      ]
    },
    {
      id: 4,
      page: "A 04",
      title: "Denah Ukuran & Struktur Utama (Grid As Balok)",
      category: "Struktur & Sipil",
      image: blueprintImage,
      isTechnical: true,
      scale: "1:100",
      description: "Gambar kerja teknik sipil yang merinci pembagian grid as balok dan kolom pengaku struktur utama proyek Jati Tujuh Majalengka.",
      specifications: [
        "Lebar bentang horizontal: 12,70 meter (dibagi 4,80m + 2,40m + 4,80m)",
        "Bentang vertikal sepanjang: 20,08 meter (modul 4,00m + 4,00m + 4,00m + 4,00m + 4,55m)",
        "Kolom struktur utama: Beton Bertulang K-350 ukuran 40x40 cm",
        "Dimensi balok induk: Beton bertulang 30x60 cm"
      ],
      dimensions: [
        { x1: 30, y1: 18, x2: 45, y2: 18, value: "4,80 m", label: "Modul Samping" },
        { x1: 45, y1: 18, x2: 55, y2: 18, value: "2,40 m", label: "Modul Tengah" },
        { x1: 55, y1: 18, x2: 70, y2: 18, value: "4,80 m", label: "Modul Kanan" }
      ]
    },
    {
      id: 5,
      page: "A 05",
      title: "Denah Pondasi Bored Pile & Sloof",
      category: "Struktur & Sipil",
      image: blueprintImage,
      isTechnical: true,
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
      category: "Potongan & Detail",
      image: blueprintImage,
      isTechnical: true,
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
      category: "Tampak Bangunan",
      image: frontImage,
      isTechnical: true,
      scale: "1:100",
      description: "Elevasi tampak lurus depan arsitektural gedung yang menyajikan detail simetri estetika pilar utama, motif jendela klasik, dan ornamen kanopi.",
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
      category: "Tampak Bangunan",
      image: blueprintImage,
      isTechnical: true,
      scale: "1:100",
      description: "Gambar proyeksi lurus tampak kiri struktur dinding penahan utama, saluran pembuangan air hujan (talang), dan detail jendela modular.",
      specifications: [
        "Finishing dinding: Cat wheathershield anti-lumut",
        "Sistem talang air: Pipa PVC Wavin AW 4 inch tertutup di dalam kolom arsitektur",
        "Kusen jendela: Aluminium Alexindo anodized silver"
      ]
    },
    {
      id: 9,
      page: "A 09",
      title: "Gambar Tampak Samping Kanan",
      category: "Tampak Bangunan",
      image: blueprintImage,
      isTechnical: true,
      scale: "1:100",
      description: "Elemen estetika tampak kanan gedung utama, merinci pembagian bidang dinding, jendela pencahayaan koridor, hingga penempatan tangga evakuasi darurat luar.",
      specifications: [
        "Konstruksi tangga darurat luar: Baja WF-200 dengan anak tangga bordes anti-slip",
        "Sirkulasi udara koridor optimal dengan ventilasi louver aluminium"
      ]
    },
    {
      id: 10,
      page: "A 10",
      title: "Gambar Tampak Belakang",
      category: "Tampak Bangunan",
      image: blueprintImage,
      isTechnical: true,
      scale: "1:100",
      description: "Gambar tampak belakang gedung mengilustrasikan susunan jendela kamar belakang, area jemur komunal, serta pembuangan utilitas.",
      specifications: [
        "Pipa air bersih & kotor: Merek Rucika AW tersembunyi ber-shaft rapi",
        "Akses tangga servis di posisi belakang bangunan"
      ]
    },
    {
      id: 11,
      page: "A 11",
      title: "3D Render - Komparasi Tampak & Potongan Ruangan",
      category: "Visualisasi 3D",
      image: frontImage,
      isTechnical: false,
      scale: "NTS",
      description: "Tampilan render 3D komparatif berdampingan memperlihatkan visual bangunan tampak depan luar di sisi kiri, dan potongan 3D penampang interior kamar di sisi kanan.",
      specifications: [
        "Lobby resepsionis mewah di lantai dasar tampak langsung",
        "Sistem pencahayaan lorong menggunakan LED Strip warm-white 3000K",
        "Pintu kamar kost: Engineering Wood motif Jati"
      ]
    },
    {
      id: 12,
      page: "A 12",
      title: "3D Render - Perspektif Udara Samping Kanan (Realistik)",
      category: "Visualisasi 3D",
      image: poolImage,
      isTechnical: false,
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
      isTechnical: false,
      scale: "NTS",
      description: "Rincian render 3D miring memperlihatkan penampang gedung terbuka secara menyeluruh, menggambarkan tata layout interior, penempatan furniture, dan alur sirkulasi vertikal.",
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
      isTechnical: false,
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
      isTechnical: false,
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
      isTechnical: false,
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
      isTechnical: false,
      scale: "NTS",
      description: "Visualisasi 3D area rekreasi air halaman belakang secara close-up, memamerkan keindahan air jernih kolam renang resort, pancuran batu alam, pilar klasikal, dan vegetasi palem asri.",
      specifications: [
        "Finishing dinding air terjun buatan: Batu andesit bakar alur",
        "Kolam dilengkapi pompa sirkulasi pasir (sand filter Hayward) handal",
        "Dek santai kayu (wooden sun deck) dengan kursi santai rotan sintetis"
      ]
    }
  ];

  // Filters based on tab selection
  const filteredSheets = sheets.filter(sheet => {
    if (activeCategory === "Semua") return true;
    if (activeCategory === "Denah & As") return sheet.category === "Arsitektur" || sheet.id === 4;
    if (activeCategory === "Tampak & Potongan") return sheet.category === "Tampak Bangunan" || sheet.category === "Potongan & Detail";
    if (activeCategory === "Visualisasi 3D") return sheet.category === "Visualisasi 3D";
    return true;
  });

  const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[1];

  // Simulated measurement engine
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (view3D) {
      showToast("Beralihlah ke mode '2D' terlebih dahulu untuk melakukan pengukuran dimensi atau menandai koordinat masukan dengan presisi.");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (pinningMode) {
      setNewCommentX(x);
      setNewCommentY(y);
      showToast(`Titik pin rujukan masukan ditetapkan di X: ${x}%, Y: ${y}%. Silakan tulis isi masukan di form bawah.`);
      return;
    }
    if (!measuringMode) {

      // If there is an existing hotspot very close to the clicked position (within 5%), select it!
      if (activeSheet.hotspots) {
        const closeHotspot = activeSheet.hotspots.find(hs => {
          const dist = Math.sqrt((hs.x - x) ** 2 + (hs.y - y) ** 2);
          return dist <= 5.5;
        });
        if (closeHotspot) {
          setActiveHotspot({ ...closeHotspot, x: closeHotspot.x, y: closeHotspot.y });
          showToast(`Detail Area Terpilih: ${closeHotspot.label}`);
          return;
        }
      }

      // Otherwise, perform smart structural and spatial area identification!
      let identified: { label: string; details: string } | null = null;

      if (activeSheet.id === 1) { // 3D Render
        if (x >= 32 && x <= 42 && y >= 65 && y <= 80) {
          identified = {
            label: "Gerbang Entrance Utama",
            details: "Lengkungan bergaya neo-klasik Eropa setinggi 4,20 meter bermaterial granit alam kasar pekat."
          };
        } else if (x >= 38 && x <= 48 && y >= 45 && y <= 62) {
          identified = {
            label: "Fasad Utama Kaca Lantai 1",
            details: "Kaca monolitik tempered 12 mm anti panas dengan bingkai profil aluminium anodized hitam doff."
          };
        } else if (x >= 25 && x <= 35 && y >= 15 && y <= 30) {
          identified = {
            label: "Balkon Kamar Depan",
            details: "Railing balkon dari besi tempa ornamen ulir klasik lapis semi-tembaga setinggi 90 sentimeter."
          };
        } else {
          identified = {
            label: "Perspektif Eksterior Luar",
            details: "Visualisasi 3D atmosfer pencahayaan sore hari (Golden Hour) untuk Rumah Kost Jati Tujuh Majalengka."
          };
        }
      } else if (activeSheet.id === 2) { // Denah Lantai 1
        if (x >= 13 && x <= 22.5) {
          identified = {
            label: "Sirkulasi Jalan Aspal Depan",
            details: "Jalan aspal hotmiks eksternal tapak selebar 6,00 Meter untuk kelancaran lalu lintas kendaraan umum dan penghuni."
          };
        } else if (x >= 22.5 && x <= 31 && y >= 43 && y <= 57) {
          identified = {
            label: "Teras Drop-Off Depan",
            details: "Akses masuk utama menuju lobi berlantai Andesit Kelabu Bakar 30x60 cm dengan kelandaian tangga berundak 15 cm."
          };
        } else if (x >= 31 && x <= 46 && y >= 52 && y <= 67.5) {
          identified = {
            label: "Lobi Utama & Lounge",
            details: "Ruang penerima tamu luas berlantai Granit Tile 80x80 cm Onyx White, dilengkapi sofa santai bagi tamu atau penghuni."
          };
        } else if (x >= 31 && x <= 46 && y >= 45.1 && y <= 52) {
          identified = {
            label: "Meja Layanan Resepsionis",
            details: "Pusat informasi dan kebersihan kost custom finishing HPL serat kayu jati dipadu bar lampu LED gantung."
          };
        } else if (x >= 33.8 && x <= 44.2 && y >= 35 && y <= 45.5) {
          identified = {
            label: "Struktur Core Tangga Ganda",
            details: "Tangga beton sirkulasi lurus berukuran 2 x (120 cm) dengan anak tangga berlapis grip karet anti-selip."
          };
        } else if (x >= 46 && x <= 53.5 && y >= 35 && y <= 45.5) {
          identified = {
            label: "Unit Kamar Kost K1 (Standard)",
            details: "Kamar kost premium ukuran 3.00 x 3.50 meter lengkap dengan ranjang springbed, wifi, meja belajar, dan kamar mandi dalam."
          };
        } else if (x >= 53.5 && x <= 61 && y >= 35 && y <= 45.5) {
          identified = {
            label: "Unit Kamar Kost K2 (Standard)",
            details: "Kamar unit baris atas ideal dengan pintu sliding UPVC kedap suara, menghadap langsung koridor sirkulasi."
          };
        } else if (x >= 61 && x <= 68.5 && y >= 35 && y <= 45.5) {
          identified = {
            label: "Unit Kamar Kost K3 (Standard)",
            details: "Unit pojok timur baris atas seluas 10.5 m² dengan kelebihan akses dekat void instalasi MEP pemanas air."
          };
        } else if (x >= 46 && x <= 53.5 && y >= 52 && y <= 67.5) {
          identified = {
            label: "Unit Kamar Kost K4 (Standard)",
            details: "Kamar unit baris bawah dengan jendela kusen aluminium membuka ke arah luar (taman sirkulasi samping)."
          };
        } else if (x >= 53.5 && x <= 61 && y >= 52 && y <= 67.5) {
          identified = {
            label: "Unit Kamar Kost K5 (Standard)",
            details: "Kamar tatanan simetris dengan instalasi pendingin Daikin multiposisi, cat antikotor premium putih salju."
          };
        } else if (x >= 61 && x <= 68.5 && y >= 52 && y <= 67.5) {
          identified = {
            label: "Unit Kamar Kost K6 (Standard)",
            details: "Kamar berukuran bersih 10.5 m² dekat pool-deck, sangat strategis bagi penghuni yang menyukai rekreasi air."
          };
        } else if (x >= 46 && x <= 68.5 && y >= 45.6 && y <= 52) {
          identified = {
            label: "Koridor Tengah Utama",
            details: "Sirkulasi utama horizontal selebar 1,80 meter dengan plafon sela (cove ceiling) gypsum dan pencahayaan temaram hangat."
          };
        } else if (x >= 74 && x <= 88.5 && y >= 20.5 && y <= 34) {
          identified = {
            label: "Cafe & Bar Komunal Outdoor",
            details: "Sisi kongkow santai penyewa semi-outdoor lengkap dengan meja semen ekspos, peneduh kanopi besi, & counter saji."
          };
        } else if (x >= 76.5 && x <= 88.5 && y >= 39.5 && y <= 67.5) {
          identified = {
            label: "Kolam Renang Resort",
            details: "Kolam renang rekreasi ukuran 4,20 x 8,50 m, kedalaman landai 1.4m dilapisi mosaik kaca biru muda impor."
          };
        } else {
          identified = {
            label: "Area Tapak Luar (Lanskap)",
            details: "Halaman luar tapak bangunan kost dengan resapan biopori hijau dan perkerasan kombinasi paving block berpola."
          };
        }
      } else if (activeSheet.id === 3) { // Denah Tipikal Lantai 2-7
        if (x >= 33.8 && x <= 44.2 && y >= 35 && y <= 45.5) {
          identified = {
            label: "Core Sirkulasi Vertikal (Lift & Tangga)",
            details: "Area lift penumpang kapasitas 8 pax dipadu tangga evakuasi darurat dengan dinding pemisah tahan api 2 jam."
          };
        } else if (x >= 46 && x <= 53.5 && y >= 35 && y <= 45.5) {
          identified = {
            label: "Kamar Tipikal K-201 / K-301",
            details: "Kamar kost tingkat tipikal dengan balkon mini pribadi berpagar besi hollow, menyajikan ventilasi silang alami maksimal."
          };
        } else if (x >= 53.5 && x <= 61 && y >= 35 && y <= 45.5) {
          identified = {
            label: "Kamar Tipikal K-202 / K-302",
            details: "Layout kamar modular standard 3x3.5m, partisi dinding double gypsum dengan rockwool peredam bising antar unit."
          };
        } else if (x >= 61 && x <= 68.5 && y >= 35 && y <= 45.5) {
          identified = {
            label: "Kamar Tipikal K-203 / K-303",
            details: "Unit premium dengan view timur lepas, dilengkapi smart door lock digital & stopkontak colokan charger USB universal."
          };
        } else if (x >= 46 && x <= 53.5 && y >= 52 && y <= 67.5) {
          identified = {
            label: "Kamar Tipikal K-204 / K-304",
            details: "Rencana tata interior optimal dengan lemari tanam (wardrobe built-in) & pencahayaan sela headboard ranjang."
          };
        } else if (x >= 53.5 && x <= 61 && y >= 52 && y <= 67.5) {
          identified = {
            label: "Kamar Tipikal K-205 / K-305",
            details: "Kamar mandi dalam berubin keramik anti-slip motif teraso, lengkap kloset duduk hemat air dual-flush Toto."
          };
        } else if (x >= 61 && x <= 68.5 && y >= 52 && y <= 67.5) {
          identified = {
            label: "Kamar Tipikal K-206 / K-306",
            details: "Hujung kamar baris bawah dengan pencahayaan kaca samping melimpah, sirkulasi udara optimal 24 jam."
          };
        } else if (x >= 46 && x <= 68.5 && y >= 45.6 && y <= 52) {
          identified = {
            label: "Koridor Tipikal Lantai Atas",
            details: "Sirkulasi utama horizontal selebar 2,40 meter untuk kenyamanan ekstra, dilengkapi lampu penunjuk arah darurat (Exit sign)."
          };
        } else {
          identified = {
            label: "Sisi Luar Bangunan",
            details: "Balkon udara atau as-as daktilitas struktur eksternal vertikal bangunan kost."
          };
        }
      } else if (activeSheet.id === 4) { // Struktur As Grid
        if (Math.abs(x - 30) < 4) {
          identified = {
            label: "Garis As A - Kolom Tepi Kiri",
            details: "Kolom struktur luar beton bertulang K-350 ukuran 40x40 cm dengan begel ulir rapat anti-gaya geser seismik."
          };
        } else if (Math.abs(x - 45) < 4) {
          identified = {
            label: "Garis As B - Kolom Sirkulasi",
            details: "Daerah kolom tumpu tangga lift dengan kekuatan aksial maksimum menopang beban pelat lantai hingga 400 kg/m²."
          };
        } else if (Math.abs(x - 55) < 4) {
          identified = {
            label: "Garis As C - Kolom Koridor",
            details: "Sistem balok anak struktur bentang koridor 2,40 meter bersanding dengan void pemipaan shaft MEP vertikal."
          };
        } else if (Math.abs(x - 70) < 4) {
          identified = {
            label: "Garis As D - Kolom Kanan",
            details: "Kolom batas tanah dengan perkerasan tiang pancang geser sekunder guna melindungi tapak sirkulasi kolam renang."
          };
        } else {
          identified = {
            label: "Bentang Struktur Balok Induk",
            details: "Balok beton bertulang pratekan ukuran 30x60 cm melintasi as kamar kost dengan tulangan tarik tinggi."
          };
        }
      } else { // Fallback for other sheets (id 5, 6, 7, etc)
        identified = {
          label: `Area Terpilih di ${activeSheet.title}`,
          details: `Koordinat terdeteksi di X: ${x}%, Y: ${y}%. Karakter spesifikasi teknik: Skala ${activeSheet.scale}, Kategori: ${activeSheet.category}.`
        };
      }

      if (identified) {
        setActiveHotspot({
          label: identified.label,
          details: identified.details,
          x,
          y
        });
        showToast(`Detail Ruangan: ${identified.label}`);
      }
      return;
    }

    const newPoints = [...measurePoints, { x, y }];
    setMeasurePoints(newPoints);

    if (newPoints.length === 2) {
      // Calculate simulated engineering distance in meters
      const dx = newPoints[1].x - newPoints[0].x;
      const dy = newPoints[1].y - newPoints[0].y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate realistic engineering metric (e.g. 100 pixels in x max is 12.7 meters)
      let calculatedMeters = (pixelDist * 0.18).toFixed(2);
      
      // Snapping to typical engineering grid layouts for professional feeling
      const metersNum = parseFloat(calculatedMeters);
      let snappedMessage = "";
      if (Math.abs(metersNum - 4.8) < 0.5) {
        snappedMessage = "Terukur presisi: 4.80 Meter (Bentang Kamar Standar)";
      } else if (Math.abs(metersNum - 2.4) < 0.4) {
        snappedMessage = "Terukur presisi: 2.40 Meter (Lebar Koridor / Sirkulasi Tangga)";
      } else if (Math.abs(metersNum - 12.0) < 1.0) {
        snappedMessage = "Terukur presisi: 12.00 Meter (Bentang Lebar Struktur Balok)";
      } else if (Math.abs(metersNum - 20.08) < 1.5) {
        snappedMessage = "Terukur presisi: 20.08 Meter (Panjang Total Lahan Tapak)";
      } else if (Math.abs(metersNum - 4.0) < 0.4) {
        snappedMessage = "Terukur presisi: 4.00 Meter (Modulus Kolom Utama)";
      } else {
        snappedMessage = `Terukur presisi: ${calculatedMeters} Meter (Skala Gambar ${activeSheet.scale})`;
      }

      setMeasurementResult(snappedMessage);
      showToast(snappedMessage);
      setMeasuringMode(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Simulated highly polished plotter export wizard
  const runPlotterExport = () => {
    setIsExporting(true);
    setExportProgress(5);
    setExportStatus("Menyambung ke digital plotter-server proyek...");

    const steps = [
      { prg: 20, msg: "Memisahkan master layer gambar (Dinding, As Grid, MEP)..." },
      { prg: 45, msg: "Menghitung modulus rasterisasi format resolusi tinggi A0..." },
      { prg: 70, msg: "Mengompresi data vector CAD dalam payload biner..." },
      { prg: 90, msg: "Membuat tanda tangan kriptografi hash verifikasi gambar..." },
      { prg: 100, msg: "Sukses mengunggah arsip digital! Memulai download..." }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        setExportProgress(steps[currentStepIdx].prg);
        setExportStatus(steps[currentStepIdx].msg);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        // Execute real download triggers
        setTimeout(() => {
          setIsExporting(false);
          setIsExportModelOpen(false);
          setExportProgress(0);
          showToast(`Berhasil mengekspor Sheet ${activeSheet.page} dalam pilihan format!`);
          
          // Actual file trigger download using browser blob generator
          const dummyLink = document.createElement('a');
          dummyLink.href = activeSheet.image;
          dummyLink.download = `PTFGI-KOST_S7_MAJALENGKA-${activeSheet.page.replace(/\s+/g, '_')}-${activeSheet.title.replace(/\s+/g, '_')}.jpg`;
          document.body.appendChild(dummyLink);
          dummyLink.click();
          document.body.removeChild(dummyLink);
        }, 1000);
      }
    }, 1200);
  };

  const resetMeasurement = () => {
    setMeasurePoints([]);
    setMeasurementResult(null);
    setMeasuringMode(true);
    showToast("Klik titik awal pengukuran di atas kanvas.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 animate-fade-in relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div id="toast-blueprint" className="fixed bottom-24 right-6 z-50 bg-[#1E3A8A] text-white py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400/20 max-w-md animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <p className="text-xs font-semibold font-mono">{toastMessage}</p>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-[#1E3A8A] rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 animate-spin" /> PORTOFOLIO BLUEPRINT & DETAIL TEKNIS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] tracking-tight font-display">
            Blueprint &amp; Lanskap 3D Resmi
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Eksplorasi modul 17 halaman gambar kerja arsitektur, detail struktur sipil, dan peta visualisasi lanskap 3D resolusi tinggi untuk proyek Pembangunan Rumah Kost 7 Lantai Jati Tujuh Majalengka.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0 relative z-10">
          <button 
            id="btn-print-simulation"
            onClick={() => {
              setExportFormat("pdf-package");
              setIsExportModelOpen(true);
            }}
            className="px-5 py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition hover:scale-[1.02] active:scale-95 duration-100"
          >
            <Printer className="w-4 h-4" /> Cetak Paket Dokumen (PDF)
          </button>
          <button 
            id="btn-export-options"
            onClick={() => {
              setExportFormat("active-vector-svg");
              setIsExportModelOpen(true);
            }}
            className="px-5 py-3 bg-[#EA580C] hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition hover:scale-[1.02] active:scale-95 duration-100"
          >
            <Download className="w-4 h-4" /> Ekspor File CAD / Image
          </button>
        </div>
      </div>

      {/* FILTER CATEGORIES ROW */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl max-w-fit overflow-x-auto whitespace-nowrap scrollbar-none">
        {["Semua", "Denah & As", "Tampak & Potongan", "Visualisasi 3D"].map((cat) => (
          <button
            key={cat}
            id={`btn-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => {
              setActiveCategory(cat);
              // Auto-select first in filtered list
              const matches = sheets.filter(sheet => {
                if (cat === "Semua") return true;
                if (cat === "Denah & As") return sheet.category === "Arsitektur" || sheet.id === 4;
                if (cat === "Tampak & Potongan") return sheet.category === "Tampak Bangunan" || sheet.category === "Potongan & Detail";
                if (cat === "Visualisasi 3D") return sheet.category === "Visualisasi 3D";
                return true;
              });
              if (matches.length > 0) setActiveSheetId(matches[0].id);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
              activeCategory === cat 
                ? 'bg-white text-[#1E3A8A] shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {cat === "Semua" ? "✨ Semua 17 Lembar" : cat}
          </button>
        ))}
      </div>

      {/* MAIN SCREEN INTERFACE - 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SHEETS SIDEBAR INDEX */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-4 max-h-[720px] overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
              Daftar Lembar Gambar
            </span>
            <span className="text-[10px] bg-blue-50 text-[#1E3A8A] font-mono px-2 py-0.5 rounded-full font-bold">
              {filteredSheets.length} Gambar
            </span>
          </div>

          <div id="sheets-list-container" className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            {filteredSheets.map((st) => {
              const isSelected = activeSheetId === st.id;
              return (
                <button
                  key={st.id}
                  id={`sheet-item-${st.id}`}
                  onClick={() => {
                    setActiveSheetId(st.id);
                    setMeasurePoints([]);
                    setMeasurementResult(null);
                    setActiveHotspot(null);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition duration-150 border flex gap-2.5 items-center justify-between ${
                    isSelected 
                      ? 'bg-blue-50/80 border-[#1E3A8A]/30 text-[#1E3A8A] font-medium shadow-2xs' 
                      : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-[10px] shrink-0 ${
                      isSelected ? 'bg-[#1E3A8A] text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {st.page.replace(" ", "")}
                    </div>
                    <div className="truncate text-left">
                      <p className="text-xs font-bold truncate leading-tight">{st.title}</p>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{st.category} &bull; {st.scale}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-[#1E3A8A]' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Help box */}
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100 text-[11px] text-[#A16207] leading-relaxed flex flex-col gap-2">
            <div className="flex gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold">Tips Inspeksi:</p>
                <p>Pilih lembar teknis berskala untuk menyalakan mode kalkulator ukuran rujukan.</p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-amber-200/55 pt-2 text-[#EA580C]">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#EA580C]" />
              <div>
                <p className="font-bold">Fitur Interaktif:</p>
                <p className="text-[10.5px]">Klik area/ruangan mana saja pada gambar denah untuk memunculkan spesifikasi teknis detail di titik tersebut secara interaktif.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CAD VIEWPORT & CONTROLLER */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* THE CAD VIEWPORT CANVAS */}
          <div className="bg-[#0b132b] rounded-3xl border-4 border-slate-900 shadow-xl text-white overflow-hidden flex flex-col relative select-none">
            
            {/* CANVAS ACTIONS HEADER CONTROLS */}
            <div className="bg-[#020914] px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 relative z-35">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-black uppercase text-blue-300 tracking-wider">
                  Live Viewport: PTFGI-DED-A{activeSheetId} &bull; Model Space
                </span>
              </div>

              {/* Toolbar controls */}
              <div className="flex items-center gap-1">
                {/* Layer Control menu for Technical Drawings */}
                {activeSheet.isTechnical && (
                  <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg mr-2">
                    <button 
                      id="toggle-grid"
                      onClick={() => setLayerGrid(!layerGrid)}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-medium flex items-center gap-1 transition ${layerGrid ? 'bg-blue-600/35 text-blue-200 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Layers className="w-3 h-3" /> GRID
                    </button>
                    <button 
                      id="toggle-details"
                      onClick={() => setLayerDetails(!layerDetails)}
                      className={`px-2 py-1 rounded text-[9px] font-mono font-medium flex items-center gap-1 transition ${layerDetails ? 'bg-blue-600/35 text-blue-200 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Layers className="w-3 h-3" /> ANOTASI
                    </button>
                  </div>
                )}

                {/* Measuring tool toggle */}
                {activeSheet.isTechnical && (
                  <button 
                    id="btn-scale-measure"
                    onClick={() => {
                      if (measuringMode) {
                        setMeasuringMode(false);
                        setMeasurePoints([]);
                        setMeasurementResult(null);
                      } else {
                        setMeasuringMode(true);
                        setMeasurePoints([]);
                        setMeasurementResult(null);
                        showToast("Mengaktifkan kalkulator skala. Klik titik awal di atas.");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                      measuringMode 
                        ? 'bg-orange-500 text-white animate-pulse' 
                        : 'bg-slate-900 text-blue-200 border border-blue-500/20 hover:bg-slate-800'
                    }`}
                  >
                    <MousePointer className="w-3.5 h-3.5" /> 
                    {measuringMode ? "Mengukur..." : "Ukur Dimensi"}
                  </button>
                )}

                {/* Pinning mode toggle */}
                <button
                  id="btn-pin-comment-mode"
                  onClick={() => {
                    if (pinningMode) {
                      setPinningMode(false);
                      setNewCommentX(null);
                      setNewCommentY(null);
                    } else {
                      setPinningMode(true);
                      setMeasuringMode(false);
                      setMeasurePoints([]);
                      setMeasurementResult(null);
                      showToast("Mode Pin Masukan Aktif. Klik area manapun di blueprint untuk meletakkan pin revisi.");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition mr-1 ${
                    pinningMode
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-900 text-rose-300 border border-rose-500/20 hover:bg-slate-800'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  {pinningMode ? "Menaruh Pin..." : "Pasang Pin Redline"}
                </button>

                {/* Zoom tools */}
                <button 
                  id="btn-zoom-out"
                  onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-slate-400 font-mono w-10 text-center">{zoom}%</span>
                <button 
                  id="btn-zoom-in"
                  onClick={() => setZoom(prev => Math.min(200, prev + 25))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button 
                  id="btn-zoom-reset"
                  onClick={() => {
                    setZoom(100);
                    setMeasurePoints([]);
                    setMeasurementResult(null);
                    setMeasuringMode(false);
                    showToast("Viewport disetel ulang.");
                  }}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs"
                  title="Reset viewport"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

                {/* 2D / 3D Isometric view toggle */}
                <div className="flex bg-slate-950 p-[3px] rounded-lg border border-slate-800">
                  <button
                    id="btn-view-2d"
                    type="button"
                    onClick={() => {
                      setView3D(false);
                      showToast("Tampilan denah datar 2D aktif.");
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                      !view3D 
                        ? 'bg-[#1e293b] text-cyan-400 border border-cyan-500/25 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    2D
                  </button>
                  <button
                    id="btn-view-3d"
                    type="button"
                    onClick={() => {
                      setView3D(true);
                      showToast("Tampilan 3D Isometrik diaktifkan! Level details melayang di atas cetak biru.");
                    }}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                      view3D 
                        ? 'bg-[#1e293b] text-orange-400 border border-orange-500/25 shadow-sm animate-pulse' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    3D Iso
                  </button>
                </div>
              </div>
            </div>

            {/* VIEWER DISPLAY CANVAS ZONE */}
            <div 
              id="canvas-viewport"
              ref={canvasContainerRef}
              onClick={handleCanvasClick}
              className={`relative bg-[#020914] w-full min-h-[460px] sm:min-h-[520px] flex items-center justify-center p-4 transition-all duration-200 ${
                view3D ? 'overflow-visible' : 'overflow-hidden'
              } ${
                measuringMode ? 'cursor-crosshair border border-orange-500/25' : 'cursor-default'
              }`}
              style={{ perspective: view3D ? '1400px' : 'none', perspectiveOrigin: '50% 50%' }}
            >
              
              {/* STYLED GRID FOR CAD ACCURACY */}
              {activeSheet.isTechnical && layerGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-15"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                ></div>
              )}

              {/* ACTIVE SCHEMATIC DRAWING RENDER OR IMAGE */}
              <div 
                className="transition-all duration-500 ease-out flex flex-col items-center justify-center relative max-w-full"
                style={{ 
                  transform: view3D 
                    ? `rotateX(58deg) rotateZ(-30deg) scale(${(zoom / 100) * 0.95}) translateY(-2%)` 
                    : `scale(${zoom / 100})`, 
                  transformStyle: view3D ? 'preserve-3d' : 'flat' as any,
                  width: '100%', 
                  height: '100%', 
                  minWidth: '320px', 
                  maxWidth: '780px'
                }}
              >
                <div 
                  className={`relative w-full aspect-[4/3] bg-[#020a17] rounded-xl border border-blue-900/40 transition-all duration-500 ${
                    view3D ? 'overflow-visible shadow-indigo-950/20 shadow-2xl' : 'overflow-hidden'
                  }`}
                  style={{ transformStyle: view3D ? 'preserve-3d' : 'flat' as any }}
                >
                  
                  {/* Site blueprint ground plane grid under 3D view */}
                  {view3D && (
                    <div 
                      className="absolute inset-0 bg-blue-950/15 rounded-xl border border-blue-500/10 pointer-events-none transition-all duration-500"
                      style={{ 
                        transform: 'translateZ(-40px)', 
                        transformStyle: 'preserve-3d',
                        backgroundImage: 'linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                      }}
                    />
                  )}

                  {/* Corner glowing connection vectors */}
                  {view3D && (
                    <div className="absolute inset-0 pointer-events-none transition-all duration-500" style={{ transformStyle: 'preserve-3d' }}>
                      <div className="absolute left-0 top-0 w-[1.5px] bg-gradient-to-t from-blue-500/50 to-orange-500/50" style={{ height: `${isometricHeight}px`, transform: `translateZ(0px) rotateX(-90deg)`, transformOrigin: 'top' }} />
                      <div className="absolute right-0 top-0 w-[1.5px] bg-gradient-to-t from-blue-500/50 to-orange-500/50" style={{ height: `${isometricHeight}px`, transform: `translateZ(0px) rotateX(-90deg)`, transformOrigin: 'top' }} />
                      <div className="absolute left-0 bottom-0 w-[1.5px] bg-gradient-to-t from-blue-500/50 to-orange-500/50" style={{ height: `${isometricHeight}px`, transform: `translateZ(0px) rotateX(-90deg)`, transformOrigin: 'bottom' }} />
                      <div className="absolute right-0 bottom-0 w-[1.5px] bg-gradient-to-t from-blue-500/50 to-orange-500/50" style={{ height: `${isometricHeight}px`, transform: `translateZ(0px) rotateX(-90deg)`, transformOrigin: 'bottom' }} />
                    </div>
                  )}

                  <img 
                    src={activeSheet.image} 
                    alt={activeSheet.title}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover select-none pointer-events-none transition-all duration-500 ${
                      view3D ? 'opacity-55' : 'opacity-90'
                    }`}
                  />

                  {/* ACTIVE SHEETS OVERLAYS OR HOTSPOTS IN REAL-TIME */}
                  
                  {/* Vector drafting simulations for Page 2 Denah (Simulated CAD Lines over Blueprint image to make it ultra authentic) */}
                  {activeSheet.id === 2 && layerDetails && (
                    <svg 
                      viewBox="0 0 100 75" 
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ 
                        transform: view3D ? `translateZ(${isometricHeight}px)` : 'none', 
                        transformStyle: view3D ? 'preserve-3d' : 'flat' as any,
                        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        filter: view3D ? 'drop-shadow(0 15px 20px rgba(37, 99, 235, 0.35))' : 'none'
                      }}
                    >
                      {/* Interactive drafting elements & Grid guide bounding boxes */}
                      {/* External boundary guide */}
                      <rect x="13.5" y="19" width="75.5" height="49.5" fill="none" stroke="#2563eb" strokeWidth="0.25" strokeDasharray="1,1" />

                      {/* Front road markings */}
                      <path d="M 13.5,19 L 13.5,68.5 M 22.5,19 L 22.5,68.5" fill="none" stroke="#64748b" strokeWidth="0.2" />
                      <line x1="18" y1="19" x2="18" y2="68.5" stroke="#94a3b8" strokeWidth="0.2" strokeDasharray="3,3" />
                      <text x="16.5" y="44" fill="#94a3b8" fontSize="1.8" transform="rotate(-90 16.5 44)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">JALAN ASPAL</text>

                      {/* Teras steps */}
                      <rect x="22.5" y="43" width="8.5" height="13.5" fill="none" stroke="#2563eb" strokeWidth="0.2" />
                      <line x1="24.2" y1="43" x2="24.2" y2="56.5" stroke="#2563eb" strokeWidth="0.15" />
                      <line x1="25.9" y1="43" x2="25.9" y2="56.5" stroke="#2563eb" strokeWidth="0.15" />
                      <line x1="27.6" y1="43" x2="27.6" y2="56.5" stroke="#2563eb" strokeWidth="0.15" />
                      <text x="29" y="50" fill="#2563eb" fontSize="1.6" textAnchor="middle" fontWeight="black" fontFamily="sans-serif">TERAS</text>

                      {/* Loby Lounge with table & chairs */}
                      <rect x="31" y="52" width="15" height="15.5" fill="#0f172a/80" rx="0.5" stroke="#334155" strokeWidth="0.2" />
                      <circle cx="38.5" cy="59.5" r="2.2" fill="none" stroke="#38bdf8" strokeWidth="0.25" />
                      <circle cx="35" cy="59.5" r="0.8" fill="none" stroke="#38bdf8" strokeWidth="0.15" />
                      <circle cx="42" cy="59.5" r="0.8" fill="none" stroke="#38bdf8" strokeWidth="0.15" />
                      <circle cx="38.5" cy="56" r="0.8" fill="none" stroke="#38bdf8" strokeWidth="0.15" />
                      <circle cx="38.5" cy="63" r="0.8" fill="none" stroke="#38bdf8" strokeWidth="0.15" />
                      <text x="38.5" y="52.8" fill="#38bdf8" fontSize="2.0" textAnchor="middle" fontFamily="monospace" fontWeight="black">LOBY</text>

                      {/* Receptionist */}
                      <rect x="31" y="45.5" width="15" height="6.5" fill="#0f172a/85" rx="0.5" stroke="#334155" strokeWidth="0.2" />
                      <rect x="31.5" y="49" width="11" height="1.8" fill="none" stroke="#a78bfa" strokeWidth="0.2" />
                      <text x="37" y="48.5" fill="#a78bfa" fontSize="1.4" textAnchor="middle" fontWeight="black">RESEPSIONIS</text>

                      {/* Tangga Core Kiri */}
                      <rect x="33.8" y="35" width="5.2" height="10.5" fill="#020617/90" stroke="#fbbf24" strokeWidth="0.2" />
                      <line x1="33.8" y1="36.5" x2="39" y2="36.5" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="33.8" y1="38" x2="39" y2="38" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="33.8" y1="39.5" x2="39" y2="39.5" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="33.8" y1="41" x2="39" y2="41" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="33.8" y1="42.5" x2="39" y2="42.5" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="33.8" y1="44" x2="39" y2="44" stroke="#fbbf24" strokeWidth="0.15" />
                      <path d="M 36.4,44.5 L 36.4,35.5 M 36.4,35.5 L 35.1,37 M 36.4,35.5 L 37.7,37" fill="none" stroke="#f59e0b" strokeWidth="0.2" />
                      <text x="31.8" y="38" fill="#fbbf24" fontSize="1.3" transform="rotate(-90 31.8 38)" textAnchor="middle" fontWeight="bold">TANGGA</text>

                      {/* Tangga Core Kanan */}
                      <rect x="39" y="35" width="5.2" height="10.5" fill="#020617/90" stroke="#fbbf24" strokeWidth="0.2" />
                      <line x1="39" y1="36.5" x2="44.2" y2="36.5" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="39" y1="38" x2="44.2" y2="38" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="39" y1="39.5" x2="44.2" y2="39.5" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="39" y1="41" x2="44.2" y2="41" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="39" y1="42.5" x2="44.2" y2="42.5" stroke="#fbbf24" strokeWidth="0.15" />
                      <line x1="39" y1="44" x2="44.2" y2="44" stroke="#fbbf24" strokeWidth="0.15" />
                      <path d="M 41.6,44.5 L 41.6,35.5 M 41.6,35.5 L 40.3,37 M 41.6,35.5 L 42.9,37" fill="none" stroke="#f59e0b" strokeWidth="0.2" />
                      <text x="46.0" y="38" fill="#fbbf24" fontSize="1.3" transform="rotate(90 46.0 38)" textAnchor="middle" fontWeight="bold">TANGGA</text>

                      {/* Rooms Top Row K1-K2-K3 */}
                      <rect x="46" y="35" width="22.5" height="10.5" fill="#020617/75" stroke="#38bdf8" strokeWidth="0.25" />
                      <line x1="53.5" y1="35" x2="53.5" y2="45.5" stroke="#38bdf8" strokeWidth="0.2" />
                      <line x1="61" y1="35" x2="61" y2="45.5" stroke="#38bdf8" strokeWidth="0.2" />
                      
                      <rect x="47" y="35.5" width="3.5" height="3" fill="#38bdf8/10" stroke="#0284c7" strokeWidth="0.15" />
                      <line x1="47" y1="36.5" x2="50.5" y2="36.5" stroke="#0284c7" strokeWidth="0.15" />
                      <text x="49.75" y="41.5" fill="#38bdf8" fontSize="2.8" textAnchor="middle" fontWeight="black" fontFamily="monospace">K1</text>
                      
                      <rect x="54.5" y="35.5" width="3.5" height="3" fill="#38bdf8/10" stroke="#0284c7" strokeWidth="0.15" />
                      <line x1="54.5" y1="36.5" x2="58" y2="36.5" stroke="#0284c7" strokeWidth="0.15" />
                      <text x="57.25" y="41.5" fill="#38bdf8" fontSize="2.8" textAnchor="middle" fontWeight="black" fontFamily="monospace">K2</text>
                      
                      <rect x="62" y="35.5" width="3.5" height="3" fill="#38bdf8/10" stroke="#0284c7" strokeWidth="0.15" />
                      <line x1="62" y1="36.5" x2="65.5" y2="36.5" stroke="#0284c7" strokeWidth="0.15" />
                      <text x="64.75" y="41.5" fill="#38bdf8" fontSize="2.8" textAnchor="middle" fontWeight="black" fontFamily="monospace">K3</text>

                      {/* Rooms Bottom Row K4-K5-K6 */}
                      <rect x="46" y="52" width="22.5" height="15.5" fill="#020617/75" stroke="#38bdf8" strokeWidth="0.25" />
                      <line x1="53.5" y1="52" x2="53.5" y2="67.5" stroke="#38bdf8" strokeWidth="0.2" />
                      <line x1="61" y1="52" x2="61" y2="67.5" stroke="#38bdf8" strokeWidth="0.2" />
                      
                      <rect x="47" y="63" width="3.5" height="3" fill="#38bdf8/10" stroke="#0284c7" strokeWidth="0.15" />
                      <line x1="47" y1="65" x2="50.5" y2="65" stroke="#0284c7" strokeWidth="0.15" />
                      <text x="49.75" y="59.5" fill="#38bdf8" fontSize="2.8" textAnchor="middle" fontWeight="black" fontFamily="monospace">K4</text>
                      
                      <rect x="54.5" y="63" width="3.5" height="3" fill="#38bdf8/10" stroke="#0284c7" strokeWidth="0.15" />
                      <line x1="54.5" y1="65" x2="58" y2="65" stroke="#0284c7" strokeWidth="0.15" />
                      <text x="57.25" y="59.5" fill="#38bdf8" fontSize="2.8" textAnchor="middle" fontWeight="black" fontFamily="monospace">K5</text>
                      
                      <rect x="62" y="63" width="3.5" height="3" fill="#38bdf8/10" stroke="#0284c7" strokeWidth="0.15" />
                      <line x1="62" y1="65" x2="65.5" y2="65" stroke="#0284c7" strokeWidth="0.15" />
                      <text x="64.75" y="59.5" fill="#38bdf8" fontSize="2.8" textAnchor="middle" fontWeight="black" fontFamily="monospace">K6</text>

                      {/* Leisure zones on the far right */}
                      {/* Cafe with dining tables */}
                      <rect x="74" y="20.5" width="14.5" height="13.5" fill="#facc15/10" rx="0.5" stroke="#fbbf24" strokeWidth="0.25" />
                      <line x1="74" y1="29.5" x2="88.5" y2="29.5" stroke="#fbbf24" strokeWidth="0.15" strokeDasharray="1,1" />
                      <text x="81.2" y="24.5" fill="#fbbf24" fontSize="2.2" textAnchor="middle" fontWeight="black" fontFamily="monospace">CAFE</text>
                      
                      {/* Swimming Pool (KOLAM RENANG) */}
                      <rect x="76.5" y="39.5" width="12" height="28" fill="#22d3ee/20" rx="0.5" stroke="#06b6d4" strokeWidth="0.3" />
                      <line x1="77.5" y1="42.5" x2="87.5" y2="42.5" stroke="#06b6d4" strokeWidth="0.1" strokeDasharray="2,2" />
                      <line x1="77.5" y1="48.5" x2="87.5" y2="48.5" stroke="#06b6d4" strokeWidth="0.1" strokeDasharray="2,2" />
                      <line x1="77.5" y1="54.5" x2="87.5" y2="54.5" stroke="#06b6d4" strokeWidth="0.1" strokeDasharray="2,2" />
                      <line x1="77.5" y1="60.5" x2="87.5" y2="60.5" stroke="#06b6d4" strokeWidth="0.1" strokeDasharray="2,2" />
                      <text x="82.5" y="51.5" fill="#06b6d4" fontSize="1.8" textAnchor="middle" fontWeight="black" fontFamily="sans-serif">KOLAM</text>
                      <text x="82.5" y="54.5" fill="#06b6d4" fontSize="1.8" textAnchor="middle" fontWeight="black" fontFamily="sans-serif">RENANG</text>
                    </svg>
                  )}

                  {/* Vector drafting simulations for Page 4 As Kolom Grid */}
                  {activeSheet.id === 4 && layerDetails && (
                    <svg 
                      viewBox="0 0 100 75" 
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ 
                        transform: view3D ? `translateZ(${isometricHeight}px)` : 'none', 
                        transformStyle: view3D ? 'preserve-3d' : 'flat' as any,
                        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        filter: view3D ? 'drop-shadow(0 15px 20px rgba(239, 68, 68, 0.35))' : 'none'
                      }}
                    >
                      {/* Column lines */}
                      <line x1="30" y1="15" x2="30" y2="60" stroke="#ef4444" strokeWidth="0.3" strokeDasharray="2,2" />
                      <line x1="45" y1="15" x2="45" y2="60" stroke="#ef4444" strokeWidth="0.3" strokeDasharray="2,2" />
                      <line x1="55" y1="15" x2="55" y2="60" stroke="#ef4444" strokeWidth="0.3" strokeDasharray="2,2" />
                      <line x1="70" y1="15" x2="70" y2="60" stroke="#ef4444" strokeWidth="0.3" strokeDasharray="2,2" />
                      
                      {/* Grid Bubble indicators */}
                      <circle cx="30" cy="11" r="2" fill="#ef4444" />
                      <text x="30" y="12" fill="white" fontSize="3.2" textAnchor="middle" fontWeight="bold" fontFamily="monospace">A</text>
                      <circle cx="45" cy="11" r="2" fill="#ef4444" />
                      <text x="45" y="12" fill="white" fontSize="3.2" textAnchor="middle" fontWeight="bold" fontFamily="monospace">B</text>
                      <circle cx="55" cy="11" r="2" fill="#ef4444" />
                      <text x="55" y="12" fill="white" fontSize="3.2" textAnchor="middle" fontWeight="bold" fontFamily="monospace">C</text>
                      <circle cx="70" cy="11" r="2" fill="#ef4444" />
                      <text x="70" y="12" fill="white" fontSize="3.2" textAnchor="middle" fontWeight="bold" fontFamily="monospace">D</text>
                    </svg>
                  )}

                  {/* Live Measurement drawing lines */}
                  {measurePoints.map((pt, idx) => (
                    <div 
                      key={idx}
                      className="absolute w-3 h-3 bg-orange-500 rounded-full border-2 border-white z-40 shadow-lg transition-all duration-300"
                      style={{ 
                        left: `${pt.x}%`, 
                        top: `${pt.y}%`,
                        transform: view3D ? `translateZ(${isometricHeight}px) translate(-55%, -55%)` : 'translate(-50%, -50%)',
                        transformStyle: view3D ? 'preserve-3d' : 'flat' as any
                      }}
                    >
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[9px] px-1 py-0.5 rounded font-mono font-black shadow-xs">
                        T{idx + 1}
                      </span>
                    </div>
                  ))}
                  {measurePoints.length === 2 && (
                    <svg 
                      className="absolute inset-0 w-full h-full pointer-events-none z-30 transition-all duration-300"
                      style={{ 
                        transform: view3D ? `translateZ(${isometricHeight}px)` : 'none', 
                        transformStyle: view3D ? 'preserve-3d' : 'flat' as any
                      }}
                    >
                      <line 
                        x1={`${measurePoints[0].x}%`} 
                        y1={`${measurePoints[0].y}%`} 
                        x2={`${measurePoints[1].x}%`} 
                        y2={`${measurePoints[1].y}%`} 
                        stroke="#f97316" 
                        strokeWidth="2.5" 
                        strokeDasharray="4,4" 
                      />
                    </svg>
                  )}

                  {/* Dynamic Hotspots mapping */}
                  {activeSheet.hotspots && (
                    <div className="absolute inset-0 pointer-events-auto" style={{ transformStyle: view3D ? 'preserve-3d' : 'flat' as any }}>
                      {activeSheet.hotspots.map((hs, idx) => (
                        <div 
                          key={idx}
                          id={`hotspot-${idx}`}
                          onClick={() => setActiveHotspot(hs)}
                          className="absolute group z-35 transition-all duration-300 cursor-pointer"
                          style={{ 
                            left: `${hs.x}%`, 
                            top: `${hs.y}%`,
                            transform: view3D ? `translateZ(${isometricHeight + 12}px) translate(-50%, -50%)` : 'translate(-50%, -50%)',
                            transformStyle: view3D ? 'preserve-3d' : 'flat' as any
                          }}
                        >
                          {/* Standing holographic wire line connecting floating pin to blueprint surface */}
                          {view3D && (
                            <div 
                              className="absolute w-[1.5px] bg-gradient-to-t from-blue-500/20 to-orange-500/80 pointer-events-none"
                              style={{ 
                                height: `${isometricHeight + 12}px`, 
                                transform: 'rotateX(-90deg)', 
                                transformOrigin: 'bottom',
                                bottom: '10px',
                                left: 'calc(50% - 0.75px)'
                              }} 
                            />
                          )}
                          <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white animate-ping absolute opacity-55"></div>
                          <div className="w-5 h-5 bg-[#EA580C] hover:bg-orange-500 text-white rounded-full border-2 border-white flex items-center justify-center shadow-lg transition duration-150 relative">
                            <Sparkles className="w-2.5 h-2.5" />
                          </div>
                          
                          {/* In-canvas popovers */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-slate-900/95 text-white p-2.5 rounded-xl border border-blue-500/30 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 text-left">
                            <p className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-[#EA580C]">{hs.label}</p>
                            <p className="text-[10.5px] leading-tight text-slate-200 mt-1">{hs.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic click selection point indicator */}
                  {activeHotspot && activeHotspot.x !== undefined && activeHotspot.y !== undefined && (
                    <div 
                      className="absolute pointer-events-none z-40 transition-all duration-300"
                      style={{ 
                        left: `${activeHotspot.x}%`, 
                        top: `${activeHotspot.y}%`,
                        transform: view3D ? `translateZ(${isometricHeight + 12}px) translate(-50%, -50%)` : 'translate(-50%, -50%)',
                        transformStyle: view3D ? 'preserve-3d' : 'flat' as any
                      }}
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-orange-500 bg-orange-500/15 animate-ping absolute -left-4 -top-4 opacity-75"></div>
                      <div className="w-4 h-4 bg-orange-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg transform scale-110">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Comments/Feedback/Revisions Pins */}
                  {comments
                    .filter(c => c.sheetId === activeSheet.id && c.x !== undefined && c.y !== undefined)
                    .map((c) => {
                      const isSelected = selectedCommentId === c.id;
                      return (
                        <div
                          key={c.id}
                          id={`comment-pin-${c.id}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent clicking background canvas
                            setSelectedCommentId(c.id);
                            showToast(`Review masukan dari ${c.senderName}: "${c.text.substring(0, 30)}..."`);
                          }}
                          className="absolute cursor-pointer z-35 group transition-all duration-300"
                          style={{ 
                            left: `${c.x}%`, 
                            top: `${c.y}%`,
                            transform: view3D ? `translateZ(${isometricHeight + 12}px) translate(-50%, -50%)` : 'translate(-50%, -50%)',
                            transformStyle: view3D ? 'preserve-3d' : 'flat' as any
                          }}
                        >
                          {/* Standing holographic wire line connecting floating pin to blueprint surface */}
                          {view3D && (
                            <div 
                              className="absolute w-[1.5px] bg-gradient-to-t from-blue-500/20 to-rose-500/80 pointer-events-none"
                              style={{ 
                                height: `${isometricHeight + 12}px`, 
                                transform: 'rotateX(-90deg)', 
                                transformOrigin: 'bottom',
                                bottom: '12px',
                                left: 'calc(50% - 0.75px)'
                              }} 
                            />
                          )}
                          <div className={`w-6 h-6 rounded-full border border-white flex items-center justify-center shadow-lg transition duration-150 absolute transform -translate-x-1/2 -translate-y-1/2 ${
                            isSelected 
                              ? 'bg-rose-500 scale-125 z-40 ring-4 ring-rose-400/30' 
                              : c.urgency === 'Kritis' 
                                ? 'bg-red-600 scale-110 ring-2 ring-red-400/20' 
                                : c.urgency === 'Tinggi' 
                                  ? 'bg-orange-500 scale-105' 
                                  : 'bg-blue-600'
                          }`}>
                            <MessageSquare className="w-3 h-3 text-white" />
                          </div>

                          {/* In-canvas preview popover */}
                          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-56 bg-slate-950/95 text-white p-2.5 rounded-xl border border-rose-500/30 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 text-left pointer-events-none">
                            <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                              <span className="text-[9px] font-black font-mono text-rose-300">{c.senderName} ({c.role})</span>
                              <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                                c.status === 'Selesai' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>{c.status}</span>
                            </div>
                            <p className="text-[10px] leading-tight text-slate-200">{c.text}</p>
                          </div>
                        </div>
                      );
                    })}

                  {/* Temporary placing pin when in pinningMode */}
                  {pinningMode && newCommentX !== null && newCommentY !== null && (
                    <div
                      className="absolute z-40 transition-all duration-300"
                      style={{ 
                        left: `${newCommentX}%`, 
                        top: `${newCommentY}%`,
                        transform: view3D ? `translateZ(${isometricHeight + 12}px) translate(-50%, -50%)` : 'translate(-50%, -50%)',
                        transformStyle: view3D ? 'preserve-3d' : 'flat' as any
                      }}
                    >
                      {/* Standing holographic wire line connecting floating pin to blueprint surface */}
                      {view3D && (
                        <div 
                          className="absolute w-[1.5px] bg-gradient-to-t from-blue-500/20 to-rose-600/80 pointer-events-none"
                          style={{ 
                            height: `${isometricHeight + 12}px`, 
                            transform: 'rotateX(-90deg)', 
                            transformOrigin: 'bottom',
                            bottom: '10px',
                            left: 'calc(50% - 0.75px)'
                          }} 
                        />
                      )}
                      <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white animate-bounce flex items-center justify-center shadow-lg">
                        <Pin className="w-3 h-3 text-white" />
                      </div>
                      <span className="absolute left-6 -top-1 bg-rose-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-md whitespace-nowrap font-bold">
                        Pin Baru Di Sini (Klik ulang untuk pindah)
                      </span>
                    </div>
                  )}

                </div>
              </div>

              {/* Dynamic Measurement overlay box */}
              {measurementResult && (
                <div id="measurement-overlay-box" className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border-2 border-orange-500/90 text-white py-2 px-4 rounded-xl shadow-lg flex items-center gap-3">
                  <div className="p-1 bg-orange-500 text-white rounded-md shrink-0">
                    <MousePointer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-[9.5px] font-bold text-slate-400 font-mono">PANJANG BENTANG TERKALIBRASI</h5>
                    <p className="text-xs font-black font-mono text-orange-400 leading-tight">{measurementResult}</p>
                  </div>
                  <button 
                    id="btn-scale-remeasure"
                    onClick={resetMeasurement}
                    className="p-1 px-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-[9.5px] rounded-lg text-slate-300 font-mono transition"
                  >
                    Ulangi
                  </button>
                </div>
              )}

              {/* Hotspot details sidebar popup overlay inside the canvas */}
              {activeHotspot && (
                <div id="hotspot-detail-box" className="absolute right-4 bottom-24 z-40 max-w-xs bg-slate-900/95 border border-blue-500/30 text-white p-3.5 rounded-2xl shadow-2xl flex flex-col gap-2 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span className="text-[10px] font-extrabold font-mono text-blue-300 uppercase tracking-wider">Arsitektur Detail</span>
                    </div>
                    <button 
                      onClick={() => setActiveHotspot(null)}
                      className="text-slate-400 hover:text-white text-xs font-mono font-bold px-1.5"
                    >
                      X
                    </button>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{activeHotspot.label}</h4>
                    <p className="text-[11px] text-slate-300 leading-snug mt-1">{activeHotspot.details}</p>
                  </div>
                </div>
              )}

              {/* Slider TINGGI LEVITASI LAPIS untuk 3D Isometrik */}
              {view3D && (
                <div className="absolute left-4 bottom-4 bg-slate-950/85 border border-slate-800 rounded-xl p-3 backdrop-blur-md z-45 flex flex-col gap-1.5 shadow-2xl max-w-[200px] text-[10.5px]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold">
                    <span className="flex items-center gap-1 text-orange-400">
                      <Sparkles className="w-3" /> LEVITASI 3D
                    </span>
                    <span>{isometricHeight}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 font-mono">10</span>
                    <input 
                      id="input-isometric-height"
                      type="range" 
                      min="10" 
                      max="100" 
                      value={isometricHeight} 
                      onChange={(e) => setIsometricHeight(Number(e.target.value))}
                      className="w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-orange-500" 
                    />
                    <span className="text-[9px] text-slate-500 font-mono">100</span>
                  </div>
                </div>
              )}
            </div>

            {/* HIGH FIDELITY BLUEPRINT TITLE BLOCK (KOP GAMBAR) */}
            <div id="custom-title-block" className="bg-white border-t-4 border-slate-900 p-4 font-sans text-slate-800 flex flex-col md:flex-row gap-4 items-stretch select-auto relative z-20">
              
              {/* Box 1: Drawing Title */}
              <div className="flex-1 border-r border-slate-200 pr-4 flex flex-col justify-between min-w-[200px]">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 font-mono uppercase font-black tracking-widest block">NAMA LEMBAR GAMBAR</span>
                  <h3 className="text-sm font-extrabold text-[#1E3A8A] uppercase tracking-tight leading-tight">{activeSheet.title}</h3>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold bg-[#1E3A8A]/5 px-2 py-0.5 rounded border border-blue-100 text-[#1E3A8A]">Skala Rujukan: {activeSheet.scale}</span>
                  <span className="text-[9px] font-mono font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">Kategori: {activeSheet.category}</span>
                </div>
              </div>

              {/* Box 2: Project Title (Exactly from OCR) */}
              <div className="flex-1 border-r border-slate-200 px-4 flex flex-col justify-between md:max-w-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-mono uppercase font-black tracking-widest block">PROYEK UTAMA</span>
                  <p className="text-xs font-black text-[#EA580C] uppercase tracking-widest leading-normal mt-0.5 font-display">
                    PEMBANGUNAN RUMAH KOST JATI TUJUH MAJALENGKA
                  </p>
                </div>
                <div className="text-[9.5px] text-slate-400 mt-2 font-mono flex justify-between">
                  <span>Owner: Bpk. Radit W.</span>
                  <span>Konsultan: PT. Foresyndo</span>
                </div>
              </div>

              {/* Box 3: Revisions & Remarks block (Matching OCR list layout) */}
              <div className="hidden xl:flex flex-col flex-1 border-r border-slate-200 px-4 min-w-[180px] justify-between text-[9px] font-mono text-slate-500">
                <div>
                  <div className="flex border-b border-slate-100 pb-0.5 font-black text-slate-400">
                    <span className="w-5">NO</span>
                    <span className="w-16">TANGGAL</span>
                    <span className="flex-1">KETERANGAN REVISI</span>
                  </div>
                  <div className="flex py-0.5 border-b border-dashed border-slate-50">
                    <span className="w-5">1</span>
                    <span className="w-16">10/05/2026</span>
                    <span className="truncate">Penyesuaian tata letak pondasi bor</span>
                  </div>
                  <div className="flex py-0.5 text-slate-400">
                    <span className="w-5">2</span>
                    <span className="w-16">15/06/2026</span>
                    <span className="truncate">Alinyemen fasad melingkar</span>
                  </div>
                </div>
                <span className="text-[8.5px] text-slate-300 font-normal">All modifications verified by Head Architect</span>
              </div>

              {/* Box 4: Page Code Indicator (Matching OCR layout right block A 01) */}
              <div className="w-24 border border-slate-900 bg-slate-900 text-white rounded-lg p-2 flex flex-col justify-center items-center shrink-0">
                <span className="text-[8.5px] font-mono font-black tracking-widest text-[#EA580C]">PAGE NO</span>
                <span className="text-2xl font-black font-mono leading-none py-1 text-white tracking-tighter">
                  {activeSheet.page.replace("A", "").trim()}
                </span>
                <span className="text-[9px] font-mono font-bold tracking-normal text-blue-300 border-t border-slate-800 pt-0.5 w-full text-center">
                  CODE: {activeSheet.page.replace(" ", "")}
                </span>
              </div>
            </div>

            {/* FOOTER METADATA SECURITY VERIFICATION */}
            <div className="bg-slate-950 py-2.5 px-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-slate-400 gap-2">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" /> 
                Kop Gambar Resmi &amp; Akreditasi Verifikasi Arsitek &bull; PT. Foresyndo Cipta Abadi
              </span>
              <span>
                SHA-256 HASH VERIFICATION: <span className="font-bold text-slate-300">8F2D-C3A1-{activeSheet.id}DED-PTFGI</span>
              </span>
            </div>
          </div>

          {/* BELOW CANVAS DETAILED INFORMATION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD 1: TECHNICAL DESCRIPTION & METRIC SPEC */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#1E3A8A]" />
                <h4 className="text-xs font-bold font-mono text-[#1E3A8A] uppercase tracking-wider">Catatan Teknis Lembar Gambar</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">{activeSheet.description}</p>
              
              <div className="pt-2">
                <h5 className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5">Fitur Arsitektur / Komponen Sipil:</h5>
                <ul className="space-y-1">
                  {activeSheet.specifications.map((spec, index) => (
                    <li key={index} className="text-xs text-slate-700 flex gap-2 items-start leading-tight">
                      <span className="text-[#EA580C] font-bold mt-0.5 shrink-0">&bull;</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CARD 2: DIGITAL COMPLIANCE REGISTER & QUALITY CHECKS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wider">Verifikasi Kepatuhan Gambar Kerja</h4>
                  </div>
                  <span className="text-[9.5px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">
                    SIAP PLOT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl space-y-0.5 text-slate-700">
                    <p className="text-[9px] font-mono text-slate-400">STANDAR SATUAN</p>
                    <p className="font-bold">Milimeter (Metric)</p>
                  </div>
                  <div className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl space-y-0.5 text-slate-700">
                    <p className="text-[9px] font-mono text-slate-400">UKURAN KERTAS</p>
                    <p className="font-bold">A0 Standar (ISO-216)</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Cemerlang Plot (Dull-Check)</span>
                    <span className="text-emerald-600 font-mono font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> Lulus</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Alinyemen Grid &amp; Sumbu Kolom</span>
                    <span className="text-emerald-600 font-mono font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> Lulus</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sertifikasi Rekayasa Nilai (VE)</span>
                    <span className="text-emerald-600 font-mono font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> 100% Ok</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-[10.5px] text-[#1E3A8A] leading-normal mt-2">
                <strong>Ingin Mengetahui Perhitungan Biaya?</strong> Beralihlah ke tab <strong>E-RAB Resmi</strong> untuk memeriksa estimasi harga barang di masing-masing area kerja.
              </div>
            </div>

          </div>

            {/* CARD 3: COLLABORATION REDLINE & FEEDBACK ("MASUKAN") */}
            <div id="collab-feedback-panel" className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[9px] font-black uppercase font-mono tracking-wider flex items-center gap-1 max-w-fit">
                    <MessageSquare className="w-3 h-3" /> RUANG KOLABORASI INTELIJEN
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 font-display">
                    Pusat Masukan, Koreksi &amp; Redline Kerja
                  </h3>
                  <p className="text-xs text-slate-400 animate-pulse">
                    Kirim kritik desainer, catatan konstruksi, atau masukan revisi rujukan langsung untuk diselesaikan oleh tim arsitek.
                  </p>
                </div>

                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl text-xs font-mono font-bold">
                  <button 
                    onClick={() => setSelectedCommentId(null)}
                    className="px-3 py-1.5 bg-white text-[#1E3A8A] rounded-lg shadow-2xs text-[10px] cursor-pointer"
                  >
                    Reset Filter Pin
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* FORM COLUMN: INPUT FORM ("TAMBAH MASUKAN") */}
                <div className="xl:col-span-5 bg-slate-50/50 rounded-2xl border border-slate-150 p-4 space-y-4 text-left">
                  <h4 className="text-xs font-black font-mono text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
                    <Send className="w-3.5 h-3.5 text-[#EA580C]" /> Berikan Masukan Baru
                  </h4>

                  <div className="space-y-3">
                    {/* Informative Coordinate Banner */}
                    {newCommentX !== null && newCommentY !== null ? (
                      <div className="bg-rose-50 text-rose-800 border border-rose-200 p-2.5 rounded-xl text-xs flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Pin className="w-4 h-4 text-rose-600 animate-bounce" />
                          <div>
                            <p className="font-bold">Koordinat Terpasang:</p>
                            <p className="text-[10px]">X: {newCommentX}%, Y: {newCommentY}%</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setNewCommentX(null);
                            setNewCommentY(null);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] px-2 py-1 rounded cursor-pointer"
                        >
                          Batal Pin
                        </button>
                      </div>
                    ) : (
                      <div className="bg-amber-50 text-amber-800 p-2.5 rounded-xl text-[11px] leading-relaxed border border-amber-100 flex gap-2">
                        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Kaitkan Catatan pada Gambar?</p>
                          <p>Aktifkan <strong className="text-rose-700 font-bold">"Pasang Pin Redline"</strong> di toolbar atas, klik lokasi bermasalah pada gambar, lalu tulis deskripsinya di sini.</p>
                        </div>
                      </div>
                    )}

                    {/* Sender Profile */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold font-mono text-slate-455 uppercase">Pengirim</label>
                        <input 
                          type="text" 
                          value={newCommentName}
                          onChange={(e) => setNewCommentName(e.target.value)}
                          placeholder="Nama Anda"
                          className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-slate-800 outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold font-mono text-slate-455 uppercase">Peran Proyek</label>
                        <select 
                          value={newCommentRole}
                          onChange={(e) => setNewCommentRole(e.target.value)}
                          className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none font-semibold text-xs cursor-pointer"
                        >
                          <option value="Owner">Owner (Bpk. Radit W)</option>
                          <option value="Konsultan">Arsitek Konsultan</option>
                          <option value="Project Manager">Project Manager</option>
                          <option value="Mitra Kontraktor">Mitra Kontraktor</option>
                          <option value="Investor">Mitra Investor</option>
                        </select>
                      </div>
                    </div>

                    {/* Category & Urgency */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold font-mono text-slate-455 uppercase">Urgensi Masukan</label>
                        <select 
                          value={newCommentUrgency}
                          onChange={(e) => setNewCommentUrgency(e.target.value as any)}
                          className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none font-semibold text-xs cursor-pointer"
                        >
                          <option value="Rendah">🟢 Rendah (Kosmetik)</option>
                          <option value="Sedang">🟡 Sedang (Optimalisasi)</option>
                          <option value="Tinggi">🟠 Tinggi (Struktural/MEP)</option>
                          <option value="Kritis">🔴 Kritis (Fatal/Bloking)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9.5px] font-bold font-mono text-slate-455 uppercase">Kategori Asosiasi</label>
                        <select 
                          value={newCommentCategory}
                          onChange={(e) => setNewCommentCategory(e.target.value)}
                          className="w-full bg-white border border-slate-250 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none font-semibold text-xs cursor-pointer"
                        >
                          <option value="Revisi Desain">Revisi Desain Fasad</option>
                          <option value="Koreksi Struktur">Koreksi Struktur Sipil</option>
                          <option value="Instalasi MEP">Sistem MEP &amp; Utilitas</option>
                          <option value="Lanskap &amp; Finishing">Lanskap &amp; Finishing</option>
                          <option value="Lainnya">Lain-lain / Administrasi</option>
                        </select>
                      </div>
                    </div>

                    {/* Description Text */}
                    <div className="space-y-1 text-xs">
                      <label className="text-[9.5px] font-bold font-mono text-slate-455 uppercase">Isi Masukan / Kritik Konstruksi</label>
                      <textarea 
                        rows={3}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Ketikan rincian masukan Anda di sini. Jelaskan sejelas mungkin lokasi atau as kolom rujukan jika tidak memakai pin..."
                        className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-slate-800 outline-none focus:border-blue-500 font-medium leading-relaxed resize-none text-[11px]"
                      ></textarea>
                    </div>

                    <button
                      onClick={() => {
                        if (!newCommentText.trim()) {
                          showToast("Gagal! Tuliskan deskripsi masukan terlebih dahulu.");
                          return;
                        }
                        const newId = `c${comments.length + 1}_${Date.now()}`;
                        const freshComment: DrawingComment = {
                          id: newId,
                          sheetId: activeSheetId,
                          senderName: newCommentName || "Anonim",
                          role: newCommentRole,
                          category: newCommentCategory,
                          text: newCommentText,
                          urgency: newCommentUrgency,
                          x: newCommentX !== null ? newCommentX : undefined,
                          y: newCommentY !== null ? newCommentY : undefined,
                          date: "Hari Ini, 10:27",
                          status: "Terbuka"
                        };

                        setComments([freshComment, ...comments]);
                        setNewCommentText("");
                        setNewCommentX(null);
                        setNewCommentY(null);
                        setPinningMode(false);
                        setSelectedCommentId(newId);
                        showToast("Sukses memasukkan feedback konstruksi baru!");
                      }}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition hover:scale-[1.01] active:scale-95 duration-100 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Kirim &amp; Publikasikan Masukan
                    </button>
                    
                  </div>
                </div>

                {/* TIMELINE COLUMN: LIST FEEDBACKS */}
                <div className="xl:col-span-7 space-y-3 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-black font-mono text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-blue-600" /> 
                      Daftar Review Masukan Komparatif
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                      {comments.filter(c => c.sheetId === activeSheet.id).length} Masukan pada Lembar ini
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {comments.filter(c => c.sheetId === activeSheet.id).length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-slate-100 rounded-3xl text-center space-y-1">
                        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">Belum ada masukan untuk lembar gambar kerja ini.</p>
                        <p className="text-[10.5px] text-slate-400">Jadilah yang pertama memberikan masukan audit arsitektur di form sebelah kiri.</p>
                      </div>
                    ) : (
                      comments
                        .filter(c => c.sheetId === activeSheet.id)
                        .map((c) => {
                          const isHighlighted = selectedCommentId === c.id;
                          return (
                            <div 
                              key={c.id} 
                              id={`comment-item-card-${c.id}`}
                              onClick={() => setSelectedCommentId(c.id)}
                              className={`p-3.5 rounded-2xl border transition duration-150 relative space-y-2 cursor-pointer ${
                                isHighlighted 
                                  ? 'border-rose-300 bg-rose-50/50 shadow-2xs' 
                                  : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/30'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex gap-2.5 items-start">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-extrabold text-slate-700 shrink-0">
                                    {c.senderName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="text-xs font-black text-slate-800 leading-tight">{c.senderName}</p>
                                      <span className="text-[9px] bg-slate-150 text-slate-650 font-bold px-1.5 py-0.2 rounded font-sans scale-90">
                                        {c.role}
                                      </span>
                                    </div>
                                    <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{c.date} &bull; Urgensi: <strong className={
                                      c.urgency === 'Kritis' ? 'text-red-650 font-black' : c.urgency === 'Tinggi' ? 'text-orange-500 font-black' : 'text-blue-750 font-bold'
                                    }>{c.urgency}</strong></p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {/* Status controller drop */}
                                  <select 
                                    value={c.status}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const updatedVal = e.target.value as any;
                                      setComments(prev => prev.map(item => item.id === c.id ? { ...item, status: updatedVal } : item));
                                      showToast(`Mengubah status masukan menjadi "${updatedVal}"`);
                                    }}
                                    className={`text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-full border outline-none cursor-pointer ${
                                      c.status === 'Selesai' 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : c.status === 'Diproses' 
                                          ? 'bg-blue-50 border-blue-200 text-[#1E3A8A]' 
                                          : c.status === 'Ditolak' 
                                            ? 'bg-red-50 border-red-200 text-red-700' 
                                            : 'bg-amber-50 border-amber-200 text-amber-750'
                                    }`}
                                  >
                                    <option value="Terbuka">Terbuka</option>
                                    <option value="Diproses">Diproses</option>
                                    <option value="Selesai">Selesai ✓</option>
                                    <option value="Ditolak">Ditolak ✗</option>
                                  </select>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setComments(prev => prev.filter(item => item.id !== c.id));
                                      showToast("Berhasil menghapus catatan masukan.");
                                      if (selectedCommentId === c.id) setSelectedCommentId(null);
                                    }}
                                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                                    title="Hapus masukan"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed font-medium font-sans">{c.text}</p>

                              {c.x !== undefined && c.y !== undefined && (
                                <div className="pt-1.5 flex justify-between items-center text-[10px] text-rose-700 font-semibold font-mono bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                                  <span className="flex items-center gap-1">
                                    <Pin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> Terpancang koordinat X: {c.x}%, Y: {c.y}%
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCommentId(c.id);
                                      // Scroll smoothly back up to view the canvas
                                      const viewPortPrer = document.getElementById('canvas-viewport');
                                      if(viewPortPrer) {
                                        viewPortPrer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        showToast(`Pins locator terpilih. Menunjuk rujukan di atas.`);
                                      }
                                    }}
                                    className="text-[9.5px] font-bold bg-[#1E3A8A] text-white px-2.5 py-1 rounded-lg hover:bg-blue-900 transition cursor-pointer"
                                  >
                                    Tunjukkan Lokasi Pin ↑
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      {/* EXPORT OPTIONS MODAL DIALOG */}
      {isExportModelOpen && (
        <div id="export-plotter-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-[#1E3A8A] text-white p-5 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-blue-200">System Plotter &amp; Export</h3>
                <p className="text-base font-black">Ekspor Gambar Konstruksi</p>
              </div>
              <button 
                onClick={() => {
                  if(!isExporting) setIsExportModelOpen(false);
                }}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition disabled:opacity-50"
                disabled={isExporting}
              >
                X
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              
              {/* Spinner loader on exporting */}
              {isExporting ? (
                <div id="export-loading-state" className="py-8 text-center space-y-5">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#EA580C] animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest font-mono">SEDANG MEMPROSES...</h4>
                    <p className="text-xs text-slate-500 h-6 leading-tight max-w-sm mx-auto">{exportStatus}</p>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
                    <div 
                      className="bg-[#EA580C] h-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{exportProgress}% Selesai</span>
                </div>
              ) : (
                <div className="space-y-5">
                  
                  {/* Sheet info box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex gap-3 text-xs">
                    <FileText className="w-8 h-8 text-[#1E3A8A] shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-[#1E3A8A]">Lembar Aktif Terpilih:</h4>
                      <p className="font-semibold text-slate-700">{activeSheet.page} - {activeSheet.title}</p>
                      <p className="text-slate-400 mt-1 font-mono text-[10.5px]">Dimensi Rujukan Skala {activeSheet.scale} halaman blueprint.</p>
                    </div>
                  </div>

                  {/* Export Options selectors */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase font-mono text-slate-400 block tracking-wider">Pilih Format Output:</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                      
                      {/* Option 1: PDF */}
                      <button
                        onClick={() => setExportFormat("pdf-package")}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer min-h-24 ${
                          exportFormat === "pdf-package" 
                            ? 'border-[#1E3A8A] bg-blue-50/50 ring-2 ring-[#1E3A8A]/10' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-black text-xs text-[#1E3A8A] flex items-center gap-1">
                          Dokumen PDF (.PDF) <CheckCircle className={`w-3.5 h-3.5 text-[#1E3A8A] ${exportFormat === "pdf-package" ? "opacity-100" : "opacity-0"}`} />
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                          Mengekspor bundel lengkap 17 halaman blueprint arsitektur, teknik &amp; 3D dalam satu dokumen tunggal siap cetak.
                        </p>
                      </button>

                      {/* Option 2: SVG */}
                      <button
                        onClick={() => {
                          if (activeSheet.isTechnical) setExportFormat("active-vector-svg");
                          else showToast("Opsi format vektor tidak didukung untuk lembar visualisasi render.");
                        }}
                        disabled={!activeSheet.isTechnical}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer min-h-24 disabled:opacity-40 disabled:cursor-not-allowed ${
                          exportFormat === "active-vector-svg" 
                            ? 'border-[#1E3A8A] bg-blue-50/50 ring-2 ring-[#1E3A8A]/10' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-black text-xs text-[#1E3A8A] flex items-center gap-1">
                          CAD Vector SVG (.SVG) <CheckCircle className={`w-3.5 h-3.5 text-[#1E3A8A] ${exportFormat === "active-vector-svg" ? "opacity-100" : "opacity-0"}`} />
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                          Unduh gambar teknik terpilih dalam format vektor SVG presisi dengan struktur layer arsitektur lengkap.
                        </p>
                      </button>

                      {/* Option 3: Image */}
                      <button
                        onClick={() => setExportFormat("active-hi-res-image")}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer min-h-24 ${
                          exportFormat === "active-hi-res-image" 
                            ? 'border-[#1E3A8A] bg-blue-50/50 ring-2 ring-[#1E3A8A]/10' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-black text-xs text-[#1E3A8A] flex items-center gap-1">
                          High-Res Image (.JPEG) <CheckCircle className={`w-3.5 h-3.5 text-[#1E3A8A] ${exportFormat === "active-hi-res-image" ? "opacity-100" : "opacity-0"}`} />
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                          Keluarkan representasi visual maupun dokumen CAD aktif saat ini ke format berkas JPEG beresolusi tajam.
                        </p>
                      </button>

                      {/* Option 4: CAD DWG */}
                      <button
                        onClick={() => {
                          if (activeSheet.isTechnical) setExportFormat("active-dwg");
                          else showToast("Format mentah CAD DWG hanya tersedia untuk draf teknis sipil.");
                        }}
                        disabled={!activeSheet.isTechnical}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition cursor-pointer min-h-24 disabled:opacity-40 disabled:cursor-not-allowed ${
                          exportFormat === "active-dwg" 
                            ? 'border-[#1E3A8A] bg-blue-50/50 ring-2 ring-[#1E3A8A]/10' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-black text-xs text-[#1E3A8A] flex items-center gap-1">
                          CAD DWG File (.DWG) <CheckCircle className={`w-3.5 h-3.5 text-[#1E3A8A] ${exportFormat === "active-dwg" ? "opacity-100" : "opacity-0"}`} />
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                          Dapatkan format arsip draf mentah DWG standar AutoCAD untuk kebutuhan rekayasa atau edit lanjutan di lokal.
                        </p>
                      </button>

                    </div>
                  </div>

                  {/* Quality & Plotter parameters */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold uppercase font-mono text-slate-400">Rendering Engine:</label>
                      <select id="select-renderer" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 outline-none text-xs font-mono font-bold">
                        <option value="vector">Foresyndo Vector Draft v2</option>
                        <option value="raster">High-Fidelity Raster v4</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold uppercase font-mono text-slate-400">Skala Output:</label>
                      <select id="select-scale" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 outline-none text-xs font-mono font-bold">
                        <option value="match">Sesuai Lembar ({activeSheet.scale})</option>
                        <option value="full">Skala Penuh (1:1 Model Space)</option>
                      </select>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Footer Buttons */}
            {!isExporting && (
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between gap-3 items-center">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Plotter Server: READY
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsExportModelOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition duration-150"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-confirm-export"
                    onClick={runPlotterExport}
                    className="px-5 py-2 bg-[#EA580C] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5 duration-100"
                  >
                    <Download className="w-3.5 h-3.5" /> Mulai Plot &amp; Ekspor
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
