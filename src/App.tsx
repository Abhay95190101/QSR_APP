import { useState, useEffect, useRef } from 'react';
import {
  StoreProfile,
  MenuItem,
  OrderRecord,
  OrderStatus,
  LanguageCode,
  StaffUser,
} from './types';
import {
  DEFAULT_STORE_PROFILE,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_STAFF_USERS,
} from './data/storeData';
import { OwnerPortal } from './components/owner/OwnerPortal';
import { CustomerApp } from './components/customer/CustomerApp';
import { QRScanGateway } from './components/QRScanGateway';
import { Toast } from './components/Toast';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { playOrderNotificationChime } from './utils/sound';
import { api } from './services/api';

function dedupeOrders(list: OrderRecord[]): OrderRecord[] {
  const seen = new Set<string>();
  const result: OrderRecord[] = [];
  for (const item of list) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

export default function App() {
  // Store Profile State (Sanitizes currency to INR ₹)
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    const saved = localStorage.getItem('sb_store_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STORE_PROFILE,
          ...parsed,
          currencySymbol: parsed.currencySymbol === '$' ? '₹' : (parsed.currencySymbol || '₹'),
        };
      } catch {
        return DEFAULT_STORE_PROFILE;
      }
    }
    return DEFAULT_STORE_PROFILE;
  });

  // Language State
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('sb_app_language') as LanguageCode;
    return saved && ['en', 'hi', 'mr', 'bn', 'gu', 'ta', 'te'].includes(saved) ? saved : 'en';
  });

  const handleSelectLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem('sb_app_language', lang);
  };

  // Menu Categories State
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('sb_menu_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // Menu Items State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('sb_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  // Orders State (live synced with server & broadcast, deduplicated)
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('sb_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return dedupeOrders(Array.isArray(parsed) ? parsed : INITIAL_ORDERS);
      } catch {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  // Tracks known order IDs to detect newly arrived live orders
  const knownOrderIdsRef = useRef<Set<string>>(new Set(INITIAL_ORDERS.map((o) => o.id)));
  const isInitialLoadDoneRef = useRef<boolean>(false);

  // Staff and Managers state
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('sb_staff_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STAFF_USERS;
      }
    }
    return INITIAL_STAFF_USERS;
  });

  useEffect(() => {
    localStorage.setItem('sb_staff_users', JSON.stringify(staffUsers));
  }, [staffUsers]);

  // Customer Dine-In specific state
  const [customerTable, setCustomerTable] = useState<number | null>(null);
  const [customerZone, setCustomerZone] = useState<string>('Main Dining Room');

  // Owner authentication & testing mode (Owner App by default)
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(true);
  const [isOwnerTesting, setIsOwnerTesting] = useState<boolean>(false);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((cur) => (cur === message ? null : cur));
    }, 4000);
  };

  // Sync state to localStorage for offline resilience
  useEffect(() => {
    localStorage.setItem('sb_store_profile', JSON.stringify(storeProfile));
    api.updateProfile(storeProfile).catch(() => {});
  }, [storeProfile]);

  useEffect(() => {
    localStorage.setItem('sb_menu_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sb_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('sb_orders', JSON.stringify(orders));
  }, [orders]);

  // Check URL query parameters on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tbl = params.get('table');
      const zn = params.get('zone');

      if (tbl) {
        // Customer scanned Table QR Code
        setCustomerTable(parseInt(tbl, 10));
        if (zn) setCustomerZone(decodeURIComponent(zn));
        setIsOwnerTesting(false);
      }
    }
  }, []);

  // --- Real-time Order Sync & Kitchen Bell Ringing ---
  useEffect(() => {
    let isMounted = true;

    // Helper to process incoming orders from server or broadcast
    const syncOrdersWithChime = (freshOrders: OrderRecord[]) => {
      if (!Array.isArray(freshOrders)) return;

      // Detect brand new orders that were not previously known
      const incomingNewOrders: OrderRecord[] = [];
      freshOrders.forEach((ord) => {
        if (!knownOrderIdsRef.current.has(ord.id)) {
          knownOrderIdsRef.current.add(ord.id);
          incomingNewOrders.push(ord);
        }
      });

      // If initial load already completed and new order arrived -> RING CHIME!
      if (incomingNewOrders.length > 0 && isInitialLoadDoneRef.current) {
        console.log('[Live Order Trigger] Ringing kitchen bell for new incoming orders:', incomingNewOrders);
        playOrderNotificationChime();
        const latest = incomingNewOrders[0];
        showToast(`🔔 LIVE ORDER RECEIVED! Table #${latest.tableNumber} - ${latest.orderNumber}`);
      }

      setOrders(dedupeOrders(freshOrders));
    };

    // Initial load from server
    api.getOrders().then((serverOrders) => {
      if (!isMounted) return;
      if (serverOrders && serverOrders.length > 0) {
        serverOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
        setOrders(dedupeOrders(serverOrders));
      }
      isInitialLoadDoneRef.current = true;
    }).catch(() => {
      isInitialLoadDoneRef.current = true;
    });

    // Polling every 1200ms to detect orders placed from phones/scans in real-time
    const pollInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const liveOrders = await api.getOrders();
        if (isMounted && liveOrders) {
          syncOrdersWithChime(liveOrders);
        }
      } catch {
        // Keep polling
      }
    }, 1200);

    // Cross-tab / Window instantaneous broadcast listener (0ms latency)
    const unsubscribeBroadcast = api.onBroadcast((type, payload) => {
      if (type === 'NEW_ORDER' && payload) {
        const newOrder = payload as OrderRecord;
        if (!knownOrderIdsRef.current.has(newOrder.id)) {
          knownOrderIdsRef.current.add(newOrder.id);
          playOrderNotificationChime();
          showToast(`🔔 NEW LIVE ORDER! Table #${newOrder.tableNumber} - ${newOrder.orderNumber}`);
          setOrders((prev) => dedupeOrders([newOrder, ...prev]));
        }
      } else if (type === 'ORDER_STATUS_CHANGED' || type === 'ORDER_SETTLED' || type === 'ORDER_BILL_MODIFIED') {
        api.getOrders().then((o) => isMounted && setOrders(dedupeOrders(o))).catch(() => {});
      }
    });

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      unsubscribeBroadcast();
    };
  }, []);

  // --- Menu Handlers ---
  const handleAddCategory = (newCat: string) => {
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat}" added.`);
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
    showToast(`Category "${cat}" removed.`);
  };

  const handleAddMenuItem = (item: MenuItem) => {
    setMenuItems((prev) => [item, ...prev]);
    showToast(`"${item.name}" added to menu.`);
  };

  const handleUpdateMenuItem = (updated: MenuItem) => {
    setMenuItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    showToast(`"${updated.name}" updated.`);
  };

  const handleRemoveMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Menu item removed.');
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextVal = !item.isAvailable;
          showToast(`"${item.name}" marked ${nextVal ? 'Available' : 'Sold Out'}.`);
          return { ...item, isAvailable: nextVal };
        }
        return item;
      })
    );
  };

  // --- Order & Bill Handlers ---
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : o
      )
    );
    api.updateOrderStatus(orderId, status).catch(() => {});
  };

  const handleModifyBill = (
    orderId: string,
    discount: number,
    serviceCharge: number,
    notes?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const taxable = Math.max(0, o.bill.subtotal - discount);
          const tax = (taxable * storeProfile.taxRate) / 100;
          const total = taxable + tax + serviceCharge;
          return {
            ...o,
            bill: {
              ...o.bill,
              discount,
              serviceCharge,
              tax,
              total,
              notes,
            },
          };
        }
        return o;
      })
    );
    api.modifyBill(orderId, discount, serviceCharge, notes).catch(() => {});
  };

  const handleSettleBill = (
    orderId: string,
    paymentMethod: 'UPI / Online QR' | 'Cash at Counter' | 'Card / Pos' | 'Waived'
  ) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'settled',
              paymentStatus: 'settled',
              bill: {
                ...o.bill,
                settledAt: timeNow,
                paymentMethod,
              },
            }
          : o
      )
    );
    api.settleBill(orderId, paymentMethod).catch(() => {});
  };

  const handleRefreshOrders = async () => {
    try {
      const fresh = await api.getOrders();
      if (fresh) {
        setOrders(fresh);
        showToast('Orders refreshed from live kitchen.');
      }
    } catch {
      showToast('Offline fallback used.');
    }
  };

  // Customer places order from scanned menu
  const handlePlaceCustomerOrder = async (newOrder: OrderRecord) => {
    knownOrderIdsRef.current.add(newOrder.id);
    setOrders((prev) => dedupeOrders([newOrder, ...prev]));
    playOrderNotificationChime();
    showToast(`🔔 New Order Alert: Table #${newOrder.tableNumber} - ${newOrder.orderNumber}`);
    await api.createOrder(newOrder);
  };

  // Owner tests customer menu from inside Owner Portal
  const handleOwnerTestScan = (tblNum: number, zn: string) => {
    setCustomerTable(tblNum);
    setCustomerZone(zn);
    setIsOwnerTesting(true);
    showToast(`Opening customer preview for Table #${tblNum}`);
  };

  // Customer scans / selects table from gateway
  const handleCustomerSelectTable = (tblNum: number, zn: string) => {
    setCustomerTable(tblNum);
    setCustomerZone(zn);
    setIsOwnerTesting(false);
  };

  // Owner PIN login verification
  const handleOwnerLogin = (pin: string): boolean => {
    const validPin = storeProfile.ownerPin || '1234';
    if (pin === validPin) {
      setIsOwnerAuthenticated(true);
      sessionStorage.setItem('sb_owner_authenticated', 'true');
      setCustomerTable(null);
      setIsOwnerTesting(false);
      showToast('Owner Portal unlocked.');
      return true;
    }
    return false;
  };

  // Owner logs out / locks portal
  const handleLockOwnerPortal = () => {
    setIsOwnerAuthenticated(false);
    sessionStorage.removeItem('sb_owner_authenticated');
    setIsOwnerTesting(false);
    showToast('Owner Portal locked.');
  };

  // Customer active order for their table
  const customerActiveOrder = customerTable
    ? orders.find((o) => o.tableNumber === customerTable && o.status !== 'settled') ||
      orders.find((o) => o.tableNumber === customerTable) ||
      null
    : null;

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      {customerTable !== null ? (
        /* CUSTOMER DINE-IN MENU (Accessed via QR scan) */
        <CustomerApp
          storeProfile={storeProfile}
          menuItems={menuItems}
          categories={categories}
          tableNumber={customerTable}
          diningZone={customerZone}
          activeOrder={customerActiveOrder}
          onPlaceCustomerOrder={handlePlaceCustomerOrder}
          onUpdateCustomerOrderStatus={handleUpdateOrderStatus}
          isOwnerTesting={isOwnerTesting}
          onReturnToOwner={isOwnerTesting ? () => setCustomerTable(null) : undefined}
          onShowToast={showToast}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
        />
      ) : isOwnerAuthenticated ? (
        /* OWNER MANAGEMENT PORTAL */
        <OwnerPortal
          storeProfile={storeProfile}
          menuItems={menuItems}
          categories={categories}
          orders={orders}
          staffUsers={staffUsers}
          onUpdateStaffUsers={setStaffUsers}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
          onUpdateStoreProfile={setStoreProfile}
          onAddCategory={handleAddCategory}
          onRemoveCategory={handleRemoveCategory}
          onAddMenuItem={handleAddMenuItem}
          onUpdateMenuItem={handleUpdateMenuItem}
          onRemoveMenuItem={handleRemoveMenuItem}
          onToggleAvailability={handleToggleAvailability}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onModifyBill={handleModifyBill}
          onSettleBill={handleSettleBill}
          onRefreshOrders={handleRefreshOrders}
          onSimulateCustomerScan={handleOwnerTestScan}
          onLockPortal={handleLockOwnerPortal}
          onShowToast={showToast}
        />
      ) : (
        /* SCAN TABLE QR GATEWAY / ENTRY SCREEN */
        <QRScanGateway
          storeProfile={storeProfile}
          onSelectTable={handleCustomerSelectTable}
          onOwnerLogin={handleOwnerLogin}
          onShowToast={showToast}
        />
      )}

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Global Toast Component */}
      <Toast message={toastMessage} />
    </div>
  );
}
