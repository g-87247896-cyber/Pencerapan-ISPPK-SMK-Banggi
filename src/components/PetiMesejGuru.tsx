import React, { useState, useEffect } from 'react';
import { TeacherMessage, TAHAP_PENCAPAIAN_INFO } from '../types/isppk';
import { apiService } from '../services/api';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Trash2,
  Send,
  Eye,
  Mail,
  User,
  Calendar,
  BookOpen,
  Award,
  Sparkles,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface PetiMesejGuruProps {
  onViewObservation?: (recordId: string) => void;
}

export const PetiMesejGuru: React.FC<PetiMesejGuruProps> = ({ onViewObservation }) => {
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<TeacherMessage | null>(null);
  const [teacherReplyText, setTeacherReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await apiService.getTeacherMessages({
        guru: searchQuery,
        unreadOnly: filterUnread,
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filterUnread]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleOpenMessage = async (msg: TeacherMessage) => {
    setSelectedMessage(msg);
    setTeacherReplyText(msg.maklumBalasGuru || '');

    // If unread, mark as read
    if (!msg.statusBaca) {
      await apiService.markMessageAsRead(msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, statusBaca: true, tarikhDibaca: new Date().toISOString() } : m))
      );
    }
  };

  const handleSaveTeacherReply = async () => {
    if (!selectedMessage) return;
    setIsSubmittingReply(true);
    try {
      await apiService.markMessageAsRead(selectedMessage.id, teacherReplyText);
      setSelectedMessage((prev) => (prev ? { ...prev, maklumBalasGuru: teacherReplyText } : null));
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, maklumBalasGuru: teacherReplyText } : m))
      );
      alert('Perakuan dan maklum balas guru berjaya direkodkan dalam sistem!');
    } catch {
      alert('Gagal merekodkan maklum balas');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteMessage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Padam mesej dapatan pencerapan ini?')) {
      await apiService.deleteTeacherMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.statusBaca).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200">
                Peti Mesej & Maklum Balas Guru
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                  {unreadCount} Belum Dibaca
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Peti Mesej Dapatan Pencerapan Guru (In-App Messaging)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Saluran perkongsian maklum balas, bimbingan, dan perakuan penerimaan dapatan pencerapan guru SMK Banggi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMessages}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Segarkan peti mesej"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-100">
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <input
              type="text"
              placeholder="Cari guru atau mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterUnread(!filterUnread)}
              className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                filterUnread
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {filterUnread ? 'Menunjukkan Belum Dibaca' : 'Semua Mesej'}
            </button>
          </div>
        </div>
      </div>

      {/* Main List & Reader Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List Column */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Memuatkan mesej guru...
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Tiada mesej dapatan pencerapan ditemui.
            </div>
          ) : (
            messages.map((m) => {
              const isSelected = selectedMessage?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => handleOpenMessage(m)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                      : m.statusBaca
                      ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      : 'border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/50 font-semibold'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          m.statusBaca ? 'bg-slate-300' : 'bg-rose-500 animate-pulse'
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">{m.namaGuru}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                      {m.peratusPencapaian}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1 mb-2 font-medium">
                    {m.tajukMesej}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>{new Date(m.tarikhDihantar).toLocaleDateString('ms-MY')}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteMessage(m.id, e)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                      title="Padam mesej"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Viewer & Teacher Feedback Box */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Slip Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold">
                    ID: {selectedMessage.pencerapanId}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dihantar pada {new Date(selectedMessage.tarikhDihantar).toLocaleString('ms-MY')}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{selectedMessage.tajukMesej}</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Guru Yang Dicerap:</span>
                    <strong className="text-slate-800">{selectedMessage.namaGuru}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Mata Pelajaran & Kelas:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedMessage.mataPelajaran} ({selectedMessage.tingkatan})
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Pencerap:</span>
                    <span className="text-slate-800 font-medium">{selectedMessage.namaPencerap}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Skor & Tahap KBAT:</span>
                    <strong className="text-indigo-700 font-mono text-sm">
                      {selectedMessage.peratusPencapaian}% ({selectedMessage.tahapPencapaian})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Message Body Content */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                {selectedMessage.kandunganMesej}
              </div>

              {/* Strengths & Improvements Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-xs">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> Kekuatan Utama PdP:
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {selectedMessage.kekuatan.map((k, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 text-xs">
                  <span className="font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                    <Award className="w-4 h-4 text-amber-600" /> Cadangan Bimbingan & Intervensi:
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {selectedMessage.cadanganPenambahbaikan.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-amber-600 font-bold">→</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Teacher Reply / Acknowledgment Box */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Perakuan & Maklum Balas Guru Yang Dicerap:
                  </label>
                </div>

                <textarea
                  rows={3}
                  value={teacherReplyText}
                  onChange={(e) => setTeacherReplyText(e.target.value)}
                  placeholder="Cth: Saya telah membaca dan menerima dapatan pencerapan ini. Saya akan mengambil tindakan susulan memperkukuh penggunaan alat berfikir i-Think..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {selectedMessage.tarikhDibaca
                      ? `Disahkan dibaca pada: ${new Date(selectedMessage.tarikhDibaca).toLocaleString('ms-MY')}`
                      : 'Belum diperakui'}
                  </span>

                  <div className="flex items-center gap-2">
                    {onViewObservation && (
                      <button
                        type="button"
                        onClick={() => onViewObservation(selectedMessage.pencerapanId)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Borang Penuh
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveTeacherReply}
                      disabled={isSubmittingReply}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isSubmittingReply ? 'Menyimpan...' : 'Hantar Perakuan Guru'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">Pilih Mesej Untuk Dibaca</h4>
              <p className="max-w-xs mx-auto text-slate-400 mt-1">
                Pilih mana-mana dapatan pencerapan guru di sebelah kiri untuk melihat rumusan skor, kekuatan, dan bimbingan penambahbaikan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
