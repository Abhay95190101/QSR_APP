import React, { useState, useRef, useEffect } from 'react';
import { StoreProfile, MenuItem, OrderRecord, LanguageCode } from '../../types';
import { OwnerDashboard } from './OwnerDashboard';
import { MenuManagement } from './MenuManagement';
import { OrderManager } from './OrderManager';
import { ReportsView } from './ReportsView';
import { StoreProfileSettings } from './StoreProfileSettings';
import { OwnerTableQRGenerator } from './OwnerTableQRGenerator';
import { RecentTableOrdersTab } from './RecentTableOrdersTab';
import { DayEndModal } from './DayEndModal';
import { StaffUserManager } from './StaffUserManager';
import { playOrderNotificationChime } from '../../utils/sound';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../../utils/i18n';
import { StaffUser } from '../../types';

interface OwnerPortalProps {
  storeProfile: StoreProfile;
  menuItems: MenuItem[];
  categories: string[];
  orders: OrderRecord[];
  staffUsers?: StaffUser[];
  onUpdateStaffUsers?: (users: StaffUser[]) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onUpdateStoreProfile: (profile: StoreProfile) => void;
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onAddItem?: (item: MenuItem) => void;
  onAddMenuItem?: (item: MenuItem) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onRemoveMenuItem: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: any) => void;
  onModifyBill: (orderId: string, discount: number, serviceCharge: number, notes?: string) => void;
  onSettleBill: (orderId: string, method: any) => void;
  onRefreshOrders: () => void;
  onSimulateCustomerScan: (tableNumber: number, zone: string) => void;
  onLockPortal?: () => void;
  onShowToast: (msg: string) => void;
}

export type OwnerTab = 'home' | 'orders' | 'recent-orders' | 'menu' | 'qr' | 'reports' | 'profile' | 'staff';

