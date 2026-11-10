import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface DigitalSignaturePadProps {
  label: string;
  initialSignature?: string;
  onSave: (dataUrl: string) => void;
  readOnly?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  label,
  initialSignature,
  onSave,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedData, setSavedData] = useState<string | undefined>(initialSignature);

  useEffect(() => {
    setSavedData(initialSignature);
    if (initialSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasDrawn(true);
        };
        img.src = initialSignature;
      }
    }
  }, [initialSignature]);

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
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Navy dark
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
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
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setSavedData(dataUrl);
      onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSavedData(undefined);
    onSave('');
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-slate-500" />
          {label}
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 hover:border-rose-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Padam
          </button>
        )}
      </div>

      <div className="border border-dashed border-slate-300 bg-white rounded-lg overflow-hidden relative touch-none">
        <canvas
          ref={canvasRef}
          width={360}
          height={140}
          className="w-full h-28 cursor-crosshair block"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && !savedData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
            {readOnly ? 'Tiada tandatangan direkodkan' : 'Sila turunkan tandatangan di sini'}
          </div>
        )}
      </div>
      {savedData && (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
          <Check className="w-3 h-3" /> Tandatangan disimpan
        </div>
      )}
    </div>
  );
};
