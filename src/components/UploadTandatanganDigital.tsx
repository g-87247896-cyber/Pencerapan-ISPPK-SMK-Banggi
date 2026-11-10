import React, { useState, useRef } from 'react';
import { PentadbirUser } from '../types/auth';
import { compressImageFile } from '../services/api';
import {
  Upload,
  PenTool,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Check,
  ShieldCheck,
  Sparkles,
  Camera,
  Download,
  AlertCircle,
  FileImage,
} from 'lucide-react';

interface UploadTandatanganDigitalProps {
  currentUser: PentadbirUser;
  onUpdateSignature: (signatureUrl: string) => void;
  onClose?: () => void;
}

export const UploadTandatanganDigital: React.FC<UploadTandatanganDigitalProps> = ({
  currentUser,
  onUpdateSignature,
  onClose,
}) => {
  const [mode, setMode] = useState<'upload' | 'draw'>('upload');
  const [signaturePreview, setSignaturePreview] = useState<string>(currentUser.tandatanganDigital || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // File Upload Handler (with background thresholding to enhance pen on white paper)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Sila muat naik fail imej sahaja (PNG, JPG, JPEG, WebP)');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');

      // Read image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setSignaturePreview(event.target?.result as string);
            setIsProcessing(false);
            return;
          }

          // Target dimensions for signature stamp
          const MAX_W = 600;
          const MAX_H = 300;
          let w = img.width;
          let h = img.height;

          if (w > MAX_W) {
            h = Math.round((h * MAX_W) / w);
            w = MAX_W;
          }
          if (h > MAX_H) {
            w = Math.round((w * MAX_H) / h);
            h = MAX_H;
          }

          canvas.width = w;
          canvas.height = h;

          // Draw image
          ctx.drawImage(img, 0, 0, w, h);

          // Get image pixel data to enhance signature line contrast
          try {
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;

            // If background is bright paper, make near-white pixels transparent for a clean PNG stamp!
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];

              // Luminance calculation
              const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

              // If brightness is high (paper background > 200), make transparent
              if (brightness > 210) {
                data[i + 3] = 0; // Transparent
              } else {
                // Enhance ink contrast (darken to dark navy/black)
                data[i] = Math.max(0, r - 30);
                data[i + 1] = Math.max(0, g - 30);
                data[i + 2] = Math.max(0, b - 20);
                // Ensure full opacity for ink lines
                data[i + 3] = Math.min(255, data[i + 3] * 1.5);
              }
            }

            ctx.putImageData(imgData, 0, 0);
          } catch {
            // Fallback to normal draw if cross-origin image data restricted
          }

          const cleanedDataUrl = canvas.toDataURL('image/png');
          setSignaturePreview(cleanedDataUrl);
          setIsProcessing(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setErrorMsg('Ralat memproses fail imej');
      setIsProcessing(false);
    }
  };

  // Canvas Drawing Handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Navy dark
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignaturePreview(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignaturePreview('');
  };

  const handleSaveSignature = () => {
    if (!signaturePreview) {
      setErrorMsg('Sila muat naik atau lukis tandatangan terlebih dahulu');
      return;
    }
    onUpdateSignature(signaturePreview);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onClose) onClose();
    }, 1500);
  };

  const handleRemoveSignature = () => {
    if (confirm('Padamkan tandatangan digital profil ini?')) {
      setSignaturePreview('');
      onUpdateSignature('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      clearCanvas();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Pengesahan Rasmi Pentadbir • SMK Banggi
          </span>
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Pengurusan Tandatangan Digital (TT Digital) Pentadbir
        </h3>
        <p className="text-xs text-slate-300 mt-0.5">
          Muat naik foto tandatangan bertulis anda atau lukis terus untuk auto-isi dalam semua borang pencerapan rasmi ISPPK 2026.
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* User Card */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-0.5 border border-amber-300 shadow-2xs flex items-center justify-center flex-shrink-0">
              <img
                src="/assets/aistudio/Logo_SMK_Banggi_c52e1e56.png"
                alt="Lencana SMK Banggi"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{currentUser.nama}</div>
              <div className="text-xs text-indigo-700 font-medium">{currentUser.jawatan}</div>
              <div className="text-[11px] text-slate-500 font-mono">{currentUser.emel}</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Status TT Profil:
            </span>
            {currentUser.tandatanganDigital ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> TT Tersimpan & Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 mt-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Belum Dimuat Naik
              </span>
            )}
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pilih Kaedah Masukan Tandatangan:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                mode === 'upload'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              1. Muat Naik Fail Imej (Upload TT)
            </button>

            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                mode === 'draw'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <PenTool className="w-4 h-4 text-indigo-600" />
              2. Lukis Atas Skrin (Touch / Pen)
            </button>
          </div>
        </div>

        {/* Mode 1: File Upload */}
        {mode === 'upload' && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all"
            >
              <FileImage className="w-10 h-10 text-indigo-500 mb-2" />
              <div className="text-xs font-bold text-slate-800 mb-1">
                {isProcessing ? 'Sedang memproses & menjernihkan latar belakang...' : 'Klik untuk Memilih Fail Tandatangan Digital'}
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm mb-3">
                Ambil gambar tandatangan anda di atas kertas putih bersih atau muat naik fail imej PNG/JPG. Sistem akan memproses garisan dakwat secara automatik.
              </p>
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Pilih Fail Imej
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <p className="text-[11px] text-slate-500 italic">
              💡 <strong>Petua Pentadbir:</strong> Untuk hasil terbaik, turunkan tandatangan dengan pen mata bulat hitam/biru di atas kertas putih, ambil foto dengan pencahayaan terang, dan muat naik di sini.
            </p>
          </div>
        )}

        {/* Mode 2: Draw on Screen */}
        {mode === 'draw' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5 text-slate-500" />
                Turunkan tandatangan anda dalam kotak di bawah (gunakan jari / stylus / tetikus):
              </span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50"
              >
                <RotateCcw className="w-3 h-3" /> Padam Semula
              </button>
            </div>

            <div className="border border-dashed border-slate-300 bg-white rounded-xl overflow-hidden relative touch-none">
              <canvas
                ref={canvasRef}
                width={500}
                height={160}
                className="w-full h-36 cursor-crosshair block bg-slate-50/30"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
          </div>
        )}

        {/* Signature Preview Stamp Certificate */}
        {signaturePreview && (
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Pratonton Tandatangan Digital Profil:
              </span>
              <button
                type="button"
                onClick={handleRemoveSignature}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Padam
              </button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center min-h-[120px] shadow-xs">
              <img
                src={signaturePreview}
                alt="Tandatangan Pentadbir"
                className="max-h-24 max-w-full object-contain"
              />
              <div className="w-48 border-t border-slate-300 mt-2 pt-1 text-center">
                <div className="text-[11px] font-bold text-slate-800 uppercase">{currentUser.nama}</div>
                <div className="text-[10px] text-slate-500">{currentUser.jawatan}</div>
                <div className="text-[9px] text-slate-400 font-semibold uppercase">SMK BANGGI, KUDAT</div>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Tandatangan digital pentadbir berjaya disimpan ke profil sekolah!</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            Tandatangan ini akan digunakan secara automatik semasa pengisian borang pencerapan.
          </span>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
              >
                Tutup
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveSignature}
              disabled={!signaturePreview || isProcessing}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              Simpan Tandatangan Digital
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
