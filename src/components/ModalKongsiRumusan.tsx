import React, { useState } from 'react';
import { PencerapanRecord, TeacherMessage, TAHAP_PENCAPAIAN_INFO } from '../types/isppk';
import { apiService } from '../services/api';
import {
  Send,
  Mail,
  Copy,
  Check,
  Share2,
  X,
  Sparkles,
  Award,
  MessageSquare,
  Printer,
  CheckCircle2,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';

interface ModalKongsiRumusanProps {
  record: PencerapanRecord;
  onClose: () => void;
  onMessageSent?: (msg: TeacherMessage) => void;
}

export const ModalKongsiRumusan: React.FC<ModalKongsiRumusanProps> = ({
  record,
  onClose,
  onMessageSent,
}) => {
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'email' | 'inapp'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Email input (defaults to teacher's moe-dl format if available or placeholder)
  const defaultTeacherEmail = `g-${record.namaGuru.toLowerCase().replace(/[^a-z0-9]/g, '')}@moe-dl.edu.my`;
  const [teacherEmail, setTeacherEmail] = useState(defaultTeacherEmail);

  // Derive strengths and development areas from record scores
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (record.skor2_1 >= 4) strengths.push('Persekitaran PdP yang kondusif, berdisiplin dan suasana pembelajaran yang menyeronokkan.');
  if (record.skor1_1 >= 4) strengths.push('Objektif PdP dirancang dengan jelas, eksplisit dan bercirikan KBAT.');
  if (record.skor2_2 >= 4) strengths.push('Penglibatan aktif murid secara berpusatkan murid dengan tugasan kolaboratif yang bermakna.');
  if (record.skor2_4 >= 4) strengths.push('Penggunaan alat berfikir (Peta i-Think / Thinking Hats) yang menyokong pemikiran kritis murid.');
  if (record.skor3_1 >= 4) strengths.push('Amalan refleksi kendiri guru yang mantap dengan kesedaran tindakan susulan.');
  if (strengths.length === 0) strengths.push('Pengurusan bilik darjah teratur dan penyampaian isi pelajaran mengikut sukatan kurikulum.');

  if (record.skor2_4 <= 3) improvements.push('Tingkatkan penggunaan alat berfikir (8 Peta Pemikiran i-Think) dalam lembaran kerja atau aktiviti murid.');
  if (record.skor2_3 <= 3) improvements.push('Perbanyakkan teknik penyoalan mencapah (divergent questioning) bagi merangsang pemikiran aras menganalisis dan menilai.');
  if (record.skor1_4 <= 3 || record.skor2_5 <= 3) improvements.push('Perkukuhkan kaedah pentaksiran formatif dan semakan hasil kerja murid secara berkala semasa PdP.');
  if (record.skor3_1 <= 3) improvements.push('Tulis refleksi PdP yang lebih berfokus kepada impak kefahaman murid dan rancangan intervensi.');
  if (improvements.length === 0) improvements.push('Teruskan mengekalkan amalan terbaik KBAT dan kongsikan strategi PdP bersama rakan panitia.');

  // Formulate default message
  const defaultSubject = `[SMK BANGGI] Rumusan Dapatan Pencerapan PdP KBAT 2027 - ${record.namaGuru}`;

  const defaultKandungan = `Salam sejahtera Cikgu ${record.namaGuru},

Tahniah diucapkan atas sesi pengajaran dan pembelajaran (PdP) yang telah dilaksanakan bagi kelas ${record.tingkatan} (${record.mataPelajaran}) pada ${record.tarikhPencerapan}. 

Berikut adalah ringkasan skor dan dapatan pencerapan berdasarkan Instrumen Standard Penilaian Pembudayaan KBAT (ISPPK) 2027:

📊 KEPUTUSAN KESELURUHAN:
• Skor Keseluruhan: ${record.skorKeseluruhan} / 100 (${record.peratusPencapaian}%)
• Tahap Pembudayaan KBAT: ${record.tahapPencapaian}

📈 PECAHAN SKOR MENGIKUT DOMAIN:
1. Perancangan PdP Guru: ${record.skorPerancangan} / 20 (${Math.round((record.skorPerancangan / 20) * 100)}%)
2. Pelaksanaan PdP Guru: ${record.skorPelaksanaan} / 25 (${Math.round((record.skorPelaksanaan / 25) * 100)}%)
3. Refleksi PdP Guru: ${record.skorRefleksi} / 5 (${Math.round((record.skorRefleksi / 5) * 100)}%)
4. Murid Sebagai Pembelajar Aktif: ${record.skorMuridTotal} / 50 (${Math.round((record.skorMuridTotal / 50) * 100)}%)

🌟 ASPEK KEKUATAN PdP:
${strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

💡 CADANGAN PENAMBAHBAIKAN / TINDAKAN SUSULAN:
${improvements.map((im, i) => `${i + 1}. ${im}`).join('\n')}

💬 RUMUSAN PENCERAP:
"${record.rumusanPencerap || 'Pengajaran dilaksanakan dengan baik dan teratur. Bimbingan berterusan akan membantu mempertingkatkan penguasaan KBAT murid.'}"

Terima kasih atas komitmen Cikgu dalam memperkasakan kualiti pendidikan anak-anak SMK Banggi.

Sekian, terima kasih.
Pencerap: ${record.namaPencerap || 'Pentadbir'} (${record.jawatanPencerap || 'SMK Banggi'})`;

  const [messageSubject, setMessageSubject] = useState(defaultSubject);
  const [messageBody, setMessageBody] = useState(defaultKandungan);

  // Formatted WhatsApp Text
  const whatsappFormattedText = `*🏫 SMK BANGGI, KUDAT*
*SLIP DAPATAN PENCERAPAN PdP KBAT 2027*
---------------------------------------
👤 *Nama Guru:* ${record.namaGuru}
📚 *Mata Pelajaran:* ${record.mataPelajaran} (${record.tingkatan})
📅 *Tarikh:* ${record.tarikhPencerapan} | ⏱️ *Masa:* ${record.masaPencerapan || record.masaPdP || '-'}
👨‍🏫 *Pencerap:* ${record.namaPencerap} (${record.jawatanPencerap})

🏆 *SKOR KESELURUHAN:* *${record.peratusPencapaian}%*
🎖️ *Tahap KBAT:* *${record.tahapPencapaian}*

*Pecahan Domain:*
• Perancangan Guru: ${record.skorPerancangan}/20
• Pelaksanaan Guru: ${record.skorPelaksanaan}/25
• Refleksi Guru: ${record.skorRefleksi}/5
• Penglibatan Murid Aktif: ${record.skorMuridTotal}/50

*🌟 Kekuatan PdP:*
${strengths.map((s, i) => `✓ ${s}`).join('\n')}

*💡 Cadangan Penambahbaikan:*
${improvements.map((im, i) => `→ ${im}`).join('\n')}

*💬 Rumusan Pencerap:*
_"${record.rumusanPencerap || 'Pengajaran dilaksanakan dengan memuaskan.'}"_

_Tahniah dan terima kasih atas komitmen mendidik murid SMK Banggi!_`;

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendInApp = async () => {
    setIsSending(true);
    try {
      const payload: Partial<TeacherMessage> = {
        pencerapanId: record.id,
        namaGuru: record.namaGuru,
        emelGuru: teacherEmail,
        namaPencerap: record.namaPencerap,
        jawatanPencerap: record.jawatanPencerap,
        tarikhPencerapan: record.tarikhPencerapan,
        mataPelajaran: record.mataPelajaran,
        tingkatan: record.tingkatan,
        tajukTopik: record.tajukTopik,
        skorKeseluruhan: record.skorKeseluruhan,
        peratusPencapaian: record.peratusPencapaian,
        tahapPencapaian: record.tahapPencapaian,
        domainScores: {
          perancangan: record.skorPerancangan,
          pelaksanaan: record.skorPelaksanaan,
          refleksi: record.skorRefleksi,
          murid: record.skorMuridTotal,
        },
        tajukMesej: messageSubject,
        kandunganMesej: messageBody,
        kekuatan: strengths,
        cadanganPenambahbaikan: improvements,
      };

      const res = await apiService.sendTeacherMessage(payload);
      if (res.success && res.data) {
        setSendSuccess(true);
        if (onMessageSent) onMessageSent(res.data);
        setTimeout(() => {
          setSendSuccess(false);
          onClose();
        }, 1800);
      } else {
        alert(res.message || 'Gagal menghantar mesej');
      }
    } catch {
      alert('Ralat menghantar mesej dalam aplikasi');
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenEmailClient = () => {
    const mailto = `mailto:${encodeURIComponent(teacherEmail)}?subject=${encodeURIComponent(
      messageSubject
    )}&body=${encodeURIComponent(messageBody)}`;
    window.location.href = mailto;
  };

  const handleOpenWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(whatsappFormattedText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-5 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                Maklum Balas Guru
              </span>
              <span className="text-xs text-slate-300">ID: {record.id}</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Kongsi Rumusan Ringkas Dapatan Pencerapan
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Hantar dapatan skor dan bimbingan terus kepada <strong>{record.namaGuru}</strong> melalui Mesej Aplikasi, E-mel, atau WhatsApp.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Score Ribbon Snapshot */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg font-mono shadow-xs">
                {record.peratusPencapaian}%
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{record.namaGuru}</div>
                <div className="text-xs text-slate-500">
                  {record.mataPelajaran} • {record.tingkatan} • {record.tarikhPencerapan}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Tahap KBAT:</span>
              <span className="text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {record.tahapPencapaian}
              </span>
            </div>
          </div>

          {/* Channel Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Saluran Perkongsian:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveChannel('inapp')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  activeChannel === 'inapp'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <MessageSquare className={`w-5 h-5 flex-shrink-0 mt-0.5 ${activeChannel === 'inapp' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">1. Mesej Dalam Aplikasi</strong>
                  <span className="text-[11px] text-slate-500">Masuk ke Peti Mesej guru di web</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('email')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  activeChannel === 'email'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Mail className={`w-5 h-5 flex-shrink-0 mt-0.5 ${activeChannel === 'email' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">2. E-mel Rasmi Guru</strong>
                  <span className="text-[11px] text-slate-500">Hantar melalui Gmail / DELIMa</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel('whatsapp')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  activeChannel === 'whatsapp'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Share2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${activeChannel === 'whatsapp' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <strong className="text-xs font-bold text-slate-900 block">3. Salin / WhatsApp</strong>
                  <span className="text-[11px] text-slate-500">Teks kemas untuk Telegram/WA</span>
                </div>
              </button>
            </div>
          </div>

          {/* Channel Form Fields */}
          {activeChannel === 'email' && (
            <div className="bg-indigo-50/40 border border-indigo-200 p-4 rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat E-mel Guru (DELIMa / Sekolah):
                </label>
                <input
                  type="email"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="Cth: g-12345678@moe-dl.edu.my"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {activeChannel !== 'whatsapp' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tajuk Mesej / Subjek:
                </label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Kandungan Rumusan & Bimbingan (Boleh Disunting):
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCopyText(messageBody)}
                    className="text-[11px] text-indigo-700 hover:text-indigo-900 flex items-center gap-1 font-medium"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Disalin!' : 'Salin Teks'}
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-sans leading-relaxed bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Pratonton Format Mesej WhatsApp / Telegram:
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyText(whatsappFormattedText)}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Teks Disalin!' : 'Salin Mesej WhatsApp'}
                </button>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap border border-slate-800">
                {whatsappFormattedText}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {sendSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Mesej berjaya dihantar ke Peti Mesej Guru!
              </span>
            ) : (
              <span>SMK Banggi • e-Pencerapan ISPPK 2027</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
            >
              Tutup
            </button>

            {activeChannel === 'inapp' && (
              <button
                type="button"
                onClick={handleSendInApp}
                disabled={isSending || sendSuccess}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? 'Menghantar...' : sendSuccess ? 'Telah Dihantar' : 'Hantar Mesej Dalam Aplikasi'}
              </button>
            )}

            {activeChannel === 'email' && (
              <button
                type="button"
                onClick={handleOpenEmailClient}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Buka E-mel Guru (Gmail)
              </button>
            )}

            {activeChannel === 'whatsapp' && (
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Buka & Kongsi di WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
