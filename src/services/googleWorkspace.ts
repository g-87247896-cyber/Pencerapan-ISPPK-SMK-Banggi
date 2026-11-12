import { PencerapanRecord } from '../types/isppk';
import { safeParseJson } from './api';

const GOOGLE_WORKSPACE_CONFIG_KEY = 'smk_banggi_google_workspace_config_v1';

export interface GoogleWorkspaceConfig {
  enabled: boolean;
  autoSync: boolean;
  spreadsheetId: string;
  spreadsheetName: string;
  folderId: string;
  folderName: string;
  syncStatus: 'connected' | 'disconnected' | 'error';
  lastSyncTime?: string;
  lastError?: string;
  userEmail?: string;
  userName?: string;
  userPhoto?: string;
}

// In-memory token cache (DO NOT store raw access token in localStorage per security guidelines)
let inMemoryAccessToken: string | null = null;

export const setCachedAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getCachedAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

export function getLocalGoogleWorkspaceConfig(): GoogleWorkspaceConfig {
  try {
    const data = localStorage.getItem(GOOGLE_WORKSPACE_CONFIG_KEY);
    if (data) {
      const parsed = safeParseJson<GoogleWorkspaceConfig | null>(data, null);
      if (parsed) return parsed;
    }
  } catch {}
  return {
    enabled: true,
    autoSync: true,
    spreadsheetId: '',
    spreadsheetName: 'Pencerapan_ISPPK_2027_SMK_Banggi',
    folderId: '',
    folderName: 'ISPPK 2027 SMK Banggi - Fail Pencerapan',
    syncStatus: 'disconnected',
  };
}

