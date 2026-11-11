/**
 * Senarai Rasmi Guru & Kelas SMK Banggi, Kudat, Sabah
 * Tahun 2027
 */

export interface GuruInfo {
  nama: string;
  jantina?: 'Lelaki' | 'Perempuan';
  opsyen?: string;
}

export interface KategoriKelas {
  tingkatan: string;
  senarai: string[];
}

const RAW_SENARAI_GURU: string[] = [
  'Alcia Onius',
  'Nafius bin Ridis',
  'Morsidy bin Abdul Nasir',
  'Rosle B. Hajan @ Amir Hamzah',
  'Mohd Junaidey bin Buasing',
  'Irwan Huzen Matusin bin Ahmad Sapawi',
  'Ahmad Dasuki bin Abdul Kadir',
  'Nur Azlina bin Hamid',
  'Donald Linson',
  'Mohd Khairul Nizam bin Wan Chik',
  'Evronne Faeyne Ford',
  'Ustaz Madrouf bin Said',
  'Yong Choon Nyen',
  'Ridwan bin Abdul Rahim',
  'Prem',
  'Caroline Jubian',
  'Caroline Jasneh',
  'Darron Azzril bin Sweelan Jimmy Kula',
  'Danny Joe Julian',
  'Elfie Honeychurch Rubert',
  'Fellina Celliam',
  'Filemon bin James',
  'Jane Carrine',
  'Josua Eleazar Jalani',
  'Jesshida Junis',
  'Mohamad Fazley bin Madnin',
  'Mohamad Lukman bin Sidek',
  'Mohd Nazri bin Ismail',
  'Mohd Zulhakimi bin Zulkepli',
  'Mohd Amin bin Razak',
  'Muhammad Ridzuan bin Roslan',
  'Nur Azrin bin Abdullah',
  'Nusiah binti Mohd Yassin',
  'Noel Oliver Andy',
  'Nazurah Nadzirah binti Roslan',
  'Norsila binti Samsudin',
  'Saiful Iskandar bin Ibrahim',
  'Sakura binti Akmad',
  'Sufiah binti Abd Rahim',
  'Shezaratul Hiqmah binti Satung',
  'Sularmore bin Azral',
  'Tun Muhamad Azam bin Mohd Redzuan',
  'Tira Hazurah binti Matnol @ Matnoh',
  'Ustaz Muhammad Asyraf bin Samat',
  'Ustaz Muhammad Khairil Haizad bin Kamal',
  'Ustaz Mohd Safuan bin Bensui',
  'Welfred Botohong @ Batahong',
  'Fauziah binti Fairun',
  'Florence George',
  'Hilman Dino Lantubon',
  'Jayphanie Archie Justin',
  'Norsharifah Waty binti Abdul Salim',
  'Nuradielah binti Matahir',
  'Telmah binti Tahmeh',
  'Mohd Zaidi bin Umra',
  'Vicole Dumat',
  'Chelsea Sovency James',
  'Clerrye Onong',
  'Jnivea Vrenda binti Jobidi',
  'Nizam bin Ronald',
  'Veleyria Viviantie binti Juin',
  'Nur Khairunnisa binti Mohd Syaikin',
  'Norsazilah binti Jaidal',
  "Fe' Adelin binti Sintar",
  'Zafirah binti Nasir',
  'Nik Ahmad Nuri bin Nik Ismail',
];

/**
 * Senarai Guru Disusun Mengikut Abjad (A-Z)
 */
export const SENARAI_GURU_SMK_BANGGI: string[] = [...RAW_SENARAI_GURU].sort((a, b) =>
  a.localeCompare(b, 'ms', { sensitivity: 'base' })
);

/**
 * Senarai 39 Buah Kelas di SMK Banggi Kudat mengikut Tingkatan
 */
export const SENARAI_KELAS_BY_TINGKATAN: KategoriKelas[] = [
  {
    tingkatan: 'Tingkatan 1',
    senarai: ['1 AMANAH', '1 BESTARI', '1 CEKAL', '1 DEDIKASI', '1 EFEKTIF', '1 FLEKSI'],
  },
  {
    tingkatan: 'Tingkatan 2',
    senarai: ['2 AMANAH', '2 BESTARI', '2 CEKAL', '2 DEDIKASI', '2 EFEKTIF', '2 FLEKSI'],
  },
  {
    tingkatan: 'Tingkatan 3',
    senarai: ['3 AMANAH', '3 BESTARI', '3 CEKAL', '3 DEDIKASI', '3 EFEKTIF', '3 FLEKSI'],
  },
  {
    tingkatan: 'Tingkatan 4',
    senarai: ['4 AMANAH', '4 BESTARI', '4 CEKAL', '4 DEDIKASI', '4 EFEKTIF', '4 FLEKSI'],
  },
  {
    tingkatan: 'Tingkatan 5',
    senarai: ['5 AMANAH', '5 BESTARI', '5 CEKAL', '5 DEDIKASI', '5 EFEKTIF', '5 FLEKSI'],
  },
  {
    tingkatan: 'Tingkatan 6 (STPM)',
    senarai: ['6 AMANAH 1', '6 AMANAH 2', '6 AMANAH 3', '6 BESTARI 1', '6 BESTARI 2', '6 BESTARI 3'],
  },
  {
    tingkatan: 'Pendidikan Khas (PPKI)',
    senarai: ['MUTIARA', 'DELIMA', 'ZAMRUD'],
  },
];

export const SENARAI_KELAS_SMK_BANGGI: string[] = SENARAI_KELAS_BY_TINGKATAN.flatMap(
  (group) => group.senarai
);

/**
 * Menganggar jantina berdasarkan nama (bin / binti / ustaz / nama khas)
 */
export function tekaJantinaGuru(nama: string): 'Lelaki' | 'Perempuan' {
  const lower = nama.toLowerCase();
  if (lower.includes('binti') || lower.includes('bte')) {
    return 'Perempuan';
  }
  if (lower.includes('bin') || lower.startsWith('ustaz') || lower.includes(' b. ')) {
    return 'Lelaki';
  }
  // Female names
  const femaleNames = [
    'alcia', 'caroline', 'fellina', 'jane', 'jesshida', 'sakura',
    'sufiah', 'florence', 'jayphanie', 'telmah', 'chelsea', 'clerrye',
    'jnivea', 'veleyria', 'zafirah', 'adelin', 'nur', 'nazurah', 'norsila',
    'norsharifah', 'norsazilah'
  ];
  for (const fn of femaleNames) {
    if (lower.includes(fn)) return 'Perempuan';
  }
  return 'Lelaki';
}
