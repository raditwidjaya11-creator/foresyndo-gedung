import { DrawingFile } from '../types';
import frontImage from '../assets/images/majalengka_kost_front_1781714630858.jpg';
import poolImage from '../assets/images/majalengka_kost_pool_1781714653066.jpg';
import blueprintImage from '../assets/images/majalengka_kost_blueprint_1781714675636.jpg';

export const INITIAL_DRAWINGS: DrawingFile[] = [
  {
    id: 'draw1',
    fileName: 'DED_Rumah_Kost_Eksklusif_Jatitujuh_REV3.pdf',
    fileUrl: '#',
    totalPage: 4,
    uploadedDate: '2026-06-12',
    uploadedBy: 'Budi Santoso (Project Manager)',
    changeHistory: [
      { date: '2026-06-12', user: 'Budi Santoso', action: 'Mengunggah versi revisi ke-3 (REV3)' },
      { date: '2026-06-14', user: 'Radit Widjaya', action: 'Memberikan persetujuan halaman arsitektural L1' }
    ],
    pages: [
      {
        pageNumber: 1,
        pageCode: 'A-01',
        title: '3D Render Perspeksif Fasad Depan Utama',
        category: 'Visualisasi 3D',
        image: frontImage,
        scale: 'NTS (Non-Technical Scale)',
        description: 'Visualisasi eksterior 3D gedung utama dari hadapan jalan akses barat. Memperlihatkan estetika fasad pilar ganda klasik modern, lobi penerima berlantai kaca temper, parkir modular, serta arsitektur lanskap depan.',
        specifications: [
          'Tinggi Pilar Utama: 6,40 Meter (Pilar Beton Bertulang Bulat)',
          'Finishing Dinding: Cat Weathershield Jotun Sandstone & GRC Board Ornamen Kayu',
          'Jenis Kaca Utama Lobi: Tempered Glass double-glazed 12mm',
          'Area Parkir: Paving block K-300 pola Chevron dengan penyerapan air bawah tanah'
        ],
        aiAnalysis: {
          type: 'Rendisi 3D / Gambar Fasad Eksterior',
          summary: 'Gambar memperlihatkan visualisasi komersial 3D bangunan kost eksklusif 6 lantai. Fasad menggunakan pendekatan modern dengan detail ornamen arsitektur klasik pada pilar, dipadukan dengan aksen kayu alami (Wood panel composite). Posisi pintu masuk utama sejajar dengan lobi komunal.',
          dims: 'Estimasi tinggi bangunan: 22,5 Meter, Bentang fasad depan: 12,5 Meter.',
          notes: 'Pastikan warna cat ornamen kayu composite (WPC) di lapangan sesuai dengan sampel persetujuan owner untuk menghindari perbedaan saturasi warna.'
        },
        comments: [
          {
            id: 'com1_1',
            user: 'Direksi Owner PT. FGI',
            role: 'Owner',
            text: 'Warna pilar utama apakah bisa dibuat sedikit lebih krem hangat agar tidak terlalu pucat saat terpapar sinar matahari sore Jatitujuh?',
            date: '2026-06-13',
            pin: { x: 38.5, y: 44.2 }
          },
          {
            id: 'com1_2',
            user: 'H. Sulaiman',
            role: 'Investor',
            text: 'Terlihat sangat premium! Pastikan lampu sorot eksterior (floodlight) juga diarahkan pada sela pilar di malam hari untuk memperkuat bayangan estetis pilar tinggi ini.',
            date: '2026-06-15',
            pin: { x: 42, y: 72 }
          }
        ]
      },
      {
        pageNumber: 2,
        pageCode: 'A-02',
        title: 'Rencana Tata Letak Ground Floor L-1 & Fasilitas Poolside',
        category: 'Arsitektur',
        image: blueprintImage,
        scale: '1:100',
        description: 'Denah arsitektural detail lantai 1 (dasar) proyek Foresyndo 2 Kertajati. Menyajikan konfigurasi batas ruang lobi resepsionis, tangga dual sirkulasi, koridor utama, unit kamar eksklusif dasar K1 s/d K6, kolam renang komunal, serta area mini-cafe pendukung.',
        specifications: [
          'Tinggi Plafon (Floor-to-Ceiling): 3,60 Meter bersih',
          'Ketebalan Dinding Sekat Kamar: Bata Ringan Citicon 10cm plester acian + soundproofing foam',
          'Spesifikasi Kolam Renang: Panjang 12 Meter, Lebar 4 Meter, Kedalaman melandai 1,1 - 1,5 Meter',
          'Finishing Lantai Lobi: Granit Tile 80x80 polished Indogress Bianco Royal'
        ],
        aiAnalysis: {
          type: 'Denah Arsitektur Lantai Skenario 1',
          summary: 'Gambar denah menunjukkan zonasi lobi publik di sisi depan, 6 unit kamar tidur dengan kamar mandi dalam di zonasi tengah, dan area rekreasi (kolam renang & cafe) di area halaman belakang.',
          dims: 'Lebar Lobi: 4,5 Meter. Koridor Kamar: Lebar Bersih 1,8 Meter. Kamar Standar: 3,0 x 4,0 Meter (Kamar Mandi Dalam 1,5 x 1,5).',
          notes: 'Konfigurasi bukaan pintu kamar standar membuka ke dalam. Pastikan tidak menabrak tempat tidur atau lemari pakaian saat implementasi tata letak mebeler.'
        },
        comments: [
          {
            id: 'com2_1',
            user: 'Budi Santoso',
            role: 'Project Manager',
            text: 'Pondasi bor pile dekat dinding batas kolam renang perlu perhatian ekstra saat galian tanah agar tidak terjadi longsor lokal.',
            date: '2026-06-12',
            pin: { x: 74, y: 79.5 }
          },
          {
            id: 'com2_2',
            user: 'ArchiPlan Specialist',
            role: 'Konsultan',
            text: 'Revisi instalasi pipa buang kolam renang harus terpisah dari selokan air hujan utama. Perlu ditambahkan bak kontrol mini di sisi sudut cafe.',
            date: '2026-06-14',
            pin: { x: 82.5, y: 55 }
          }
        ]
      },
      {
        pageNumber: 3,
        pageCode: 'A-03',
        title: 'Denah Layout Unit Tipikal Kamar Sewa L-2 s/d L-6',
        category: 'Arsitektur',
        image: blueprintImage,
        scale: '1:100',
        description: 'Denah tata kamar kost sewa yang diulang secara identik dari Lantai 2 hingga lantai 6. Membagi koridor lurus arah barat-timur (double-loaded corridor) untuk menampung total 12 kamar eksklusif per lantai, lengkap dengan balkon pribadi luar ruangan.',
        specifications: [
          'Lebar Bersih Koridor Tengah: 2,10 Meter',
          'Dimensi Kamar Tipikal: 3,25m x 4,50m (bersih termasuk balkon luar)',
          'Instalasi Kelistrikan: MCB internal 1.300 Watt per kamar terinstalasi mandiri',
          'Jenis Kusen Jendela Balkon: Aluminium Alexindo powder coating hitam 4 inch'
        ],
        aiAnalysis: {
          type: 'Denah Unit Arsitektur Tipikal',
          summary: 'Tata letak simetris dengan koridor linier di bagian tengah. Memudahkan manajemen sirkulasi udara dan cahaya alami di ujung koridor bebas (cross-ventilation). Setiap unit terisi lemari built-in, pantry mini, kasur queen-size dan kamar mandi basah.',
          dims: 'Kamar Mandi: 1,5 x 1,5 Meter. Area Balkon Pribadi: Kedalaman 0,9 Meter x Lebar 3,0 Meter.',
          notes: 'Periksa jalur pipa air bersih tegak lurus (riser pipe) di belakang kamar mandi agar posisinya pas selaras antar lantai demi kemudahan pemeliharaan kelak.'
        },
        comments: []
      },
      {
        pageNumber: 4,
        pageCode: 'S-01',
        title: 'Denah Detil Pembesian Kolom & Balok Struktur L-2',
        category: 'Struktur & Sipil',
        image: blueprintImage,
        scale: '1:50 / 1:20',
        description: 'Gambar teknis detail struktur beton bertulang yang menampilkan layout penempatan tulangan besi utama (rebar), begel (stirrups), dimensi kolom induk K-40x40, balok anak B1-30x50, dan pelat lantai dua ketebalan 12 cm.',
        specifications: [
          'Mutu Beton Minimum: Ready-Mix K-350 slump 12±2cm',
          'Besi Tulangan Utama: Ulir D16 deform (sertifikat SNI asli Krakatau Steel)',
          'Begel / Sengkang: Polos P8-100 (area tumpuan), P8-150 (area lapangan)',
          'Selimut Beton Kolom: 40mm bersertifikasi anti korosif kimia semen'
        ],
        aiAnalysis: {
          type: 'Gambar Teknik Struktur / Detail Penulangan Beton',
          summary: 'Gambar detail teknik menyajikan pola pembesian penampang retak beton untuk menahan momen lentur negatif dan gaya geser torsi. Balok beton B1 memiliki 4 tulangan tarik atas dan 2 tulangan tekan bawah.',
          dims: 'Dimensi Kolom: 400x400 mm. Dimensi Balok: 300x500 mm. Tebal Plat: 120 mm.',
          notes: 'Pastikan overlap panjang tekukan tulangan sengkang minimum adalah 10 kali diameter besi polos (80mm) dengan sudut kait 135 derajat sesuai standar SNI beton terbaru.'
        },
        comments: [
          {
            id: 'com4_1',
            user: 'Budi Santoso',
            role: 'Project Manager',
            text: 'Mohon tanyakan pada Konsultan Struktur apakah jarak sengkang di zona tumpuan kolom dekat tangga bisa dirapatkan menjadi 75mm untuk kestabilan?',
            date: '2026-06-16',
            pin: { x: 55, y: 35 }
          }
        ]
      }
    ]
  },
  {
    id: 'draw2',
    fileName: 'DED_Struktur_Fondasi_BorePile_Detail_R1.pdf',
    fileUrl: '#',
    totalPage: 1,
    uploadedDate: '2026-05-20',
    uploadedBy: 'Radit Widjaya (Super Admin)',
    changeHistory: [
      { date: '2026-05-20', user: 'Radit Widjaya', action: 'Mengunggah DED Fondasi Pertama' }
    ],
    pages: [
      {
        pageNumber: 1,
        pageCode: 'S-PF-01',
        title: 'Detail Galian & Kedalaman Titik Fondasi Bore Pile',
        category: 'Struktur & Sipil',
        image: blueprintImage,
        scale: '1:75',
        description: 'Spesifikasi penanaman bore pile dengan kedalaman pondasi menyentuh lapisan tanah keras asli di wilayah Jatitujuh. Menentukan titik koordinat bor, pembagian pile cap, dan penguatan sengkang spiral baja pondasi.',
        specifications: [
          'Kedalaman Pengeboran: 14,00 Meter dari level tanah dasar',
          'Diameter Bore Pile: Ø 400mm',
          'Pipa Tremie Beton: Wajib digunakan saat pengecoran bawah air tanah',
          'Mutu Beton Cair Bore Pile: K-300 Sikament additive sirkulasi cepat'
        ],
        aiAnalysis: {
          type: 'Denah Pondasi / Struktur Bawah',
          summary: 'Gaya beban mati gedung disalurkan vertikal ke tiang bor pile berdiameter 40 cm. Pile cap mengikat tiap dua tiang pondasi berdekatan untuk pemerataan reaksi tumpuan tanah keras.',
          dims: 'Kedalaman Bor: 14 Meter, Tebal Pile Cap Utama: 800 mm.',
          notes: 'Wajib melakukan pengujian integrity test (PIT Test) pada minimal 10% sampel tiang bor pile terpasang sebelum memulai erection kolom lantai dasar.'
        },
        comments: []
      }
    ]
  },
  {
    id: 'draw3',
    fileName: 'DED_Visualisasi_Arsitektur_Pool_Area_Cafe.pdf',
    fileUrl: '#',
    totalPage: 1,
    uploadedDate: '2026-06-15',
    uploadedBy: 'ArchiPlan Specialist (Konsultan)',
    changeHistory: [
      { date: '2026-06-15', user: 'ArchiPlan Specialist', action: 'Mengunggah Desain Kolam Renang' }
    ],
    pages: [
      {
        pageNumber: 1,
        pageCode: 'V-POOL-01',
        title: 'visualisasi Kolam Renang Resort & Cafe Outdoor Atas',
        category: 'Visualisasi 3D',
        image: poolImage,
        scale: 'NTS',
        description: 'Perspektif artistik 3D memperlihatkan kolam renang bernuansa mini-resort tropis ramah penyewa kost di belakang gedung utama. Dilengkapi teras bersantai kayu ulin gantung, jajaran pohon kamboja estetik, kursi malas gantung, serta kedai cafe bar berornamen tanaman hias.',
        specifications: [
          'Pelapis Dalam Kolam: Batu Mozaik Biru Tosca ukuran 5x5cm premium',
          'Teras Pooldeck: Kayu Bengkirai/Ulin anti-lapuk coating anti-slip outdoor',
          'Lampu Kolam: LED Underwater IP68 (12V Tegangan Rendah Aman Air)',
          'Sistem Pengolahan Air: Sand filter & cartridge filter dengan ruang rumah pompa bawah tanah'
        ],
        aiAnalysis: {
          type: 'Rendisi Visual Area Kolam & Cafe Komunal',
          summary: 'Area relaksasi di halaman belakang yang memadukan ruang berenang dengan kedai makanan berlantai mezzanine. Terdapat taman sela peneduh di tepi dek kayu.',
          dims: 'Dimensi Kolam Renang: 12x4 Meter, Lebar Deck Bersantai: 3 Meter.',
          notes: 'Instalasi grounding kelistrikan lampu bawah air kolam renang harus lolos pengujian isolasi ketat untuk menghindari rembesan arus berbayangan.'
        },
        comments: [
          {
            id: 'com3_1',
            user: 'Direksi Owner PT. FGI',
            role: 'Owner',
            text: 'Ini sangat memuaskan, sangat menjual untuk target kost premium! Mohon pastikan saringan limpahan air (gutter overflow) tidak mengeluarkan suara gemercik yang bising di malam hari.',
            date: '2026-06-17',
            pin: { x: 50, y: 65 }
          }
        ]
      }
    ]
  }
];
