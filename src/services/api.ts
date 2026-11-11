import { PencerapanRecord, TeacherMessage } from '../types/isppk';

const LOCAL_STORAGE_KEY = 'smk_banggi_pencerapan_cache_v1';
const DRAFT_KEY = 'smk_banggi_current_draft_v1';
const GITHUB_CLIENT_CONFIG_KEY = 'smk_banggi_github_config_v1';

export interface GitHubConfigResponse {
  enabled: boolean;
  token?: string;
  tokenMasked?: string;
  hasToken: boolean;
  owner: string;
  repo: string;
  branch: string;
  pencerapanPath: string;
  messagesPath: string;
  autoSync: boolean;
  syncStatus: 'connected' | 'disconnected' | 'error';
  lastSyncTime?: string;
  lastCommitSha?: string;
  lastCommitMessage?: string;
  lastError?: string;
}

export interface StatsResponse {
  total: number;
  selesai: number;
  draf: number;
  bilGuru: number;
  purataPeratus: number;
  purataDomain: {
    perancangan: number;
    pelaksanaan: number;
    refleksi: number;
    murid: number;
  };
  tahapDistribusi: Record<string, number>;
}

export interface TeacherScoreStat {
  namaGuru: string;
  jantina: string;
  opsyen: string;
  mataPelajaran: string;
  count: number;
  avgScore: number;
  tahapPencapaian: string;
  avgPerancangan: number;
  avgPelaksanaan: number;
  avgRefleksi: number;
  avgMurid: number;
  latestDate: string;
  trajectory: 'up' | 'down' | 'stable';
  history: { id: string; date: string; score: number; peratus: number; tahap: string; subject: string }[];
}

export interface MonthlyTrendStat {
  month: string;
  count: number;
  avgScore: number;
}

export interface EvaluatorStat {
  name: string;
  jawatan: string;
  count: number;
  avgScore: number;
}

export interface SubjectStat {
  subject: string;
  count: number;
  avgScore: number;
}

export interface ItemAnalysisStat {
  key: string;
  code: string;
  title: string;
  domain: string;
  avgScore: number;
  maxScore: number;
  percentage: number;
  suggestion?: string;
}

export interface DashboardReportResponse {
  total: number;
  purataPeratus: number;
  domainAverages: {
    perancangan: number;
    pelaksanaan: number;
    refleksi: number;
    murid: number;
  };
  tahapDistribusi: Record<string, number>;
  monthlyTrends: MonthlyTrendStat[];
  teacherScores: TeacherScoreStat[];
  evaluatorStats: EvaluatorStat[];
  subjectStats: SubjectStat[];
  itemAnalysis: ItemAnalysisStat[];
  areasForDevelopment: ItemAnalysisStat[];
  schoolStrengths: ItemAnalysisStat[];
  filterApplied?: {
    startDate: string;
    endDate: string;
    subject: string;
    evaluator: string;
    teacher: string;
    tingkatan: string;
  };
}

// Helper to safely parse JSON responses and avoid SyntaxError: Unexpected token '<' on HTML fallbacks
async function safeFetchJson<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Pelayan mengembalikan status ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Respons bukan format JSON (menerima HTML/Teks)');
  }
  return await res.json();
}

// --- Client-Side Direct GitHub REST API Helpers (For Static Hosting / GitHub Pages / Offline) ---
function getLocalGitHubConfig(): GitHubConfigResponse {
  try {
    const data = localStorage.getItem(GITHUB_CLIENT_CONFIG_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        hasToken: !!parsed.token,
        tokenMasked: parsed.token
          ? `${parsed.token.substring(0, 4)}...${parsed.token.substring(parsed.token.length - 4)}`
          : '',
      };
    }
  } catch {}
  return {
    enabled: true,
    token: '',
    tokenMasked: '',
    hasToken: false,
    owner: '',
    repo: 'Pencerapan-ISPPK-SMK-Banggi',
    branch: 'main',
    pencerapanPath: 'data/pencerapan_smk_banggi.json',
    messagesPath: 'data/mesej_guru_smk_banggi.json',
    autoSync: true,
    syncStatus: 'disconnected',
  };
}

