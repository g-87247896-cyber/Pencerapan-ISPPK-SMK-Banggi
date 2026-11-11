import React, { useState, useEffect } from 'react';
import { apiService, StatsResponse } from '../services/api';
import { TAHAP_PENCAPAIAN_INFO } from '../types/isppk';
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  BookOpen,
  PieChart,
  BarChart3,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardStatistik: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const data = await apiService.getStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Menganalisis statistik pencerapan SMK Banggi...</p>
      </div>
    );
  }

  const total = stats?.total || 0;
  const purata = stats?.purataPeratus || 0;
  const purataDomain = stats?.purataDomain || { perancangan: 0, pelaksanaan: 0, refleksi: 0, murid: 0 };
  const tahapDist = stats?.tahapDistribusi || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Analisis & Statistik Pembudayaan KBAT SMK Banggi 2027
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Laporan pencapaian instrumen ISPPK berdasarkan pangkalan data pencerapan terkini sekolah
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pencerapan */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Jumlah Pencerapan
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {total} <span className="text-xs font-normal text-slate-400">sesi</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" /> {stats?.selesai || 0} disahkan selesai
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Purata Peratus Sekolah */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Purata Skor KBAT
            </span>
            <div className="text-2xl font-extrabold text-indigo-700 mt-1 font-mono">
              {purata}%
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Tahap: {purata >= 81 ? 'Cemerlang' : purata >= 61 ? 'Baik' : 'Sederhana'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Bilangan Guru Dicerap */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Bilangan Guru Dicerap
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
              {stats?.bilGuru || 0} <span className="text-xs font-normal text-slate-400">orang</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Guru pelbagai bidang & panitia
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Cemerlang Count */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Tahap Cemerlang (81-100%)
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
              {tahapDist['Cemerlang'] || 0}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({total > 0 ? Math.round(((tahapDist['Cemerlang'] || 0) / total) * 100) : 0}%)
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium block mt-1">
              Membudayakan KBAT mantap
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdown by 4 Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Scores Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pencapaian Purata Mengikut Domain Instrumen
              </h3>
              <p className="text-xs text-slate-500">Purata markah diperoleh berbanding markah maksimum</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Perancangan PdP */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">1. Perancangan PdP Guru</span>
                <span className="font-mono text-indigo-700">
                  {purataDomain.perancangan} / 20 ({Math.round((purataDomain.perancangan / 20) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (purataDomain.perancangan / 20) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Objektif KBAT, set induksi, perancangan aktiviti berpusatkan murid, & pentaksiran.
              </p>
            </div>

            {/* 2. Pelaksanaan PdP */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">2. Pelaksanaan PdP Guru</span>
                <span className="font-mono text-emerald-700">
                  {purataDomain.pelaksanaan} / 25 ({Math.round((purataDomain.pelaksanaan / 25) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (purataDomain.pelaksanaan / 25) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Persekitaran kondusif, pelibatan aktif, teknik penyoalan, & alat berfikir i-Think.
              </p>
            </div>

            {/* 3. Refleksi Guru */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">3. Refleksi PdP Guru</span>
                <span className="font-mono text-amber-700">
                  {purataDomain.refleksi} / 5 ({Math.round((purataDomain.refleksi / 5) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (purataDomain.refleksi / 5) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Amalan refleksi kendiri dan tindakan penambahbaikan berterusan guru.
              </p>
            </div>

            {/* 4. Murid Sebagai Pembelajar Aktif */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">4. Murid Sebagai Pembelajar Aktif</span>
                <span className="font-mono text-sky-700">
                  {purataDomain.murid} / 50 ({Math.round((purataDomain.murid / 50) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (purataDomain.murid / 50) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tahap respons, kemahiran menyoal, kerjasama rakan sebaya, & penggunaan alat berfikir oleh murid.
              </p>
            </div>
          </div>
        </div>

        {/* Distribution of Tahap Pencapaian */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Taburan Tahap Pembudayaan KBAT 2027
              </h3>
              <p className="text-xs text-slate-500">Bilangan guru mengikut tanda aras rasmi KPM</p>
            </div>
          </div>

          <div className="space-y-3">
            {TAHAP_PENCAPAIAN_INFO.map((item) => {
              const count = tahapDist[item.tahap] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={item.tahap} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${item.badgeClass}`}>
                        {item.tahap}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">({item.range})</span>
                    </div>
                    <div className="font-bold text-slate-800 font-mono">
                      {count} rekod ({pct}%)
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
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
      </div>

      {/* Cadangan Tindakan Pemantapan Panitia / PLC */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-300" />
          <h3 className="text-base font-bold text-white">
            Cadangan Intervensi & Pemantapan Panitia (PLC SMK Banggi)
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Berdasarkan analitik skor pencerapan terkini, cadangan berikut disyorkan kepada pentadbir dan Ketua Panitia bagi melonjakkan pembudayaan KBAT di SMK Banggi:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <strong className="text-amber-300 block mb-1">Bengkel Alat Berfikir (i-Think):</strong>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              Memperkukuh penggunaan 8 peta pemikiran i-Think dalam penulisan RPH dan aktiviti bilik darjah.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <strong className="text-sky-300 block mb-1">Teknik Penyoalan Mencapah:</strong>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              Latihan membina soalan mengikut Taksonomi Bloom yang disemak (Menganalisis, Menilai, Mencipta).
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/10">
            <strong className="text-emerald-300 block mb-1">Learning Walk & Peer Coaching:</strong>
            <p className="text-slate-200 text-[11px] leading-relaxed">
              Perkongsian amalan terbaik antara guru yang mencapai tahap Cemerlang dengan rakan sejawat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
