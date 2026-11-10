import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase payload limits to handle base64 images gracefully
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// School database setup
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'pencerapan_smk_banggi.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface PencerapanRecord {
  id: string;
  // Bahagian A: Pencerap
  namaPencerap: string;
  jawatanPencerap: string;
  tarikhPencerapan: string;
  masaPencerapan: string;

  // Bahagian B: Sekolah
  kodSekolah: string;
  namaSekolah: string;
  ppd: string;
  negeri: string;
  emelSekolah: string;

  // Bahagian C: Guru Yang Dicerap
  namaGuru: string;
  jantinaGuru: 'Lelaki' | 'Perempuan';
  opsyenGuru: string;

  // Bahagian D: Kelas Yang Dicerap
  mataPelajaran: string;
  bilMuridHadir: number;
  bilMuridSebenar: number;
  tingkatan: string;
  tajukTopik: string;
  masaPdP: string;

  // Bahagian E: Rubrik Penilaian Guru (1-5)
  // Perancangan (4 item)
  skor1_1: number;
  skor1_2: number;
  skor1_3: number;
  skor1_4: number;

  // Pelaksanaan (5 item)
  skor2_1: number;
  skor2_2: number;
  skor2_3: number;
  skor2_4: number;
  skor2_5: number;

  // Refleksi Guru (1 item)
  skor3_1: number;

  // Bahagian F: Rubrik Penilaian Murid (1-5, 10 item)
  skorMurid: number[];

  // Skor & Rumusan Auto
  skorPerancangan: number;
  skorPelaksanaan: number;
  skorRefleksi: number;
  skorGuru: number;
  skorMuridTotal: number;
  skorKeseluruhan: number;
  peratusPencapaian: number;
  tahapPencapaian: string;

  // Bahagian H: Refleksi Temu Bual
  refleksiPdP: string;
  perancanganPenambahbaikan: string;

  // Bahagian I: Rumusan Pencerap & Tandatangan
  rumusanPencerap: string;
  tandatanganPencerap?: string;
  tandatanganGuru?: string;

  // 4 Gambar Evidens PdP
  gambar1?: { data: string; caption: string; timestamp: string };
  gambar2?: { data: string; caption: string; timestamp: string };
  gambar3?: { data: string; caption: string; timestamp: string };
  gambar4?: { data: string; caption: string; timestamp: string };

  createdAt: string;
  updatedAt: string;
  status: 'Draf' | 'Selesai';
}

export function calculateScores(record: Partial<PencerapanRecord>): {
  skorPerancangan: number;
  skorPelaksanaan: number;
  skorRefleksi: number;
  skorGuru: number;
  skorMuridTotal: number;
  skorKeseluruhan: number;
  peratusPencapaian: number;
  tahapPencapaian: string;
} {
  const p1 = Number(record.skor1_1 || 0);
  const p2 = Number(record.skor1_2 || 0);
  const p3 = Number(record.skor1_3 || 0);
  const p4 = Number(record.skor1_4 || 0);
  const skorPerancangan = p1 + p2 + p3 + p4; // max 20

  const pl1 = Number(record.skor2_1 || 0);
  const pl2 = Number(record.skor2_2 || 0);
  const pl3 = Number(record.skor2_3 || 0);
  const pl4 = Number(record.skor2_4 || 0);
  const pl5 = Number(record.skor2_5 || 0);
  const skorPelaksanaan = pl1 + pl2 + pl3 + pl4 + pl5; // max 25

  const ref1 = Number(record.skor3_1 || 0);
  const skorRefleksi = ref1; // max 5

  const skorGuru = skorPerancangan + skorPelaksanaan + skorRefleksi; // max 50

  const muridScores = Array.isArray(record.skorMurid) ? record.skorMurid : [];
  const skorMuridTotal = muridScores.reduce((acc, curr) => acc + (Number(curr) || 0), 0); // max 50

  const skorKeseluruhan = skorGuru + skorMuridTotal; // max 100
  const peratusPencapaian = Math.round((skorKeseluruhan / 100) * 100 * 10) / 10;

  let tahapPencapaian = 'Tidak Memenuhi Tahap Minimum';
  if (peratusPencapaian >= 81) {
    tahapPencapaian = 'Cemerlang';
  } else if (peratusPencapaian >= 61) {
    tahapPencapaian = 'Baik';
  } else if (peratusPencapaian >= 51) {
    tahapPencapaian = 'Sederhana';
  } else if (peratusPencapaian >= 41) {
    tahapPencapaian = 'Tahap Minimum';
  }

  return {
    skorPerancangan,
    skorPelaksanaan,
    skorRefleksi,
    skorGuru,
    skorMuridTotal,
    skorKeseluruhan,
    peratusPencapaian,
    tahapPencapaian,
  };
}

function readDatabase(): PencerapanRecord[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const sample = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(sample, null, 2), 'utf-8');
      return sample;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // If database exists but has only 1 or 0 records, ensure rich dataset
    if (Array.isArray(parsed) && parsed.length <= 1) {
      const sample = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(sample, null, 2), 'utf-8');
      return sample;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading database file:', err);
    return [];
  }
}

function writeDatabase(records: PencerapanRecord[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
    throw err;
  }
}

