import React, { useState } from 'react';
import { LOGO_URL, AVATAR_URL } from '../data/menu';
import { FulfillmentMode } from '../types';
import { PWAInstallButton } from './pwa/PWAInstallButton';
import { MobileApkCenterModal } from './pwa/MobileApkCenterModal';

interface HeaderProps {
  fulfillmentMode: FulfillmentMode;
  tableNumber?: number;
  onOpenQRGenerator: () => void;
  onSelectTab: (tab: string) => void;
  flamePoints: number;
}

export const Header: React.FC<HeaderProps> = ({
  fulfillmentMode,
  tableNumber,
  onOpenQRGenerator,
  onSelectTab,
  flamePoints,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);

  const getModeLabel = () => {
    if (fulfillmentMode === 'dine-in' && tableNumber) {
      return `Table #${tableNumber}`;
    }
    switch (fulfillmentMode) {
      case 'curbside':
        return 'Curbside';
      case 'delivery':
        return 'Delivery';
      case 'dine-in':
        return 'Dine-In';
      case 'pickup':
      default:
        return 'Pickup';
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(30,27,25,0.04)] transition-all">
        <div className="h-20 px-margin flex items-center justify-between gap-space-sm max-w-xl mx-auto">
          {/* Logo & Store Location */}
          <div 
            className="flex items-center gap-space-sm min-w-0 flex-1 cursor-pointer"
            onClick={() => onSelectTab('home')}
          >
            <img
              alt="Sizzle & Bun Logo"
              className="h-8 w-auto object-contain flex-shrink-0"
              src={LOGO_URL}
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-lg text-label-lg text-on-surface truncate">
                  Sizzle &amp; Bun
                </span>
                <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase flex-shrink-0">
                  {getModeLabel()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm truncate">
                <span className="material-symbols-outlined text-[14px] text-primary flex-shrink-0">
                  location_on
                </span>
                <span className="truncate">
                  {fulfillmentMode === 'dine-in' && tableNumber
                    ? `Dine-In Table #${tableNumber} • Flattop Griddle Line`
                    : 'Downtown - 4th & Main • 8-12 min prep'}
                </span>
              </div>
            </div>
          </div>

          {/* Action icons: Mobile App/APK, Table QR Generator & Profile */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Mobile App / APK Button */}
            <PWAInstallButton variant="header" />

            {/* Quick Dine-In Table QR Button */}
            <button
              onClick={onOpenQRGenerator}
              title="Table Menu QR Generator"
              className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex items-center gap-1 text-on-surface text-xs font-semibold shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                qr_code_2
              </span>
              <span className="hidden sm:inline">Table QR</span>
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => setShowProfileModal(true)}
              aria-label="User Profile"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                src={AVATAR_URL}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                alt="Profile"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-primary"
                src={AVATAR_URL}
              />
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Priya Sharma</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
                  <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                  Sizzle Club VIP Tier
                </span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 mb-4">
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant mb-1">
                <span>Current Rewards Balance</span>
                <span className="text-primary font-bold">{flamePoints} Flame Pts</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary-container to-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (flamePoints / 500) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5">
                {Math.max(0, 500 - flamePoints)} pts to Free Crispy Truffle Fries reward!
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {/* Mobile App & APK Button in Profile */}
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setShowApkModal(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-sm transition-colors text-left border border-primary/20"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">smartphone</span>
                  <span className="font-bold">📱 Get Mobile App &amp; APK</span>
                </div>
                <span className="material-symbols-outlined text-primary text-[16px]">chevron_right</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onSelectTab('live-order');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">moped</span>
                  <span className="font-medium">Active Kitchen Tracker</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onSelectTab('curbside');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">directions_car</span>
                  <span className="font-medium">Curbside Stall Check-in</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onSelectTab('rating');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">star</span>
                  <span className="font-medium">Order Feedback &amp; Crew Tip</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">chevron_right</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onOpenQRGenerator();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed text-sm transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">qr_code</span>
                  <span className="font-bold">Dining Table QR Generator</span>
                </div>
                <span className="material-symbols-outlined text-primary text-[16px]">chevron_right</span>
              </button>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-2.5 rounded-full bg-on-background text-on-primary font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all text-center"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* APK & Mobile Center Modal */}
      <MobileApkCenterModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        onShowToast={() => {}}
      />
    </>
  );
};

