import React, { useState } from 'react';
import { StoreProfile } from '../types';

interface QRScanGatewayProps {
  storeProfile: StoreProfile;
  onSelectTable: (tableNum: number, zone: string) => void;
  onOwnerLogin: (pin: string) => boolean;
  onShowToast: (msg: string) => void;
}

export const QRScanGateway: React.FC<QRScanGatewayProps> = ({
  storeProfile,
  onSelectTable,
  onOwnerLogin,
  onShowToast,
}) => {
  const [showStaffPinModal, setShowStaffPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const sampleTables = [
    { num: 1, zone: 'Main Dining Room' },
    { num: 2, zone: 'Main Dining Room' },
    { num: 3, zone: 'Outdoor Patio Terrace' },
    { num: 4, zone: 'Main Dining Room' },
    { num: 5, zone: 'Ember Bar & High-Top' },
    { num: 6, zone: 'Booth Row A' },
    { num: 7, zone: 'Private Event Nook' },
    { num: 8, zone: 'Outdoor Patio Terrace' },
  ];

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    const success = onOwnerLogin(enteredPin);
    if (!success) {
      setPinError('Incorrect Passcode. Please check PIN in Store Profile.');
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col justify-between max-w-xl mx-auto p-4 md:p-6 shadow-2xl relative">
      {/* Brand Header */}
      <header className="flex flex-col items-center text-center pt-8 pb-4">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-3xl bg-surface-container-high flex items-center justify-center p-3 shadow-md border border-black/[0.05]">
            <img
              src={storeProfile.logoUrl}
              alt={storeProfile.name}
              className="w-full h-full object-contain animate-bounce"
              style={{ animationDuration: '3s' }}
            />
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
            ✓
          </span>
        </div>

        <h1 className="font-headline-md text-2xl text-on-surface font-black tracking-tight">
          {storeProfile.name}
        </h1>
        <p className="font-body-sm text-xs text-on-surface-variant max-w-xs mt-1">
          {storeProfile.tagline}
        </p>
      </header>

      {/* Main Dining QR Instruction Card */}
      <div className="space-y-6 flex-1 flex flex-col justify-center py-4">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-black/[0.05] text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[36px]">qr_code_scanner</span>
          </div>

          <div>
            <h2 className="font-headline-md text-lg text-on-surface font-extrabold">
              Dining In? Scan Table QR to Order
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Customers access our digital menu exclusively by scanning the QR code placed on their dining table tent.
            </p>
          </div>

          {/* Quick steps */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/[0.04] text-left">
            <div className="p-2.5 rounded-xl bg-surface-container/60">
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-extrabold flex items-center justify-center mb-1">
                1
              </span>
              <p className="font-label-sm text-[11px] font-bold text-on-surface">Scan QR</p>
              <p className="text-[10px] text-on-surface-variant">Point camera at table tent</p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container/60">
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-extrabold flex items-center justify-center mb-1">
                2
              </span>
              <p className="font-label-sm text-[11px] font-bold text-on-surface">Order Food</p>
              <p className="text-[10px] text-on-surface-variant">Live kitchen status tracking</p>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container/60">
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-extrabold flex items-center justify-center mb-1">
                3
              </span>
              <p className="font-label-sm text-[11px] font-bold text-on-surface">Pay Online</p>
              <p className="text-[10px] text-on-surface-variant">Instant UPI QR or cash</p>
            </div>
          </div>
        </div>

        {/* Simulator for Testing without physical QR camera */}
        <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-black/[0.05] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">smartphone</span>
              <h3 className="font-headline-md text-xs uppercase font-extrabold tracking-wider text-on-surface-variant">
                Simulate Dining Table QR Scan
              </h3>
            </div>
            <span className="text-[10px] bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full font-bold">
              Instant Preview
            </span>
          </div>

          <p className="font-body-sm text-xs text-on-surface-variant">
            Tap a table below to simulate opening the menu as a seated customer:
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {sampleTables.map((t) => (
              <button
                key={t.num}
                onClick={() => {
                  onSelectTable(t.num, t.zone);
                  onShowToast(`Scanned Table #${t.num} (${t.zone})`);
                }}
                className="py-2.5 px-2 rounded-xl bg-surface-container hover:bg-primary hover:text-white text-on-surface text-xs font-bold border border-black/[0.03] transition-all text-center flex flex-col items-center justify-center gap-0.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">restaurant</span>
                <span>Table #{t.num}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff & Owner Access Footer */}
      <footer className="pt-4 pb-2 border-t border-black/[0.05] flex items-center justify-between text-xs text-on-surface-variant">
        <span className="text-[11px]">{storeProfile.address}</span>
        <button
          onClick={() => {
            setEnteredPin('');
            setPinError(null);
            setShowStaffPinModal(true);
          }}
          className="text-[11px] font-bold text-on-surface-variant hover:text-primary flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[13px]">lock</span>
          <span>Staff &amp; Owner Login</span>
        </button>
      </footer>

      {/* Staff PIN Verification Modal */}
      {showStaffPinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-black/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                <span>Owner &amp; Staff Verification</span>
              </div>
              <button
                onClick={() => setShowStaffPinModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                ✕
              </button>
            </div>

            <p className="font-body-sm text-xs text-on-surface-variant">
              Please enter your 4-digit Management Passcode to open the Owner Portal.
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={8}
                  autoFocus
                  required
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="Enter PIN (e.g. 1234)"
                  className="w-full text-center text-2xl tracking-[0.4em] py-3.5 px-4 rounded-2xl bg-surface-container font-mono font-bold text-on-surface outline-none border border-black/10 focus:border-primary"
                />
                {pinError ? (
                  <p className="text-xs text-error font-medium mt-1.5 text-center">{pinError}</p>
                ) : (
                  <p className="text-[11px] text-on-surface-variant/80 mt-1 text-center">
                    Default PIN: <strong className="text-on-surface">1234</strong>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowStaffPinModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-surface-container text-xs font-bold text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-sm"
                >
                  Unlock Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
