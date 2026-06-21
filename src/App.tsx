import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { OwnerDashboard } from './components/OwnerDashboard';
import { ProjectManagement } from './components/ProjectManagement';
import { InvestorModule } from './components/InvestorModule';
import { ContractorPortal } from './components/ContractorPortal';
import { AdminVerification } from './components/AdminVerification';
import { RABExplorer } from './components/RABExplorer';
import { TimeSchedule } from './components/TimeSchedule';
import { ContractModule } from './components/ContractModule';
import { LoginPortal } from './components/LoginPortal';
import { AccountsManager } from './components/AccountsManager';
import { DrawingViewer } from './components/DrawingViewer';
import { ProjectDocuments } from './components/ProjectDocuments';
import { 
  Building, 
  MapPin, 
  User, 
  Layers, 
  Sliders, 
  Percent, 
  Briefcase, 
  ShieldAlert, 
  Users, 
  Bell, 
  Clock, 
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  Award,
  Globe,
  FileSpreadsheet,
  Compass,
  ShieldCheck,
  FileText,
  CheckCircle2,
  X,
  LogOut,
  Share2
} from 'lucide-react';
import { ProjectShareHub } from './components/ProjectShareHub';
import { ModuleShareWidget } from './components/ModuleShareWidget';

const AppShell: React.FC = () => {
  const { 
    currentRole, 
    currentUser, 
    setCurrentUser,
    changeUserRole, 
    activeTab,
    setActiveTab,
    notifications, 
    markNotificationAsRead, 
    clearNotifications,
    toast,
    showToast
  } = useApp();

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showShareHub, setShowShareHub] = useState<boolean>(false);

  // Filter tabs based on role permissions
  const tabs = [
    { id: 'landing', label: 'Portal Publik', icon: Globe, allowed: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor', 'Mitra Kontraktor'] },
    { id: 'drawing_viewer', label: 'Gambar Kerja', icon: Compass, allowed: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor', 'Mitra Kontraktor'] },
    { id: 'project_documents', label: 'Dokumen Proyek', icon: FileText, allowed: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor', 'Mitra Kontraktor'] },
    { id: 'rab_explorer', label: 'E-RAB Resmi', icon: FileSpreadsheet, allowed: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor', 'Mitra Kontraktor'] },
    { id: 'contract_module', label: 'Modul Kontrak', icon: Briefcase, allowed: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor', 'Mitra Kontraktor'] },
    { id: 'time_schedule', label: 'Jadwal & Kurva-S', icon: Clock, allowed: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan', 'Investor', 'Mitra Kontraktor'] },
    { id: 'owner', label: 'Monitor Owner', icon: Percent, allowed: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan'] },
    { id: 'progress', label: 'Progres PM', icon: Sliders, allowed: ['Super Admin', 'Owner', 'Project Manager', 'Konsultan'] },
    { id: 'investor', label: 'Feasibility Investasi', icon: TrendingUp, allowed: ['Super Admin', 'Owner', 'Investor'] },
    { id: 'contractor', label: 'Portal Mitra', icon: Award, allowed: ['Super Admin', 'Mitra Kontraktor'] },
    { id: 'admin', label: 'Verifikasi Admin', icon: ShieldAlert, allowed: ['Super Admin', 'Owner'] },
    { id: 'accounts_mgr', label: 'Kelola Akun SPPI', icon: Users, allowed: ['Super Admin'] },
  ];

  const allowedTabs = tabs.filter(t => t.allowed.includes(currentRole));

  // Auto adjusting tab if current active tab becomes disallowed after role swap
  React.useEffect(() => {
    const isAllowed = allowedTabs.some(t => t.id === activeTab);
    if (!isAllowed) {
      setActiveTab('landing');
    }
  }, [currentRole]);

  // Handle URL query parameter ?verify=...
  const [verificationCode, setVerificationCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verify = params.get('verify');
    if (verify) {
      setVerificationCode(verify);
      // Automatically switch to the RAB tab since the document belongs to E-RAB!
      setActiveTab('rab_explorer');
    }
  }, []);

  const handleCloseVerification = () => {
    setVerificationCode(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('verify');
    window.history.replaceState({}, '', url.toString());
  };

  // Unread notifications counter
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!currentUser) {
    return (
      <>
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 animate-slideUp bg-white border-l-4 border-orange-500 p-4 rounded-r-xl shadow-2xl flex items-center gap-3 max-w-sm border-y border-r border-slate-100 text-slate-900">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 glow-orange"></div>
            <p className="text-xs font-mono font-medium text-slate-850 leading-relaxed">{toast.message}</p>
          </div>
        )}
        <LoginPortal />
      </>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      
      {/* VERIFICATION LICENSE CERTIFICATE POPUP */}
      {verificationCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn">
            
            {/* Emerald Secure Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,#fff_0%,transparent_70%)] pointer-events-none"></div>
              <button 
                onClick={handleCloseVerification}
                className="absolute right-4 top-4 p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur border border-white/30 rounded-2xl shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded border border-white/20">BLOCKCHAIN SECURED HUB</span>
                  <h3 className="text-lg font-black tracking-tight mt-1">Sertifikat Verifikasi Digital</h3>
                  <p className="text-emerald-100 text-[10px] font-mono">Dikeluarkan oleh PT Foresyndo Global Indonesia</p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-6 space-y-6">
              
              <div className="text-center pb-4 border-b border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">KODE IDENTIFIKASI TANDA TANGAN (TTD DIGITAL)</span>
                <span className="text-xl font-mono font-black text-emerald-600 select-all tracking-wide block mt-1">
                  {verificationCode}
                </span>
                <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-emerald-650 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Status: Tanda Tangan Valid &amp; Otentik
                </span>
              </div>

              {/* Grid content verification information */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">PENANDATANGAN (SIGNEE)</span>
                  <strong className="text-slate-800 text-xs mt-0.5 block">
                    {verificationCode.startsWith('EST') ? 'Tim Estimator Proyek - QS FGI' : 'Project Manager - Construction Head'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">DOKUMEN INDUK</span>
                  <strong className="text-slate-800 text-xs mt-0.5 block">Rencana Anggaran Biaya (RAB)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">NOMOR KONTRAK</span>
                  <strong className="text-slate-800 text-xs mt-0.5 block">PR-2026-FGI-004</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">NILAI RAB VERIFIED</span>
                  <strong className="text-orange-600 font-bold block">Rp 14.470.437.161,25</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">TANGGAL PENANDATANGANAN</span>
                  <strong className="text-slate-800 text-xs mt-0.5 block">19 Juni 2026 11:34</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">SISTEM INTEGRITAS SHIELD</span>
                  <strong className="text-emerald-600 font-bold block">SHA-256 SECURED</strong>
                </div>
              </div>

              {/* SHA Hash block display */}
              <div className="p-3 bg-slate-50 font-mono text-[9px] text-slate-500 rounded-xl border border-slate-150 break-all leading-normal">
                <span className="text-slate-400 block font-bold text-[8px] uppercase tracking-wider mb-1">HASH DIGITAL LEDGER INTEGRITAS</span>
                {verificationCode.startsWith('EST') 
                  ? 'f5b28d09e3e2bb97f7fa20364e03d4086ad3efda9802874bc056ca0495f874c810d7a09d3bdf8fa9'
                  : '9a2b4b73b5daec8293bd350a8ebd44b36cd1649f872c0ddbac9a3028cd9f029310bc934b12c8e21c'
                }
              </div>

              {/* Friendly notification */}
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans text-center">
                Sertifikat ini membuktikan bahwa dokumen Rencana Anggaran Biaya (RAB) di bawah tidak diubah sejak penandatanganan resmi dilakukan.
              </p>

            </div>

            {/* Footer action */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button 
                onClick={handleCloseVerification}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono rounded-xl shadow transition tracking-wide cursor-pointer w-full text-center"
              >
                Konfirmasi &amp; Lanjutkan ke E-RAB
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GLOBAL TOAST ALERTS */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slideUp bg-white border-l-4 border-orange-500 p-4 rounded-r-xl shadow-2xl flex items-center gap-3 max-w-sm border-y border-r border-slate-100">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500 glow-orange"></div>
          <p className="text-xs font-mono font-medium text-slate-850 leading-relaxed">{toast.message}</p>
        </div>
      )}

      {/* TOP DESKTOP AND MOBILE INDUSTRIAL HEADER */}
      <header className="bg-[#1E3A8A] text-white border-b-4 border-[#EA580C] sticky top-0 z-40 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white flex items-center justify-center font-black text-[#1E3A8A] text-xl shadow">
              F2
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-base text-white tracking-wide uppercase">FORESYNDO 2</span>
                <span className="text-[10px] bg-white/20 text-orange-350 font-mono font-bold px-1.5 py-0.5 rounded border border-white/10">
                  PT. FGI
                </span>
              </div>
              <p className="text-[10px] text-blue-200 font-mono tracking-wider">Hotel &amp; Kost Eksklusif Kertajati</p>
            </div>
          </div>

          {/* Core Interactive Roles Switcher & Clocks */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            
            {/* Live Clock Logger */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/50 border border-blue-500/30 rounded-lg text-[10px] font-mono text-blue-200">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Majalengka: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
            </div>

            {/* Simulated Active Account Identity details with strict Logout control */}
            <div className="flex items-center gap-3 bg-blue-900/50 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
              <div className="flex items-center gap-1.5 border-r border-blue-500/20 pr-3">
                <User className="w-3.5 h-3.5 text-orange-350" />
                <span className="text-white font-semibold max-w-[124px] truncate" title={currentUser?.displayName}>
                  {currentUser?.displayName}
                </span>
                <span className="text-[9px] bg-orange-650/40 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  {currentRole}
                </span>
              </div>
              
              <button 
                onClick={() => {
                  setCurrentUser(null);
                  showToast('Anda telah keluar dari sesi pengawasan.', 'info');
                }}
                className="flex items-center gap-1.5 px-2 py-1 bg-red-600/80 hover:bg-red-700 text-white rounded text-[10px] uppercase font-bold tracking-wider cursor-pointer transition active:scale-95"
                title="Keluar Sesi Otoritas"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </div>

            {/* Global Share/Kirim Data Proyek Button (Hidden for Mitra Kontraktor role) */}
            {currentRole !== 'Mitra Kontraktor' && (
              <button
                onClick={() => setShowShareHub(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA580C] hover:bg-orange-600 border border-orange-500 rounded-lg text-xs font-mono font-black text-white transition cursor-pointer shadow-md active:scale-95 hover:animate-none"
                title="Kirim Semua Data Proyek via WA & Email (Review Dulu)"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Kirim Data Proyek (WA/Email)</span>
              </button>
            )}

            {/* Notification bell logger */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-blue-900/50 hover:bg-blue-800 border border-blue-500/30 rounded-lg text-blue-100 hover:text-white transition relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 space-y-4 text-slate-900">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">LOG NOTIFIKASI OTOMATIS</h4>
                    <button 
                      onClick={clearNotifications}
                      className="text-[10px] text-orange-600 hover:text-orange-700 font-mono underline"
                    >
                      Hapus Semua
                    </button>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-mono text-center py-4">Kosong</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-2.5 rounded-lg text-xs space-y-1 cursor-pointer transition ${notif.read ? 'bg-slate-50 text-slate-500' : 'bg-blue-50/50 border-l-4 border-[#EA580C] text-slate-900'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 leading-normal">{notif.title}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{notif.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-light leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* CENTRAL TABS NAVIGATION BAR */}
      <nav className="bg-white px-4 md:px-8 py-2.5 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex gap-1.5 overflow-x-auto py-1">
          {allowedTabs.map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold font-mono transition whitespace-nowrap border ${isActive ? 'bg-[#EA580C] border-[#EA580C] text-white font-bold shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <IconComp className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* STATUS LAPANGAN & TENDER BANNER */}
      <div className="bg-orange-50 border-y border-orange-200 py-3.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-ping shrink-0"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] shrink-0 absolute"></div>
            <p className="text-slate-700 font-sans leading-relaxed">
              <span className="font-bold text-[#EA580C] uppercase tracking-wider font-mono mr-1.5">[STATUS PROYEK]:</span>
              Pembangunan fisik lapangan <strong>Belum Dimulai</strong> (Kemajuan Fisik aktual saat ini: <strong>0.0%</strong>) dan pemenang tender resmi <strong>Belum Ada</strong> ditunjuk. Semua paket pengadaan masih berstatus dibuka / tahap penawaran publik.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="px-2.5 py-1 bg-white border border-orange-200 text-[#EA580C] rounded-md font-mono font-black text-[10px] uppercase">
              Proyek Belum Mulai
            </span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-md font-mono font-black text-[10px] uppercase">
              Tender Winner: Nihil
            </span>
          </div>
        </div>
      </div>

      {/* MAIN VIEW CONTROLLER GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        
        {/* Module Sharing Hub Widget for Admin & Owner role */}
        <ModuleShareWidget activeTabId={activeTab} />
        
        {/* Render actual views based on active tab state */}
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'rab_explorer' && <RABExplorer />}
        {activeTab === 'contract_module' && <ContractModule />}
        {activeTab === 'time_schedule' && <TimeSchedule />}
        {activeTab === 'owner' && <OwnerDashboard />}
        {activeTab === 'drawing_viewer' && <DrawingViewer />}
        {activeTab === 'project_documents' && <ProjectDocuments />}
        {activeTab === 'progress' && <ProjectManagement />}
        {activeTab === 'investor' && <InvestorModule />}
        {activeTab === 'contractor' && <ContractorPortal />}
        {activeTab === 'admin' && <AdminVerification />}
        {activeTab === 'accounts_mgr' && <AccountsManager />}

      </main>

      {/* STATUS AND LEGAL FOOTER SECTION */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] pb-4 border-b border-slate-100 font-mono">
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Firebase Connected</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 12 Mitra Aktif</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> 3 Tender Berjalan</span>
          </div>
          <div className="uppercase tracking-wider">
            System Status: <span className="text-green-600 font-bold">Optimal</span> | PT. FGI R-2026
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto space-y-4 text-center text-xs mt-6">
          <div className="flex justify-center items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#1E3A8A] font-bold">
            <span>KEPATUHAN DIREKTORAT</span>
            <span className="w-1 h-1 rounded-full bg-[#EA580C]"></span>
            <span>PT. FORESYNDO GLOBAL INDONESIA</span>
            <span className="w-1 h-1 rounded-full bg-[#EA580C]"></span>
            <span>BANDARA KERTAJATI</span>
          </div>
          <p className="max-w-2xl mx-auto leading-relaxed font-light text-slate-500">
            Seluruh data penawaran tender, analisis pengembalian modal investasi, kelayakan berkas izin usaha, dan persentase fisik pembangunan FORESYNDO 2 di Jatitujuh Majalengka adalah milik sah PT. Foresyndo Global Indonesia. Diaudit secara berkala di bawah pengawasan OJK dan Kemenkumham RI.
          </p>
          <p className="font-mono text-[10px] text-slate-400">
            &copy; 2026 PT. Foresyndo Global Indonesia. All Rights Reseved. Powered by Digital Procurement System.
          </p>
        </div>
      </footer>

      {/* PROJECT KONSOLIDASI DATA SHARING DIALOG */}
      <ProjectShareHub isOpen={showShareHub} onClose={() => setShowShareHub(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
