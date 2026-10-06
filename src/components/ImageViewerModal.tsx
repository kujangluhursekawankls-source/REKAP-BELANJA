import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { getGoogleDriveDirectImageUrl } from '../utils/googleDrive';

interface ImageViewerModalProps {
  imageUrl: string;
  title?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  title = 'Foto Nota Belanja',
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [hasError, setHasError] = useState(false);

  const directUrl = getGoogleDriveDirectImageUrl(imageUrl);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm sm:text-base font-semibold text-white truncate max-w-[200px] sm:max-w-md">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                title="Buka File Asli di Google Drive"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buka di Google Drive</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-950/50 border-b border-slate-800/60 shrink-0 text-slate-300">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Perkecil"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-medium px-2 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Perbesar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition ml-2"
            title="Reset Ukuran"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Image Content Container */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[300px] max-h-[75vh] bg-slate-950/40">
          {hasError ? (
            <div className="text-center p-6 space-y-3">
              <p className="text-sm text-slate-400">Gambar nota tidak dapat dimuat secara langsung.</p>
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                <ExternalLink className="w-4 h-4" />
                Lihat di Google Drive
              </a>
            </div>
          ) : (
            <div
              className="transition-transform duration-200 ease-out origin-center flex items-center justify-center"
              style={{ transform: `scale(${scale})` }}
            >
              <img
                src={directUrl}
                alt={title}
                onError={() => setHasError(true)}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="py-2.5 px-4 bg-slate-900 border-t border-slate-800/80 text-center text-xs text-slate-400 shrink-0">
          Klik tombol Buka di Google Drive jika memerlukan pratinjau asli spreadsheet.
        </div>

      </div>
    </div>
  );
};
