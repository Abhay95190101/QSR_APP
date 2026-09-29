import React, { useState, useMemo, useEffect } from 'react';
import { OrderRecord, StoreProfile } from '../../types';

interface ReportsViewProps {
  orders: OrderRecord[];
  storeProfile: StoreProfile;
  onShowToast: (msg: string) => void;
}

type DateFilterType = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'all' | 'specific' | 'range';

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  storeProfile,
  onShowToast,
}) => {
  const currency = storeProfile.currencySymbol || '₹';

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Date Filter States
  const [filterType, setFilterType] = useState<DateFilterType>('today');
  const [specificDate, setSpecificDate] = useState<string>(todayStr);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(todayStr);

  // Load all-time historical orders from local storage archive + props
  const [archivedOrders, setArchivedOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sb_all_time_orders_archive');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatically record incoming orders to the permanent all-time archive
  useEffect(() => {
    if (orders && orders.length > 0) {
      setArchivedOrders((prev) => {
        const map = new Map<string, OrderRecord>();
        // Add existing archive
        prev.forEach((o) => {
          if (o && o.id) map.set(o.id, o);
        });
        // Add or update current live orders
        orders.forEach((o) => {
          if (o && o.id) {
            const existing = map.get(o.id);
            map.set(o.id, {
              ...existing,
              ...o,
              createdDate: o.createdDate || existing?.createdDate || todayStr,
            });
          }
        });
        const combined = Array.from(map.values());
        try {
          localStorage.setItem('sb_all_time_orders_archive', JSON.stringify(combined));
        } catch {
          // ignore
        }
        return combined;
      });
    }
  }, [orders, todayStr]);

  // Load historical day end summaries if available
  const historicalDayEnds = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('sb_historical_day_ends') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Normalizes an order's date to YYYY-MM-DD safely
  const getOrderDate = (order: OrderRecord): string => {
    try {
      if (!order) return todayStr;
      if (order.createdDate && order.createdDate.length >= 10) return order.createdDate.slice(0, 10);
      if (order.timestamp && order.timestamp > 0) {
        const d = new Date(order.timestamp);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
      const match = typeof order.id === 'string' ? order.id.match(/ord-(\d{10,14})/) : null;
      if (match && match[1]) {
        const ts = parseInt(match[1], 10);
        if (!isNaN(ts) && ts > 0) {
          const d = new Date(ts);
          if (!isNaN(d.getTime())) {
            return d.toISOString().slice(0, 10);
          }
        }
      }
    } catch {
      // safe fallback
    }
    return todayStr;
  };

  // Filter orders based on active date option (from both live and archived ledger)
  const filteredOrders = useMemo(() => {
    const combinedList = [...orders, ...archivedOrders];
    const uniqueOrders = Array.from(
      new Map(
        combinedList
          .filter((o): o is OrderRecord => Boolean(o && o.id))
          .map((o) => [o.id, o])
      ).values()
    );

    return uniqueOrders.filter((order) => {
      const ordDate = getOrderDate(order);

      if (filterType === 'all') return true;
      if (filterType === 'today') return ordDate === todayStr;
      if (filterType === 'yesterday') return ordDate === yesterdayStr;
      if (filterType === 'specific') return ordDate === specificDate;

      if (filterType === 'last7') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
        return ordDate >= sevenDaysAgo && ordDate <= todayStr;
      }

      if (filterType === 'thisMonth') {
        const thisMonthPrefix = todayStr.slice(0, 7); // YYYY-MM
        return ordDate.startsWith(thisMonthPrefix);
      }

      if (filterType === 'range') {
        if (startDate && endDate) {
          return ordDate >= startDate && ordDate <= endDate;
        }
        if (startDate) return ordDate >= startDate;
        if (endDate) return ordDate <= endDate;
        return true;
      }

      return true;
    });
  }, [orders, archivedOrders, filterType, specificDate, startDate, endDate, todayStr, yesterdayStr]);

  // Derived financial metrics from filtered orders
  const settledOrders = filteredOrders.filter((o) => o.status === 'settled');
  const openOrders = filteredOrders.filter((o) => o.status !== 'settled');

  const totalRevenue = settledOrders.reduce((sum, o) => sum + (o?.bill?.total || 0), 0);
  const totalSubtotal = settledOrders.reduce((sum, o) => sum + (o?.bill?.subtotal || 0), 0);
  const totalTax = settledOrders.reduce((sum, o) => sum + (o?.bill?.tax || 0), 0);
  const totalDiscounts = settledOrders.reduce((sum, o) => sum + (o?.bill?.discount || 0), 0);
  const averageTicket = settledOrders.length > 0 ? totalRevenue / settledOrders.length : 0;

  // Payment Breakdown
  const upiSettled = settledOrders
    .filter((o) => (o?.bill?.paymentMethod || '').toLowerCase().includes('upi'))
    .reduce((sum, o) => sum + (o?.bill?.total || 0), 0);
  const cashSettled = Math.max(0, totalRevenue - upiSettled);
  const upiPercent = totalRevenue > 0 ? Math.round((upiSettled / totalRevenue) * 100) : 0;
  const cashPercent = totalRevenue > 0 ? Math.max(0, 100 - upiPercent) : 0;

  // Top Selling Items in the filtered period
  const itemSalesMap = new Map<string, { name: string; qty: number; total: number }>();
  filteredOrders.forEach((ord) => {
    if (!ord || !Array.isArray(ord.items)) return;
    ord.items.forEach((item) => {
      if (!item) return;
      const itemName = item.name || 'Special Item';
      const existing = itemSalesMap.get(itemName) || { name: itemName, qty: 0, total: 0 };
      existing.qty += item.quantity || 1;
      existing.total += item.totalPrice || 0;
      itemSalesMap.set(itemName, existing);
    });
  });
  const topSellingItems = Array.from(itemSalesMap.values()).sort((a, b) => b.qty - a.qty);

  // Label describing the current date selection
  const getDateSelectionLabel = (): string => {
    switch (filterType) {
      case 'today':
        return `Today (${todayStr})`;
      case 'yesterday':
        return `Yesterday (${yesterdayStr})`;
      case 'last7':
        return 'Last 7 Days';
      case 'thisMonth':
        return `This Month (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})`;
      case 'specific':
        return `Specific Date: ${specificDate}`;
      case 'range':
        return `Date Range: ${startDate} to ${endDate}`;
      case 'all':
        return 'All Time History';
      default:
        return 'Selected Date';
    }
  };

  // Export CSV for the selected date
  const handleExportCSV = () => {
    const dateLabel = getDateSelectionLabel();
    const headers = [
      'Order Number',
      'Table #',
      'Dining Zone',
      'Date / Time',
      'Customer',
      'Status',
      'Payment Method',
      'Subtotal',
      'Discount',
      'GST Tax',
      'Service Charge',
      'Total Amount',
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      `Table #${o.tableNumber}`,
      o.diningZone,
      `${getOrderDate(o)} ${o.createdAt}`,
      o.customerName || 'Dining Guest',
      o.status,
      o.bill.paymentMethod || (o.status === 'settled' ? 'Paid' : 'Pending'),
      `${currency}${o.bill.subtotal.toFixed(2)}`,
      `${currency}${o.bill.discount.toFixed(2)}`,
      `${currency}${o.bill.tax.toFixed(2)}`,
      `${currency}${o.bill.serviceCharge.toFixed(2)}`,
      `${currency}${o.bill.total.toFixed(2)}`,
    ]);

    const summarySection = [
      [`${storeProfile.name} - FINANCIAL SALES REPORT`],
      [`Filtered Period: ${dateLabel}`],
      [`Generated At: ${new Date().toLocaleString()}`],
      [`Total Orders: ${filteredOrders.length}`],
      [`Settled Revenue: ${currency}${totalRevenue.toFixed(2)}`],
      [`UPI Collections: ${currency}${upiSettled.toFixed(2)}`],
      [`Cash Collections: ${currency}${cashSettled.toFixed(2)}`],
      [`Taxes Collected (GST): ${currency}${totalTax.toFixed(2)}`],
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
    const filenameSafe = dateLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `${storeProfile.name.replace(/\s+/g, '_')}_Report_${filenameSafe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowToast(`Exported sales report for ${dateLabel} (.csv)`);
  };

  const handlePrintPDF = () => {
    window.print();
    onShowToast('Print dialog opened for PDF report.');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner & Export Actions */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">analytics</span>
            </div>
            <h2 className="font-headline-md text-base sm:text-lg font-black text-on-surface">
              Financial Sales &amp; Date Reports
            </h2>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Filter accounting metrics, item sales, and UPI settlements by specific dates or custom date ranges.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1.5 transition-colors border border-black/5"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">table_chart</span>
            <span>Export Excel (.csv)</span>
          </button>
          <button
            type="button"
            onClick={handlePrintPDF}
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* DATE SELECTOR BAR (Select Date Options as requested) */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
            Select Date Filter Period:
          </span>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'specific', label: 'Select Specific Date' },
              { id: 'range', label: 'Custom Date Range' },
              { id: 'all', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFilterType(p.id as DateFilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterType === p.id
                    ? 'bg-primary text-on-primary shadow-xs font-black'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Specific Date Picker */}
        {filterType === 'specific' && (
          <div className="p-3 rounded-xl bg-surface-container/60 border border-black/5 flex items-center gap-3 animate-in fade-in text-xs flex-wrap">
            <label className="font-bold text-on-surface flex items-center gap-1.5">
              <span>Choose Date:</span>
            </label>
            <input
              type="date"
              value={specificDate}
              max={todayStr}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white text-on-surface font-bold text-xs border border-black/10 outline-none cursor-pointer"
            />
            <span className="text-on-surface-variant text-[11px]">
              Viewing orders recorded on <strong>{specificDate}</strong>
            </span>
          </div>
        )}

        {/* Interactive Custom Date Range Pickers */}
        {filterType === 'range' && (
          <div className="p-3 rounded-xl bg-surface-container/60 border border-black/5 flex items-center gap-3 animate-in fade-in text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-on-surface">From:</span>
              <input
                type="date"
                value={startDate}
                max={todayStr}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white text-on-surface font-bold text-xs border border-black/10 outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-on-surface">To:</span>
              <input
                type="date"
                value={endDate}
                max={todayStr}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white text-on-surface font-bold text-xs border border-black/10 outline-none cursor-pointer"
              />
            </div>

            <span className="text-on-surface-variant text-[11px]">
              Showing orders between <strong>{startDate}</strong> and <strong>{endDate}</strong>
            </span>
          </div>
        )}

        {/* Active Filter Summary Bar */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-black/[0.04]">
          <span className="font-semibold text-on-surface-variant">
            Active Filter: <strong className="text-on-surface">{getDateSelectionLabel()}</strong>
          </span>
          <span className="font-bold text-primary">
            {filteredOrders.length} Orders Match Criteria ({settledOrders.length} Settled)
          </span>
        </div>
      </div>

      {/* KPI Financial Cards for the Selected Period */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Gross Revenue */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04]">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Settled Revenue</span>
            <span className="material-symbols-outlined text-emerald-600 text-base">payments</span>
          </div>
          <div className="font-headline-md text-base sm:text-lg font-black text-on-surface">
            {currency}{totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
            {settledOrders.length} paid bills
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04]">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <span className="material-symbols-outlined text-primary text-base">receipt_long</span>
          </div>
          <div className="font-headline-md text-base sm:text-lg font-black text-primary">
            {filteredOrders.length}
          </div>
          <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">
            {openOrders.length > 0 ? `${openOrders.length} currently active` : 'All settled'}
          </span>
        </div>

        {/* Average Ticket */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04]">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Average Ticket</span>
            <span className="material-symbols-outlined text-amber-600 text-base">trending_up</span>
          </div>
          <div className="font-headline-md text-base sm:text-lg font-black text-on-surface">
            {currency}{averageTicket.toFixed(2)}
          </div>
          <span className="text-[10px] text-on-surface-variant font-medium mt-0.5 block">
            Per dining group
          </span>
        </div>

        {/* GST Tax Collected */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-xs border border-black/[0.04]">
          <div className="flex items-center justify-between text-on-surface-variant mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">GST Tax ({storeProfile.taxRate}%)</span>
            <span className="material-symbols-outlined text-indigo-600 text-base">account_balance</span>
          </div>
          <div className="font-headline-md text-base sm:text-lg font-black text-on-surface">
            {currency}{totalTax.toFixed(2)}
          </div>
          <span className="text-[10px] text-indigo-700 font-semibold mt-0.5 block">
            Subtotal: {currency}{totalSubtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Settlements & Top Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* UPI vs Cash Settlement Channels */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-sm font-black text-on-surface">
              Payment Collections Channel
            </h3>
            <span className="text-[10px] text-on-surface-variant font-mono">
              UPI VPA: {storeProfile.upiId}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* UPI QR */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">qr_code_2</span>
                  <span>UPI / Online QR ({currency}{upiSettled.toFixed(2)})</span>
                </span>
                <span className="text-primary font-black">{upiPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${upiPercent}%` }}
                />
              </div>
            </div>

            {/* Cash at Counter */}
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-base">point_of_sale</span>
                  <span>Cash at Counter ({currency}{cashSettled.toFixed(2)})</span>
                </span>
                <span className="text-on-surface font-black">{cashPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-secondary-container rounded-full transition-all duration-300"
                  style={{ width: `${cashPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Product Movers */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-sm font-black text-on-surface">
              Top Selling Dishes ({topSellingItems.length})
            </h3>
            <span className="text-[10px] text-on-surface-variant">Ranked by units ordered</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
            {topSellingItems.length > 0 ? (
              topSellingItems.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-surface-container/40"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-black text-[10px] flex items-center justify-center flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-on-surface truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-primary">{item.qty} sold</span>
                    <span className="font-semibold text-on-surface-variant">
                      {currency}{item.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-on-surface-variant text-xs">
                No dish sales recorded for this date selection.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Itemized Table for Selected Date */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-black/[0.04] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex items-center justify-between">
          <h4 className="font-headline-md text-sm font-black text-on-surface">
            Itemized Orders ({filteredOrders.length})
          </h4>
          <span className="text-[11px] text-on-surface-variant">
            Orders matching &ldquo;{getDateSelectionLabel()}&rdquo;
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-3xl mb-1 block">event_busy</span>
            No orders found for the selected date period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container/50 text-[10px] font-black uppercase text-on-surface-variant border-b border-black/[0.04]">
                <tr>
                  <th className="py-2.5 px-4">Order #</th>
                  <th className="py-2.5 px-3">Table</th>
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3">Guest Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03]">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface-container/30 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-on-surface">{ord.orderNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-primary">#{ord.tableNumber}</td>
                    <td className="py-2.5 px-3 text-on-surface-variant">
                      {getOrderDate(ord)} {ord.createdAt}
                    </td>
                    <td className="py-2.5 px-3 text-on-surface">{ord.customerName || 'Dining Guest'}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        ord.status === 'settled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'served'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-on-surface-variant font-medium">
                      {ord.bill.paymentMethod || (ord.status === 'settled' ? 'Paid' : 'Pending')}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-on-surface">
                      {currency}{ord.bill.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Day End Records Section (if available) */}
      {historicalDayEnds.length > 0 && (
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700 text-lg">history_toggle_off</span>
            <h4 className="font-headline-md text-sm font-black text-on-surface">
              Past Day-End Settlement Archive
            </h4>
          </div>

          <div className="divide-y divide-black/[0.04] text-xs">
            {historicalDayEnds.slice(0, 5).map((snap: any, idx: number) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-on-surface block">{snap.dateFormatted || snap.date}</span>
                  <span className="text-[11px] text-on-surface-variant">
                    {snap.totalOrders} total orders • {snap.settledCount} settled bills
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-800 block">
                    {currency}{(snap.totalRevenue || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    UPI: {currency}{(snap.upiRevenue || 0).toFixed(2)} • Cash: {currency}{(snap.cashRevenue || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
