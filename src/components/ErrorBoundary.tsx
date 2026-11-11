import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in e-Pencerapan ISPPK:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-lg w-full text-center shadow-xl space-y-4">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Sistem Mengalami Masalah Teknikal</h2>
              <p className="text-xs text-slate-500 mt-1">
                Aplikasi e-Pencerapan ISPPK 2026 SMK Banggi menghadapi ralat semasa memuatkan komponen UI.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-mono text-[11px] text-rose-700 overflow-x-auto max-h-32">
                {this.state.error.message || 'Ralat tidak diketahui'}
              </div>
            )}

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Muat Semula Halaman (Reload)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
