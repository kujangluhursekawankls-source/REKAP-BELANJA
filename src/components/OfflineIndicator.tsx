import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white shadow-xl animate-bounce">
      <WifiOff className="w-5 h-5 shrink-0" />
      <span>Mode Offline — Koneksi internet terputus. Data lokal akan disinkronkan saat terhubung kembali.</span>
    </div>
  );
};
