import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, AccountCredential } from '../types';
import { 
  ShieldAlert, 
  Key, 
  Mail, 
  Save, 
  CheckCircle,
  Eye,
  EyeOff,
  Sliders,
  Building,
  Compass,
  TrendingUp,
  Users,
  AlertTriangle,
  UserPlus,
  Trash2,
  Plus,
  Search,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';

export const AccountsManager: React.FC = () => {
  const { accounts, updateAccount, addAccount, deleteAccount, contractors, showToast } = useApp();
  
  // Navigation Tabs: Core Accounts vs Registered Contractors Creator
  const [activeSubTab, setActiveSubTab] = useState<'manage' | 'register-link'>('manage');

  // Search filter for contractors
  const [searchContractor, setSearchContractor] = useState('');

  // Creation overlay/form states
  const [selectedContractorId, setSelectedContractorId] = useState<string>('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('kontraktor2026');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Editing state keyed by the account's primary identification (email)
  const [editingEmails, setEditingEmails] = useState<Record<string, string>>({});
  const [editingPasswords, setEditingPasswords] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [unsavedAccounts, setUnsavedAccounts] = useState<Record<string, boolean>>({});

  // Sync editing state when accounts list updates
  useEffect(() => {
    const freshEmails: Record<string, string> = {};
    const freshPasswords: Record<string, string> = {};
    accounts.forEach(acc => {
      freshEmails[acc.email] = acc.email;
      freshPasswords[acc.email] = acc.password;
    });
    setEditingEmails(freshEmails);
    setEditingPasswords(freshPasswords);
  }, [accounts]);

  const handleFieldChange = (originalEmail: string, value: string, field: 'email' | 'password') => {
    if (field === 'email') {
      setEditingEmails(prev => ({ ...prev, [originalEmail]: value }));
    } else {
      setEditingPasswords(prev => ({ ...prev, [originalEmail]: value }));
    }

    // Check if differs from original stored account value
    const orig = accounts.find(a => a.email.toLowerCase() === originalEmail.toLowerCase());
    if (orig) {
      const curEmail = field === 'email' ? value : (editingEmails[originalEmail] || originalEmail);
      const curPass = field === 'password' ? value : (editingPasswords[originalEmail] || orig.password);
      const isChanged = orig.email !== curEmail || orig.password !== curPass;
      setUnsavedAccounts(prev => ({ ...prev, [originalEmail]: isChanged }));
    }
  };

  const handleSaveAccount = (acc: AccountCredential) => {
    const newEmailValue = editingEmails[acc.email]?.trim() || acc.email;
    const newPasswordValue = editingPasswords[acc.email]?.trim() || acc.password;

    if (!newEmailValue || !newPasswordValue) {
      showToast('Surel dan sandi tidak boleh kosong.', 'error');
      return;
    }

    if (!newEmailValue.includes('@')) {
      showToast('Format surel tidak valid.', 'error');
      return;
    }

    if (newPasswordValue.length < 4) {
      showToast('Sandi minimal harus terdiri dari 4 karakter.', 'error');
      return;
    }

    // Update global state & persistence
    updateAccount(acc.role, newEmailValue, newPasswordValue, acc.representative);
    setUnsavedAccounts(prev => ({ ...prev, [acc.email]: false }));
    showToast(`Otoritas login untuk [${acc.representative}] berhasil diperbarui!`, 'success');
  };

  const handleDeleteAccount = (acc: AccountCredential) => {
    // Super Admin & Owner cannot be deleted to prevent locking out
    if (acc.role === 'Super Admin' || acc.role === 'Owner') {
      showToast('Akun administratif utama tidak dapat dihapus demi keamanan.', 'error');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun login untuk "${acc.representative}"?`)) {
      deleteAccount(acc.email);
      showToast(`Akun login untuk "${acc.representative}" telah dihapus.`, 'info');
    }
  };

  const handleCreateContractorAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractorId) {
      showToast('Silakan pilih mitra kontraktor terlebih dahulu.', 'error');
      return;
    }

    const contr = contractors.find(c => c.id === selectedContractorId);
    if (!contr) return;

    const emailVal = newEmail.trim();
    const passVal = newPassword.trim();

    if (!emailVal || !passVal) {
      showToast('Surel dan sandi tidak boleh kosong.', 'error');
      return;
    }

    if (!emailVal.includes('@')) {
      showToast('Format surel tidak valid.', 'error');
      return;
    }

    if (passVal.length < 4) {
      showToast('Sandi minimal harus terdiri dari 4 karakter.', 'error');
      return;
    }

    // Check if email already used by anyone
    if (accounts.some(a => a.email.toLowerCase() === emailVal.toLowerCase())) {
      showToast('Surel ini sudah terdaftar sebagai akun login aktif lain.', 'error');
      return;
    }

    const newAcc: AccountCredential = {
      role: 'Mitra Kontraktor',
      title: 'Mitra Kontraktor / Vendor',
      representative: contr.companyName,
      email: emailVal,
      password: passVal
    };

    addAccount(newAcc);
    showToast(`Akun login untuk "${contr.companyName}" berhasil didaftarkan!`, 'success');

    // Reset form
    setSelectedContractorId('');
    setNewEmail('');
    setNewPassword('kontraktor2026');
  };

  const handleSelectContractorForAcc = (id: string) => {
    const contr = contractors.find(c => c.id === id);
    if (contr) {
      setSelectedContractorId(id);
      setNewEmail(contr.email);
    }
  };

  const togglePasswordVisibility = (email: string) => {
    setVisiblePasswords(prev => ({ ...prev, [email]: !prev[email] }));
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Owner': return Building;
      case 'Super Admin': return ShieldAlert;
      case 'Project Manager': return Sliders;
      case 'Konsultan': return Compass;
      case 'Investor': return TrendingUp;
      case 'Mitra Kontraktor': return Users;
      default: return Users;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'border-l-red-600 bg-red-50/5';
      case 'Owner': return 'border-l-orange-500 bg-orange-50/5';
      case 'Project Manager': return 'border-l-blue-600 bg-blue-50/5';
      case 'Konsultan': return 'border-l-indigo-600 bg-indigo-50/5';
      case 'Investor': return 'border-l-emerald-600 bg-emerald-50/5';
      case 'Mitra Kontraktor': return 'border-l-purple-600 bg-purple-50/5';
      default: return 'border-l-slate-400';
    }
  };

  const getBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'bg-red-100 text-red-800';
      case 'Owner': return 'bg-orange-100 text-orange-800';
      case 'Project Manager': return 'bg-blue-100 text-blue-800';
      case 'Konsultan': return 'bg-indigo-100 text-indigo-805';
      case 'Investor': return 'bg-emerald-100 text-emerald-800';
      case 'Mitra Kontraktor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Filter contractors based on search term
  const filteredContractors = contractors.filter(c => 
    c.companyName.toLowerCase().includes(searchContractor.toLowerCase()) ||
    c.directorName.toLowerCase().includes(searchContractor.toLowerCase()) ||
    c.email.toLowerCase().includes(searchContractor.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Intro Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/20 text-red-200 border border-red-550/30 rounded-full text-[10px] font-mono leading-none tracking-widest uppercase font-bold">
              <ShieldAlert className="w-3 h-3 animate-pulse" /> 
              Super Admin Console
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">Manajemen Otoritas &amp; Pendaftar Mitra</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-3xl font-light">
              Protokol kepatuhan internal PT. FGI menerangkan pendelegasian verifikasi login untuk Super Admin. Mendaftarkan mitra kontraktor yang sudah mengajukan berkas registrasi, menyetel email pribadi, dan mengunci sandi aman tanpa dipublikasikan ke halaman login utama.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end justify-center bg-slate-800/60 px-4 py-3 border border-slate-750 rounded-2xl shrink-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider font-bold">Keamanan Saluran</span>
            <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest mt-1">SSL 256-Bit Secured</span>
          </div>
        </div>
      </div>

      {/* SUB-TABS INTERFACES */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveSubTab('manage')}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition -mb-px flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'manage'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Kredensial Login Aktif ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('register-link')}
          className={`px-5 py-3 text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition -mb-px flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'register-link'
              ? 'border-[#EA580C] text-[#EA580C]'
              : 'border-transparent text-slate-500 hover:text-slate-855'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Mitra Terdaftar &amp; Buat Akun ({contractors.length})</span>
        </button>
      </div>

      {/* --- TAB 1: MANAGE PORTAL ACTIVE LOGIN CREDENTIALS --- */}
      {activeSubTab === 'manage' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">Integrasi Keamanan Kredensial:</strong>
              Segala pembaruan surel dan sandi login disimpan secara aman pada database lokal. Pengadaan akun login baru bagi Mitra Kontraktor yang mendaftar dilakukan secara manual dari tab sebelah untuk memverifikasi entitas sebelum diberikan kunci otorisasi.
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {accounts.map((acc, index) => {
              const Icon = getRoleIcon(acc.role);
              const originalEmail = acc.email;
              const currentEmailInInput = editingEmails[originalEmail] ?? originalEmail;
              const currentPasswordInInput = editingPasswords[originalEmail] ?? acc.password;
              
              const isUnsaved = unsavedAccounts[originalEmail];
              const hasVisiblePass = visiblePasswords[originalEmail] ?? false;

              // Check if this account is a custom created Contractor account
              const isDeletable = acc.role === 'Mitra Kontraktor';

              return (
                <div 
                  key={`${acc.email}_${index}`}
                  className={`bg-white rounded-2xl border-l-4 border border-y-slate-200 border-r-slate-200 p-5 shadow-sm space-y-4 transition-all duration-200 ${getRoleColor(acc.role)} ${
                    isUnsaved ? 'ring-2 ring-amber-400 shadow-md' : 'hover:shadow-md'
                  }`}
                >
                  {/* Header Card */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`p-2.5 rounded-xl border ${isUnsaved ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-black uppercase tracking-wider inline-block mb-1 ${getBadgeColor(acc.role)}`}>
                          {acc.role}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 truncate max-w-xs" title={acc.title}>{acc.title}</h3>
                        <p className="text-[11px] text-slate-500 font-mono tracking-tight text-ellipsis overflow-hidden max-w-[200px]" title={acc.representative}>
                          {acc.representative}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 items-center">
                      {isUnsaved ? (
                        <span className="text-[9px] bg-amber-100 border border-amber-300 text-amber-850 font-mono font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                          Belum Simpan
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Simpan</span>
                        </span>
                      )}

                      {isDeletable && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc)}
                          className="p-1 px-1.5 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 border border-red-200 rounded text-xs cursor-pointer transition"
                          title="Hapus Akun Mitra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>Surel Otoritas</span>
                      </div>
                      <input
                        type="email"
                        value={currentEmailInInput}
                        onChange={(e) => handleFieldChange(originalEmail, e.target.value, 'email')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:bg-white focus:border-orange-500 outline-none transition"
                        placeholder="surel@foresyndo.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Sandi Rahasia</span>
                      </div>
                      <div className="relative">
                        <input
                          type={hasVisiblePass ? 'text' : 'password'}
                          value={currentPasswordInInput}
                          onChange={(e) => handleFieldChange(originalEmail, e.target.value, 'password')}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-1.5 text-xs font-mono text-slate-800 focus:bg-white focus:border-orange-500 outline-none transition"
                          placeholder="Masukkan sandi baru"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(originalEmail)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                        >
                          {hasVisiblePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save button panel */}
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSaveAccount(acc)}
                      className={`px-3 py-1.5 border rounded-lg text-[11px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                        isUnsaved 
                          ? 'bg-amber-500 hover:bg-amber-600 border-amber-400 text-white shadow-sm' 
                          : 'bg-slate-50 text-slate-450 border-slate-200 hover:bg-slate-100 hover:text-slate-750'
                      }`}
                    >
                      <Save className="w-3 h-3" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: LINK REGISTERED PARTNERS AND ADD CREDENTIALS --- */}
      {activeSubTab === 'register-link' && (
        <div className="grid lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          {/* Form Create Credentials Left Column */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm sticky top-4">
            <div className="space-y-1.5">
              <span className="text-[10px] bg-purple-100 text-purple-700 border border-purple-250 px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider inline-block">
                Pembuat Kunci Portal
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase">Tambah Akun Kontraktor Terdaftar</h3>
              <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                Silakan pilih dari berkas / database pendaftaran kontraktor di sebelah kanan. Sistem akan membaca profil legalitas mereka untuk dibuatkan gerbang login tersendiri sehingga mereka bisa masuk ke Portal Mitra Kontraktor.
              </p>
            </div>

            <form onSubmit={handleCreateContractorAccount} className="space-y-3.5 pt-2">
              {/* SELECTOR */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Pilih Mitra Terdaftar:</label>
                <select
                  value={selectedContractorId}
                  onChange={(e) => handleSelectContractorForAcc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-850 focus:bg-white focus:ring-0 outline-none focus:border-purple-650 transition cursor-pointer"
                  required
                >
                  <option value="">-- Silakan Pilih Kontraktor --</option>
                  {contractors.map(c => {
                    const hasAcc = accounts.some(a => a.representative.toLowerCase() === c.companyName.toLowerCase() || a.email.toLowerCase() === c.email.toLowerCase());
                    return (
                      <option key={c.id} value={c.id}>
                        {c.companyName} {hasAcc ? ' (Sudah Punya Akun)' : ' (Butuh Akun)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedContractorId && (
                <>
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-1.5">
                    <div className="flex gap-1.5 text-[11px] text-blue-900 font-bold items-center">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      <span>Data Perusahaan Registrasi</span>
                    </div>
                    {(() => {
                      const sel = contractors.find(c => c.id === selectedContractorId);
                      if (!sel) return null;
                      return (
                        <div className="text-[10px] text-slate-600 space-y-1 list-none font-mono">
                          <li>&bull; Direktur: <span className="text-slate-800 font-bold">{sel.directorName}</span></li>
                          <li>&bull; Surat SBU: <span className="text-slate-800 font-bold">{sel.sbu}</span></li>
                          <li>&bull; Klasifikasi: <span className="text-slate-800 font-bold">{sel.qualification}</span></li>
                          <li>&bull; Verifikasi: <span className="text-emerald-700 font-bold">{sel.verificationStatus}</span></li>
                        </div>
                      );
                    })()}
                  </div>

                  {/* EDIT EMAIL PREFILL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ID Surel Aktif (E-Mail)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono text-slate-800 focus:bg-white focus:border-purple-650 outline-none transition"
                        required
                        placeholder="partner@sejahtera.com"
                      />
                    </div>
                  </div>

                  {/* CHOOSE PASSWORD */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Setel Sandi Login</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-xs font-mono text-slate-800 focus:bg-white focus:border-purple-650 outline-none transition"
                        required
                        placeholder="Sandi login aman"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-605 hover:bg-purple-700 bg-purple-600 text-white rounded-xl text-xs font-mono font-bold tracking-tight transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Daftarkan Kredensial Login</span>
                  </button>
                </>
              )}

              {!selectedContractorId && (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-[11px] text-slate-400 leading-normal">
                  <Info className="w-5 h-5 mx-auto text-slate-350 mb-1.5" />
                  Pilih salah satu mitra kontraktor terdaftar di database untuk memicu instansiasi kredensial.
                </div>
              )}
            </form>
          </div>

          {/* Database Grid Right Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari kontraktor pendaftar..."
                  value={searchContractor}
                  onChange={(e) => setSearchContractor(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 p-2.5 pl-9 rounded-lg border border-slate-200 text-xs outline-none focus:border-purple-600 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredContractors.length === 0 ? (
                <div className="p-10 text-center bg-white border rounded-2xl text-slate-400 text-xs">
                  Tidak ada mitra pendaftar yang cocok.
                </div>
              ) : (
                filteredContractors.map((c) => {
                  const activeAcc = accounts.find(a => a.representative.toLowerCase() === c.companyName.toLowerCase() || a.email.toLowerCase() === c.email.toLowerCase());

                  return (
                    <div 
                      key={c.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{c.companyName}</h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono ${
                            c.qualification === 'Besar' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {c.qualification}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                          <div>Direct: {c.directorName} &bull; Surel: {c.email}</div>
                          <div>SBU: {c.sbu} &bull; Legal: Score {c.legalScore}% &bull; Verifikasi: <span className="text-emerald-600 font-bold">{c.verificationStatus}</span></div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {activeAcc ? (
                          <div className="p-2 sm:px-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-2 text-left">
                            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                            <div className="font-mono text-[9px]">
                              <span className="text-purple-800 font-bold block">AKUN PORTAL AKTIF</span>
                              <span className="text-slate-500 block truncate max-w-[130px]">{activeAcc.email}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectContractorForAcc(c.id)}
                            className="w-full sm:w-auto px-3.5 py-2 bg-[#EA580C] hover:bg-orange-600 text-white font-mono font-bold text-[10px] rounded-lg tracking-tight uppercase flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Buat Akun Portal</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
