import React, { useState } from 'react';
import { Coffee, Heart, X, Copy, Check, Smartphone } from 'lucide-react';

interface BagiKopiModalProps {
  onClose: () => void;
}

export const BagiKopiModal: React.FC<BagiKopiModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const phoneNumber = '08179015181';

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-xs">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">☕ Bagi Kopi Pembuat</h3>
              <p className="text-xs text-slate-500">Apresiasi Pengembangan Rekap Belanja CV</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
            Terima kasih telah menggunakan aplikasi ini! Jika aplikasi ini membantu mempermudah rekap belanja sekolah Anda, Anda dapat memberikan apresiasi kopi ke pembuat aplikasi melalui:
          </p>

          {/* E-Wallet Card */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 border border-amber-200/80 space-y-3">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  DANA / GOPAY
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                  DANA
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                  GOPAY
                </span>
              </div>
            </div>

            {/* Number Display & Copy Button */}
            <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-amber-200/90 shadow-xs">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Nomor Tujuan</p>
                <p className="text-base font-black text-slate-900 font-mono tracking-wider">
                  08179015181
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Nomor'}</span>
              </button>
            </div>

          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 pt-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Dibuat dengan dedikasi untuk efisiensi rekap belanja</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          Tutup
        </button>

      </div>
    </div>
  );
};
