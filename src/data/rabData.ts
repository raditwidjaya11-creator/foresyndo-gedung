export interface RABItem {
  id: string;
  code: string;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  chapter: string;
  page: number;
}

export const RAB_METADATA = {
  companyName: "PT FORESYNDO GLOBAL INDONESIA",
  address: "Jl. Banjaran Raya KM 13 Bandung - Jawa Barat",
  email: "info@foresyndo.com",
  phone: "+62 823 3809 4205",
  title: "RENCANA ANGGARAN BIAYA (RAB)",
  projectNo: "PR-2026-FGI-004",
  date: "19/6/2026",
  projectName: "PROYEK PEMBANGUNAN GEDUNG 7 Lt 12X20 METER JATI TUJUH - MAJALENGKA",
  projectLocation: "Jatitujuh, Majalengka, Jawa Barat",
  subTotal: 13036429875,
  taxRate: 0.11, // PPN 11%
  taxAmount: 1434007286.25,
  grandTotal: 14470437161.25,
  status: "Aman (On-Budget)",
  preparedBy: "Tim Estimator Proyek",
  approvedBy: "Project Manager"
};

export const rabItems: RABItem[] = [
  // ==================== PAGE 1 ====================
  // --- A. PEKERJAAN PERSIAPAN ---
  {
    id: "rab-A.01",
    code: "A.1",
    description: "Pembersihan lahan (land clearing)",
    volume: 240,
    unit: "m2",
    unitPrice: 9000,
    totalCost: 2160000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.02",
    code: "A.2",
    description: "Pemagaran sementara proyek (Seng 2m Tinggi)",
    volume: 84,
    unit: "m1",
    unitPrice: 271250,
    totalCost: 22785000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.03",
    code: "A.3",
    description: "Direksi keet & Kantor Lapangan (4x 6 m, semi permanen)",
    volume: 1,
    unit: "unit",
    unitPrice: 33000000,
    totalCost: 33000000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.04",
    code: "A.4",
    description: "Gudang material sementara (3x 4 m, semi permanen)",
    volume: 1,
    unit: "unit",
    unitPrice: 10200000,
    totalCost: 10200000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.05",
    code: "A.5",
    description: "Mobilisasi alat berat (excavator, dump truck)",
    volume: 1,
    unit: "ls",
    unitPrice: 15750000,
    totalCost: 15750000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.06",
    code: "A.6",
    description: "Pembuatan jalan kerja sementara (batu belah, 3 x 30 m)",
    volume: 90,
    unit: "m2",
    unitPrice: 462000,
    totalCost: 41580000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.07",
    code: "A.7",
    description: "Pembuangan sampah/limbah lahan ke TPA",
    volume: 30,
    unit: "m3",
    unitPrice: 175000,
    totalCost: 5250000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.08",
    code: "A.08",
    description: "Papan nama proyek (1,5 x 2 m, besi hollow + ACP)",
    volume: 1,
    unit: "unit",
    unitPrice: 7500000,
    totalCost: 7500000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.09",
    code: "A.9",
    description: "Alat pengaman & APD awal (helm, rompi, sepatu, rambu)",
    volume: 1,
    unit: "ls",
    unitPrice: 10000000,
    totalCost: 10000000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.10",
    code: "A.10",
    description: "Instalasi listrik sementara (kWh proyek + Panel + Kabel) Asumsi 160 kVA",
    volume: 1,
    unit: "ls",
    unitPrice: 65880000,
    totalCost: 65880000,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },
  {
    id: "rab-A.11",
    code: "A.11",
    description: "Instalasi air bersih sementara (toren 1000 L + pipa)",
    volume: 1,
    unit: "ls",
    unitPrice: 15537500,
    totalCost: 15537500,
    chapter: "Pekerjaan Persiapan",
    page: 1
  },

  // --- B. PEKERJAAN PONDASI SUBSTRUKTUR ---
  {
    id: "rab-B.01",
    code: "B.1",
    description: "Galian tanah basement & pondasi asumsi Excavator",
    volume: 600,
    unit: "m3",
    unitPrice: 141375,
    totalCost: 84825000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.02",
    code: "B.2",
    description: "Transport & pembuangan tanah ke TPA",
    volume: 72,
    unit: "m3",
    unitPrice: 95025,
    totalCost: 6841800,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.03",
    code: "B.3",
    description: "Dewatering & sump temporary (Instalasion)",
    volume: 1,
    unit: "ls",
    unitPrice: 65200000,
    totalCost: 65200000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.04",
    code: "B.4",
    description: "Lapisan cor LCB (lean concrete) 0,10 m (Rabat beton 100 mm K-125)",
    volume: 24,
    unit: "m3",
    unitPrice: 726750,
    totalCost: 17442000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.05",
    code: "B.5",
    description: "Bored Pile Kombinasi ø600 mm x 12 m (linear m) Include Alat berat",
    volume: 144,
    unit: "lm",
    unitPrice: 1064250,
    totalCost: 153252000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.06",
    code: "B.6",
    description: "Pile cap beton & tulangan (per unit m3 total)",
    volume: 30,
    unit: "m3",
    unitPrice: 1729000,
    totalCost: 51870000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.07",
    code: "B.7",
    description: "Footing terisolasi (typical) 6 unit (2x2x0,6m)",
    volume: 13,
    unit: "m3",
    unitPrice: 1872000,
    totalCost: 24336000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.08",
    code: "B.8",
    description: "Basement slab waterproofed (Integral) (including concrete & finishing) -area",
    volume: 240,
    unit: "m2",
    unitPrice: 1025000,
    totalCost: 246000000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.09",
    code: "B.9",
    description: "Beton struktur untuk slab basement (m3)",
    volume: 60,
    unit: "m3",
    unitPrice: 1586000,
    totalCost: 95160000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.10",
    code: "B.10",
    description: "Dinding penahan tanah / retaining wall (basement wall) -area",
    volume: 192,
    unit: "m2",
    unitPrice: 774000,
    totalCost: 148608000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.11",
    code: "B.11",
    description: "Waterproofing membrane * protection (basement roof/slab/wall)",
    volume: 240,
    unit: "m2",
    unitPrice: 232750,
    totalCost: 55860000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.12",
    code: "B.12",
    description: "Sump pump & drainage system (ls)",
    volume: 1,
    unit: "ls",
    unitPrice: 50400000,
    totalCost: 50400000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.13",
    code: "B.13",
    description: "Backfill & compaction (select fill)",
    volume: 606,
    unit: "m3",
    unitPrice: 56800,
    totalCost: 34420800,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.14",
    code: "B.14",
    description: "Formwork & perancah (area estimated)",
    volume: 216,
    unit: "m2",
    unitPrice: 117400,
    totalCost: 25358400,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.15",
    code: "B.15",
    description: "Tulangan Baja (rebar) untuk pondasi & slab (kg)",
    volume: 14160,
    unit: "kg",
    unitPrice: 14500,
    totalCost: 205320000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.16",
    code: "B.16",
    description: "Beton tambahan untuk pile cap, beam & blinding (m3)",
    volume: 14,
    unit: "m3",
    unitPrice: 1326000,
    totalCost: 18564000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },
  {
    id: "rab-B.17",
    code: "B.17",
    description: "Uji lab tanah & pengawasan geoteknik (ls) (sondir & PDA Test)",
    volume: 1,
    unit: "ls",
    unitPrice: 18000000,
    totalCost: 18000000,
    chapter: "Pekerjaan Pondasi Substruktur",
    page: 1
  },

  // ==================== PAGE 2 ====================
  // --- C. PEKERJAAN SUPERSTRUKTUR ---
  {
    id: "rab-C.01.a",
    code: "C.1.a",
    description: "Pekerjaan Pelat slab uk Tb 150 mm - beton mutu K-350",
    volume: 201.6,
    unit: "m3",
    unitPrice: 1259925,
    totalCost: 254000880,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.01.b",
    code: "C.1.b",
    description: "Pekerjaan Pelat slab - Mesh ø10 mm @200 mm both ways +Tulangan Utama ø12 @200 mm",
    volume: 24192,
    unit: "kg",
    unitPrice: 14500,
    totalCost: 350784000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.01.c",
    code: "C.1.c",
    description: "Pekerjaan Pelat slab - Bekisting",
    volume: 1680,
    unit: "m2",
    unitPrice: 150000,
    totalCost: 252000000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.02.a",
    code: "C.2.a",
    description: "Pekerjaan Balok BP Uk 400 x 600 mm & BS Uk 300 x 500 mm - Beton mutu K-350",
    volume: 138.24,
    unit: "m3",
    unitPrice: 1259925,
    totalCost: 174172032,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.02.b",
    code: "C.2.b",
    description: "Pekerjaan Balok - Besi BP 6ø20 mm - 48ø16 mm Sengkang ø12 mm @100-150mm, BS 4ø16 mm - 2ø12 mm sengkang 150 - 200 mm",
    volume: 20736,
    unit: "kg",
    unitPrice: 14500,
    totalCost: 300672000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.02.c",
    code: "C.2.c",
    description: "Pekerjaan Balok - Bekisting",
    volume: 1382,
    unit: "m2",
    unitPrice: 150000,
    totalCost: 207300000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.03.a",
    code: "C.3.a",
    description: "Pekerjaan Kolom Uk 500 x 500 mm & 400 x 400 mm - Beton mutu K-350",
    volume: 64.8,
    unit: "m3",
    unitPrice: 1259925,
    totalCost: 81643140,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.03.b",
    code: "C.3.b",
    description: "Pekerjaan Kolom - Besi K1 Uk 500 x 500 mm (8ø22 mm sengkang ...), K2 Uk 400 x 400 mm (12ø22 mm sengkang ...)",
    volume: 11664,
    unit: "kg",
    unitPrice: 14500,
    totalCost: 169128000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.03.c",
    code: "C.3.c",
    description: "Pekerjaan Kolom - Bekisting",
    volume: 518,
    unit: "m2",
    unitPrice: 150000,
    totalCost: 77700000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.04.a",
    code: "C.4.a",
    description: "Pekerjaan Dinding Inti - Beton mutu K-350",
    volume: 86.4,
    unit: "m3",
    unitPrice: 1259925,
    totalCost: 108857520,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.04.b",
    code: "C.4.b",
    description: "Pekerjaan Dinding Inti - Besi TUV Uk Ø16 mm @ 150 - 200 mm, TH Uk Ø12 mm @ 200 mm",
    volume: 12960,
    unit: "kg",
    unitPrice: 14500,
    totalCost: 187920000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.04.c",
    code: "C.4.c",
    description: "Pekerjaan Dinding Inti - Bekisting",
    volume: 864,
    unit: "m2",
    unitPrice: 150000,
    totalCost: 129600000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.05.a",
    code: "C.5.a",
    description: "Pekerjaan Tangga - Beton mutu K-300",
    volume: 30,
    unit: "m3",
    unitPrice: 1259925,
    totalCost: 37797750,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.05.b",
    code: "C.5.b",
    description: "Pekerjaan Tangga - Besi TU Ø16 mm D8 Ø10 mm @200 mm",
    volume: 3600,
    unit: "kg",
    unitPrice: 14500,
    totalCost: 52200000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.05.c",
    code: "C.5.c",
    description: "Pekerjaan Tangga - Bekisting",
    volume: 240,
    unit: "m2",
    unitPrice: 150000,
    totalCost: 36000000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.06.a",
    code: "C.6.a",
    description: "Pekerjaan parapet tb 120 mm T 1 m - Beton mutu K-350",
    volume: 7.68,
    unit: "m3",
    unitPrice: 1259925,
    totalCost: 9676224,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.06.b",
    code: "C.6.b",
    description: "Pekerjaan parapet - Besi TU Ø10 mm @200 mm TH Ø8 @200 mm",
    volume: 706,
    unit: "kg",
    unitPrice: 14500,
    totalCost: 10237000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.06.c",
    code: "C.6.c",
    description: "Pekerjaan parapet - Bekisting",
    volume: 128,
    unit: "m2",
    unitPrice: 150000,
    totalCost: 19200000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },
  {
    id: "rab-C.07",
    code: "C.7",
    description: "Waterproofing atap",
    volume: 240,
    unit: "m2",
    unitPrice: 196525,
    totalCost: 47166000,
    chapter: "Pekerjaan Superstruktur",
    page: 2
  },

  // --- D. PEKERJAAN ARSITEKTUR ---
  {
    id: "rab-D.01",
    code: "D.1",
    description: "Dinding Hebel Tbl 100 mm Plester + Aci (eksterior)",
    volume: 1382,
    unit: "m2",
    unitPrice: 225000,
    totalCost: 310950000,
    chapter: "Pekerjaan Arsitektur",
    page: 2
  },
  {
    id: "rab-D.02",
    code: "D.2",
    description: "Cat dinding interior (2 coats) Ex Jotun",
    volume: 3000,
    unit: "m2",
    unitPrice: 50000,
    totalCost: 150000000,
    chapter: "Pekerjaan Arsitektur",
    page: 2
  },
  {
    id: "rab-D.03",
    code: "D.3",
    description: "Cat dinding eksterior (2 coats) Ex Jotun",
    volume: 1382,
    unit: "m2",
    unitPrice: 60000,
    totalCost: 82920000,
    chapter: "Pekerjaan Arsitektur",
    page: 2
  },
  {
    id: "rab-D.04",
    code: "D.4",
    description: "Lantai Granit (Lobby 800x800 hitam marmer, Lantai 2-6 putih marmer 600x600) Ex Sandimas atau setara",
    volume: 1680,
    unit: "m2",
    unitPrice: 225000,
    totalCost: 378000000,
    chapter: "Pekerjaan Arsitektur",
    page: 2
  },
  {
    id: "rab-D.05",
    code: "D.5",
    description: "Plafon Gypsum + rangka hollow tbl rangka 0,35 mm & gypsum 9 mm",
    volume: 1440,
    unit: "m2",
    unitPrice: 180000,
    totalCost: 259200000,
    chapter: "Pekerjaan Arsitektur",
    page: 2
  },
  {
    id: "rab-D.06",
    code: "D.6",
    description: "Pintu kamar + kusen (solid core)",
    volume: 90,
    unit: "unit",
    unitPrice: 3500000,
    totalCost: 315000000,
    chapter: "Pekerjaan Arsitektur",
    page: 2
  },
  {
    id: "rab-D.07",
    code: "D.7",
    description: "Jendela alumunium + kaca (per unit) hitam",
    volume: 90,
    unit: "unit",
    unitPrice: 2500000,
    totalCost: 225000000,
    chapter: "Pekerjaan Arsitektur",
    page: 2
  },

  // ==================== PAGE 3 ====================
  // --- E. PEKERJAAN FINISHING KAMAR MANDI ---
  {
    id: "rab-E.01",
    code: "E.1",
    description: "Keramik dinding kamar mandi Uk, 200 x 400 mm (full tinggi 2400 mm) Ex Mulia",
    volume: 864,
    unit: "m2",
    unitPrice: 150000,
    totalCost: 129600000,
    chapter: "Pekerjaan Finishing Kamar Mandi",
    page: 3
  },
  {
    id: "rab-E.02",
    code: "E.2",
    description: "Keramik lantai kamar mandi Ex Mulia Signature",
    volume: 360,
    unit: "m2",
    unitPrice: 182500,
    totalCost: 65700000,
    chapter: "Pekerjaan Finishing Kamar Mandi",
    page: 3
  },
  {
    id: "rab-E.03",
    code: "E.3",
    description: "Plafon kamar mandi (PVC/Gypsum tahan lembab)",
    volume: 360,
    unit: "m2",
    unitPrice: 155657.5,
    totalCost: 56036700,
    chapter: "Pekerjaan Finishing Kamar Mandi",
    page: 3
  },
  {
    id: "rab-E.04",
    code: "E.4",
    description: "Sanitari per kamar (closet duduk, wastafel, shower, floor drain) Ex Toto",
    volume: 72,
    unit: "set",
    unitPrice: 4452500,
    totalCost: 320580000,
    chapter: "Pekerjaan Finishing Kamar Mandi",
    page: 3
  },
  {
    id: "rab-E.05",
    code: "E.5",
    description: "Pintu kamar mandi (PVC/WPC tahan air) Ex Platinum",
    volume: 72,
    unit: "unit",
    unitPrice: 320000,
    totalCost: 23040000,
    chapter: "Pekerjaan Finishing Kamar Mandi",
    page: 3
  },
  {
    id: "rab-E.06",
    code: "E.6",
    description: "Aksesoris kamar mandi (shower set, cermin, rak, handuk bracket) Ex Toto",
    volume: 72,
    unit: "set",
    unitPrice: 945000,
    totalCost: 68040000,
    chapter: "Pekerjaan Finishing Kamar Mandi",
    page: 3
  },
  {
    id: "rab-E.07",
    code: "E.7",
    description: "Instalasi plumbing air bersih & kotor (pipa, fitting, floor trap)",
    volume: 72,
    unit: "set",
    unitPrice: 2010000,
    totalCost: 144720000,
    chapter: "Pekerjaan Finishing Kamar Mandi",
    page: 3
  },

  // --- F. PEKERJAAN MEP - LISTRIK ---
  {
    id: "rab-F.01",
    code: "F.1",
    description: "Panel Utama (MDP) 160 kVA (Incl MCCB, Push bar, Mounting)",
    volume: 1,
    unit: "unit",
    unitPrice: 41540000,
    totalCost: 41540000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.02",
    code: "F.2",
    description: "Sub-panel tiap lantai (Incl MCB, enclosure)",
    volume: 7,
    unit: "unit",
    unitPrice: 5969535,
    totalCost: 41786745,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.03",
    code: "F.3",
    description: "Panel distribusi kamar (MCB + meter per room) Ex 1300 watt per unit",
    volume: 72,
    unit: "unit",
    unitPrice: 2722500,
    totalCost: 196020000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.04",
    code: "F.4",
    description: "Trafo / Connection to utility (provision)",
    volume: 1,
    unit: "ls",
    unitPrice: 86400000,
    totalCost: 86400000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.05",
    code: "F.5",
    description: "Genset 200 kVA + ATS (supply & instal) perkins",
    volume: 1,
    unit: "unit",
    unitPrice: 167040000,
    totalCost: 167040000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.06",
    code: "F.6",
    description: "Kabel power utama (various sizes) - Total estimate",
    volume: 12000,
    unit: "m",
    unitPrice: 26050,
    totalCost: 312600000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.07",
    code: "F.7",
    description: "Conduit & Trunking (m)",
    volume: 8000,
    unit: "m",
    unitPrice: 14037.5,
    totalCost: 112300000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.08",
    code: "F.8",
    description: "Instalasi stop kontak & saklar per titik (incl box & wiring)",
    volume: 288,
    unit: "titik",
    unitPrice: 250000,
    totalCost: 72000000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.09",
    code: "F.9",
    description: "Instalasi Pencahayaan (LED downlights, fixture) per titik philips lampu panel Led",
    volume: 720,
    unit: "titik",
    unitPrice: 166320,
    totalCost: 119750400,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.10",
    code: "F.10",
    description: "Lampu koridor & lobby (special fixture)",
    volume: 120,
    unit: "titik",
    unitPrice: 129360,
    totalCost: 15523200,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.11",
    code: "F.11",
    description: "Lampu eksterior & taman (incl wiring)",
    volume: 30,
    unit: "titik",
    unitPrice: 672000,
    totalCost: 20160000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.12",
    code: "F.12",
    description: "UPS (for critical loads)",
    volume: 1,
    unit: "ls",
    unitPrice: 60000000,
    totalCost: 60000000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.13",
    code: "F.13",
    description: "Grounding system & lighting protection",
    volume: 1,
    unit: "ls",
    unitPrice: 25000000,
    totalCost: 25000000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.14",
    code: "F.14",
    description: "penangkal petir (lighting arrestor) Radius 50 meter",
    volume: 1,
    unit: "unit",
    unitPrice: 22500000,
    totalCost: 22500000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.15",
    code: "F.15",
    description: "Installation testing & commissioning (electrical)",
    volume: 1,
    unit: "ls",
    unitPrice: 30000000,
    totalCost: 30000000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.16",
    code: "F.16",
    description: "Cable tray & ladder (m)",
    volume: 1500,
    unit: "m",
    unitPrice: 91500,
    totalCost: 137250000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.17",
    code: "F.17",
    description: "Earthing pit & bonding (per pit)",
    volume: 4,
    unit: "unit",
    unitPrice: 2500000,
    totalCost: 10000000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.18",
    code: "F.18",
    description: "Metering & submeters per Floor (incl CTs)",
    volume: 7,
    unit: "unit",
    unitPrice: 3000000,
    totalCost: 21000000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.19",
    code: "F.19",
    description: "Distribution boards for services (lift, pumps)",
    volume: 5,
    unit: "unit",
    unitPrice: 5000000,
    totalCost: 25000000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.20",
    code: "F.20",
    description: "Spare parts & consumables (allowance)",
    volume: 1,
    unit: "ls",
    unitPrice: 12500000,
    totalCost: 12500000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },
  {
    id: "rab-F.21",
    code: "F.21",
    description: "Lift power connection & interface (per lift)",
    volume: 2,
    unit: "unit",
    unitPrice: 7500000,
    totalCost: 15000000,
    chapter: "Pekerjaan MEP - Listrik",
    page: 3
  },

  // ==================== PAGE 4 ====================
  // --- G. PEKERJAAN MEP - PLUMBING ---
  {
    id: "rab-G.01",
    code: "G.1",
    description: "Sanitari set (WC duduk + lavabo + shower) - per kamar Ex Toto",
    volume: 72,
    unit: "set",
    unitPrice: 4452500,
    totalCost: 320580000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.02",
    code: "G.2",
    description: "Floor trap (per kamar)",
    volume: 72,
    unit: "unit",
    unitPrice: 125000,
    totalCost: 9000000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.03",
    code: "G.3",
    description: "Water Heater portable per unit Ex Ariston Include instalation",
    volume: 12,
    unit: "unit",
    unitPrice: 2807500,
    totalCost: 33690000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.04",
    code: "G.4",
    description: "Roof water tank (incl mounting & piping)",
    volume: 1,
    unit: "unit",
    unitPrice: 79800000,
    totalCost: 79800000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.05",
    code: "G.5",
    description: "Ground water tank (tangki cadangan)",
    volume: 1,
    unit: "unit",
    unitPrice: 79800000,
    totalCost: 79800000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.06",
    code: "G.6",
    description: "Booster pump set (supply + panel)",
    volume: 1,
    unit: "ls",
    unitPrice: 108900000,
    totalCost: 108900000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.07",
    code: "G.7",
    description: "Sump pump system (basement)",
    volume: 1,
    unit: "ls",
    unitPrice: 30000000,
    totalCost: 30000000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.08",
    code: "G.8",
    description: "Sewage treatment plant (Provision & instal)",
    volume: 1,
    unit: "ls",
    unitPrice: 125000000,
    totalCost: 125000000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.09",
    code: "G.9",
    description: "Septic tank (alternatif / allowance)",
    volume: 1,
    unit: "ls",
    unitPrice: 67200000,
    totalCost: 67200000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.10",
    code: "G.10",
    description: "Grease Trap (kitchen)",
    volume: 1,
    unit: "unit",
    unitPrice: 20000000,
    totalCost: 20000000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.11",
    code: "G.11",
    description: "Cold water supply piping (various sizes, total estimate)",
    volume: 3360,
    unit: "m",
    unitPrice: 40000,
    totalCost: 134400000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.12",
    code: "G.12",
    description: "Hot water piping (distributin, per room connection)",
    volume: 432,
    unit: "m",
    unitPrice: 60000,
    totalCost: 25920000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.13",
    code: "G.13",
    description: "Drainage & waste piping (roof & sanitari)",
    volume: 2520,
    unit: "m",
    unitPrice: 22500,
    totalCost: 56700000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.14",
    code: "G.14",
    description: "Stormwater downpipes & roof drains",
    volume: 288,
    unit: "m",
    unitPrice: 50000,
    totalCost: 14400000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.15",
    code: "G.15",
    description: "Valves & stop valves (allowance)",
    volume: 31,
    unit: "set",
    unitPrice: 250000,
    totalCost: 7750000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.16",
    code: "G.16",
    description: "Insulation for hot water piping",
    volume: 432,
    unit: "m",
    unitPrice: 25000,
    totalCost: 10800000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.17",
    code: "G.17",
    description: "Manholes for drainage (unit)",
    volume: 5,
    unit: "unit",
    unitPrice: 2500000,
    totalCost: 12500000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.18",
    code: "G.18",
    description: "Testing & commissioning (plumbing)",
    volume: 1,
    unit: "ls",
    unitPrice: 12500000,
    totalCost: 12500000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },
  {
    id: "rab-G.19",
    code: "G.19",
    description: "Installation labour & miscellanesous (allowance)",
    volume: 1,
    unit: "ls",
    unitPrice: 40000000,
    totalCost: 40000000,
    chapter: "Pekerjaan MEP - Plumbing",
    page: 4
  },

  // --- H. PEKERJAAN MEP - FIRE FIGHTING ---
  {
    id: "rab-H.01",
    code: "H.1",
    description: "Fire pump set (duty, jockey, diesel + control panel)",
    volume: 1,
    unit: "set",
    unitPrice: 94500000,
    totalCost: 94500000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.02",
    code: "H.2",
    description: "Fire water tank (ground tank 100 m3 + structure)",
    volume: 1,
    unit: "unit",
    unitPrice: 75000000,
    totalCost: 75000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.03",
    code: "H.3",
    description: "Pipa distribusi hydrant (standpipe + riser, steel)",
    volume: 840,
    unit: "m",
    unitPrice: 316500,
    totalCost: 265860000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.04",
    code: "H.4",
    description: "Pipa distribusi sprinkler (branch line)",
    volume: 1680,
    unit: "m",
    unitPrice: 263750,
    totalCost: 443100000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.05",
    code: "H.5",
    description: "Hydrant pillar (outdoor, double outlet)",
    volume: 2,
    unit: "unit",
    unitPrice: 91500000,
    totalCost: 183000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.06",
    code: "H.6",
    description: "Hydrant box indoor (per lantai 2 boks x 7 lantai)",
    volume: 14,
    unit: "unit",
    unitPrice: 7320000,
    totalCost: 102480000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.07",
    code: "H.07",
    description: "Hose reel (tiap lantai 1 reel x 6 lantai)",
    volume: 6,
    unit: "unit",
    unitPrice: 5000000,
    totalCost: 30000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.08",
    code: "H.8",
    description: "Sprinkler head (1 head / 12 m2)",
    volume: 140,
    unit: "unit",
    unitPrice: 250000,
    totalCost: 35000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.09",
    code: "H.9",
    description: "Valve, flow switch, pressure gauge (allowance)",
    volume: 12,
    unit: "set",
    unitPrice: 2500000,
    totalCost: 30000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.10",
    code: "H.10",
    description: "Fire alarm control panel (FACP)",
    volume: 1,
    unit: "unit",
    unitPrice: 6000000,
    totalCost: 6000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.11",
    code: "H.11",
    description: "Smoke & heat detector (1/25 m2)",
    volume: 67,
    unit: "unit",
    unitPrice: 750000,
    totalCost: 50250000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.12",
    code: "H.12",
    description: "Manual call point + bell/strobe (2 titik/lantai x 7 lantai)",
    volume: 14,
    unit: "unit",
    unitPrice: 1250000,
    totalCost: 17500000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.13",
    code: "H.13",
    description: "Kabel instalasi alarm & control",
    volume: 1200,
    unit: "m",
    unitPrice: 22500,
    totalCost: 27000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.14",
    code: "H.14",
    description: "Testing & commissioning system",
    volume: 1,
    unit: "ls",
    unitPrice: 25000000,
    totalCost: 25000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.15",
    code: "H.15",
    description: "Instalasi & pekerjaan mekanikal (allowance)",
    volume: 1,
    unit: "ls",
    unitPrice: 60000000,
    totalCost: 60000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },
  {
    id: "rab-H.16",
    code: "H.16",
    description: "Instalasi & pekerjaan Pemasangan Lift (7 Lantai)",
    volume: 2,
    unit: "Unit",
    unitPrice: 425000000,
    totalCost: 850000000,
    chapter: "Pekerjaan MEP - Fire Fighting",
    page: 4
  },

  // --- I. PEKERJAAN MEP - HVAC ---
  {
    id: "rab-I.01",
    code: "I.1",
    description: "AC split / VRF system (per room allowance) Ex Gree",
    volume: 71,
    unit: "unit",
    unitPrice: 3075000,
    totalCost: 218325000,
    chapter: "Pekerjaan MEP - HVAC",
    page: 4
  },
  {
    id: "rab-I.02",
    code: "I.2",
    description: "Ducting & ventilation shaft (m2)",
    volume: 504,
    unit: "m2",
    unitPrice: 94446,
    totalCost: 47600784,
    chapter: "Pekerjaan MEP - HVAC",
    page: 4
  },
  {
    id: "rab-I.03",
    code: "I.3",
    description: "Exhaust fans toilet & kitchen (unit)",
    volume: 71,
    unit: "unit",
    unitPrice: 1750000,
    totalCost: 124250000,
    chapter: "Pekerjaan MEP - HVAC",
    page: 4
  },
  {
    id: "rab-I.04",
    code: "I.4",
    description: "Insulation & acoustic works (ls)",
    volume: 1,
    unit: "ls",
    unitPrice: 60000000,
    totalCost: 60000000,
    chapter: "Pekerjaan MEP - HVAC",
    page: 4
  },
  {
    id: "rab-I.05",
    code: "I.5",
    description: "Testing & balancing HVAC (ls)",
    volume: 1,
    unit: "ls",
    unitPrice: 25000000,
    totalCost: 25000000,
    chapter: "Pekerjaan MEP - HVAC",
    page: 4
  },

  // --- J. PEKERJAAN KOLAM RENANG ---
  {
    id: "rab-J.01",
    code: "J.1",
    description: "Pekerjaan Kolam Renang 3 x 7 M2",
    volume: 52.5,
    unit: "M2",
    unitPrice: 2250000,
    totalCost: 118125000,
    chapter: "Pekerjaan Kolam Renang",
    page: 4
  },
  {
    id: "rab-J.02",
    code: "J.2",
    description: "Pengerjaan Toilet Kolam renang 1,5 x 1,5 & accesories",
    volume: 3,
    unit: "m2",
    unitPrice: 750000,
    totalCost: 2250000,
    chapter: "Pekerjaan Kolam Renang",
    page: 4
  },

  // ==================== PAGE 5 ====================
  // --- K. PEKERJAAN CAFE ---
  {
    id: "rab-K.01",
    code: "K.1",
    description: "Pekerjaan Cafe 2,5 x 3",
    volume: 7.5,
    unit: "m2",
    unitPrice: 750000,
    totalCost: 5625000,
    chapter: "Pekerjaan Cafe",
    page: 5
  },

  // --- L. PEKERJAAN LUAR ---
  {
    id: "rab-L.01",
    code: "L.1",
    description: "Paving block / asphalt for ramp & parking (m2)",
    volume: 144,
    unit: "m2",
    unitPrice: 111600,
    totalCost: 16070400,
    chapter: "Pekerjaan Luar",
    page: 5
  },
  {
    id: "rab-L.02",
    code: "L.2",
    description: "Drainage luar & sumps (m)",
    volume: 48,
    unit: "m",
    unitPrice: 109200,
    totalCost: 5241600,
    chapter: "Pekerjaan Luar",
    page: 5
  },
  {
    id: "rab-L.03",
    code: "L.3",
    description: "Pagar & gerbang (m) Kolom praktis dan Hebel 10 cm",
    volume: 40,
    unit: "m",
    unitPrice: 350000,
    totalCost: 14000000,
    chapter: "Pekerjaan Luar",
    page: 5
  },
  {
    id: "rab-L.04",
    code: "L.04",
    description: "Landscape softscape & trees (ls) & jembatan Uk 3000 x 5000 mm",
    volume: 1,
    unit: "ls",
    unitPrice: 32000000,
    totalCost: 32000000,
    chapter: "Pekerjaan Luar",
    page: 5
  },
  {
    id: "rab-L.05",
    code: "L.5",
    description: "Lampu luar & akses (ls)",
    volume: 1,
    unit: "ls",
    unitPrice: 30000000,
    totalCost: 30000000,
    chapter: "Pekerjaan Luar",
    page: 5
  },

  // --- M. TESTING & COMMISSIONING ---
  {
    id: "rab-M.01",
    code: "M.1",
    description: "Dokumentasi & sertifikat (ls)",
    volume: 1,
    unit: "ls",
    unitPrice: 10000000,
    totalCost: 10000000,
    chapter: "Testing & Commissioning",
    page: 5
  },

  // --- N. SEWA MOBIL CRANE ---
  {
    id: "rab-N.01",
    code: "N.1",
    description: "Mobil Crane Kap.25 Ton",
    volume: 7,
    unit: "bln",
    unitPrice: 35000000,
    totalCost: 245000000,
    chapter: "Sewa Mobil Crane",
    page: 5
  },
  {
    id: "rab-N.02",
    code: "N.2",
    description: "Operasional",
    volume: 7,
    unit: "bln",
    unitPrice: 10000000,
    totalCost: 70000000,
    chapter: "Sewa Mobil Crane",
    page: 5
  },
  {
    id: "rab-N.03",
    code: "N.3",
    description: "Solar",
    volume: 7,
    unit: "bln",
    unitPrice: 60000000,
    totalCost: 420000000,
    chapter: "Sewa Mobil Crane",
    page: 5
  }
];
