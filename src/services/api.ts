import { OrderRecord, OrderStatus, StoreProfile, MenuItem } from '../types';

// BroadcastChannel for instant cross-tab sync in addition to server polling
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('sb_order_sync_channel')
  : null;

export const api = {
  // Broadcast an event to other tabs/windows
  broadcast(type: string, payload?: any) {
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type, payload, timestamp: Date.now() });
      } catch (e) {
        // ignore
      }
    }
  },

  // Subscribe to cross-tab events
  onBroadcast(callback: (type: string, payload: any) => void) {
    if (!syncChannel) return () => {};
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        callback(event.data.type, event.data.payload);
      }
    };
    syncChannel.addEventListener('message', handler);
    return () => syncChannel.removeEventListener('message', handler);
  },

  // Fetch all orders
  async getOrders(): Promise<OrderRecord[]> {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          return data.orders;
        }
      }
    } catch {
      // fallback to localStorage
    }
    const saved = localStorage.getItem('sb_orders');
    return saved ? JSON.parse(saved) : [];
  },

  // Customer places new order via QR
  async createOrder(orderData: Partial<OrderRecord>): Promise<OrderRecord> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          api.broadcast('NEW_ORDER', data.order);
          return data.order;
        }
      }
    } catch (err) {
      console.warn('API createOrder failed, falling back to local storage', err);
    }

    // Local fallback
    const saved = localStorage.getItem('sb_orders');
    const existing: OrderRecord[] = saved ? JSON.parse(saved) : [];
    const newOrder: OrderRecord = {
      id: orderData.id || `ord-${Date.now()}`,
      orderNumber: orderData.orderNumber || `#SB-${existing.length + 101}`,
      tableNumber: orderData.tableNumber || 1,
      diningZone: orderData.diningZone || 'Main Dining Room',
      customerName: orderData.customerName || 'Dining Guest',
      items: orderData.items || [],
      bill: orderData.bill || { subtotal: 0, discount: 0, serviceCharge: 0, tax: 0, total: 0 },
      status: 'received',
      paymentStatus: 'pending',
      createdAt: orderData.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: orderData.updatedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [newOrder, ...existing];
    localStorage.setItem('sb_orders', JSON.stringify(updated));
    api.broadcast('NEW_ORDER', newOrder);
    return newOrder;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        api.broadcast('ORDER_STATUS_CHANGED', { orderId, status });
        return true;
      }
    } catch {
      // fallback
    }
    api.broadcast('ORDER_STATUS_CHANGED', { orderId, status });
    return false;
  },

  // Modify bill
  async modifyBill(orderId: string, discount: number, serviceCharge: number, notes?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${orderId}/bill`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount, serviceCharge, notes }),
      });
      if (res.ok) {
        api.broadcast('ORDER_BILL_MODIFIED', { orderId, discount, serviceCharge, notes });
        return true;
      }
    } catch {
      // fallback
    }
    api.broadcast('ORDER_BILL_MODIFIED', { orderId, discount, serviceCharge, notes });
    return false;
  },

  // Settle bill
  async settleBill(orderId: string, paymentMethod: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${orderId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod }),
      });
      if (res.ok) {
        api.broadcast('ORDER_SETTLED', { orderId, paymentMethod });
        return true;
      }
    } catch {
      // fallback
    }
    api.broadcast('ORDER_SETTLED', { orderId, paymentMethod });
    return false;
  },

  // Get Store Profile
  async getProfile(): Promise<StoreProfile | null> {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data.profile;
      }
    } catch {
      // fallback
    }
    return null;
  },

  // Save Store Profile
  async updateProfile(profile: StoreProfile): Promise<boolean> {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        api.broadcast('PROFILE_UPDATED', profile);
        return true;
      }
    } catch {
      // fallback
    }
    api.broadcast('PROFILE_UPDATED', profile);
    return false;
  },

  async updateStoreProfile(profile: StoreProfile): Promise<boolean> {
    return this.updateProfile(profile);
  },

  // Perform Manual Day End Settlement
  async executeDayEnd(closeStore = true, archiveOrders = true): Promise<any> {
    try {
      const res = await fetch('/api/day-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closeStore, archiveOrders }),
      });
      if (res.ok) {
        api.broadcast('DAY_END_COMPLETED', { timestamp: Date.now() });
        return await res.json();
      }
    } catch {
      // fallback
    }
    api.broadcast('DAY_END_COMPLETED', { timestamp: Date.now() });
    return { success: true };
  },

  // Get Menu
  async getMenu(): Promise<{ categories: string[]; items: MenuItem[] } | null> {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return { categories: data.categories, items: data.items };
        }
      }
    } catch {
      // fallback
    }
    return null;
  },
};
