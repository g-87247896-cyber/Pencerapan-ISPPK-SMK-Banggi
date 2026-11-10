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
  // 1. Perancangan (4 item)
  skor1_1: number; // 1.1 Menetapkan objektif PdP bercirikan KBAT
  skor1_2: number; // 1.2 Merancang set induksi yang menggalakkan KBAT
  skor1_3: number; // 1.3 Merancang aktiviti pembelajaran yang berpusatkan murid
  skor1_4: number; // 1.4 Merancang pentaksiran yang bercirikan KBAT

  // 2. Pelaksanaan (5 item)
  skor2_1: number; // 2.1 Menyediakan persekitaran PdP yang kondusif
  skor2_2: number; // 2.2 Melibatkan murid secara aktif dalam PdP / berpusatkan murid
  skor2_3: number; // 2.3 Menggunakan teknik penyoalan yang menggalakkan murid berfikir
  skor2_4: number; // 2.4 Menggunakan alat berfikir semasa PdP
  skor2_5: number; // 2.5 Melaksanakan pentaksiran bercirikan KBAT

  // 3. Refleksi (1 item)
  skor3_1: number; // 3.1 Melaksanakan refleksi PdP

  // Bahagian F: Rubrik Penilaian Murid (10 item x 1-5)
  skorMurid: number[];

  // Bahagian G: Skor & Pencapaian
  skorPerancangan: number; // max 20
  skorPelaksanaan: number; // max 25
  skorRefleksi: number; // max 5
  skorGuru: number; // max 50
  skorMuridTotal: number; // max 50
  skorKeseluruhan: number; // max 100
  peratusPencapaian: number; // %
  tahapPencapaian: string;

  // Bahagian H: Refleksi Temubual Guru
  refleksiPdP: string;
  perancanganPenambahbaikan: string;

  // Bahagian I: Rumusan Pencerap & Tandatangan
  rumusanPencerap: string;
  tandatanganPencerap?: string;
  tandatanganGuru?: string;

  // 4 Gambar Evidens PdP
  gambar1?: PhotoEvidence;
  gambar2?: PhotoEvidence;
  gambar3?: PhotoEvidence;
  gambar4?: PhotoEvidence;

  status: 'Draf' | 'Selesai';
  createdAt: string;
  updatedAt: string;
}

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

export interface PhotoEvidence {
  data: string; // base64
  caption: string;
  timestamp: string;
}

export interface RubrikDescriptor {
  skor: number;
  label: 'Kesedaran' | 'Asas' | 'Pertengahan' | 'Lanjutan' | 'Pakar';
  huraian: string;
}

export interface RubrikItem {
  id: string;
  kod: string;
  aspek: string;
  standardKualiti: string;
  kriteria: string[];
  descriptors: Record<number, string>;
}

