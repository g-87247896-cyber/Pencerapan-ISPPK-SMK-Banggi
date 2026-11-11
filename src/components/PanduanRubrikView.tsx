import React, { useState } from 'react';
import { RUBRIK_GURU_ITEMS, ITEM_MURID_DESCRIPTIONS, TAHAP_PENCAPAIAN_INFO } from '../types/isppk';
import { BookOpen, HelpCircle, Check, Info, FileText } from 'lucide-react';

export const PanduanRubrikView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'skor' | 'rubrikGuru' | 'rubrikMurid' | 'ithink'>('skor');

  const I_THINK_TOOLS = [
    { name: 'Peta Bulatan', use: 'Mendefinisikan mengikut konteks atau sumbang saran idea awal.' },
    { name: 'Peta Buih', use: 'Menerangkan kualiti, sifat atau ciri-ciri sesuatu topik.' },
    { name: 'Peta Buih Berganda', use: 'Membanding beza persamaan dan perbezaan antara dua perkara.' },
    { name: 'Peta Pokok', use: 'Membuat klasifikasi atau pengelasan mengikut kategori.' },
    { name: 'Peta Dakap', use: 'Menganalisis hubungan bahagian kepada keseluruhan.' },
    { name: 'Peta Alir', use: 'Menyusun urutan peringkat, kronologi, proses atau langkah.' },
    { name: 'Peta Pelbagai Alir', use: 'Menganalisis sebab dan akibat sesuatu fenomena/isu.' },
    { name: 'Peta Titi', use: 'Melihat analogi atau hubungan faktor penghubung (as/seperti).' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Panduan Instrumen & Rubrik Penskoran ISPPK 2027
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Rujukan Standard Kualiti Pengajaran dan Pembelajaran (SK@S) Pembudayaan KBAT KPM
            </p>
          </div>
          <a
            href="./assets/aistudio/V2_Borang_Instrumen_ISPPK_2026__Guru___Murid__pdf__1__23969c42.pdf"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" /> Buka PDF Asal KPM
          </a>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-200 mt-4 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('skor')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'skor'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Tanda Aras Pencapaian
          </button>
          <button
            onClick={() => setActiveTab('rubrikGuru')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'rubrikGuru'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Rubrik Guru (10 Item)
          </button>
          <button
            onClick={() => setActiveTab('rubrikMurid')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'rubrikMurid'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Rubrik Murid (10 Item)
          </button>
          <button
            onClick={() => setActiveTab('ithink')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'ithink'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Alat Berfikir i-Think
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'skor' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900">
            Tanda Aras Pencapaian Standard Pembudayaan KBAT dalam PdP (Tahun 2026)
          </h3>
          <p className="text-xs text-slate-600">
            Tanda aras pencapaian standard pembudayaan KBAT dalam PdP adalah berdasarkan peratus pencapaian jumlah skor item dalam instrumen ini:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-300 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                  <th className="p-3 text-center w-28 border-r border-slate-300 font-bold">Skor (%)</th>
                  <th className="p-3 text-left border-r border-slate-300 font-bold">Tahap</th>
                  <th className="p-3 text-left font-bold">Penerangan Standard KPM</th>
                </tr>
              </thead>
              <tbody>
                {TAHAP_PENCAPAIAN_INFO.map((item) => (
                  <tr key={item.tahap} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-3 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                      {item.range}
                    </td>
                    <td className="p-3 border-r border-slate-200">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs border ${item.badgeClass}`}>
                        {item.tahap}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 leading-relaxed font-medium">
                      {item.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800">Pemberat Skor Keseluruhan:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div>• <strong>Komponen Guru (50 Markah):</strong> Perancangan (20) + Pelaksanaan (25) + Refleksi (5)</div>
              <div>• <strong>Komponen Murid (50 Markah):</strong> Murid Sebagai Pembelajar Aktif (10 item x 5 markah)</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rubrikGuru' && (
        <div className="space-y-4">
          {RUBRIK_GURU_ITEMS.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-indigo-900 text-white font-mono text-xs font-bold">
                  {item.kod}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{item.aspek}</h4>
                <span className="text-xs text-indigo-700 font-medium">({item.standardKualiti})</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3 text-xs text-slate-600">
                <strong className="text-slate-800 block mb-0.5">Kriteria:</strong>
                {item.kriteria.join(' ')}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const titles = ['', '1. Kesedaran', '2. Asas', '3. Pertengahan', '4. Lanjutan', '5. Pakar'];
                  return (
                    <div key={lvl} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                      <span className="font-bold text-indigo-800 block mb-1">{titles[lvl]}</span>
                      <p className="text-[11px] text-slate-600 leading-snug">{item.descriptors[lvl]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'rubrikMurid' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Bahagian F – Rubrik Penilaian Murid (Murid Sebagai Pembelajar Aktif)
          </h3>
          <p className="text-xs text-slate-600">
            Panduan peratusan kehadiran dan penglibatan murid dalam aktiviti bilik darjah:
          </p>

          <div className="space-y-2">
            {ITEM_MURID_DESCRIPTIONS.map((desc, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 text-xs">
                <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-800 leading-relaxed">
                  {desc.replace(/^\d+\.\s*/, '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ithink' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Panduan Alat Berfikir i-Think (PdP Bercirikan KBAT)
          </h3>
          <p className="text-xs text-slate-600">
            Item 2.4 dalam rubrik guru dan Item 7 dalam rubrik murid mengutamakan penggunaan alat berfikir bersesuaian:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {I_THINK_TOOLS.map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30">
                <span className="text-xs font-bold text-indigo-950 block mb-1">
                  {idx + 1}. {t.name}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">{t.use}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
