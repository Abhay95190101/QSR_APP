export type AppRole = 'owner' | 'customer';

export type FulfillmentMode = 'pickup' | 'curbside' | 'delivery' | 'dine-in';

export interface StoreProfile {
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
  taxRate: number; // percentage e.g. 5 for 5%
  serviceCharge: number; // percentage e.g. 2.5%
  gstin?: string; // GST Number e.g. 27AAAAA0000A1Z5
  fssaiNumber?: string; // 14-digit FSSAI food license number
  currencySymbol: string;
  logoUrl: string;
  bannerUrl?: string;
  qrLogoUrl: string;
  wifiName?: string;
  wifiPassword?: string;
  isOpen: boolean;
  openingTime?: string; // e.g. "11:00 AM"
  closingTime?: string; // e.g. "11:00 PM"
  totalTables?: number; // e.g. 15
  diningZones?: string[]; // e.g. ["Main Dining", "Patio Garden", "Rooftop Deck", "Bar Lounge"]
  ownerPin?: string; // 4-digit security PIN to access Owner Portal
}

export type StaffRole = 'owner' | 'manager' | 'kitchen' | 'waiter' | 'cashier';

export interface StaffUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: StaffRole;
  pin: string; // 4-digit PIN for access
  assignedZone?: string; // e.g. "All Zones", "Main Dining", "Kitchen"
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
}

export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te' | 'gu' | 'es' | 'fr' | 'ar';

export interface MenuItemTranslation {
  name: string;
  description: string;
  dietary?: string;
}

export interface MenuItem {
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
  translations?: Partial<Record<LanguageCode, MenuItemTranslation>>;
}

export interface BurgerCustomization {
  bun: { name: string; price: number };
  patty: { name: string; price: number; extraCals?: number };
  cheeses: { name: string; price: number }[];
  addons: { name: string; price: number }[];
  isCombo: boolean;
  comboPrice: number;
  specialInstructions: string;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  totalPrice: number;
  quantity: number;
  image: string;
  calories: number;
  customizationSummary?: string;
  specialInstructions?: string;
  customizationDetails?: BurgerCustomization;
}

export type OrderStatus = 'received' | 'preparing' | 'served' | 'settled' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid_online' | 'cash_at_counter' | 'settled';

export interface BillDetail {
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  settledAt?: string;
  paymentMethod?: 'UPI / Online QR' | 'Cash at Counter' | 'Card / Pos' | 'Waived';
  notes?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string; // e.g. "SB-101"
  tableNumber: number;
  diningZone: string;
  customerName?: string;
  items: CartItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  createdDate?: string; // ISO date YYYY-MM-DD
  timestamp?: number;
  updatedAt: string;
  bill: BillDetail;
  soundAlertPlayed?: boolean;
}

export type OrderStep = 1 | 2 | 3 | 4;

export interface OrderState {
  orderId: string;
  orderNumber: string;
  status: 'cooking' | 'packaging' | 'ready' | 'delivered';
  currentStep: OrderStep;
  createdAt: string;
  estimatedReadyTime: string;
  remainingMinutes: number;
  fulfillmentMode: FulfillmentMode;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  tip: number;
  total: number;
  lockerNumber: string;
  lockerPin: string;
  stallNumber: string;
  vehicleInfo: {
    description: string;
    licensePlate: string;
  };
  tableNumber?: number;
  diningZone?: string;
  checkedIn: boolean;
  hazardLightsOn: boolean;
  runnerNotified: boolean;
  paymentMethod: string;
  rating?: number;
  ratingTags?: string[];
  extraFeedback?: string;
}

export interface TableQRInfo {
  tableNumber: number;
  zone: string;
  seats: number;
  promoCode: string;
  qrUrl: string;
  qrDataUrl: string;
}