export const OwnerPortal: React.FC<OwnerPortalProps> = ({
  storeProfile,
  menuItems,
  categories,
  orders,
  staffUsers = [],
  onUpdateStaffUsers = () => {},
  currentLanguage,
  onSelectLanguage,
  onUpdateStoreProfile,
  onAddCategory,
  onRemoveCategory,
  onAddItem,
  onAddMenuItem,
  onUpdateMenuItem,
  onRemoveMenuItem,
  onToggleAvailability,
  onUpdateOrderStatus,
  onModifyBill,
  onSettleBill,
  onRefreshOrders,
  onSimulateCustomerScan,
  onLockPortal,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<OwnerTab>('home');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true); // 3-line menu bar toggle
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState<boolean>(false);
  const [showDayEndModal, setShowDayEndModal] = useState<boolean>(false);

  // Zoom Level State (75% to 130%)
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const saved = localStorage.getItem('sb_app_zoom');
    return saved ? parseInt(saved, 10) : 100;
  });

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.min(130, Math.max(75, prev + delta));
      localStorage.setItem('sb_app_zoom', next.toString());
      onShowToast(`Zoom: ${next}%`);
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
    localStorage.setItem('sb_app_zoom', '100');
    onShowToast('Zoom reset to 100%');
  };

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Deduplicate orders by ID to guarantee unique React keys in notifications flyout
  const pendingOrders = Array.from(
    new Map(
      orders
        .filter((o) => o.status === 'received' || o.status === 'preparing')
        .map((o) => [o.id, o])
    ).values()
  );
  const pendingCount = pendingOrders.length;

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const navItems = [
    { id: 'home' as OwnerTab, label: t.home, icon: 'home' },
    { id: 'orders' as OwnerTab, label: t.orderAndKitchen, icon: 'outdoor_grill', badge: pendingCount },
    { id: 'recent-orders' as OwnerTab, label: 'Recent Table Orders', icon: 'table_restaurant' },
    { id: 'menu' as OwnerTab, label: t.menuAndItems, icon: 'lunch_dining' },
    { id: 'qr' as OwnerTab, label: t.qrGenerator, icon: 'qr_code_2' },
    { id: 'reports' as OwnerTab, label: t.reports, icon: 'bar_chart' },
    { id: 'profile' as OwnerTab, label: t.profile, icon: 'storefront' },
    { id: 'staff' as OwnerTab, label: 'Staff & Managers', icon: 'badge' },
  ];

  return (
    <div
      className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col justify-between selection:bg-primary-fixed selection:text-on-primary-fixed transition-all"
      style={{ zoom: `${zoomLevel}%` }}
    >
      {/* Sticky Top Header (Optimized for Mobile & Desktop) */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-black/[0.06] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          {/* Main Top Header Bar */}
          <div className="h-16 flex items-center justify-between gap-1.5 sm:gap-3">
            {/* Left: Three Line Menu Button + Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {/* Three-line menu hamburger button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Toggle Menu Options"
                aria-label="Toggle navigation menu"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  isMenuOpen
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                  {isMenuOpen ? 'menu_open' : 'menu'}
                </span>
              </button>

              {/* Restaurant Logo & Name */}
              <div
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-container p-1 border border-black/5 flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                  <img
                    src={storeProfile.logoUrl}
                    alt={storeProfile.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-headline-md text-xs sm:text-sm md:text-base text-on-surface font-black truncate max-w-[105px] xs:max-w-[140px] sm:max-w-[180px] md:max-w-none">
                      {storeProfile.name}
                    </h1>
                    <span className="hidden md:inline-block px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[8px] font-black uppercase">
                      Owner
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-on-surface-variant truncate hidden sm:block">
                    {storeProfile.currencySymbol} INR • {storeProfile.tagline || storeProfile.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Upper Right Corner Controls: Zoom, Language, Day End, Home, Notifications & Quick Actions */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              {/* ZOOM CONTROLLER (Zoom In / Out / Reset) */}
              <div className="flex items-center bg-surface-container rounded-xl p-0.5 border border-black/5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleZoom(-10)}
                  title="Zoom Out (-10%)"
                  disabled={zoomLevel <= 75}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-on-surface disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] sm:text-[17px]">zoom_out</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Click to reset zoom to 100%"
                  className="px-1 sm:px-1.5 text-[10px] sm:text-[11px] font-mono hover:text-primary transition-colors select-none"
                >
                  {zoomLevel}%
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(10)}
                  title="Zoom In (+10%)"
                  disabled={zoomLevel >= 130}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-on-surface disabled:opacity-30 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px] sm:text-[17px]">zoom_in</span>
                </button>
              </div>

              {/* MANUAL DAY END BUTTON IN HEADER */}
              <button
                type="button"
                onClick={() => setShowDayEndModal(true)}
                title="Perform Manual Day End Settlement & Page Refresh"
                className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/20 text-xs font-black flex items-center gap-1 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-800">nightlight_round</span>
                <span className="hidden lg:inline text-[11px]">Day End</span>
              </button>

              {/* LANGUAGE SELECTOR BUTTON */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  title="Change Language"
                  className={`px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
                    isLanguageMenuOpen
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px] sm:text-[17px]">translate</span>
                  <span className="text-[11px] sm:text-xs">{currentLangObj.nativeLabel}</span>
                  <span className="material-symbols-outlined text-[13px]">expand_more</span>
                </button>

                {/* Language Dropdown Menu */}
                {isLanguageMenuOpen && (
                  <div className="absolute right-0 top-11 w-44 bg-surface-container-lowest rounded-2xl shadow-xl border border-black/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                      Select Language (भाषा)
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          onSelectLanguage(lang.code);
                          setIsLanguageMenuOpen(false);
                          onShowToast(`Language switched to ${lang.nativeLabel}`);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                          currentLanguage === lang.code
                            ? 'bg-primary/10 text-primary font-black'
                            : 'hover:bg-surface-container text-on-surface'
                        }`}
                      >
                        <span>{lang.nativeLabel}</span>
                        <span className="text-[10px] text-on-surface-variant font-mono">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Home Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('home');
                  onShowToast('Home Dashboard');
                }}
                title="Home Dashboard"
                className={`w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeTab === 'home'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">home</span>
                <span className="hidden md:inline">{t.home}</span>
              </button>

              {/* Notifications Button (Decreased compact flyout panel) */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  title="Notifications & Alerts"
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all relative ${
                    isNotificationsOpen
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px] sm:text-[19px]">notifications</span>
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-error text-on-error font-black text-[9px] sm:text-[10px] flex items-center justify-center border-2 border-white animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATIONS FLYOUT PANEL (Decreased size as requested) */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 top-11 w-64 sm:w-72 bg-surface-container-lowest rounded-2xl shadow-2xl border border-black/10 p-2.5 sm:p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-black/[0.04] pb-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-base">notifications</span>
                        <h4 className="font-headline-md text-xs font-black uppercase text-on-surface">
                          {t.notifications}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live" />
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-bold">
                          {pendingCount} {t.pending}
                        </span>
                      </div>
                    </div>

                    {/* Quick Ring Test Button for Owner */}
                    <div className="mb-1.5 p-1.5 rounded-xl bg-surface-container/40 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-emerald-600">volume_up</span>
                        Chime Active
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playOrderNotificationChime();
                          onShowToast('🔔 Playing restaurant order chime test...');
                        }}
                        className="px-2 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[10px] flex items-center gap-1 border border-black/5"
                      >
                        <span className="material-symbols-outlined text-[12px]">notifications_active</span>
                        Test
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {pendingOrders.length > 0 ? (
                        pendingOrders.map((ord) => (
                          <div
                            key={ord.id}
                            onClick={() => {
                              setActiveTab('orders');
                              setIsNotificationsOpen(false);
                            }}
                            className="p-2 rounded-xl bg-surface-container/60 hover:bg-surface-container cursor-pointer transition-colors border border-black/[0.03]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[11px] text-on-surface">
                                🔔 Table #{ord.tableNumber} - {ord.orderNumber}
                              </span>
                              <span className="text-[9px] text-primary font-bold">
                                {ord.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant mt-0.5 truncate">
                              {(ord.items || []).map((i) => `${i?.quantity || 1}x ${i?.name || 'Item'}`).join(', ')}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-on-surface-variant text-[11px]">
                          <span className="material-symbols-outlined text-xl text-emerald-600 block mb-0.5">
                            check_circle
                          </span>
                          {t.allCaughtUp}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-black/[0.04] mt-1.5 flex justify-between items-center text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('orders');
                          setIsNotificationsOpen(false);
                        }}
                        className="text-primary font-bold hover:underline"
                      >
                        {t.orderAndKitchen} →
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-on-surface-variant hover:text-on-surface text-[10px]"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Customer Test Button */}
              <button
                type="button"
                onClick={() => onSimulateCustomerScan(1, 'Main Dining Room')}
                title="Preview customer Menu QR view"
                className="w-8 h-8 sm:w-auto px-2 sm:px-2.5 py-1.5 rounded-xl bg-secondary-container hover:bg-secondary hover:text-white text-on-secondary-container text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">phone_android</span>
                <span className="hidden xl:inline text-[11px]">{t.testCustomerView}</span>
              </button>

              {onLockPortal && (
                <button
                  type="button"
                  onClick={onLockPortal}
                  title="Lock Owner Portal"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-error flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                </button>
              )}
            </div>
          </div>

          {/* Three-Line Menu Horizontal List Bar (Touch Smooth on Mobile) */}
          {isMenuOpen && (
            <div className="py-2 border-t border-black/[0.04] flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth animate-in fade-in duration-200">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all flex-shrink-0 ${
                    activeTab === item.id
                      ? 'bg-primary text-on-primary shadow-xs font-extrabold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] sm:text-[17px]">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white text-primary text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20">
        {activeTab === 'home' && (
          <OwnerDashboard
            storeProfile={storeProfile}
            orders={orders}
            menuItems={menuItems}
            onNavigateTab={setActiveTab}
            onSimulateCustomerScan={onSimulateCustomerScan}
            onShowToast={onShowToast}
            onUpdateStatus={onUpdateOrderStatus}
            onModifyBill={onModifyBill}
            onSettleBill={onSettleBill}
          />
        )}

        {activeTab === 'orders' && (
          <OrderManager
            orders={orders}
            storeProfile={storeProfile}
            onUpdateStatus={onUpdateOrderStatus}
            onModifyBill={onModifyBill}
            onSettleBill={onSettleBill}
            onRefreshOrders={onRefreshOrders}
            onShowToast={onShowToast}
          />
        )}

        {/* Dedicated Recent Table Orders Tab */}
        {activeTab === 'recent-orders' && (
          <RecentTableOrdersTab
            orders={orders}
            storeProfile={storeProfile}
            onUpdateStatus={onUpdateOrderStatus}
            onModifyBill={onModifyBill}
            onSettleBill={onSettleBill}
            onShowToast={onShowToast}
            onSimulateCustomerScan={onSimulateCustomerScan}
          />
        )}

        {activeTab === 'menu' && (
          <MenuManagement
            categories={categories}
            items={menuItems}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
            onAddItem={onAddItem || onAddMenuItem!}
            onUpdateItem={onUpdateMenuItem}
            onRemoveItem={onRemoveMenuItem}
            onToggleAvailability={onToggleAvailability}
            currency={storeProfile.currencySymbol}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'qr' && (
          <OwnerTableQRGenerator
            storeProfile={storeProfile}
            onShowToast={onShowToast}
            onSimulateCustomerScan={onSimulateCustomerScan}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            orders={orders}
            storeProfile={storeProfile}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'profile' && (
          <StoreProfileSettings
            profile={storeProfile}
            onUpdateProfile={onUpdateStoreProfile}
            staffUsers={staffUsers}
            onUpdateStaffUsers={onUpdateStaffUsers}
            onShowToast={onShowToast}
          />
        )}

        {activeTab === 'staff' && (
          <StaffUserManager
            storeProfile={storeProfile}
            staffUsers={staffUsers}
            onUpdateStaffUsers={onUpdateStaffUsers}
            onShowToast={onShowToast}
          />
        )}
      </main>

      {/* Manual Day End Closing Modal */}
      <DayEndModal
        isOpen={showDayEndModal}
        onClose={() => setShowDayEndModal(false)}
        orders={orders}
        storeProfile={storeProfile}
        onShowToast={onShowToast}
      />

      {/* Clean Footer */}
      <footer className="border-t border-black/[0.04] bg-surface-container-lowest py-3 px-4 sm:px-6 text-center text-xs text-on-surface-variant flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <img src={storeProfile.logoUrl} alt="Logo" className="w-5 h-5 object-contain" />
          <span className="font-bold text-on-surface">{storeProfile.name}</span>
          <span>• Single Owner App ({storeProfile.currencySymbol} INR)</span>
        </div>
        <span>Digital Contactless QR Ordering &amp; Live Kitchen Management</span>
      </footer>
    </div>
  );
};
