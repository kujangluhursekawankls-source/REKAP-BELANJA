import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Camera, Check, AlertCircle, Building2, Tag, DollarSign, Image as ImageIcon, Calendar } from 'lucide-react';
import { formatNumberWithDots, parseRupiahInput, generateReceiptFileName, formatRupiah } from '../utils/googleDrive';

interface TambahBelanjaModalProps {
  dataSekolahList: string[];
  nextNo: number;
  onSave: (payload: {
    namaSekolah: string;
    kategori: string;
    jumlah: number;
    fotoBase64: string;
    fileName: string;
    mimeType: string;
    tanggal?: string;
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

export const TambahBelanjaModal: React.FC<TambahBelanjaModalProps> = ({
  dataSekolahList,
  nextNo,
  onSave,
  onClose,
}) => {
  const [namaSekolah, setNamaSekolah] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(todayStr);

  const [selectedCategory, setSelectedCategory] = useState('ATK');
  const [customCategory, setCustomCategory] = useState('');

  const [jumlahDisplay, setJumlahDisplay] = useState('');
  const [jumlahNumeric, setJumlahNumeric] = useState<number>(0);

  const [fotoBase64, setFotoBase64] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [fotoFileName, setFotoFileName] = useState('');
  const [fotoMimeType, setFotoMimeType] = useState('image/jpeg');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const schoolInputRef = useRef<HTMLInputElement>(null);

  // Filter school recommendations based on user text input
  useEffect(() => {
    if (namaSekolah.trim().length > 0) {
      const query = namaSekolah.toLowerCase().trim();
      const matches = dataSekolahList.filter((s) => s.toLowerCase().includes(query));
      setFilteredSchools(matches);
    } else {
      setFilteredSchools(dataSekolahList);
    }
  }, [namaSekolah, dataSekolahList]);

  // Handle Rupiah Amount Input
  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const num = parseRupiahInput(rawValue);
    setJumlahNumeric(num);
    setJumlahDisplay(num ? formatNumberWithDots(num) : '');
  };

  // Handle Photo File Selection
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
      setFotoBase64(base64);
      setFotoPreview(base64);

      // Auto generate filename: NO_NAMA_SEKOLAH_KATEGORI_TANGGAL.jpg
      const categoryToUse = selectedCategory === 'Lainnya' ? (customCategory || 'LAINNYA') : selectedCategory;
      const autoName = generateReceiptFileName(nextNo, namaSekolah, categoryToUse, tanggal);
      setFotoFileName(autoName);
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  const triggerGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalNamaSekolah = namaSekolah.trim();
    const finalKategori = selectedCategory === 'Lainnya' ? customCategory.trim() : selectedCategory;

    // STEP 1: Validation
    if (!finalNamaSekolah) {
      setErrorMsg('Nama Sekolah wajib diisi.');
      return;
    }
    if (!tanggal) {
      setErrorMsg('Tanggal Transaksi wajib diisi.');
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
    if (!fotoBase64) {
      setErrorMsg('Foto Nota wajib dipilih / diambil foto.');
      return;
    }

    const categoryToUse = finalKategori;
    const autoFileName = generateReceiptFileName(nextNo, finalNamaSekolah, categoryToUse, tanggal);

    try {
      setIsSaving(true);
      await onSave({
        namaSekolah: finalNamaSekolah,
        kategori: finalKategori,
        jumlah: jumlahNumeric,
        tanggal,
        fotoBase64,
        fileName: autoFileName,
        mimeType: fotoMimeType,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan transaksi belanja.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">+ TAMBAH BELANJA</h3>
            <p className="text-xs text-slate-500 font-medium">Transaksi Belanja Sekolah #{nextNo}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. NAMA SEKOLAH - MANUAL INPUT WITH AUTOCOMPLETE */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              NAMA SEKOLAH <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                ref={schoolInputRef}
                type="text"
                value={namaSekolah}
                onChange={(e) => {
                  setNamaSekolah(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Ketik nama sekolah (misal: SDN 01 Jakarta)"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* School Recommendations Autocomplete Dropdown */}
            {showSuggestions && filteredSchools.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl divide-y divide-slate-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  Rekomendasi dari DATA-SEKOLAH (Bisa pilih atau ketik manual)
                </div>
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
            <p className="mt-1 text-[11px] text-slate-500">
              Anda bebas mengetik nama sekolah apa saja walaupun tidak ada di daftar.
            </p>
          </div>

          {/* 2. TANGGAL TRANSAKSI */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              TANGGAL TRANSAKSI <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {tanggal ? new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Pilih tanggal belanja'}
            </p>
          </div>

          {/* 3. KATEGORI BELANJA */}
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
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
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
              Format UI: {formatRupiah(jumlahNumeric)} (Disimpan sebagai angka: {jumlahNumeric})
            </p>
          </div>

          {/* 4. FOTO NOTA & PREVIEW */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              FOTO NOTA <span className="text-rose-500">*</span>
            </label>

            {/* Hidden Input 1: Kamera HP (Capture environment untuk direct kamera HP) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* Hidden Input 2: Galeri HP (Mencegah buka kamera langsung, buka galeri/file manager) */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {!fotoPreview ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Button 1: Galeri HP */}
                  <button
                    type="button"
                    onClick={triggerGallery}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-100/80 active:scale-95 transition text-center space-y-1.5 group cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-blue-900">🖼️ GALERI HP</p>
                      <p className="text-[10px] font-semibold text-blue-600 mt-0.5">Pilih Foto dari Galeri</p>
                    </div>
                  </button>

                  {/* Button 2: Kamera HP */}
                  <button
                    type="button"
                    onClick={triggerCamera}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80 active:scale-95 transition text-center space-y-1.5 group cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs group-hover:scale-105 transition">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800">📸 KAMERA HP</p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Foto Langsung</p>
                    </div>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 text-center">
                  Format yang didukung: JPG, JPEG, PNG, WEBP
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white p-2">
                <img
                  src={fotoPreview}
                  alt="Preview Nota"
                  className="w-full h-48 object-contain rounded-xl bg-slate-950"
                />
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={triggerGallery}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-md transition cursor-pointer"
                  >
                    🖼️ Galeri
                  </button>
                  <button
                    type="button"
                    onClick={triggerCamera}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold shadow-md transition cursor-pointer"
                  >
                    📸 Kamera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFotoBase64('');
                      setFotoPreview('');
                    }}
                    className="p-1 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition"
                    title="Hapus Foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-2 text-center text-xs font-medium text-slate-300 truncate">
                  {fotoFileName || 'Foto Nota Siap Diupload'}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 text-sm font-bold shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <span>SIMPAN BELANJA</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
