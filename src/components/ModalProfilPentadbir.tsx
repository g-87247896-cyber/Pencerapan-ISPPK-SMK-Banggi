import React from 'react';
import { PentadbirUser } from '../types/auth';
import { UploadTandatanganDigital } from './UploadTandatanganDigital';
import { X, LogOut, UserCheck } from 'lucide-react';

interface ModalProfilPentadbirProps {
  currentUser: PentadbirUser;
  onUpdateSignature: (signatureUrl: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const ModalProfilPentadbir: React.FC<ModalProfilPentadbirProps> = ({
  currentUser,
  onUpdateSignature,
  onLogout,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl my-8">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <UploadTandatanganDigital
            currentUser={currentUser}
            onUpdateSignature={onUpdateSignature}
            onClose={onClose}
          />

          <div className="mt-3 flex items-center justify-between px-2 text-xs text-slate-300">
            <span className="text-slate-400">
              Sistem Pengurusan Skor Pencerapan ISPPK 2027 • SMK Banggi
            </span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-rose-300 hover:text-rose-100 font-semibold bg-rose-950/40 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-800/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Tukar Akaun Pentadbir / Log Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
