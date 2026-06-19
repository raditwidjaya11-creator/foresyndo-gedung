import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { 
  Building, 
  MapPin, 
  Layers, 
  TrendingUp, 
  FileCheck, 
  Cpu, 
  UserPlus, 
  Calculator, 
  Briefcase, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Search, 
  Award, 
  ShieldAlert,
  Download,
  Percent,
  DollarSign
} from 'lucide-react';
import { ExperienceItem } from '../types';

export const LandingPage: React.FC = () => {
  const { 
    projectStats, 
    contractors, 
    registerContractor, 
    tenders, 
    submitBid, 
    notifications,
    addNotification,
    generateReport
  } = useApp();

  // Active Simulators State
  const [simType, setSimType] = useState<'hotel' | 'kost'>('hotel');
  
  // Hotel Simulator Parameters
  const [hotelRooms, setHotelRooms] = useState<number>(35);
  const [hotelTariff, setHotelTariff] = useState<number>(450000); // IDR per night
  const [hotelOccupancy, setHotelOccupancy] = useState<number>(75); // percent

  // Kost Simulator Parameters
  const [kostRooms, setKostRooms] = useState<number>(25);
  const [kostTariff, setKostTariff] = useState<number>(1800000); // IDR per month
  const [kostOccupancy, setKostOccupancy] = useState<number>(85); // percent

  // Registration Form State
  const [companyName, setCompanyName] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [nib, setNib] = useState('');
  const [npwp, setNpwp] = useState('');
  const [sbu, setSbu] = useState('');
  const [qualification, setQualification] = useState<'Kecil' | 'Menengah' | 'Besar'>('Menengah');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  
  const [docs, setDocs] = useState({
    aktaPerusahaan: false,
    nib: false,
    npwp: false,
    sbu: false,
    ktpDirektur: false,
    portofolio: false,
    isoCert: false,
  });

  // Adding project experience list inside registration
  const [experiences, setExperiences] = useState<Omit<ExperienceItem, 'id'>[]>([]);
  const [newExpName, setNewExpName] = useState('');
  const [newExpYear, setNewExpYear] = useState<number>(2025);
  const [newExpValue, setNewExpValue] = useState<number>(2000000000);
  const [newExpOwner, setNewExpOwner] = useState('');
  const [newExpLocation, setNewExpLocation] = useState('');

  // Search contractors directory
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Interactive Bid Pop-up for Landing Page Tenders
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidContractorId, setBidContractorId] = useState<string>('contr1');

  // Submit Registration
  const [registrationResult, setRegistrationResult] = useState<any | null>(null);

  const handleCheckboxChange = (key: keyof typeof docs) => {
    setDocs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddExperience = () => {
    if (!newExpName || !newExpOwner || !newExpLocation) {
      alert('Mohon lengkapi detail pengalaman proyek');
      return;
    }
    setExperiences(prev => [
      ...prev,
      {
        projectName: newExpName,
        year: Number(newExpYear),
        value: Number(newExpValue),
        owner: newExpOwner,
        location: newExpLocation,
      }
    ]);
    setNewExpName('');
    setNewExpOwner('');
    setNewExpLocation('');
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !directorName || !nib || !npwp || !email) {
      alert('Mohon isi field bertanda bintang (*)');
      return;
    }

    const regProfile = registerContractor({
      companyName,
      directorName,
      nib,
      npwp,
      sbu: sbu || 'SBU-Tidak Ditulis',
      qualification,
      address,
      phone,
      email,
      website: website || 'www.perusahaan-kontraktor.co.id',
      documents: docs
    });

    // Add experiences added locally
    experiences.forEach(exp => {
      // Direct update through a manual simulation or context push
      regProfile.experiences.push({
        id: `exp_added_${Math.random()}`,
        ...exp
      });
    });

    // Recalculate experience score & total
    const totalExpValue = experiences.reduce((sum, item) => sum + item.value, 0);
    let expScore = 40;
    if (experiences.length > 0) {
      expScore = Math.min(100, Math.floor((totalExpValue / 15000000000) * 100)); // normalized 15B
      if (expScore < 50) expScore = 55;
    }
    const docUploadedCount = Object.values(docs).filter(Boolean).length;
    const maxDocs = Object.keys(docs).length;
    const legalScore = Math.floor((docUploadedCount / maxDocs) * 100);
    const financeScore = qualification === 'Besar' ? 95 : qualification === 'Menengah' ? 80 : 65;
    const hrScore = docs.portofolio ? 85 : 55;
    
    const recalculatedTotal = parseFloat(((legalScore * 0.3) + (expScore * 0.3) + (financeScore * 0.2) + (hrScore * 0.2)).toFixed(1));
    regProfile.legalScore = legalScore;
    regProfile.experienceScore = expScore;
    regProfile.totalScore = recalculatedTotal;
    regProfile.grade = recalculatedTotal >= 80 ? 'Grade A' : recalculatedTotal >= 63 ? 'Grade B' : 'Grade C';
    regProfile.status = recalculatedTotal >= 80 ? 'Direkomendasikan' : recalculatedTotal >= 63 ? 'Perlu Review' : 'Tidak Lolos';

    setRegistrationResult(regProfile);
    
    // Clear Form
    setCompanyName('');
    setDirectorName('');
    setNib('');
    setNpwp('');
    setSbu('');
    setAddress('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setExperiences([]);
    setDocs({
      aktaPerusahaan: false,
      nib: false,
      npwp: false,
      sbu: false,
      ktpDirektur: false,
      portofolio: false,
      isoCert: false,
    });
  };

  const handleTenderBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderId || bidAmount <= 0) return;

    const matchedContractor = contractors.find(c => c.id === bidContractorId);
    if (!matchedContractor) return;

    submitBid({
      tenderId: selectedTenderId,
      contractorId: bidContractorId,
      contractorName: matchedContractor.companyName,
      bidAmount,
      proposalDoc: true,
      rabDoc: true,
      scheduleDoc: true,
      profileDoc: true
    });

    setSelectedTenderId(null);
    setBidAmount(0);
  };

  // Hotel Calculations
  const hotelMonthlyGross = hotelRooms * hotelTariff * 30 * (hotelOccupancy / 100);
  const hotelOpCost = hotelMonthlyGross * 0.35; // 35% op cost
  const hotelMonthlyNet = hotelMonthlyGross - hotelOpCost;
  const hotelAnnualNet = hotelMonthlyNet * 12;

  // Kost Calculations
  const kostMonthlyGross = kostRooms * kostTariff * (kostOccupancy / 100);
  const kostOpCost = kostMonthlyGross * 0.15; // 15% op cost for Renting out rooms
  const kostMonthlyNet = kostMonthlyGross - kostOpCost;
  const kostAnnualNet = kostMonthlyNet * 12;

  const filteredContractors = contractors.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.sbu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'Semua' || 
                            (categoryFilter === 'Besar' && c.qualification === 'Besar') ||
                            (categoryFilter === 'Menengah' && c.qualification === 'Menengah') ||
                            (categoryFilter === 'Kecil' && c.qualification === 'Kecil') ||
                            (categoryFilter === 'Grade A' && c.grade === 'Grade A') ||
                            (categoryFilter === 'Grade B' && c.grade === 'Grade B');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#102a6b] to-[#0a1c4a] py-20 px-6 border-b-4 border-[#EA580C]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 bottom-0 w-80 h-80 bg-corporate-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-corporate-orange-500/20 text-orange-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-corporate-orange-500/30">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              Proyek Strategis Kertajati
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              FORESYNDO 2 – <span className="text-[#EA580C]">Smart Hotel</span> &amp; Exclusive Residence
            </h1>
            
            <p className="text-lg text-blue-100 font-light leading-relaxed">
              Pusat akomodasi modern terintegrasi di kawasan Bandara Internasional Kertajati dengan manajemen konstruksi, investasi transparan, dan pengadaan digital (E-Tender) terpadu.
            </p>
            
            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#0a1c4a]/50 rounded-xl border border-blue-500/25">
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-widest font-mono">Luas Lahan</p>
                <p className="text-lg font-bold text-white mt-1">250 m²</p>
              </div>
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-widest font-mono">Struktur Utama</p>
                <p className="text-lg font-bold text-white mt-1">1 Basement + 7 Lantai</p>
              </div>
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-widest font-mono">Aset Terdiri</p>
                <p className="text-lg font-bold text-orange-400 mt-1">Hotel &amp; Kost</p>
              </div>
              <div>
                <p className="text-xs text-blue-300 uppercase tracking-widest font-mono">Lokasi</p>
                <p className="text-lg font-bold text-white mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-orange-500" /> Majalengka
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="#simulasi" className="px-6 py-3 bg-[#EA580C] hover:bg-orange-600 text-white font-bold rounded-lg transition shadow flex items-center gap-2">
                <Calculator className="w-5 h-5" /> Simulasi ROI
              </a>
              <a href="#pendaftaran" className="px-6 py-3 bg-[#1E3A8A] hover:bg-blue-800 text-white font-extrabold rounded-lg transition border border-white/10 flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Registrasi Mitra
              </a>
              <a href="#tenders" className="px-6 py-3 bg-blue-900/40 hover:bg-blue-900/60 text-white font-bold rounded-lg transition border border-white/10 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-400" /> Tender Terbuka
              </a>
            </div>
          </div>

          {/* Realtime KPI Card on Hero */}
          <div className="w-full md:w-[380px] bg-[#132d75]/95 rounded-2xl p-6 border border-blue-500/30 shadow-2xl relative text-white">
            <div className="absolute -top-3 -right-3 px-3 py-1 bg-[#EA580C] text-white text-xs font-mono font-bold rounded-lg uppercase shadow">
              Live Tracker
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 font-display">
              <Building className="text-orange-400" /> FORESYNDO II Progress
            </h3>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-blue-205">PROGRES FISIK KONSTRUKSI</span>
                  <span className="text-orange-400 font-bold">{projectStats.physicalProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-blue-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000"
                    style={{ width: `${projectStats.physicalProgress}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-mono">
                  <span className="text-blue-205">PROGRES FINANSIAL REAL (COGS)</span>
                  <span className="text-blue-300 font-bold">{projectStats.financialProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-blue-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000"
                    style={{ width: `${projectStats.financialProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t border-blue-900 pt-4 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-blue-200">Nilai Investasi:</span>
                  <span className="text-white font-semibold">Rp {(projectStats.investmentValue / 1000000000).toFixed(1)} Milyar</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-blue-200">Sudah Terserap:</span>
                  <span className="text-white">Rp {(projectStats.actualSpending / 1000000000).toFixed(1)} Milyar</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-blue-200">Sisa Anggaran:</span>
                  <span className="text-orange-400 font-semibold">Rp {(projectStats.remainingBudget / 1000000000).toFixed(1)} Milyar</span>
                </div>
              </div>

              <div className="text-center bg-blue-950 rounded-lg p-3 border border-blue-900">
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-mono">Estimasi Operasional Mulai</p>
                <p className="text-sm font-bold text-white mt-0.5">JANUARI 2027</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE PROFILE SECTION */}
      <div className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-black tracking-tight text-[#1E3A8A] font-display">Profil &amp; Struktur Pembangunan</h2>
          <div className="w-16 h-1 bg-[#EA580C] mx-auto"></div>
          <p className="text-slate-600 font-normal">
            Dirancang sebagai gedung modern berekosistem ganda (Dual Hospitality Assets) pertama di kawasan satelit bandara Jatitujuh Majalengka.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-md transition shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">1 Basement &amp; 7 Lantai</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-light">
              Memaksimalkan pemanfaatan kavling 250 m² dengan rancangan interior modular premium. Basement berkapasitas 8 mobil &amp; utilitas terpusat.
            </p>
            <ul className="text-xs text-slate-700 font-semibold font-mono space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></div> Lt. 1: Lobby &amp; Cafe Resto</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></div> Lt. 2-4: Exclusive Smart Hotel</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></div> Lt. 5-7: Kost Eksklusif</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-md transition shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#EA580C]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Dual-Aset Komersial</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-light">
              Kombinasi pendapatan sewa dinamis hotel (short-stay crew bandara/turis) dan rental kost eksklusif bulanan (karyawan maskapai/industri sekitar bandara).
            </p>
            <ul className="text-xs text-slate-700 font-semibold font-mono space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> 48 Kamar Hotel Pintar</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> 36 Unit Premium Kost</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Sistem Smart Key &amp; IoT App</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-md transition shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A]">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Integrasi Pengadaan</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-light">
              Mempertemukan kontraktor berpengalaman nasional dengan penyerapan material bersertifikat ISO. Pengelolaan tender berbasis e-procurement transparan.
            </p>
            <ul className="text-xs text-slate-700 font-semibold font-mono space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></div> Verifikasi Legalitas Menyeluruh</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></div> Sistem Scoring Berbobot AI</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></div> Transparansi Dokumen HPS</li>
            </ul>
          </div>
        </div>
      </div>

      {/* INVESTMENT & ROI SIMULATOR SECTION */}
      <div id="simulasi" className="py-20 px-6 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-[#1E3A8A] font-display">Simulasi ROI &amp; Estimasi Pendapatan</h2>
            <div className="w-16 h-1 bg-[#EA580C] mx-auto"></div>
            <p className="text-slate-600 font-normal text-sm">
              Gunakan simulator interaktif di bawah untuk menganalisis arus kas bulanan berdasarkan segmen komersial FORESYNDO 2.
            </p>
          </div>

          {/* Simulator Segment Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 inline-flex">
              <button 
                onClick={() => setSimType('hotel')}
                className={`px-5 py-2.5 rounded text-sm font-bold transition flex items-center gap-2 ${simType === 'hotel' ? 'bg-[#EA580C] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Building className="w-4 h-4" /> Sayap Bisnis Hotel
              </button>
              <button 
                onClick={() => setSimType('kost')}
                className={`px-5 py-2.5 rounded text-sm font-bold transition flex items-center gap-2 ${simType === 'kost' ? 'bg-[#EA580C] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Layers className="w-4 h-4" /> Sayap Bisnis Kost Eksklusif
              </button>
            </div>
          </div>

          {/* SIMULATOR GRID */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Input sliders card */}
            <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-6 text-slate-850">
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                <Calculator className="text-[#EA580C] w-5 h-5" /> Parameter Simulasi ({simType === 'hotel' ? 'Hotel' : 'Kost'})
              </h3>

              {simType === 'hotel' ? (
                // HOTEL SLIDERS
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium">Jumlah Kamar Hotel Dioperasikan</span>
                      <span className="text-[#EA580C] font-bold font-mono">{hotelRooms} / 48 Kamar</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="48" 
                      value={hotelRooms}
                      onChange={(e) => setHotelRooms(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#EA580C]" 
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>5 Kamar</span>
                      <span>Maks: 48 Kamar</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium font-sans">Tarif Rata-rata Per Malam (ADR)</span>
                      <span className="text-[#EA580C] font-bold font-mono">Rp {hotelTariff.toLocaleString('id-ID')}</span>
                    </div>
                    <input 
                      type="range" 
                      min="200000" 
                      max="1200000" 
                      step="50000"
                      value={hotelTariff}
                      onChange={(e) => setHotelTariff(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#EA580C]" 
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Rp 200rb</span>
                      <span>Maks: Rp 1.2jt</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium font-sans">Tingkat Hunian Rata-Rata (Occupancy)</span>
                      <span className="text-[#EA580C] font-bold font-mono">{hotelOccupancy}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={hotelOccupancy}
                      onChange={(e) => setHotelOccupancy(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#EA580C]" 
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>10% Luang</span>
                      <span>Maks: 100% Penuh</span>
                    </div>
                  </div>
                </div>
              ) : (
                // KOST SLIDERS
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium font-sans">Jumlah Unit Kamar Kost</span>
                      <span className="text-[#EA580C] font-bold font-mono">{kostRooms} / 36 Kamar</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="36" 
                      value={kostRooms}
                      onChange={(e) => setKostRooms(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#EA580C]" 
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>5 Kamar</span>
                      <span>Maks: 36 Kamar</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium font-sans">Biaya Sewa Bulanan Per Kamar</span>
                      <span className="text-[#EA580C] font-bold font-mono">Rp {kostTariff.toLocaleString('id-ID')}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1000000" 
                      max="4000000" 
                      step="100000"
                      value={kostTariff}
                      onChange={(e) => setKostTariff(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#EA580C]" 
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Rp 1.0 Juta</span>
                      <span>Maks: Rp 4.0 Juta</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 font-medium font-sans">Tingkat Okupansi Kost</span>
                      <span className="text-[#EA580C] font-bold font-mono">{kostOccupancy}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={kostOccupancy}
                      onChange={(e) => setKostOccupancy(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#EA580C]" 
                    />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>10% Kosong</span>
                      <span>Maks: 100% Okupasi</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  * Penghitungan dihitung menggunakan estimasi biaya operasional standar industri Majalengka ({simType === 'hotel' ? '35% Biaya staf, utilitas & pemasaran hotel' : '15% Biaya pemeliharaan & penjaga kost'}).
                </p>
              </div>
            </div>

            {/* Simulated Live Outputs Cards */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full gap-6">
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#102a6b] rounded-2xl p-6 border border-blue-500/20 shadow-xl space-y-6 flex-1 text-white">
                <h4 className="text-sm font-bold text-blue-200 uppercase tracking-wider font-mono">HASIL PROYEKSI PENDAPATAN</h4>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-blue-200">Estimasi Pendapatan Kotor Bulanan</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      Rp {simType === 'hotel' ? hotelMonthlyGross.toLocaleString('id-ID') : kostMonthlyGross.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-blue-200">Potongan Operasional {simType === 'hotel' ? '(35%)' : '(15%)'}</p>
                    <p className="text-sm font-bold text-orange-400 mt-1">
                      - Rp {simType === 'hotel' ? hotelOpCost.toLocaleString('id-ID') : kostOpCost.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="border-t border-blue-900 pt-4">
                    <p className="text-xs text-blue-200 font-medium">Proyeksi Laba Bersih Bulanan</p>
                    <p className="text-3xl font-extrabold text-[#EA580C] mt-1 font-sans">
                      Rp {simType === 'hotel' ? hotelMonthlyNet.toLocaleString('id-ID') : kostMonthlyNet.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-blue-200">Laba Bersih Tahunan Terproyeksi</p>
                    <p className="text-xl font-semibold text-emerald-400 mt-1">
                      Rp {simType === 'hotel' ? hotelAnnualNet.toLocaleString('id-ID') : kostAnnualNet.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-blue-100 bg-blue-950/80 rounded p-2.5 border border-blue-800">
                    <span>Estimasi ROI Sektor:</span>
                    <span className="text-emerald-400 font-bold">
                      {simType === 'hotel' 
                        ? `${((hotelAnnualNet / (projectStats.investmentValue * 0.6)) * 100).toFixed(1)}% / thn`
                        : `${((kostAnnualNet / (projectStats.investmentValue * 0.4)) * 100).toFixed(1)}% / thn`
                      }
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => generateReport('investor')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-sm transition font-bold"
              >
                <Download className="w-4 h-4 text-[#EA580C]" /> Unduh Feasibility Study Lengkap (.TXT)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE TENDERS SECTION */}
      <div id="tenders" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-[#1E3A8A] flex items-center gap-2 font-display">
              <span className="px-2.5 py-1 bg-orange-100 text-[#EA580C] border border-orange-200 text-xs font-mono font-bold rounded-lg uppercase">e-Procurement</span>
              Paket Tender Kontraktor Aktif
            </h2>
            <p className="text-slate-600 font-normal max-w-xl text-sm">
              PT. Foresyndo Global Indonesia mengundang seluruh Penyedia Jasa Mitra Kontraktor terverifikasi untuk mengajukan penawaran terbaik.
            </p>
          </div>
          <button 
            onClick={() => generateReport('tender')}
            className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-2 whitespace-nowrap self-start"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" /> Unduh Memo Tender
          </button>
        </div>

        {/* Tenders list */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenders.map((tender) => (
            <div key={tender.id} className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col justify-between relative hover:border-[#1E3A8A]/30 transition shadow-sm">
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${tender.status === 'Dibuka' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' : tender.status === 'Evaluasi' ? 'bg-orange-50 text-[#EA580C] border border-orange-250' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                  {tender.status}
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-bold font-mono tracking-wider uppercase">{tender.category}</p>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-snug font-sans">{tender.packageName}</h3>
                
                <div className="space-y-2 border-t border-slate-100 pt-4 font-mono text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Nilai HPS:</span>
                    <span className="text-[#EA580C] font-semibold">Rp {tender.hpsValue.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jadwal Batas:</span>
                    <span className="text-slate-800 font-medium">{tender.schedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lokasi Pekerjaan:</span>
                    <span className="text-slate-800">Majalengka, Jawa Barat</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {tender.status === 'Dibuka' ? (
                  <button 
                    onClick={() => {
                      setSelectedTenderId(tender.id);
                      setBidAmount(tender.hpsValue - 100000000); // autofill suggested safe BID
                    }}
                    className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#EA580C] text-white text-xs font-semibold rounded-lg transition"
                  >
                    Ajukan Penawaran Sekarang
                  </button>
                ) : (
                  <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed">
                    {tender.status === 'Selesai' ? 'Pemenang Tersertifikasi' : 'Tahap Review Berkas'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TENDER BID MODAL DIALOG POPUP */}
      {selectedTenderId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-300 p-6 max-w-md w-full space-y-6 shadow-2xl text-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#1E3A8A] font-sans">Kirim Berkas Penawaran</h3>
              <button 
                onClick={() => setSelectedTenderId(null)}
                className="text-slate-400 hover:text-slate-700 font-mono text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleTenderBidSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-650 uppercase tracking-widest font-mono mb-2 font-bold">Pilih Akun Mitra Registrasi</label>
                <select 
                  value={bidContractorId} 
                  onChange={(e) => setBidContractorId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-3 rounded-lg border border-slate-200 text-sm focus:border-[#EA580C] outline-none"
                >
                  {contractors.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName} ({c.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-650 uppercase tracking-widest font-mono mb-2 font-bold">Nilai Pengajuan Penawaran (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-550 text-sm font-mono font-semibold">Rp</span>
                  <input 
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 text-slate-900 p-3 pl-10 rounded-lg border border-slate-200 text-sm focus:border-[#EA580C] outline-none font-mono"
                    placeholder="Contoh: 3400000000"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-light">
                  Pastikan nominal penawaran di bawah Nilai HPS Paket yang ditargetkan.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <p className="text-xs text-slate-700 font-bold mb-1">Kelengkapan Dokumen Tambahan:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-normal">
                  <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked disabled /> Surat Penawaran</div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked disabled /> RAB Terinci</div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked disabled /> Time Schedule</div>
                  <div className="flex items-center gap-1.5"><input type="checkbox" defaultChecked disabled /> Profil Perusahaan</div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedTenderId(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-250 text-slate-705 border border-slate-200 rounded-xl text-sm font-bold transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#EA580C] hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition"
                >
                  Kirim Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MITRA CONTRACTOR DATABASE / DIRECTORY LISTING */}
      <div className="py-20 px-6 bg-slate-100 border-t border-slate-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-[#1E3A8A] font-display">Database Registrasi Mitra Kontraktor</h2>
            <div className="w-16 h-1 bg-[#EA580C] mx-auto"></div>
            <p className="text-slate-600 font-normal text-sm">
              Sektor pencarian transparan bagi seluruh pengawas, konsultan, dan tim audit PT. Foresyndo Global Indonesia untuk melacak verifikasi kontraktor.
            </p>
          </div>

          {/* Search bar & filter controls */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari nama kontraktor, sertifikasi SBU, atau domisili..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 text-slate-850 p-3 pl-11 rounded-lg border border-slate-200 text-sm focus:border-[#EA580C] outline-none"
              />
            </div>
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 text-slate-705 p-3 rounded-lg border border-slate-200 text-sm focus:border-[#EA580C] outline-none md:w-56"
            >
              <option value="Semua">Kualifikasi: Semua</option>
              <option value="Besar">Klasifikasi: Besar</option>
              <option value="Menengah">Klasifikasi: Menengah</option>
              <option value="Kecil">Klasifikasi: Kecil</option>
              <option value="Grade A">Grade Rujukan A</option>
              <option value="Grade B">Grade Rujukan B</option>
            </select>

            <button 
              onClick={() => generateReport('mitra')}
              className="px-5 py-3 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold text-sm rounded-lg transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-orange-400" /> Ekspor Hasil Terdaftar (.TXT)
            </button>
          </div>

          {/* Directory Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContractors.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                Tidak ada kontraktor terdaftar yang cocok dengan parameter pencarian.
              </div>
            ) : (
              filteredContractors.map((c) => (
                <div key={c.id} className="bg-white rounded-xl p-6 border border-slate-250 hover:border-[#1E3A8A]/30 transition shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-205">
                          {c.qualification} Business
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">{c.companyName}</h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${c.grade === 'Grade A' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' : c.grade === 'Grade B' ? 'bg-orange-50 text-orange-800 border border-orange-250' : 'bg-rose-50 text-rose-800 border border-rose-250'}`}>
                        {c.grade}
                      </span>
                    </div>

                    <div className="text-xs text-slate-650 space-y-2 font-normal">
                      <p><strong className="font-mono text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">NIB / SBU:</strong> <span className="font-medium text-slate-800">{c.nib} / {c.sbu}</span></p>
                      <p><strong className="font-mono text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">DITETAPKAN OLEH AI:</strong> Skor Akhir: {c.totalScore} Pts | <span className="font-bold text-[#1E3A8A]">{c.status}</span></p>
                      <p><strong className="font-mono text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">LOKASI KANTOR:</strong> <span className="font-medium text-slate-700">{c.address}</span></p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-550 font-mono font-bold">Status Verifikasi:</span>
                    <span className={`font-extrabold ${c.verificationStatus === 'Disetujui' ? 'text-emerald-700' : c.verificationStatus === 'Revisi' ? 'text-orange-600' : c.verificationStatus === 'Ditolak' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {c.verificationStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CONTRACTOR PARTNER REGISTRATION MODULE (FORM) */}
      <div id="pendaftaran" className="py-20 px-6 max-w-6xl mx-auto border-t border-slate-200 bg-white">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Header left */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-[#EA580C] rounded-lg text-xs font-mono font-semibold border border-orange-200">
              Registrasi Kontraktor Modern
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#1E3A8A] font-display leading-tight">
              Ayo Daftar Sebagai <span className="text-[#EA580C]">Mitra Kerja Terpilih</span>
            </h2>

            <p className="text-slate-600 font-normal leading-relaxed text-sm">
              Dengan melengkapi dokumen perusahaan di bawah, algoritma AI kami akan menganalisis data secara real-time dan menerbitkan Grade Klasifikasi Usaha instan. Grade A dicalonkan langsung ke penunjukan HPS Prioritas.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-[#1E3A8A] font-mono uppercase tracking-wider">Bobot Algoritma Penilaian</h4>
              
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1 text-slate-600 font-medium">
                    <span>Dokumen Legalitas &amp; NIB</span>
                    <span className="text-slate-900 font-bold">Bobot 30%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className="w-[30%] h-full bg-blue-600 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-600 font-medium">
                    <span>Pengalaman &amp; Proyek Sebelumnya</span>
                    <span className="text-slate-900 font-bold">Bobot 30%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className="w-[30%] h-full bg-orange-500 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-600 font-medium">
                    <span>Skala Permodalan Keuangan</span>
                    <span className="text-slate-900 font-bold">Bobot 20%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className="w-[20%] h-full bg-emerald-500 rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-slate-600 font-medium">
                    <span>Ketersediaan Tenaga Ahli (SDM)</span>
                    <span className="text-slate-900 font-bold">Bobot 20%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className="w-[20%] h-full bg-indigo-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Calculation Results Box */}
            {registrationResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-br from-[#1E3A8A] to-[#102a6b] rounded-2xl border border-blue-500/20 shadow-2xl space-y-4 text-white"
              >
                <div className="flex justify-between items-center bg-[#EA580C]/20 p-2.5 rounded-xl border border-[#EA580C]/35">
                  <span className="text-xs font-bold text-orange-300 font-mono">SKORING OTOMATIS BERHASIL</span>
                  <Award className="w-4 h-4 text-orange-350" />
                </div>
                
                <div>
                  <h4 className="text-xs text-blue-200 uppercase tracking-widest font-mono">Entitas Terdaftar</h4>
                  <p className="text-lg font-bold text-white mt-1">{registrationResult.companyName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-950/80 p-3 rounded-xl border border-blue-900">
                    <span className="text-[10px] text-blue-200 font-mono">NILAI SKOR AI</span>
                    <p className="text-xl font-black text-[#EA580C] mt-1">{registrationResult.totalScore} / 100</p>
                  </div>
                  <div className="bg-blue-950/80 p-3 rounded-xl border border-blue-900">
                    <span className="text-[10px] text-blue-200 font-mono">PENGHARGAAAN GRADE</span>
                    <p className="text-xl font-bold text-white mt-1">{registrationResult.grade}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/80 rounded-xl border border-blue-900 flex justify-between items-center">
                  <span className="text-xs text-blue-200 font-mono">Status Rekomendasi:</span>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-2 py-1 rounded">
                    {registrationResult.status}
                  </span>
                </div>

                <p className="text-xs text-blue-105 leading-relaxed font-normal">
                  Status verifikasi sekarang adalah <span className="text-orange-300 font-bold uppercase">Pending</span>. Tim Admin PT. Foresyndo Global Indonesia akan mereview dokumen fisik Anda dalam jangka waktu maksimal 1x24 jam kerja.
                </p>
              </motion.div>
            )}
          </div>

          {/* Form right */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm whitespace-normal text-slate-800">
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-[#1E3A8A] font-sans">Form Kelayakan Penilaian Legalitas</h3>
              
              {/* Grid 2 Column */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Nama Perusahaan *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: PT. Karya Maju Mandiri" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white text-slate-805 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Nama Direktur Utama *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Ir. Ahmad Fauzi" 
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full bg-white text-slate-805 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Nomor NIB *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 12 digit NIB OSS" 
                    value={nib}
                    onChange={(e) => setNib(e.target.value)}
                    className="w-full bg-white text-slate-805 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Nomor NPWP Badan *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: 01.234.567.8-012.000" 
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    className="w-full bg-white text-slate-805 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Nomor SBU Terdaftar</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: BG-001 Konstruksi Sipil" 
                    value={sbu}
                    onChange={(e) => setSbu(e.target.value)}
                    className="w-full bg-white text-slate-805 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Kualifikasi Usaha / Skala</label>
                  <select 
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value as any)}
                    className="w-full bg-white text-slate-800 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none"
                  >
                    <option value="Kecil">Kecil (Kekayaan s/d Rp 1 Milyar)</option>
                    <option value="Menengah">Menengah (Kekayaan s/d Rp 10 Milyar)</option>
                    <option value="Besar">Besar (Kekayaan &gt; Rp 10 Milyar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Alamat Kantor Pusat *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Alamat Lengkap Perusahaan" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white text-slate-805 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Nomor Telepon Kantor *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g., 021-x / 0812-x" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white text-slate-850 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Email Kemitraan *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="E.g., kemitraan@karyamaju.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white text-slate-850 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-700 font-bold font-mono mb-1.5">Website Resmi</label>
                  <input 
                    type="text" 
                    placeholder="E.g., www.karyamaju.com" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-white text-slate-850 p-3 rounded-lg border border-slate-250 text-sm focus:border-[#EA580C] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Upload checklist */}
              <div className="space-y-3 pt-2">
                <label className="block text-sm font-bold text-[#1E3A8A] font-mono uppercase tracking-wider">Metode Unggah Dokumen Legalitas (Simulasi Checklist)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200 shadow-inner">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input type="checkbox" checked={docs.aktaPerusahaan} onChange={() => handleCheckboxChange('aktaPerusahaan')} className="w-4 h-4 accent-[#EA580C]" />
                    <span>Akta Pendirian &amp; Notaris (PDF)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input type="checkbox" checked={docs.nib} onChange={() => handleCheckboxChange('nib')} className="w-4 h-4 accent-[#EA580C]" />
                    <span>NIB OSS Berbasis Risiko (PDF)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input type="checkbox" checked={docs.npwp} onChange={() => handleCheckboxChange('npwp')} className="w-4 h-4 accent-[#EA580C]" />
                    <span>NPWP &amp; PKP Efektif Perpajakan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input type="checkbox" checked={docs.sbu} onChange={() => handleCheckboxChange('sbu')} className="w-4 h-4 accent-[#EA580C]" />
                    <span>SBU (Sertifikat Badan Usaha BG/MK)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input type="checkbox" checked={docs.ktpDirektur} onChange={() => handleCheckboxChange('ktpDirektur')} className="w-4 h-4 accent-[#EA580C]" />
                    <span>KTP &amp; NPWP Jajaran Direksi Utama</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input type="checkbox" checked={docs.portofolio} onChange={() => handleCheckboxChange('portofolio')} className="w-4 h-4 accent-[#EA580C]" />
                    <span>Company Profile &amp; Portofolio Ringkas</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium md:col-span-2">
                    <input type="checkbox" checked={docs.isoCert} onChange={() => handleCheckboxChange('isoCert')} className="w-4 h-4 accent-[#EA580C]" />
                    <span>Sertifikasi ISO Manajemen Standar Mutu (ISO 9001:2015)</span>
                  </label>
                </div>
              </div>

              {/* Experience adder */}
              <div className="space-y-4 pt-2">
                <label className="block text-sm font-bold text-[#1E3A8A] font-mono uppercase tracking-wider">Tambahkan Portofolio Proyek (Mendongkrak AI Score)</label>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-600 block mb-1 font-semibold">Nama Proyek Konstruksi</span>
                      <input 
                        type="text" 
                        placeholder="Contoh: Gedung Rektorat UNMA 5 Lt" 
                        value={newExpName}
                        onChange={(e) => setNewExpName(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 p-2 rounded-lg border border-slate-200 outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div>
                      <span className="text-slate-600 block mb-1 font-semibold">Pemberi Kerja (Owner)</span>
                      <input 
                        type="text" 
                        placeholder="Contoh: PT. Inovasi Cerdas" 
                        value={newExpOwner}
                        onChange={(e) => setNewExpOwner(e.target.value)}
                        className="w-full bg-slate-50 text-slate-805 p-2 rounded-lg border border-slate-200 outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div>
                      <span className="text-slate-600 block mb-1 font-semibold">Nilai Realisasi Proyek (IDR)</span>
                      <input 
                        type="number" 
                        placeholder="IDR Rupiah" 
                        value={newExpValue}
                        onChange={(e) => setNewExpValue(Number(e.target.value))}
                        className="w-full bg-slate-50 text-slate-805 p-2 rounded-lg border border-slate-200 outline-none focus:border-[#EA580C] font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-slate-600 block mb-1 font-semibold">Kabupaten/Lokasi &amp; Tahun</span>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Kab. Majalengka" 
                          value={newExpLocation}
                          onChange={(e) => setNewExpLocation(e.target.value)}
                          className="w-full bg-slate-50 text-slate-805 p-2 rounded-lg border border-slate-200 outline-none focus:border-[#EA580C]"
                        />
                        <input 
                          type="number" 
                          value={newExpYear}
                          onChange={(e) => setNewExpYear(Number(e.target.value))}
                          className="w-20 bg-slate-50 text-slate-805 p-2 rounded-lg border border-slate-200 outline-none focus:border-[#EA580C] font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleAddExperience}
                    className="w-full py-2 bg-slate-100 hover:bg-[#EA580C] text-slate-705 hover:text-white border border-slate-250 rounded-lg text-xs font-bold font-mono transition"
                  >
                    + Masukkan Proyek Pengalaman Ke Penilaian
                  </button>
                </div>

                {/* Experience items table preview */}
                {experiences.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-605">
                      <thead className="text-[10px] uppercase font-mono bg-slate-100 text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Nama Proyek</th>
                          <th className="py-2 px-2 text-right">Nilai Proyek</th>
                          <th className="py-2 px-2 text-center">Tahun</th>
                          <th className="py-2 px-2 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {experiences.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 bg-white">
                            <td className="py-2 px-3 font-semibold text-slate-900">{item.projectName}</td>
                            <td className="py-2 px-2 text-right text-[#EA580C] font-mono font-bold">Rp {item.value.toLocaleString('id-ID')}</td>
                            <td className="py-2 px-2 text-center font-mono text-slate-800 font-medium">{item.year}</td>
                            <td className="py-2 px-2 text-center">
                              <button type="button" onClick={() => handleRemoveExperience(idx)} className="text-rose-600 hover:text-rose-500">
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-[#EA580C] hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition text-sm text-center"
              >
                PROSES PENDAFTARAN &amp; ANALISIS AI SCORE SEKARANG
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
