import React, { useState, useEffect } from 'react';
import {
  apiService,
  DashboardReportResponse,
  TeacherScoreStat,
  ItemAnalysisStat,
} from '../services/api';
import { TAHAP_PENCAPAIAN_INFO } from '../types/isppk';
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  BookOpen,
  Filter,
  Calendar,
  Download,
  Printer,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  BarChart3,
  RefreshCw,
  School,
  ChevronRight,
  Eye,
  X,
  Target,
} from 'lucide-react';

interface ReportingDashboardProps {
  onViewTeacherObservation?: (recordId: string) => void;
}

export const ReportingDashboard: React.FC<ReportingDashboardProps> = ({
  onViewTeacherObservation,
}) => {
  const [data, setData] = useState<DashboardReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRangePreset, setDateRangePreset] = useState<string>('semua');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua');
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>('Semua');
  const [selectedTingkatan, setSelectedTingkatan] = useState<string>('Semua');
  const [teacherSearch, setTeacherSearch] = useState<string>('');

  // Selected teacher for detail modal
  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState<TeacherScoreStat | null>(null);

  const SUBJECTS_LIST = [
    'Semua',
    'Sains',
    'Matematik',
    'Fizik',
    'Kimia',
    'Biologi',
    'Bahasa Melayu',
    'Bahasa Inggeris',
    'Sejarah',
    'Geografi',
    'Pendidikan Islam',
    'Pendidikan Moral',
    'Reka Bentuk & Teknologi (RBT)',
    'Asas Sains Komputer (ASK)',
  ];

  const EVALUATORS_LIST = [
    'Semua',
    'Pengetua',
    'Penolong Kanan Pentadbiran (PK1)',
    'Guru Kanan Mata Pelajaran (GKMP)',
    'En. Roslan bin Awang',
    'Pn. Halimah binti Kassim',
    'En. Mohd Ridzuan bin Salleh',
  ];

  const TINGKATAN_LIST = [
    'Semua',
    'Tingkatan 1',
    'Tingkatan 2',
    'Tingkatan 3',
    'Tingkatan 4',
    'Tingkatan 5',
    'Tingkatan 6',
  ];

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await apiService.getDashboardReport({
        startDate,
        endDate,
        subject: selectedSubject,
        evaluator: selectedEvaluator,
        tingkatan: selectedTingkatan,
      });
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, selectedSubject, selectedEvaluator, selectedTingkatan]);

  // Handle Preset Date Ranges
  const handlePresetChange = (preset: string) => {
    setDateRangePreset(preset);
    const now = new Date();
    const currentYear = now.getFullYear();

    if (preset === 'semua') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'bulan_ini') {
      const firstDay = new Date(currentYear, now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(currentYear, now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'suku1') {
      setStartDate(`${currentYear}-01-01`);
      setEndDate(`${currentYear}-03-31`);
    } else if (preset === 'suku2') {
      setStartDate(`${currentYear}-04-01`);
      setEndDate(`${currentYear}-06-30`);
    } else if (preset === 'tahun2027') {
      setStartDate('2027-01-01');
      setEndDate('2027-12-31');
    }
  };

  const handleResetFilters = () => {
    setDateRangePreset('semua');
    setStartDate('');
    setEndDate('');
    setSelectedSubject('Semua');
    setSelectedEvaluator('Semua');
    setSelectedTingkatan('Semua');
    setTeacherSearch('');
  };

  const handleReseedSample = async () => {
    if (confirm('Set semula data pencerapan dengan set data sampel terkini SMK Banggi?')) {
      await apiService.reseedDatabase();
      fetchReportData();
    }
  };

  const filteredTeachers = data?.teacherScores.filter((t) =>
    teacherSearch ? t.namaGuru.toLowerCase().includes(teacherSearch.toLowerCase()) || t.mataPelajaran.toLowerCase().includes(teacherSearch.toLowerCase()) : true
  ) || [];

  const getTahapBadge = (tahap: string) => {
    const info = TAHAP_PENCAPAIAN_INFO.find((item) => item.tahap === tahap);
    if (!info) {
      return (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {tahap}
        </span>
      );
    }
    return (
      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${info.badgeClass}`}>
        {info.tahap}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                Papan Pemuka Laporan Eksekutif
              </span>
              <span className="text-xs text-slate-500 font-medium">SMK Banggi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Laporan Prestasi Pencerapan Guru & Pembudayaan KBAT
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Analisis menyeluruh purata skor setiap guru, trend prestasi sekolah, dan aspek penambahbaikan kritikal (ISPPK KPM 2027).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Cetak / PDF Laporan
            </button>

            <a
              href={`/api/export/csv?startDate=${startDate}&endDate=${endDate}&subject=${selectedSubject}&evaluator=${selectedEvaluator}`}
              download
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Eksport CSV
            </a>

            <button
              onClick={handleReseedSample}
              className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 transition-colors"
              title="Muat semula set data teladan SMK Banggi"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Muat Data Teladan
            </button>

            <button
              onClick={fetchReportData}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Segarkan data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          {/* Preset Date Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Julat Tarikh:
            </span>
            {[
              { id: 'semua', label: 'Semua Masa' },
              { id: 'bulan_ini', label: 'Bulan Ini' },
              { id: 'suku1', label: 'Suku 1 (Jan-Mac 2027)' },
              { id: 'suku2', label: 'Suku 2 (Apr-Jun 2027)' },
              { id: 'tahun2027', label: 'Tahun 2027' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  dateRangePreset === p.id
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Granular Filters Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {/* Custom Date Range */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Dari Tarikh - Hingga:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDateRangePreset('custom');
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDateRangePreset('custom');
                  }}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mata Pelajaran:
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {SUBJECTS_LIST.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Evaluator Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Pencerap / Penilai:
              </label>
              <select
                value={selectedEvaluator}
                onChange={(e) => setSelectedEvaluator(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {EVALUATORS_LIST.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            {/* Tingkatan Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tingkatan:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedTingkatan}
                  onChange={(e) => setSelectedTingkatan(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {TINGKATAN_LIST.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {(startDate || endDate || selectedSubject !== 'Semua' || selectedEvaluator !== 'Semua' || selectedTingkatan !== 'Semua') && (
                  <button
                    onClick={handleResetFilters}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                    title="Set semula tapisan"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Menjana analisis laporan statistik pencerapan...</p>
        </div>
      ) : !data || data.total === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Tiada Data Padanan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Tiada rekod pencerapan bagi tarikh, mata pelajaran, atau pencerap yang dipilih.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl inline-flex items-center gap-1.5 shadow-xs"
          >
            Set Semula Tapisan
          </button>
        </div>
      ) : (
        <>
          {/* Key Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Score */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Purata Skor Sekolah
                </span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <TrendingUp className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {data.purataPeratus}%
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {data.purataPeratus >= 81 ? 'Cemerlang' : 'Baik'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Sasaran KPM: 80%</span>
                  <span className="font-semibold text-indigo-700">
                    {data.purataPeratus >= 80 ? '+Melepasi Sasaran' : 'Dalam Bimbingan'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min(100, data.purataPeratus)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Total Evaluations & Teachers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Liputan Pencerapan
                </span>
                <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <Users className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {data.teacherScores.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">guru dicerap</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Jumlah keseluruhan <strong>{data.total} sesi pencerapan</strong> telah dijalankan oleh pentadbir.
                </p>
              </div>
            </div>

            {/* Cemerlang Ratio */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kadar Cemerlang (≥81%)
                </span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Award className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 font-mono">
                    {Math.round(((data.tahapDistribusi['Cemerlang'] || 0) / data.total) * 100)}%
                  </span>
                  <span className="text-xs text-slate-500">
                    ({data.tahapDistribusi['Cemerlang'] || 0} / {data.total} sesi)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium mt-2">
                  Membudayakan elemen KBAT secara konsisten dan menyeluruh.
                </p>
              </div>
            </div>

            {/* Domain Highlight */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Domain Paling Menonjol
                </span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Sparkles className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-lg font-bold text-slate-900">
                  Pelaksanaan PdP
                </div>
                <div className="text-xs text-amber-700 font-semibold font-mono mt-0.5">
                  {data.domainAverages.pelaksanaan} / 25 ({Math.round((data.domainAverages.pelaksanaan / 25) * 100)}%)
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Persekitaran kondusif & penglibatan aktif murid menjadi teras kekuatan sekolah.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Overall School Performance Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Trend Prestasi Keseluruhan Sekolah (Mengikut Bulan)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perubahan purata skor pembudayaan KBAT mengikut garis masa pencerapan tahun 2027
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  Tanda Aras KPM: 80%
                </span>
              </div>

              {data.monthlyTrends.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                  Tiada data trend bagi tempoh dipilih
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {data.monthlyTrends.map((m) => (
                      <div
                        key={m.month}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center"
                      >
                        <span className="text-xs font-semibold text-slate-600 block">{m.month}</span>
                        <div className="text-xl font-extrabold text-indigo-700 font-mono mt-1">
                          {m.avgScore}%
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {m.count} sesi pencerapan
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Visual Timeline Bars */}
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 mb-3 block">
                      Graf Perbandingan Skor Bulanan vs Sasaran Sekolah (80%):
                    </span>
                    <div className="space-y-3">
                      {data.monthlyTrends.map((m) => (
                        <div key={m.month} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-800 font-semibold">{m.month}</span>
                            <span className="font-mono text-indigo-700 font-bold">{m.avgScore}%</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                            {/* KPM 80% benchmark marker line */}
                            <div className="absolute left-[80%] top-0 bottom-0 w-0.5 bg-rose-400 z-10" />
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                m.avgScore >= 80 ? 'bg-indigo-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, m.avgScore)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tahap Distribution & Evaluators */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Taburan Tahap KBAT Sekolah
                </h3>
                <p className="text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                  Peratusan guru dalam setiap kategori tanda aras KPM
                </p>

                <div className="space-y-3">
                  {TAHAP_PENCAPAIAN_INFO.map((item) => {
                    const count = data.tahapDistribusi[item.tahap] || 0;
                    const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;

                    return (
                      <div key={item.tahap} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${item.badgeClass}`}>
                            {item.tahap}
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {count} sesi ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.tahap === 'Cemerlang'
                                ? 'bg-emerald-500'
                                : item.tahap === 'Baik'
                                ? 'bg-blue-500'
                                : item.tahap === 'Sederhana'
                                ? 'bg-amber-500'
                                : item.tahap === 'Tahap Minimum'
                                ? 'bg-orange-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evaluators summary */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Pencerapan Mengikut Pentadbir:
                </span>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {data.evaluatorStats.map((e) => (
                    <div key={e.name} className="flex justify-between items-center py-0.5">
                      <span className="line-clamp-1">{e.name}</span>
                      <span className="font-mono text-slate-800 font-semibold">{e.count} sesi</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Average Scores Per Teacher */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Purata Skor Setiap Guru (Teacher Score Leaderboard)
                </h3>
                <p className="text-xs text-slate-500">
                  Senarai purata markah keseluruhan dan prestasi 4 domain bagi setiap guru yang telah dicerap
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari nama guru / subjek..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3 text-left w-12 font-bold">Ked.</th>
                    <th className="py-2.5 px-3 text-left font-bold">Nama Guru & Opsyen</th>
                    <th className="py-2.5 px-3 text-left font-bold">Mata Pelajaran</th>
                    <th className="py-2.5 px-3 text-center font-bold">Sesi</th>
                    <th className="py-2.5 px-3 text-center font-bold">Perancangan (20)</th>
                    <th className="py-2.5 px-3 text-center font-bold">Pelaksanaan (25)</th>
                    <th className="py-2.5 px-3 text-center font-bold">Refleksi (5)</th>
                    <th className="py-2.5 px-3 text-center font-bold">Murid Aktif (50)</th>
                    <th className="py-2.5 px-3 text-center font-bold">Purata Skor</th>
                    <th className="py-2.5 px-3 text-center font-bold">Tahap</th>
                    <th className="py-2.5 px-3 text-center font-bold">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((t, idx) => (
                    <tr key={t.namaGuru} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{t.namaGuru}</div>
                        <div className="text-[11px] text-slate-500 font-medium">Opsyen: {t.opsyen}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{t.mataPelajaran}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700 bg-indigo-50/40 rounded">
                        {t.count}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{t.avgPerancangan}</td>
                      <td className="py-3 px-3 text-center font-mono">{t.avgPelaksanaan}</td>
                      <td className="py-3 px-3 text-center font-mono">{t.avgRefleksi}</td>
                      <td className="py-3 px-3 text-center font-mono">{t.avgMurid}</td>
                      <td className="py-3 px-3 text-center font-mono text-sm font-extrabold text-indigo-950">
                        {t.avgScore}%
                      </td>
                      <td className="py-3 px-3 text-center">{getTahapBadge(t.tahapPencapaian)}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedTeacherDetail(t)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1 mx-auto transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Butiran
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Common Areas for Development & School Strengths */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Common Areas for Development */}
            <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Aspek Penambahbaikan Utama (Common Areas for Development)
                  </h3>
                  <p className="text-xs text-rose-700 font-medium">
                    Item rubrik dengan skor purata terendah yang memerlukan intervensi panitia / PLC
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {data.areasForDevelopment.map((item, idx) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/40"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-rose-600 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Domain: {item.domain} • Kod: {item.code}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-mono font-bold text-rose-700 text-sm">
                          {item.avgScore} / {item.maxScore}
                        </span>
                        <div className="text-[10px] text-rose-600 font-semibold font-mono">
                          ({item.percentage}%)
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-rose-200 overflow-hidden my-2">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <div className="mt-2.5 p-2 rounded-lg bg-white border border-rose-200/70 text-[11px] text-slate-700">
                      <strong className="text-rose-800 flex items-center gap-1 mb-0.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        Cadangan Intervensi Pentadbir / Panitia:
                      </strong>
                      <p className="leading-relaxed">{item.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* School Strengths */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kekuatan Utama Sekolah (Top School Strengths)
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    Amalan terbaik KBAT dengan skor tertinggi yang berjaya dibudayakan di SMK Banggi
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {data.schoolStrengths.map((item, idx) => (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Domain: {item.domain} • Kod: {item.code}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          {item.avgScore} / {item.maxScore}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                          ({item.percentage}%)
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-emerald-200 overflow-hidden my-2">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-emerald-900 leading-relaxed mt-2 font-medium">
                      ✓ Amalan ini disyorkan sebagai model rujukan bagi sesi perkongsian amalan terbaik guru (Learning Walk).
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Teacher Detail Historical Modal */}
      {selectedTeacherDetail && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedTeacherDetail(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                  Profil Prestasi Pencerapan Guru
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedTeacherDetail.namaGuru}</h3>
                <p className="text-xs text-slate-500">
                  Opsyen: {selectedTeacherDetail.opsyen} • Mata Pelajaran: {selectedTeacherDetail.mataPelajaran}
                </p>
              </div>
              <button
                onClick={() => setSelectedTeacherDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">Purata Keseluruhan:</span>
                <span className="text-xl font-extrabold text-indigo-700 font-mono">
                  {selectedTeacherDetail.avgScore}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Tahap KBAT:</span>
                <div className="mt-0.5">{getTahapBadge(selectedTeacherDetail.tahapPencapaian)}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Bilangan Pencerapan:</span>
                <span className="text-base font-bold text-slate-800 font-mono">
                  {selectedTeacherDetail.count} sesi
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Pencerapan Terakhir:</span>
                <span className="text-xs font-medium text-slate-700">
                  {selectedTeacherDetail.latestDate || '-'}
                </span>
              </div>
            </div>

            {/* Historical Observation Sessions */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Sejarah Sesi Pencerapan:
              </h4>
              <div className="space-y-2">
                {selectedTeacherDetail.history.map((h, hIdx) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">Sesi #{hIdx + 1}</span>
                        <span className="text-xs text-slate-500">• {h.date}</span>
                        <span className="text-xs text-indigo-700 font-semibold">• {h.subject}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">ID: {h.id}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-900">{h.peratus}%</span>
                        <div className="text-[10px] text-slate-500">{h.tahap}</div>
                      </div>

                      {onViewTeacherObservation && (
                        <button
                          onClick={() => {
                            setSelectedTeacherDetail(null);
                            onViewTeacherObservation(h.id);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
                        >
                          Lihat Borang
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTeacherDetail(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
