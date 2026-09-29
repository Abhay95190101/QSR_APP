import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Core Data Types for Server State ---
interface BillDetail {
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  settledAt?: string;
  paymentMethod?: string;
  notes?: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  tableNumber: number;
  diningZone: string;
  customerName?: string;
  items: any[];
  status: 'received' | 'preparing' | 'served' | 'settled' | 'cancelled';
  paymentStatus: 'pending' | 'paid_online' | 'cash_at_counter' | 'settled';
  createdAt: string;
  createdDate?: string;
  timestamp?: number;
  updatedAt: string;
  bill: BillDetail;
  soundAlertPlayed?: boolean;
}

interface StoreProfile {
  name: string;
  tagline: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone: string;
  email: string;
  website?: string;
  upiId: string;
  upiMerchantName?: string;
  taxRate: number;
  serviceCharge: number;
  gstin?: string;
  fssaiNumber?: string;
  currencySymbol: string;
  logoUrl: string;
  bannerUrl?: string;
  qrLogoUrl: string;
  wifiName?: string;
  wifiPassword?: string;
  isOpen: boolean;
  openingTime?: string;
  closingTime?: string;
  totalTables?: number;
  diningZones?: string[];
  ownerPin?: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  calories: number;
  prepTime: string;
  image: string;
  badge?: string;
  badgeType?: 'primary' | 'secondary' | 'neutral';
  isAvailable: boolean;
  isCustomizable?: boolean;
  dietary?: string;
  isFavorite?: boolean;
  translations?: Record<string, any>;
}

// Initial Data Defaults
const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'SS Cafe & Restaurant',
  tagline: 'Gourmet Cafe, Handcrafted Smash Eats & Beverages',
  description: 'Artisan cafe brews, handcrafted smash eats, specialty coffee, and craft gourmet delights.',
  address: 'Connaught Circle, Central Hub, New Delhi',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
  phone: '+91 98765 43210',
  email: 'hello@sscafe.in',
  website: 'https://sscafe.in',
  upiId: 'sscafe@oksbi',
  upiMerchantName: 'SS Cafe & Restaurant',
  taxRate: 5.0,
  serviceCharge: 2.5,
  gstin: '07AAAAA1234A1Z5',
  fssaiNumber: '13324001000543',
  currencySymbol: '₹',
  logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLL1KjCv8s3qhLdqSjnngCsg3eOupfkcQC9IMhn_F4K8sh3SEJIvMS4m8J-R5tTkE2rCDmVm3yj55H1lprBj1BzFE0iq4wwW0DHaonWMSi-z_igFVHCK_Abn_DjOi0sElh3avLXHb_Zosa8RVsoBu-kvzO2vG0n_WVDzHMm7nyekANOCaanpy7a-bTa06RpjEVGVxDnVNQuqPWX7oSAm-yJpVrT4Q8zJX0ctP5-Shbmgq4jYkpHGWEDw',
  bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
  qrLogoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLL1KjCv8s3qhLdqSjnngCsg3eOupfkcQC9IMhn_F4K8sh3SEJIvMS4m8J-R5tTkE2rCDmVm3yj55H1lprBj1BzFE0iq4wwW0DHaonWMSi-z_igFVHCK_Abn_DjOi0sElh3avLXHb_Zosa8RVsoBu-kvzO2vG0n_WVDzHMm7nyekANOCaanpy7a-bTa06RpjEVGVxDnVNQuqPWX7oSAm-yJpVrT4Q8zJX0ctP5-Shbmgq4jYkpHGWEDw',
  wifiName: 'SSCafe_Guest',
  wifiPassword: 'eatmoreburgers',
  isOpen: true,
  openingTime: '11:00 AM',
  closingTime: '11:30 PM',
  totalTables: 16,
  diningZones: ['Main Dining Room', 'Patio Garden', 'Rooftop Lounge', 'Cafe Bar'],
  ownerPin: '1234',
};

const INITIAL_CATEGORIES: string[] = [
  'Smashburgers',
  'Crispy Chicken',
  'Loaded Fries',
  'Shakes & Sips',
  'Desserts & Snacks',
];

