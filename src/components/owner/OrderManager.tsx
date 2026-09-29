import React, { useState } from 'react';
import { OrderRecord, OrderStatus, StoreProfile } from '../../types';

interface OrderManagerProps {
  orders: OrderRecord[];
  storeProfile: StoreProfile;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onModifyBill: (orderId: string, discount: number, serviceCharge: number, notes?: string) => void;
  onSettleBill: (orderId: string, paymentMethod: 'UPI / Online QR' | 'Cash at Counter' | 'Card / Pos' | 'Waived') => void;
  onRefreshOrders: () => void;
  onShowToast: (msg: string) => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
  storeProfile,
  onUpdateStatus,
  onModifyBill,
  onSettleBill,
  onRefreshOrders,
  onShowToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'served' | 'settled'>('active');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [showBillModal, setShowBillModal] = useState<boolean>(false);
  const [showModifyModal, setShowModifyModal] = useState<boolean>(false);

  // Bill Modification Form
  const [modDiscount, setModDiscount] = useState<string>('0');
  const [modServiceCharge, setModServiceCharge] = useState<string>('0');
  const [modNotes, setModNotes] = useState<string>('');

  const currency = storeProfile.currencySymbol;

  // Deduplicate orders by ID to ensure React keys are always unique
  const uniqueOrders = Array.from(new Map(orders.map((o) => [o.id, o])).values());

