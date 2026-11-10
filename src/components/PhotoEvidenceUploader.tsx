import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Maximize2, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { PhotoEvidence } from '../types/isppk';
import { compressImageFile } from '../services/api';

interface PhotoEvidenceUploaderProps {
  photos: {
    gambar1?: PhotoEvidence;
    gambar2?: PhotoEvidence;
    gambar3?: PhotoEvidence;
    gambar4?: PhotoEvidence;
  };
  onChange: (key: 'gambar1' | 'gambar2' | 'gambar3' | 'gambar4', photo: PhotoEvidence | undefined) => void;
  readOnly?: boolean;
}

const SLOTS_METADATA: {
  key: 'gambar1' | 'gambar2' | 'gambar3' | 'gambar4';
  title: string;
  desc: string;
  placeholder: string;
}[] = [
  {
    key: 'gambar1',
    title: 'Gambar 1: Set Induksi & Persediaan Kelas',
    desc: 'Papan kenyataan objektif PdP, BBM induksi, atau suasana awal PdP',
    placeholder: 'Cth: Guru memaparkan rangsangan video/gambar bagi mencetuskan pemikiran KBAT murid.',
  },
  {
    key: 'gambar2',
    title: 'Gambar 2: PdP Berpusatkan Murid & KBAT',
    desc: 'Penglibatan aktif murid dalam aktiviti berkumpulan, stesen, atau pembentangan',
    placeholder: 'Cth: Murid bekerjasama secara kolaboratif dalam kumpulan menyusun hujah.',
  },
  {
    key: 'gambar3',
    title: 'Gambar 3: Alat Berfikir & Evidens Kerja Murid',
    desc: 'Peta i-Think, 6 Thinking Hats, model, atau lembaran kerja KBAT murid',
    placeholder: 'Cth: Hasil kerja murid menggunakan Peta Buih Berganda membanding beza konsep.',
  },
  {
    key: 'gambar4',
    title: 'Gambar 4: Pentaksiran & Refleksi / Temu Bual',
    desc: 'Pentaksiran formatif guru, maklum balas lisan, atau sesi perbincangan bimbingan',
    placeholder: 'Cth: Guru melaksanakan pentaksiran kendiri/rakan sebaya dan sesi refleksi bersama murid.',
  },
];

export const PhotoEvidenceUploader: React.FC<PhotoEvidenceUploaderProps> = ({
  photos,
  onChange,
  readOnly = false,
}) => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [zoomModalUrl, setZoomModalUrl] = useState<string | null>(null);
  const [zoomModalTitle, setZoomModalTitle] = useState<string>('');

  const fileInputRefs = {
    gambar1: useRef<HTMLInputElement | null>(null),
    gambar2: useRef<HTMLInputElement | null>(null),
    gambar3: useRef<HTMLInputElement | null>(null),
    gambar4: useRef<HTMLInputElement | null>(null),
  };

  const cameraInputRefs = {
    gambar1: useRef<HTMLInputElement | null>(null),
    gambar2: useRef<HTMLInputElement | null>(null),
    gambar3: useRef<HTMLInputElement | null>(null),
    gambar4: useRef<HTMLInputElement | null>(null),
  };

  const handleFileSelect = async (
    slotKey: 'gambar1' | 'gambar2' | 'gambar3' | 'gambar4',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoadingKey(slotKey);
      const compressedData = await compressImageFile(file);
      const existing = photos[slotKey];
      onChange(slotKey, {
        data: compressedData,
        caption: existing?.caption || '',
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      alert('Ralat memuatkan gambar. Sila cuba lagi.');
      console.error(err);
    } finally {
      setLoadingKey(null);
      e.target.value = '';
    }
  };

  const handleCaptionChange = (slotKey: 'gambar1' | 'gambar2' | 'gambar3' | 'gambar4', caption: string) => {
    const existing = photos[slotKey];
    if (!existing) return;
    onChange(slotKey, {
      ...existing,
      caption,
    });
  };

  const handleDelete = (slotKey: 'gambar1' | 'gambar2' | 'gambar3' | 'gambar4') => {
    onChange(slotKey, undefined);
  };

  const countUploaded = Object.values(photos).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800">
              Evidens Bergambar PdP (4 Keping Gambar)
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                countUploaded === 4
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {countUploaded} / 4 Dimuat Naik
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Muat naik atau ambil gambar langsung semasa pencerapan untuk disimpan secara automatik dalam pangkalan data sekolah SMK Banggi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SLOTS_METADATA.map((slot) => {
          const photo = photos[slot.key];
          const isLoading = loadingKey === slot.key;

          return (
            <div
              key={slot.key}
              className={`rounded-xl border p-4 transition-all ${
                photo
                  ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    {photo ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        {slot.key.slice(-1)}
                      </span>
                    )}
                    {slot.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{slot.desc}</p>
                </div>
              </div>

              {photo ? (
                <div className="space-y-3 mt-3">
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                    <img
                      src={photo.data}
                      alt={slot.title}
                      className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                      onClick={() => {
                        setZoomModalUrl(photo.data);
                        setZoomModalTitle(slot.title);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setZoomModalUrl(photo.data);
                          setZoomModalTitle(slot.title);
                        }}
                        className="p-2 rounded-full bg-white/90 text-slate-800 hover:bg-white shadow"
                        title="Besarkan gambar"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleDelete(slot.key)}
                          className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow"
                          title="Padam gambar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {photo.timestamp && (
                      <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded">
                        Masa: {photo.timestamp}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Keterangan Ringkas Evidens:
                    </label>
                    <input
                      type="text"
                      disabled={readOnly}
                      value={photo.caption || ''}
                      onChange={(e) => handleCaptionChange(slot.key, e.target.value)}
                      placeholder={slot.placeholder}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 flex flex-col items-center justify-center text-center bg-white/60">
                    <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-medium text-slate-700 mb-1">
                      {isLoading ? 'Sedang memproses gambar...' : 'Tiada gambar dimuat naik'}
                    </span>
                    <span className="text-[11px] text-slate-400 mb-3 max-w-xs">
                      Ambil foto bilik darjah secara langsung atau pilih fail daripada peranti.
                    </span>

                    {!readOnly && (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {/* Native Camera Capture Button */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => cameraInputRefs[slot.key].current?.click()}
                          className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-white hover:bg-slate-900 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Ambil Foto
                        </button>

                        {/* File Upload Button */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => fileInputRefs[slot.key].current?.click()}
                          className="px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          Pilih Fail
                        </button>
                      </div>
                    )}

                    {/* Hidden inputs */}
                    <input
                      ref={fileInputRefs[slot.key]}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(slot.key, e)}
                    />
                    <input
                      ref={cameraInputRefs[slot.key]}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileSelect(slot.key, e)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Photo Zoom Modal */}
      {zoomModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setZoomModalUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 text-white border-b border-slate-700">
              <span className="text-sm font-medium">{zoomModalTitle}</span>
              <button
                type="button"
                onClick={() => setZoomModalUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center">
              <img
                src={zoomModalUrl}
                alt="Evidens PdP"
                className="max-h-[75vh] max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
