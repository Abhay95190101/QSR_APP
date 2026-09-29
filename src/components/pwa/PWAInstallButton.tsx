import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { MobileApkCenterModal } from './MobileApkCenterModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'floating' | 'banner' | 'compact';
  onShowToast?: (msg: string) => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  onShowToast = () => {},
}) => {
  const { isInstallable, isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState<boolean>(false);

  if (isInstalled && variant !== 'header') {
    return null;
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
            isInstalled
              ? 'bg-green-600/10 text-green-700 border border-green-500/30'
              : 'bg-primary text-white hover:bg-primary-container active:scale-95 shadow-primary/20'
          } ${className}`}
          title="Install App / Get APK"
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Installed</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Get App / APK</span>
            </>
          )}
        </button>

        <MobileApkCenterModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onShowToast={onShowToast}
        />
      </>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white font-bold text-xs shadow-xl hover:bg-primary-container transition-all active:scale-95 shadow-primary/30 border border-white/20 ${className}`}
          aria-label="Install Mobile App"
        >
          <Smartphone className="w-4 h-4" />
          <span>Mobile App / APK</span>
        </button>

        <MobileApkCenterModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onShowToast={onShowToast}
        />
      </>
    );
  }

  // Default 'header' variant
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
          isInstalled
            ? 'bg-green-500/10 text-green-700 border-green-500/30'
            : 'bg-surface-container-high hover:bg-surface-container-highest text-primary border-outline-variant/40 hover:border-primary/40'
        } ${className}`}
        title="Install Mobile App / Download APK"
      >
        <Smartphone className="w-3.5 h-3.5 text-primary" />
        <span>Get Mobile APK</span>
      </button>

      <MobileApkCenterModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onShowToast={onShowToast}
      />
    </>
  );
};
