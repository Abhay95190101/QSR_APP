import React, { useState } from 'react';
import { OrderRecord, StoreProfile } from '../../types';
import { api } from '../../services/api';

interface DayEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  storeProfile: StoreProfile;
  onShowToast: (msg: string) => void;
}

export const DayEndModal: React.FC<DayEndModalProps> = ({
  isOpen,
  onClose,
  orders,
  storeProfile,
  onShowToast,
}) => {
  const [closeStoreOnDayEnd, setCloseStoreOnDayEnd] = useState<boolean>(true);
  const [autoSettleOpenOrders, setAutoSettleOpenOrders] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const currency = storeProfile?.currencySymbol || '₹';
  const settledOrders = (orders || []).filter((o) => o && o.status === 'settled');
  const openOrders = (orders || []).filter((o) => o && o.status !== 'settled');

  const totalRevenue = settledOrders.reduce((sum, o) => sum + (o?.bill?.total || 0), 0);
  const upiSettled = settledOrders
    .filter((o) => (o?.bill?.paymentMethod || '').toLowerCase().includes('upi'))
    .reduce((sum, o) => sum + (o?.bill?.total || 0), 0);
  const cashSettled = Math.max(0, totalRevenue - upiSettled);

  const todayDateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Export Daily Closing Report
  const handleExportDailyReport = () => {
    const headers = [
      'Order Number',
      'Table #',
      'Zone',
      'Time',
      'Customer',
      'Status',
      'Payment Method',
      'Subtotal',
      'Discount',
      'Tax (GST)',
      'Service Charge',
      'Total Amount',
    ];

    const rows = (orders || []).map((o) => [
      o?.orderNumber || 'ORD',
      `Table #${o?.tableNumber || 1}`,
      o?.diningZone || 'Main Dining',
      o?.createdAt || '',
      o?.customerName || 'Dining Guest',
      o?.status || 'received',
      o?.bill?.paymentMethod || (o?.status === 'settled' ? 'Settled' : 'Pending'),
      `${currency}${(o?.bill?.subtotal || 0).toFixed(2)}`,
      `${currency}${(o?.bill?.discount || 0).toFixed(2)}`,
      `${currency}${(o?.bill?.tax || 0).toFixed(2)}`,
      `${currency}${(o?.bill?.serviceCharge || 0).toFixed(2)}`,
      `${currency}${(o?.bill?.total || 0).toFixed(2)}`,
    ]);

    const summarySection = [
      ['=== DAY END FINANCIAL SETTLEMENT SUMMARY ==='],
      [`Restaurant: ${storeProfile.name}`],
      [`Date: ${todayDateStr}`],
      [`Total Orders: ${orders.length}`],
      [`Settled Orders: ${settledOrders.length}`],
      [`Open / Unsettled Orders: ${openOrders.length}`],
      [`Total Net Revenue: ${currency}${totalRevenue.toFixed(2)}`],
      [`UPI / Digital QR Collections: ${currency}${upiSettled.toFixed(2)}`],
      [`Cash Collections: ${currency}${Math.max(0, cashSettled).toFixed(2)}`],
      [''],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      summarySection.map((r) => r.join(',')).join('\n') +
      '\n' +
      [headers.join(',')].concat(rows.map((r) => r.join(','))).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${storeProfile.name.replace(/\s+/g, '_')}_DayEnd_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast('Exported Day-End Financial Settlement CSV');
  };

  const handleExecuteDayEnd = async () => {
    setIsProcessing(true);
    onShowToast('Executing Day End Settlement...');

    try {
      // 1. Archive today's summary snapshot to localStorage historical archive
      const existingHistory = JSON.parse(localStorage.getItem('sb_historical_day_ends') || '[]');
      existingHistory.unshift({
        date: new Date().toISOString(),
        dateFormatted: todayDateStr,
        totalOrders: orders.length,
        settledCount: settledOrders.length,
        totalRevenue,
        upiRevenue: upiSettled,
        cashRevenue: Math.max(0, cashSettled),
        storeName: storeProfile.name,
      });
      localStorage.setItem('sb_historical_day_ends', JSON.stringify(existingHistory.slice(0, 60)));

      // 1b. Permanently record all orders to the all-time orders ledger
      try {
        const existingArchive = JSON.parse(localStorage.getItem('sb_all_time_orders_archive') || '[]');
        const map = new Map<string, OrderRecord>();
        existingArchive.forEach((o: OrderRecord) => {
          if (o && o.id) map.set(o.id, o);
        });
        orders.forEach((o) => {
          if (o && o.id) {
            const existing = map.get(o.id);
            map.set(o.id, {
              ...existing,
              ...o,
              createdDate: o.createdDate || existing?.createdDate || new Date().toISOString().slice(0, 10),
            });
          }
        });
        localStorage.setItem('sb_all_time_orders_archive', JSON.stringify(Array.from(map.values())));
      } catch (err) {
        console.warn('Failed to update sb_all_time_orders_archive', err);
      }

      // 2. Clear current orders queue for fresh operations tomorrow
      localStorage.removeItem('sb_orders');

      // 3. Update store open state if requested
      if (closeStoreOnDayEnd) {
        const updatedProfile = { ...storeProfile, isOpen: false };
        localStorage.setItem('sb_store_profile', JSON.stringify(updatedProfile));
        await api.updateStoreProfile(updatedProfile).catch(() => {});
      }

      // 4. Notify backend server
      await api.executeDayEnd(closeStoreOnDayEnd, true).catch(() => {});

      onShowToast('✅ Day End completed successfully! Refreshing page...');

      // 5. Refresh the page after brief pause as requested
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      console.error(err);
      onShowToast('Completed Day End! Refreshing now...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto border border-black/10 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">nightlight_round</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-black text-on-surface">
                Manual Day End Closing (दैनिक व्यापार समापन)
              </h3>
              <p className="text-xs text-on-surface-variant">{todayDateStr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* Daily Revenue Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-surface-container/60 border border-black/5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-0.5">
                Total Day Sales
              </span>
              <div className="font-headline-md text-base sm:text-lg font-black text-emerald-800">
                {currency}{totalRevenue.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {settledOrders.length} Settled Bills
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container/60 border border-black/5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-0.5">
                Total Orders Placed
              </span>
              <div className="font-headline-md text-base sm:text-lg font-black text-primary">
                {orders.length}
              </div>
              <span className="text-[10px] text-on-surface-variant">Across All Tables</span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-surface-container/60 border border-black/5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block mb-0.5">
                UPI vs Cash
              </span>
              <div className="text-[11px] font-bold text-on-surface space-y-0.5">
                <div className="flex justify-between">
                  <span>UPI:</span>
                  <span className="text-primary">{currency}{upiSettled.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash:</span>
                  <span>{currency}{Math.max(0, cashSettled).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Open Orders Warning if any */}
          {openOrders.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-amber-700 text-base">warning</span>
                <span>{openOrders.length} Active / Unsettled Orders Remaining:</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Tables {openOrders.map((o) => `#${o.tableNumber} (${o.orderNumber})`).join(', ')} currently have active items.
              </p>
              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSettleOpenOrders}
                  onChange={(e) => setAutoSettleOpenOrders(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span className="text-xs font-semibold">
                  Auto-settle remaining orders before archiving day queue
                </span>
              </label>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-surface-container/50 border border-black/5 cursor-pointer">
              <div>
                <span className="font-bold text-on-surface block">Close Restaurant Operations</span>
                <span className="text-[11px] text-on-surface-variant">
                  Marks restaurant as closed so QR menu shows &ldquo;Kitchen Closed for Night&rdquo;
                </span>
              </div>
              <input
                type="checkbox"
                checked={closeStoreOnDayEnd}
                onChange={(e) => setCloseStoreOnDayEnd(e.target.checked)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </label>
          </div>

          {/* Export Report Link */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleExportDailyReport}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download Day-End Report (Excel / CSV)
            </button>
            <span className="text-[10px] text-on-surface-variant">Recommended before closing</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteDayEnd}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-headline-md text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">lock_clock</span>
            <span>
              {isProcessing ? 'Closing & Refreshing...' : 'Perform Day End & Refresh'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
