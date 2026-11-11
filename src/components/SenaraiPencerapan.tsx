import React, { useState, useEffect } from 'react';
import { PencerapanRecord, TAHAP_PENCAPAIAN_INFO } from '../types/isppk';
import { apiService } from '../services/api';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  User,
  GraduationCap,
  Camera,
  CheckCircle2,
  Clock,
  RefreshCw,
  Award,
  Share2,
} from 'lucide-react';

interface SenaraiPencerapanProps {
  onSelectRecord: (record: PencerapanRecord) => void;
  onPrintRecord: (record: PencerapanRecord) => void;
  onNewRecord: () => void;
  onShareSummary?: (record: PencerapanRecord) => void;
}

export const SenaraiPencerapan: React.FC<SenaraiPencerapanProps> = ({
  onSelectRecord,
  onPrintRecord,
  onNewRecord,
  onShareSummary,
}) => {
  const [records, setRecords] = useState<PencerapanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTahap, setFilterTahap] = useState('');
  const [filterTingkatan, setFilterTingkatan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPencerapanList({
        q: searchQuery,
        tahap: filterTahap,
        tingkatan: filterTingkatan,
        status: filterStatus,
      });
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filterTahap, filterTingkatan, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Adakah anda pasti ingin memadam rekod pencerapan bagi ${name}?`)) {
      setDeletingId(id);
      try {
        await apiService.deletePencerapan(id);
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        alert('Gagal memadam rekod.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getTahapBadge = (tahap: string) => {
    const info = TAHAP_PENCAPAIAN_INFO.find((t) => t.tahap === tahap);
    if (!info) {
      return (
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {tahap || 'Draf'}
        </span>
      );
    }
    return (
      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${info.badgeClass}`}>
        {info.tahap}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Pangkalan Data Pencerapan SMK Banggi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Semua rekod skor ISPPK 2027 tersimpan secara automatik untuk rujukan pentadbir dan laporan PPD Kudat
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={fetchRecords}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Muat semula data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <a
              href="/api/export/csv"
              download
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Eksport CSV / Excel
            </a>

            <button
              onClick={onNewRecord}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Pencerapan Baru
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari guru, mata pelajaran, topik..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          <select
            value={filterTahap}
            onChange={(e) => setFilterTahap(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
          >
            <option value="">Semua Tahap Pencapaian</option>
            <option value="Cemerlang">Cemerlang (81-100%)</option>
            <option value="Baik">Baik (61-80%)</option>
            <option value="Sederhana">Sederhana (51-60%)</option>
            <option value="Tahap Minimum">Tahap Minimum (41-50%)</option>
            <option value="Tidak Memenuhi Tahap Minimum">Tidak Memenuhi (&le; 40%)</option>
          </select>

          <select
            value={filterTingkatan}
            onChange={(e) => setFilterTingkatan(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
          >
            <option value="">Semua Tingkatan</option>
            <option value="Tingkatan 1">Tingkatan 1</option>
            <option value="Tingkatan 2">Tingkatan 2</option>
            <option value="Tingkatan 3">Tingkatan 3</option>
            <option value="Tingkatan 4">Tingkatan 4</option>
            <option value="Tingkatan 5">Tingkatan 5</option>
            <option value="Tingkatan 6">Tingkatan 6</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
          >
            <option value="">Semua Status</option>
            <option value="Selesai">Disahkan Selesai</option>
            <option value="Draf">Draf</option>
          </select>
        </div>
      </div>

      {/* Record Cards List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Memuatkan data dari pangkalan data sekolah SMK Banggi...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Tiada Rekod Dijumpai</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Belum ada rekod pencerapan atau tiada padanan dengan tapisan carian anda.
          </p>
          <button
            onClick={onNewRecord}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Mula Pencerapan Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r) => {
            const countPhotos = [r.gambar1, r.gambar2, r.gambar3, r.gambar4].filter(Boolean).length;

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 line-clamp-1">{r.namaGuru}</span>
                        {r.jantinaGuru && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({r.jantinaGuru === 'Lelaki' ? 'L' : 'P'})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-indigo-700 font-semibold">{r.mataPelajaran}</span>
                      <span className="text-[11px] text-slate-400"> • {r.tingkatan}</span>
                    </div>

                    <div className="flex-shrink-0">{getTahapBadge(r.tahapPencapaian)}</div>
                  </div>

                  {/* Topic / Title */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-800">Tajuk:</strong> {r.tajukTopik || 'Tiada tajuk direkodkan'}
                  </p>

                  {/* Observation details snippet */}
                  <div className="space-y-1.5 text-[11px] text-slate-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{r.tarikhPencerapan} ({r.masaPencerapan || r.masaPdP || 'Masa PdP'})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1">Pencerap: {r.namaPencerap || '-'}</span>
                    </div>
                  </div>

                  {/* Score pill & photo indicators */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-semibold block">Skor Keseluruhan:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-extrabold text-indigo-900 font-mono">
                          {r.skorKeseluruhan}
                        </span>
                        <span className="text-xs text-slate-500">/ 100</span>
                        <span className="text-xs font-bold text-amber-600 ml-1">({r.peratusPencapaian}%)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                        <Camera className="w-3 h-3 text-slate-400" />
                        <span>{countPhotos} / 4 Foto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectRecord(r)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg flex items-center gap-1 transition-colors"
                      title="Kemas kini pencerapan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Kemas Kini
                    </button>

                    <button
                      onClick={() => onPrintRecord(r)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors"
                      title="Cetak format rasmi KPM"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      Format KPM
                    </button>

                    {onShareSummary && (
                      <button
                        onClick={() => onShareSummary(r)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors"
                        title="Kongsi rumusan ringkas dapatan pencerapan kepada guru via E-mel/Mesej"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        Kongsi
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(r.id, r.namaGuru)}
                    disabled={deletingId === r.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Padam rekod"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
