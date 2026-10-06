import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  no: number;
  schoolName: string;
  onConfirmDelete: () => Promise<void>;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  no,
  schoolName,
  onConfirmDelete,
  onClose,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setErrorMsg('');
      await onConfirmDelete();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus transaksi.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        
        {/* Icon & Title */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Transaksi</h3>
              <p className="text-xs text-slate-500">Konfirmasi Hapus Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Apakah Anda yakin ingin menghapus <strong className="text-slate-900">Transaksi #{no}</strong> ({schoolName})?
          </p>
          <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Tindakan ini tidak dapat dibatalkan:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5 pl-1">
              <li>Baris transaksi di Google Sheets akan dihapus.</li>
              <li>File foto nota di Google Drive akan dipindahkan ke Sampah.</li>
            </ul>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
            {errorMsg}
          </p>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white py-2.5 text-xs font-bold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>MENGHAPUS...</span>
              </>
            ) : (
              <span>YA, HAPUS</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
