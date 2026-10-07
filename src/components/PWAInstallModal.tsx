import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const DISMISSED_SESSION_KEY = 'PWA_INSTALL_DISMISSED';

export const PWAInstallModal: React.FC<{ forceOpen?: boolean; onCloseModal?: () => void }> = ({
  forceOpen,
  onCloseModal,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

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
    }, 600); // 600ms delay after opening link
    return () => clearTimeout(timer);
  }, [isInstalled, forceOpen]);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setIsOpen(false);
        if (onCloseModal) onCloseModal();
      }
    } else {
      // Show explicit manual install instructions for Android Chrome / Desktop
      setShowManualGuide(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true');
    if (onCloseModal) onCloseModal();
  };

  if (!isOpen || (isInstalled && !forceOpen)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-5 relative overflow-hidden">
        
        {/* Top Accent Background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-slate-950 p-1 border-2 border-rose-500/50 shadow-xl shadow-rose-500/20 flex items-center justify-center overflow-hidden">
              <img
                src="/app-logo.png"
                alt="CV ARZLAN ADYATAMA Logo"
                className="h-full w-full object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md border-2 border-white">
              <Zap className="w-4 h-4 fill-white" />
            </span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-black uppercase tracking-wider mb-1.5 border border-rose-200">
              <Sparkles className="w-3 h-3 text-rose-600" /> Rekomendasi Utama
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              Install CV ARZLAN ADYATAMA
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pasang aplikasi di Layar Utama HP untuk akses instan 1-klik tanpa perlu buka browser lagi!
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">Ikon resmi CV ARZLAN ADYATAMA di layar HP</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">Bisa ambil foto nota dari Galeri & Kamera</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">Akses cepat, hemat kuota & buka instan</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white py-3.5 text-sm font-black shadow-lg shadow-rose-600/30 transition"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>INSTALL SEKARANG</span>
          </button>

          {showManualGuide && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in">
              <p className="font-bold">📍 Cara Pasang di Android Chrome:</p>
              <ol className="list-decimal list-inside text-[11px] text-amber-800 space-y-0.5">
                <li>Ketuk ikon <strong>Titik 3 (⋮)</strong> di kanan atas browser Chrome.</li>
                <li>Pilih <strong>"Tambah ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</li>
              </ol>
            </div>
          )}

          {isIOS && (
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold">📍 Cara Pasang di iPhone (Safari):</p>
              <p className="text-[11px] text-blue-800">
                Ketuk tombol <strong>Share/Bagikan</strong> di bawah Safari, lalu pilih <strong>"Tambah ke Layar Utama"</strong>.
              </p>
            </div>
          )}

          <button
            onClick={handleClose}
            className="w-full text-center py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            Lain Kali
          </button>
        </div>

      </div>
    </div>
  );
};
