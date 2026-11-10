export interface PentadbirUser {
  id: string;
  nama: string;
  jawatan: string;
  emel: string;
  kodSekolah: string;
  namaSekolah: string;
  peranan: 'Pengetua' | 'Penolong Kanan' | 'GKMP' | 'Ketua Panitia' | 'Pencerap';
  tandatanganDigital?: string; // Base64 data URL
  tarikhDaftarTT?: string;
  avatarUrl?: string;
}

export const PENTADBIR_PRESETS: PentadbirUser[] = [
  {
    id: 'user-pk1',
    nama: 'En. Roslan bin Awang',
    jawatan: 'Penolong Kanan Pentadbiran (PK1)',
    emel: 'g-87247896@moe-dl.edu.my',
    kodSekolah: 'XEA6062',
    namaSekolah: 'SMK BANGGI, KUDAT',
    peranan: 'Penolong Kanan',
    avatarUrl: '',
    tarikhDaftarTT: '2026-02-01',
  },
  {
    id: 'user-pengetua',
    nama: 'Pn. Halimah binti Kassim',
    jawatan: 'Pengetua',
    emel: 'pengetua.xea6062@moe-dl.edu.my',
    kodSekolah: 'XEA6062',
    namaSekolah: 'SMK BANGGI, KUDAT',
    peranan: 'Pengetua',
    avatarUrl: '',
    tarikhDaftarTT: '2026-01-15',
  },
  {
    id: 'user-gkmp-sains',
    nama: 'En. Azman bin Zulkifli',
    jawatan: 'GKMP Sains & Matematik',
    emel: 'azman.xea6062@moe-dl.edu.my',
    kodSekolah: 'XEA6062',
    namaSekolah: 'SMK BANGGI, KUDAT',
    peranan: 'GKMP',
    avatarUrl: '',
    tarikhDaftarTT: '2026-02-10',
  },
  {
    id: 'user-gkmp-bahasa',
    nama: 'En. Mohd Ridzuan bin Salleh',
    jawatan: 'GKMP Bahasa',
    emel: 'ridzuan.xea6062@moe-dl.edu.my',
    kodSekolah: 'XEA6062',
    namaSekolah: 'SMK BANGGI, KUDAT',
    peranan: 'GKMP',
    avatarUrl: '',
    tarikhDaftarTT: '2026-02-20',
  },
];
