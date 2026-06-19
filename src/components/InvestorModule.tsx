import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RAB_METADATA } from '../data/rabData';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Download, 
  Coins, 
  HelpCircle, 
  Target, 
  ShieldCheck,
  Building,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

export const InvestorModule: React.FC = () => {
  const { 
    projectStats, 
    investmentMetrics, 
    setInvestmentMetrics, 
    generateReport 
  } = useApp();

  // Multi-calculator live parameters
  const [hotelRooms, setHotelRooms] = useState<number>(48);
  const [hotelTariff, setHotelTariff] = useState<number>(550000); // IDR per night
  const [hotelOccupancy, setHotelOccupancy] = useState<number>(75); // percent

  const [kostRooms, setKostRooms] = useState<number>(36);
  const [kostTariff, setKostTariff] = useState<number>(2000000); // IDR per month
  const [kostOccupancy, setKostOccupancy] = useState<number>(85); // percent

  // Advanced financial calculations
  const hotelMonthlyGross = hotelRooms * hotelTariff * 30 * (hotelOccupancy / 100);
  const hotelOpExpenses = hotelMonthlyGross * 0.35; // 35% expenses
  const hotelMonthlyNet = hotelMonthlyGross - hotelOpExpenses;
  const hotelAnnualNet = hotelMonthlyNet * 12;

  const kostMonthlyGross = kostRooms * kostTariff * (kostOccupancy / 100);
  const kostOpExpenses = kostMonthlyGross * 0.15; // 15% expenses
  const kostMonthlyNet = kostMonthlyGross - kostOpExpenses;
  const kostAnnualNet = kostMonthlyNet * 12;

  // Aggregate stats
  const totalMonthlyGross = hotelMonthlyGross + kostMonthlyGross;
  const totalMonthlyNet = hotelMonthlyNet + kostMonthlyNet;
  const totalAnnualNet = hotelAnnualNet + kostAnnualNet;

  const sampleDevelopmentCost = RAB_METADATA.grandTotal;
  const updatedROI = parseFloat(((totalAnnualNet / sampleDevelopmentCost) * 100).toFixed(1));
  const updatedBEP = parseFloat((sampleDevelopmentCost / totalAnnualNet).toFixed(1));
  const updatedNPV = totalAnnualNet * 4.9 - sampleDevelopmentCost; // Simulated 5-year NPV calculation model
  const updatedIRR = parseFloat((updatedROI * 1.15).toFixed(1));

  // Formatter mapping helper
  const formatIDR = (num: number) => {
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(2)} Milyar`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER BLOCK */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block">PT. FORESYNDO GLOBAL INDONESIA</span>
          <h1 className="text-2xl font-bold text-[#1E3A8A] mt-1">Pusat Investasi &amp; Analisis Kelayakan</h1>
          <p className="text-slate-500 text-sm font-light mt-0.5">Analisis instrumen keuangan proyek rujukan ROI, NPV, IRR serta payback period.</p>
        </div>

        <button 
          onClick={() => {
            setInvestmentMetrics({
              investmentValue: sampleDevelopmentCost,
              projectValue: sampleDevelopmentCost * 1.25,
              roi: updatedROI,
              npv: updatedNPV,
              irr: updatedIRR,
              bepYears: updatedBEP
            });
            generateReport('investor');
          }}
          className="px-5 py-3 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-mono font-bold rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Cetak Laporan Kelayakan (.TXT)
        </button>
      </div>

      {/* INVESTMENT HEALTH METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">Total Modal Investasi</p>
          <p className="text-xl font-bold text-[#1E3A8A] mt-1.5 font-mono">{formatIDR(sampleDevelopmentCost)}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Tanah (Hak Milik) + Konstruksi 7 Lantai</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">ROI Bersih Tahunan</p>
          <p className="text-xl font-extrabold text-[#EA580C] mt-1.5 font-mono">{updatedROI}%</p>
          <span className="text-[9.5px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-mono mt-2 inline-block font-bold">Sangat Layak</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">IRR Proyeksi</p>
          <p className="text-xl font-bold text-[#1E3A8A] mt-1.5 font-mono">{updatedIRR}%</p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Bunga rujukan bank: 6%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">NPV 5-Tahun</p>
          <p className="text-sm font-bold text-[#1E3A8A] mt-1.5 font-mono line-clamp-1">{formatIDR(updatedNPV)}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-2 font-mono">Surplus &gt; 0</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-bold">BEP Payback</p>
          <p className="text-xl font-extrabold text-[#1E3A8A] mt-1.5 font-mono">{updatedBEP} Thn</p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Periode aman modal</p>
        </div>
      </div>

      {/* DUAL CALCULATORS ON THE SAME PAGE SECTION */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Sliders Input Area */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                <Coins className="text-[#EA580C] w-5 h-5" /> Simulator Bisnis Terintegrasi (Hotel &amp; Kost)
              </h3>
              <p className="text-xs text-slate-500 mt-1">Sesuaikan harga sewa dan tingkat okupansi untuk simulasi imbal hasil (ROI) real-time.</p>
            </div>
            <span className="self-start sm:self-center text-[10px] text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-150 font-bold whitespace-nowrap">Live Dynamic Engine</span>
          </div>

          {/* Quick Scenario Presets */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-204/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#1E3A8A] font-mono uppercase tracking-wider flex items-center gap-1.5 label-scenario">
              <Sparkles className="w-4 h-4 text-orange-500" /> Skenario Cepat:
            </span>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setHotelOccupancy(45);
                  setHotelTariff(400000);
                  setKostOccupancy(55);
                  setKostTariff(1600000);
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-bold text-red-650 shadow-sm cursor-pointer transition"
              >
                🔴 Pesimistis
              </button>
              <button
                type="button"
                onClick={() => {
                  setHotelOccupancy(75);
                  setHotelTariff(550000);
                  setKostOccupancy(85);
                  setKostTariff(2000000);
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-lg text-xs font-bold text-amber-655 shadow-sm cursor-pointer transition"
              >
                🟡 Moderat
              </button>
              <button
                type="button"
                onClick={() => {
                  setHotelOccupancy(95);
                  setHotelTariff(750000);
                  setKostOccupancy(95);
                  setKostTariff(2500000);
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg text-xs font-bold text-emerald-650 shadow-sm cursor-pointer transition"
              >
                🟢 Optimistis
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Sayap Hotel Inputs */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-205">
              <h4 className="text-sm font-bold text-[#1E3A8A] flex items-center gap-2 border-b border-slate-150 pb-2">
                <Building className="text-[#EA580C] w-4 h-4" /> Sayap Bisnis Smart Hotel
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-semibold">
                  <span className="text-slate-500">Target Kamar Hotel</span>
                  <span className="text-[#1E3A8A] font-bold">{hotelRooms} Kamar</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="48" 
                  value={hotelRooms}
                  onChange={(e) => setHotelRooms(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#EA580C]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-semibold">
                  <span className="text-slate-500">Tarif Rata-rata (ADR)</span>
                  <span className="text-[#1E3A8A] font-bold">Rp {hotelTariff.toLocaleString('id-ID')} /malam</span>
                </div>
                <input 
                  type="range" 
                  min="300000" 
                  max="1000000" 
                  step="25000"
                  value={hotelTariff}
                  onChange={(e) => setHotelTariff(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#EA580C]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-semibold">
                  <span className="text-slate-500">Okupansi Kamar</span>
                  <span className="text-[#EA580C] font-bold">{hotelOccupancy}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={hotelOccupancy}
                  onChange={(e) => setHotelOccupancy(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#EA580C]"
                />
              </div>

              <div className="border-t border-slate-205 pt-3 text-xs space-y-1 text-slate-550 font-mono">
                <div className="flex justify-between">
                  <span>Gross Sektor:</span>
                  <span className="text-slate-700 font-bold">Rp {(hotelMonthlyGross/1000000).toFixed(1)} Juta</span>
                </div>
                <div className="flex justify-between">
                  <span>Laba Bersih Sektor:</span>
                  <span className="text-emerald-600 font-bold">Rp {(hotelMonthlyNet/1000000).toFixed(1)} Juta/bln</span>
                </div>
              </div>
            </div>

            {/* Sayap Kost Inputs */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-205">
              <h4 className="text-sm font-bold text-[#1E3A8A] flex items-center gap-2 border-b border-slate-150 pb-2">
                <Layers className="text-blue-600 w-4 h-4" /> Sayap Bisnis Kost Eksklusif
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-semibold">
                  <span className="text-slate-500">Target Kamar Kost</span>
                  <span className="text-[#1E3A8A] font-bold">{kostRooms} Kamar</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="36" 
                  value={kostRooms}
                  onChange={(e) => setKostRooms(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#EA580C]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-semibold">
                  <span className="text-slate-500">Sewa Bulanan (Net)</span>
                  <span className="text-[#1E3A8A] font-bold">Rp {kostTariff.toLocaleString('id-ID')} /bulan</span>
                </div>
                <input 
                  type="range" 
                  min="1200000" 
                  max="3500000" 
                  step="100000"
                  value={kostTariff}
                  onChange={(e) => setKostTariff(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#EA580C]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-semibold">
                  <span className="text-slate-500">Tingkat Hunian</span>
                  <span className="text-[#EA580C] font-bold">{kostOccupancy}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={kostOccupancy}
                  onChange={(e) => setKostOccupancy(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-[#EA580C]"
                />
              </div>

              <div className="border-t border-slate-205 pt-3 text-xs space-y-1 text-slate-550 font-mono">
                <div className="flex justify-between">
                  <span>Gross Sektor:</span>
                  <span className="text-slate-700 font-bold">Rp {(kostMonthlyGross/1000000).toFixed(1)} Juta</span>
                </div>
                <div className="flex justify-between">
                  <span>Laba Bersih Sektor:</span>
                  <span className="text-emerald-600 font-bold">Rp {(kostMonthlyNet/1000000).toFixed(1)} Juta/bln</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Health Status Visual Scale */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-[#1E3A8A]">ZONA KELAYAKAN ROI KOMPOSIT</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-sans ${updatedROI >= 10 ? 'bg-emerald-50 text-emerald-650' : updatedROI >= 5 ? 'bg-amber-50 text-amber-650' : 'bg-red-50 text-red-650'}`}>
                {updatedROI >= 10 ? '⭐⭐⭐ Sangat Layak' : updatedROI >= 5 ? '⭐⭐ Cukup Layak' : '⭐ Kurang Layak'}
              </span>
            </div>
            
            {/* Real meter gauge */}
            <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-red-400/40 text-[9px] text-red-700 font-mono flex items-center justify-center font-bold" style={{ width: '30%' }}>&lt; 5%</div>
              <div className="h-full bg-amber-400/40 text-[9px] text-amber-700 font-mono flex items-center justify-center font-bold" style={{ width: '40%' }}>5% - 10%</div>
              <div className="h-full bg-emerald-400/40 text-[9px] text-emerald-700 font-mono flex items-center justify-center font-bold" style={{ width: '30%' }}>&gt; 10%</div>

              {/* Slider cursor pin */}
              <div 
                className="absolute top-0 bottom-0 w-2.5 bg-slate-900 border border-white shadow-lg transition-all duration-300"
                style={{ left: `${Math.min(100, Math.max(0, (updatedROI / 16) * 100))}%` }}
                title={`ROI Anda: ${updatedROI}%`}
              ></div>
            </div>

            <p className="text-[11px] text-slate-500 font-light leading-relaxed">
              * Tracker ROI dinamis menunjukkan laju pengembalian saat ini sebesar <strong className="text-[#EA580C]">{updatedROI}%</strong> tahunan dari total modal investasi rujukan. Tingkat kelayakan beralih ke <span className="font-bold text-emerald-600">Sangat Layak</span> saat ROI komposit melampaui batas minimum internal 10%.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-light text-slate-500 leading-relaxed">
            * Penghitungan di atas mencerminkan kombinasi multi-aset terpadu FORESYNDO 2 di Jatitujuh Majalengka. ROI komposit dihitung berdasarkan total laba bersih tahunan dari kedua sayap bisnis hotel &amp; kost dibagi Nilai Rencana Investasi pembangunan 7-lantai.
          </div>
        </div>

        {/* Aggregate Projections Sidebar */}
        <div className="lg:col-span-4 flex flex-col justify-between h-full gap-6">
          <div className="bg-gradient-to-br from-[#1E3A8A] to-[#12255C] rounded-2xl p-6 shadow-md space-y-6 flex-1 text-white">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-widest">AKUMULASI PROYEKSI INVESTOR</h4>
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">Laba Bersih Gabungan Bulanan</p>
                <p className="text-2xl font-extrabold text-orange-400 mt-1 font-display">
                  Rp {totalMonthlyNet.toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">Laba Bersih Tahunan Gabungan</p>
                <p className="text-lg font-bold text-slate-100 mt-1 font-mono">
                  Rp {totalAnnualNet.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="border-t border-blue-900/40 pt-4 space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Omzet Kotor Total:</span>
                  <span className="text-white font-bold">Rp {totalMonthlyGross.toLocaleString('id-ID')}/bln</span>
                </div>
                <div className="flex justify-between">
                  <span>Payback Period (BEP):</span>
                  <span className="text-emerald-400 font-bold">{updatedBEP} Tahun</span>
                </div>
                <div className="flex justify-between">
                  <span>Ekuivalen ROI Proyek:</span>
                  <span className="text-orange-450 font-bold">{updatedROI}% / thn</span>
                </div>
              </div>

              <div className="p-4 bg-black/15 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs text-white font-bold">Zero-Trust Security</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Lahan Kavling 250m² berstatus Sertifikat Hak Milik (SHM) atas nama PT. Foresyndo Global Indonesia, memitigasi risiko pembekuan aset konstruksi atau sewa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
