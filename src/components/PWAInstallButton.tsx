import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download } from 'lucide-react';
import { PWAInstallModal } from './PWAInstallModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-2.5 sm:px-3 py-1.5 text-xs font-black shadow-md shadow-rose-600/25 transition-all"
        title="Install Aplikasi CV ARZLAN ADYATAMA di HP"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install App</span>
      </button>

      {showModal && (
        <PWAInstallModal forceOpen={true} onCloseModal={() => setShowModal(false)} />
      )}
    </>
  );
};
