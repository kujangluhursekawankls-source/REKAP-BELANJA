import React, { useState } from 'react';
import {
  Wallet,
  Receipt,
  School,
  ArrowRight,
  Eye,
  ReceiptText,
  FileDown,
  CheckCircle2,
  X,
  ExternalLink,
  Share2,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, getGoogleDriveDirectImageUrl } from '../utils/googleDrive';
import { generateRekapPDF, shareOrSavePDF, PDFGenerationResult } from '../utils/pdfGenerator';

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
  const [pdfResult, setPdfResult] = useState<PDFGenerationResult | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

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
      setPdfError('Belum ada data belanja yang tercatat. Silakan tambah data belanja terlebih dahulu.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setPdfError(null);
      const result = generateRekapPDF(transactions);
      setPdfResult(result);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err: any) {
      console.error('Gagal generate PDF:', err);
      setPdfError('Gagal membuat dokumen PDF: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSharePDF = async () => {
    if (!pdfResult) return;
    await shareOrSavePDF(pdfResult);
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
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/20 backdrop-blur-xs transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download Rekap Belanja Lengkap format PDF Rapih"
          >
            {pdfSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">PDF Terunduh!</span>
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

      {/* PDF Ready / Download Modal Dialog */}
      {pdfResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-rose-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <FileDown className="w-5 h-5 text-rose-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Rekap PDF Siap!</h3>
                  <p className="text-xs text-rose-200">CV ARZLAN ADYATAMA</p>
                </div>
              </div>
              <button
                onClick={() => setPdfResult(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Nama File:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={pdfResult.fileName}>
                    {pdfResult.fileName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Total Pengeluaran:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(pdfResult.totalBelanja)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Total Transaksi:</span>
                  <span className="font-bold text-slate-900">{pdfResult.totalTransaksi} Transaksi ({pdfResult.totalSekolah} Sekolah)</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                Jika unduhan otomatis tidak muncul, silakan klik tombol di bawah ini:
              </p>

              <div className="space-y-2">
                {/* Direct Download Anchor */}
                <a
                  href={pdfResult.blobUrl}
                  download={pdfResult.fileName}
                  onClick={() => {
                    setTimeout(() => setPdfResult(null), 1500);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-rose-600/25 transition text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File PDF Sekarang</span>
                </a>

                {/* Open in New Tab Link */}
                <a
                  href={pdfResult.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-800 text-xs font-bold transition text-center"
                >
                  <ExternalLink className="w-4 h-4 text-slate-600" />
                  <span>Buka / Pratinjau PDF di Tab Baru</span>
                </a>

                {/* Share / Native Android if available */}
                {typeof navigator !== 'undefined' && (navigator as any).share && (
                  <button
                    onClick={handleSharePDF}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-semibold transition"
                  >
                    <Share2 className="w-4 h-4 text-slate-600" />
                    <span>Kirim / Simpan ke HP (Android Share)</span>
                  </button>
                )}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setPdfResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Tutup Jendela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Error Modal / Notice */}
      {pdfError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Perhatian</h3>
            </div>
            <p className="text-sm text-slate-600">{pdfError}</p>
            <button
              onClick={() => setPdfError(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
