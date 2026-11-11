import React, { useState } from 'react';
import { PentadbirUser, PENTADBIR_PRESETS } from '../types/auth';
import {
  ShieldCheck,
  UserCheck,
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  PenTool,
  Lock,
  Building,
  School,
} from 'lucide-react';

interface LoginPentadbirProps {
  onLoginSuccess: (user: PentadbirUser) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const REQUIRED_PASSWORD_SMK_BANGGI = 'XEA5021';

export const LoginPentadbir: React.FC<LoginPentadbirProps> = ({
  onLoginSuccess,
  onCancel,
  isModal = false,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PENTADBIR_PRESETS[0].id);
  const [customNama, setCustomNama] = useState('');
  const [customJawatan, setCustomJawatan] = useState('Penolong Kanan Pentadbiran (PK1)');
  const [customEmel, setCustomEmel] = useState('g-87247896@moe-dl.edu.my');
  const [customPeranan, setCustomPeranan] = useState<'Pengetua' | 'Penolong Kanan' | 'GKMP' | 'Ketua Panitia' | 'Pencerap'>('Penolong Kanan');
  const [useCustom, setUseCustom] = useState(false);
  
  // Password State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetSelect = (preset: PentadbirUser) => {
    setSelectedPresetId(preset.id);
    setUseCustom(false);
    setPasswordError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    const trimmedPassword = password.trim().toUpperCase();

    // Enforce SMK Banggi exclusive password: XEA5021
    if (trimmedPassword !== REQUIRED_PASSWORD_SMK_BANGGI) {
      setPasswordError('Kata laluan keselamatan tidak tepat! Sila masukkan kata laluan rasmi yang sah.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let loggedUser: PentadbirUser;

      if (useCustom) {
        loggedUser = {
          id: `user-${Date.now()}`,
          nama: customNama.trim() || 'Pentadbir SMK Banggi',
          jawatan: customJawatan,
          emel: customEmel.trim() || 'pentadbir.xea6062@moe-dl.edu.my',
          kodSekolah: 'XEA6062',
          namaSekolah: 'SMK BANGGI, KUDAT',
          peranan: customPeranan,
          tarikhDaftarTT: new Date().toISOString().split('T')[0],
        };
      } else {
        const found = PENTADBIR_PRESETS.find((p) => p.id === selectedPresetId);
        loggedUser = found ? { ...found } : { ...PENTADBIR_PRESETS[0] };
      }

      // Check if existing saved signature in localStorage for this user email/id
      const savedSignatureKey = `smk_banggi_tt_${loggedUser.id}`;
      const savedTT = localStorage.getItem(savedSignatureKey);
      if (savedTT) {
        loggedUser.tandatanganDigital = savedTT;
      }

      // Save authenticated session token & current user
      localStorage.setItem('smk_banggi_auth_token', REQUIRED_PASSWORD_SMK_BANGGI);
      localStorage.setItem('smk_banggi_current_user', JSON.stringify(loggedUser));

      setIsLoading(false);
      onLoginSuccess(loggedUser);
    }, 350);
  };


