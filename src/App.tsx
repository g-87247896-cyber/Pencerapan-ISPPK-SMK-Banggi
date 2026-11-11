import React, { useState, useEffect } from 'react';
import { PencerapanRecord } from './types/isppk';
import { PentadbirUser, PENTADBIR_PRESETS } from './types/auth';
import { BorangPencerapan } from './components/BorangPencerapan';
import { SenaraiPencerapan } from './components/SenaraiPencerapan';
import { DashboardStatistik } from './components/DashboardStatistik';
import { ReportingDashboard } from './components/ReportingDashboard';
import { PanduanRubrikView } from './components/PanduanRubrikView';
import { CetakInstrumenRasmi } from './components/CetakInstrumenRasmi';
import { ModalKongsiRumusan } from './components/ModalKongsiRumusan';
import { LoginPentadbir } from './components/LoginPentadbir';
import { ModalProfilPentadbir } from './components/ModalProfilPentadbir';
import { UploadTandatanganDigital } from './components/UploadTandatanganDigital';
import { GitHubBackendConfig } from './components/GitHubBackendConfig';
import { apiService } from './services/api';
import {
  FileEdit,
  Database,
  BarChart3,
  BookOpen,
  PlusCircle,
  Wifi,
  WifiOff,
  ShieldCheck,
  School,
  ExternalLink,
  PenTool,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  LogOut,
  ChevronDown,
  LogIn,
  Lock,
  Github,
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'borang' | 'senarai' | 'statistik' | 'tt-digital' | 'github' | 'panduan' | 'login'>('borang');
  const [editingRecord, setEditingRecord] = useState<PencerapanRecord | null>(null);
  const [printingRecord, setPrintingRecord] = useState<PencerapanRecord | null>(null);
  const [sharingRecord, setSharingRecord] = useState<PencerapanRecord | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Authentication Gate State - Gated by SMK Banggi exclusive password (XEA5021)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const token = localStorage.getItem('smk_banggi_auth_token');
      return token === 'XEA5021';
    } catch {
      return false;
    }
  });

  // Current Logged In Observer/Administrator
  const [currentUser, setCurrentUser] = useState<PentadbirUser | null>(() => {
    try {
      const saved = localStorage.getItem('smk_banggi_current_user');
      if (saved) {
        const parsed: PentadbirUser = JSON.parse(saved);
        const savedTT = localStorage.getItem(`smk_banggi_tt_${parsed.id}`);
        if (savedTT) {
          parsed.tandatanganDigital = savedTT;
        }
        return parsed;
      }
    } catch {}
    // Default to Penolong Kanan Pentadbiran (PK1) preset
    return PENTADBIR_PRESETS[0];
  });

  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdateSignature = (signatureUrl: string) => {
    if (!currentUser) return;
    const updatedUser: PentadbirUser = {
      ...currentUser,
      tandatanganDigital: signatureUrl,
      tarikhDaftarTT: new Date().toISOString().split('T')[0],
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('smk_banggi_current_user', JSON.stringify(updatedUser));
    if (signatureUrl) {
      localStorage.setItem(`smk_banggi_tt_${currentUser.id}`, signatureUrl);
    } else {
      localStorage.removeItem(`smk_banggi_tt_${currentUser.id}`);
    }
  };

  const handleLoginSuccess = (user: PentadbirUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    if (activeView === 'login') {
      setActiveView('borang');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smk_banggi_auth_token');
    setIsAuthenticated(false);
    setShowSignatureModal(false);
    setShowLoginModal(false);
  };

  const handleSelectRecordForEdit = (record: PencerapanRecord) => {
    setEditingRecord(record);
    setActiveView('borang');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrintRecord = (record: PencerapanRecord) => {
    setPrintingRecord(record);
  };

  const handleOpenShare = (record: PencerapanRecord) => {
    setSharingRecord(record);
  };

  const handleNewRecord = () => {
    setEditingRecord(null);
    setActiveView('borang');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavedRecord = (saved: PencerapanRecord) => {
    setEditingRecord(saved);
  };

  const handleViewTeacherObservation = async (recordId: string) => {
    const record = await apiService.getPencerapanById(recordId);
    if (record) {
      setEditingRecord(record);
      setActiveView('borang');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If in print / preview mode
  if (printingRecord) {
    return (
      <>
        <CetakInstrumenRasmi
          record={printingRecord}
          onBack={() => setPrintingRecord(null)}
          onShareSummary={handleOpenShare}
        />
        {sharingRecord && (
          <ModalKongsiRumusan
            record={sharingRecord}
            onClose={() => setSharingRecord(null)}
          />
        )}
      </>
    );
  }

  // --- DEDICATED LOGIN GATE FOR SMK BANGGI ONLY (PASSWORD: XEA5021) ---
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans antialiased text-slate-800">
        {/* Simple Ministry/School Banner */}
        <header className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-md border-b border-indigo-950 py-3.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 border-2 border-amber-400/80 shadow-md flex items-center justify-center flex-shrink-0">
                <img
                  src="./assets/aistudio/Logo_SMK_Banggi_c52e1e56.png"
                  alt="Lencana SMK Banggi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    e-Pencerapan ISPPK 2027
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950 shadow-xs">
                    SMK BANGGI SAHAJA
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  SMK Banggi, Kudat, Sabah • Portal Pengesahan Pentadbir & Pencerap
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold bg-white/10 text-slate-200 border border-white/20 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                Akses Terhad Sekolah
              </span>
            </div>
          </div>
        </header>

        {/* Login Form Container */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
          <LoginPentadbir onLoginSuccess={handleLoginSuccess} />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div>
              Sistem e-Pencerapan ISPPK 2027 • <strong>SMK Banggi, Kudat, Sabah</strong>
            </div>
            <div className="text-slate-400 text-[11px]">
              Akses khusus untuk warga dan pentadbir SMK Banggi
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // --- AUTHENTICATED SMK BANGGI WORKSPACE ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Ministry & School Banner */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border-b border-indigo-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* School Crest / Branding */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 border-2 border-amber-400/70 shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src="./assets/aistudio/Logo_SMK_Banggi_c52e1e56.png"
                  alt="Lencana SMK Banggi"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                    e-Pencerapan ISPPK 2027
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950 shadow-2xs">
                    SMK BANGGI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  SMK Banggi, Kudat, Sabah • <em>"Berilmu dan Berakhlak"</em>
                </p>
              </div>
            </div>

            {/* Administrator Profile & Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center">
              {/* Logged In Admin Chip */}
              <div className="flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                  {currentUser.nama.charAt(0)}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <span className="font-bold text-white block text-[11px] max-w-[150px] truncate">
                    {currentUser.nama}
                  </span>
                  <span className="text-[10px] text-indigo-200 block truncate max-w-[150px]">
                    {currentUser.jawatan}
                  </span>
                </div>

                {/* TT Digital Quick Button */}
                <button
                  onClick={() => setShowSignatureModal(true)}
                  className={`ml-1 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shadow-2xs ${
                    currentUser.tandatanganDigital
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 animate-pulse'
                  }`}
                  title="Urus dan Muat Naik Tandatangan Digital Pentadbir"
                >
                  <PenTool className="w-3 h-3" />
                  <span>{currentUser.tandatanganDigital ? 'TT Aktif' : 'Upload TT'}</span>
                </button>

                {/* Switch Account */}
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-slate-300 hover:text-white p-1 hover:bg-white/10 rounded-md transition-colors"
                  title="Tukar Pengguna Pentadbir"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="ml-1 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  title="Log Keluar dari Sistem SMK Banggi (Kunci Semula)"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Log Keluar</span>
                </button>
              </div>

              {/* Online / Database Sync Badge */}
              <div
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
                title={
                  isOnline
                    ? 'Pangkalan data sekolah SMK Banggi sedang disegerakkan'
                    : 'Mod luar talian aktif: Data disimpan setempat dan auto-segerak apabila talian kembali'
                }
              >
                {isOnline ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>DB Aktif</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span>Luar Talian</span>
                  </>
                )}
              </div>

              <button
                onClick={handleNewRecord}
                className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pencerapan Baru</span>
                <span className="sm:hidden">Baru</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 mt-3 pt-2 border-t border-white/10 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveView('borang')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeView === 'borang'
                  ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              Borang Pencerapan {editingRecord ? '(Kemas Kini)' : ''}
            </button>

            <button
              onClick={() => setActiveView('senarai')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeView === 'senarai'
                  ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Pangkalan Data Rekod
            </button>

            <button
              onClick={() => setActiveView('statistik')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeView === 'statistik'
                  ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Papan Pemuka Laporan
            </button>

            <button
              onClick={() => setActiveView('tt-digital')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeView === 'tt-digital'
                  ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-amber-300" />
              Upload TT Digital Pentadbir
            </button>

            <button
              onClick={() => setActiveView('github')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeView === 'github'
                  ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Github className="w-3.5 h-3.5 text-amber-300" />
              Backend GitHub
            </button>

            <button
              onClick={() => setActiveView('panduan')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeView === 'panduan'
                  ? 'bg-indigo-700 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Panduan Rubrik 2027
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeView === 'borang' && (
          <BorangPencerapan
            initialRecord={editingRecord}
            currentUser={currentUser}
            onOpenUploadSignature={() => setShowSignatureModal(true)}
            onSaved={handleSavedRecord}
            onPreviewPrint={handlePrintRecord}
            onShareSummary={handleOpenShare}
            onCancel={() => setActiveView('senarai')}
          />
        )}

        {activeView === 'senarai' && (
          <SenaraiPencerapan
            onSelectRecord={handleSelectRecordForEdit}
            onPrintRecord={handlePrintRecord}
            onShareSummary={handleOpenShare}
            onNewRecord={handleNewRecord}
          />
        )}

        {activeView === 'statistik' && (
          <ReportingDashboard onViewTeacherObservation={handleViewTeacherObservation} />
        )}

        {activeView === 'tt-digital' && currentUser && (
          <div className="max-w-3xl mx-auto space-y-4">
            <UploadTandatanganDigital
              currentUser={currentUser}
              onUpdateSignature={handleUpdateSignature}
            />
          </div>
        )}

        {activeView === 'github' && <GitHubBackendConfig />}

        {activeView === 'panduan' && <PanduanRubrikView />}

        {/* Global Share Summary Findings Modal */}
        {sharingRecord && (
          <ModalKongsiRumusan
            record={sharingRecord}
            onClose={() => setSharingRecord(null)}
          />
        )}

        {/* Modal Tandatangan Digital Pentadbir */}
        {showSignatureModal && currentUser && (
          <ModalProfilPentadbir
            currentUser={currentUser}
            onUpdateSignature={handleUpdateSignature}
            onLogout={handleLogout}
            onClose={() => setShowSignatureModal(false)}
          />
        )}

        {/* Modal Tukar Pengguna Pentadbir */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
            <LoginPentadbir
              isModal={true}
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => setShowLoginModal(false)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="font-semibold text-slate-700">
              Sistem e-Pencerapan ISPPK 2027 • SMK Banggi, Kudat, Sabah
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Instrumen Standard Penilaian Pembudayaan Kemahiran Berfikir Aras Tinggi (KBAT) dalam PdP Guru & Murid (KPM)
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>PPD Kudat, Sabah</span>
            <span>•</span>
            <a
              href="./assets/aistudio/V2_Borang_Instrumen_ISPPK_2026__Guru___Murid__pdf__1__23969c42.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline flex items-center gap-1"
            >
              Dokumen Rujukan PDF <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
