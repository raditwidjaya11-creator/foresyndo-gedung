import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building, 
  MapPin, 
  Award, 
  Search, 
  FileCheck, 
  Cpu, 
  Briefcase, 
  ChevronRight, 
  Plus, 
  Trash2, 
  UserPlus, 
  CheckCircle, 
  Loader2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { LandingPage } from './LandingPage';

export const ContractorPortal: React.FC = () => {
  const { 
    currentRole, 
    currentUser, 
    contractors, 
    tenders, 
    bids, 
    submitBid, 
    addContractorExperience, 
    showToast 
  } = useApp();

  // Try to find if user is logged as one of the contractors
  const linkedContractor = contractors.find(c => 
    c.companyName === currentUser?.companyName || 
    c.email === currentUser?.email || 
    c.id === 'contr2' // Default fallback to PT. Tri Karya MEP Specialist
  );

  // States for adding past experiences
  const [expName, setExpName] = useState('');
  const [expOwner, setExpOwner] = useState('');
  const [expValue, setExpValue] = useState<number>(3000000000);
  const [expLoc, setExpLoc] = useState('');
  const [expYear, setExpYear] = useState<number>(2024);

  // States for Tender Bid Submission
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);

  const handleAddExpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedContractor) return;
    if (!expName || !expOwner || !expLoc) {
      alert('Mohon lengkapi seluruh kolom past experience');
      return;
    }
    addContractorExperience(linkedContractor.id, {
      projectName: expName,
      owner: expOwner,
      value: expValue,
      location: expLoc,
      year: expYear
    });

    setExpName('');
    setExpOwner('');
    setExpLoc('');
  };

  const handleApplyTenderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedContractor || !selectedTenderId || bidAmount <= 0) return;

    submitBid({
      tenderId: selectedTenderId,
      contractorId: linkedContractor.id,
      contractorName: linkedContractor.companyName,
      bidAmount,
      proposalDoc: true,
      rabDoc: true,
      scheduleDoc: true,
      profileDoc: true
    });

    setSelectedTenderId(null);
    setBidAmount(0);
  };

  if (!linkedContractor) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl space-y-2 text-slate-300">
          <p className="font-bold text-amber-500 flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5" /> Akun Kontraktor Belum Terhubung
          </p>
          <p className="text-xs leading-relaxed">
            Anda saat ini berganti ke role Mitra Kontraktor namun belum mendaftarkan entitas perusahaan. Silakan gunakan form pendaftaran digital di bawah untuk mendaftarkan kontraktor baru atau isi data kelayakan Anda.
          </p>
        </div>
        <LandingPage />
      </div>
    );
  }

  // Find bids related to linked contractor
  const appliedBids = bids.filter(b => b.contractorId === linkedContractor.id);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block font-bold">PORTAL UTAMA MITRA KERJA</span>
          <h1 className="text-2xl font-bold text-[#1E3A8A] mt-1">{linkedContractor.companyName}</h1>
          <p className="text-slate-500 text-sm font-light mt-0.5">Pantau status scoring, legalitas berkas, serta ajukan penawaran E-Tender pembangunan hotel &amp; kost.</p>
        </div>

        <div className="flex gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${linkedContractor.verificationStatus === 'Disetujui' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-orange-50 text-orange-600 border border-orange-200'}`}>
            Status Verifikasi: {linkedContractor.verificationStatus}
          </span>
          <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-mono font-bold rounded-lg text-[#EA580C]">
            {linkedContractor.grade}
          </span>
        </div>
      </div>

      {/* CORE PROFILE GRID AND AI SCORE GAUGE */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Assessment details & metrics */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI Score Subdivisions Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
                <Cpu className="text-[#EA580C] w-5 h-5 animate-spin-slow" /> Hasil Analisis Kelayakan &amp; Scoring AI
              </h3>
              <p className="text-xs text-slate-500 font-light mt-0.5">Penilaian otomatis yang dikalkulasikan secara real-time berdasarkan bobot pemenuhan berkas legal &amp; portofolio.</p>
            </div>

            {/* Assessment Progress indicators list */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-slate-650 font-bold">
                  <span>1. Dokumen Legalitas (30%)</span>
                  <span className="text-[#1E3A8A] font-bold">{linkedContractor.legalScore} Pts</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${linkedContractor.legalScore}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-slate-650 font-bold">
                  <span>2. Rekam Pengalaman (30%)</span>
                  <span className="text-[#1E3A8A] font-bold">{linkedContractor.experienceScore} Pts</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${linkedContractor.experienceScore}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-slate-650 font-bold">
                  <span>3. Kekuatan Keuangan (20%)</span>
                  <span className="text-[#1E3A8A] font-bold">{linkedContractor.financeScore} Pts</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${linkedContractor.financeScore}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-slate-650 font-bold">
                  <span>4. Daya Kompetensi Standar (20%)</span>
                  <span className="text-[#1E3A8A] font-bold">{linkedContractor.hrScore} Pts</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${linkedContractor.hrScore}%` }}></div>
                </div>
              </div>
            </div>

            {/* Total Weighted Score bar */}
            <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs text-slate-500 font-mono block font-bold">BOBOT SKOR AKHIR</span>
                <p className="text-4xl font-extrabold text-[#EA580C] font-display">{linkedContractor.totalScore} <span className="text-sm font-semibold text-slate-400">/ 100</span></p>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-xs text-slate-500 font-mono block font-bold">PERINGKAT RUJUKAN</span>
                <p className="text-2xl font-extrabold text-[#1E3A8A] mt-1 uppercase tracking-wider">{linkedContractor.grade}</p>
                <div className="text-xs text-emerald-600 font-bold font-mono mt-1.5">{linkedContractor.status}</div>
              </div>
            </div>
          </div>

          {/* Past Experience addition Form & List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
              <Award className="text-[#EA580C] w-5 h-5" /> Pengalaman Proyek Berjalan (Portofolio)
            </h3>

            {/* Experiences lists */}
            {linkedContractor.experiences.length === 0 ? (
              <p className="text-xs text-slate-550 font-mono py-4 text-center bg-slate-50 rounded-lg border border-slate-200">
                Belum ada rekam jejak terdaftar. Silakan gunakan formulir penambahan di kanan/bawah.
              </p>
            ) : (
              <div className="space-y-3">
                {linkedContractor.experiences.map((exp) => (
                  <div key={exp.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 font-mono text-xs">
                    <div>
                      <p className="font-bold text-[#1E3A8A] text-sm font-sans">{exp.projectName}</p>
                      <p className="text-slate-500 mt-1 font-semibold">Owner: {exp.owner} &bull; {exp.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#EA580C] font-bold">Rp {exp.value.toLocaleString('id-ID')}</p>
                      <p className="text-slate-400 text-[10px]/tight mt-1">Tahun {exp.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Addition mini form */}
            <form onSubmit={handleAddExpSubmit} className="space-y-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-[#1E3A8A] uppercase font-mono tracking-wider">+ Tambahkan Laporan Pengalaman Konstruksi Baru</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Nama Paket Pengerjaan" 
                  value={expName}
                  onChange={(e) => setExpName(e.target.value)}
                  className="bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none w-full font-medium"
                />
                <input 
                  type="text" 
                  placeholder="Instansi Pemberi Kerja" 
                  value={expOwner}
                  onChange={(e) => setExpOwner(e.target.value)}
                  className="bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none w-full font-medium"
                />
                <input 
                  type="number" 
                  placeholder="Nilai Pemenangan Proyek (IDR)" 
                  value={expValue}
                  onChange={(e) => setExpValue(Number(e.target.value))}
                  className="bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none w-full font-mono font-medium"
                />
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Kota/Provinsi" 
                    value={expLoc}
                    onChange={(e) => setExpLoc(e.target.value)}
                    className="bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none w-full font-medium"
                  />
                  <input 
                    type="number" 
                    placeholder="Tahun" 
                    value={expYear}
                    onChange={(e) => setExpYear(Number(e.target.value))}
                    className="bg-slate-50 text-slate-800 p-2.5 rounded-xl border border-slate-200 text-xs focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none font-mono text-center w-24 font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white font-semibold font-mono text-xs rounded-xl shadow cursor-pointer transition"
              >
                Kirim Laporan Pengalaman (AI Scoring Segera Berubah)
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Document checks & active bid records */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Document checklists check status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
              <FileCheck className="text-[#EA580C] w-5 h-5" /> Kelengkapan Berkas
            </h3>
            
            <div className="space-y-3 font-mono text-xs text-slate-650 font-semibold">
              {Object.entries(linkedContractor.documents).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-150">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  {val ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-100">Lengkap</span>
                  ) : (
                    <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-[10px] border border-rose-100">Absen</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Active submitted bid tracker */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center gap-2">
              <Briefcase className="text-[#EA580C] w-5 h-5" /> Log Partisipasi E-Tender
            </h3>

            {appliedBids.length === 0 ? (
              <p className="text-xs text-slate-550 font-mono py-4 text-center bg-slate-50 border border-slate-150 rounded-lg">
                Belum ada berkas penawaran dikirimkan saat ini.
              </p>
            ) : (
              <div className="space-y-3">
                {appliedBids.map((bid) => {
                  const matchingTender = tenders.find(t => t.id === bid.tenderId);
                  return (
                    <div key={bid.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-bold text-[#1E3A8A] line-clamp-1 flex-1">{matchingTender ? matchingTender.packageName : 'Paket Tender'}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${bid.status === 'Pemenang' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' : bid.status === 'Evaluasi' ? 'bg-orange-50 text-orange-600 border border-orange-150' : 'bg-slate-200 text-slate-650'}`}>
                          {bid.status}
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px] font-mono text-slate-500 font-semibold">
                        <span>Nilai Bid Kami:</span>
                        <span className="text-[#1E3A8A] font-bold">Rp {bid.bidAmount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
