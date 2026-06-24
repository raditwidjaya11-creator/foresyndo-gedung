import { DrawingFile } from '../types';
import frontImage from '../assets/images/majalengka_kost_front_1781714630858.jpg';
import poolImage from '../assets/images/majalengka_kost_pool_1781714653066.jpg';
import blueprintImage from '../assets/images/majalengka_kost_blueprint_1781714675636.jpg';

export const INITIAL_DRAWINGS: DrawingFile[] = [
  {
    id: 'draw_ded_maj',
    fileName: 'DED_Rumah_Kost_Jatitujuh_Majalengka_Official.pdf',
    fileUrl: '#',
    totalPage: 17,
    uploadedDate: '2026-06-22',
    uploadedBy: 'PT Foresyndo Global Indonesia (Owner)',
    changeHistory: [
      { date: '2026-06-22', user: 'Radit Widjaya', action: 'Mengunggah Berkas DED Lengkap (17 Halaman)' },
      { date: '2026-06-22', user: 'Budi Santoso', action: 'sinkronisasi penomoran lembar konstruksi dan koordinat' }
    ],
    pages: [
      {
        pageNumber: 1,
        pageCode: 'A-01',
        title: 'Render Lanskap Perspektif Fasad Depan Utama',
        category: 'Visualisasi 3D',
        image: frontImage,
        scale: 'NTS (Non-Technical Scale)',
        description: 'Visualisasi eksterior 3D gedung utama dari jalan akses lobi depan. Menampilkan fasad pilar ganda klasik modern, gerbang pembatas pagar, dan lobi luks berlantai kaca temper.',
        specifications: [
          'Finishing Dinding: Cat Weathershield Jotun Sandstone & GRC Board Ornamen Kayu',
          'Tinggi Pilar Utama: 6.40 Meter',
          'Jenis Kaca Utama Lobi: Tempered Glass double-glazed 12mm',
          'Pagar Pembatas: Pagar Besi Minimalis dengan Hollow Hitam 40x40 K-300'
        ],
        aiAnalysis: {
          type: 'Rendisi 3D / Gambar Fasad Eksterior',
          summary: 'Gambar memperlihatkan visualisasi komersial 3D bangunan kost eksklusif 6 lantai tipe modern klasik. Fasad menggunakan pilar megah di lobi pintu masuk utama di bagian depan.',
          dims: 'Estimasi tinggi bangunan: 22,5 Meter, Bentang fasad depan: 12,5 Meter.',
          notes: 'Dinding lobi utama harus dipastikan lurus dan rapi saat pengecoran karena akan dilapisi kaca tempered temper langsung.'
        },
        comments: [
          {
            id: 'com_p1_1',
            user: 'Direksi Owner PT. FGI',
            role: 'Owner',
            text: 'Tampilan depan pilar klasik ini memberikan nilai sewa kamar premium. Koordinasikan pencahayaan taman bawah pagar.',
            date: '2026-06-22',
            pin: { x: 38.5, y: 44.2 }
          }
        ]
      },
      {
        pageNumber: 2,
        pageCode: 'A-02',
        title: 'Denah Tata Letak Lantai 1 (Ground Floor Layout)',
        category: 'Arsitektur',
        image: blueprintImage,
        scale: '1:100',
        description: 'Denah arsitektural detail lantai dasar lobi penerima resepsionis, tangga dual sirkulasi, koridor, unit kamar eksklusif dasar K1 s/d K6, kolam renang komunal halaman belakang, dan mini-cafe.',
        specifications: [
          'Tinggi Plafon Bersih: 3.60 Meter',
          'Bahan Dinding Partisi Kamar: Bata Ringan Citicon tebal 10cm',
          'Ukuran Kolam Renang: Panjang 12.00 Meter, Lebar 4.00 Meter',
          'Finishing Lantai Lobi: Granit Tile 80x80 polished Indogress Bianco Royal'
        ],
        aiAnalysis: {
          type: 'Denah Arsitektural Lantai 1',
          summary: 'Denah menunjukkan zonasi publik lobi di depan, sirkulasi vertikal tangga darurat di tengah, 6 unit kamar teratur (K1-K6), dan area relaksasi di bagian halaman belakang.',
          dims: 'Lebar Lobi: 4,5 Meter. Koridor Kamar: Lebar Bersih 1,8 Meter.',
          notes: 'Pastikan bak kontrol mini cafe terpasang dengan filter lemak masakan sebelum limbah masuk ke saluran pipa buang luar.'
        },
        comments: [
          {
            id: 'com_p2_1',
            user: 'Budi Santoso',
            role: 'Project Manager',
            text: 'Area resepsionis dan lobi harus memiliki bukaan inlet AC ducting yang kuat agar sirkulasi udara dingin optimal.',
            date: '2026-06-22',
            pin: { x: 50, y: 40 }
          }
        ]
      },
      {
        pageNumber: 3,
        pageCode: 'A-03',
        title: 'Denah Arsitektur Tata Letak Kamar Sewa Lantai 1 & Lantai 2',
        category: 'Arsitektur',
        image: blueprintImage,
        scale: '1:100',
        description: 'Skenario tata letak unit tipikal kamar kost dari lantai 1 & 2. Konfigurasi double-loaded corridor membagi kamar menjadi blok kiri dan kanan secara simetris, lengkap dengan balkon luar.',
        specifications: [
          'Lebar Bersih Koridor Tengah: 2.10 Meter',
          'Dimensi Kamar Tipikal: 3.25m x 4.50m (termasuk balkon)',
          'Instalasi Kelistrikan: MCB internal 1.300 Watt per kamar mandiri',
          'Pintu Balkon: Sliding door aluminum Alexindo powder-coated'
        ],
        aiAnalysis: {
          type: 'Denah Unit Arsitektur Tipikal',
          summary: 'Sistem tata letak kamar yang modular memaksimalkan luas lantai bangunan. Kamar mandi berada di sisi koridor dalam sedangkan tempat tidur diposisikan di sisi jendela luar/balkon.',
          dims: 'Kamar Mandi internal: 1.50 x 1.50 Meter.',
          notes: 'Periksa jalur riser pipe air bersih dan kotor agar sejajar sempurna dari lantai 1 hingga lantai 6.'
        },
        comments: []
      },
      {
        pageNumber: 4,
        pageCode: 'S-01',
        title: 'Denah Rencana Kolom & Dinding Struktural Rangka Beton',
        category: 'Struktur & Sipil',
        image: blueprintImage,
        scale: '1:100',
        description: 'Gambar teknis detail struktur beton yang menampilkan bentang plat lebar, grid kolom induk, pembagian dinding seismik serta modulus elastisitas beton penahan struktur atas.',
        specifications: [
          'Dimensi Utama Kavling Bangunan: Lebar 12.70 Meter, Panjang 20.08 Meter',
          'Mutu Beton Minimum: Ready-Mix K-350 slump 12±2cm',
          'Selimut Beton Kolom: 40mm anti korosi karat',
          'Besi Sengkang Kolom Utama: Ulir D16 baja deform SNI asli Krakatau Steel'
        ],
        aiAnalysis: {
          type: 'Detail Pembesian & Rangka Beton',
          summary: 'Gambar menyajikan denah struktur rangka grid beton atas dengan spasi tiang bervariasi antara 4,00 Meter hingga 4,80 Meter sekor.',
          dims: 'Total panjang grid kolom structural membentang 20,08 Meter.',
          notes: 'Mengingat tingginya bangunan, overlap sambungan besi harus mengikuti standar minimal 40D diameter.'
        },
        comments: []
      },
      {
        pageNumber: 5,
        pageCode: 'S-02',
        title: 'Denah Rencana Fondasi Tiang Pancang Bore Pile',
        category: 'Struktur & Sipil',
        image: blueprintImage,
        scale: '1:100',
        description: 'Instalasi spesifikasi letak grid dan diameter pengeboran bore pile. Setiap titik tiang dikonfigurasikan menyentuh kedalaman tanah keras sekor wilayah Majalengka.',
        specifications: [
          'Kedalaman Pengeboran Tiang: 20.00 Meter dari tanah dasar',
          'Batas Lebar Kavling Grid Pondasi: 12.00 Meter',
          'Mutu Beton Pondasi Cair: K-300 ready-mix dengan additive waterproof',
          'Diameter Tiang Bor Pile: Ø 400mm'
        ],
        aiAnalysis: {
          type: 'Struktur Bawah / Pondasi Dalam',
          summary: 'Pola grid pondasi bor pile tersusun simetris sebanyak 24 titik pondasi utama untuk menampung berat gedung.',
          dims: 'Spasi grid antartitik bore pile: 4.80m, 2.40m, dan 4.80m membentang.',
          notes: 'Wajib melakukan pengujian tes integritas tiang (PIT Test) pada minimal 10% sampel tiang bor pile terpasang.'
        },
        comments: []
      },
      {
        pageNumber: 6,
        pageCode: 'S-03',
        title: 'Gambar Penampang Potongan Struktural & MEP A.A',
        category: 'Struktur & Sipil',
        image: blueprintImage,
        scale: '1:75',
        description: 'Diagram irisan memanjang gedung dari depan ke belakang. Menampilkan cross-section perlantai, letak struktur tangga beton, elevasi pelat lantai lobi, serta instalasi pemipaan riser pipa.',
        specifications: [
          'Tinggi Total Lantai 1 s/d Lantai 6: 22.00 Meter',
          'Kemiringan Tangga Darurat: 35 derajat modular',
          'Tebal Pelat Lantai Beton: 120mm composite wiremesh M8',
          'Ketebalan Dinding Kolom Pondasi: 400x400 mm'
        ],
        aiAnalysis: {
          type: 'Irisan Gambar Potongan Bangunan (Section Layout)',
          summary: 'Potongan A.A menyajikan sirkulasi aliran vertikal dan relasi ketinggian antar lantai secara struktural.',
          dims: 'Elevasi Atap dak beton: +21.80 Meter dari muka tanah rata-rata.',
          notes: 'Pastikan lubang shaft plumbing dibuat rapi pada pinggir kamar mandi untuk mencegah penyumbatan pemeliharaan pipa kedepan.'
        },
        comments: []
      },
      {
        pageNumber: 7,
        pageCode: 'A-04',
        title: 'Gambar Elevasi Fasad Arsitektural Tampak Depan',
        category: 'Arsitektur',
        image: blueprintImage,
        scale: '1:100',
        description: 'Elevasi tampak depan bangunan kost menampilkan letak daun jendela kaca louver, ornamen kaca bulat dekoratif di lantai lobi, serta fasad arch pilar klasik.',
        specifications: [
          'Material Kusen Fasad: Aluminium powder coated hitam 4 inci',
          'Fasad Utama: Marmer Travertine atau panel WPC anti-rayap',
          'Ornamen Bulat: Panel GRC moulding casting cetak pabrikan',
          'Waterproofing Dinding Fasad: Bitumen cair eksterior 3 lapis'
        ],
        aiAnalysis: {
          type: 'Elevasi Fasad Depan (Front Elevation)',
          summary: 'Gambar arsitektural tampak depan 6 lantai dengan proporsi klasik modern yang simetris, menampilkan area gerbang masuk utama di bagian ground.',
          dims: 'Bentang lebar tampak depan: 12,7 Meter.',
          notes: 'Lakukan pelapisan anti jamur/lumut ekstra pada ornamen luar karena curah hujan di wilayah Kertajati dinamis.'
        },
        comments: []
      },
      {
        pageNumber: 8,
        pageCode: 'A-05',
        title: 'Gambar Elevasi Samping Kiri Bangunan Kost',
        category: 'Arsitektur',
        image: blueprintImage,
        scale: '1:100',
        description: 'Tampak samping kiri bangunan memperlihatkan deretan bukaan ventilasi udara kamar sewa, pipa drainase air hujan, dan dinding luar bergaris arsitektural.',
        specifications: [
          'Jarak Bebas Sempadan Kiri: 2.50 Meter',
          'Finishing Dinding Samping: Cat Dulux Weathershield warna Putih Salju',
          'Pipa Talang Air Tegak: Rucika PVC D 4-inch di dalam shaft tersembunyi',
          'Kaca Jendela: Tinted Glass 6mm smoke black anti ultraviolet'
        ],
        aiAnalysis: {
          type: 'Elevasi Samping Kiri (Left Elevation)',
          summary: 'Menampilkan dinding masif berseling jendela vertikal tipikal kamar untuk menjamin cahaya matahari pagi masuk ke unit sewa.',
          dims: 'Dimensi panjang eksterior samping kiri: 20.08 Meter.',
          notes: 'Pastikan pemipaan talang air tidak bocor ke arah kavling pekarangan tetangga sebelah kiri.'
        },
        comments: []
      },
      {
        pageNumber: 9,
        pageCode: 'A-06',
        title: 'Gambar Elevasi Samping Kanan Bangunan Kost',
        category: 'Arsitektur',
        image: blueprintImage,
        scale: '1:100',
        description: 'Tampak samping kanan bangunan, menguraikan posisi tangga darurat luar bangunan, sekat panel AC outdoor, dan pagar batas kavling kanan.',
        specifications: [
          'Struktur Tangga Luar: Konstruksi profil baja WF-200 dengan pengecatan anti karat',
          'Dudukan Outdoor AC: Siku Besi 40x40 lengkap dengan dynabolt tebal',
          'Dinding Samping Kanan: Bata merah plester halus cat anti rembes air',
          'Saringan Outlet Udara: Aluminum Grill Louver'
        ],
        aiAnalysis: {
          type: 'Elevasi Samping Kanan (Right Elevation)',
          summary: 'Menampilkan fasad dekoratif samping kanan, menyisakan area lurus koridor tangga darurat evakuasi kebakaran luar.',
          dims: 'Panjang Kavling Struktural Kanan: 20.08 Meter.',
          notes: 'Dudukan AC outdoor tipe gantung harus terkunci kuat pada kolom sekunder beton agar getaran kompresor tidak merambat ke dinding kamar.'
        },
        comments: []
      },
      {
        pageNumber: 10,
        pageCode: 'A-07',
        title: 'Gambar Elevasi Fasad Arsitektural Tampak Belakang',
        category: 'Arsitektur',
        image: blueprintImage,
        scale: '1:100',
        description: 'Elevasi bagian belakang gedung, menampilkan jendela kaca unit kamar di sisi belakang, letak tangki air atas (roof tank) fiber, dan pagar pembatas kolam renang.',
        specifications: [
          'Roof Tank Atas: Fiber Kapasitas 2 x 5.000 Liter dengan booster pump otomatis',
          'Kusen Jendela Belakang: Aluminum Silver Metalik 4-inci',
          'Louver Grill Ventilasi Kamar Mandi: Bahan PVC Putih anti karat',
          'Pagar Belakang Pejalan Kaki: Tembok Bata Plester tinggi 2.20 Meter'
        ],
        aiAnalysis: {
          type: 'Elevasi Fasad Belakang (Rear Elevation)',
          summary: 'Diagram memperlihatkan bagian belakang gedung yang langsung berbatasan dengan area lanskap terbuka hijau, kolam renang komunal, dan cafe.',
          dims: 'Lebar Sektor Fasad Belakang: 12,7 Meter.',
          notes: 'Railing pengaman koridor lantai atas harus setinggi minimal 110cm dari lantai guna standar keselamatan anak anak.'
        },
        comments: []
      },
      {
        pageNumber: 11,
        pageCode: 'V-01',
        title: 'Render 3D Perspektif Potongan Interior (Cutaway Model)',
        category: 'Visualisasi 3D',
        image: frontImage,
        scale: 'NTS (Non-Technical Scale)',
        description: 'Render visualisasi 3D potongan samping bangunan untuk pemasaran investasi. Menunjukkan tatanan furnitur kamar tidur, sirkulasi lobi, penempatan tangga internal, dan balkon unit sewa.',
        specifications: [
          'Mebeler Kamar: Custom multiplex finishing HPL Motif Kayu Jati Muda',
          'Furnitur Lobi: Kursi Duduk Sofa Kulit Sintetis warna charcoal grey',
          'Lampu Kamar: Warm White Downlight LED 9 Watt Philips',
          'Lantai Unit: SPC Flooring tebal 4mm bermotif urat kayu alami'
        ],
        aiAnalysis: {
          type: 'Rendisi Interior Potongan 3D',
          summary: 'Model ini sangat penting bagi investor untuk meraba kerapatan isi interior hunian sewa serta skema sirkulasi tamu.',
          dims: 'Tinggi Kamar standard: 2.80 Meter floor-to-ceiling.',
          notes: 'Finishing HPL furnitur harus dilindungi plastik pelindung selama proyek berlangsung untuk mencegah goresan debu semen kasar.'
        },
        comments: []
      },
      {
        pageNumber: 12,
        pageCode: 'V-02',
        title: 'Render 3D Eksterior Mewah Perspektif Sudut Samping',
        category: 'Visualisasi 3D',
        image: frontImage,
        scale: 'NTS',
        description: 'Tampilan visual eksterior 3D bangunan secara utuh memperlihatkan kemewahan fasad pilar tinggi klasik dipadukan corak jendela kisi modern berlapis travertine krem hangat.',
        specifications: [
          'Finishing Pilar: Cat Texture Pasir Kamprot warna krem alami',
          'Warna Cat Lapangan: Weathershield premium anti jamur',
          'Kaca Balkon Kamar: Railing Tempered Glass tebal 10mm dengan rangka Stainless Steel 304',
          'Taman Samping: Rumput gajah mini dengan aksen lampu taman spot LED'
        ],
        aiAnalysis: {
          type: 'Render Perspektif 3D Sudut Eksterior',
          summary: 'Rendisi menunjukkan nilai komersial yang tinggi, berkelas hotel butik yang fungsional dan estetis.',
          dims: 'Skala Perspektif 3D visual komersial.',
          notes: 'Pastikan sudut pilar beton luar benar-benar vertikal siku lurus sebelum pengerjaan cat kamprot dilakukan.'
        },
        comments: []
      },
      {
        pageNumber: 13,
        pageCode: 'V-03',
        title: 'Render 3D Area Kolam Renang Resort & Cafe Outdoor',
        category: 'Visualisasi 3D',
        image: poolImage,
        scale: 'NTS',
        description: '3D Render suasana bersantai kolam renang tropis dan dek bersantai kayu di halaman belakang gedung kost eksklusif. Menyajikan jajaran pohon kamboja, teras gazebo mini, dan bar cafe.',
        specifications: [
          'Material Dek Kolam: Parquet Kayu Bengkirai Solid anti celah air',
          'Pelapis Lantai Dalam Kolam: Keramik Kuda Laut Mozaik Biru Tosca',
          'Kursi Berjemur Outdoor: Anyaman Rotan Sintetis tahan cuaca ekstrem',
          'Saringan Gutter Over-flow: Bahan PVC tebal keliling kolam'
        ],
        aiAnalysis: {
          type: 'Visualisasi Area Rekreasi Belakang (Pool & Cafe)',
          summary: 'Desain memadukan ruang berenang dengan ruang makan luar ruangan bertema tropis perkotaan.',
          dims: 'Estimasi kedalaman kolam renang: melandai 1,1 s/d 1,5 Meter.',
          notes: 'Gunakan keramik bertekstur anti-slip kasar di pinggiran kolam renang untuk keselamatan tenant.'
        },
        comments: [
          {
            id: 'com_p13_1',
            user: 'H. Sulaiman',
            role: 'Investor',
            text: 'Dek kayu poolside harus dilapisi pelindung anti ultraviolet setidaknya sekali setahun.',
            date: '2026-06-22',
            pin: { x: 45, y: 55 }
          }
        ]
      },
      {
        pageNumber: 14,
        pageCode: 'V-04',
        title: 'Render 3D Perspektif Udara Sektor Belakang Bangunan',
        category: 'Visualisasi 3D',
        image: poolImage,
        scale: 'NTS',
        description: 'Sudut pandang bird eye view halaman belakang memperlihatkan keteraturan penempatan unit outdoor AC, tangki air cadangan lurus kolam renang, serta pembuangan air kolam.',
        specifications: [
          'Suntikan Tanaman Hijau: Pohon Kamboja bali diameter batang 15cm',
          'Pencahayaan Area Pool: Spotlight LED Warm White IP65 tahan guyuran hujan',
          'Sistem Sirkulasi Kolam: Semi Over-flow dengan bak penyeimbang air (balancing tank)',
          'Filter Air Kolam Renang: Sand Filter Hayward kapasitas besar'
        ],
        aiAnalysis: {
          type: 'Perspektif Udara Lanskap (Aerial Rendering)',
          summary: 'DED memperlihatkan tata letak instalasi outdoor kolam renang di halaman belakang seluas 12x10 Meter persegi.',
          dims: 'Area Lanskap Hijau Belakang Jendela: 30 meter persegi.',
          notes: 'Balancing tank harus dibersihkan secara periodik setiap dua bulan sekali dari endapan daun kering kamboja.'
        },
        comments: []
      },
      {
        pageNumber: 15,
        pageCode: 'V-05',
        title: 'Render 3D Close-up Pintu Gerbang Utama & Drop-off Lobi',
        category: 'Visualisasi 3D',
        image: frontImage,
        scale: 'NTS',
        description: 'Tampilan detail arsitektur klasik pada pintu masuk lobi utama. Memperlihatkan tangga masuk berlapis granit hitam kasar, pintu kaca ganda otomatis, dan ornamen gerbang busur.',
        specifications: [
          'Pintu Kaca Utama: Frameless Glass tebal 12mm dengan floor hinge Dorma',
          'Lantai Tangga Lobi: Granit Kasar Black Gold anti licin',
          'Dinding Samping Pintu: Travertine asli polesan semi-glossy',
          'Sistem Parkir: Pembaca Kartu RFID Sensor otomatis'
        ],
        aiAnalysis: {
          type: 'Perspektif Gerbang Masuk Komersial',
          summary: 'Area penyambutan tamu dengan kanopi pilar klasik megah untuk mementaskan kesan premium kost eksklusif.',
          dims: 'Lebar bersih jalan ramp kursi roda: 1,2 Meter (Aksesibilitas Difabel).',
          notes: 'Ramp untuk akses kursi roda harus disiapkan dengan sudut kemiringan maksimal 8 derajat sesuai UU Gedung.'
        },
        comments: []
      },
      {
        pageNumber: 16,
        pageCode: 'V-06',
        title: 'Render 3D Rincian Mini-Container Cafe Poolside',
        category: 'Visualisasi 3D',
        image: poolImage,
        scale: 'NTS',
        description: 'Perspektif rendering mini cafe bar berkonsep modular container di sudut dek kolam renang belakang. Wadah saji bagi tenant untuk kopi pagi, sarapan, dan area bersantai sore.',
        specifications: [
          'Struktur Cafe: Container Modifikasi ukuran 10 Feet (3.00m x 2.44m)',
          'Finishing Cafe: Cat Epoxy Hitam Dof tahan karat laut',
          'Lantai Mezanin Atas: Deck Wood WPC dengan tangga spiral plat besi minimalis',
          'Atap Container: Canopy membrane pelindung panas kain Sunbrella'
        ],
        aiAnalysis: {
          type: 'Visualisasi Konstruksi Mini Cafe Modular',
          summary: 'Fasilitas rekreasi outdoor semi-permanen ramah lingkungan yang menaikkan occupancy rate kos-kosan.',
          dims: 'Luas tapak container luar: 7,3 meter persegi.',
          notes: 'Sambungan listrik cafe harus dilengkapi pengaman arus bocor (ELCB) tersendiri demi keamanan tinggi di pekarangan air!'
        },
        comments: []
      },
      {
        pageNumber: 17,
        pageCode: 'V-07',
        title: 'Render 3D Kolam Renang Sore Hari dengan Tembok Ornamen Batu',
        category: 'Visualisasi 3D',
        image: poolImage,
        scale: 'NTS',
        description: 'Sajian rendering kolam renang di sore hari menampilkan pantulan lampu bawah air bergradasi toska hangat, dipadukan dinding pagar beraksen batu alam paras jogja dan air mancur tebing mini.',
        specifications: [
          'Pelapis Dinding Batas: Batu Alam Paras Jogja coating dof water-repellent',
          'Lampu Kolam Renang: LED Underwater Warm White IP68 12 Volt',
          'Instalasi Grounding Listrik: Kawat Tembaga BC 16mm terkoneksi ke tanah dalam',
          'Air Mancur Tebing: Pompa sirkulasi mini 200 Watt submersible'
        ],
        aiAnalysis: {
          type: 'Render Pencahayaan Malam Pool / Wall Stone Ornaments',
          summary: 'Rendering ini memberikan gambaran dramatis lampu eksterior bawah air dan dinding batu alam untuk kenyamanan tinggi penghuni.',
          dims: 'Dimensi dinding batu alam terpasang: Tinggi 3.00 Meter, Panjang 12.00 Meter.',
          notes: 'Gunakan cairan pelindung batu paras jogja jenis anti-jamur (water-repellent coating) agar batu putih tidak menguning berlumut.'
        },
        comments: []
      }
    ]
  }
];
