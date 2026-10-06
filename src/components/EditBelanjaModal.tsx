import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, AlertCircle, Building2, Image as ImageIcon } from 'lucide-react';
import { Transaction } from '../types';
import { formatNumberWithDots, parseRupiahInput, generateReceiptFileName, formatRupiah, getGoogleDriveDirectImageUrl } from '../utils/googleDrive';

interface EditBelanjaModalProps {
  transaction: Transaction;
  dataSekolahList: string[];
  onSaveEdit: (payload: {
    no: number;
    namaSekolah: string;
    kategori: string;
    jumlah: number;
    fotoBase64?: string;
    fileName?: string;
    mimeType?: string;
    existingFotoUrl: string;
  }) => Promise<void>;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  'ATK',
  'Perabot Kantor',
  'Elektronik',
  'Kebersihan',
  'Konsumsi',
  'Pemeliharaan',
  'Transportasi',
  'Lainnya',
];

export const EditBelanjaModal: React.FC<EditBelanjaModalProps> = ({
  transaction,
  dataSekolahList,
  onSaveEdit,
  onClose,
}) => {
  const [namaSekolah, setNamaSekolah] = useState(transaction.namaSekolah || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);

  const isCustomCategory = !CATEGORY_OPTIONS.includes(transaction.kategori || '');
  const [selectedCategory, setSelectedCategory] = useState(
    isCustomCategory ? 'Lainnya' : transaction.kategori || 'ATK'
  );
  const [customCategory, setCustomCategory] = useState(
    isCustomCategory ? transaction.kategori : ''
  );

  const [jumlahDisplay, setJumlahDisplay] = useState(
    transaction.jumlah ? formatNumberWithDots(transaction.jumlah) : ''
  );
  const [jumlahNumeric, setJumlahNumeric] = useState<number>(transaction.jumlah || 0);

  const [newFotoBase64, setNewFotoBase64] = useState('');
  const [fotoPreview, setFotoPreview] = useState(
    transaction.fotoNota ? getGoogleDriveDirectImageUrl(transaction.fotoNota) : ''
  );
  const [fotoFileName, setFotoFileName] = useState('');
  const [fotoMimeType, setFotoMimeType] = useState('image/jpeg');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter school recommendations
  useEffect(() => {
    if (namaSekolah.trim().length > 0) {
      const query = namaSekolah.toLowerCase().trim();
      const matches = dataSekolahList.filter((s) => s.toLowerCase().includes(query));
      setFilteredSchools(matches);
    } else {
      setFilteredSchools(dataSekolahList);
    }
  }, [namaSekolah, dataSekolahList]);

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const num = parseRupiahInput(rawValue);
    setJumlahNumeric(num);
    setJumlahDisplay(num ? formatNumberWithDots(num) : '');
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa foto/gambar (JPG, JPEG, PNG, WEBP).');
      return;
    }

    setErrorMsg('');
    setFotoMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewFotoBase64(base64);
      setFotoPreview(base64);

      const categoryToUse = selectedCategory === 'Lainnya' ? (customCategory || 'LAINNYA') : selectedCategory;
      const autoName = generateReceiptFileName(transaction.no, namaSekolah, categoryToUse);
      setFotoFileName(autoName);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalNamaSekolah = namaSekolah.trim();
    const finalKategori = selectedCategory === 'Lainnya' ? customCategory.trim() : selectedCategory;

    if (!finalNamaSekolah) {
      setErrorMsg('Nama Sekolah wajib diisi.');
      return;
    }
    if (!finalKategori) {
      setErrorMsg('Kategori Belanja wajib dipilih / diisi.');
      return;
    }
    if (!jumlahNumeric || jumlahNumeric <= 0) {
      setErrorMsg('Jumlah nominal belanja wajib diisi lebih dari 0.');
      return;
    }

    const autoFileName = newFotoBase64
      ? generateReceiptFileName(transaction.no, finalNamaSekolah, finalKategori)
      : '';

    try {
      setIsSaving(true);
      await onSaveEdit({
        no: transaction.no,
        namaSekolah: finalNamaSekolah,
        kategori: finalKategori,
        jumlah: jumlahNumeric,
        fotoBase64: newFotoBase64 || undefined,
        fileName: autoFileName || undefined,
        mimeType: fotoMimeType,
        existingFotoUrl: transaction.fotoNota || '',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memperbarui transaksi.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">EDIT TRANSAKSI #{transaction.no}</h3>
            <p className="text-xs text-slate-500 font-medium">Ubah data transaksi belanja sekolah</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. NAMA SEKOLAH */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              NAMA SEKOLAH <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={namaSekolah}
                onChange={(e) => {
                  setNamaSekolah(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ketik nama sekolah"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800"
              />
            </div>

            {showSuggestions && filteredSchools.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl divide-y divide-slate-100">
                {filteredSchools.map((school, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNamaSekolah(school);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
                  >
                    {school}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. KATEGORI BELANJA */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              KATEGORI BELANJA <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {selectedCategory === 'Lainnya' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Masukkan nama kategori khusus..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            )}
          </div>

          {/* 3. JUMLAH NOMINAL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              JUMLAH NOMINAL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={jumlahDisplay}
                onChange={handleJumlahChange}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 pl-11 pr-3.5 py-2.5 text-base font-bold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Format: {formatRupiah(jumlahNumeric)}
            </p>
          </div>

          {/* 4. FOTO NOTA */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              FOTO NOTA (Opsional ganti)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {fotoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white p-2">
                <img
                  src={fotoPreview}
                  alt="Preview Nota"
                  className="w-full h-44 object-contain rounded-xl bg-slate-950"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-semibold backdrop-blur-xs shadow-md transition"
                >
                  Ganti Foto Baru
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition text-center space-y-1"
              >
                <Camera className="w-6 h-6 text-blue-600" />
                <p className="text-xs font-bold text-slate-800">Pilih / Ambil Foto Nota Baru</p>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 text-sm font-bold shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>MENYIMPAN PERUBAHAN...</span>
                </>
              ) : (
                <span>SIMPAN PERUBAHAN</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
