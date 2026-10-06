import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const DISMISSED_SESSION_KEY = 'PWA_INSTALL_DISMISSED';

export const PWAInstallModal: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If already running in standalone mode (already installed), do not show
    if (isInstalled) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed in current session
    const isDismissed = sessionStorage.getItem(DISMISSED_SESSION_KEY);
    if (isDismissed) {
      return;
    }

    // Auto open popup when opening link
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 800); // 800ms delay after opening link
    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setIsOpen(false);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true');
  };

  if (!isOpen || isInstalled) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 relative overflow-hidden">
        
        {/* Top Accent Background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30">
              <Smartphone className="w-8 h-8" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" /> Rekomendasi
            </span>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Install Rekap Belanja CV
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pasang di layar utama HP untuk akses cepat tanpa perlu ketik URL lagi!
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Akses cepat 1-klik dari Layar Utama HP</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Input belanja & foto nota lebih praktis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Hemat kuota & bisa dibuka saat sinyal lemah</span>
          </div>
        </div>

        {/* Dynamic Action Buttons for Android / Chromium vs iOS */}
        {isInstallable ? (
          <div className="space-y-2">
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-3 text-sm font-bold shadow-lg shadow-blue-600/25 transition"
            >
              <Download className="w-4 h-4" />
              <span>INSTALL SEKARANG</span>
            </button>
            <button
              onClick={handleClose}
              className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
            >
              Lain Kali
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <p className="font-bold text-slate-800">Petunjuk Install di iPhone / iPad (Safari):</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>Ketuk tombol <strong className="text-slate-900">Share / Bagikan</strong> di bilah bawah Safari.</li>
              <li>Pilih <strong className="text-slate-900">Tambah ke Layar Utama (Add to Home Screen)</strong>.</li>
            </ol>
            <button
              onClick={handleClose}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Mengerti
            </button>
          </div>
        ) : (
          <button
            onClick={handleClose}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Tutup
          </button>
        )}

      </div>
    </div>
  );
};