const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'truffle-ember-smash',
    name: 'Truffle Ember Smash',
    category: 'Smashburgers',
    price: 299,
    description: 'Double grass-fed smash patties, aged smoked gouda, savory black truffle aioli, charred sweet shallots on toasted brioche bun.',
    calories: 780,
    prepTime: '8-10 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlUNm4zJcjZFgrfU3YesBrPA05Y5yWBcZbxWak9BeUQPUW_3ZeVY-PJE9wa7v_8Sm-gToI3_I7FxI-C7xnMv1JQC9m9QFQa4h_M0f8pxFOczkyAqh1g6AEj8BfOexgI-aGPFIVE4nUCZSWbLzX07Bhgi4QL1ZHZWnH8aCKUTg4g7gEje_m82_ELVLc3PE9U0GDlw5tSXQccFiss-aMeqmTq5lJ7QDInbHNUGaugh6mGWqEnMnkIqDkFw',
    badge: 'CHEF SPECIAL',
    badgeType: 'primary',
    isAvailable: true,
    dietary: 'Specialty Beef',
  },
  {
    id: 'double-sizzle-smash',
    name: 'The Double Sizzle Smash',
    category: 'Smashburgers',
    price: 279,
    description: 'Two smashed patties with lace-crispy edges, double American cheddar, bread-and-butter pickles, secret Ember sauce.',
    calories: 820,
    prepTime: '7-9 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClRm3N0nDhuETUc_J8IsBtbuFRf0vO59Wb_cr-CY9o6z0iXliOfIZG6_zNuiw1n0FDiqHbQSTuUKQeDAbOg5eaYvcAomKXA19NgEWRDv9I8GeXK4XT4xXDd41BR83YGfkeZGa6Z1UBt2DMxaPlW1RudZTrgRIprsYX3PEmzMxCW3YnPP_HArrhDhkGC_jqSt3lOWri0pgA2Lx1dXVy-ILhdXAOenoVRsS2IkX2Mauy4BopQMbAZ6Il7Q',
    badge: 'BESTSELLER',
    badgeType: 'primary',
    isAvailable: true,
    dietary: 'Classic Beef',
  },
  {
    id: 'parmesan-truffle-fries',
    name: 'Parmesan Herb Truffle Fries',
    category: 'Loaded Fries',
    price: 149,
    description: 'Crispy skin-on fries tossed in white truffle oil, grated aged parmesan, roasted garlic, fresh rosemary and parsley.',
    calories: 420,
    prepTime: '4-6 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkmVkZgPsw-bIrRAau8uJNP2fe6VaQtf_U6lHqSJ4jKqLuEmWZACbnbyFTlu4RSPGaNmKJPx892RzPGGzq61H_51GQrDAobGjRnDYPhmAI-AeftaZKkCf3QpBCr0iS-Ht4t-qYZ6wkpPSAOH0WaQfhLEvfCIqkq8hotRop6Ou0SszjVkLg1DOlrhAYg9zb_i9YL4Q-jEGXQzMGsTweR1E8w6Fz0sp5Ylb_V2wZaOc7646lE6Dkie5lTw',
    badge: 'MUST TRY',
    badgeType: 'secondary',
    isAvailable: true,
    dietary: 'Vegetarian',
  },
];

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ord-101',
    orderNumber: 'SB-101',
    tableNumber: 4,
    diningZone: 'Main Dining Room',
    customerName: 'Priya Sharma',
    items: [
      {
        id: 'item-101-1',
        menuItemId: 'double-sizzle-smash',
        name: 'The Double Sizzle Smash',
        basePrice: 279,
        totalPrice: 279,
        quantity: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClRm3N0nDhuETUc_J8IsBtbuFRf0vO59Wb_cr-CY9o6z0iXliOfIZG6_zNuiw1n0FDiqHbQSTuUKQeDAbOg5eaYvcAomKXA19NgEWRDv9I8GeXK4XT4xXDd41BR83YGfkeZGa6Z1UBt2DMxaPlW1RudZTrgRIprsYX3PEmzMxCW3YnPP_HArrhDhkGC_jqSt3lOWri0pgA2Lx1dXVy-ILhdXAOenoVRsS2IkX2Mauy4BopQMbAZ6Il7Q',
        calories: 820,
        customizationSummary: 'Extra Ember Sauce, Toasted Brioche',
      },
    ],
    status: 'preparing',
    paymentStatus: 'pending',
    createdAt: '12:45 PM',
    createdDate: new Date().toISOString().slice(0, 10),
    updatedAt: '12:45 PM',
    bill: {
      subtotal: 279,
      discount: 0,
      tax: 13.95,
      serviceCharge: 6.98,
      total: 299.93,
    },
    soundAlertPlayed: true,
  },
];

