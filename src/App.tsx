import React, { useState, useEffect, useCallback } from 'react';
import { Transaction } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { RekapBelanja } from './components/RekapBelanja';
import { TambahBelanjaModal } from './components/TambahBelanjaModal';
import { EditBelanjaModal } from './components/EditBelanjaModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { SettingsModal } from './components/SettingsModal';
import { BagiKopiModal } from './components/BagiKopiModal';
import { PanduanModal } from './components/PanduanModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Toast } from './components/Toast';
import { AlertCircle, Link2 } from 'lucide-react';

const SCRIPT_URL_KEY = 'REKAP_BELANJA_SCRIPT_URL';
export const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzGqnjLhv1uCzI1vkT7Nvw1RWl1riVY-pf06Q9Psa8rrYypMJE2dvwFUjYWicPRGFxj8g/exec';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rekap'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataSekolahList, setDataSekolahList] = useState<string[]>([]);
  const [scriptUrl, setScriptUrl] = useState<string>(() => {
    return localStorage.getItem(SCRIPT_URL_KEY) || DEFAULT_SCRIPT_URL;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTambahModalOpen, setIsTambahModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<{ no: number; schoolName: string } | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isKopiModalOpen, setIsKopiModalOpen] = useState<boolean>(false);
  const [isPanduanModalOpen, setIsPanduanModalOpen] = useState<boolean>(false);

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedPhotoTitle, setSelectedPhotoTitle] = useState<string>('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Helper to show toast message
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Fetch Data Sekolah from API
  const fetchDataSekolah = useCallback(async (url: string) => {
    try {
      const res = await fetch(`/api/data-sekolah?scriptUrl=${encodeURIComponent(url)}`);
      const text = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch (_) {
        return;
      }
      if (json.success && Array.isArray(json.data)) {
        setDataSekolahList(json.data);
      }
    } catch (err) {
      console.error('Error loading Data Sekolah:', err);
    }
  }, []);

  // Fetch Rekap Belanja from API
  const fetchRekapBelanja = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rekap-belanja?scriptUrl=${encodeURIComponent(url)}`);
      const text = await res.text();
      let json: any = {};
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.error('JSON parse error on rekap-belanja:', text);
        setTransactions([]);
        return;
      }
      if (json.success && Array.isArray(json.data)) {
        setTransactions(json.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error loading Rekap Belanja:', err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data whenever scriptUrl changes or component mounts
  useEffect(() => {
    if (scriptUrl) {
      fetchDataSekolah(scriptUrl);
      fetchRekapBelanja(scriptUrl);
    } else {
      setTransactions([]);
      setDataSekolahList([]);
    }
  }, [scriptUrl, fetchDataSekolah, fetchRekapBelanja]);

  // Handle Save New Script URL
  const handleSaveScriptUrl = (newUrl: string) => {
    setScriptUrl(newUrl);
    localStorage.setItem(SCRIPT_URL_KEY, newUrl);
    showToast('URL Google Apps Script berhasil diperbarui.');
  };

  // Handle Add New Belanja Transaction
  const handleSaveBelanja = async (payload: {
    namaSekolah: string;
    kategori: string;
    jumlah: number;
    fotoBase64: string;
    fileName: string;
    mimeType: string;
  }) => {
    if (!scriptUrl) {
      setIsSettingsModalOpen(true);
      throw new Error('URL Google Apps Script belum dikonfigurasi. Sila buka Pengaturan Integrasi terlebih dahulu.');
    }

    const response = await fetch('/api/tambah-belanja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        scriptUrl,
      }),
    });

    const text = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(text);
    } catch (_) {
      throw new Error('Respon dari server bukan JSON valid: ' + text.substring(0, 100));
    }

    if (!result.success) {
      throw new Error(result.message || 'Gagal menyimpan transaksi ke Google Sheets');
    }

    showToast('Belanja berhasil disimpan.', 'success');
    fetchRekapBelanja(scriptUrl);
    fetchDataSekolah(scriptUrl);
  };

  // Handle Save Edit Transaction
  const handleSaveEditBelanja = async (payload: {
    no: number;
    namaSekolah: string;
    kategori: string;
    jumlah: number;
    fotoBase64?: string;
    fileName?: string;
    mimeType?: string;
    existingFotoUrl: string;
  }) => {
    if (!scriptUrl) {
      setIsSettingsModalOpen(true);
      throw new Error('URL Google Apps Script belum dikonfigurasi.');
    }

    const response = await fetch('/api/edit-belanja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        scriptUrl,
      }),
    });

    const text = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(text);
    } catch (_) {
      throw new Error('Respon dari server bukan JSON valid: ' + text.substring(0, 100));
    }

    if (!result.success) {
      throw new Error(result.message || 'Gagal memperbarui transaksi');
    }

    showToast(`Transaksi #${payload.no} berhasil diperbarui.`, 'success');
    fetchRekapBelanja(scriptUrl);
    fetchDataSekolah(scriptUrl);
  };

  // Open Delete Confirmation Modal
  const handleStartDeleteBelanja = (no: number, schoolName: string) => {
    setDeletingTransaction({ no, schoolName });
  };

  // Confirm Delete Action
  const handleConfirmDeleteBelanja = async () => {
    if (!deletingTransaction) return;
    const { no } = deletingTransaction;

    if (!scriptUrl) {
      setIsSettingsModalOpen(true);
      throw new Error('URL Google Apps Script belum dikonfigurasi.');
    }

    const response = await fetch('/api/hapus-belanja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ no, scriptUrl }),
    });

    const text = await response.text();
    let result: any = {};
    try {
      result = JSON.parse(text);
    } catch (_) {
      throw new Error('Respon dari server bukan JSON valid: ' + text.substring(0, 100));
    }

    if (!result.success) {
      throw new Error(result.message || 'Gagal menghapus transaksi dari Google Sheets');
    }

    showToast(`Transaksi #${no} dan foto nota di Google Drive berhasil dihapus.`, 'success');
    fetchRekapBelanja(scriptUrl);
    fetchDataSekolah(scriptUrl);
  };

  // Next Transaction Number (Auto Incremental)
  const nextNo = transactions.length > 0
    ? Math.max(...transactions.map((t) => Number(t.no) || 0)) + 1
    : 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased pb-12 overflow-x-hidden">
      
      {/* Top Header / Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenPanduanModal={() => setIsPanduanModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenKopiModal={() => setIsKopiModalOpen(true)}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {!scriptUrl && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Google Apps Script belum dikonfigurasi
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Hubungkan URL Apps Script Google Spreadsheet Anda untuk membaca dan menyimpan transaksi belanja.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-1.5 shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
            >
              <Link2 className="w-4 h-4" />
              <span>Pengaturan Integrasi</span>
            </button>
          </div>
        )}

        {/* Dynamic View switching */}
        {activeTab === 'dashboard' ? (
          <Dashboard
            transactions={transactions}
            onOpenTambahModal={() => setIsTambahModalOpen(true)}
            onViewAllRekap={() => setActiveTab('rekap')}
            onSelectPhoto={(url, title) => {
              setSelectedPhotoUrl(url);
              setSelectedPhotoTitle(title);
            }}
          />
        ) : (
          <RekapBelanja
            transactions={transactions}
            onOpenTambahModal={() => setIsTambahModalOpen(true)}
            onRefresh={() => {
              if (scriptUrl) {
                fetchRekapBelanja(scriptUrl);
                fetchDataSekolah(scriptUrl);
                showToast('Merefresh data rekap belanja...');
              }
            }}
            onSelectPhoto={(url, title) => {
              setSelectedPhotoUrl(url);
              setSelectedPhotoTitle(title);
            }}
            onEditTransaction={(t) => setEditingTransaction(t)}
            onDeleteTransaction={handleStartDeleteBelanja}
            isLoading={isLoading}
          />
        )}

      </main>

      {/* Modals & Overlays */}
      {isTambahModalOpen && (
        <TambahBelanjaModal
          dataSekolahList={dataSekolahList}
          nextNo={nextNo}
          onSave={handleSaveBelanja}
          onClose={() => setIsTambahModalOpen(false)}
        />
      )}

      {editingTransaction && (
        <EditBelanjaModal
          transaction={editingTransaction}
          dataSekolahList={dataSekolahList}
          onSaveEdit={handleSaveEditBelanja}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {deletingTransaction && (
        <ConfirmDeleteModal
          no={deletingTransaction.no}
          schoolName={deletingTransaction.schoolName}
          onConfirmDelete={handleConfirmDeleteBelanja}
          onClose={() => setDeletingTransaction(null)}
        />
      )}

      {selectedPhotoUrl && (
        <ImageViewerModal
          imageUrl={selectedPhotoUrl}
          title={selectedPhotoTitle}
          onClose={() => setSelectedPhotoUrl(null)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          currentScriptUrl={scriptUrl}
          onSaveScriptUrl={handleSaveScriptUrl}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {isKopiModalOpen && (
        <BagiKopiModal onClose={() => setIsKopiModalOpen(false)} />
      )}

      {isPanduanModalOpen && (
        <PanduanModal
          onClose={() => setIsPanduanModalOpen(false)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />
      )}

      <PWAInstallModal />

      <OfflineIndicator />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <footer className="mt-12 border-t border-slate-200/80 py-6 text-center text-xs text-slate-400">
        <p>Rekap Belanja CV — PWA Sistem Pencatatan Belanja Sekolah & Foto Nota</p>
      </footer>

    </div>
  );
}
