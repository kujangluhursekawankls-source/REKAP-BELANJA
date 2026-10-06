import React, { useState } from 'react';
import { Settings, X, Copy, Check, ExternalLink, Link2, FileCode, HelpCircle } from 'lucide-react';
import { APPS_SCRIPT_CODE } from '../utils/appsScriptTemplate';

interface SettingsModalProps {
  currentScriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentScriptUrl,
  onSaveScriptUrl,
  onClose,
}) => {
  const [url, setUrl] = useState(currentScriptUrl);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSyncLink, setCopiedSyncLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'url' | 'script'>('url');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveScriptUrl(url.trim());
    onClose();
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopySyncLink = () => {
    if (!url) return;
    const syncUrl = `${window.location.origin}/?scriptUrl=${encodeURIComponent(url)}`;
    navigator.clipboard.writeText(syncUrl);
    setCopiedSyncLink(true);
    setTimeout(() => setCopiedSyncLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Pengaturan Integrasi Google</h3>
              <p className="text-xs text-slate-500">Google Sheets (REKAP-BELANJA) & Google Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-100/50 p-1 shrink-0">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'url'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>URL Web App</span>
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'script'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Kode Apps Script</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-600">
          {activeTab === 'url' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  URL Google Apps Script Web App
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-mono text-slate-800"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Masukkan URL Web App hasil deploy Apps Script Google Sheets Anda.
                </p>
              </div>

              {/* 1-Click Sync Sharing Card */}
              {url && (
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-blue-900">
                      📲 Link Pindah HP / Bagikan Teman (1-Klik Otomatis)
                    </p>
                    <p className="text-[11px] text-blue-700">
                      Kirim link ini ke WA HP baru Anda. Saat dibuka di HP baru, database langsung terhubung otomatis!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySyncLink}
                    className="flex items-center gap-1.5 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition"
                  >
                    {copiedSyncLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSyncLink ? 'Link Tersalin!' : 'Salin Link Auto-Sync'}</span>
                  </button>
                </div>
              )}

              {/* Step-by-step instructions */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Panduan Menghubungkan Google Sheets & Drive:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                  <li>
                    Buka Google Spreadsheet Anda (memiliki sheet <strong className="text-slate-800">DATA-SEKOLAH</strong> dan <strong className="text-slate-800">REKAP-BELANJA</strong>).
                  </li>
                  <li>
                    Pilih menu <strong className="text-slate-800">Ekstensi &gt; Apps Script</strong>.
                  </li>
                  <li>
                    Salin kode pada tab <strong className="text-slate-800">"Kode Apps Script"</strong> di atas, lalu tempel di editor Apps Script.
                  </li>
                  <li>
                    <strong>PENTING (Solusi Access denied):</strong> Pada toolbar atas Apps Script, pilih fungsi <strong className="text-blue-700">testAuthorization</strong>, lalu klik tombol <strong className="text-blue-700 font-bold">Jalankan (Run)</strong>. Klik <strong className="text-slate-800">"Tinjau Izin (Review Permissions)"</strong> dan izinkan akses Google Drive.
                  </li>
                  <li>
                    Klik <strong className="text-slate-800">Terapkan (Deploy) &gt; Terapkan sebagai aplikasi web</strong> (Who has access: <strong className="text-blue-600 font-bold">Siapa saja / Anyone</strong>).
                  </li>
                  <li>
                    Salin URL Web App dan tempel pada kolom di atas, lalu klik <strong className="text-slate-800">Simpan Integrasi</strong>.
                  </li>
                </ol>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                >
                  Simpan Integrasi
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Script Google Apps Script (GAS)</span>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Kode Tersalin!' : 'Salin Kode Script'}</span>
                </button>
              </div>

              <div className="relative rounded-xl bg-slate-900 p-4 max-h-[300px] overflow-y-auto">
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                  {APPS_SCRIPT_CODE}
                </pre>
              </div>

              <p className="text-xs text-slate-500">
                Folder ID Google Drive tempat menyimpan foto nota diset ke: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">1PHHbtTBTKMgiX7KD89ypIqY0QDErjrOu</code>.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
