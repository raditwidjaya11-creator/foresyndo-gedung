import React, { useState } from 'react';
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
  Percent
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { 
    projectStats, 
    progressItems, 
    weeklyData, 
    monthlyCashflow, 
    generateReport, 
    currentRole 
  } = useApp();

  // Active hover states on chart to make it dynamic
  const [activeWeekIdx, setActiveWeekIdx] = useState<number | null>(null);
  const [activeCashIdx, setActiveCashIdx] = useState<number | null>(null);

  // Formatter for Currency
  const formatIDR = (num: number) => {
    if (num >= 1000000000) {
      return `Rp ${(num / 1000000000).toFixed(2)} Milyar`;
    }
    return `Rp ${num.toLocaleString('id-ID')}`;
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
            onClick={() => generateReport('investor')}
            className="px-4 py-2 bg-[#EA580C] hover:bg-orange-600 text-xs font-mono font-bold rounded-lg text-white transition flex items-center gap-1.5 shadow"
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
          <p className="text-[10px] text-slate-400 font-mono mt-3 text-right">Deviasi target: +3.5%</p>
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
    </div>
  );
};