// In-Memory Live State
let storeProfile: StoreProfile = { ...DEFAULT_STORE_PROFILE };
let menuCategories: string[] = [...INITIAL_CATEGORIES];
let menuItems: MenuItem[] = [...INITIAL_MENU_ITEMS];
let orders: OrderRecord[] = [...INITIAL_ORDERS];
let archivedOrders: OrderRecord[] = [];
let orderCounter = 105;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body parsing
  app.use(express.json({ limit: '15mb' }));

  // PWA Root Assets: Manifest and Service Worker with appropriate headers
  app.get('/manifest.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
  });

  app.get('/sw.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'public, max-age=0, no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(__dirname, 'public', 'sw.js'));
  });

  // --- API Endpoints ---

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // 1. ORDERS API
  app.get('/api/orders', (req, res) => {
    const includeArchived = req.query.includeArchived === 'true';
    if (includeArchived) {
      const combined = [...orders, ...archivedOrders];
      const unique = Array.from(new Map(combined.map((o) => [o.id, o])).values());
      return res.json({ success: true, orders: unique });
    }
    res.json({ success: true, orders });
  });

  app.get('/api/reports/all-orders', (_req, res) => {
    const combined = [...orders, ...archivedOrders];
    const unique = Array.from(new Map(combined.map((o) => [o.id, o])).values());
    res.json({ success: true, orders: unique });
  });

  app.post('/api/orders', (req, res) => {
    try {
      const incoming = req.body as Partial<OrderRecord>;

      // Deduplicate if already exists
      if (incoming.id && orders.some((o) => o.id === incoming.id)) {
        const existing = orders.find((o) => o.id === incoming.id)!;
        return res.status(200).json({ success: true, order: existing });
      }

      orderCounter += 1;
      const orderNumber = incoming.orderNumber || `#SB-${orderCounter}`;
      const now = new Date();

      const newOrder: OrderRecord = {
        id: incoming.id || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        orderNumber,
        tableNumber: incoming.tableNumber || 1,
        diningZone: incoming.diningZone || 'Main Dining Room',
        customerName: incoming.customerName || 'Dining Guest',
        items: incoming.items || [],
        bill: incoming.bill || {
          subtotal: 0,
          discount: 0,
          serviceCharge: 0,
          tax: 0,
          total: 0,
        },
        status: 'received',
        paymentStatus: 'pending',
        createdAt: incoming.createdAt || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdDate: incoming.createdDate || now.toISOString().slice(0, 10),
        timestamp: Date.now(),
        updatedAt: incoming.updatedAt || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      orders = [newOrder, ...orders.filter((o) => o.id !== newOrder.id)];
      console.log(`[Order API] Placed new order ${newOrder.orderNumber} for Table #${newOrder.tableNumber}`);

      res.status(201).json({ success: true, order: newOrder });
    } catch (err: any) {
      console.error('[Order API Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let found = false;

    orders = orders.map((o) => {
      if (o.id === id) {
        found = true;
        return {
          ...o,
          status,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return o;
    });

    if (found) {
      res.json({ success: true, status });
    } else {
      res.status(404).json({ success: false, error: 'Order not found' });
    }
  });

  app.patch('/api/orders/:id/bill', (req, res) => {
    const { id } = req.params;
    const { discount = 0, serviceCharge = 0, notes } = req.body;
    let updatedOrder: OrderRecord | null = null;

    orders = orders.map((o) => {
      if (o.id === id) {
        const taxable = Math.max(0, o.bill.subtotal - discount);
        const tax = (taxable * storeProfile.taxRate) / 100;
        const total = taxable + tax + serviceCharge;
        updatedOrder = {
          ...o,
          bill: {
            ...o.bill,
            discount,
            serviceCharge,
            tax,
            total,
            notes: notes !== undefined ? notes : o.bill.notes,
          },
        };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      res.json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, error: 'Order not found' });
    }
  });

  app.post('/api/orders/:id/settle', (req, res) => {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    let updatedOrder: OrderRecord | null = null;

    orders = orders.map((o) => {
      if (o.id === id) {
        updatedOrder = {
          ...o,
          status: 'settled',
          paymentStatus: 'settled',
          bill: {
            ...o.bill,
            settledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            paymentMethod: paymentMethod || 'UPI / Online QR',
          },
        };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      res.json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, error: 'Order not found' });
    }
  });

  // 2. STORE PROFILE API
  app.get('/api/profile', (_req, res) => {
    res.json({ success: true, profile: storeProfile });
  });

  app.post('/api/profile', (req, res) => {
    storeProfile = { ...storeProfile, ...req.body };
    res.json({ success: true, profile: storeProfile });
  });

  // 3. MENU API
  app.get('/api/menu', (_req, res) => {
    res.json({
      success: true,
      categories: menuCategories,
      items: menuItems,
    });
  });

  app.post('/api/menu/items', (req, res) => {
    const { item } = req.body;
    if (item && item.id) {
      const exists = menuItems.some((i) => i.id === item.id);
      if (exists) {
        menuItems = menuItems.map((i) => (i.id === item.id ? item : i));
      } else {
        menuItems = [item, ...menuItems];
      }
      res.json({ success: true, items: menuItems });
    } else {
      res.status(400).json({ success: false, error: 'Invalid item data' });
    }
  });

  app.delete('/api/menu/items/:id', (req, res) => {
    const { id } = req.params;
    menuItems = menuItems.filter((i) => i.id !== id);
    res.json({ success: true, items: menuItems });
  });

  app.patch('/api/menu/items/:id/availability', (req, res) => {
    const { id } = req.params;
    let nextVal = false;
    menuItems = menuItems.map((i) => {
      if (i.id === id) {
        nextVal = !i.isAvailable;
        return { ...i, isAvailable: nextVal };
      }
      return i;
    });
    res.json({ success: true, isAvailable: nextVal, items: menuItems });
  });

  app.post('/api/menu/categories', (req, res) => {
    const { category, action } = req.body;
    if (action === 'delete') {
      menuCategories = menuCategories.filter((c) => c !== category);
    } else if (category && !menuCategories.includes(category)) {
      menuCategories.push(category);
    }
    res.json({ success: true, categories: menuCategories });
  });

  // 4. DAY END MANUAL SETTLEMENT API
  app.post('/api/day-end', (req, res) => {
    try {
      const { closeStore = true, archiveOrders = true } = req.body;
      if (archiveOrders) {
        // Push current active orders to permanent archivedOrders ledger
        archivedOrders = [...orders, ...archivedOrders];
        orderCounter = 100;
        orders = [];
      }
      if (closeStore) {
        storeProfile.isOpen = false;
      }
      console.log(`[Day End] Operation completed on server. Store isOpen: ${storeProfile.isOpen}, Archived orders total: ${archivedOrders.length}`);
      res.json({
        success: true,
        message: 'Day end executed successfully',
        isOpen: storeProfile.isOpen,
        ordersCount: orders.length,
        archivedCount: archivedOrders.length,
      });
    } catch (err: any) {
      console.error('[Day End Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- VITE MIDDLEWARE (Dev vs Prod) ---
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Sizzle & Bun Restaurant Server listening on 0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Error]', err);
  process.exit(1);
});
