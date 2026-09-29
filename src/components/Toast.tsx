import React from 'react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 font-label-md text-label-md z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 pointer-events-auto"
      style={{ maxWidth: '90vw' }}
    >
      <span className="material-symbols-outlined text-secondary-container text-[18px]">
        check_circle
      </span>
      <span className="truncate">{message}</span>
    </div>
  );
};
