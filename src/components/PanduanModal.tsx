import React, { useState } from 'react';
import { BookOpen, X, Copy, Check, Settings, ExternalLink, ShieldCheck } from 'lucide-react';
import { APPS_SCRIPT_CODE } from '../utils/appsScriptTemplate';

interface PanduanModalProps {
  onClose: () => void;
  onOpenSettingsModal: () => void;
}

export const PanduanModal: React.FC<PanduanModalProps> = ({
  onClose,
  onOpenSettingsModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">📖 Panduan Database Sendiri</h3>
              <p className="text-xs text-slate-500">Google Sheets (REKAP-BELANJA) & Google Drive</p>
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
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-600">
          
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 bg-blue-50/80 p-3.5 rounded-xl border border-blue-100">
            Ingin transaksi dan foto nota masuk ke akun <strong>Google Drive & Sheets milik Anda atau rekan Anda sendiri</strong>? Ikuti 4 langkah mudah berikut:
          </p>

          {/* 4 Steps */}
          <div className="space-y-3.5">
            
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs">
                1
              </span>
              <div className="space-y-0.5 text-xs">
                <h4 className="font-bold text-slate-900">Buat Google Spreadsheet Baru</h4>
                <p className="text-slate-600">
                  Buka Google Sheets di akun Google Anda, lalu buat sheet bernama <strong className="text-slate-900">REKAP-BELANJA</strong>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs">
                2
              </span>
              <div className="space-y-2 text-xs w-full">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">Tempelkan Kode Apps Script</h4>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-blue-700 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Kode Tersalin!' : 'Salin Kode Script'}</span>
                  </button>
                </div>
                <p className="text-slate-600">
                  Di Google Sheets Anda, buka menu <strong className="text-slate-900">Ekstensi &gt; Apps Script</strong>, hapus kode lama, lalu tempelkan kode skrip yang sudah disalin di atas.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs">
                3
              </span>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">Otorisasi & Deploy Web App</h4>
                <p className="text-slate-600">
                  Pilih fungsi <strong className="text-blue-700">testAuthorization</strong>, klik tombol <strong className="text-slate-900">Jalankan (Run)</strong> dan izinkan akses Google Drive.
                </p>
                <p className="text-slate-600">
                  Klik <strong className="text-slate-900">Terapkan (Deploy) &gt; Penerapan baru</strong> (Akses / Who has access: <strong className="text-blue-600 font-bold">Siapa saja / Anyone</strong>), lalu salin URL Web App yang dihasilkan.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs">
                4
              </span>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-slate-900">Tempelkan URL ke Aplikasi Ini</h4>
                <p className="text-slate-600">
                  Tempelkan URL Web App tersebut pada menu **Pengaturan Integrasi (⚙️)** di aplikasi ini.
                </p>
              </div>
            </div>

          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSettingsModal();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs"
            >
              <Settings className="w-4 h-4" />
              <span>Buka Pengaturan & Tempel URL (⚙️)</span>
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Tutup
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
