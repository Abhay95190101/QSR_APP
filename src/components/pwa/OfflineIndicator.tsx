import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/60 shadow-xl text-xs font-semibold text-on-surface">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
          </span>
          <WifiOff className="w-3.5 h-3.5 text-error" />
          <span>Offline Mode Active • Saved Locally</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-green-900/90 backdrop-blur-md border border-green-500/40 shadow-xl text-xs font-semibold text-white">
          <Wifi className="w-3.5 h-3.5 text-green-400" />
          <span>Connection Restored • Synced</span>
        </div>
      )}
    </div>
  );
};