export function getInitialSeedData(): PencerapanRecord[] {
  const recordsRaw: Array<Omit<PencerapanRecord, 'skorPerancangan' | 'skorPelaksanaan' | 'skorRefleksi' | 'skorGuru' | 'skorMuridTotal' | 'skorKeseluruhan' | 'peratusPencapaian' | 'tahapPencapaian'>> = [
    {
      id: 'smkb-2026-001',
      namaPencerap: 'En. Roslan bin Awang',
      jawatanPencerap: 'Penolong Kanan Pentadbiran (PK1)',
      tarikhPencerapan: '2026-01-20',
      masaPencerapan: '08:30 - 09:30 Pagi',
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',
      namaGuru: 'Pn. Siti Nurhaliza binti Mat Nor',
      jantinaGuru: 'Perempuan',
      opsyenGuru: 'Sains',
      mataPelajaran: 'Sains',
      bilMuridHadir: 24,
      bilMuridSebenar: 26,
      tingkatan: 'Tingkatan 4 Al-Farabi',
      tajukTopik: 'Bab 3: Pemeliharaan Ekosistem Marin Pulau Banggi',
      masaPdP: '08:30 - 09:30 Pagi',
      skor1_1: 4,
      skor1_2: 4,
      skor1_3: 4,
      skor1_4: 4,
      skor2_1: 5,
      skor2_2: 4,
      skor2_3: 4,
      skor2_4: 3,
      skor2_5: 4,
      skor3_1: 4,
      skorMurid: [4, 4, 3, 4, 4, 3, 3, 4, 3, 4],
      refleksiPdP: 'Murid berminat tetapi memerlukan panduan lanjut bagi peta pemikiran i-Think.',
      perancanganPenambahbaikan: 'Memperbanyakkan latihan penggunaan peta buih berganda dalam tugasan berkumpulan.',
      rumusanPencerap: 'Pengajaran yang memuaskan dan berstruktur. Bimbingan alat berfikir perlu diteruskan.',
      status: 'Selesai',
      createdAt: '2026-01-20T09:35:00.000Z',
      updatedAt: '2026-01-20T09:40:00.000Z',
    },
    {
      id: 'smkb-2026-002',
      namaPencerap: 'En. Roslan bin Awang',
      jawatanPencerap: 'Penolong Kanan Pentadbiran (PK1)',
      tarikhPencerapan: '2026-02-12',
      masaPencerapan: '10:00 - 11:00 Pagi',
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',
      namaGuru: 'Pn. Siti Nurhaliza binti Mat Nor',
      jantinaGuru: 'Perempuan',
      opsyenGuru: 'Sains',
      mataPelajaran: 'Sains',
      bilMuridHadir: 25,
      bilMuridSebenar: 26,
      tingkatan: 'Tingkatan 4 Al-Farabi',
      tajukTopik: 'Bab 4: Tenaga Lestari dan Pemuliharaan Alam',
      masaPdP: '10:00 - 11:00 Pagi',
      skor1_1: 5,
      skor1_2: 5,
      skor1_3: 5,
      skor1_4: 4,
      skor2_1: 5,
      skor2_2: 5,
      skor2_3: 5,
      skor2_4: 4,
      skor2_5: 4,
      skor3_1: 5,
      skorMurid: [5, 4, 4, 5, 4, 4, 5, 4, 4, 4],
      refleksiPdP: 'Murid sangat aktif menggunakan peta i-Think dan membina soalan aras tinggi.',
      perancanganPenambahbaikan: 'Akan menyediakan kad tugasan perbezaan aras untuk bimbingan tambahan.',
      rumusanPencerap: 'Peningkatan ketara dalam penglibatan murid dan penyoalan KBAT.',
      status: 'Selesai',
      createdAt: '2026-02-12T11:10:00.000Z',
      updatedAt: '2026-02-12T11:15:00.000Z',
    },
    {
      id: 'smkb-2026-003',
      namaPencerap: 'Pn. Halimah binti Kassim',
      jawatanPencerap: 'Pengetua',
      tarikhPencerapan: '2026-02-18',
      masaPencerapan: '08:00 - 09:00 Pagi',
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',
      namaGuru: 'En. Azman bin Zulkifli',
      jantinaGuru: 'Lelaki',
      opsyenGuru: 'Matematik',
      mataPelajaran: 'Matematik',
      bilMuridHadir: 28,
      bilMuridSebenar: 30,
      tingkatan: 'Tingkatan 5 Ibnu Sina',
      tajukTopik: 'Bab 5: Garis Lurus dan Penaakulan Geometri',
      masaPdP: '08:00 - 09:00 Pagi',
      skor1_1: 5,
      skor1_2: 4,
      skor1_3: 5,
      skor1_4: 5,
      skor2_1: 5,
      skor2_2: 5,
      skor2_3: 4,
      skor2_4: 5,
      skor2_5: 5,
      skor3_1: 5,
      skorMurid: [5, 5, 4, 5, 5, 4, 5, 5, 4, 5],
      refleksiPdP: 'Murid berupaya menyelesaikan masalah bukan rutin secara berkumpulan dengan cekap.',
      perancanganPenambahbaikan: 'Meneruskan modul soalan KBAT SPM format terkini.',
      rumusanPencerap: 'Pengajaran cemerlang. Penguasaan konsep mantap dan murid berfikir secara kritis.',
      status: 'Selesai',
      createdAt: '2026-02-18T09:15:00.000Z',
      updatedAt: '2026-02-18T09:20:00.000Z',
    },
    {
      id: 'smkb-2026-004',
      namaPencerap: 'En. Mohd Ridzuan bin Salleh',
      jawatanPencerap: 'Guru Kanan Mata Pelajaran (GKMP) Bahasa',
      tarikhPencerapan: '2026-03-04',
      masaPencerapan: '09:00 - 10:00 Pagi',
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',
      namaGuru: 'Cik Dayang Suriati binti Ismail',
      jantinaGuru: 'Perempuan',
      opsyenGuru: 'Bahasa Melayu',
      mataPelajaran: 'Bahasa Melayu',
      bilMuridHadir: 27,
      bilMuridSebenar: 27,
      tingkatan: 'Tingkatan 3 Al-Khawarizmi',
      tajukTopik: 'Karangan Respons Terbuka: Isu Keselamatan Perairan & Komuniti',
      masaPdP: '09:00 - 10:00 Pagi',
      skor1_1: 4,
      skor1_2: 4,
      skor1_3: 4,
      skor1_4: 3,
      skor2_1: 4,
      skor2_2: 4,
      skor2_3: 3,
      skor2_4: 3,
      skor2_5: 3,
      skor3_1: 3,
      skorMurid: [3, 4, 3, 3, 4, 3, 3, 4, 3, 3],
      refleksiPdP: 'Murid memerlukan teknik penyoalan mencapah bagi merangsang idea karangan kritis.',
      perancanganPenambahbaikan: 'Akan mengadakan bimbingan PLC bersama panitia mengenai teknik penyoalan 6 Thinking Hats.',
      rumusanPencerap: 'Pengurusan kelas baik. Perlu mempertingkatkan soalan provokasi minda untuk KBAT.',
      status: 'Selesai',
      createdAt: '2026-03-04T10:15:00.000Z',
      updatedAt: '2026-03-04T10:20:00.000Z',
    },
    {
      id: 'smkb-2026-005',
      namaPencerap: 'Pn. Halimah binti Kassim',
      jawatanPencerap: 'Pengetua',
      tarikhPencerapan: '2026-03-19',
      masaPencerapan: '10:30 - 11:30 Pagi',
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',
      namaGuru: 'En. Lawrence Wong',
      jantinaGuru: 'Lelaki',
      opsyenGuru: 'Bahasa Inggeris',
      mataPelajaran: 'Bahasa Inggeris',
      bilMuridHadir: 22,
      bilMuridSebenar: 24,
      tingkatan: 'Tingkatan 4 Al-Farabi',
      tajukTopik: 'Speaking & Debate: Sustainable Tourism in Northern Borneo',
      masaPdP: '10:30 - 11:30 Pagi',
      skor1_1: 4,
      skor1_2: 4,
      skor1_3: 4,
      skor1_4: 4,
      skor2_1: 5,
      skor2_2: 4,
      skor2_3: 4,
      skor2_4: 4,
      skor2_5: 4,
      skor3_1: 4,
      skorMurid: [4, 4, 4, 4, 4, 3, 4, 4, 3, 4],
      refleksiPdP: 'Murid yakin berhujah menggunakan bahasa sasaran dalam konteks komuniti setempat.',
      perancanganPenambahbaikan: 'Menyediakan kad frasa sokongan bagi murid yang kurang lancar.',
      rumusanPencerap: 'Aktiviti perdebatan meja bulat menggalakkan pemikiran kritis aras tinggi.',
      status: 'Selesai',
      createdAt: '2026-03-19T11:40:00.000Z',
      updatedAt: '2026-03-19T11:45:00.000Z',
    },
    {
      id: 'smkb-2026-006',
      namaPencerap: 'En. Roslan bin Awang',
      jawatanPencerap: 'Penolong Kanan Pentadbiran (PK1)',
      tarikhPencerapan: '2026-04-08',
      masaPencerapan: '08:30 - 09:30 Pagi',
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',
      namaGuru: 'Ustaz Ahmad Fauzi bin Daud',
      jantinaGuru: 'Lelaki',
      opsyenGuru: 'Pendidikan Islam',
      mataPelajaran: 'Pendidikan Islam',
      bilMuridHadir: 25,
      bilMuridSebenar: 25,
      tingkatan: 'Tingkatan 2 Al-Biruni',
      tajukTopik: 'Sirah: Strategi Hijrah dan Pengajaran untuk Murid Generasi Madani',
      masaPdP: '08:30 - 09:30 Pagi',
      skor1_1: 4,
      skor1_2: 4,
      skor1_3: 4,
      skor1_4: 3,
      skor2_1: 5,
      skor2_2: 4,
      skor2_3: 3,
      skor2_4: 3,
      skor2_5: 3,
      skor3_1: 4,
      skorMurid: [4, 4, 3, 3, 4, 3, 3, 5, 3, 3],
      refleksiPdP: 'Nilai murni berjaya dihayati murid. Perlu tambah aktiviti penaakulan punca dan akibat.',
      perancanganPenambahbaikan: 'Akan menggunakan Peta Alir dan Peta Pelbagai Alir dalam sesi PdP akan datang.',
      rumusanPencerap: 'Suasana kelas kondusif. Bimbingan berterusan mengenai alat berfikir amat digalakkan.',
      status: 'Selesai',
      createdAt: '2026-04-08T09:40:00.000Z',
      updatedAt: '2026-04-08T09:45:00.000Z',
    },
    {
      id: 'smkb-2026-007',
      namaPencerap: 'Pn. Halimah binti Kassim',
      jawatanPencerap: 'Pengetua',
      tarikhPencerapan: '2026-04-15',
      masaPencerapan: '09:00 - 10:00 Pagi',
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',
      namaGuru: 'En. Azman bin Zulkifli',
      jantinaGuru: 'Lelaki',
      opsyenGuru: 'Matematik',
      mataPelajaran: 'Fizik',
      bilMuridHadir: 18,
      bilMuridSebenar: 18,
      tingkatan: 'Tingkatan 4 Al-Farabi',
      tajukTopik: 'Daya dan Gerakan: Reka Bentuk Kenderaan Aerodinamik',
      masaPdP: '09:00 - 10:00 Pagi',
      skor1_1: 5,
      skor1_2: 5,
      skor1_3: 5,
      skor1_4: 5,
      skor2_1: 5,
      skor2_2: 5,
      skor2_3: 5,
      skor2_4: 5,
      skor2_5: 5,
      skor3_1: 5,
      skorMurid: [5, 5, 5, 4, 5, 5, 5, 5, 4, 5],
      refleksiPdP: 'Murid mereka bentuk prototaip kereta belon dan menganalisis hukum gerakan Newton ketiga.',
      perancanganPenambahbaikan: 'Mencalonkan aktiviti ini ke pameran inovasi STEM peringkat daerah Kudat.',
      rumusanPencerap: 'Pembudayaan KBAT yang sungguh cemerlang, inovatif, dan berpusatkan murid!',
      status: 'Selesai',
      createdAt: '2026-04-15T10:15:00.000Z',
      updatedAt: '2026-04-15T10:20:00.000Z',
    },
  ];

  return recordsRaw.map((r) => {
    const scores = calculateScores(r);
    return {
      ...r,
      ...scores,
    };
  });
}

