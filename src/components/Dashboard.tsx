import React from 'react';
import { Wallet, Receipt, School, ArrowRight, Eye, ReceiptText } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, getGoogleDriveDirectImageUrl } from '../utils/googleDrive';

interface DashboardProps {
  transactions: Transaction[];
  onOpenTambahModal: () => void;
  onViewAllRekap: () => void;
  onSelectPhoto: (url: string, title: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  onOpenTambahModal,
  onViewAllRekap,
  onSelectPhoto,
}) => {
  // Real Statistics Calculation
  const totalBelanja = transactions.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
  const jumlahTransaksi = transactions.length;
  const uniqueSchools = new Set(transactions.map((t) => t.namaSekolah.trim()).filter(Boolean));
  const jumlahSekolah = uniqueSchools.size;

  const recentTransactions = [...transactions].reverse().slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Brand Company Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 rounded-3xl p-5 text-white shadow-xl flex items-center gap-4 relative overflow-hidden border border-slate-700/50">
        <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl overflow-hidden bg-slate-950 p-1 border border-rose-500/40 shadow-2xl flex items-center justify-center">
          <img
            src="/app-logo.png"
            alt="CV ARZLAN ADYATAMA Logo"
            className="h-full w-full object-contain rounded-xl"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="space-y-1 min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider border border-rose-500/30">
            Aplikasi Resmi
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight truncate">
            CV ARZLAN ADYATAMA
          </h2>
          <p className="text-xs text-slate-300 leading-snug">
            Sistem Rekap Belanja Sekolah, Pengadaan & Penyimpanan Foto Nota
          </p>
        </div>
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Belanja */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">TOTAL BELANJA</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {formatRupiah(totalBelanja)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Jumlah Transaksi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">JUMLAH TRANSAKSI</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {jumlahTransaksi}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Jumlah Sekolah */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">JUMLAH SEKOLAH</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {jumlahSekolah}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <School className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Belanja Terbaru Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Belanja Terbaru</h3>
            <p className="text-xs text-slate-500">Ringkasan transaksi belanja sekolah terbaru</p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={onViewAllRekap}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Empty State when no transactions */}
        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <ReceiptText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-600">Belum ada transaksi belanja.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Buka menu "REKAP BELANJA" untuk mencatat belanja sekolah baru.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((t, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                    #{t.no}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{t.namaSekolah}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">
                        {t.kategori}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{formatRupiah(t.jumlah)}</p>
                  </div>
                  {t.fotoNota && (
                    <button
                      onClick={() => onViewAllRekap()}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      title="Lihat Nota"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