export function saveLocalGoogleWorkspaceConfig(config: Partial<GoogleWorkspaceConfig>): GoogleWorkspaceConfig {
  const current = getLocalGoogleWorkspaceConfig();
  const updated: GoogleWorkspaceConfig = {
    ...current,
    ...config,
  };
  try {
    localStorage.setItem(GOOGLE_WORKSPACE_CONFIG_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

// Google Sheets API Helpers
const SHEET_HEADERS = [
  'ID Rekod',
  'Tarikh Pencerapan',
  'Masa PdP',
  'Nama Guru',
  'Jantina Guru',
  'Opsyen Guru',
  'Mata Pelajaran',
  'Tingkatan',
  'Tajuk / Topik',
  'Bil Murid Hadir',
  'Bil Murid Sebenar',
  'Nama Pencerap',
  'Jawatan Pencerap',
  'Skor Domain 1: Perancangan',
  'Skor Domain 2: Pelaksanaan',
  'Skor Domain 3: Refleksi',
  'Skor Penglibatan Murid',
  'Jumlah Skor Keseluruhan',
  'Peratus Pencapaian (%)',
  'Tahap Pencapaian',
  'Refleksi PdP',
  'Perancangan Penambahbaikan',
  'Rumusan Pencerap',
  'Status',
  'Tarikh Kemas Kini',
];

export const googleWorkspaceService = {
  // Check token availability
  hasAccessToken(): boolean {
    return !!inMemoryAccessToken;
  },

  // Set access token directly (e.g. from Google OAuth Popup / Token Client)
  setAccessToken(token: string, userDetails?: { email?: string; name?: string; photo?: string }) {
    setCachedAccessToken(token);
    const cfg = saveLocalGoogleWorkspaceConfig({
      syncStatus: 'connected',
      userEmail: userDetails?.email || cfgUserEmail(),
      userName: userDetails?.name || cfgUserName(),
      userPhoto: userDetails?.photo || cfgUserPhoto(),
    });
    return cfg;
  },

  // Logout / clear token
  logout() {
    setCachedAccessToken(null);
    saveLocalGoogleWorkspaceConfig({
      syncStatus: 'disconnected',
      userEmail: '',
      userName: '',
      userPhoto: '',
    });
  },

  // Test connection to Google Workspace (Drive & Sheets)
  async testConnection(): Promise<{ success: boolean; message?: string; error?: string; user?: any }> {
    const token = getCachedAccessToken();
    if (!token) {
      return {
        success: false,
        error: 'Tiada Token Akses Google. Sila tekan "Log Masuk dengan Google" untuk menyambung.',
      };
    }

    try {
      // Test User Info
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) {
        throw new Error(`Pengesahan token Google gagal (Status: ${userRes.status})`);
      }
      const userData = await userRes.json();

      // Test Drive API access
      const driveRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!driveRes.ok) {
        throw new Error('Capaian Google Drive API gagal. Sila pastikan skop Drive dibenarkan.');
      }

      saveLocalGoogleWorkspaceConfig({
        syncStatus: 'connected',
        userEmail: userData.email || '',
        userName: userData.name || '',
        userPhoto: userData.picture || '',
      });

      return {
        success: true,
        message: `Sambungan ke Google Workspace berjaya! Terhubung sebagai ${userData.name || userData.email}.`,
        user: userData,
      };
    } catch (err: any) {
      saveLocalGoogleWorkspaceConfig({ syncStatus: 'error', lastError: err.message });
      return { success: false, error: err.message || 'Gagal menyambung ke Google Workspace API' };
    }
  },

  // Create or retrieve Google Spreadsheet for ISPPK 2027
  async ensureSpreadsheet(customName?: string): Promise<string> {
    const token = getCachedAccessToken();
    if (!token) throw new Error('Token Akses Google tidak ditemui. Sila log masuk dahulu.');

    const cfg = getLocalGoogleWorkspaceConfig();
    if (cfg.spreadsheetId) {
      // Verify existing spreadsheet exists
      try {
        const checkRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${cfg.spreadsheetId}?fields=spreadsheetId,properties.title`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (checkRes.ok) {
          const sheetData = await checkRes.json();
          saveLocalGoogleWorkspaceConfig({ spreadsheetName: sheetData.properties.title });
          return cfg.spreadsheetId;
        }
      } catch {}
    }

    // Create a new spreadsheet
    const title = customName || cfg.spreadsheetName || 'Pencerapan_ISPPK_2027_SMK_Banggi';
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [
          {
            properties: { title: 'Rekod Pencerapan 2027' },
          },
          {
            properties: { title: 'Rumusan & Statistik' },
          },
        ],
      }),
    });

    if (!createRes.ok) {
      const errJson = await createRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || 'Gagal mencipta Google Sheet baharu');
    }

    const newSheet = await createRes.json();
    const spreadsheetId = newSheet.spreadsheetId;

    // Write header row to the created sheet
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Rekod Pencerapan 2027'!A1:Z1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [SHEET_HEADERS],
        }),
      }
    );

    saveLocalGoogleWorkspaceConfig({ spreadsheetId, spreadsheetName: title });
    return spreadsheetId;
  },

  // Push evaluation records to Google Sheets
  async pushToGoogleSheets(records: PencerapanRecord[]): Promise<{ success: boolean; count: number; spreadsheetId: string; message: string }> {
    const token = getCachedAccessToken();
    if (!token) throw new Error('Sila log masuk dengan Google dahulu.');

    const spreadsheetId = await this.ensureSpreadsheet();

    // Map records to 2D array of rows
    const rows = records.map((r) => [
      r.id,
      r.tarikhPencerapan,
      r.masaPdP || r.masaPencerapan || '',
      r.namaGuru,
      r.jantinaGuru,
      r.opsyenGuru,
      r.mataPelajaran,
      r.tingkatan,
      r.tajukTopik,
      r.bilMuridHadir,
      r.bilMuridSebenar,
      r.namaPencerap,
      r.jawatanPencerap,
      r.skorPerancangan,
      r.skorPelaksanaan,
      r.skorRefleksi,
      r.skorMuridTotal,
      r.skorKeseluruhan,
      r.peratusPencapaian,
      r.tahapPencapaian,
      r.refleksiPdP,
      r.perancanganPenambahbaikan,
      r.rumusanPencerap,
      r.status,
      r.updatedAt || r.createdAt,
    ]);

    // Clear existing data & write updated rows
    const range = `'Rekod Pencerapan 2027'!A1:Z${records.length + 5}`;
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [SHEET_HEADERS, ...rows],
        }),
      }
    );

    if (!updateRes.ok) {
      const errJson = await updateRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || 'Gagal mengemas kini kandungan Google Sheet');
    }

    const nowIso = new Date().toISOString();
    saveLocalGoogleWorkspaceConfig({
      syncStatus: 'connected',
      lastSyncTime: nowIso,
    });

    return {
      success: true,
      count: records.length,
      spreadsheetId,
      message: `Berjaya memuat naik ${records.length} rekod pencerapan ke Google Sheet!`,
    };
  },

  // Pull records from Google Sheets
  async pullFromGoogleSheets(): Promise<{ success: boolean; records: PencerapanRecord[]; count: number; message: string }> {
    const token = getCachedAccessToken();
    if (!token) throw new Error('Sila log masuk dengan Google dahulu.');

    const spreadsheetId = await this.ensureSpreadsheet();

    const fetchRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Rekod Pencerapan 2027'!A2:Z1000`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!fetchRes.ok) {
      throw new Error('Gagal membaca data dari Google Sheet');
    }

    const data = await fetchRes.json();
    const rows: any[][] = data.values || [];

    const records: PencerapanRecord[] = rows.map((row, index) => {
      const id = row[0] || `smkb-gsheet-${index + 1}`;
      const tarikhPencerapan = row[1] || new Date().toISOString().split('T')[0];
      const masaPdP = row[2] || '';
      const namaGuru = row[3] || 'Guru SMK Banggi';
      const jantinaGuru = row[4] || 'Lelaki';
      const opsyenGuru = row[5] || '';
      const mataPelajaran = row[6] || '';
      const tingkatan = row[7] || '';
      const tajukTopik = row[8] || '';
      const bilMuridHadir = Number(row[9]) || 0;
      const bilMuridSebenar = Number(row[10]) || 0;
      const namaPencerap = row[11] || '';
      const jawatanPencerap = row[12] || '';
      const skorPerancangan = Number(row[13]) || 0;
      const skorPelaksanaan = Number(row[14]) || 0;
      const skorRefleksi = Number(row[15]) || 0;
      const skorMuridTotal = Number(row[16]) || 0;
      const skorKeseluruhan = Number(row[17]) || 0;
      const peratusPencapaian = Number(row[18]) || 0;
      const tahapPencapaian = row[19] || 'Draf';
      const refleksiPdP = row[20] || '';
      const perancanganPenambahbaikan = row[21] || '';
      const rumusanPencerap = row[22] || '';
      const status = row[23] || 'Selesai';
      const updatedAt = row[24] || new Date().toISOString();

      return {
        id,
        kodSekolah: 'XEA6062',
        namaSekolah: 'SMK BANGGI, KUDAT',
        ppd: 'PPD KUDAT',
        negeri: 'SABAH',
        emelSekolah: 'xea6062@moe.edu.my',
        namaPencerap,
        jawatanPencerap,
        tarikhPencerapan,
        masaPencerapan: masaPdP,
        namaGuru,
        jantinaGuru,
        opsyenGuru,
        mataPelajaran,
        bilMuridHadir,
        bilMuridSebenar,
        tingkatan,
        tajukTopik,
        masaPdP,
        skor1_1: Math.round(skorPerancangan / 2),
        skor1_2: Math.round(skorPerancangan / 2),
        skor1_3: 0,
        skor1_4: 0,
        skor2_1: Math.round(skorPelaksanaan / 5),
        skor2_2: Math.round(skorPelaksanaan / 5),
        skor2_3: Math.round(skorPelaksanaan / 5),
        skor2_4: Math.round(skorPelaksanaan / 5),
        skor2_5: Math.round(skorPelaksanaan / 5),
        skor3_1: skorRefleksi,
        skorMurid: Array(10).fill(Math.round(skorMuridTotal / 10)),
        skorPerancangan,
        skorPelaksanaan,
        skorRefleksi,
        skorGuru: skorPerancangan + skorPelaksanaan + skorRefleksi,
        skorMuridTotal,
        skorKeseluruhan,
        peratusPencapaian,
        tahapPencapaian,
        refleksiPdP,
        perancanganPenambahbaikan,
        rumusanPencerap,
        status: status as any,
        createdAt: updatedAt,
        updatedAt,
      };
    });

    const nowIso = new Date().toISOString();
    saveLocalGoogleWorkspaceConfig({
      syncStatus: 'connected',
      lastSyncTime: nowIso,
    });

    return {
      success: true,
      records,
      count: records.length,
      message: `Berjaya menarik ${records.length} rekod pencerapan daripada Google Sheet!`,
    };
  },

  // Create or retrieve Google Drive folder for attachments
  async ensureFolder(folderName?: string): Promise<string> {
    const token = getCachedAccessToken();
    if (!token) throw new Error('Token Akses Google tidak ditemui. Sila log masuk dahulu.');

    const cfg = getLocalGoogleWorkspaceConfig();
    if (cfg.folderId) {
      try {
        const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files/${cfg.folderId}?fields=id,name,trashed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (checkRes.ok) {
          const fData = await checkRes.json();
          if (!fData.trashed) return cfg.folderId;
        }
      } catch {}
    }

    const name = folderName || cfg.folderName || 'ISPPK 2027 SMK Banggi - Fail Pencerapan';
    const query = encodeURIComponent(`name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const folderId = searchData.files[0].id;
        saveLocalGoogleWorkspaceConfig({ folderId, folderName: name });
        return folderId;
      }
    }

    // Create new folder in Google Drive
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!createRes.ok) {
      throw new Error('Gagal mencipta folder Google Drive');
    }

    const folderData = await createRes.json();
    saveLocalGoogleWorkspaceConfig({ folderId: folderData.id, folderName: name });
    return folderData.id;
  },

  // Upload evaluation summary or backup file to Google Drive
  async uploadFileToDrive(fileName: string, mimeType: string, content: string | Blob): Promise<{ id: string; webViewLink?: string }> {
    const token = getCachedAccessToken();
    if (!token) throw new Error('Sila log masuk dengan Google dahulu.');

    const folderId = await this.ensureFolder();

    const metadata = {
      name: fileName,
      mimeType,
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', typeof content === 'string' ? new Blob([content], { type: mimeType }) : content);

    const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => '');
      throw new Error(`Gagal memuat naik fail ke Google Drive: ${errText}`);
    }

    return await uploadRes.json();
  },

  // List backup files in Google Drive folder
  async listDriveFiles(): Promise<{ id: string; name: string; mimeType: string; webViewLink?: string; createdTime?: string }[]> {
    const token = getCachedAccessToken();
    if (!token) return [];

    try {
      const folderId = await this.ensureFolder();
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,webViewLink,createdTime)&orderBy=createdTime desc`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        return data.files || [];
      }
    } catch {}

    return [];
  },
};

function cfgUserEmail(): string {
  try {
    return getLocalGoogleWorkspaceConfig().userEmail || '';
  } catch {
    return '';
  }
}

function cfgUserName(): string {
  try {
    return getLocalGoogleWorkspaceConfig().userName || '';
  } catch {
    return '';
  }
}

function cfgUserPhoto(): string {
  try {
    return getLocalGoogleWorkspaceConfig().userPhoto || '';
  } catch {
    return '';
  }
}
