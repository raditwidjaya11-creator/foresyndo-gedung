import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Building, 
  ShieldAlert, 
  Sliders, 
  Compass, 
  TrendingUp, 
  Users, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const { accounts, setCurrentUser, changeUserRole, showToast } = useApp();
  
  // Selection state
  const [selectedRole, setSelectedRole] = useState<UserRole>('Owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeNda, setAgreeNda] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role details metadata for selection listing
  const rolesInfo = [
    {
      role: 'Owner' as UserRole,
      title: 'Direksi Owner PT. FGI',
      representative: 'PT. Foresyndo Global Indonesia',
      icon: Building,
      badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
      accentColor: '#EA580C',
      description: 'Akses penuh ke cash flow proyek, persetujuan klaim termin vendor, analisis investasi, dan data kurva-S.'
    },
    {
      role: 'Super Admin' as UserRole,
      title: 'Super Admin (Lead Auditor)',
      representative: 'Radit Widjaya',
      icon: ShieldAlert,
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      accentColor: '#DC2626',
      description: 'Otoritas tertinggi audit sistem. Mengelola verifikasi legalitas mitra kontraktor dan seluruh log parameter.'
    },
    {
      role: 'Project Manager' as UserRole,
      title: 'Project Manager (PM Lapangan)',
      representative: 'Budi Santoso',
      icon: Sliders,
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      accentColor: '#2563EB',
      description: 'Mengelola persentase progres fisik harian, mengunggah dokumentasi material, dan mengontrol S-curve schedule.'
    },
    {
      role: 'Konsultan' as UserRole,
      title: 'Konsultan Pengawas',
      representative: 'ArchiPlan Specialist',
      icon: Compass,
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      accentColor: '#4F46E5',
      description: 'Melakukan peninjauan struktur sipil & MEP, memberikan verifikasi progres lapangan untuk termin pencairan.'
    },
    {
      role: 'Investor' as UserRole,
      title: 'Investor FORESYNDO 2',
      representative: 'H. Sulaiman',
      icon: TrendingUp,
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      accentColor: '#059669',
      description: 'Meninjau analisis kelayakan finansial (Feasibility Study), proyeksi dividen bulanan, dan progres pencapaian target.'
    },
    {
      role: 'Mitra Kontraktor' as UserRole,
      title: 'Mitra Kontraktor / Vendor',
      representative: 'PT. Karya Sejahtera Abadi',
      icon: Users,
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      accentColor: '#7C3AED',
      description: 'Mengajukan dokumen portfolio kualifikasi tender, mengajukan klaim termin tagihan, dan mengunduh berkas e-RAB.'
    }
  ];

  // Quick pre-filler selects the active role mode to login to
  const selectQuickRole = (info: typeof rolesInfo[0]) => {
    setSelectedRole(info.role);
    // Erase input values upon selecting a different card so user must enter them manually
    setEmail('');
    setPassword('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeNda) {
      showToast('Anda harus menyetujui Pakta Integritas NDA untuk masuk.', 'error');
      return;
    }

    setIsSubmitting(true);

    // Realistic network lag simulation
    setTimeout(() => {
      // Find matching credentials inside the live accounts state
      const matched = accounts.find(r => r.role === selectedRole && r.email.toLowerCase() === email.trim().toLowerCase() && r.password === password);

      if (matched) {
        let companyName: string | undefined = undefined;
        if (selectedRole === 'Mitra Kontraktor') {
          companyName = matched.representative;
        }

        // Set the current authenticated profile onto global states
        setCurrentUser({
          uid: `${selectedRole.toLowerCase().replace(' ', '_')}_user_888`,
          email: matched.email,
          displayName: matched.representative,
          role: selectedRole,
          companyName
        });
        
        changeUserRole(selectedRole);
        showToast(`Selamat datang kembali di sistem SPPI, ${matched.representative}!`, 'success');
      } else {
        showToast('Autentikasi gagal! Periksa kembali surel dan sandi peran terpilih.', 'error');
      }
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-5xl w-full bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl grid lg:grid-cols-12">
        
        {/* LEFT COMPONENT: DIRECTORY SELECTOR */}
        <div className="lg:col-span-7 p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#EA580C] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/20">
                F2
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase">Sistem Pengawasan Terintegrasi</h1>
                <p className="text-[11px] text-[#EA580C] font-mono font-bold tracking-wider">PROJECT FORESYNDO 2 &bull; PT. FORESYNDO GLOBAL INDONESIA</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-light mt-3 leading-relaxed">
              Selamat datang di Gerbang Otentikasi Tunggal SPPI (Sistem Pengawasan &amp; Procurement Intelligent). Silakan pilih salah satu Peran Resmi Proyek di bawah untuk melakukan simulasi login. Antar-peran dipisahkan secara ketat demi keamanan data finansial.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider block uppercase">Authorized Project Roles Checklist</span>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {rolesInfo.map((info) => {
                const Icon = info.icon;
                const isSelected = selectedRole === info.role;
                return (
                  <button
                    key={info.role}
                    type="button"
                    onClick={() => selectQuickRole(info)}
                    className={`p-3.5 text-left rounded-2xl border transition-all duration-250 flex flex-col justify-between h-32 relative overflow-hidden group cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800/90 border-[#EA580C] shadow-lg shadow-orange-500/5' 
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/40'
                    }`}
                  >
                    {/* Background subtle glow overlay */}
                    {isSelected && (
                      <span className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-xl pointer-events-none"></span>
                    )}

                    <div className="flex justify-between items-start w-full">
                      <span className={`p-2.5 rounded-xl border transition ${
                        isSelected ? 'bg-orange-500 text-white border-orange-400' : 'bg-slate-800 text-slate-350 border-slate-750'
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </span>
                      {isSelected ? (
                        <span className="text-[9px] font-mono font-bold bg-[#EA580C] text-white px-2 py-0.5 rounded border border-orange-400">AKTIF</span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-400">Pilih Peran</span>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-white transition">{info.title}</span>
                      <span className="text-[10px] text-slate-450 block truncate font-mono">{info.representative}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/60 space-y-2">
            <div className="flex gap-2 text-slate-300">
              <Info className="w-4.5 h-4.5 text-[#EA580C] shrink-0 mt-0.5" />
              <strong className="text-xs font-bold">Deskripsi Peran Terpilih: {selectedRole}</strong>
            </div>
            <p className="text-[11px] text-slate-400 font-light leading-relaxed pl-65">
              {rolesInfo.find(r => r.role === selectedRole)?.description}
            </p>
          </div>
        </div>

        {/* RIGHT COMPONENT: TERMINAL LOGIN FORM */}
        <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-slate-950/40">
          
          <div className="space-y-6 my-auto">
            <div className="text-center lg:text-left space-y-1">
              <span className="text-[10px] font-mono font-black tracking-widest text-[#EA580C] uppercase block">
                OTENTIKASI ENKRIPSI SHIELD
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Login Portal Kerja</h2>
              <p className="text-xs text-slate-500 font-light">Masukkan sandi otorisasi yang telah dibagikan resmi oleh Direksi PT. FGI.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* EMAIL FIELD */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ID Surel Resmi / Email</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="nama@alamat.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-650 outline-none focus:border-[#EA580C] focus:bg-slate-900/80 transition font-mono"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Kata Sandi Rahasia</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-650 outline-none focus:border-[#EA580C] focus:bg-slate-900/80 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* SECURITY KEY INDICATOR (Realistic extra security) */}
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                  <span className="text-slate-400 text-[10px]">PASSCODE SECURITY:</span>
                </div>
                <span className="text-emerald-400 font-bold tracking-widest text-[11px]">ACTIVE &bull; 2026</span>
              </div>

              {/* NDA CHECKBOX */}
              <label className="flex items-start gap-2.5 text-slate-400 text-[10px] leading-relaxed select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeNda}
                  onChange={(e) => setAgreeNda(e.target.checked)}
                  className="rounded border-slate-800 text-orange-600 focus:ring-0 focus:ring-offset-0 bg-slate-900 mt-0.5 cursor-pointer w-3.5 h-3.5"
                />
                <span>
                  Saya menyetujui <strong>Pakta Kerahasiaan Sektoral (NDA)</strong> PT. FGI. Pengaksesan sistem diawasi &amp; dicatat IP address secara elektronik.
                </span>
              </label>

              {/* PROCEED BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#EA580C] hover:bg-orange-600 disabled:bg-slate-800 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-orange-500/10 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span>Mengecek Kunci...</span>
                ) : (
                  <>
                    <span>Masuk Portal Kerja</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center font-mono text-[9px] text-slate-600 pt-6 border-t border-slate-900/80 mt-6 select-none">
            IP SECURED &bull; SSL 256-BIT ENCRYPTION &bull; PT. FGI
          </div>

        </div>

      </div>
    </div>
  );
};
