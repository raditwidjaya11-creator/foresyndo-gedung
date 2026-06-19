import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Check, 
  X, 
  AlertCircle,
  FileCheck, 
  Briefcase, 
  Plus, 
  DollarSign, 
  Users, 
  Crown,
  FileText,
  BadgeAlert,
  Megaphone,
  Download
} from 'lucide-react';

export const AdminVerification: React.FC = () => {
  const { 
    contractors, 
    updateContractorStatus, 
    tenders, 
    addTender, 
    bids, 
    updateBidStatus,
    generateReport 
  } = useApp();

  // Active sub tab inside admin panel
  const [adminTab, setAdminTab] = useState<'contractors' | 'bids' | 'new-tender'>('contractors');

  // Form states for releasing a new tender
  const [tenderName, setTenderName] = useState('');
  const [tenderHps, setTenderHps] = useState<number>(3000000000);
  const [tenderLoc, setTenderLoc] = useState('FORESYNDO 2 - Jatitujuh Majalengka');
  const [tenderSched, setTenderSched] = useState('20 Juni - 15 Juli 2026');
  const [tenderCat, setTenderCat] = useState<'Kontraktor Gedung' | 'Kontraktor Jalan' | 'Kontraktor Infrastruktur' | 'Kontraktor MEP' | 'Interior' | 'Landscape'>('Kontraktor MEP');

  const handleCreateTenderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenderName) {
      alert('Mohon isi nama paket tender');
      return;
    }

    addTender({
      packageName: tenderName,
      hpsValue: tenderHps,
      location: tenderLoc,
      schedule: tenderSched,
      documentUrl: '#download-tor',
      status: 'Dibuka',
      category: tenderCat
    });

    setTenderName('');
    setTenderHps(1500000000);
    setAdminTab('bids'); // redirect to bids/tenders view
  };

  const handleSelectWinner = (bidId: string, tenderId: string) => {
    // 1. Mark this bid as Pemenang
    updateBidStatus(bidId, 'Pemenang');

    // 2. Mark other bids for the same tender as Gugur
    bids.forEach(b => {
      if (b.tenderId === tenderId && b.id !== bidId) {
        updateBidStatus(b.id, 'Gugur');
      }
    });

    // 3. Mark the tender as Selesai
    const tender = tenders.find(t => t.id === tenderId);
    if (tender) {
      tender.status = 'Selesai';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* HEADER BAR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block font-bold">FOR-2 &bull; PANEL VERIFIKASI UTAMA</span>
          <h1 className="text-2xl font-bold text-[#1E3A8A] mt-1">Konsol Verifikasi &amp; Pembukaan Tender</h1>
          <p className="text-slate-500 text-sm font-light mt-0.5">Memvalidasi legalitas dewan direksi rekanan, mereview penawaran RAB, dan menetapkan pemenang pengadaan.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => generateReport('mitra')}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#EA580C]" /> Unduh Berkas Mitra
          </button>
        </div>
      </div>

      {/* ADMINISTRATION WORKBENCH TAB MENU */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-0.5">
        <button
          onClick={() => setAdminTab('contractors')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${adminTab === 'contractors' ? 'border-[#EA580C] text-[#EA580C] bg-orange-50/50' : 'border-transparent text-slate-500 hover:text-[#1E3A8A]'}`}
        >
          <Users className="w-4 h-4" /> Verifikasi Berkas Rekanan ({contractors.length})
        </button>
        <button
          onClick={() => setAdminTab('bids')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${adminTab === 'bids' ? 'border-[#EA580C] text-[#EA580C] bg-orange-50/50' : 'border-transparent text-slate-500 hover:text-[#1E3A8A]'}`}
        >
          <Briefcase className="w-4 h-4" /> Evaluasi Penawaran E-Tender ({bids.length})
        </button>
        <button
          onClick={() => setAdminTab('new-tender')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${adminTab === 'new-tender' ? 'border-[#EA580C] text-[#EA580C] bg-orange-50/50' : 'border-transparent text-slate-500 hover:text-[#1E3A8A]'}`}
        >
          <Plus className="w-4 h-4 text-[#EA580C]" /> Buka Konstruksi Tender Baru
        </button>
      </div>

      {/* ACTIVE VIEW CONTROL */}
      {adminTab === 'contractors' && (
        <div className="space-y-6">
          {contractors.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-50 text-[10px] font-mono text-slate-500 rounded border border-slate-200 font-bold">{c.qualification} Business</span>
                    <span className="text-xs text-slate-400 font-mono font-semibold">Daftar : {c.submittedAt}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1E3A8A] mt-1">{c.companyName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">Direktur: {c.directorName} &bull; Email: {c.email} &bull; Tel: {c.phone}</p>
                </div>

                <div className="flex flex-wrap gap-2 self-start md:self-center">
                  <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg ${c.grade === 'Grade A' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                    AI Score: {c.totalScore} ({c.grade})
                  </span>
                  
                  <span className="px-2.5 py-1 bg-slate-50 text-xs font-mono font-bold rounded-lg border border-slate-200 text-slate-700">
                    Status : {c.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Grid document checklist status */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 py-2">
                {Object.entries(c.documents).map(([doc, val]) => (
                  <div key={doc} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center space-y-1 font-mono text-[10px]">
                    <span className="text-slate-550 capitalize line-clamp-1 font-bold">{doc.replace(/([A-Z])/g, ' $1')}</span>
                    {val ? (
                      <span className="text-emerald-600 block font-bold bg-emerald-50 py-0.5 rounded border border-emerald-100">TERLAMPIR</span>
                    ) : (
                      <span className="text-slate-450 block py-0.5">KOSONG</span>
                    )}
                  </div>
                ))}
              </div>

              {/* List of past experience */}
              {c.experiences.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-[10px] uppercase text-slate-500 font-mono font-bold">Portofolio Pekerjaan Terekam ({c.experiences.length}):</p>
                  <div className="space-y-1.5">
                    {c.experiences.map((exp) => (
                      <div key={exp.id} className="flex justify-between text-xs text-slate-600 font-mono font-semibold">
                        <span>&bull; {exp.projectName} ({exp.location}) - Owner: {exp.owner}</span>
                        <span className="text-[#1E3A8A] font-bold">Rp {exp.value.toLocaleString('id-ID')} ({exp.year})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Trigger keys */}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 justify-end">
                <span className="text-xs text-slate-500 font-mono self-center font-bold">Ubah Status Rekanan:</span>
                
                <button 
                  onClick={() => updateContractorStatus(c.id, 'Disetujui')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Setujui Legalitas
                </button>
                <button 
                  onClick={() => updateContractorStatus(c.id, 'Revisi')}
                  className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                >
                  Revisi Dokumen
                </button>
                <button 
                  onClick={() => updateContractorStatus(c.id, 'Ditolak')}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                >
                  Tolak Berkas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'bids' && (
        <div className="space-y-8 animate-fadeIn">
          {tenders.map((tender) => {
            const matchingBids = bids.filter(b => b.tenderId === tender.id);
            return (
              <div key={tender.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-mono text-slate-650 rounded border border-slate-250 uppercase font-bold tracking-wider">{tender.category}</span>
                    <h3 className="text-lg font-bold text-[#1E3A8A] mt-1.5">{tender.packageName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">Batas Jadwal : {tender.schedule} &bull; Nilai HPS: <span className="text-[#EA580C] font-bold">Rp {tender.hpsValue.toLocaleString('id-ID')}</span></p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-xs font-mono uppercase font-bold ${tender.status === 'Dibuka' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-650 border border-slate-200'}`}>
                    {tender.status}
                  </span>
                </div>

                {/* Submissions comparison */}
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-wider font-bold">Daftar Penawaran Masuk ({matchingBids.length}):</p>
                  
                  {matchingBids.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono py-4 text-center bg-slate-50 border border-slate-150 rounded-xl">
                      Belum ada penawaran kontraktor terunggah untuk paket ini.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {matchingBids.map((bid) => {
                        const matchedContr = contractors.find(c => c.id === bid.contractorId);
                        return (
                          <div key={bid.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-[#1E3A8A] text-sm">{bid.contractorName}</p>
                                {matchedContr && (
                                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 font-mono text-[#EA580C] font-bold border border-slate-200 rounded">
                                    AI Grade: {matchedContr.grade} ({matchedContr.totalScore} Pts)
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-mono font-semibold">Diajukan: {bid.submittedAt} &bull; Surat &amp; RAB Komplet: YES &bull; Jadwal Komplet: YES</p>
                            </div>

                            <div className="flex items-center gap-4 self-end md:self-center font-mono">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold font-mono">HARGA PENAWARAN (BID)</span>
                                <span className="text-base font-bold text-[#1E3A8A]">Rp {bid.bidAmount.toLocaleString('id-ID')}</span>
                              </div>

                              {bid.status === 'Pemenang' ? (
                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-150 text-xs font-bold rounded-lg flex items-center gap-1">
                                  <Crown className="w-4 h-4 text-orange-400" /> Pemenang Tender
                                </span>
                              ) : bid.status === 'Gugur' ? (
                                <span className="px-3 py-1.5 bg-rose-50 text-rose-500 border border-rose-100 text-xs rounded-lg font-bold">
                                  Gugur
                                </span>
                              ) : tender.status === 'Dibuka' ? (
                                <button 
                                  onClick={() => handleSelectWinner(bid.id, tender.id)}
                                  className="px-4 py-2 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow"
                                >
                                  Tunjuk Pemenang
                                </button>
                              ) : (
                                <span className="text-xs text-slate-550 font-bold font-sans">Evaluasi Selesai</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {adminTab === 'new-tender' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
          <h3 className="text-lg font-bold text-[#1E3A8A] border-b border-slate-100 pb-3 flex items-center gap-2">
            <Megaphone className="text-[#EA580C] w-5 h-5" /> Buka Pendaftaran Paket E-Tender Baru
          </h3>

          <form onSubmit={handleCreateTenderSubmit} className="space-y-4 whitespace-normal">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Nama Paket Tender Konstruksi *</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Pengadaan Genset Utama & Lift Elektrik 7 Lantai"
                value={tenderName}
                onChange={(e) => setTenderName(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200 text-sm focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none font-medium"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Nilai HPS Penyedia Jasa (IDR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-sm text-slate-400 font-mono font-bold">Rp</span>
                  <input 
                    type="number" 
                    required
                    value={tenderHps}
                    onChange={(e) => setTenderHps(Number(e.target.value))}
                    className="w-full bg-slate-50 text-slate-800 p-3 pl-10 rounded-xl border border-slate-200 text-sm focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Klasifikasi Sektor Jasa / Bidang</label>
                <select 
                  value={tenderCat}
                  onChange={(e) => setTenderCat(e.target.value as any)}
                  className="w-full bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200 text-sm focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none font-medium"
                >
                  <option value="Kontraktor Gedung">Kontraktor Gedung Bertingkat</option>
                  <option value="Kontraktor Jalan">Kontraktor Sipil Jalan</option>
                  <option value="Kontraktor Infrastruktur">Kontraktor Utilitas Infrastruktur</option>
                  <option value="Kontraktor MEP">Kontraktor Mekanikal Elektrikal (MEP)</option>
                  <option value="Interior">Interior Pekerjaan Kayu / Furniture</option>
                  <option value="Landscape">Pekerjaan Landscape Taman &amp; Fasad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Batas Tanggal Pendaftaran</label>
                <input 
                  type="text" 
                  value={tenderSched}
                  onChange={(e) => setTenderSched(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200 text-sm focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-widest font-mono font-bold mb-2">Lokasi Pengerjaan Lapangan</label>
                <input 
                  type="text"
                  value={tenderLoc}
                  onChange={(e) => setTenderLoc(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-3 rounded-xl border border-slate-200 text-sm focus:border-blue-550 focus:ring-1 focus:ring-blue-550 outline-none font-medium"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 bg-[#EA580C] hover:bg-orange-600 text-white font-bold rounded-xl transition text-sm cursor-pointer shadow"
            >
              Publikasikan Paket Tender Digital
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
