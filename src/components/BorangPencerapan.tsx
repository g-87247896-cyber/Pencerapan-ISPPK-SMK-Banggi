import React, { useState, useEffect, useRef } from 'react';
import {
  PencerapanRecord,
  PhotoEvidence,
  RUBRIK_GURU_ITEMS,
  ITEM_MURID_DESCRIPTIONS,
  SKALA_MURID_GUIDE,
  TAHAP_PENCAPAIAN_INFO,
} from '../types/isppk';
import { apiService } from '../services/api';
import { PhotoEvidenceUploader } from './PhotoEvidenceUploader';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { PentadbirUser } from '../types/auth';
import {
  SENARAI_GURU_SMK_BANGGI,
  SENARAI_KELAS_BY_TINGKATAN,
  SENARAI_KELAS_SMK_BANGGI,
  tekaJantinaGuru,
} from '../data/guruSmkBanggi';
import {
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Printer,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  School,
  User,
  GraduationCap,
  BookOpen,
  Camera,
  Award,
  Share2,
  Upload,
  PenTool,
} from 'lucide-react';

interface BorangPencerapanProps {
  initialRecord?: PencerapanRecord | null;
  currentUser?: PentadbirUser | null;
  onOpenUploadSignature?: () => void;
  onSaved: (record: PencerapanRecord) => void;
  onPreviewPrint: (record: PencerapanRecord) => void;
  onShareSummary?: (record: PencerapanRecord) => void;
  onCancel?: () => void;
}

const DEFAULT_SCHOOL = {
  kodSekolah: 'XEA6062',
  namaSekolah: 'SMK BANGGI, KUDAT',
  ppd: 'PPD KUDAT',
  negeri: 'SABAH',
  emelSekolah: 'xea6062@moe.edu.my',
};

const MATA_PELAJARAN_LIST = [
  'Bahasa Melayu',
  'Bahasa Inggeris',
  'Matematik',
  'Sains',
  'Sejarah',
  'Geografi',
  'Pendidikan Islam',
  'Pendidikan Moral',
  'Reka Bentuk & Teknologi (RBT)',
  'Asas Sains Komputer (ASK)',
  'Fizik',
  'Kimia',
  'Biologi',
  'Matematik Tambahan',
  'Prinsip Perakaunan',
  'Perniagaan',
  'Ekonomi',
  'Pendidikan Seni Visual (PSV)',
  'Pendidikan Jasmani & Kesihatan (PJK)',
  'Sains Rumah Tangga (SRT)',
  'Pertanian',
];

const TINGKATAN_LIST = [
  'Tingkatan 1',
  'Tingkatan 2',
  'Tingkatan 3',
  'Tingkatan 4',
  'Tingkatan 5',
  'Tingkatan 6 (Rendah)',
  'Tingkatan 6 (Atas)',
];

const JAWATAN_PENCERAP_LIST = [
  'Pengetua',
  'Penolong Kanan Pentadbiran (PK1)',
  'Penolong Kanan HEM',
  'Penolong Kanan Kokurikulum',
  'Penolong Kanan Tingkatan 6',
  'Guru Kanan Mata Pelajaran (GKMP) Bahasa',
  'Guru Kanan Mata Pelajaran (GKMP) Sains & Matematik',
  'Guru Kanan Mata Pelajaran (GKMP) Sains Sosial',
  'Guru Kanan Mata Pelajaran (GKMP) Teknik & Vokasional',
  'Ketua Panitia',
  'Pegawai SISC+ PPD Kudat',
  'Nazir Sekolah',
];