  return (
    <div className={`w-full ${isModal ? 'max-w-xl mx-auto' : 'min-h-[90vh] flex items-center justify-center py-8 px-4 sm:px-6'}`}>
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all">
        {/* Header with Official School Crest & KPM Royal Navy Theme */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border-2 border-amber-400/80 shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-50">
                <img
                  src="./assets/aistudio/Logo_SMK_Banggi_c52e1e56.png"
                  alt="Lencana SMK Banggi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                    SMK BANGGI SAHAJA
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-md">
                    PPD KUDAT • SABAH
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Portal e-Pencerapan ISPPK 2027
                </h2>
                <p className="text-xs text-indigo-200 mt-0.5 font-medium">
                  SMK Banggi, Kudat, Sabah • <em>"Berilmu dan Berakhlak"</em>
                </p>
              </div>
            </div>

            {isModal && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                ✕ Tutup
              </button>
            )}
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="bg-amber-500/10 border-b border-amber-400/20 px-6 py-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">
              Akses terhad untuk warga & pentadbir <strong>SMK Banggi sahaja</strong>.
            </span>
          </div>
          <span className="text-[10px] font-semibold bg-amber-200/60 text-amber-950 px-2.5 py-0.5 rounded-full">
            Akses Terkawal
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          {/* Section 1: Observer / Administrator Profile Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                1. Pilih Pentadbir / Pencerap Sekolah:
              </label>
              <button
                type="button"
                onClick={() => {
                  setUseCustom(!useCustom);
                  setPasswordError('');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {useCustom ? '← Pilih dari Senarai Pentadbir' : '+ Masuk Pentadbir Lain'}
              </button>
            </div>

            {!useCustom ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PENTADBIR_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  const hasStoredTT = !!localStorage.getItem(`smk_banggi_tt_${preset.id}`);
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all relative ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/90 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {preset.nama.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              {preset.nama}
                            </span>
                            <span className="text-[10px] text-indigo-700 font-medium block">
                              {preset.jawatan}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
                        <span className="font-mono truncate max-w-[130px]">{preset.emel}</span>
                        {hasStoredTT && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <PenTool className="w-2.5 h-2.5" /> TT Ada
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Custom Administrator Entry */
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Penuh Pentadbir / Pencerap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customNama}
                    onChange={(e) => setCustomNama(e.target.value)}
                    placeholder="Cth: Cikgu Mohd Ali bin Kassim"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jawatan Pentadbir <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={customJawatan}
                      onChange={(e) => setCustomJawatan(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Pengetua">Pengetua</option>
                      <option value="Penolong Kanan Pentadbiran (PK1)">Penolong Kanan Pentadbiran (PK1)</option>
                      <option value="Penolong Kanan HEM">Penolong Kanan HEM</option>
                      <option value="Penolong Kanan Kokurikulum">Penolong Kanan Kokurikulum</option>
                      <option value="Guru Kanan Mata Pelajaran (GKMP) Sains & Matematik">GKMP Sains & Matematik</option>
                      <option value="Guru Kanan Mata Pelajaran (GKMP) Bahasa">GKMP Bahasa</option>
                      <option value="Guru Kanan Mata Pelajaran (GKMP) Kemanusiaan">GKMP Kemanusiaan</option>
                      <option value="Guru Kanan Mata Pelajaran (GKMP) Teknik & Vokasional">GKMP Teknik & Vokasional</option>
                      <option value="Ketua Panitia">Ketua Panitia</option>
                      <option value="Pegawai SISC+ PPD Kudat">Pegawai SISC+ PPD Kudat</option>
                      <option value="Nazir Sekolah">Nazir Sekolah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Emel Rasmi KPM / DELIMa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmel}
                      onChange={(e) => setCustomEmel(e.target.value)}
                      placeholder="g-xxxxxxxx@moe-dl.edu.my"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                2. Kata Laluan Keselamatan <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Masukkan kata laluan keselamatan SMK Banggi"
                className={`w-full pl-3.5 pr-10 py-3 text-sm bg-white border rounded-xl font-mono focus:ring-2 transition-all ${
                  passwordError
                    ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/20'
                    : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'Sembunyikan Kata Laluan' : 'Papar Kata Laluan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Sila masukkan kata laluan keselamatan rasmi yang ditetapkan</span>
              <span className="text-slate-400 font-medium">Bukan sensitif huruf</span>
            </div>
          </div>

          {/* Error Message if Password Incorrect */}
          {passwordError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Akses Ditolak:</span>
                <span>{passwordError}</span>
              </div>
            </div>
          )}

          {/* Verification Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-700 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-0.5">
                Pengesahan Akses Sekolah (SMK Banggi)
              </span>
              Sistem ini menyimpan skor pencerapan bilik darjah ISPPK 2027 terus ke pangkalan data sekolah secara automatik serta membolehkan tandatangan digital (TT) pencerap.
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengesahkan Kata Laluan SMK Banggi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Log Masuk Pentadbir SMK Banggi</span>
                </>
              )}
            </button>

            <div className="mt-3 text-center">
              <span className="text-[11px] text-slate-400">
                SMK Banggi, Kudat, Sabah • Portal Rasmi Pencerapan ISPPK 2027
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
