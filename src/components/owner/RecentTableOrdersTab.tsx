import React, { useState } from 'react';
import { OrderRecord, StoreProfile } from '../../types';

interface RecentTableOrdersTabProps {
  orders: OrderRecord[];
  storeProfile: StoreProfile;
  onUpdateStatus: (orderId: string, status: any) => void;
  onModifyBill: (orderId: string, discount: number, serviceCharge: number, notes?: string) => void;
  onSettleBill: (orderId: string, method: any) => void;
  onShowToast: (msg: string) => void;
  onSimulateCustomerScan?: (tableNumber: number, zone: string) => void;
}

export const RecentTableOrdersTab: React.FC<RecentTableOrdersTabProps> = ({
  orders,
  storeProfile,
  onUpdateStatus,
  onModifyBill,
  onSettleBill,
  onShowToast,
  onSimulateCustomerScan,
}) => {
  const [tableFilter, setTableFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currency = storeProfile.currencySymbol || '₹';

  // Deduplicate orders safely
  const uniqueOrders = Array.from(
    new Map(
      orders
        .filter((o): o is OrderRecord => Boolean(o && o.id))
        .map((o) => [o.id, o])
    ).values()
  );

  // Distinct table numbers
  const tableNumbers = Array.from(new Set(uniqueOrders.map((o) => o.tableNumber || 1))).sort((a, b) => a - b);

  const filteredOrders = uniqueOrders.filter((ord) => {
    if (!ord) return false;
    const ordTableStr = (ord.tableNumber || '').toString();
    const matchTable = tableFilter === 'All' || ordTableStr === tableFilter;
    const matchStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'active'
        ? ord.status === 'received' || ord.status === 'preparing'
        : ord.status === statusFilter;

    const searchLower = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(searchLower)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(searchLower)) ||
      (ord.diningZone && ord.diningZone.toLowerCase().includes(searchLower)) ||
      (Array.isArray(ord.items) && ord.items.some((i) => i && i.name && i.name.toLowerCase().includes(searchLower)));

    return matchTable && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">table_restaurant</span>
            </div>
            <h2 className="font-headline-md text-base sm:text-lg font-black text-on-surface">
              Recent Table Orders
            </h2>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Dine-in table order history, live guest requests, item breakdowns &amp; settlement records
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface font-semibold">
            {uniqueOrders.length} Total Orders Recorded
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            {uniqueOrders.filter((o) => o.status === 'settled').length} Bills Settled
          </span>
        </div>
      </div>

      {/* Filters Bar: Tables, Statuses, Search */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-surface-container-lowest p-3 rounded-2xl border border-black/[0.04]">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search table, item, customer..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {[
            { id: 'All', label: 'All' },
            { id: 'active', label: 'Cooking / In Kitchen' },
            { id: 'served', label: 'Served to Table' },
            { id: 'settled', label: 'Settled & Paid' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Table Number Selector */}
        <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
          <span className="text-on-surface-variant font-bold">Filter Table:</span>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-surface-container text-on-surface text-xs font-bold border border-black/5 outline-none"
          >
            <option value="All">All Tables</option>
            {tableNumbers.map((num) => (
              <option key={num} value={num.toString()}>
                Table #{num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-10 text-center shadow-xs border border-dashed border-black/10">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
            dinner_dining
          </span>
          <h4 className="font-headline-md text-sm font-bold text-on-surface">No Table Orders Found</h4>
          <p className="text-xs text-on-surface-variant mt-1">
            Try adjusting your search query or table filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => {
            const isCooking = ord.status === 'received' || ord.status === 'preparing';
            const isServed = ord.status === 'served';
            const isSettled = ord.status === 'settled';

            return (
              <div
                key={ord.id}
                className={`bg-surface-container-lowest rounded-2xl p-4 shadow-xs border transition-all flex flex-col justify-between ${
                  isCooking
                    ? 'border-primary/40 ring-1 ring-primary/20'
                    : isServed
                    ? 'border-emerald-300'
                    : 'border-black/[0.04] opacity-90'
                }`}
              >
                <div>
                  {/* Table Header */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-black/[0.05]">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center flex-shrink-0">
                        #{ord.tableNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline-md text-sm font-black text-on-surface">
                            {ord.orderNumber}
                          </span>
                        </div>
                        <span className="text-[11px] text-on-surface-variant block">
                          {ord.diningZone} • {ord.createdAt}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                        ord.status === 'received'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : ord.status === 'preparing'
                          ? 'bg-primary text-on-primary'
                          : ord.status === 'served'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div className="text-xs text-on-surface pt-2 pb-1 flex items-center justify-between">
                    <span className="font-semibold text-on-surface-variant">
                      Customer: <strong className="text-on-surface">{ord.customerName || 'Dining Guest'}</strong>
                    </span>
                    {onSimulateCustomerScan && (
                      <button
                        onClick={() => onSimulateCustomerScan(ord.tableNumber, ord.diningZone)}
                        className="text-[10px] text-primary hover:underline font-bold"
                        title="Simulate Table QR Scan"
                      >
                        Scan View →
                      </button>
                    )}
                  </div>

                  {/* Ordered Items List */}
                  <div className="py-2 space-y-1.5 border-t border-black/[0.03]">
                    {(ord.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-on-surface mr-1">{item?.quantity || 1}×</span>
                          <span className="font-medium text-on-surface">{item?.name || 'Item'}</span>
                          {item?.customizationSummary && (
                            <span className="text-[10px] text-primary block truncate">
                              • {item.customizationSummary}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-on-surface whitespace-nowrap">
                          {currency}{(item?.totalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Bill Breakdown & Actions */}
                <div className="pt-2.5 border-t border-black/[0.05] mt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Total Bill:</span>
                    <span className="font-headline-md text-sm font-black text-primary">
                      {currency}{(ord?.bill?.total || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                    {ord.status === 'received' && (
                      <button
                        onClick={() => {
                          onUpdateStatus(ord.id, 'preparing');
                          onShowToast(`Order ${ord.orderNumber} sent to Cooking`);
                        }}
                        className="py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs active:scale-95"
                      >
                        Fire Up Grill
                      </button>
                    )}
                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => {
                          onUpdateStatus(ord.id, 'served');
                          onShowToast(`Order ${ord.orderNumber} marked as Served to Table #${ord.tableNumber}`);
                        }}
                        className="col-span-2 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs active:scale-95"
                      >
                        Mark as Served ✓
                      </button>
                    )}
                    {ord.status === 'served' && (
                      <button
                        onClick={() => {
                          onSettleBill(ord.id, 'UPI / Online QR');
                          onShowToast(`Order ${ord.orderNumber} settled via UPI!`);
                        }}
                        className="col-span-2 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs active:scale-95"
                      >
                        Settle Digital Bill ✓
                      </button>
                    )}
                    {ord.status === 'settled' && (
                      <div className="col-span-2 text-center text-[11px] text-emerald-700 font-bold bg-emerald-50 py-1 rounded-xl">
                        ✓ Bill Settled ({ord.bill.paymentMethod || 'Paid'})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
