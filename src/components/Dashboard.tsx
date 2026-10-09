import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Receipt,
  School,
  ArrowRight,
  Eye,
  ReceiptText,
  FileDown,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  AlertTriangle,
  SlidersHorizontal,
  PiggyBank,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, formatNumberWithDots, parseRupiahInput } from '../utils/googleDrive';
import { generateRekapPDF } from '../utils/pdfGenerator';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Target Budget Bulanan (disimpan di localStorage agar persisten)
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('REKAP_BELANJA_MONTHLY_BUDGET');
    if (saved && !isNaN(Number(saved)) && Number(saved) > 0) {
      return Number(saved);
    }
    return 100000000; // Default target: Rp 100.000.000
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudgetInput, setTempBudgetInput] = useState('');
  const [budgetSuccessNotice, setBudgetSuccessNotice] = useState(false);

  // Perhitungan Tanggal & Bulan Berjalan
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();
  const namaBulanBerjalan = now.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Filter transaksi bulan berjalan (mendukung t.tanggal, t.createdAt, regex fotoNota YYYYMMDD, atau localStorage date mapping)
  const transactionsBulanBerjalan = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Explicit tanggal atau createdAt
      const explicitDate = (t as any).tanggal || (t as any).createdAt;
      if (explicitDate) {
        const d = new Date(explicitDate);
        if (!isNaN(d.getTime())) {
          return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
        }
      }

      // 2. Foto Nota URL mengandung YYYYMMDD
      if (t.fotoNota) {
        const match = t.fotoNota.match(/_(\d{4})(\d{2})(\d{2})\./);
        if (match) {
          const yr = parseInt(match[1], 10);
          const mo = parseInt(match[2], 10) - 1;
          return yr === currentYear && mo === currentMonthIdx;
        }
      }

      // 3. Stored timestamp di localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('REKAP_BELANJA_TX_DATES') || '{}');
        if (stored[t.no]) {
          const d = new Date(stored[t.no]);
          if (!isNaN(d.getTime())) {
            return d.getMonth() === currentMonthIdx && d.getFullYear() === currentYear;
          }
        }
      } catch (_) {}

      // 4. Default: transaksi pada sheet aktif tergolong belanja siklus berjalan
      return true;
    });
  }, [transactions, currentMonthIdx, currentYear]);

  // Statistik Real Transaksi Bulan Berjalan
  const totalBulanBerjalan = useMemo(() => {
    return transactionsBulanBerjalan.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
  }, [transactionsBulanBerjalan]);

  const jumlahTransaksiBulanIni = transactionsBulanBerjalan.length;

  // Persentase penggunaan budget
  const persentaseBudget = monthlyBudget > 0
    ? Math.min(Math.round((totalBulanBerjalan / monthlyBudget) * 100), 999)
    : 0;

  // Sisa budget
  const sisaBudget = monthlyBudget - totalBulanBerjalan;

  // Rata-rata pengeluaran per transaksi bulan ini
  const rataRataPerTransaksi = jumlahTransaksiBulanIni > 0
    ? Math.round(totalBulanBerjalan / jumlahTransaksiBulanIni)
    : 0;

  // Transaksi belanja terbesar bulan berjalan
  const transaksiTerbesar = useMemo(() => {
    if (transactionsBulanBerjalan.length === 0) return null;
    return [...transactionsBulanBerjalan].sort((a, b) => (Number(b.jumlah) || 0) - (Number(a.jumlah) || 0))[0];
  }, [transactionsBulanBerjalan]);

  // Kategori dengan pengeluaran terbesar bulan ini
  const topKategori = useMemo(() => {
    if (transactionsBulanBerjalan.length === 0) return null;
    const catMap: Record<string, number> = {};
    for (const t of transactionsBulanBerjalan) {
      const cat = t.kategori?.trim() || 'Lainnya';
      catMap[cat] = (catMap[cat] || 0) + (Number(t.jumlah) || 0);
    }
    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    return entries[0] ? { name: entries[0][0], total: entries[0][1] } : null;
  }, [transactionsBulanBerjalan]);

  // Handler simpan budget baru
  const handleSaveBudget = () => {
    const parsed = parseRupiahInput(tempBudgetInput);
    if (parsed > 0) {
      setMonthlyBudget(parsed);
      localStorage.setItem('REKAP_BELANJA_MONTHLY_BUDGET', String(parsed));
      setIsEditingBudget(false);
      setTempBudgetInput('');
      setBudgetSuccessNotice(true);
      setTimeout(() => setBudgetSuccessNotice(false), 3000);
    }
  };

  const handleOpenEditBudget = () => {
    setTempBudgetInput(formatNumberWithDots(monthlyBudget));
    setIsEditingBudget(true);
  };

  // Real Statistics Calculation with case-insensitive normalization
  const totalBelanja = transactions.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
  const jumlahTransaksi = transactions.length;
  const uniqueSchools = new Set(
    transactions
      .map((t) => t.namaSekolah?.trim().replace(/\s+/g, ' ').toLowerCase())
      .filter(Boolean)
  );
  const jumlahSekolah = uniqueSchools.size;

  const recentTransactions = [...transactions].reverse().slice(0, 5);

  const handleDownloadPDF = () => {
    if (isGeneratingPdf) return;

    if (transactions.length === 0) {
      setPdfError('Belum ada data belanja yang tercatat untuk diunduh.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setPdfError(null);
      // Langsung view dokumen dan download file tanpa pop-up dialog
      generateRekapPDF(transactions);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err: any) {
      console.error('Gagal generate PDF:', err);
      setPdfError('Gagal membuat dokumen PDF: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Brand Company Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 rounded-3xl p-5 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden border border-slate-700/50">
        <div className="flex items-center gap-4 min-w-0">
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

        {/* Small Neat Download Rekap PDF Button in Brand Header */}
        <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf || transactions.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/20 backdrop-blur-xs transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download Rekap Belanja Lengkap format PDF Rapih"
          >
            {pdfSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">PDF Terunduh & Dibuka!</span>
              </>
            ) : (
              <>
                <FileDown className={`w-4 h-4 text-rose-300 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                <span>{isGeneratingPdf ? 'Menyiapkan...' : 'Download Rekap PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Non-Intrusive Inline Notice if any error (Tanpa Pop-up Dialog) */}
      {pdfError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="truncate">{pdfError}</span>
          </div>
          <button
            onClick={() => setPdfError(null)}
            className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold transition text-[11px] shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

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

      {/* Widget Ringkasan Statistik Belanja Bulan Berjalan & Pantauan Budget */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
        {/* Widget Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Statistik Belanja Bulan Berjalan
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200/60">
                  <Calendar className="w-3 h-3" />
                  {namaBulanBerjalan}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ringkasan real-time pengeluaran & pantauan alokasi budget belanja
              </p>
            </div>
          </div>

          {/* Health Badge & Action */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition ${
                persentaseBudget >= 100
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : persentaseBudget >= 80
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {persentaseBudget >= 100 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Over Budget ({persentaseBudget}%)</span>
                </>
              ) : persentaseBudget >= 80 ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mendekati Limit ({persentaseBudget}%)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Budget Aman ({persentaseBudget}%)</span>
                </>
              )}
            </span>

            <button
              onClick={() => {
                if (isEditingBudget) {
                  setIsEditingBudget(false);
                } else {
                  handleOpenEditBudget();
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs active:scale-95"
              title="Atur target batas budget bulanan"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>{isEditingBudget ? 'Tutup' : 'Atur Budget'}</span>
            </button>
          </div>
        </div>

        {/* Inline Budget Setter Panel (No Modal Pop-up) */}
        {isEditingBudget && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-extrabold text-slate-800">
                Sesuaikan Target / Pagu Anggaran Bulanan (Rp)
              </label>
              <span className="text-[11px] text-slate-500">
                Pagu tersimpan otomatis untuk memantau batas belanja
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={tempBudgetInput}
                  onChange={(e) => {
                    const num = parseRupiahInput(e.target.value);
                    setTempBudgetInput(num ? formatNumberWithDots(num) : '');
                  }}
                  placeholder="Contoh: 100.000.000"
                  className="w-full pl-9 pr-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {[50000000, 75000000, 100000000, 150000000].map((presetVal) => (
                  <button
                    key={presetVal}
                    type="button"
                    onClick={() => setTempBudgetInput(formatNumberWithDots(presetVal))}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition shrink-0 active:scale-95"
                  >
                    {presetVal / 1000000} Jt
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {budgetSuccessNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Target budget bulanan berhasil diperbarui menjadi {formatRupiah(monthlyBudget)}</span>
          </div>
        )}

        {/* 3 Core Monthly Budget Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Total Pengeluaran Bulan Ini */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 via-white to-pink-50/40 border border-rose-100/90 shadow-2xs">
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Total Pengeluaran Bulan Ini
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {formatRupiah(totalBulanBerjalan)}
            </p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              {jumlahTransaksiBulanIni} transaksi tercatat pada {namaBulanBerjalan}
            </p>
          </div>

          {/* Card 2: Pagu / Target Budget */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Target Pagu Anggaran
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {formatRupiah(monthlyBudget)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {persentaseBudget}% dari pagu telah digunakan
            </p>
          </div>

          {/* Card 3: Sisa Anggaran */}
          <div
            className={`p-4 rounded-2xl border shadow-2xs ${
              sisaBudget >= 0
                ? 'bg-emerald-50/70 border-emerald-100/90'
                : 'bg-rose-50/70 border-rose-100/90'
            }`}
          >
            <p
              className={`text-[11px] font-bold uppercase tracking-wider ${
                sisaBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {sisaBudget >= 0 ? 'Sisa Budget Tersedia' : 'Defisit Anggaran'}
            </p>
            <p
              className={`text-xl sm:text-2xl font-black mt-1 ${
                sisaBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {sisaBudget >= 0 ? formatRupiah(sisaBudget) : `- ${formatRupiah(Math.abs(sisaBudget))}`}
            </p>
            <p
              className={`text-[11px] font-medium mt-1 ${
                sisaBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {sisaBudget >= 0 ? 'Sisa pagu aman untuk belanja' : 'Pengeluaran melampaui pagu target'}
            </p>
          </div>
        </div>

        {/* Visual Budget Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">
              Penggunaan Budget: <span className="font-extrabold text-slate-900">{persentaseBudget}%</span>
            </span>
            <span className="text-slate-500 font-semibold text-[11px]">
              {formatRupiah(totalBulanBerjalan)} / {formatRupiah(monthlyBudget)}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                persentaseBudget >= 100
                  ? 'bg-rose-600'
                  : persentaseBudget >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(persentaseBudget, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-0.5">
            <span>0%</span>
            <span>50%</span>
            <span>80%</span>
            <span>100% (Limit)</span>
          </div>
        </div>

        {/* Micro-Metrics Row for Instant Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Rata-rata / Transaksi</p>
              <p className="text-xs font-extrabold text-slate-800 truncate">
                {formatRupiah(rataRataPerTransaksi)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <School className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Belanja Terbesar</p>
              <p
                className="text-xs font-extrabold text-slate-800 truncate"
                title={transaksiTerbesar ? `${transaksiTerbesar.namaSekolah}: ${formatRupiah(transaksiTerbesar.jumlah)}` : '-'}
              >
                {transaksiTerbesar ? `${formatRupiah(transaksiTerbesar.jumlah)} (${transaksiTerbesar.namaSekolah})` : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Kategori Utama</p>
              <p
                className="text-xs font-extrabold text-slate-800 truncate"
                title={topKategori ? `${topKategori.name} (${formatRupiah(topKategori.total)})` : '-'}
              >
                {topKategori ? `${topKategori.name} (${formatRupiah(topKategori.total)})` : '-'}
              </p>
            </div>
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
          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                title="Download Rekap Belanja format PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Download</span> PDF
              </button>
            )}
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