// REST API Endpoints for School Database
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), school: 'SMK BANGGI (XEA6062)' });
});

// Re-seed endpoint to restore sample data
app.post('/api/seed', (_req: Request, res: Response) => {
  try {
    const sample = getInitialSeedData();
    writeDatabase(sample);
    res.json({ success: true, message: 'Pangkalan data berjaya diset semula dengan rekod sampel SMK Banggi', count: sample.length });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal menetapkan semula data sampel' });
  }
});

// List all observation records with search and filter
app.get('/api/pencerapan', (req: Request, res: Response) => {
  try {
    const records = readDatabase();
    const query = ((req.query.q as string) || '').toLowerCase().trim();
    const guru = ((req.query.guru as string) || '').toLowerCase().trim();
    const tahap = (req.query.tahap as string) || '';
    const tingkatan = (req.query.tingkatan as string) || '';
    const status = (req.query.status as string) || '';

    let filtered = records;

    if (query) {
      filtered = filtered.filter(
        (r) =>
          r.namaGuru?.toLowerCase().includes(query) ||
          r.mataPelajaran?.toLowerCase().includes(query) ||
          r.namaPencerap?.toLowerCase().includes(query) ||
          r.tajukTopik?.toLowerCase().includes(query) ||
          r.tingkatan?.toLowerCase().includes(query)
      );
    }

    if (guru) {
      filtered = filtered.filter((r) => r.namaGuru?.toLowerCase().includes(guru));
    }

    if (tahap) {
      filtered = filtered.filter((r) => r.tahapPencapaian === tahap);
    }

    if (tingkatan) {
      filtered = filtered.filter((r) => r.tingkatan?.includes(tingkatan));
    }

    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }

    // Sort by updated/created date descending
    filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    res.json({
      success: true,
      total: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error('Failed to get pencerapan records:', error);
    res.status(500).json({ success: false, error: 'Ralat mendapatkan rekod pencerapan' });
  }
});

// Reporting & Analytics Dashboard Endpoint with Date Range, Subject, Evaluator, and Teacher Filters
app.get('/api/reports/dashboard', (req: Request, res: Response) => {
  try {
    const records = readDatabase();
    const startDate = (req.query.startDate as string) || '';
    const endDate = (req.query.endDate as string) || '';
    const subject = ((req.query.subject || req.query.mataPelajaran) as string) || '';
    const evaluator = ((req.query.evaluator || req.query.pencerap) as string) || '';
    const teacher = ((req.query.teacher || req.query.guru) as string) || '';
    const tingkatan = (req.query.tingkatan as string) || '';

    let filtered = [...records];

    if (startDate) {
      filtered = filtered.filter((r) => r.tarikhPencerapan >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((r) => r.tarikhPencerapan <= endDate);
    }
    if (subject && subject !== 'Semua') {
      filtered = filtered.filter((r) => r.mataPelajaran === subject);
    }
    if (evaluator && evaluator !== 'Semua') {
      filtered = filtered.filter((r) => r.namaPencerap?.includes(evaluator) || r.jawatanPencerap?.includes(evaluator));
    }
    if (teacher && teacher !== 'Semua') {
      filtered = filtered.filter((r) => r.namaGuru?.toLowerCase().includes(teacher.toLowerCase()));
    }
    if (tingkatan && tingkatan !== 'Semua') {
      filtered = filtered.filter((r) => r.tingkatan?.includes(tingkatan));
    }

    const total = filtered.length;

    if (total === 0) {
      res.json({
        total: 0,
        purataPeratus: 0,
        domainAverages: { perancangan: 0, pelaksanaan: 0, refleksi: 0, murid: 0 },
        tahapDistribusi: {
          Cemerlang: 0,
          Baik: 0,
          Sederhana: 0,
          'Tahap Minimum': 0,
          'Tidak Memenuhi Tahap Minimum': 0,
        },
        monthlyTrends: [],
        teacherScores: [],
        evaluatorStats: [],
        subjectStats: [],
        itemAnalysis: [],
        areasForDevelopment: [],
        schoolStrengths: [],
        filteredRecords: [],
      });
      return;
    }

    // 1. Overall & Domain Averages
    let sumScore = 0;
    let sumPerancangan = 0;
    let sumPelaksanaan = 0;
    let sumRefleksi = 0;
    let sumMurid = 0;

    const tahapMap: Record<string, number> = {
      Cemerlang: 0,
      Baik: 0,
      Sederhana: 0,
      'Tahap Minimum': 0,
      'Tidak Memenuhi Tahap Minimum': 0,
    };

    // Item-level accumulator (Teacher items 1.1 to 3.1, and Student items 1 to 10)
    const itemSums: Record<string, { sum: number; count: number; title: string; domain: string; maxScore: number; code: string }> = {
      skor1_1: { sum: 0, count: 0, title: 'Menetapkan objektif PdP bercirikan KBAT', domain: 'Perancangan', maxScore: 5, code: '1.1' },
      skor1_2: { sum: 0, count: 0, title: 'Merancang set induksi menggalakkan KBAT', domain: 'Perancangan', maxScore: 5, code: '1.2' },
      skor1_3: { sum: 0, count: 0, title: 'Merancang aktiviti pembelajaran berpusatkan murid', domain: 'Perancangan', maxScore: 5, code: '1.3' },
      skor1_4: { sum: 0, count: 0, title: 'Merancang pentaksiran bercirikan KBAT', domain: 'Perancangan', maxScore: 5, code: '1.4' },
      skor2_1: { sum: 0, count: 0, title: 'Menyediakan persekitaran PdP kondusif', domain: 'Pelaksanaan', maxScore: 5, code: '2.1' },
      skor2_2: { sum: 0, count: 0, title: 'Melibatkan murid secara aktif dalam PdP', domain: 'Pelaksanaan', maxScore: 5, code: '2.2' },
      skor2_3: { sum: 0, count: 0, title: 'Menggunakan teknik penyoalan menggalakkan murid berfikir', domain: 'Pelaksanaan', maxScore: 5, code: '2.3' },
      skor2_4: { sum: 0, count: 0, title: 'Menggunakan alat berfikir (i-Think) semasa PdP', domain: 'Pelaksanaan', maxScore: 5, code: '2.4' },
      skor2_5: { sum: 0, count: 0, title: 'Melaksanakan pentaksiran bercirikan KBAT', domain: 'Pelaksanaan', maxScore: 5, code: '2.5' },
      skor3_1: { sum: 0, count: 0, title: 'Melaksanakan amalan refleksi PdP & tindakan susulan', domain: 'Refleksi', maxScore: 5, code: '3.1' },
    };

    const studentItemTitles = [
      'Murid memberi pendapat munasabah & logik berkaitan isi pelajaran',
      'Murid berupaya merespon soalan dikemukakan guru/rakan',
      'Murid menggalakkan rakan lain berkongsi pendapat aktif',
      'Murid menunjukkan kecenderungan pembelajaran kendiri',
      'Murid berjaya menyelesaikan tugasan aktiviti PdP',
      'Murid menghubungkait pengetahuan sedia ada dengan baru',
      'Murid berupaya menggunakan alat berfikir bersesuaian',
      'Murid mengaplikasikan nilai murni semasa PdP',
      'Murid menilai hasil kerja sendiri/rakan & buat penambahbaikan',
      'Murid bertanya soalan kepada guru atau rakan',
    ];

    studentItemTitles.forEach((t, i) => {
      itemSums[`murid_${i + 1}`] = {
        sum: 0,
        count: 0,
        title: t,
        domain: 'Murid Aktif',
        maxScore: 5,
        code: `M${i + 1}`,
      };
    });

    // Grouping by Teacher
    const teacherMap: Record<
      string,
      {
        namaGuru: string;
        jantina: string;
        opsyen: string;
        mataPelajaran: string;
        count: number;
        totalScore: number;
        totalPerancangan: number;
        totalPelaksanaan: number;
        totalRefleksi: number;
        totalMurid: number;
        records: { id: string; date: string; score: number; peratus: number; tahap: string; subject: string }[];
      }
    > = {};

    // Grouping by Evaluator
    const evaluatorMap: Record<string, { name: string; jawatan: string; count: number; totalScore: number }> = {};

    // Grouping by Subject
    const subjectMap: Record<string, { subject: string; count: number; totalScore: number }> = {};

    // Grouping by Month for Trends
    const monthMap: Record<string, { key: string; label: string; count: number; totalScore: number; sortKey: string }> = {};

    filtered.forEach((r) => {
      sumScore += r.peratusPencapaian || 0;
      sumPerancangan += r.skorPerancangan || 0;
      sumPelaksanaan += r.skorPelaksanaan || 0;
      sumRefleksi += r.skorRefleksi || 0;
      sumMurid += r.skorMuridTotal || 0;

      if (tahapMap[r.tahapPencapaian] !== undefined) {
        tahapMap[r.tahapPencapaian]++;
      } else {
        tahapMap[r.tahapPencapaian] = 1;
      }

      // Items accumulation
      (['skor1_1', 'skor1_2', 'skor1_3', 'skor1_4', 'skor2_1', 'skor2_2', 'skor2_3', 'skor2_4', 'skor2_5', 'skor3_1'] as const).forEach(
        (k) => {
          if (r[k]) {
            itemSums[k].sum += Number(r[k]);
            itemSums[k].count++;
          }
        }
      );

      if (Array.isArray(r.skorMurid)) {
        r.skorMurid.forEach((ms, mi) => {
          const mk = `murid_${mi + 1}`;
          if (itemSums[mk] && ms) {
            itemSums[mk].sum += Number(ms);
            itemSums[mk].count++;
          }
        });
      }

      // Teacher accumulation
      const tKey = r.namaGuru ? r.namaGuru.trim() : 'Guru Tanpa Nama';
      if (!teacherMap[tKey]) {
        teacherMap[tKey] = {
          namaGuru: tKey,
          jantina: r.jantinaGuru || 'Lelaki',
          opsyen: r.opsyenGuru || '-',
          mataPelajaran: r.mataPelajaran || '-',
          count: 0,
          totalScore: 0,
          totalPerancangan: 0,
          totalPelaksanaan: 0,
          totalRefleksi: 0,
          totalMurid: 0,
          records: [],
        };
      }
      teacherMap[tKey].count++;
      teacherMap[tKey].totalScore += r.peratusPencapaian || 0;
      teacherMap[tKey].totalPerancangan += r.skorPerancangan || 0;
      teacherMap[tKey].totalPelaksanaan += r.skorPelaksanaan || 0;
      teacherMap[tKey].totalRefleksi += r.skorRefleksi || 0;
      teacherMap[tKey].totalMurid += r.skorMuridTotal || 0;
      teacherMap[tKey].records.push({
        id: r.id,
        date: r.tarikhPencerapan,
        score: r.skorKeseluruhan,
        peratus: r.peratusPencapaian,
        tahap: r.tahapPencapaian,
        subject: r.mataPelajaran,
      });

      // Evaluator accumulation
      const eKey = r.namaPencerap ? r.namaPencerap.trim() : 'Pencerap Lain';
      if (!evaluatorMap[eKey]) {
        evaluatorMap[eKey] = {
          name: eKey,
          jawatan: r.jawatanPencerap || 'Pencerap',
          count: 0,
          totalScore: 0,
        };
      }
      evaluatorMap[eKey].count++;
      evaluatorMap[eKey].totalScore += r.peratusPencapaian || 0;

      // Subject accumulation
      const sKey = r.mataPelajaran ? r.mataPelajaran.trim() : 'Lain-lain';
      if (!subjectMap[sKey]) {
        subjectMap[sKey] = { subject: sKey, count: 0, totalScore: 0 };
      }
      subjectMap[sKey].count++;
      subjectMap[sKey].totalScore += r.peratusPencapaian || 0;

      // Month accumulation
      if (r.tarikhPencerapan) {
        const d = new Date(r.tarikhPencerapan);
        if (!isNaN(d.getTime())) {
          const monthYear = d.toLocaleDateString('ms-MY', { month: 'short', year: 'numeric' });
          const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthMap[sortKey]) {
            monthMap[sortKey] = {
              key: sortKey,
              label: monthYear,
              count: 0,
              totalScore: 0,
              sortKey,
            };
          }
          monthMap[sortKey].count++;
          monthMap[sortKey].totalScore += r.peratusPencapaian || 0;
        }
      }
    });

    // Transform Teachers List
    const teacherScores = Object.values(teacherMap).map((t) => {
      const avgScore = Math.round((t.totalScore / t.count) * 10) / 10;
      let tahapPencapaian = 'Tidak Memenuhi Tahap Minimum';
      if (avgScore >= 81) tahapPencapaian = 'Cemerlang';
      else if (avgScore >= 61) tahapPencapaian = 'Baik';
      else if (avgScore >= 51) tahapPencapaian = 'Sederhana';
      else if (avgScore >= 41) tahapPencapaian = 'Tahap Minimum';

      // Sort records by date descending
      t.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Trajectory calculation (compare latest with first record)
      let trajectory: 'up' | 'down' | 'stable' = 'stable';
      if (t.records.length >= 2) {
        const diff = t.records[0].peratus - t.records[t.records.length - 1].peratus;
        if (diff > 2) trajectory = 'up';
        else if (diff < -2) trajectory = 'down';
      }

      return {
        namaGuru: t.namaGuru,
        jantina: t.jantina,
        opsyen: t.opsyen,
        mataPelajaran: t.mataPelajaran,
        count: t.count,
        avgScore,
        tahapPencapaian,
        avgPerancangan: Math.round((t.totalPerancangan / t.count) * 10) / 10,
        avgPelaksanaan: Math.round((t.totalPelaksanaan / t.count) * 10) / 10,
        avgRefleksi: Math.round((t.totalRefleksi / t.count) * 10) / 10,
        avgMurid: Math.round((t.totalMurid / t.count) * 10) / 10,
        latestDate: t.records[0]?.date || '',
        trajectory,
        history: t.records,
      };
    });

    // Sort teachers descending by average score
    teacherScores.sort((a, b) => b.avgScore - a.avgScore);

    // Transform Monthly Trends
    const monthlyTrends = Object.values(monthMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map((m) => ({
        month: m.label,
        count: m.count,
        avgScore: Math.round((m.totalScore / m.count) * 10) / 10,
      }));

    // Transform Evaluator Stats
    const evaluatorStats = Object.values(evaluatorMap)
      .map((e) => ({
        name: e.name,
        jawatan: e.jawatan,
        count: e.count,
        avgScore: Math.round((e.totalScore / e.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    // Transform Subject Stats
    const subjectStats = Object.values(subjectMap)
      .map((s) => ({
        subject: s.subject,
        count: s.count,
        avgScore: Math.round((s.totalScore / s.count) * 10) / 10,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    // Item-level Analysis
    const itemAnalysis = Object.entries(itemSums).map(([k, v]) => {
      const avg = v.count > 0 ? Math.round((v.sum / v.count) * 100) / 100 : 0;
      const percentage = Math.round((avg / v.maxScore) * 100 * 10) / 10;
      return {
        key: k,
        code: v.code,
        title: v.title,
        domain: v.domain,
        avgScore: avg,
        maxScore: v.maxScore,
        percentage,
      };
    });

    // Sort to extract Areas for Development (lowest scoring items)
    const sortedByScore = [...itemAnalysis].sort((a, b) => a.percentage - b.percentage);
    const areasForDevelopment = sortedByScore.slice(0, 3).map((item) => {
      let suggestion = '';
      if (item.code === '2.4' || item.title.includes('alat berfikir')) {
        suggestion = 'Laksanakan Bengkel PLC Pemantapan 8 Peta Pemikiran i-Think dalam penulisan RPH dan aktiviti bilik darjah.';
      } else if (item.code === '2.3' || item.title.includes('penyoalan')) {
        suggestion = 'Bimbingan teknik penyoalan bertingkat aras tinggi (Menganalisis & Menilai) mengikut Taksonomi Bloom disemak.';
      } else if (item.code === '3.1' || item.domain === 'Refleksi') {
        suggestion = 'Latihan penulisan refleksi terperinci berasaskan impak pembelajaran murid dan tindakan intervensi susulan.';
      } else if (item.code === '1.4' || item.code === '2.5' || item.title.includes('pentaksiran')) {
        suggestion = 'Pendedahan teknik pentaksiran bilik darjah (PBD) formatif bercirikan KBAT secara lisan dan hasil kerja murid.';
      } else {
        suggestion = 'Aktiviti bimbingan rakan sejawat (Peer Coaching) dan amalan perkongsian Learning Walk panitia.';
      }
      return {
        ...item,
        suggestion,
      };
    });

    // Top School Strengths (highest scoring items)
    const schoolStrengths = [...itemAnalysis].sort((a, b) => b.percentage - a.percentage).slice(0, 3);

    res.json({
      success: true,
      total,
      purataPeratus: Math.round((sumScore / total) * 10) / 10,
      domainAverages: {
        perancangan: Math.round((sumPerancangan / total) * 10) / 10,
        pelaksanaan: Math.round((sumPelaksanaan / total) * 10) / 10,
        refleksi: Math.round((sumRefleksi / total) * 10) / 10,
        murid: Math.round((sumMurid / total) * 10) / 10,
      },
      tahapDistribusi: tahapMap,
      monthlyTrends,
      teacherScores,
      evaluatorStats,
      subjectStats,
      itemAnalysis,
      areasForDevelopment,
      schoolStrengths,
      filterApplied: {
        startDate,
        endDate,
        subject,
        evaluator,
        teacher,
        tingkatan,
      },
    });
  } catch (error) {
    console.error('Failed to generate report analytics:', error);
    res.status(500).json({ success: false, error: 'Ralat menjana laporan dashboard' });
  }
});

// Get single observation record
app.get('/api/pencerapan/:id', (req: Request, res: Response) => {
  try {
    const records = readDatabase();
    const record = records.find((r) => r.id === req.params.id);
    if (!record) {
      res.status(404).json({ success: false, error: 'Rekod tidak dijumpai' });
      return;
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ralat mendapatkan rekod' });
  }
});

// Save or Update observation record
app.post('/api/pencerapan', (req: Request, res: Response) => {
  try {
    const payload = req.body as Partial<PencerapanRecord>;
    const records = readDatabase();
    const now = new Date().toISOString();

    const calculatedScores = calculateScores(payload);

    let recordId = payload.id;
    let existingIndex = -1;

    if (recordId) {
      existingIndex = records.findIndex((r) => r.id === recordId);
    } else {
      recordId = 'smkb-' + Date.now();
    }

    const updatedRecord: PencerapanRecord = {
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',

      namaPencerap: '',
      jawatanPencerap: '',
      tarikhPencerapan: new Date().toISOString().split('T')[0],
      masaPencerapan: '',

      namaGuru: '',
      jantinaGuru: 'Lelaki',
      opsyenGuru: '',

      mataPelajaran: '',
      bilMuridHadir: 0,
      bilMuridSebenar: 0,
      tingkatan: '',
      tajukTopik: '',
      masaPdP: '',

      skor1_1: 0,
      skor1_2: 0,
      skor1_3: 0,
      skor1_4: 0,

      skor2_1: 0,
      skor2_2: 0,
      skor2_3: 0,
      skor2_4: 0,
      skor2_5: 0,

      skor3_1: 0,

      skorMurid: Array(10).fill(0),

      refleksiPdP: '',
      perancanganPenambahbaikan: '',
      rumusanPencerap: '',

      status: payload.status || 'Draf',

      ...payload,
      ...calculatedScores,
      id: recordId,
      createdAt: existingIndex >= 0 ? records[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      records[existingIndex] = updatedRecord;
    } else {
      records.unshift(updatedRecord);
    }

    writeDatabase(records);

    res.json({
      success: true,
      message: 'Rekod berjaya disimpan ke pangkalan data SMK Banggi',
      data: updatedRecord,
    });
  } catch (error) {
    console.error('Failed to save pencerapan record:', error);
    res.status(500).json({ success: false, error: 'Gagal menyimpan rekod pencerapan' });
  }
});

// Delete an observation record
app.delete('/api/pencerapan/:id', (req: Request, res: Response) => {
  try {
    const records = readDatabase();
    const filtered = records.filter((r) => r.id !== req.params.id);
    if (filtered.length === records.length) {
      res.status(404).json({ success: false, error: 'Rekod tidak dijumpai' });
      return;
    }
    writeDatabase(filtered);
    res.json({ success: true, message: 'Rekod berjaya dipadam' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memadam rekod' });
  }
});

// Analytics & Summary statistics for SMK Banggi
app.get('/api/stats', (_req: Request, res: Response) => {
  try {
    const records = readDatabase();
    const total = records.length;
    if (total === 0) {
      res.json({
        total: 0,
        purataPeratus: 0,
        tahapDistribusi: {},
        purataDomain: { perancangan: 0, pelaksanaan: 0, refleksi: 0, murid: 0 },
        bilGuru: 0,
        selesai: 0,
        draf: 0,
      });
      return;
    }

    let sumPeratus = 0;
    let sumPerancangan = 0;
    let sumPelaksanaan = 0;
    let sumRefleksi = 0;
    let sumMurid = 0;
    let selesaiCount = 0;
    let drafCount = 0;

    const tahapMap: Record<string, number> = {
      Cemerlang: 0,
      Baik: 0,
      Sederhana: 0,
      'Tahap Minimum': 0,
      'Tidak Memenuhi Tahap Minimum': 0,
    };

    const uniqueGurus = new Set<string>();

    for (const r of records) {
      sumPeratus += r.peratusPencapaian || 0;
      sumPerancangan += r.skorPerancangan || 0;
      sumPelaksanaan += r.skorPelaksanaan || 0;
      sumRefleksi += r.skorRefleksi || 0;
      sumMurid += r.skorMuridTotal || 0;

      if (r.status === 'Selesai') selesaiCount++;
      else drafCount++;

      if (r.namaGuru) uniqueGurus.add(r.namaGuru.trim());
      if (r.tahapPencapaian && tahapMap[r.tahapPencapaian] !== undefined) {
        tahapMap[r.tahapPencapaian]++;
      } else if (r.tahapPencapaian) {
        tahapMap[r.tahapPencapaian] = (tahapMap[r.tahapPencapaian] || 0) + 1;
      }
    }

    res.json({
      success: true,
      total,
      selesai: selesaiCount,
      draf: drafCount,
      bilGuru: uniqueGurus.size,
      purataPeratus: Math.round((sumPeratus / total) * 10) / 10,
      purataDomain: {
        perancangan: Math.round((sumPerancangan / total) * 10) / 10,
        pelaksanaan: Math.round((sumPelaksanaan / total) * 10) / 10,
        refleksi: Math.round((sumRefleksi / total) * 10) / 10,
        murid: Math.round((sumMurid / total) * 10) / 10,
      },
      tahapDistribusi: tahapMap,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ralat menjana statistik' });
  }
});

// Export all records to CSV for school reporting
app.get('/api/export/csv', (req: Request, res: Response) => {
  try {
    const records = readDatabase();
    const startDate = (req.query.startDate as string) || '';
    const endDate = (req.query.endDate as string) || '';
    const subject = ((req.query.subject || req.query.mataPelajaran) as string) || '';
    const evaluator = ((req.query.evaluator || req.query.pencerap) as string) || '';

    let filtered = records;
    if (startDate) filtered = filtered.filter((r) => r.tarikhPencerapan >= startDate);
    if (endDate) filtered = filtered.filter((r) => r.tarikhPencerapan <= endDate);
    if (subject && subject !== 'Semua') filtered = filtered.filter((r) => r.mataPelajaran === subject);
    if (evaluator && evaluator !== 'Semua') filtered = filtered.filter((r) => r.namaPencerap?.includes(evaluator));

    const headers = [
      'ID',
      'Tarikh',
      'Nama Guru',
      'Jantina',
      'Opsyen',
      'Mata Pelajaran',
      'Tingkatan',
      'Tajuk/Topik',
      'Nama Pencerap',
      'Jawatan Pencerap',
      'Skor Perancangan (20)',
      'Skor Pelaksanaan (25)',
      'Skor Refleksi Guru (5)',
      'Skor Murid Aktif (50)',
      'Jumlah Skor (100)',
      'Peratus (%)',
      'Tahap KBAT',
      'Status',
    ];

    const escapeCsv = (val: string | number | undefined) => {
      const s = String(val ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = filtered.map((r) =>
      [
        r.id,
        r.tarikhPencerapan,
        r.namaGuru,
        r.jantinaGuru,
        r.opsyenGuru,
        r.mataPelajaran,
        r.tingkatan,
        r.tajukTopik,
        r.namaPencerap,
        r.jawatanPencerap,
        r.skorPerancangan,
        r.skorPelaksanaan,
        r.skorRefleksi,
        r.skorMuridTotal,
        r.skorKeseluruhan,
        r.peratusPencapaian,
        r.tahapPencapaian,
        r.status,
      ]
        .map(escapeCsv)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Laporan_Pencerapan_ISPPK_2026_SMK_Banggi_${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    res.status(500).send('Ralat eksport CSV');
  }
});

// Teacher In-App Messaging & Findings Summary Storage
const MESSAGES_FILE = path.join(DATA_DIR, 'mesej_guru_smk_banggi.json');

export interface TeacherMessage {
  id: string;
  pencerapanId: string;
  namaGuru: string;
  emelGuru?: string;
  namaPencerap: string;
  jawatanPencerap: string;
  tarikhPencerapan: string;
  mataPelajaran: string;
  tingkatan: string;
  tajukTopik: string;
  skorKeseluruhan: number;
  peratusPencapaian: number;
  tahapPencapaian: string;
  domainScores: {
    perancangan: number;
    pelaksanaan: number;
    refleksi: number;
    murid: number;
  };
  tajukMesej: string;
  kandunganMesej: string;
  kekuatan: string[];
  cadanganPenambahbaikan: string[];
  statusBaca: boolean;
  tarikhDihantar: string;
  tarikhDibaca?: string;
  maklumBalasGuru?: string;
}

function readMessages(): TeacherMessage[] {
  try {
    if (!fs.existsSync(MESSAGES_FILE)) {
      const initial: TeacherMessage[] = [
        {
          id: 'msg-001',
          pencerapanId: 'smkb-2026-002',
          namaGuru: 'Pn. Siti Nurhaliza binti Mat Nor',
          emelGuru: 'g-sitinurhaliza@moe-dl.edu.my',
          namaPencerap: 'En. Roslan bin Awang',
          jawatanPencerap: 'Penolong Kanan Pentadbiran (PK1)',
          tarikhPencerapan: '2026-02-12',
          mataPelajaran: 'Sains',
          tingkatan: 'Tingkatan 4 Al-Farabi',
          tajukTopik: 'Bab 4: Tenaga Lestari dan Pemuliharaan Alam',
          skorKeseluruhan: 90,
          peratusPencapaian: 90,
          tahapPencapaian: 'Cemerlang',
          domainScores: {
            perancangan: 19,
            pelaksanaan: 23,
            refleksi: 5,
            murid: 43,
          },
          tajukMesej: 'Dapatan Pencerapan PdP KBAT 2026: Sains Tingkatan 4 Al-Farabi',
          kandunganMesej:
            'Tahniah Pn. Siti Nurhaliza atas sesi PdP Sains yang sangat cemerlang (90%). Murid menunjukkan penglibatan aktif membincangkan tenaga lestari dengan penggunaan Peta Pemikiran i-Think yang amat berkesan. Teruskan usaha murni ini!',
          kekuatan: [
            'Penggunaan Peta Buih Berganda (i-Think) yang merangsang daya analitis murid.',
            'Aktiviti pembelajaran berpusatkan murid dengan perbincangan meja bulat.',
            'Suasana bilik darjah yang sangat kondusif dan menyeronokkan.',
          ],
          cadanganPenambahbaikan: [
            'Sediakan kad tugasan perbezaan aras untuk murid yang memerlukan bimbingan lanjut.',
            'Tingkatkan teknik penyoalan mencapah bagi mencetuskan inovasi penyelesaian isu tempatan Pulau Banggi.',
          ],
          statusBaca: true,
          tarikhDihantar: '2026-02-12T11:20:00.000Z',
          tarikhDibaca: '2026-02-12T14:30:00.000Z',
          maklumBalasGuru:
            'Terima kasih En. Roslan atas bimbingan dan maklum balas positif. Saya akan integrasikan kad tugasan berbeza aras dalam topik seterusnya.',
        },
      ];
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading messages file:', err);
    return [];
  }
}

function writeMessages(messages: TeacherMessage[]): void {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing messages file:', err);
    throw err;
  }
}

// In-App Messages Endpoints
app.get('/api/messages', (req: Request, res: Response) => {
  try {
    const messages = readMessages();
    const guru = ((req.query.guru as string) || '').toLowerCase().trim();
    const pencerapanId = (req.query.pencerapanId as string) || '';
    const unreadOnly = req.query.unreadOnly === 'true';

    let filtered = messages;
    if (guru) {
      filtered = filtered.filter((m) => m.namaGuru.toLowerCase().includes(guru));
    }
    if (pencerapanId) {
      filtered = filtered.filter((m) => m.pencerapanId === pencerapanId);
    }
    if (unreadOnly) {
      filtered = filtered.filter((m) => !m.statusBaca);
    }

    // Sort descending by sent date
    filtered.sort((a, b) => new Date(b.tarikhDihantar).getTime() - new Date(a.tarikhDihantar).getTime());

    res.json({
      success: true,
      total: filtered.length,
      unreadCount: filtered.filter((m) => !m.statusBaca).length,
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ralat mendapatkan mesej guru' });
  }
});

// Send new summary message to teacher in-app
app.post('/api/messages', (req: Request, res: Response) => {
  try {
    const payload = req.body as Partial<TeacherMessage>;
    const messages = readMessages();
    const now = new Date().toISOString();

    const newMessage: TeacherMessage = {
      id: payload.id || `msg-${Date.now()}`,
      pencerapanId: payload.pencerapanId || '',
      namaGuru: payload.namaGuru || '',
      emelGuru: payload.emelGuru || '',
      namaPencerap: payload.namaPencerap || '',
      jawatanPencerap: payload.jawatanPencerap || '',
      tarikhPencerapan: payload.tarikhPencerapan || now.split('T')[0],
      mataPelajaran: payload.mataPelajaran || '',
      tingkatan: payload.tingkatan || '',
      tajukTopik: payload.tajukTopik || '',
      skorKeseluruhan: Number(payload.skorKeseluruhan || 0),
      peratusPencapaian: Number(payload.peratusPencapaian || 0),
      tahapPencapaian: payload.tahapPencapaian || 'Baik',
      domainScores: payload.domainScores || { perancangan: 0, pelaksanaan: 0, refleksi: 0, murid: 0 },
      tajukMesej: payload.tajukMesej || `Rumusan Dapatan Pencerapan PdP KBAT: ${payload.mataPelajaran || ''}`,
      kandunganMesej: payload.kandunganMesej || '',
      kekuatan: Array.isArray(payload.kekuatan) ? payload.kekuatan : [],
      cadanganPenambahbaikan: Array.isArray(payload.cadanganPenambahbaikan) ? payload.cadanganPenambahbaikan : [],
      statusBaca: false,
      tarikhDihantar: now,
    };

    messages.unshift(newMessage);
    writeMessages(messages);

    res.json({
      success: true,
      message: 'Rumusan pencerapan berjaya dihantar ke peti mesej guru dalam aplikasi',
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghantar mesej kepada guru' });
  }
});

// Mark message as read & optional teacher feedback
app.patch('/api/messages/:id/read', (req: Request, res: Response) => {
  try {
    const messages = readMessages();
    const msg = messages.find((m) => m.id === req.params.id);
    if (!msg) {
      res.status(404).json({ success: false, error: 'Mesej tidak dijumpai' });
      return;
    }

    msg.statusBaca = true;
    msg.tarikhDibaca = new Date().toISOString();
    if (req.body.maklumBalasGuru) {
      msg.maklumBalasGuru = req.body.maklumBalasGuru;
    }

    writeMessages(messages);
    res.json({ success: true, message: 'Status mesej dikemas kini', data: msg });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengemas kini status mesej' });
  }
});

// Delete message
app.delete('/api/messages/:id', (req: Request, res: Response) => {
  try {
    const messages = readMessages();
    const filtered = messages.filter((m) => m.id !== req.params.id);
    if (filtered.length === messages.length) {
      res.status(404).json({ success: false, error: 'Mesej tidak dijumpai' });
      return;
    }
    writeMessages(filtered);
    res.json({ success: true, message: 'Mesej berjaya dipadam' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memadam mesej' });
  }
});

// Setup Vite in Dev or Serve Static in Prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server SMK Banggi e-Pencerapan berjalan di http://localhost:${PORT}`);
  });
}

startServer();