export const RUBRIK_GURU_ITEMS: RubrikItem[] = [
  // 1. Perancangan
  {
    id: 'skor1_1',
    kod: '1.1',
    aspek: 'Menetapkan objektif PdP bercirikan KBAT',
    standardKualiti: 'SK@S 4.1',
    kriteria: [
      'i. Eksplisit dan jelas.',
      'ii. Mengikut pelbagai tahap keupayaan/ penguasaan murid.',
      'iii. Mengikut peruntukan masa yang ditetapkan.',
      'iv. Mematuhi ketetapan kurikulum.',
    ],
    descriptors: {
      1: 'Guru merancang objektif PdP TANPA mana-mana perkara i, ii, iii dan iv.',
      2: 'Guru merancang objektif PdP bercirikan KBAT bagi mana-mana satu (1) daripada perkara i, ii, iii dan iv.',
      3: 'Guru merancang objektif PdP bercirikan KBAT bagi mana-mana dua (2) daripada perkara i, ii, iii dan iv.',
      4: 'Guru merancang objektif PdP bercirikan KBAT bagi mana-mana tiga (3) daripada perkara i, ii, iii dan iv.',
      5: 'Guru merancang objektif PdP bercirikan KBAT bagi semua empat (4) perkara berkenaan.',
    },
  },
  {
    id: 'skor1_2',
    kod: '1.2',
    aspek: 'Merancang set induksi yang menggalakkan KBAT dalam PdP',
    standardKualiti: 'SK@S 4.1',
    kriteria: [
      'i. Mengikut pelbagai aras keupayaan murid.',
      'ii. Pengetahuan sedia ada.',
      'iii. Berupaya menarik minat murid.',
      'iv. Mengikut peruntukan masa yang ditetapkan.',
    ],
    descriptors: {
      1: 'Guru merancang set induksi TANPA mana-mana perkara i, ii, iii dan iv.',
      2: 'Guru merancang set induksi yang sesuai dan menggalakkan KBAT dalam PdP bagi mana-mana satu (1) perkara.',
      3: 'Guru merancang set induksi yang sesuai dan menggalakkan KBAT dalam PdP bagi mana-mana dua (2) perkara.',
      4: 'Guru merancang set induksi yang sesuai dan menggalakkan KBAT dalam PdP bagi mana-mana tiga (3) perkara.',
      5: 'Guru merancang set induksi yang sesuai dan menggalakkan KBAT dalam PdP bagi semua empat (4) perkara berkenaan.',
    },
  },
  {
    id: 'skor1_3',
    kod: '1.3',
    aspek: 'Merancang aktiviti pembelajaran yang berpusatkan murid berdasarkan kepada objektif PdP',
    standardKualiti: 'SK@S 4.1',
    kriteria: [
      'i. Mengikut pelbagai aras keupayaan murid.',
      'ii. Mengikut peruntukan masa yang ditetapkan.',
      'iii. Mematuhi ketetapan kurikulum.',
      'iv. Menerapkan penggunaan alat berfikir.',
    ],
    descriptors: {
      1: 'Guru merancang aktiviti pembelajaran TANPA mana-mana perkara i, ii, iii dan iv.',
      2: 'Guru merancang aktiviti pembelajaran yang berpusatkan murid berdasarkan objektif PdP bagi mana-mana satu (1) perkara.',
      3: 'Guru merancang aktiviti pembelajaran yang berpusatkan murid berdasarkan objektif PdP bagi mana-mana dua (2) perkara.',
      4: 'Guru merancang aktiviti pembelajaran yang berpusatkan murid berdasarkan objektif PdP bagi mana-mana tiga (3) perkara.',
      5: 'Guru merancang aktiviti pembelajaran yang berpusatkan murid berdasarkan objektif PdP bagi semua empat (4) perkara berkenaan.',
    },
  },
  {
    id: 'skor1_4',
    kod: '1.4',
    aspek: 'Merancang pentaksiran yang bercirikan KBAT',
    standardKualiti: 'SK@S 4.1',
    kriteria: [
      'i. Eksplisit dan jelas.',
      'ii. Mengikut pelbagai tahap keupayaan/ penguasaan murid.',
      'iii. Mengikut peruntukan masa yang ditetapkan.',
      'iv. Mematuhi ketetapan kurikulum.',
    ],
    descriptors: {
      1: 'Guru merancang pentaksiran yang bercirikan KBAT TANPA mana-mana perkara i, ii, iii dan iv.',
      2: 'Guru merancang pentaksiran yang bercirikan KBAT bagi mana-mana satu (1) daripada perkara i, ii, iii dan iv.',
      3: 'Guru merancang pentaksiran yang bercirikan KBAT bagi mana-mana dua (2) daripada perkara i, ii, iii dan iv.',
      4: 'Guru merancang pentaksiran yang bercirikan KBAT bagi mana-mana tiga (3) daripada perkara i, ii, iii dan iv.',
      5: 'Guru merancang pentaksiran yang bercirikan KBAT bagi semua empat (4) perkara berkenaan.',
    },
  },

  // 2. Pelaksanaan
  {
    id: 'skor2_1',
    kod: '2.1',
    aspek: 'Menyediakan persekitaran PdP yang kondusif',
    standardKualiti: 'SK@S 4.2, 4.3, 4.4',
    kriteria: [
      'i. Mewujudkan suasana pembelajaran yang menyeronokkan.',
      'ii. Menyusun atur kedudukan murid.',
      'iii. Mengawasi perlakuan murid.',
      'iv. Mengawasi komunikasi murid.',
    ],
    descriptors: {
      1: 'Guru menyediakan persekitaran PdP yang kondusif TANPA mana-mana perkara i, ii, iii dan iv.',
      2: 'Guru menyediakan persekitaran PdP yang kondusif bagi mana-mana satu (1) daripada perkara berkenaan.',
      3: 'Guru menyediakan persekitaran PdP yang kondusif bagi mana-mana dua (2) perkara berkenaan.',
      4: 'Guru menyediakan persekitaran PdP yang kondusif bagi mana-mana tiga (3) perkara berkenaan.',
      5: 'Guru menyediakan persekitaran PdP yang kondusif bagi semua empat (4) perkara berkenaan.',
    },
  },
  {
    id: 'skor2_2',
    kod: '2.2',
    aspek: 'Melibatkan murid secara aktif dalam PdP / PdP berpusatkan murid',
    standardKualiti: 'SK@S 4.2, 4.3, 4.4',
    kriteria: [
      'i. Memberi tunjuk ajar/panduan menguasai isi pelajaran/konsep/fakta.',
      'ii. Memberi tunjuk ajar/panduan menguasai kemahiran aktiviti.',
      'iii. Mendorong murid membuat keputusan & menyelesaikan masalah.',
      'iv. Mendorong murid memanfaatkan sumber pendidikan.',
      'v. Menggabung/merentas isi pelajaran dengan tema/nilai/mata pelajaran lain.',
    ],
    descriptors: {
      1: 'Guru melibatkan murid secara aktif berpusatkan murid bagi mana-mana satu (1) perkara.',
      2: 'Guru melibatkan murid secara aktif berpusatkan murid bagi mana-mana dua (2) perkara.',
      3: 'Guru melibatkan murid secara aktif berpusatkan murid bagi mana-mana tiga (3) perkara.',
      4: 'Guru melibatkan murid secara aktif berpusatkan murid bagi mana-mana empat (4) perkara.',
      5: 'Guru melibatkan murid secara aktif berpusatkan murid bagi semua lima (5) perkara berkenaan.',
    },
  },
  {
    id: 'skor2_3',
    kod: '2.3',
    aspek: 'Menggunakan teknik penyoalan yang menggalakkan murid berfikir',
    standardKualiti: 'SK@S 4.2, 4.3, 4.4',
    kriteria: [
      'i. Merangsang murid berkomunikasi.',
      'ii. Merangsang murid berkolaboratif dalam aktiviti pembelajaran.',
      'iii. Mengemukakan soalan merangsang pemikiran kritis & kreatif (membuat keputusan & selesaikan masalah).',
      'iv. Menggalakkan murid mengemukakan soalan berkaitan isi pelajaran.',
      'v. Menggalakkan murid memperoleh pengetahuan & kemahiran secara kendiri.',
    ],
    descriptors: {
      1: 'Guru menggunakan teknik penyoalan menggalakkan murid berfikir bagi satu (1) perkara.',
      2: 'Guru menggunakan teknik penyoalan menggalakkan murid berfikir bagi dua (2) perkara.',
      3: 'Guru menggunakan teknik penyoalan menggalakkan murid berfikir bagi tiga (3) perkara.',
      4: 'Guru menggunakan teknik penyoalan menggalakkan murid berfikir bagi empat (4) perkara.',
      5: 'Guru menggunakan teknik penyoalan menggalakkan murid berfikir bagi semua lima (5) perkara berkenaan.',
    },
  },
  {
    id: 'skor2_4',
    kod: '2.4',
    aspek: 'Menggunakan alat berfikir semasa PdP',
    standardKualiti: 'SK@S 4.2, 4.3, 4.4',
    kriteria: [
      'i. Merangsang murid berkomunikasi.',
      'ii. Merangsang murid berkolaboratif dalam aktiviti pembelajaran.',
      'iii. Mengemukakan soalan/tugasan menjurus ke arah pemikiran kritis dan kreatif.',
      'iv. Menggalakkan murid mengemukakan soalan berkaitan isi pelajaran.',
      'v. Menggalakkan murid memperoleh pengetahuan dan kemahiran secara kendiri.',
    ],
    descriptors: {
      1: 'Guru menggunakan alat berfikir semasa PdP bagi mana-mana satu (1) perkara.',
      2: 'Guru menggunakan alat berfikir semasa PdP bagi mana-mana dua (2) perkara.',
      3: 'Guru menggunakan alat berfikir semasa PdP bagi mana-mana tiga (3) perkara.',
      4: 'Guru menggunakan alat berfikir semasa PdP bagi mana-mana empat (4) perkara.',
      5: 'Guru menggunakan alat berfikir semasa PdP bagi semua lima (5) perkara berkenaan.',
    },
  },
  {
    id: 'skor2_5',
    kod: '2.5',
    aspek: 'Melaksanakan pentaksiran bercirikan KBAT',
    standardKualiti: 'SK@S 4.5',
    kriteria: [
      'i. Menggunakan pelbagai kaedah pentaksiran.',
      'ii. Menjalankan aktiviti pemulihan / pengayaan.',
      'iii. Memberi latihan / tugasan berkaitan pelajaran.',
      'iv. Menyemak/menilai hasil kerja / gerak kerja / tugasan murid.',
    ],
    descriptors: {
      1: 'Guru melaksanakan pentaksiran bercirikan KBAT TANPA mana-mana perkara i, ii, iii dan iv.',
      2: 'Guru melaksanakan pentaksiran bercirikan KBAT bagi mana-mana satu (1) perkara.',
      3: 'Guru melaksanakan pentaksiran bercirikan KBAT bagi mana-mana dua (2) perkara.',
      4: 'Guru melaksanakan pentaksiran bercirikan KBAT bagi mana-mana tiga (3) perkara.',
      5: 'Guru melaksanakan pentaksiran bercirikan KBAT bagi semua empat (4) perkara berkenaan.',
    },
  },

  // 3. Refleksi
  {
    id: 'skor3_1',
    kod: '3.1',
    aspek: 'Melaksanakan refleksi PdP',
    standardKualiti: 'SK@S 4.5',
    kriteria: [
      'i. Guru mempraktikkan amalan refleksi dalam PdP.',
      'ii. Berdasarkan objektif pembelajaran.',
      'iii. Guru menilai kelemahan dan kekuatan PdP dengan jelas.',
      'iv. Guru mengenal pasti tindakan susulan untuk penambahbaikan & pemantapan.',
    ],
    descriptors: {
      1: 'Guru melaksanakan refleksi PdP TANPA mana-mana perkara i, ii, iii dan iv.',
      2: 'Guru melaksanakan refleksi PdP bagi mana-mana satu (1) perkara.',
      3: 'Guru melaksanakan refleksi PdP bagi mana-mana dua (2) perkara.',
      4: 'Guru melaksanakan refleksi PdP bagi mana-mana tiga (3) perkara.',
      5: 'Guru melaksanakan refleksi PdP bagi semua empat (4) perkara berkenaan.',
    },
  },
];

