import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Image as ImageIcon,
  ExternalLink,
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  FileDown,
  CheckCircle2,
  Download,
  Share2,
  X,
  AlertCircle,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, getGoogleDriveDirectImageUrl } from '../utils/googleDrive';
import { generateRekapPDF, shareOrSavePDF, PDFGenerationResult } from '../utils/pdfGenerator';

interface RekapBelanjaProps {
  transactions: Transaction[];
  onOpenTambahModal: () => void;
  onRefresh: () => void;
  onSelectPhoto: (url: string, title: string) => void;
  onEditTransaction: (t: Transaction) => void;
  onDeleteTransaction: (no: number, schoolName: string) => void;
  isLoading: boolean;
}

export const RekapBelanja: React.FC<RekapBelanjaProps> = ({
  transactions,
  onOpenTambahModal,
  onRefresh,
  onSelectPhoto,
  onEditTransaction,
  onDeleteTransaction,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('ALL');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfResult, setPdfResult] = useState<PDFGenerationResult | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Extract unique categories & unique schools for filters (Case-insensitive & whitespace normalized)
  // Merges e.g. "SDN MEKARSARI 04" and "SDN Mekarsari 04" into 1 filter
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    transactions.forEach((t) => {
      const raw = t.kategori?.trim();
      if (raw) {
        const key = raw.replace(/\s+/g, ' ').toLowerCase();
        if (!map.has(key)) {
          map.set(key, raw);
        }
      }
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  }, [transactions]);

  const schoolNames = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    transactions.forEach((t) => {
      const raw = t.namaSekolah?.trim();
      if (raw) {
        const key = raw.replace(/\s+/g, ' ').toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, { label: raw, count: 1 });
        }
      }
    });
    return Array.from(map.entries())
      .map(([key, item]) => ({ key, label: item.label, count: item.count }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
  }, [transactions]);

  // Filter transactions with accurate case-insensitive matching
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const query = searchTerm.toLowerCase().trim().replace(/\s+/g, ' ');
      const rawSchool = (t.namaSekolah || '').trim().replace(/\s+/g, ' ');
      const rawCategory = (t.kategori || '').trim().replace(/\s+/g, ' ');

      const matchSearch =
        !query ||
        rawSchool.toLowerCase().includes(query) ||
        rawCategory.toLowerCase().includes(query) ||
        t.no.toString().includes(query);

      const matchCategory =
        selectedCategory === 'ALL' ||
        rawCategory.toLowerCase() === selectedCategory;

      const matchSchool =
        selectedSchoolFilter === 'ALL' ||
        rawSchool.toLowerCase() === selectedSchoolFilter;

      return matchSearch && matchCategory && matchSchool;
    });
  }, [transactions, searchTerm, selectedCategory, selectedSchoolFilter]);

  const handleDownloadPDF = () => {
    if (isGeneratingPdf) return;
    const dataToExport = filteredTransactions.length > 0 ? filteredTransactions : transactions;

    if (dataToExport.length === 0) {
      setPdfError('Belum ada transaksi belanja yang tercatat. Silakan tambah data belanja terlebih dahulu.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setPdfError(null);
      const result = generateRekapPDF(dataToExport);
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
    <div className="space-y-4 animate-in fade-in max-w-full overflow-x-hidden">
      
      {/* Header & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">REKAP BELANJA</h2>
            <p className="text-xs text-slate-500">
              Daftar transaksi belanja dari Google Sheet REKAP-BELANJA ({transactions.length} Transaksi)
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 shadow-xs transition"
              title="Download Rekap Belanja format PDF"
            >
              {pdfSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">PDF Terunduh!</span>
                </>
              ) : (
                <>
                  <FileDown className={`w-3.5 h-3.5 text-rose-600 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                  <span className="hidden sm:inline">{isGeneratingPdf ? 'Menyiapkan...' : 'Download PDF'}</span>
                </>
              )}
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition"
              title="Refresh Data dari Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <button
              onClick={onOpenTambahModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-blue-600/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ TAMBAH BELANJA</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Sekolah atau Kategori..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800"
            />
          </div>

          {/* Filter Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 bg-white"
            >
              <option value="ALL">Semua Kategori Belanja</option>
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter School */}
          <div>
            <select
              value={selectedSchoolFilter}
              onChange={(e) => setSelectedSchoolFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 bg-white"
            >
              <option value="ALL">Semua Sekolah ({schoolNames.length})</option>
              {schoolNames.map((sch) => (
                <option key={sch.key} value={sch.key}>
                  {sch.label} {sch.count > 1 ? `(${sch.count})` : ''}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Main Content Container (Mobile Fit + Desktop Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Memuat data Rekap Belanja dari Google Sheets...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-3 px-4">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Belum ada transaksi belanja.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Data transaksi dari Google Sheets REKAP-BELANJA masih kosong atau tidak ada yang sesuai filter.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (ANDROID OPTIMIZED) - FIT 100% ZERO HORIZONTAL SCROLL */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredTransactions.map((t, idx) => {
                const directImgUrl = getGoogleDriveDirectImageUrl(t.fotoNota);
                const isImageLink = !!t.fotoNota;

                return (
                  <div key={idx} className="p-4 space-y-2.5 hover:bg-slate-50 transition">
                    
                    {/* Header Row: NO, Nama Sekolah & Action Buttons */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-extrabold text-[11px]">
                          #{t.no}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {t.namaSekolah}
                        </h4>
                      </div>

                      {/* Right Action Icons: Thumbnail + Edit + Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isImageLink && (
                          <button
                            onClick={() => onSelectPhoto(t.fotoNota, `Nota ${t.namaSekolah} - ${t.kategori}`)}
                            className="flex h-10 w-12 items-center justify-center rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs active:scale-95 transition"
                            title="Lihat Nota"
                          >
                            <img
                              src={directImgUrl}
                              alt={`Nota ${t.namaSekolah}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </button>
                        )}
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => onEditTransaction(t)}
                          className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 active:scale-95 transition"
                          title="Edit Transaksi"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteTransaction(t.no, t.namaSekolah)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Footer Row: Category & Amount */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100/80">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        {t.kategori}
                      </span>
                      <p className="text-sm font-black text-slate-900">
                        {formatRupiah(t.jumlah)}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW - FULL TABLE WITH ACTIONS */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-16 text-center">NO</th>
                    <th className="py-3.5 px-4">NAMA SEKOLAH</th>
                    <th className="py-3.5 px-4">KATEGORI BELANJA</th>
                    <th className="py-3.5 px-4 text-right">JUMLAH</th>
                    <th className="py-3.5 px-4 text-center w-28">FOTO NOTA</th>
                    <th className="py-3.5 px-4 text-center w-28">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-800">
                  {filteredTransactions.map((t, idx) => {
                    const directImgUrl = getGoogleDriveDirectImageUrl(t.fotoNota);
                    const isImageLink = !!t.fotoNota;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        
                        {/* NO */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                          {t.no}
                        </td>

                        {/* NAMA SEKOLAH */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {t.namaSekolah}
                        </td>

                        {/* KATEGORI BELANJA */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            {t.kategori}
                          </span>
                        </td>

                        {/* JUMLAH */}
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {formatRupiah(t.jumlah)}
                        </td>

                        {/* FOTO NOTA */}
                        <td className="py-3.5 px-4 text-center">
                          {isImageLink ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onSelectPhoto(t.fotoNota, `Nota ${t.namaSekolah} - ${t.kategori}`)}
                                className="group relative flex h-12 w-16 shrink-0 items-center justify-center rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition"
                                title="Klik untuk Lihat Gambar Nota"
                              >
                                <img
                                  src={directImgUrl}
                                  alt={`Nota ${t.namaSekolah}`}
                                  className="h-full w-full object-cover group-hover:scale-105 transition"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                  <Eye className="w-4 h-4" />
                                </div>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Tanpa Nota</span>
                          )}
                        </td>

                        {/* ACTIONS: EDIT & HAPUS */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onEditTransaction(t)}
                              className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
                              title="Edit Transaksi"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(t.no, t.namaSekolah)}
                              className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
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
