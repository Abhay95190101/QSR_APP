import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { StoreProfile, MenuItem, OrderRecord, CartItem, LanguageCode } from '../../types';
import { api } from '../../services/api';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  getLocalizedItem,
  getLocalizedCategory,
} from '../../utils/i18n';

interface CustomerAppProps {
  storeProfile: StoreProfile;
  menuItems: MenuItem[];
  categories: string[];
  tableNumber: number;
  diningZone: string;
  activeOrder: OrderRecord | null;
  onPlaceCustomerOrder: (order: OrderRecord) => void;
  onUpdateCustomerOrderStatus: (orderId: string, status: any) => void;
  isOwnerTesting?: boolean;
  onReturnToOwner?: () => void;
  onShowToast: (msg: string) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  storeProfile,
  menuItems,
  categories,
  tableNumber,
  diningZone,
  activeOrder,
  onPlaceCustomerOrder,
  isOwnerTesting = false,
  onReturnToOwner,
  onShowToast,
  currentLanguage,
  onSelectLanguage,
}) => {
  // Welcome state
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);
  const [customerName, setCustomerName] = useState<string>('Guest');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showLangModal, setShowLangModal] = useState<boolean>(false);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  const currency = storeProfile.currencySymbol || '₹';
  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.en;
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Generate UPI QR code for bill payment
  const orderTotal = activeOrder ? activeOrder.bill.total : 0;
  const upiIntentString = `upi://pay?pa=${storeProfile.upiId}&pn=${encodeURIComponent(storeProfile.name)}&am=${orderTotal.toFixed(2)}&cu=INR&tn=Table_${tableNumber}_Order`;

  useEffect(() => {
    if (showPaymentModal && storeProfile.upiId) {
      QRCode.toDataURL(upiIntentString, {
        width: 280,
        margin: 1.5,
        color: {
          dark: '#1e1b19',
          light: '#ffffff',
        },
      })
        .then((url) => setUpiQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [showPaymentModal, upiIntentString, storeProfile.upiId]);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    if (!item.isAvailable) return;
    const localized = getLocalizedItem(item, currentLanguage);
    const existingIndex = cart.findIndex((c) => c.menuItemId === item.id);
    if (existingIndex > -1) {
      setCart((prev) =>
        prev.map((c, idx) =>
          idx === existingIndex
            ? {
                ...c,
                quantity: c.quantity + 1,
                totalPrice: (c.quantity + 1) * c.basePrice,
              }
            : c
        )
      );
    } else {
      const newCartItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        menuItemId: item.id,
        name: localized.name,
        basePrice: item.price,
        totalPrice: item.price,
        quantity: 1,
        image: item.image,
        calories: item.calories,
      };
      setCart((prev) => [...prev, newCartItem]);
    }
    onShowToast(`Added "${localized.name}" to cart`);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0
              ? {
                  ...item,
                  quantity: nextQty,
                  totalPrice: nextQty * item.basePrice,
                }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTax = (cartSubtotal * storeProfile.taxRate) / 100;
  const cartService = (cartSubtotal * storeProfile.serviceCharge) / 100;
  const cartTotal = cartSubtotal + cartTax + cartService;

  // Customer places order
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const newOrderNumber = `#SB-${Math.floor(100 + Math.random() * 900)}`;

    const now = new Date();
    const newOrderRecord: OrderRecord = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderNumber: newOrderNumber,
      tableNumber,
      diningZone,
      customerName: customerName.trim() || 'Dining Guest',
      items: [...cart],
      status: 'received',
      paymentStatus: 'pending',
      createdAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdDate: now.toISOString().slice(0, 10),
      timestamp: Date.now(),
      updatedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bill: {
        subtotal: cartSubtotal,
        discount: 0,
        tax: cartTax,
        serviceCharge: cartService,
        total: cartTotal,
      },
      soundAlertPlayed: false,
    };

    // Handled centrally by App.tsx
    onPlaceCustomerOrder(newOrderRecord);
    setCart([]);
    setShowCartDrawer(false);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ac2d00', '#feb700', '#d83900'],
      });
    } catch {
      // safe fallback
    }

    onShowToast(`Order ${newOrderNumber} placed! Kitchen is firing up your meal.`);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const localized = getLocalizedItem(item, currentLanguage);
    const matchSearch =
      localized.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localized.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartTotalCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col justify-between max-w-xl mx-auto shadow-2xl relative">
      {/* Top Banner when Owner is testing scan view */}
      {isOwnerTesting && onReturnToOwner && (
        <div className="sticky top-0 z-50 bg-neutral-900 text-white px-4 py-2 flex items-center justify-between text-xs font-bold border-b border-white/10">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Testing Table #{tableNumber} View
          </span>
          <button
            onClick={onReturnToOwner}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-extrabold flex items-center gap-1 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Return to Owner Portal</span>
          </button>
        </div>
      )}

      {/* Top Fixed Header with Restaurant branding */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-black/[0.04] p-3 px-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-black/5 flex items-center justify-center p-1 flex-shrink-0">
            <img
              src={storeProfile.logoUrl}
              alt={storeProfile.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-headline-md text-sm sm:text-base text-on-surface truncate font-black leading-tight">
              {storeProfile.name}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant truncate">
              <span className="px-1.5 py-0.2 rounded-full bg-secondary-container text-on-secondary-container font-black uppercase text-[9px]">
                {t.tableNumber} #{tableNumber}
              </span>
              <span className="truncate">{diningZone}</span>
            </div>
          </div>
        </div>

        {/* Quick actions: Mobile APK, Language button & Cart Bag button */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Mobile App & APK Button */}
          <PWAInstallButton variant="compact" onShowToast={onShowToast} />

          {/* LANGUAGE BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowLangModal(!showLangModal)}
              title="Change Language"
              className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1 border border-black/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">translate</span>
              <span className="text-[11px]">{currentLangObj.nativeLabel}</span>
            </button>

            {/* Language Flyout */}
            {showLangModal && (
              <div className="absolute right-0 top-10 w-44 bg-surface-container-lowest rounded-2xl shadow-xl border border-black/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                  {t.selectLanguage}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setShowLangModal(false);
                      onShowToast(`Language: ${lang.nativeLabel}`);
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

          {/* Cart Bag button */}
          <button
            onClick={() => setShowCartDrawer(true)}
            className="relative w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            {cartTotalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {cartTotalCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-3.5 pb-28 space-y-4">
        {/* Closed Store Warning */}
        {!storeProfile.isOpen && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-amber-700 flex-shrink-0">schedule</span>
            <div>
              <strong className="block font-bold">Kitchen Currently Closed</strong>
              <span>You can browse the menu, but ordering is paused temporarily.</span>
            </div>
          </div>
        )}

        {/* Active Order Tracker Card (if user has active placed order) */}
        {activeOrder && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-md border-2 border-primary/20 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <span className="font-headline-md text-sm font-bold text-on-surface">
                  {t.orderReceived}: {activeOrder.orderNumber}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  activeOrder.status === 'settled'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeOrder.status === 'served'
                    ? 'bg-blue-100 text-blue-800'
                    : activeOrder.status === 'preparing'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {activeOrder.status}
              </span>
            </div>

            {/* Stepper Progress */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mb-1">
                  ✓
                </div>
                <span className="font-bold text-on-surface">{t.orderReceived}</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${
                    activeOrder.status === 'preparing' || activeOrder.status === 'served' || activeOrder.status === 'settled'
                      ? 'bg-primary text-on-primary ring-2 ring-primary/30'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  2
                </div>
                <span className="font-bold text-on-surface">{t.preparingInKitchen}</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${
                    activeOrder.status === 'served' || activeOrder.status === 'settled'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  3
                </div>
                <span className="font-bold text-on-surface">{t.servedToTable}</span>
              </div>
            </div>

            {/* Order Items Snapshot */}
            <div className="bg-surface-container-low p-2.5 rounded-xl space-y-1 text-xs">
              {activeOrder.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.quantity}× {i.name}</span>
                  <span className="font-semibold">{currency}{i.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* If items are served, customer can view bill and pay via UPI or Cash */}
            {activeOrder.status === 'served' && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Items Served! Your Total Bill:</span>
                  <span className="text-base text-primary font-black">
                    {currency}{activeOrder.bill.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Ready to settle? Pay instantly via UPI QR or pay cash at the counter.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code</span>
                    {t.payViaUpi}
                  </button>
                  <button
                    onClick={() => onShowToast(`Please inform the cashier that you are paying Cash for Table #${tableNumber}.`)}
                    className="py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    {t.cashAtCounter}
                  </button>
                </div>
              </div>
            )}

            {/* Thank you note if order is settled */}
            {activeOrder.status === 'settled' && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-1 animate-in zoom-in-95">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1">
                  <span className="material-symbols-outlined text-[24px]">done_all</span>
                </div>
                <h4 className="font-headline-md text-base text-on-surface font-extrabold">
                  {t.billSettled}
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Your bill for Table #{tableNumber} is settled. Thank you for dining at {storeProfile.name}!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="space-y-2.5">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchDishes}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-surface-container text-on-surface text-xs font-medium placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-xs border border-black/5"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => {
              const localizedCat = getLocalizedCategory(cat, currentLanguage);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {localizedCat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items List (Mobile-Optimized Cards) */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const loc = getLocalizedItem(item, currentLanguage);
            return (
              <div
                key={item.id}
                className={`bg-surface-container-lowest rounded-2xl p-3 shadow-xs border transition-all flex gap-3 ${
                  item.isAvailable ? 'border-black/[0.04]' : 'border-neutral-200 opacity-60'
                }`}
              >
                {/* Dish Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-surface-container flex-shrink-0 relative">
                  <img
                    src={item.image}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-black uppercase">
                      {t.soldOut}
                    </div>
                  )}
                  {item.calories && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white font-label-sm text-[9px] px-1 py-0.2 rounded-md">
                      {item.calories} CAL
                    </span>
                  )}
                </div>

                {/* Dish Info & Add Button */}
                <div className="flex flex-col flex-1 min-w-0 justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-headline-md text-sm sm:text-base text-on-surface font-extrabold truncate">
                        {loc.name}
                      </h3>
                      <span className="font-headline-md text-sm sm:text-base font-black text-primary whitespace-nowrap">
                        {currency}{item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="font-body-sm text-[11px] sm:text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                      {loc.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.2 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                        {item.prepTime}
                      </span>
                      {loc.dietary && (
                        <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-on-surface-variant text-[10px] hidden xs:inline-block">
                          {loc.dietary}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable}
                      className={`px-3 py-1.5 rounded-xl font-label-md text-xs font-extrabold flex items-center gap-1 shadow-xs transition-all ${
                        item.isAvailable
                          ? 'bg-primary hover:bg-primary-container text-on-primary active:scale-95'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>{t.addToOrder}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar (Mobile Layout Optimized) */}
      {cart.length > 0 && (
        <div className="fixed bottom-3 left-3 right-3 max-w-xl mx-auto z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-neutral-900 text-white rounded-2xl p-3 px-4 shadow-2xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm">
                {cartTotalCount}
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-bold block">
                  {cartTotalCount} Dishes Selected
                </span>
                <span className="font-headline-md text-base font-black text-white">
                  {currency}{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <span>{t.viewCart}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative max-h-[85vh] flex flex-col border border-black/10">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">shopping_cart</span>
                <h3 className="font-headline-md text-base font-black text-on-surface">
                  {t.orderSummary} (Table #{tableNumber})
                </h3>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant text-xs">
                  Your cart is empty. Add dishes from the menu!
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-surface-container/50 border border-black/5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-on-surface truncate">{item.name}</h4>
                      <span className="text-[11px] font-bold text-primary">
                        {currency}{item.basePrice.toFixed(2)} each
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white rounded-lg border border-black/10 p-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-black text-on-surface flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-on-surface">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-black text-on-surface flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-xs text-on-surface w-14 text-right">
                        {currency}{item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill Summary & Order Button */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-black/[0.06] space-y-2 flex-shrink-0">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>{t.subtotal}</span>
                    <span>{currency}{cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>{t.tax} ({storeProfile.taxRate}%)</span>
                    <span>{currency}{cartTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>{t.serviceCharge} ({storeProfile.serviceCharge}%)</span>
                    <span>{currency}{cartService.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-black text-base text-on-surface pt-1 border-t border-black/[0.04]">
                    <span>{t.total}</span>
                    <span className="text-primary">{currency}{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-headline-md text-sm font-black flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all mt-2"
                >
                  <span className="material-symbols-outlined text-[20px]">room_service</span>
                  <span>{t.placeOrder} ({currency}{cartTotal.toFixed(2)})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPI Payment Modal (Contactless Pay) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-5 shadow-2xl text-center space-y-3.5 border border-black/10">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <span className="font-headline-md text-sm font-bold text-on-surface">
                {t.payViaUpi} • Table #{tableNumber}
              </span>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[11px] text-on-surface-variant block uppercase font-bold">
                Total Bill Amount (INR)
              </span>
              <div className="font-headline-xl text-3xl font-black text-primary">
                {currency}{orderTotal.toFixed(2)}
              </div>
            </div>

            {/* Generated UPI QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-inner border-2 border-primary/20">
                {upiQrDataUrl ? (
                  <img src={upiQrDataUrl} alt="UPI Payment QR" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs">Generating UPI QR...</div>
                )}
              </div>
              <span className="text-[11px] text-on-surface-variant mt-2">
                Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI App
              </span>
            </div>

            {/* UPI ID copy pill */}
            <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] truncate max-w-[200px] text-on-surface font-semibold">
                {storeProfile.upiId}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(storeProfile.upiId);
                  setCopiedUpi(true);
                  setTimeout(() => setCopiedUpi(false), 2000);
                  onShowToast('UPI ID copied to clipboard!');
                }}
                className="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-[10px] font-bold"
              >
                {copiedUpi ? 'Copied!' : 'Copy UPI'}
              </button>
            </div>

            <button
              onClick={() => {
                setShowPaymentModal(false);
                onShowToast('Thank you! Bill payment recorded.');
              }}
              className="w-full py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* Welcome Splash Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-black/10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center p-2.5 border border-primary/20">
              <img
                src={storeProfile.logoUrl}
                alt={storeProfile.name}
                className="w-full h-full object-contain animate-bounce"
              />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-black text-[10px] uppercase">
                {t.tableNumber} #{tableNumber} • {diningZone}
              </span>
              <h2 className="font-headline-md text-xl font-black text-on-surface mt-1.5">
                Welcome to {storeProfile.name}!
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                {storeProfile.tagline}
              </p>
            </div>

            {/* Language Selection Quick Strip */}
            <div className="p-2.5 rounded-2xl bg-surface-container/60 border border-black/5 text-left space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                {t.selectLanguage}
              </span>
              <div className="grid grid-cols-3 gap-1">
                {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onSelectLanguage(lang.code)}
                    className={`py-1 px-1 rounded-lg text-center text-xs font-bold transition-all ${
                      currentLanguage === lang.code
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-white hover:bg-surface-container text-on-surface border border-black/5'
                    }`}
                  >
                    {lang.nativeLabel}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-headline-md text-xs font-black shadow-md active:scale-95 transition-all"
            >
              Explore Menu &amp; Order ({currency})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