export const ITEM_MURID_DESCRIPTIONS: string[] = [
  '1. Murid memberikan pendapat yang munasabah dan logik berkaitan isi pelajaran semasa PdP.',
  '2. Murid berupaya memberi respon terhadap soalan yang dikemukakan oleh guru dan/atau rakan.',
  '3. Murid memberi galakan kepada rakan yang lain untuk aktif berkongsi pendapat semasa PdP.',
  '4. Murid menunjukkan kecenderungan pembelajaran kendiri semasa PdP.',
  '5. Murid berjaya menyelesaikan tugasan semasa aktiviti PdP.',
  '6. Murid boleh menghubung kait antara pengetahuan sedia ada dengan pengetahuan baharu.',
  '7. Murid berupaya menggunakan alat berfikir yang bersesuaian semasa aktiviti PdP.',
  '8. Murid dapat mengaplikasikan nilai murni semasa PdP.',
  '9. Murid mampu menilai hasil kerja sendiri/rakan dan membuat penambahbaikan berdasarkan penilaian yang dibuat.',
  '10. Murid bertanya soalan kepada guru dan/atau rakan.',
];

export const SKALA_MURID_GUIDE = [
  { skor: 1, range: '1% - 20%', desc: 'Bilangan murid mencapai item adalah rendah (1-20%)' },
  { skor: 2, range: '21% - 40%', desc: 'Bilangan murid mencapai item adalah asas (21-40%)' },
  { skor: 3, range: '41% - 60%', desc: 'Bilangan murid mencapai item adalah separuh (41-60%)' },
  { skor: 4, range: '61% - 80%', desc: 'Majoriti bilangan murid mencapai item (61-80%)' },
  { skor: 5, range: '81% - 100%', desc: 'Hampir semua / seluruh murid mencapai item (81-100%)' },
];

export const TAHAP_PENCAPAIAN_INFO = [
  {
    range: '81% - 100%',
    tahap: 'Cemerlang',
    keterangan: 'Telah membudayakan KBAT dalam PdP secara cemerlang, konsisten dan menyeluruh.',
    color: 'emerald',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    range: '61% - 80%',
    tahap: 'Baik',
    keterangan: 'Telah mencapai tahap baik pembudayaan KBAT dalam PdP.',
    color: 'blue',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    range: '51% - 60%',
    tahap: 'Sederhana',
    keterangan: 'Telah mencapai tahap sederhana pembudayaan KBAT dalam PdP serta boleh dibimbing untuk penambahbaikan.',
    color: 'amber',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    range: '41% - 50%',
    tahap: 'Tahap Minimum',
    keterangan: 'Telah mencapai tahap minimum pembudayaan KBAT dalam PdP serta boleh dibimbing untuk penambahbaikan.',
    color: 'orange',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    range: '≤ 40%',
    tahap: 'Tidak Memenuhi Tahap Minimum',
    keterangan: 'Tidak memenuhi tahap minimum pembudayaan KBAT dalam PdP.',
    color: 'rose',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
];
