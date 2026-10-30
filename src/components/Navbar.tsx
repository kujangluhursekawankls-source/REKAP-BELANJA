import React from 'react';
import { BookOpen, Settings, Coffee } from 'lucide-react';

interface NavbarProps {
  activeTab?: 'dashboard' | 'rekap';
  onTabChange?: (tab: 'dashboard' | 'rekap') => void;
  onOpenPanduanModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenKopiModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPanduanModal,
  onOpenSettingsModal,
  onOpenKopiModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-slate-900 shadow-md border border-slate-200/80 p-0.5 flex items-center justify-center">
              <img
                src="/app-logo.png"
                alt="CV ARZLAN ADYATAMA"
                className="h-full w-full object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight">
                CV ARZLAN ADYATAMA
              </h1>
            </div>
          </div>

          {/* Action Buttons Right Header */}
          <div className="flex items-center gap-2">
            
            {/* Coffee Appreciation Button */}
            <button
              onClick={onOpenKopiModal}
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1.5 text-xs font-semibold transition"
              title="☕ Bagi Kopi Pembuat"
            >
              <Coffee className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">☕ Bagi Kopi</span>
            </button>

            {/* Settings Modal Gear */}
            <button
              onClick={onOpenSettingsModal}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Pengaturan Integrasi Google Sheets & Drive"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* REPLACED HEADER BUTTON: 📖 PANDUAN DATABASE */}
            <button
              onClick={onOpenPanduanModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>PANDUAN</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
