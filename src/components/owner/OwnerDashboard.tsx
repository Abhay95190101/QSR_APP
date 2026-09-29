import React, { useState } from 'react';
import { StoreProfile, OrderRecord, MenuItem } from '../../types';
import { RecentTableOrdersTab } from './RecentTableOrdersTab';
import { DayEndModal } from './DayEndModal';
import { MobileApkCenterModal } from '../pwa/MobileApkCenterModal';

interface OwnerDashboardProps {
  storeProfile: StoreProfile;
  orders: OrderRecord[];
  menuItems: MenuItem[];
  onNavigateTab: (tab: 'home' | 'orders' | 'recent-orders' | 'menu' | 'qr' | 'reports' | 'profile') => void;
  onSimulateCustomerScan: (tableNumber: number, zone: string) => void;
  onShowToast: (msg: string) => void;
  onUpdateStatus?: (orderId: string, status: any) => void;
  onModifyBill?: (orderId: string, discount: number, serviceCharge: number, notes?: string) => void;
  onSettleBill?: (orderId: string, method: any) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  storeProfile,
  orders,
  menuItems,
  onNavigateTab,
  onSimulateCustomerScan,
  onShowToast,
  onUpdateStatus = () => {},
  onModifyBill = () => {},
  onSettleBill = () => {},
}) => {
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'recent-orders'>('overview');
  const [showDayEndModal, setShowDayEndModal] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);

  const settledOrders = (orders || []).filter((o) => o && o.status === 'settled');
  const activeOrders = (orders || []).filter((o) => o && o.status !== 'settled');
  const totalRevenue = settledOrders.reduce((sum, o) => sum + (o?.bill?.total || 0), 0);
  const avgTicket = settledOrders.length > 0 ? totalRevenue / settledOrders.length : 0;
  const availableItemsCount = (menuItems || []).filter((m) => m && m.isAvailable).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner & Quick Controls */}
      <div className="bg-surface-container-lowest p-5 rounded-3xl shadow-xs border border-black/[0.04] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface-container p-1.5 shadow-xs border border-black/5 flex items-center justify-center flex-shrink-0">
            <img
              src={storeProfile.logoUrl}
              alt={storeProfile.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-base sm:text-lg text-on-surface font-black truncate">
                {storeProfile.name}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex-shrink-0 ${
                storeProfile.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {storeProfile.isOpen ? '● Live Open' : '○ Closed'}
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 truncate">
              {storeProfile.tagline || 'Razor-thin smashed patties & craft gourmet buns'} • {storeProfile.address}
            </p>
          </div>
        </div>

        {/* Action Buttons: Generate QR, Mobile APK, Profile, and Manual Day End */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowApkModal(true)}
            title="Download Mobile App / APK"
            className="px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span>Get APK</span>
          </button>

          <button
            onClick={() => onNavigateTab('qr')}
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            <span>Menu QR</span>
          </button>

          <button
            onClick={() => onNavigateTab('profile')}
            className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">storefront</span>
            <span className="hidden sm:inline">Profile</span>
          </button>

          {/* MANUAL DAY END BUTTON */}
          <button
            onClick={() => setShowDayEndModal(true)}
            title="Perform Manual Day End Settlement & Page Refresh"
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/20 text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-800">nightlight_round</span>
            <span>Day End</span>
          </button>
        </div>
      </div>

      {/* Inner Dashboard Tabs: Overview vs Recent Table Orders */}
      <div className="flex items-center bg-surface-container/70 p-1 rounded-2xl w-fit border border-black/5 text-xs font-bold">
        <button
          onClick={() => setDashboardTab('overview')}
          className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            dashboardTab === 'overview'
              ? 'bg-white text-on-surface shadow-xs font-black'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Overview</span>
        </button>

        <button
          onClick={() => setDashboardTab('recent-orders')}
          className={`px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            dashboardTab === 'recent-orders'
              ? 'bg-white text-on-surface shadow-xs font-black'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">table_restaurant</span>
          <span>Recent Table Orders</span>
          <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-black">
            {orders.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Overview Dashboard */}
      {dashboardTab === 'overview' ? (
        <div className="space-y-5">
          {/* KPI Stats Grid (Font sizes decreased as requested) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Revenue KPI */}
            <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-xs border border-black/[0.04]">
              <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
                <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
                  Today&apos;s Revenue
                </span>
                <span className="material-symbols-outlined text-emerald-600 text-base">payments</span>
              </div>
              <div className="font-headline-md text-base sm:text-lg font-black text-on-surface">
                {storeProfile.currencySymbol}{totalRevenue.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                {settledOrders.length} bills settled
              </span>
            </div>

            {/* Active In Kitchen KPI */}
            <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-xs border border-black/[0.04]">
              <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
                <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
                  Active In Kitchen
                </span>
                <span className="material-symbols-outlined text-primary text-base">outdoor_grill</span>
              </div>
              <div className="font-headline-md text-base sm:text-lg font-black text-primary">
                {activeOrders.length}
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block truncate">
                Incoming orders &amp; cooking
              </span>
            </div>

            {/* Average Ticket KPI (Font size decreased as requested) */}
            <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-xs border border-black/[0.04]">
              <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
                <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
                  Average Ticket
                </span>
                <span className="material-symbols-outlined text-amber-600 text-base">receipt_long</span>
              </div>
              <div className="font-headline-md text-base sm:text-lg font-black text-on-surface">
                {storeProfile.currencySymbol}{avgTicket.toFixed(2)}
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">
                Per dining guest
              </span>
            </div>

            {/* Menu Items KPI */}
            <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-2xl shadow-xs border border-black/[0.04]">
              <div className="flex items-center justify-between text-on-surface-variant mb-1.5">
                <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">
                  Menu Items
                </span>
                <span className="material-symbols-outlined text-indigo-600 text-base">restaurant_menu</span>
              </div>
              <div className="font-headline-md text-base sm:text-lg font-black text-on-surface">
                {availableItemsCount} / {menuItems.length}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block truncate">
                Available on QR menu
              </span>
            </div>
          </div>

          {/* Quick Action Portals Grid */}
          <div>
            <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-extrabold mb-2.5">
              Owner Operations &amp; Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Card 1: Generate Menu QR */}
              <div
                onClick={() => onNavigateTab('qr')}
                className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04] hover:border-primary cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">qr_code_2</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-xs sm:text-sm text-on-surface font-bold">
                      Table QR Standees &amp; Posters
                    </h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Generate printable QR stands with customized table numbers, logos, and Wi-Fi credentials.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold flex items-center gap-1 self-end">
                  Open Standee Designer →
                </span>
              </div>

              {/* Card 2: Kitchen Display */}
              <div
                onClick={() => onNavigateTab('orders')}
                className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04] hover:border-primary cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">outdoor_grill</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-xs sm:text-sm text-on-surface font-bold">
                      Live Kitchen Grill Tickets
                    </h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Track tickets by table, manage prep stages, modify items, and print customer bills.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold flex items-center gap-1 self-end">
                  Launch Kitchen Display ({activeOrders.length}) →
                </span>
              </div>

              {/* Card 3: Menu & Bulk Upload */}
              <div
                onClick={() => onNavigateTab('menu')}
                className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04] hover:border-primary cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">lunch_dining</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-xs sm:text-sm text-on-surface font-bold">
                      Menu Catalog &amp; Bulk Upload
                    </h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Upload dishes via CSV/Excel, toggle out-of-stock items, and customize Hindi &amp; regional names.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold flex items-center gap-1 self-end">
                  Manage Menu Catalog →
                </span>
              </div>

              {/* Card 4: Recent Table Orders Tab */}
              <div
                onClick={() => setDashboardTab('recent-orders')}
                className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04] hover:border-primary cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">table_restaurant</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-xs sm:text-sm text-on-surface font-bold">
                      Recent Table Orders Tab
                    </h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      View full history by table number, customer names, billing breakdown, and settlement status.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold flex items-center gap-1 self-end">
                  Open Table Orders Tab →
                </span>
              </div>

              {/* Card 5: Financial Reports */}
              <div
                onClick={() => onNavigateTab('reports')}
                className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04] hover:border-primary cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">bar_chart</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-xs sm:text-sm text-on-surface font-bold">
                      Reports &amp; Excel Export
                    </h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Analyze sales charts, popular burgers, daily sales trends, and download CSV statements.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-primary font-bold flex items-center gap-1 self-end">
                  View Financial Reports →
                </span>
              </div>

              {/* Card 6: Manual Day End */}
              <div
                onClick={() => setShowDayEndModal(true)}
                className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04] hover:border-amber-600 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">nightlight_round</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-xs sm:text-sm text-on-surface font-bold">
                      Manual Day End Closing
                    </h4>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Settle today&apos;s register, close daily operation, archive reports, and refresh workspace.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-amber-800 font-bold flex items-center gap-1 self-end">
                  Execute Day End →
                </span>
              </div>
            </div>
          </div>

          {/* Quick Table Orders Preview Box */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
                <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-black">
                  Recent Orders Snapshot
                </h3>
              </div>
              <button
                onClick={() => setDashboardTab('recent-orders')}
                className="text-xs text-primary font-bold hover:underline"
              >
                Open Full Table Orders Tab →
              </button>
            </div>

            <div className="divide-y divide-black/[0.04]">
              {orders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary font-black text-xs flex items-center justify-center flex-shrink-0">
                      #{order.tableNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">
                          {order.orderNumber}
                        </span>
                        <span className="text-on-surface-variant text-[11px]">
                          • {order.customerName || 'Dining Guest'}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate max-w-sm">
                        {(order.items || []).map((i) => `${i?.quantity || 1}x ${i?.name || 'Item'}`).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <span className="font-bold text-on-surface">
                      {storeProfile.currencySymbol}{(order?.bill?.total || 0).toFixed(2)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      order.status === 'settled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'served'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'preparing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Recent Table Orders Tab inside Dashboard */
        <RecentTableOrdersTab
          orders={orders}
          storeProfile={storeProfile}
          onUpdateStatus={onUpdateStatus}
          onModifyBill={onModifyBill}
          onSettleBill={onSettleBill}
          onShowToast={onShowToast}
          onSimulateCustomerScan={onSimulateCustomerScan}
        />
      )}

      {/* Manual Day End Modal */}
      <DayEndModal
        isOpen={showDayEndModal}
        onClose={() => setShowDayEndModal(false)}
        orders={orders}
        storeProfile={storeProfile}
        onShowToast={onShowToast}
      />

      {/* Mobile App & APK Modal */}
      <MobileApkCenterModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
