import React, { useState, useEffect } from 'react';
import { apiService, GitHubConfigResponse } from '../services/api';
import {
  Github,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  Download,
  Key,
  Database,
  ShieldCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  GitBranch,
  FolderGit2,
  Lock,
} from 'lucide-react';

interface GitHubBackendConfigProps {
  onStatusChange?: () => void;
}

export const GitHubBackendConfig: React.FC<GitHubBackendConfigProps> = ({ onStatusChange }) => {
  const [config, setConfig] = useState<GitHubConfigResponse>({
    enabled: true,
    token: '',
    tokenMasked: '',
    hasToken: false,
    owner: '',
    repo: 'smk-banggi-isppk-db',
    branch: 'main',
    pencerapanPath: 'data/pencerapan_smk_banggi.json',
    messagesPath: 'data/mesej_guru_smk_banggi.json',
    autoSync: true,
    syncStatus: 'disconnected',
  });

  const [rawTokenInput, setRawTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'test' | 'push' | 'pull' | 'save' | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchConfig = async () => {
    setLoading(true);
    const data = await apiService.getGitHubConfig();
    if (data) {
      setConfig(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActionLoading('save');
    setStatusMsg(null);

    const payload: Partial<GitHubConfigResponse> = {
      enabled: config.enabled,
      owner: config.owner,
      repo: config.repo,
      branch: config.branch || 'main',
      pencerapanPath: config.pencerapanPath || 'data/pencerapan_smk_banggi.json',
      messagesPath: config.messagesPath || 'data/mesej_guru_smk_banggi.json',
      autoSync: config.autoSync,
    };

    if (rawTokenInput.trim()) {
      payload.token = rawTokenInput.trim();
    }

    const res = await apiService.saveGitHubConfig(payload);
    setActionLoading(null);

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Tetapan backend GitHub berjaya disimpan!' });
      setRawTokenInput('');
      fetchConfig();
      if (onStatusChange) onStatusChange();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Gagal menyimpan tetapan GitHub' });
    }
  };

  const handleTestConnection = async () => {
    setActionLoading('test');
    setStatusMsg(null);

    const payload: Partial<GitHubConfigResponse> = {
      owner: config.owner,
      repo: config.repo,
    };
    if (rawTokenInput.trim()) {
      payload.token = rawTokenInput.trim();
    }

    const res = await apiService.testGitHubConnection(payload);
    setActionLoading(null);

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Sambungan ke GitHub Backend berjaya disahkan!' });
      fetchConfig();
      if (onStatusChange) onStatusChange();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Gagal menyambung ke GitHub API' });
    }
  };

  const handlePush = async () => {
    setActionLoading('push');
    setStatusMsg(null);

    const res = await apiService.pushToGitHub();
    setActionLoading(null);

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Pangkalan data berjaya dimuat naik ke GitHub!' });
      fetchConfig();
      if (onStatusChange) onStatusChange();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Gagal muat naik ke GitHub' });
    }
  };

  const handlePull = async () => {
    if (!confirm('Tarik data dari GitHub akan mengemas kini pangkalan data tempatan dengan fail terkini dari GitHub. Teruskan?')) {
      return;
    }

    setActionLoading('pull');
    setStatusMsg(null);

    const res = await apiService.pullFromGitHub();
    setActionLoading(null);

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message || 'Data pencerapan berjaya ditarik dari GitHub!' });
      fetchConfig();
      if (onStatusChange) onStatusChange();
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Gagal menarik data dari GitHub' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-950 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <Github className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  STORAGE ENGINE
                </span>
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  SMK BANGGI • Sabang, Kudat
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Backend Pangkalan Data GitHub
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Penyimpanan & penyegerakan rekod pencerapan ISPPK 2026 secara langsung ke Repositori GitHub.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {config.syncStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Backend GitHub Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5" />
                Belum Menyambung
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-150">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                Tetapan Sambungan GitHub REST API
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan maklumat token dan repositori GitHub sekolah untuk storan awan selamat.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-slate-700">Aktifkan GitHub Backend:</span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </label>
          </div>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Token PAT Input */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  GitHub Personal Access Token (PAT) <span className="text-rose-500">*</span>
                </label>
                {config.hasToken && (
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Token Tersimpan: {config.tokenMasked}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={rawTokenInput}
                  onChange={(e) => setRawTokenInput(e.target.value)}
                  placeholder={config.hasToken ? 'Sila masukkan token baharu jika mahu menukar...' : 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Memerlukan kebenaran skop <code>repo</code> atau <code>public_repo</code> pada token GitHub anda.
              </p>
            </div>

            {/* GitHub Owner */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Github className="w-3.5 h-3.5 text-slate-500" />
                Pemilik Repositori (GitHub Owner / User) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={config.owner}
                onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                placeholder="Cth: g-87247896 atau smk-banggi"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              />
            </div>

            {/* GitHub Repository */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FolderGit2 className="w-3.5 h-3.5 text-slate-500" />
                Nama Repositori (Repository Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={config.repo}
                onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                placeholder="Cth: smk-banggi-isppk-db"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                Cawangan (Branch)
              </label>
              <input
                type="text"
                value={config.branch || 'main'}
                onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                placeholder="main"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Auto-Sync Toggle */}
            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSync}
                  onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
              </label>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Penyegerakan Automatik (Auto Sync)</span>
                <span className="text-[11px] text-slate-500">Kemas kini fail GitHub setiap kali pencerapan disimpan</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-150">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={actionLoading !== null}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'test' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
                Uji Sambungan GitHub
              </button>

              <button
                type="button"
                onClick={handlePush}
                disabled={actionLoading !== null || !config.hasToken}
                className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {actionLoading === 'push' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Muat Naik ke GitHub (Push)
              </button>

              <button
                type="button"
                onClick={handlePull}
                disabled={actionLoading !== null || !config.hasToken}
                className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {actionLoading === 'pull' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Tarik dari GitHub (Pull)
              </button>
            </div>

            <button
              type="submit"
              disabled={actionLoading !== null}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              {actionLoading === 'save' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Simpan Tetapan Backend
            </button>
          </div>
        </form>

        {/* Status Message Notification */}
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

      {/* Sync Details Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-indigo-600" />
          Status Penyegerakan GitHub Backend
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium">Tarikh Segerak Terakhir:</span>
            <span className="font-bold text-slate-800 font-mono mt-0.5 block">
              {config.lastSyncTime ? new Date(config.lastSyncTime).toLocaleString('ms-MY') : 'Belum pernah disegerakkan'}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium">Fail Rekod Pencerapan:</span>
            <span className="font-mono text-indigo-700 font-semibold mt-0.5 block truncate">
              {config.pencerapanPath || 'data/pencerapan_smk_banggi.json'}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 block font-medium">Fail Peti Mesej Guru:</span>
            <span className="font-mono text-indigo-700 font-semibold mt-0.5 block truncate">
              {config.messagesPath || 'data/mesej_guru_smk_banggi.json'}
            </span>
          </div>
        </div>

        {/* Step-by-Step PAT Guide */}
        <div className="bg-indigo-50/60 border border-indigo-150 rounded-2xl p-4 text-xs space-y-2">
          <div className="font-bold text-indigo-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Panduan Menjana Token Access GitHub (PAT Classic):
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li>
              Buka akaun GitHub anda di{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline font-bold inline-flex items-center gap-0.5"
              >
                github.com/settings/tokens <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>Klik <strong>"Generate new token (classic)"</strong>.</li>
            <li>Tandakan semakan pada skop <strong>"repo"</strong> (Full control of private repositories).</li>
            <li>Klik <strong>"Generate token"</strong> di bawah dan salin token (bermula dengan <code>ghp_...</code>).</li>
            <li>Tampal token tersebut dalam borang di atas dan klik <strong>"Simpan Tetapan Backend"</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
