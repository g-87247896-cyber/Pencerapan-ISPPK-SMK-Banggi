import React, { useState, useEffect } from 'react';
import { googleWorkspaceService, getLocalGoogleWorkspaceConfig, saveLocalGoogleWorkspaceConfig, GoogleWorkspaceConfig, getCachedAccessToken } from '../services/googleWorkspace';
import { apiService } from '../services/api';
import {
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  Download,
  Key,
  Database,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  LogOut,
  FolderCheck,
  FileText,
  Lock,
} from 'lucide-react';

interface GoogleWorkspaceBackendConfigProps {
  onStatusChange?: () => void;
}

export const GoogleWorkspaceBackendConfig: React.FC<GoogleWorkspaceBackendConfigProps> = ({ onStatusChange }) => {
  const [config, setConfig] = useState<GoogleWorkspaceConfig>(getLocalGoogleWorkspaceConfig());
  const [rawTokenInput, setRawTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'test' | 'push' | 'pull' | 'driveBackup' | 'save' | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [driveFiles, setDriveFiles] = useState<{ id: string; name: string; webViewLink?: string; createdTime?: string }[]>([]);

  // Confirmation Modals State (MANDATORY per Workspace Integration Skill)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionType: 'push' | 'pull' | 'driveBackup';
  } | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    const cfg = getLocalGoogleWorkspaceConfig();
    setConfig(cfg);
    if (googleWorkspaceService.hasAccessToken()) {
      const files = await googleWorkspaceService.listDriveFiles();
      setDriveFiles(files);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawTokenInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Sila masukkan OAuth Access Token Google.' });
      return;
    }
    googleWorkspaceService.setAccessToken(rawTokenInput.trim());
    setRawTokenInput('');
    setStatusMsg({ type: 'info', text: 'Menguji token sambungan Google Workspace...' });

    const testRes = await googleWorkspaceService.testConnection();
    if (testRes.success) {
      setStatusMsg({ type: 'success', text: testRes.message || 'Berjaya menyambung ke Google Workspace!' });
      fetchStatus();
      if (onStatusChange) onStatusChange();
    } else {
      setStatusMsg({ type: 'error', text: testRes.error || 'Gagal menyambung ke Google Workspace API' });
    }
  };

  const handleTestConnection = async () => {
    setActionLoading('test');
    setStatusMsg(null);
    const res = await googleWorkspaceService.testConnection();
    setActionLoading(null);

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Sambungan ke Google Drive & Sheets berjaya disahkan!' });
      fetchStatus();
      if (onStatusChange) onStatusChange();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Gagal menyambung ke Google Workspace API' });
    }
  };

  const executePushToSheets = async () => {
    setActionLoading('push');
    setStatusMsg(null);
    setConfirmDialog(null);

    try {
      const localRecords = await apiService.getPencerapanList();
      if (localRecords.length === 0) {
        setStatusMsg({ type: 'error', text: 'Tiada rekod pencerapan tempatan untuk dimuat naik.' });
        setActionLoading(null);
        return;
      }

      const res = await googleWorkspaceService.pushToGoogleSheets(localRecords);
      setActionLoading(null);

      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message });
        fetchStatus();
        if (onStatusChange) onStatusChange();
      }
    } catch (err: any) {
      setActionLoading(null);
      setStatusMsg({ type: 'error', text: err.message || 'Gagal memuat naik data ke Google Sheets' });
    }
  };

  const executePullFromSheets = async () => {
    setActionLoading('pull');
    setStatusMsg(null);
    setConfirmDialog(null);

    try {
      const res = await googleWorkspaceService.pullFromGoogleSheets();
      setActionLoading(null);

      if (res.success && res.records) {
        // Save pulled records to local storage cache
        try {
          localStorage.setItem('smk_banggi_pencerapan_cache_v1', JSON.stringify(res.records));
        } catch {}

        setStatusMsg({ type: 'success', text: res.message });
        fetchStatus();
        if (onStatusChange) onStatusChange();
      }
    } catch (err: any) {
      setActionLoading(null);
      setStatusMsg({ type: 'error', text: err.message || 'Gagal menarik data dari Google Sheets' });
    }
  };

  const executeDriveBackup = async () => {
    setActionLoading('driveBackup');
    setStatusMsg(null);
    setConfirmDialog(null);

    try {
      const localRecords = await apiService.getPencerapanList();
      const backupJson = JSON.stringify(localRecords, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Backup_Pencerapan_ISPPK_2027_${timestamp}.json`;

      const uploadRes = await googleWorkspaceService.uploadFileToDrive(fileName, 'application/json', backupJson);
      setActionLoading(null);

      setStatusMsg({
        type: 'success',
        text: `Salinan sandaran ${localRecords.length} rekod pencerapan berjaya disimpan dalam Google Drive!`,
      });
      fetchStatus();
    } catch (err: any) {
      setActionLoading(null);
      setStatusMsg({ type: 'error', text: err.message || 'Gagal memuat naik sandaran ke Google Drive' });
    }
  };

  const handleLogout = () => {
    googleWorkspaceService.logout();
    setStatusMsg({ type: 'info', text: 'Sesi Google Workspace telah dilog keluar.' });
    fetchStatus();
    if (onStatusChange) onStatusChange();
  };

  const isConnected = config.syncStatus === 'connected' && googleWorkspaceService.hasAccessToken();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-teal-900 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <FileSpreadsheet className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 shadow-xs">
                  GOOGLE WORKSPACE
                </span>
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  SMK BANGGI • Sabang, Kudat
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Backend Google Sheets & Google Drive
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Storan awan rasmi rekod pencerapan ISPPK 2027 terus dalam format Google Spreadsheet & Drive sekolah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Google Workspace Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                Log Masuk Diperlukan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Connection & Auth Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-150">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-600" />
              Sambungan Akaun Google Workspace
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sambungkan akaun Google sekolah untuk mengakses Google Sheets & Google Drive.
            </p>
          </div>

          {isConnected && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-1 transition-colors border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Keluar Sesi Google
            </button>
          )}
        </div>

        {/* Auth Status & Login Buttons */}
        {!isConnected ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Sila Masukkan Token Akses / Kebenaran Google</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Pengesahan membolehkan penulisan data terus ke Google Sheets dan penyelesaian salinan sandaran ke Google Drive sekolah anda.
              </p>
            </div>

            {/* Official Material Google Sign-In Style / Token Input */}
            <div className="max-w-md mx-auto pt-2 space-y-3">
              <form onSubmit={handleManualTokenSubmit} className="space-y-2 text-left">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  Google OAuth Bearer / Access Token <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rawTokenInput}
                    onChange={(e) => setRawTokenInput(e.target.value)}
                    placeholder="ya29.a0... (Google OAuth Access Token)"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                  >
                    Sambung
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Memerlukan skop <code>spreadsheets</code> dan <code>drive.file</code>.
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.userPhoto ? (
                <img src={config.userPhoto} alt="User" className="w-10 h-10 rounded-full border border-emerald-300" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  {config.userName ? config.userName.charAt(0) : 'G'}
                </div>
              )}
              <div>
                <span className="text-xs font-extrabold text-emerald-950 block">{config.userName || 'Pengguna Google'}</span>
                <span className="text-xs text-emerald-700 font-mono block">{config.userEmail || 'Akaun Google Terhubung'}</span>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={actionLoading === 'test'}
              className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors border border-emerald-300 disabled:opacity-50"
            >
              {actionLoading === 'test' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />}
              Uji Sambungan API
            </button>
          </div>
        )}

        {/* Sync Controls & Action Buttons */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Penyegerakan Automatik (Auto-Sync)</span>
              <span className="text-[11px] text-slate-500">
                Secara automatik kemas kini Google Sheet setiap kali penilaian pencerapan disimpan
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoSync}
                onChange={(e) => {
                  const updated = saveLocalGoogleWorkspaceConfig({ autoSync: e.target.checked });
                  setConfig(updated);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Push Button */}
              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    title: 'Muat Naik Rekod ke Google Sheets?',
                    description:
                      'Tindakan ini akan mengemas kini lembaran kerja "Rekod Pencerapan 2027" di Google Sheets anda dengan semua rekod tempatan terkini.',
                    actionType: 'push',
                  })
                }
                disabled={actionLoading !== null || !isConnected}
                className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {actionLoading === 'push' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Muat Naik ke Google Sheets (Push)
              </button>

              {/* Pull Button */}
              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    title: 'Tarik Data dari Google Sheets?',
                    description:
                      'Tindakan ini akan membaca data rekod dari Google Sheets dan menggantikan cache pencerapan tempatan dengan data dari spreadsheet.',
                    actionType: 'pull',
                  })
                }
                disabled={actionLoading !== null || !isConnected}
                className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {actionLoading === 'pull' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Tarik dari Google Sheets (Pull)
              </button>

              {/* Drive Backup Button */}
              <button
                type="button"
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    title: 'Cipta Fail Sandaran di Google Drive?',
                    description:
                      'Tindakan ini akan memuat naik fail JSON sandaran rekod pencerapan ISPPK 2027 ke folder Google Drive sekolah.',
                    actionType: 'driveBackup',
                  })
                }
                disabled={actionLoading !== null || !isConnected}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 border border-slate-300 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'driveBackup' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                )}
                Sandar ke Google Drive
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 animate-fade-in ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : statusMsg.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : statusMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="font-semibold leading-relaxed">{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Target Spreadsheet & Drive Links */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Pautan Langsung Google Workspace Sekolah
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Google Sheets Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Google Sheet Pencerapan
              </span>
              {config.spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                >
                  Buka Sheet <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {config.spreadsheetName || 'Pencerapan_ISPPK_2027_SMK_Banggi'}
            </p>
            {config.spreadsheetId && (
              <div className="text-[10px] text-slate-400 font-mono truncate">ID: {config.spreadsheetId}</div>
            )}
          </div>

          {/* Google Drive Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                Folder Google Drive
              </span>
              {config.folderId && (
                <a
                  href={`https://drive.google.com/drive/folders/${config.folderId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-700 hover:text-indigo-800 font-bold inline-flex items-center gap-1 text-[11px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200"
                >
                  Buka Folder <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-slate-500">{config.folderName || 'ISPPK 2027 SMK Banggi - Fail Pencerapan'}</p>
            {config.folderId && (
              <div className="text-[10px] text-slate-400 font-mono truncate">ID Folder: {config.folderId}</div>
            )}
          </div>
        </div>

        {/* Saved Drive Backup Files List */}
        {driveFiles.length > 0 && (
          <div className="pt-2 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Fail Sandaran Terkini di Google Drive ({driveFiles.length}):
            </span>
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
              {driveFiles.map((f) => (
                <div key={f.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-slate-800 block truncate">{f.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {f.createdTime ? new Date(f.createdTime).toLocaleString('ms-MY') : ''}
                      </span>
                    </div>
                  </div>
                  {f.webViewLink && (
                    <a
                      href={f.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline text-[11px] font-bold flex items-center gap-1"
                    >
                      Lihat <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal (MANDATORY per Workspace Integration Skill guidelines) */}
      {confirmDialog && confirmDialog.open && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold">
                !
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{confirmDialog.description}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 leading-relaxed font-medium">
              Sila sahkan bahawa anda bersetuju untuk mengemaskini data Google Workspace anda.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-150">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.actionType === 'push') executePushToSheets();
                  else if (confirmDialog.actionType === 'pull') executePullFromSheets();
                  else if (confirmDialog.actionType === 'driveBackup') executeDriveBackup();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
              >
                Teruskan & Sahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