function saveLocalGitHubConfig(config: Partial<GitHubConfigResponse>): GitHubConfigResponse {
  const current = getLocalGitHubConfig();
  const updated: GitHubConfigResponse = {
    ...current,
    ...config,
    hasToken: !!(config.token || current.token),
  };
  if (config.token) {
    updated.token = config.token;
    updated.tokenMasked = `${config.token.substring(0, 4)}...${config.token.substring(config.token.length - 4)}`;
  }
  try {
    localStorage.setItem(GITHUB_CLIENT_CONFIG_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

async function directGitHubTest(token: string, owner: string, repo: string) {
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };
  const userRes = await fetch('https://api.github.com/user', { headers });
  if (!userRes.ok) throw new Error('Token GitHub tidak sah atau telah tamat tempoh');
  const userJson = await userRes.json();

  if (owner && repo) {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) throw new Error(`Repositori ${owner}/${repo} tidak dijumpai atau tiada akses`);
  }

  return { authenticatedUser: userJson.login, repo };
}

async function directGitHubPushFile(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  pathInRepo: string,
  jsonContent: any,
  commitMessage: string
) {
  const cleanPath = pathInRepo.replace(/^\/+/, '');
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
  const headers: Record<string, string> = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };

  let sha: string | undefined = undefined;
  try {
    const existingRes = await fetch(`${url}?ref=${branch || 'main'}`, { headers });
    if (existingRes.ok) {
      const existingData = await existingRes.json();
      sha = existingData.sha;
    }
  } catch {}

  const jsonString = JSON.stringify(jsonContent, null, 2);
  const utf8Bytes = new TextEncoder().encode(jsonString);
  const binaryString = String.fromCharCode(...utf8Bytes);
  const base64Content = btoa(binaryString);

  const body: any = {
    message: commitMessage,
    content: base64Content,
    branch: branch || 'main',
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Ralat GitHub API (${res.status})`);
  }
  return await res.json();
}

async function directGitHubPullFile(
  token: string,
  owner: string,
  repo: string,
  branch: string,
  pathInRepo: string
) {
  const cleanPath = pathInRepo.replace(/^\/+/, '');
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${branch || 'main'}`;
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  };

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Fail ${pathInRepo} tidak dijumpai di repositori GitHub`);
  const data = await res.json();

  if (data.content) {
    const cleanContent = data.content.replace(/\s/g, '');
    const binaryString = atob(cleanContent);
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    const decodedText = new TextDecoder().decode(bytes);
    return JSON.parse(decodedText);
  }
  throw new Error('Kandungan fail kosong');
}

export const apiService = {
  // Fetch all pencerapan records
  async getPencerapanList(params?: {
    q?: string;
    guru?: string;
    tahap?: string;
    tingkatan?: string;
    status?: string;
  }): Promise<PencerapanRecord[]> {
    try {
      const url = new URL('/api/pencerapan', window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val) url.searchParams.append(key, val);
        });
      }

      const res = await fetch(url.toString());
      const json = await safeFetchJson(res);
      if (json.data && Array.isArray(json.data)) {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
        } catch {}
        return json.data;
      }
      return [];
    } catch (err) {
      // Fallback to offline cached data in localStorage
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) return JSON.parse(cached);
      } catch {}
      return [];
    }
  },

  // Get single pencerapan record
  async getPencerapanById(id: string): Promise<PencerapanRecord | null> {
    try {
      const res = await fetch(`/api/pencerapan/${encodeURIComponent(id)}`);
      const json = await safeFetchJson(res);
      return json.data || null;
    } catch {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const list: PencerapanRecord[] = JSON.parse(cached);
          const found = list.find((r) => r.id === id);
          if (found) return found;
        }
      } catch {}
      return null;
    }
  },

  // Save or update pencerapan record
  async savePencerapan(record: Partial<PencerapanRecord>): Promise<{ success: boolean; data: PencerapanRecord; message?: string }> {
    try {
      const res = await fetch('/api/pencerapan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      const json = await safeFetchJson(res);

      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        let list: PencerapanRecord[] = cached ? JSON.parse(cached) : [];
        const idx = list.findIndex((r) => r.id === json.data.id);
        if (idx >= 0) {
          list[idx] = json.data;
        } else {
          list.unshift(json.data);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      } catch {}

      return json;
    } catch (error) {
      // Generate client-side fallback record for static/offline hosting
      const now = new Date().toISOString();
      const fallbackRecord: PencerapanRecord = {
        id: record.id || `smkb-offline-${Date.now()}`,
        kodSekolah: 'XEA6062',
        namaSekolah: 'SMK BANGGI, KUDAT',
        ppd: 'PPD KUDAT',
        negeri: 'SABAH',
        emelSekolah: 'xea6062@moe.edu.my',
        namaPencerap: record.namaPencerap || '',
        jawatanPencerap: record.jawatanPencerap || '',
        tarikhPencerapan: record.tarikhPencerapan || now.split('T')[0],
        masaPencerapan: record.masaPencerapan || '',
        namaGuru: record.namaGuru || '',
        jantinaGuru: record.jantinaGuru || 'Lelaki',
        opsyenGuru: record.opsyenGuru || '',
        mataPelajaran: record.mataPelajaran || '',
        bilMuridHadir: record.bilMuridHadir || 0,
        bilMuridSebenar: record.bilMuridSebenar || 0,
        tingkatan: record.tingkatan || '',
        tajukTopik: record.tajukTopik || '',
        masaPdP: record.masaPdP || '',
        skor1_1: record.skor1_1 || 0,
        skor1_2: record.skor1_2 || 0,
        skor1_3: record.skor1_3 || 0,
        skor1_4: record.skor1_4 || 0,
        skor2_1: record.skor2_1 || 0,
        skor2_2: record.skor2_2 || 0,
        skor2_3: record.skor2_3 || 0,
        skor2_4: record.skor2_4 || 0,
        skor2_5: record.skor2_5 || 0,
        skor3_1: record.skor3_1 || 0,
        skorMurid: record.skorMurid || Array(10).fill(0),
        skorPerancangan: record.skorPerancangan || 0,
        skorPelaksanaan: record.skorPelaksanaan || 0,
        skorRefleksi: record.skorRefleksi || 0,
        skorGuru: record.skorGuru || 0,
        skorMuridTotal: record.skorMuridTotal || 0,
        skorKeseluruhan: record.skorKeseluruhan || 0,
        peratusPencapaian: record.peratusPencapaian || 0,
        tahapPencapaian: record.tahapPencapaian || 'Draf',
        refleksiPdP: record.refleksiPdP || '',
        perancanganPenambahbaikan: record.perancanganPenambahbaikan || '',
        rumusanPencerap: record.rumusanPencerap || '',
        status: record.status || 'Draf',
        createdAt: record.createdAt || now,
        updatedAt: now,
        gambar1: record.gambar1,
        gambar2: record.gambar2,
        gambar3: record.gambar3,
        gambar4: record.gambar4,
      };

      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        let list: PencerapanRecord[] = cached ? JSON.parse(cached) : [];
        const idx = list.findIndex((r) => r.id === fallbackRecord.id);
        if (idx >= 0) list[idx] = fallbackRecord;
        else list.unshift(fallbackRecord);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      } catch {}

      // Background Direct GitHub Sync if token is configured on client
      const ghConfig = getLocalGitHubConfig();
      if (ghConfig.enabled && ghConfig.token && ghConfig.owner && ghConfig.repo && ghConfig.autoSync) {
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          const fullList = cached ? JSON.parse(cached) : [fallbackRecord];
          directGitHubPushFile(
            ghConfig.token,
            ghConfig.owner,
            ghConfig.repo,
            ghConfig.branch || 'main',
            ghConfig.pencerapanPath || 'data/pencerapan_smk_banggi.json',
            fullList,
            `[Auto Sync Web] Pencerapan ${fallbackRecord.namaGuru} (${fallbackRecord.id})`
          ).catch(() => {});
        } catch {}
      }

      return {
        success: true,
        data: fallbackRecord,
        message: 'Tersimpan dalam storan sandaran peranti (akan disinkronkan ke pangkalan data sekolah)',
      };
    }
  },

  // Delete record
  async deletePencerapan(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/pencerapan/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (cached) {
            const list: PencerapanRecord[] = JSON.parse(cached);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.filter((r) => r.id !== id)));
          }
        } catch {}
        return true;
      }
      return false;
    } catch {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const list: PencerapanRecord[] = JSON.parse(cached);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.filter((r) => r.id !== id)));
          return true;
        }
      } catch {}
      return false;
    }
  },

  // Get statistics
  async getStats(): Promise<StatsResponse | null> {
    try {
      const res = await fetch('/api/stats');
      return await safeFetchJson(res);
    } catch {
      return null;
    }
  },

  // Get Reporting Dashboard
  async getDashboardReport(filters?: {
    startDate?: string;
    endDate?: string;
    subject?: string;
    evaluator?: string;
    teacher?: string;
    tingkatan?: string;
  }): Promise<DashboardReportResponse | null> {
    try {
      const url = new URL('/api/reports/dashboard', window.location.origin);
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v && v !== 'Semua') url.searchParams.append(k, v);
        });
      }
      const res = await fetch(url.toString());
      return await safeFetchJson(res);
    } catch (err) {
      console.warn('Ralat mendapatkan laporan dashboard:', err);
      return null;
    }
  },

  // In-App Teacher Messaging Methods
  async getTeacherMessages(params?: { guru?: string; pencerapanId?: string; unreadOnly?: boolean }): Promise<{ total: number; unreadCount: number; data: TeacherMessage[] }> {
    try {
      const url = new URL('/api/messages', window.location.origin);
      if (params?.guru) url.searchParams.append('guru', params.guru);
      if (params?.pencerapanId) url.searchParams.append('pencerapanId', params.pencerapanId);
      if (params?.unreadOnly) url.searchParams.append('unreadOnly', 'true');
      const res = await fetch(url.toString());
      return await safeFetchJson(res);
    } catch {
      return { total: 0, unreadCount: 0, data: [] };
    }
  },

  async sendTeacherMessage(message: Partial<TeacherMessage>): Promise<{ success: boolean; data?: TeacherMessage; message?: string }> {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      return await safeFetchJson(res);
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal menghantar mesej' };
    }
  },

  async markMessageAsRead(id: string, maklumBalasGuru?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maklumBalasGuru }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteTeacherMessage(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Reseed database with sample records
  async reseedDatabase(): Promise<boolean> {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Local Draft Helpers
  saveLocalDraft(record: Partial<PencerapanRecord>): void {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(record));
    } catch {}
  },

  loadLocalDraft(): Partial<PencerapanRecord> | null {
    try {
      const data = localStorage.getItem(DRAFT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearLocalDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  },

  // GitHub Backend Methods (Dual Mode: Server API with Client-Side Direct REST API Fallback)
  async getGitHubConfig(): Promise<GitHubConfigResponse | null> {
    try {
      const res = await fetch('/api/github/config');
      const json = await safeFetchJson(res);
      if (json.config) return json.config;
    } catch {}
    return getLocalGitHubConfig();
  },

  async saveGitHubConfig(config: Partial<GitHubConfigResponse>): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/github/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return await safeFetchJson(res);
    } catch {
      // Local fallback storage for static hosts like GitHub Pages
      saveLocalGitHubConfig(config);
      return { success: true, message: 'Tetapan backend GitHub berjaya disimpan di peranti!' };
    }
  },

  async testGitHubConnection(config: Partial<GitHubConfigResponse>): Promise<{ success: boolean; message?: string; error?: string; authenticatedUser?: string; repo?: string }> {
    try {
      const res = await fetch('/api/github/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      return await safeFetchJson(res);
    } catch {
      // Direct browser-to-GitHub API test fallback
      const localCfg = getLocalGitHubConfig();
      const token = config.token || localCfg.token;
      const owner = config.owner || localCfg.owner;
      const repo = config.repo || localCfg.repo;

      if (!token) {
        return { success: false, error: 'Sila masukkan Token Personal Access GitHub dahulu.' };
      }

      try {
        const testRes = await directGitHubTest(token, owner, repo);
        saveLocalGitHubConfig({ ...config, syncStatus: 'connected' });
        return {
          success: true,
          message: `Sambungan terus ke GitHub API berjaya! Disahkan sebagai ${testRes.authenticatedUser}.`,
          authenticatedUser: testRes.authenticatedUser,
          repo: testRes.repo,
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Gagal menyambung ke GitHub REST API' };
      }
    }
  },

  async pushToGitHub(): Promise<{ success: boolean; message?: string; error?: string; lastSyncTime?: string }> {
    try {
      const res = await fetch('/api/github/push', { method: 'POST' });
      return await safeFetchJson(res);
    } catch {
      // Direct browser-to-GitHub push fallback for static hosting
      const localCfg = getLocalGitHubConfig();
      if (!localCfg.token || !localCfg.owner || !localCfg.repo) {
        return { success: false, error: 'Sila masukkan Token PAT, Owner dan Repo GitHub dahulu.' };
      }

      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        const records = cached ? JSON.parse(cached) : [];

        await directGitHubPushFile(
          localCfg.token,
          localCfg.owner,
          localCfg.repo,
          localCfg.branch || 'main',
          localCfg.pencerapanPath || 'data/pencerapan_smk_banggi.json',
          records,
          `[Push Web Direct] Pangkalan data pencerapan SMK Banggi (${records.length} rekod)`
        );

        const nowIso = new Date().toISOString();
        saveLocalGitHubConfig({ syncStatus: 'connected', lastSyncTime: nowIso });

        return {
          success: true,
          message: `Semua ${records.length} rekod pencerapan berjaya dimuat naik secara terus ke GitHub (${localCfg.owner}/${localCfg.repo})!`,
          lastSyncTime: nowIso,
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Gagal muat naik terus ke GitHub' };
      }
    }
  },

  async pullFromGitHub(): Promise<{ success: boolean; message?: string; error?: string; count?: number; lastSyncTime?: string }> {
    try {
      const res = await fetch('/api/github/pull', { method: 'POST' });
      return await safeFetchJson(res);
    } catch {
      // Direct browser-to-GitHub pull fallback for static hosting
      const localCfg = getLocalGitHubConfig();
      if (!localCfg.token || !localCfg.owner || !localCfg.repo) {
        return { success: false, error: 'Sila masukkan Token PAT, Owner dan Repo GitHub dahulu.' };
      }

      try {
        const pulledRecords = await directGitHubPullFile(
          localCfg.token,
          localCfg.owner,
          localCfg.repo,
          localCfg.branch || 'main',
          localCfg.pencerapanPath || 'data/pencerapan_smk_banggi.json'
        );

        if (Array.isArray(pulledRecords)) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pulledRecords));
        }

        const nowIso = new Date().toISOString();
        saveLocalGitHubConfig({ syncStatus: 'connected', lastSyncTime: nowIso });

        return {
          success: true,
          message: `Pangkalan data berjaya ditarik dan disegerakkan daripada GitHub (${localCfg.owner}/${localCfg.repo})! Total: ${pulledRecords.length || 0} rekod.`,
          count: pulledRecords.length || 0,
          lastSyncTime: nowIso,
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Gagal menarik data dari GitHub' };
      }
    }
  },
};

// Image Compression Helper
export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Gagal membaca gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal memuat fail'));
    reader.readAsDataURL(file);
  });
}