  const filteredOrders = uniqueOrders.filter((o) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return o.status === 'received' || o.status === 'preparing';
    if (activeFilter === 'served') return o.status === 'served';
    if (activeFilter === 'settled') return o.status === 'settled';
    return true;
  });

  const activeCount = uniqueOrders.filter((o) => o.status === 'received' || o.status === 'preparing').length;
  const servedCount = uniqueOrders.filter((o) => o.status === 'served').length;

  const handleOpenModifyModal = (order: OrderRecord) => {
    setSelectedOrder(order);
    setModDiscount(order.bill.discount.toString());
    setModServiceCharge(order.bill.serviceCharge.toString());
    setModNotes(order.bill.notes || '');
    setShowModifyModal(true);
  };

  const handleSaveModification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const discountVal = Math.max(0, parseFloat(modDiscount) || 0);
    const serviceVal = Math.max(0, parseFloat(modServiceCharge) || 0);
    onModifyBill(selectedOrder.id, discountVal, serviceVal, modNotes.trim() || undefined);
    onShowToast(`Bill modified for ${selectedOrder.orderNumber}`);
    setShowModifyModal(false);
  };

  const handleOpenBillModal = (order: OrderRecord) => {
    setSelectedOrder(order);
    setShowBillModal(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Real-time Order Action Header */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Kitchen Display &amp; Orders</h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            {activeCount} orders preparing • {servedCount} awaiting settlement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onRefreshOrders();
              onShowToast('Refreshed orders feed!');
            }}
            className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            Refresh Page
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'active', label: `Cooking & Received (${activeCount})` },
          { key: 'served', label: `Served / Table Pending (${servedCount})` },
          { key: 'settled', label: `Settled Archive` },
          { key: 'all', label: `All Orders (${orders.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === tab.key
                ? 'bg-on-background text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-10 text-center shadow-xs border border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-[44px] text-on-surface-variant mb-2">
            check_circle
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface">All caught up!</h3>
          <p className="text-xs text-on-surface-variant mt-1">No orders found in this section.</p>
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
                    ? 'border-secondary-container/50'
                    : 'border-black/[0.04] opacity-80'
                }`}
              >
                {/* Order Top Bar */}
                <div>
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-surface-container">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-md text-lg text-on-surface font-extrabold">
                          {ord.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                          Table #{ord.tableNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant block mt-0.5">
                        {ord.diningZone} • {ord.createdAt}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
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
                  {ord.customerName && (
                    <div className="text-xs font-semibold text-on-surface pt-2">
                      Guest: <span className="text-primary font-bold">{ord.customerName}</span>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="py-3 space-y-2">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-on-surface mr-1">{item.quantity}×</span>
                          <span className="font-medium text-on-surface">{item.name}</span>
                          {item.customizationSummary && (
                            <p className="text-[10px] text-on-surface-variant truncate">
                              {item.customizationSummary}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-on-surface whitespace-nowrap">
                          {currency}{item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Snapshot & Status Controls */}
                <div className="pt-2 border-t border-surface-container">
                  <div className="flex items-center justify-between text-xs font-bold mb-3">
                    <span className="text-on-surface-variant">
                      Total Bill:
                    </span>
                    <span className="font-headline-md text-base text-primary">
                      {currency}{ord.bill.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Workflow Action Buttons */}
                  <div className="space-y-2">
                    {/* Status Advancer */}
                    {isCooking && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {ord.status === 'received' && (
                          <button
                            onClick={() => {
                              onUpdateStatus(ord.id, 'preparing');
                              onShowToast(`Marked ${ord.orderNumber} as Preparing on Grill`);
                            }}
                            className="w-full py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-xs transition-all active:scale-95"
                          >
                            Start Cooking
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onUpdateStatus(ord.id, 'served');
                            onShowToast(`Order ${ord.orderNumber} marked as SERVED to Table #${ord.tableNumber}!`);
                          }}
                          className={`w-full py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 ${
                            ord.status === 'received' ? '' : 'col-span-2'
                          }`}
                        >
                          Mark as Served ✓
                        </button>
                      </div>
                    )}

                    {/* Bill & Settlement Buttons */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleOpenBillModal(ord)}
                        className="py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">receipt</span>
                        View / Print Bill
                      </button>

                      <button
                        onClick={() => handleOpenModifyModal(ord)}
                        className="py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit_note</span>
                        Modify Bill
                      </button>
                    </div>

                    {/* Settle Bill Primary trigger */}
                    {!isSettled && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => {
                            onSettleBill(ord.id, 'Cash at Counter');
                            onShowToast(`Order ${ord.orderNumber} settled with Cash at Counter!`);
                          }}
                          className="py-2 rounded-full bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-white text-xs font-bold shadow-xs transition-all"
                        >
                          Cash Settled
                        </button>
                        <button
                          onClick={() => {
                            onSettleBill(ord.id, 'UPI / Online QR');
                            onShowToast(`Order ${ord.orderNumber} settled with Online / UPI!`);
                          }}
                          className="py-2 rounded-full bg-on-background text-on-primary text-xs font-bold shadow-xs transition-all"
                        >
                          UPI Settled
                        </button>
                      </div>
                    )}

                    {isSettled && (
                      <div className="p-2 rounded-xl bg-surface-container text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        Settled via {ord.bill.paymentMethod || 'Online'} • {ord.bill.settledAt || 'Completed'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bill View & Settlement Modal */}
      {showBillModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-6 shadow-2xl relative my-auto">
            {/* Printable Receipt Area */}
            <div id="restaurant-bill-print" className="text-center font-mono text-xs">
              <div className="flex items-center justify-center gap-1 mb-1">
                <img src={storeProfile.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
                <h3 className="font-headline-md text-base text-on-surface font-extrabold">{storeProfile.name}</h3>
              </div>
              <p className="text-[11px] text-on-surface-variant">{storeProfile.address}</p>
              <p className="text-[10px] text-on-surface-variant">Phone: {storeProfile.phone}</p>
              <div className="border-t border-dashed border-black/30 my-2" />

              <div className="flex justify-between font-bold text-[11px] mb-1">
                <span>Receipt: {selectedOrder.orderNumber}</span>
                <span>Table #{selectedOrder.tableNumber}</span>
              </div>
              <div className="flex justify-between text-[10px] text-on-surface-variant mb-2">
                <span>{selectedOrder.createdAt}</span>
                <span>Zone: {selectedOrder.diningZone}</span>
              </div>

              {/* Items */}
              <div className="space-y-1 text-left border-y border-dashed border-black/30 py-2 my-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate pr-2">
                      {item.quantity}× {item.name}
                    </span>
                    <span>{currency}{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Math */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{currency}{selectedOrder.bill.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.bill.discount > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Discount:</span>
                    <span>-{currency}{selectedOrder.bill.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({storeProfile.taxRate}%):</span>
                  <span>{currency}{selectedOrder.bill.tax.toFixed(2)}</span>
                </div>
                {selectedOrder.bill.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Service Fee:</span>
                    <span>{currency}{selectedOrder.bill.serviceCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-dashed border-black/30 my-1 pt-1 flex justify-between font-extrabold text-sm text-on-surface">
                  <span>GRAND TOTAL:</span>
                  <span className="text-primary">{currency}{selectedOrder.bill.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-surface-container-low rounded text-[10px]">
                <p className="font-bold">UPI ID: {storeProfile.upiId}</p>
                <p className="text-on-surface-variant">Pay via GPay / PhonePe / Paytm or at Counter</p>
              </div>

              <p className="text-[10px] text-on-surface-variant mt-2 italic">
                Thank you for dining with Sizzle &amp; Bun!
              </p>
            </div>

            {/* Modal Controls */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-surface-container">
              <button
                onClick={() => setShowBillModal(false)}
                className="flex-1 py-2 rounded-full bg-surface-container text-on-surface text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">print</span>
                Print Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Bill Modal */}
      {showModifyModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-5 shadow-2xl relative">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
              Modify Bill: {selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Apply customer loyalty discounts, manager discounts, or waive service fees.
            </p>

            <form onSubmit={handleSaveModification} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Discount Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={modDiscount}
                  onChange={(e) => setModDiscount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Service Charge ({currency})
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={modServiceCharge}
                  onChange={(e) => setModServiceCharge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Modification Reason / Note
                </label>
                <input
                  type="text"
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  placeholder="e.g. VIP Member 10% off"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModifyModal(false)}
                  className="flex-1 py-2 rounded-full bg-surface-container text-on-surface text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full bg-primary text-on-primary text-xs font-bold"
                >
                  Update Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
