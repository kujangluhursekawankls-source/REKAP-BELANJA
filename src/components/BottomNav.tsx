import React from 'react';
import { LayoutDashboard, ReceiptText } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'dashboard' | 'rekap';
  onTabChange: (tab: 'dashboard' | 'rekap') => void;
  rekapCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  rekapCount,
}) => {
  return (
    <nav
      aria-label="Navigasi Menu Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-md mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-around gap-3">
        {/* Menu: Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          type="button"
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer select-none ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
          }`}
          title="Buka Halaman Dashboard"
        >
          <LayoutDashboard className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'dashboard' ? 'scale-110' : ''}`} />
          <span className="text-xs sm:text-sm tracking-wide">Dashboard</span>
        </button>

        {/* Menu: Rekap Belanja */}
        <button
          onClick={() => onTabChange('rekap')}
          type="button"
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer select-none ${
            activeTab === 'rekap'
              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold'
          }`}
          title="Buka Halaman Rekap Belanja"
        >
          <ReceiptText className={`w-5 h-5 shrink-0 transition-transform ${activeTab === 'rekap' ? 'scale-110' : ''}`} />
          <span className="text-xs sm:text-sm tracking-wide">Rekap Belanja</span>
          {typeof rekapCount === 'number' && rekapCount > 0 && (
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none ml-0.5 ${
                activeTab === 'rekap'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {rekapCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
