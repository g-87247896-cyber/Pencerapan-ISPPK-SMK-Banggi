import React from 'react';
import { PencerapanRecord, RUBRIK_GURU_ITEMS, ITEM_MURID_DESCRIPTIONS, TAHAP_PENCAPAIAN_INFO } from '../types/isppk';
import { Printer, ArrowLeft, Download, Award, Share2 } from 'lucide-react';

interface CetakInstrumenRasmiProps {
  record: PencerapanRecord;
  onBack: () => void;
  onShareSummary?: (record: PencerapanRecord) => void;
}

export const CetakInstrumenRasmi: React.FC<CetakInstrumenRasmiProps> = ({ record, onBack, onShareSummary }) => {
  const handlePrint = () => {
    window.print();
  };

  const currentTahap = TAHAP_PENCAPAIAN_INFO.find((t) => t.tahap === record.tahapPencapaian) || TAHAP_PENCAPAIAN_INFO[0];

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center gap-2">
          <div className="text-right mr-3 hidden sm:block">
            <div className="text-xs text-slate-500">Skor Keseluruhan</div>
            <div className="text-sm font-bold text-slate-800">{record.peratusPencapaian}% ({record.tahapPencapaian})</div>
          </div>

          {onShareSummary && (
            <button
              onClick={() => onShareSummary(record)}
              className="px-4 py-2.5 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-2 shadow-xs transition-colors"
              title="Kongsi rumusan ringkas dapatan pencerapan kepada guru"
            >
              <Share2 className="w-4 h-4 text-emerald-600" /> Kongsi Rumusan
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Cetak / Simpan ke PDF
          </button>
        </div>
      </div>

      {/* Official A4 Document Container */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-md border border-slate-300 rounded-lg text-slate-900 print:shadow-none print:border-none print:p-0 print:max-w-none">
        
        {/* Header Document */}
        <div className="pb-6 border-b-2 border-slate-800 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <img
              src="./assets/aistudio/Logo_SMK_Banggi_c52e1e56.png"
              alt="Lencana SMK Banggi"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center flex-1">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1">
              KEMENTERIAN PENDIDIKAN MALAYSIA
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 tracking-tight leading-snug">
              Instrumen Standard Penilaian Pembudayaan<br />
              Kemahiran Berfikir Aras Tinggi (KBAT) dalam Pengajaran dan Pembelajaran
            </h1>
            <div className="text-sm font-semibold text-slate-600 mt-1">
              (PdP Guru & Murid) — TAHUN 2026
            </div>
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700">
              <span>Sekolah: <strong className="text-slate-900">{record.namaSekolah || 'SMK BANGGI, KUDAT'}</strong></span>
              <span>•</span>
              <span>PPD: <strong>{record.ppd || 'PPD KUDAT'}</strong></span>
            </div>
          </div>
          <div className="w-20 hidden sm:block" />
        </div>

        {/* Bahagian A: Maklumat Pencerap */}
        <div className="mb-6">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian A – Maklumat Pencerap
          </div>
          <table className="w-full text-xs mt-2 border border-slate-300">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="w-1/3 bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">1. Nama Pencerap</td>
                <td className="p-2 font-semibold text-slate-900">{record.namaPencerap || '-'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">2. Jawatan</td>
                <td className="p-2">{record.jawatanPencerap || '-'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">3. Tarikh Pencerapan</td>
                <td className="p-2">{record.tarikhPencerapan || '-'}</td>
              </tr>
              <tr>
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">4. Masa Pencerapan</td>
                <td className="p-2">{record.masaPencerapan || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bahagian B: Maklumat Sekolah */}
        <div className="mb-6">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian B – Maklumat Sekolah
          </div>
          <table className="w-full text-xs mt-2 border border-slate-300">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="w-1/3 bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">1. Nama Sekolah</td>
                <td className="p-2 font-semibold">{record.namaSekolah || 'SMK BANGGI, KUDAT'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">2. PPD</td>
                <td className="p-2">{record.ppd || 'PPD KUDAT'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">3. Negeri</td>
                <td className="p-2">{record.negeri || 'SABAH'}</td>
              </tr>
              <tr>
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">4. E-mel Rasmi Sekolah</td>
                <td className="p-2">{record.emelSekolah || 'xea6062@moe.edu.my'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bahagian C: Maklumat Guru Yang Dicerap */}
        <div className="mb-6">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian C – Maklumat Guru Yang Dicerap
          </div>
          <table className="w-full text-xs mt-2 border border-slate-300">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="w-1/3 bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">1. Nama Guru</td>
                <td className="p-2 font-bold text-slate-900 text-sm">{record.namaGuru || '-'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">2. Jantina</td>
                <td className="p-2">{record.jantinaGuru}</td>
              </tr>
              <tr>
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">3. Opsyen</td>
                <td className="p-2 font-medium">{record.opsyenGuru || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bahagian D: Maklumat Kelas Yang Dicerap */}
        <div className="mb-6">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian D – Maklumat Kelas Yang Dicerap
          </div>
          <table className="w-full text-xs mt-2 border border-slate-300">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="w-1/3 bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">1. Mata Pelajaran Dicerap</td>
                <td className="p-2 font-bold text-indigo-900">{record.mataPelajaran || '-'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">2. Bil. Murid Hadir</td>
                <td className="p-2 font-medium">
                  {record.bilMuridHadir} / {record.bilMuridSebenar} orang
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">3. Tahun/Tingkatan</td>
                <td className="p-2 font-medium">{record.tingkatan || '-'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">4. Tajuk / Topik</td>
                <td className="p-2">{record.tajukTopik || '-'}</td>
              </tr>
              <tr>
                <td className="bg-slate-50 p-2 font-medium text-slate-600 border-r border-slate-300">5. Masa PdP</td>
                <td className="p-2">{record.masaPdP || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bahagian E: Rubrik Penilaian Guru */}
        <div className="mb-6 break-inside-avoid">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian E – Rubrik Penilaian Guru
          </div>
          <table className="w-full text-[11px] mt-2 border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="p-2 text-left w-12 border-r border-slate-300">Item</th>
                <th className="p-2 text-left border-r border-slate-300">Aspek / Kriteria SK@S</th>
                <th className="p-2 text-center w-28 border-r border-slate-300">Tahap Dicapai</th>
                <th className="p-2 text-center w-16">Skor (1-5)</th>
              </tr>
            </thead>
            <tbody>
              {RUBRIK_GURU_ITEMS.map((item) => {
                // @ts-expect-error dynamic key access
                const score = Number(record[item.id] || 0);
                const desc = item.descriptors[score] || '-';
                return (
                  <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-center border-r border-slate-200">{item.kod}</td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-semibold text-slate-900">{item.aspek}</div>
                      <div className="text-[10px] text-slate-500 italic mt-0.5">{desc}</div>
                    </td>
                    <td className="p-2 text-center border-r border-slate-200 font-medium">
                      {score === 5 && 'Pakar'}
                      {score === 4 && 'Lanjutan'}
                      {score === 3 && 'Pertengahan'}
                      {score === 2 && 'Asas'}
                      {score === 1 && 'Kesedaran'}
                      {score === 0 && '-'}
                    </td>
                    <td className="p-2 text-center font-bold text-slate-900 bg-slate-50">{score}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-bold border-t border-slate-300">
                <td colSpan={3} className="p-2 text-right border-r border-slate-300">
                  Jumlah Skor Komponen Guru (Perancangan: {record.skorPerancangan}/20, Pelaksanaan: {record.skorPelaksanaan}/25, Refleksi: {record.skorRefleksi}/5):
                </td>
                <td className="p-2 text-center text-sm font-extrabold text-indigo-900">
                  {record.skorGuru} / 50
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bahagian F: Rubrik Penilaian Murid */}
        <div className="mb-6 break-inside-avoid">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian F – Rubrik Penilaian Murid (Murid Sebagai Pembelajar Aktif)
          </div>
          <table className="w-full text-[11px] mt-2 border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="p-2 text-left w-10 border-r border-slate-300">Bil</th>
                <th className="p-2 text-left border-r border-slate-300">Item Murid</th>
                <th className="p-2 text-center w-28 border-r border-slate-300">Julat Murid</th>
                <th className="p-2 text-center w-16">Skor (1-5)</th>
              </tr>
            </thead>
            <tbody>
              {ITEM_MURID_DESCRIPTIONS.map((desc, idx) => {
                const s = record.skorMurid?.[idx] || 0;
                const ranges = ['-', '1%-20%', '21%-40%', '41%-60%', '61%-80%', '81%-100%'];
                return (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-1.5 text-center font-bold border-r border-slate-200">{idx + 1}</td>
                    <td className="p-1.5 border-r border-slate-200">{desc.replace(/^\d+\.\s*/, '')}</td>
                    <td className="p-1.5 text-center border-r border-slate-200 text-[10px] text-slate-600">
                      {ranges[s] || '-'}
                    </td>
                    <td className="p-1.5 text-center font-bold bg-slate-50">{s}</td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100 font-bold border-t border-slate-300">
                <td colSpan={3} className="p-2 text-right border-r border-slate-300">
                  Jumlah Skor Komponen Murid Sebagai Pembelajar Aktif:
                </td>
                <td className="p-2 text-center text-sm font-extrabold text-indigo-900">
                  {record.skorMuridTotal} / 50
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bahagian G: Pengiraan Skor dan Pencapaian */}
        <div className="mb-6 break-inside-avoid">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian G – Pengiraan Skor dan Pencapaian
          </div>
          <table className="w-full text-xs mt-2 border border-slate-300">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-semibold">
                <th className="p-2 text-left border-r border-slate-300">Komponen</th>
                <th className="p-2 text-left border-r border-slate-300">Domain</th>
                <th className="p-2 text-center border-r border-slate-300">Skor Diperoleh</th>
                <th className="p-2 text-center">Skor Maksimum</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td rowSpan={3} className="p-2 font-semibold bg-slate-50 border-r border-slate-300 align-top">
                  Guru
                </td>
                <td className="p-2 border-r border-slate-300">1. Perancangan</td>
                <td className="p-2 text-center font-bold border-r border-slate-300">{record.skorPerancangan}</td>
                <td className="p-2 text-center">20</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300">2. Pelaksanaan</td>
                <td className="p-2 text-center font-bold border-r border-slate-300">{record.skorPelaksanaan}</td>
                <td className="p-2 text-center">25</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-300">3. Refleksi</td>
                <td className="p-2 text-center font-bold border-r border-slate-300">{record.skorRefleksi}</td>
                <td className="p-2 text-center">5</td>
              </tr>
              <tr className="border-b border-slate-300 bg-slate-50">
                <td className="p-2 font-semibold border-r border-slate-300">Murid</td>
                <td className="p-2 border-r border-slate-300">Murid Sebagai Pembelajar Aktif</td>
                <td className="p-2 text-center font-bold border-r border-slate-300">{record.skorMuridTotal}</td>
                <td className="p-2 text-center">50</td>
              </tr>
              <tr className="bg-indigo-50 font-bold border-t-2 border-slate-400">
                <td colSpan={2} className="p-2 text-right border-r border-slate-300">
                  JUMLAH SKOR KESELURUHAN:
                </td>
                <td className="p-2 text-center text-base font-extrabold text-indigo-900 border-r border-slate-300">
                  {record.skorKeseluruhan}
                </td>
                <td className="p-2 text-center font-bold">100</td>
              </tr>
              <tr className="bg-indigo-100 font-extrabold border-t border-slate-300">
                <td colSpan={2} className="p-2 text-right border-r border-slate-300">
                  PERATUS PENCAPAIAN (%):
                </td>
                <td colSpan={2} className="p-2 text-center text-lg text-indigo-950">
                  {record.peratusPencapaian}%
                </td>
              </tr>
            </tbody>
          </table>

          {/* Rujukan Tahap Pencapaian Table */}
          <div className="mt-4">
            <div className="text-xs font-bold text-slate-700 uppercase mb-1">Rujukan Tahap Pencapaian KBAT:</div>
            <table className="w-full text-[11px] border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-600">
                  <th className="p-1.5 text-center w-20 border-r border-slate-300">Skor (%)</th>
                  <th className="p-1.5 text-left border-r border-slate-300">Tahap & Penerangan Standard Pembudayaan KBAT</th>
                  <th className="p-1.5 text-center w-16">Pilihan</th>
                </tr>
              </thead>
              <tbody>
                {TAHAP_PENCAPAIAN_INFO.map((item) => {
                  const isCurrent = record.tahapPencapaian === item.tahap;
                  return (
                    <tr
                      key={item.tahap}
                      className={`border-b border-slate-200 ${isCurrent ? 'bg-indigo-50/70 font-semibold' : ''}`}
                    >
                      <td className="p-1.5 text-center border-r border-slate-300">{item.range}</td>
                      <td className="p-1.5 border-r border-slate-300">
                        <strong className="text-slate-900">{item.tahap}</strong>: {item.keterangan}
                      </td>
                      <td className="p-1.5 text-center">
                        <span
                          className={`inline-block w-4 h-4 rounded-full border ${
                            isCurrent
                              ? 'bg-indigo-600 border-indigo-700 text-white flex items-center justify-center text-[10px] mx-auto'
                              : 'border-slate-400 bg-white'
                          }`}
                        >
                          {isCurrent && '✓'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bahagian H: Refleksi Temu Bual Guru */}
        <div className="mb-6 break-inside-avoid">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian H – Refleksi (Diisi oleh pencerap semasa menemu bual guru sekolah)
          </div>
          <div className="p-4 border border-slate-300 mt-2 space-y-4 text-xs">
            <div>
              <p className="font-semibold text-slate-800 mb-1">
                1. Apa pandangan anda mengenai pengajaran dan pembelajaran (PdP) KBAT yang telah anda laksanakan tadi?
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded min-h-[50px] italic text-slate-700">
                {record.refleksiPdP || 'Tiada catatan temubual dimasukkan.'}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">
                2. Bagaimana anda boleh membuat penambahbaikan/pemantapan terhadap PdP KBAT anda? (Nyatakan perancangan anda.)
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded min-h-[50px] italic text-slate-700">
                {record.perancanganPenambahbaikan || 'Tiada catatan dimasukkan.'}
              </div>
            </div>
          </div>
        </div>

        {/* Bahagian I: Rumusan Pencerap & Tandatangan */}
        <div className="mb-8 break-inside-avoid">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700">
            Bahagian I – Rumusan Keseluruhan Pencerap
          </div>
          <div className="p-4 border border-slate-300 mt-2 text-xs">
            <p className="font-semibold text-slate-800 mb-1">Rumusan Keseluruhan Pencerap:</p>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded min-h-[60px] italic text-slate-700 mb-6">
              {record.rumusanPencerap || 'Tiada rumusan dimasukkan.'}
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
              <div className="text-center">
                <div className="h-24 flex items-center justify-center border-b border-slate-400 mb-2">
                  {record.tandatanganPencerap ? (
                    <img
                      src={record.tandatanganPencerap}
                      alt="Tandatangan Pencerap"
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 text-xs italic">(Tandatangan Digital Pencerap)</span>
                  )}
                </div>
                <div className="font-bold text-xs uppercase text-slate-800">{record.namaPencerap || 'PENCERAP'}</div>
                <div className="text-[11px] text-slate-600">{record.jawatanPencerap || 'Jawatan'}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tarikh: {record.tarikhPencerapan}</div>
              </div>

              <div className="text-center">
                <div className="h-24 flex items-center justify-center border-b border-slate-400 mb-2">
                  {record.tandatanganGuru ? (
                    <img
                      src={record.tandatanganGuru}
                      alt="Tandatangan Guru"
                      className="max-h-20 object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 text-xs italic">(Tandatangan Guru Yang Dicerap)</span>
                  )}
                </div>
                <div className="font-bold text-xs uppercase text-slate-800">{record.namaGuru || 'GURU YANG DICERAP'}</div>
                <div className="text-[11px] text-slate-600">{record.opsyenGuru ? `Guru Opsyen ${record.opsyenGuru}` : 'Guru Mata Pelajaran'}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tarikh: {record.tarikhPencerapan}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lampiran Evidens 4 Keping Gambar PdP */}
        <div className="break-before-page pt-4">
          <div className="bg-slate-200 px-3 py-1.5 font-bold text-sm text-slate-800 uppercase tracking-wide border-l-4 border-indigo-700 mb-3">
            Lampiran – Evidens Bergambar Pelaksanaan PdP KBAT (4 Keping Gambar)
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Dokumentasi bergambar evidens pelaksanaan PdP bercirikan KBAT di kelas {record.tingkatan} bagi mata pelajaran {record.mataPelajaran}.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Slot 1 */}
            <div className="border border-slate-300 rounded p-2 text-xs bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">1. Set Induksi & Persediaan PdP</div>
              {record.gambar1 ? (
                <>
                  <div className="h-44 bg-slate-200 rounded overflow-hidden flex items-center justify-center mb-1.5">
                    <img src={record.gambar1.data} alt="Evidens 1" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-700 italic">
                    {record.gambar1.caption || 'Set Induksi yang menggalakkan KBAT murid.'}
                  </p>
                </>
              ) : (
                <div className="h-44 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 italic">
                  Tiada gambar dimuat naik
                </div>
              )}
            </div>

            {/* Slot 2 */}
            <div className="border border-slate-300 rounded p-2 text-xs bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">2. Aktiviti Pembelajaran Berpusatkan Murid</div>
              {record.gambar2 ? (
                <>
                  <div className="h-44 bg-slate-200 rounded overflow-hidden flex items-center justify-center mb-1.5">
                    <img src={record.gambar2.data} alt="Evidens 2" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-700 italic">
                    {record.gambar2.caption || 'Penglibatan aktif murid dalam aktiviti pembelajaran.'}
                  </p>
                </>
              ) : (
                <div className="h-44 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 italic">
                  Tiada gambar dimuat naik
                </div>
              )}
            </div>

            {/* Slot 3 */}
            <div className="border border-slate-300 rounded p-2 text-xs bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">3. Penggunaan Alat Berfikir / Hasil Kerja Murid</div>
              {record.gambar3 ? (
                <>
                  <div className="h-44 bg-slate-200 rounded overflow-hidden flex items-center justify-center mb-1.5">
                    <img src={record.gambar3.data} alt="Evidens 3" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-700 italic">
                    {record.gambar3.caption || 'Penggunaan Peta i-Think atau instrumen berfikir.'}
                  </p>
                </>
              ) : (
                <div className="h-44 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 italic">
                  Tiada gambar dimuat naik
                </div>
              )}
            </div>

            {/* Slot 4 */}
            <div className="border border-slate-300 rounded p-2 text-xs bg-slate-50">
              <div className="font-semibold text-slate-800 mb-1">4. Pentaksiran & Refleksi / Temu Bual</div>
              {record.gambar4 ? (
                <>
                  <div className="h-44 bg-slate-200 rounded overflow-hidden flex items-center justify-center mb-1.5">
                    <img src={record.gambar4.data} alt="Evidens 4" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[11px] text-slate-700 italic">
                    {record.gambar4.caption || 'Pentaksiran formatif dan perbincangan bimbingan.'}
                  </p>
                </>
              ) : (
                <div className="h-44 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 italic">
                  Tiada gambar dimuat naik
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Sistem e-Pencerapan ISPPK 2026 SMK Banggi</span>
          <span>ID Rekod: {record.id}</span>
          <span>Tarikh Cetakan: {new Date().toLocaleDateString('ms-MY')}</span>
        </div>

      </div>
    </div>
  );
};