export const BorangPencerapan: React.FC<BorangPencerapanProps> = ({
  initialRecord,
  currentUser,
  onOpenUploadSignature,
  onSaved,
  onPreviewPrint,
  onShareSummary,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'butiran' | 'guru' | 'murid' | 'gambar' | 'rumusan'>('butiran');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [record, setRecord] = useState<Partial<PencerapanRecord>>(() => {
    if (initialRecord) return { ...initialRecord };
    // Check if there is a local draft
    const draft = apiService.loadLocalDraft();
    if (draft && !draft.id) {
      return draft;
    }
    return {
      kodSekolah: DEFAULT_SCHOOL.kodSekolah,
      namaSekolah: DEFAULT_SCHOOL.namaSekolah,
      ppd: DEFAULT_SCHOOL.ppd,
      negeri: DEFAULT_SCHOOL.negeri,
      emelSekolah: DEFAULT_SCHOOL.emelSekolah,
      tarikhPencerapan: new Date().toISOString().split('T')[0],
      masaPencerapan: '08:30 - 09:30 Pagi',
      namaPencerap: currentUser?.nama || '',
      jawatanPencerap: currentUser?.jawatan || 'Penolong Kanan Pentadbiran (PK1)',
      tandatanganPencerap: currentUser?.tandatanganDigital || '',
      namaGuru: '',
      jantinaGuru: 'Lelaki',
      opsyenGuru: '',
      mataPelajaran: 'Sains',
      bilMuridHadir: 25,
      bilMuridSebenar: 25,
      tingkatan: 'Tingkatan 4',
      tajukTopik: '',
      masaPdP: '08:30 - 09:30 Pagi',
      skor1_1: 4,
      skor1_2: 4,
      skor1_3: 4,
      skor1_4: 4,
      skor2_1: 4,
      skor2_2: 4,
      skor2_3: 4,
      skor2_4: 4,
      skor2_5: 4,
      skor3_1: 4,
      skorMurid: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      refleksiPdP: '',
      perancanganPenambahbaikan: '',
      rumusanPencerap: '',
      status: 'Draf',
    };
  });

  // Calculate live scores
  const skor1_1 = Number(record.skor1_1 || 0);
  const skor1_2 = Number(record.skor1_2 || 0);
  const skor1_3 = Number(record.skor1_3 || 0);
  const skor1_4 = Number(record.skor1_4 || 0);
  const skorPerancangan = skor1_1 + skor1_2 + skor1_3 + skor1_4; // max 20

  const skor2_1 = Number(record.skor2_1 || 0);
  const skor2_2 = Number(record.skor2_2 || 0);
  const skor2_3 = Number(record.skor2_3 || 0);
  const skor2_4 = Number(record.skor2_4 || 0);
  const skor2_5 = Number(record.skor2_5 || 0);
  const skorPelaksanaan = skor2_1 + skor2_2 + skor2_3 + skor2_4 + skor2_5; // max 25

  const skorRefleksi = Number(record.skor3_1 || 0); // max 5
  const skorGuru = skorPerancangan + skorPelaksanaan + skorRefleksi; // max 50

  const skorMuridArray = Array.isArray(record.skorMurid) ? record.skorMurid : Array(10).fill(0);
  const skorMuridTotal = skorMuridArray.reduce((acc, curr) => acc + (Number(curr) || 0), 0); // max 50

  const skorKeseluruhan = skorGuru + skorMuridTotal; // max 100
  const peratusPencapaian = Math.round((skorKeseluruhan / 100) * 100 * 10) / 10;

  let tahapPencapaian = 'Tidak Memenuhi Tahap Minimum';
  if (peratusPencapaian >= 81) tahapPencapaian = 'Cemerlang';
  else if (peratusPencapaian >= 61) tahapPencapaian = 'Baik';
  else if (peratusPencapaian >= 51) tahapPencapaian = 'Sederhana';
  else if (peratusPencapaian >= 41) tahapPencapaian = 'Tahap Minimum';

  const currentTahapObj = TAHAP_PENCAPAIAN_INFO.find((t) => t.tahap === tahapPencapaian) || TAHAP_PENCAPAIAN_INFO[0];

  // Debounced Auto-Save to school database
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      // Only auto-save if basic name or subject has been provided
      if (record.namaGuru || record.mataPelajaran || record.namaPencerap) {
        setSaveStatus('saving');
        try {
          const payload: Partial<PencerapanRecord> = {
            ...record,
            skorPerancangan,
            skorPelaksanaan,
            skorRefleksi,
            skorGuru,
            skorMuridTotal,
            skorKeseluruhan,
            peratusPencapaian,
            tahapPencapaian,
          };
          const res = await apiService.savePencerapan(payload);
          if (res.data) {
            setRecord((prev) => ({ ...prev, id: res.data.id }));
            setLastSavedTime(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            setSaveStatus('saved');
          }
        } catch (err) {
          console.error('Auto-save error:', err);
          setSaveStatus('error');
        }
      }
    }, 2000); // 2 seconds debounce

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    record.namaGuru,
    record.namaPencerap,
    record.mataPelajaran,
    record.tingkatan,
    record.tajukTopik,
    record.skor1_1,
    record.skor1_2,
    record.skor1_3,
    record.skor1_4,
    record.skor2_1,
    record.skor2_2,
    record.skor2_3,
    record.skor2_4,
    record.skor2_5,
    record.skor3_1,
    record.skorMurid,
    record.refleksiPdP,
    record.perancanganPenambahbaikan,
    record.rumusanPencerap,
    record.gambar1,
    record.gambar2,
    record.gambar3,
    record.gambar4,
    record.tandatanganPencerap,
    record.tandatanganGuru,
  ]);

  const handleManualSave = async (status: 'Draf' | 'Selesai') => {
    setSaveStatus('saving');
    try {
      const payload: Partial<PencerapanRecord> = {
        ...record,
        status,
        skorPerancangan,
        skorPelaksanaan,
        skorRefleksi,
        skorGuru,
        skorMuridTotal,
        skorKeseluruhan,
        peratusPencapaian,
        tahapPencapaian,
      };
      const res = await apiService.savePencerapan(payload);
      setRecord((prev) => ({ ...prev, ...res.data }));
      setLastSavedTime(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSaveStatus('saved');
      apiService.clearLocalDraft();
      onSaved(res.data);
    } catch (err) {
      alert('Gagal menyimpan pencerapan ke pangkalan data sekolah.');
      setSaveStatus('error');
    }
  };

  const handleQuickFillSample = () => {
    setRecord({
      kodSekolah: 'XEA6062',
      namaSekolah: 'SMK BANGGI, KUDAT',
      ppd: 'PPD KUDAT',
      negeri: 'SABAH',
      emelSekolah: 'xea6062@moe.edu.my',
      namaPencerap: 'En. Roslan bin Awang',
      jawatanPencerap: 'Penolong Kanan Pentadbiran (PK1)',
      tarikhPencerapan: new Date().toISOString().split('T')[0],
      masaPencerapan: '08:30 - 09:30 Pagi',
      namaGuru: 'Pn. Siti Rahmah binti Abdullah',
      jantinaGuru: 'Perempuan',
      opsyenGuru: 'Sains',
      mataPelajaran: 'Sains',
      bilMuridHadir: 26,
      bilMuridSebenar: 28,
      tingkatan: 'Tingkatan 4 Al-Farabi',
      tajukTopik: 'Bab 4: Kelestarian Alam & Biodiversiti Marin Pulau Banggi',
      masaPdP: '08:30 - 09:30 Pagi',
      skor1_1: 5,
      skor1_2: 4,
      skor1_3: 5,
      skor1_4: 4,
      skor2_1: 5,
      skor2_2: 5,
      skor2_3: 4,
      skor2_4: 5,
      skor2_5: 4,
      skor3_1: 5,
      skorMurid: [5, 4, 5, 4, 5, 4, 5, 4, 4, 5],
      refleksiPdP:
        'Murid sangat seronok mengkaji isu ancaman terumbu karang di perairan Pulau Banggi dengan menggunakan Peta Pelbagai Alir (Peta i-Think). Sesi soal jawab aras tinggi menggalakkan murid mengemukakan idea pemuliharaan konkrit.',
      perancanganPenambahbaikan:
        'Akan memperkenalkan aktiviti "Gallery Walk" digital bagi membolehkan murid membentangkan cadangan zon marin terlindung secara lebih interaktif.',
      rumusanPencerap:
        'Penyampaian PdP Pn. Siti Rahmah sangat memuaskan dan berpusatkan murid. Pembudayaan KBAT amat mantap dan murid menunjukkan kemahiran menganalisis yang tinggi.',
      status: 'Selesai',
    });
  };

  const updateField = <K extends keyof PencerapanRecord>(field: K, value: PencerapanRecord[K]) => {
    setRecord((prev) => ({ ...prev, [field]: value }));
  };

  const updateMuridScore = (index: number, score: number) => {
    setRecord((prev) => {
      const arr = [...(prev.skorMurid || Array(10).fill(0))];
      arr[index] = score;
      return { ...prev, skorMurid: arr };
    });
  };

  const handlePhotoChange = (slotKey: 'gambar1' | 'gambar2' | 'gambar3' | 'gambar4', photo: PhotoEvidence | undefined) => {
    setRecord((prev) => ({ ...prev, [slotKey]: photo }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                ISPPK KPM 2026
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {record.id ? `ID: ${record.id}` : 'Rekod Baru'}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  record.status === 'Selesai'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {record.status === 'Selesai' ? 'Disahkan Selesai' : 'Draf Dalam Pengisian'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Borang Pencerapan PdP Guru & Murid (KBAT)
            </h2>
            <p className="text-xs text-slate-500">
              SMK Banggi, Kudat — Pengisian skor automatik tersimpan ke pangkalan data sekolah
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              {saveStatus === 'saving' && (
                <>
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <span className="text-indigo-700 font-medium">Menyimpan ke pangkalan data...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Tersimpan ({lastSavedTime || 'Auto'})</span>
                </>
              )}
              {saveStatus === 'idle' && (
                <>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Autosimpan aktif</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-rose-600 font-medium">Gagal simpan (storan peranti aktif)</span>
                </>
              )}
            </div>

            {/* Quick Fill Sample for ease of test */}
            <button
              type="button"
              onClick={handleQuickFillSample}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Isi contoh data pencerapan SMK Banggi secara pantas"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Isi Contoh
            </button>

            {/* Preview Official PDF */}
            <button
              type="button"
              onClick={() => {
                const fullRecord: PencerapanRecord = {
                  ...record,
                  id: record.id || `smkb-${Date.now()}`,
                  skorPerancangan,
                  skorPelaksanaan,
                  skorRefleksi,
                  skorGuru,
                  skorMuridTotal,
                  skorKeseluruhan,
                  peratusPencapaian,
                  tahapPencapaian,
                } as PencerapanRecord;
                onPreviewPrint(fullRecord);
              }}
              className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>

            {/* Share Summary Button */}
            {onShareSummary && (
              <button
                type="button"
                onClick={() => {
                  const fullRecord: PencerapanRecord = {
                    ...record,
                    id: record.id || `smkb-${Date.now()}`,
                    skorPerancangan,
                    skorPelaksanaan,
                    skorRefleksi,
                    skorGuru,
                    skorMuridTotal,
                    skorKeseluruhan,
                    peratusPencapaian,
                    tahapPencapaian,
                  } as PencerapanRecord;
                  onShareSummary(fullRecord);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                title="Jana dan kongsi rumusan ringkas dapatan pencerapan kepada guru via E-mel/Mesej"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                Kongsi Rumusan
              </button>
            )}

            {/* Final Save Button */}
            <button
              type="button"
              onClick={() => handleManualSave('Selesai')}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan & Sahkan
            </button>
          </div>
        </div>

        {/* Live Floating / Summary Ribbon */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 divide-x divide-slate-700">
            <div>
              <span className="text-[11px] text-slate-400 block">Guru (PdP)</span>
              <span className="text-base sm:text-lg font-bold text-emerald-400">
                {skorGuru} <span className="text-xs text-slate-400 font-normal">/ 50</span>
              </span>
              <div className="text-[10px] text-slate-400">
                P:{skorPerancangan} | L:{skorPelaksanaan} | R:{skorRefleksi}
              </div>
            </div>

            <div className="pl-4 sm:pl-6">
              <span className="text-[11px] text-slate-400 block">Murid (Aktif)</span>
              <span className="text-base sm:text-lg font-bold text-sky-400">
                {skorMuridTotal} <span className="text-xs text-slate-400 font-normal">/ 50</span>
              </span>
              <div className="text-[10px] text-slate-400">10 Item Dinilai</div>
            </div>

            <div className="pl-4 sm:pl-6">
              <span className="text-[11px] text-slate-400 block">Skor Keseluruhan</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-300">
                {skorKeseluruhan} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </span>
              <div className="text-[10px] text-slate-300 font-semibold">{peratusPencapaian}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-lg border border-white/15">
            <Award className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-300 block">
                Tahap Pembudayaan KBAT 2026:
              </span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{tahapPencapaian}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-normal ${currentTahapObj.badgeClass}`}>
                  {currentTahapObj.range}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto bg-white rounded-t-xl px-2">
        <button
          type="button"
          onClick={() => setActiveTab('butiran')}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'butiran'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          1. Butiran Guru & Kelas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guru')}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'guru'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          2. Rubrik Guru (50m)
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-mono">
            {skorGuru}/50
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('murid')}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'murid'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          3. Rubrik Murid (50m)
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 font-mono">
            {skorMuridTotal}/50
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gambar')}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'gambar'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-4 h-4" />
          4. Evidens 4 Gambar PdP
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
            {[record.gambar1, record.gambar2, record.gambar3, record.gambar4].filter(Boolean).length}/4
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rumusan')}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'rumusan'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <School className="w-4 h-4" />
          5. Refleksi & Rumusan
        </button>
      </div>

      {/* Tab 1: Butiran Asas */}
      {activeTab === 'butiran' && (
        <div className="space-y-6">
          {/* Bahagian A: Pencerap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                A
              </span>
              Bahagian A – Maklumat Pencerap
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Nama Pencerap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={record.namaPencerap || ''}
                  onChange={(e) => updateField('namaPencerap', e.target.value)}
                  placeholder="Cth: En. Roslan bin Awang"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Jawatan Pencerap <span className="text-rose-500">*</span>
                </label>
                <select
                  value={record.jawatanPencerap || ''}
                  onChange={(e) => updateField('jawatanPencerap', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Pilih Jawatan</option>
                  {JAWATAN_PENCERAP_LIST.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Tarikh Pencerapan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={record.tarikhPencerapan || ''}
                  onChange={(e) => updateField('tarikhPencerapan', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Masa Pencerapan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={record.masaPencerapan || ''}
                  onChange={(e) => updateField('masaPencerapan', e.target.value)}
                  placeholder="Cth: 08:30 - 09:30 Pagi"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Bahagian B: Sekolah */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                B
              </span>
              Bahagian B – Maklumat Sekolah (SMK Banggi)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">1. Nama Sekolah:</span>
                <span className="font-bold text-slate-800">{record.namaSekolah || 'SMK BANGGI, KUDAT'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">2. PPD:</span>
                <span className="font-semibold text-slate-800">{record.ppd || 'PPD KUDAT'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">3. Negeri:</span>
                <span className="font-semibold text-slate-800">{record.negeri || 'SABAH'}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">4. E-mel Sekolah:</span>
                <span className="font-mono text-slate-700">{record.emelSekolah || 'xea6062@moe.edu.my'}</span>
              </div>
            </div>
          </div>

          {/* Bahagian C: Guru Yang Dicerap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                C
              </span>
              <span>Bahagian C – Maklumat Guru Yang Dicerap</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    1. Nama Penuh Guru <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    66 Guru SMK Banggi (A-Z)
                  </span>
                </div>

                {/* Dropdown selector for 66 teachers (Sorted A-Z) */}
                <select
                  value={SENARAI_GURU_SMK_BANGGI.includes(record.namaGuru || '') ? record.namaGuru : ''}
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected) {
                      updateField('namaGuru', selected);
                      updateField('jantinaGuru', tekaJantinaGuru(selected));
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/90 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Pilih dari Senarai 66 Guru (A-Z) --</option>
                  {SENARAI_GURU_SMK_BANGGI.map((nama) => (
                    <option key={nama} value={nama}>
                      {nama}
                    </option>
                  ))}
                </select>

                {/* Input with autocomplete datalist search */}
                <div className="relative">
                  <input
                    type="text"
                    list="senarai-guru-smk-banggi"
                    value={record.namaGuru || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField('namaGuru', val);
                      if (SENARAI_GURU_SMK_BANGGI.includes(val)) {
                        updateField('jantinaGuru', tekaJantinaGuru(val));
                      }
                    }}
                    placeholder="Atau taip / cari nama guru di sini..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <datalist id="senarai-guru-smk-banggi">
                    {SENARAI_GURU_SMK_BANGGI.map((guru) => (
                      <option key={guru} value={guru} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Jantina Guru <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="jantina"
                      value="Lelaki"
                      checked={record.jantinaGuru === 'Lelaki'}
                      onChange={() => updateField('jantinaGuru', 'Lelaki')}
                      className="text-indigo-600"
                    />
                    Lelaki
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="jantina"
                      value="Perempuan"
                      checked={record.jantinaGuru === 'Perempuan'}
                      onChange={() => updateField('jantinaGuru', 'Perempuan')}
                      className="text-indigo-600"
                    />
                    Perempuan
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Opsyen Pengkhususan Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={record.opsyenGuru || ''}
                  onChange={(e) => updateField('opsyenGuru', e.target.value)}
                  placeholder="Cth: Sains / Fizik / BM / Matematik"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Bahagian D: Kelas Yang Dicerap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                D
              </span>
              Bahagian D – Maklumat Kelas Yang Dicerap
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Mata Pelajaran Dicerap <span className="text-rose-500">*</span>
                </label>
                <select
                  value={record.mataPelajaran || ''}
                  onChange={(e) => updateField('mataPelajaran', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {MATA_PELAJARAN_LIST.map((mp) => (
                    <option key={mp} value={mp}>
                      {mp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    2. Tingkatan / Kelas <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    39 Kelas SMK Banggi
                  </span>
                </div>

                {/* Dropdown selector for 39 classes grouped by Tingkatan */}
                <select
                  value={SENARAI_KELAS_SMK_BANGGI.includes(record.tingkatan || '') ? record.tingkatan : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      updateField('tingkatan', e.target.value);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/90 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">-- Pilih dari 39 Kelas SMK Banggi --</option>
                  {SENARAI_KELAS_BY_TINGKATAN.map((group) => (
                    <optgroup key={group.tingkatan} label={`--- ${group.tingkatan} ---`}>
                      {group.senarai.map((kelas) => (
                        <option key={kelas} value={kelas}>
                          {kelas}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {/* Input with autocomplete datalist search */}
                <div className="relative">
                  <input
                    type="text"
                    list="senarai-kelas-smk-banggi"
                    value={record.tingkatan || ''}
                    onChange={(e) => updateField('tingkatan', e.target.value)}
                    placeholder="Atau taip / cari kelas di sini..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <datalist id="senarai-kelas-smk-banggi">
                    {SENARAI_KELAS_SMK_BANGGI.map((kelas) => (
                      <option key={kelas} value={kelas} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Bilangan Murid Hadir / Sebenar <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={record.bilMuridHadir || 0}
                    onChange={(e) => updateField('bilMuridHadir', Number(e.target.value))}
                    className="w-24 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-center"
                    placeholder="Hadir"
                  />
                  <span className="text-slate-400 font-bold">/</span>
                  <input
                    type="number"
                    min="1"
                    value={record.bilMuridSebenar || 0}
                    onChange={(e) => updateField('bilMuridSebenar', Number(e.target.value))}
                    className="w-24 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-center"
                    placeholder="Sebenar"
                  />
                  <span className="text-xs text-slate-500">orang murid</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Tajuk / Topik PdP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={record.tajukTopik || ''}
                  onChange={(e) => updateField('tajukTopik', e.target.value)}
                  placeholder="Cth: Bab 3: Pemeliharaan Ekosistem & Kelestarian Biodiversiti Marin"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Masa PdP
                </label>
                <input
                  type="text"
                  value={record.masaPdP || ''}
                  onChange={(e) => updateField('masaPdP', e.target.value)}
                  placeholder="Cth: 08:30 - 09:30 Pagi"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setActiveTab('guru')}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              Seterusnya: Skor Rubrik Guru
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Skor Rubrik Guru */}
      {activeTab === 'guru' && (
        <div className="space-y-6">
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-indigo-950">
                Bahagian E – Rubrik Penilaian Guru (SK@S 2026)
              </h3>
              <p className="text-xs text-indigo-800">
                Skala Skor 1 (Kesedaran), 2 (Asas), 3 (Pertengahan), 4 (Lanjutan), 5 (Pakar).
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-indigo-700 font-medium">Subtotal Guru:</span>
              <div className="text-lg font-extrabold text-indigo-900 font-mono">
                {skorGuru} / 50
              </div>
            </div>
          </div>

          {RUBRIK_GURU_ITEMS.map((item) => {
            // @ts-expect-error dynamic access
            const currentScore = Number(record[item.id] || 0);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                      {item.kod}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.aspek}</h4>
                      <span className="text-[11px] text-indigo-600 font-medium">{item.standardKualiti}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <span className="text-xs text-slate-500 font-medium">Skor:</span>
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
                        currentScore > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {currentScore || '-'}
                    </span>
                  </div>
                </div>

                {/* Kriteria Senarai */}
                <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/60 mb-4">
                  <span className="text-[11px] font-semibold text-slate-600 uppercase block mb-1">
                    Kriteria / Ketetapan Standard:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                    {item.kriteria.map((crit, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-1">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5 Levels Selection Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const isSelected = currentScore === lvl;
                    const labels = ['', 'Kesedaran', 'Asas', 'Pertengahan', 'Lanjutan', 'Pakar'];
                    const descriptor = item.descriptors[lvl];

                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => updateField(item.id as keyof PencerapanRecord, lvl as never)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {lvl}
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
                                isSelected ? 'text-indigo-900' : 'text-slate-600'
                              }`}
                            >
                              {labels[lvl]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-4 leading-relaxed">
                            {descriptor}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="mt-2 pt-1 border-t border-indigo-200 text-[10px] font-semibold text-indigo-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Dipilih
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('butiran')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('murid')}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              Seterusnya: Skor Rubrik Murid (10 Item)
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Skor Rubrik Murid */}
      {activeTab === 'murid' && (
        <div className="space-y-6">
          <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-sky-950">
                Bahagian F – Rubrik Penilaian Murid (Murid Sebagai Pembelajar Aktif)
              </h3>
              <p className="text-xs text-sky-800">
                Penilaian 10 item penglibatan murid semasa PdP berlangsung (Maksimum 50 markah).
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-sky-700 font-medium">Subtotal Murid:</span>
              <div className="text-lg font-extrabold text-sky-900 font-mono">
                {skorMuridTotal} / 50
              </div>
            </div>
          </div>

          {/* Panduan Skor Murid */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <span className="text-xs font-bold text-slate-800 uppercase block mb-2">
              Panduan Skor Murid Mengikut Peratusan Penglibatan:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {SKALA_MURID_GUIDE.map((g) => (
                <div key={g.skor} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-indigo-700 flex items-center gap-1 mb-0.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[11px]">
                      {g.skor}
                    </span>
                    <span>{g.range}</span>
                  </div>
                  <span className="text-[11px] text-slate-600 leading-tight">{g.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 10 Items List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {ITEM_MURID_DESCRIPTIONS.map((desc, idx) => {
              const currentScore = skorMuridArray[idx] || 0;

              return (
                <div key={idx} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                          {desc.replace(/^\d+\.\s*/, '')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const isSelected = currentScore === s;
                        const ranges = ['', '1-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateMuridScore(idx, s)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold flex flex-col items-center min-w-[50px] transition-all ${
                              isSelected
                                ? 'bg-sky-600 text-white shadow-xs scale-105 ring-2 ring-sky-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>Skor {s}</span>
                            <span className="text-[10px] font-normal opacity-85">{ranges[s]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('guru')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali ke Rubrik Guru
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gambar')}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              Seterusnya: 4 Keping Gambar Evidens
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: 4 Gambar Evidens */}
      {activeTab === 'gambar' && (
        <div className="space-y-6">
          <PhotoEvidenceUploader
            photos={{
              gambar1: record.gambar1,
              gambar2: record.gambar2,
              gambar3: record.gambar3,
              gambar4: record.gambar4,
            }}
            onChange={handlePhotoChange}
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('murid')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali ke Rubrik Murid
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rumusan')}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              Seterusnya: Refleksi & Rumusan
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 5: Refleksi & Rumusan */}
      {activeTab === 'rumusan' && (
        <div className="space-y-6">
          {/* Bahagian H: Refleksi Temu Bual */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                H
              </span>
              Bahagian H – Refleksi (Diisi semasa menemu bual guru sekolah)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5 leading-relaxed">
                  1. Apa pandangan anda mengenai pengajaran dan pembelajaran (PdP) KBAT yang telah anda laksanakan tadi?
                </label>
                <textarea
                  rows={3}
                  value={record.refleksiPdP || ''}
                  onChange={(e) => updateField('refleksiPdP', e.target.value)}
                  placeholder="Catatkan pandangan guru mengenai kekuatan, respons murid, dan keberkesanan aktiviti KBAT..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5 leading-relaxed">
                  2. Bagaimana anda boleh membuat penambahbaikan/pemantapan terhadap PdP KBAT anda? (Nyatakan perancangan anda.)
                </label>
                <textarea
                  rows={3}
                  value={record.perancanganPenambahbaikan || ''}
                  onChange={(e) => updateField('perancanganPenambahbaikan', e.target.value)}
                  placeholder="Catatkan tindakan susulan guru, intervensi murid, atau penggunaan alat berfikir lain..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Bahagian I: Rumusan Pencerap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                I
              </span>
              Bahagian I – Rumusan Keseluruhan Pencerap & Tandatangan
            </h3>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Rumusan Keseluruhan Pencerap:
              </label>
              <textarea
                rows={3}
                value={record.rumusanPencerap || ''}
                onChange={(e) => updateField('rumusanPencerap', e.target.value)}
                placeholder="Berikan ulasan menyeluruh, pujian, dan cadangan penambahbaikan untuk guru yang dicerap..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Digital Signature Pads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <DigitalSignaturePad
                  label="Tandatangan Digital Pencerap"
                  initialSignature={record.tandatanganPencerap}
                  onSave={(sig) => updateField('tandatanganPencerap', sig)}
                />
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {currentUser?.tandatanganDigital && (
                    <button
                      type="button"
                      onClick={() => updateField('tandatanganPencerap', currentUser.tandatanganDigital)}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Gunakan TT Profil ({currentUser.nama.split(' ')[0]})
                    </button>
                  )}
                  {onOpenUploadSignature && (
                    <button
                      type="button"
                      onClick={onOpenUploadSignature}
                      className="text-xs bg-white hover:bg-slate-50 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      {currentUser?.tandatanganDigital ? 'Kemas Kini / Muat Naik TT Baru' : 'Muat Naik TT Digital Pentadbir'}
                    </button>
                  )}
                </div>
              </div>

              <DigitalSignaturePad
                label="Tandatangan Digital Guru Yang Dicerap"
                initialSignature={record.tandatanganGuru}
                onSave={(sig) => updateField('tandatanganGuru', sig)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('gambar')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali ke Evidens Gambar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleManualSave('Draf')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Sebagai Draf
              </button>

              <button
                type="button"
                onClick={() => handleManualSave('Selesai')}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan & Sahkan Pencerapan Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
