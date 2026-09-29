import React, { useState } from 'react';
import { CartItem, FulfillmentMode } from '../types';
import { UPSELL_ITEMS } from '../data/menu';
import confetti from 'canvas-confetti';

interface CartBagScreenProps {
  cart: CartItem[];
  fulfillmentMode: FulfillmentMode;
  tableNumber?: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onAddUpsell: (item: { name: string; price: number; image: string }) => void;
  onPlaceOrder: (orderSummary: {
    subtotal: number;
    discount: number;
    tax: number;
    tip: number;
    total: number;
    paymentMethod: string;
  }) => void;
  onShowToast: (msg: string) => void;
  onSelectTab: (tab: string) => void;
  flamePoints: number;
  promoCode: string | null;
}

export const CartBagScreen: React.FC<CartBagScreenProps> = ({
  cart,
  fulfillmentMode,
  tableNumber,
  onUpdateQuantity,
  onRemoveItem,
  onAddUpsell,
  onPlaceOrder,
  onShowToast,
  onSelectTab,
  flamePoints,
  promoCode,
}) => {
  const [redeemPoints, setRedeemPoints] = useState<boolean>(true);
  const [selectedTipPercent, setSelectedTipPercent] = useState<number | 'custom'>(15);
  const [customTipAmount, setCustomTipAmount] = useState<number>(3.5);
  const [isCustomEditing, setIsCustomEditing] = useState<boolean>(false);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Subtotal calculation
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Discount calculation
  let discount = 0;
  if (redeemPoints && flamePoints >= 200 && subtotal > 3) {
    discount += 3.0;
  }
  if (promoCode === 'SIZZLE20') {
    discount += subtotal * 0.2;
  }

  // Tax calculation
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number((taxableAmount * 0.088).toFixed(2));

  // Tip calculation
  let tip = 0;
  if (selectedTipPercent === 'custom') {
    tip = customTipAmount;
  } else {
    tip = Number(((subtotal * selectedTipPercent) / 100).toFixed(2));
  }

  const total = Number((taxableAmount + tax + tip).toFixed(2));

  const handleCheckout = (method = 'Credit Card') => {
    if (cart.length === 0) {
      onShowToast('Your bag is empty! Add some sizzlers first.');
      return;
    }

    setIsCheckingOut(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ac2d00', '#feb700', '#d83900', '#ffdea8'],
      });
    } catch {
      // Ignore if canvas is unavailable
    }

    setTimeout(() => {
      onPlaceOrder({
        subtotal,
        discount,
        tax,
        tip,
        total,
        paymentMethod: method,
      });
      setIsCheckingOut(false);
      onShowToast(`Order placed via ${method}! Kitchen is firing the grill 🔥`);
      onSelectTab('live-order');
    }, 700);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-32 pt-20 px-margin">
      <div className="flex flex-col gap-space-lg pb-6">
        {/* Pickup & Timing Capsule */}
        <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_20px_-4px_rgba(30,27,25,0.06)] relative overflow-hidden border border-black/[0.03]">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[20px] fill-1">
                  {fulfillmentMode === 'dine-in' ? 'table_restaurant' : 'storefront'}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-headline-md text-headline-md text-on-surface">
                    {fulfillmentMode === 'dine-in' && tableNumber
                      ? `Table #${tableNumber} Service`
                      : 'Downtown Sizzle #104'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                    {fulfillmentMode === 'dine-in'
                      ? 'Dine-In Table'
                      : fulfillmentMode === 'curbside'
                      ? 'Curbside Stall'
                      : 'Drive-Thru / In-Store'}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                  Prep starts <strong className="text-on-surface">12:40 PM</strong> • Ready ~
                  <strong className="text-primary font-bold">12:55 PM</strong> (15 min)
                </p>
              </div>
            </div>
            <button
              onClick={() => onShowToast('Prep window locked for freshest temperature')}
              className="px-3 py-1.5 rounded-full bg-surface-container text-primary font-label-md text-label-md flex-shrink-0 transition-transform active:scale-95"
            >
              Edit Window
            </button>
          </div>

          <div
            onClick={() => onSelectTab('curbside')}
            className="mt-space-md pt-3 flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-low px-3 py-2 rounded cursor-pointer hover:bg-surface-container transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">
                local_shipping
              </span>
              <span>
                {fulfillmentMode === 'dine-in'
                  ? `Delivering to Table #${tableNumber || 4} inside main dining`
                  : 'Curbside Stall Spot available on arrival'}
              </span>
            </div>
            <span className="text-primary font-label-sm text-label-sm flex items-center">
              Bays 1-6 <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </span>
          </div>
        </section>

        {/* Cart Items Feed */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              Your Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
            <span className="font-label-md text-label-md text-primary">Order #SB-892</span>
          </div>

          {cart.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-lg p-8 text-center shadow-xs border border-dashed border-outline-variant">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">
                shopping_cart
              </span>
              <p className="font-headline-md text-headline-md text-on-surface">Your bag is empty</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Explore our smashed burgers and chef specials to get started.
              </p>
              <button
                onClick={() => onSelectTab('home')}
                className="mt-4 px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <article
                key={item.id}
                className="bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] flex flex-col gap-space-sm relative border border-black/[0.03]"
              >
                <div className="flex items-start gap-space-md">
                  <div className="w-20 h-20 rounded bg-surface-container flex-shrink-0 overflow-hidden relative">
                    <img
                      className="w-full h-full object-cover"
                      alt={item.name}
                      src={item.image}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1 left-1 bg-surface/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-on-surface font-label-sm text-label-sm">
                      {item.calories} CAL
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-headline-md text-headline-md text-on-surface truncate">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        title="Remove item"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
                      {item.customizationSummary || 'Chef style with house sauces'}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-headline-md text-headline-md text-primary">
                        ${item.totalPrice.toFixed(2)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-surface-container rounded-full p-1 gap-3">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center active:scale-90 transition-transform shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <span className="font-label-lg text-label-lg text-on-surface min-w-[12px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-90 transition-transform shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Smart Upsell Pairing Carousel */}
        <section className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary fill-1">
                stars
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Frequently Paired Together
              </h3>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">CHEFS PICK</span>
          </div>

          <div className="flex gap-space-sm overflow-x-auto no-scrollbar py-1 -mx-margin px-margin">
            {UPSELL_ITEMS.map((upsell) => (
              <div
                key={upsell.id}
                className="bg-surface-container-lowest rounded-lg p-space-sm shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] w-[250px] flex-shrink-0 flex items-center gap-space-sm border border-black/[0.03]"
              >
                <div className="w-16 h-16 rounded bg-surface-container flex-shrink-0 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt={upsell.title}
                    src={upsell.image}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-label-lg text-label-lg text-on-surface truncate">
                    {upsell.title}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {upsell.sub}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-headline-md text-headline-md text-primary">
                      ${upsell.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        onAddUpsell({
                          name: upsell.title,
                          price: upsell.price,
                          image: upsell.image,
                        });
                        onShowToast(`${upsell.title} added to bag!`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm flex items-center gap-0.5 active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Loyalty Rewards Interactive Section */}
        <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] flex flex-col gap-space-sm border border-black/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 font-bold">
                <span className="material-symbols-outlined text-[18px] fill-1">
                  local_fire_department
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface">
                  Sizzle Perks Club
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  You have {flamePoints} flame points
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
              TIER: FLAME
            </span>
          </div>

          {/* Toggle Container */}
          <div className="flex items-center justify-between bg-surface-container-low p-3 rounded mt-1">
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg text-on-surface">Redeem 200 points</span>
              <span className="font-body-sm text-body-sm text-primary font-bold">
                -$3.00 off this feast
              </span>
            </div>
            <button
              onClick={() => {
                setRedeemPoints(!redeemPoints);
                onShowToast(
                  !redeemPoints
                    ? '200 flame points redeemed (-$3.00)!'
                    : 'Reward points restored to your account.'
                );
              }}
              aria-pressed={redeemPoints}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors relative flex items-center ${
                redeemPoints
                  ? 'bg-primary justify-end'
                  : 'bg-surface-container-highest justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-xs flex items-center justify-center text-primary">
                {redeemPoints && (
                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Digital Tip Selector */}
        <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] flex flex-col gap-space-sm border border-black/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Support Kitchen Crew
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                100% of gratuity goes directly to line chefs
              </p>
            </div>
            <span className="material-symbols-outlined text-secondary text-[24px]">favorite</span>
          </div>

          {/* Tip Pills Grid */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[10, 15, 18].map((pct) => {
              const tipVal = ((subtotal * pct) / 100).toFixed(2);
              const isSelected = selectedTipPercent === pct;
              return (
                <button
                  key={pct}
                  onClick={() => {
                    setSelectedTipPercent(pct);
                    setIsCustomEditing(false);
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 rounded transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="font-label-lg text-label-lg">{pct}%</span>
                  <span
                    className={`font-body-sm text-body-sm mt-0.5 ${
                      isSelected ? 'text-on-primary/90' : 'text-on-surface-variant'
                    }`}
                  >
                    ${tipVal}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => {
                setSelectedTipPercent('custom');
                setIsCustomEditing(true);
              }}
              className={`flex flex-col items-center justify-center py-2.5 rounded transition-all active:scale-95 ${
                selectedTipPercent === 'custom'
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="font-label-lg text-label-lg">Custom</span>
              <span
                className={`font-body-sm text-body-sm mt-0.5 ${
                  selectedTipPercent === 'custom' ? 'text-on-primary/90' : 'text-on-surface-variant'
                }`}
              >
                ${customTipAmount.toFixed(2)}
              </span>
            </button>
          </div>

          {isCustomEditing && (
            <div className="flex items-center gap-2 pt-2">
              <span className="font-body-sm text-on-surface-variant">Enter custom tip: $</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={customTipAmount}
                onChange={(e) => setCustomTipAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 px-2 py-1 rounded bg-surface-container text-on-surface text-sm font-bold"
              />
            </div>
          )}
        </section>

        {/* Cost Summary Card */}
        <section className="bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] flex flex-col gap-2.5 border border-black/[0.03]">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">Receipt Summary</h3>

          <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
            <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            <span className="text-on-surface font-medium">${subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between font-body-md text-body-md text-primary">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">redeem</span>
                Rewards &amp; Promos
              </span>
              <span className="font-bold">-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
            <span>Sales Tax &amp; City Surcharge</span>
            <span className="text-on-surface font-medium">${tax.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
            <span>Crew Tip</span>
            <span className="text-on-surface font-medium">${tip.toFixed(2)}</span>
          </div>

          <div className="pt-2 mt-1 flex items-center justify-between bg-surface-container-low p-3 rounded">
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md text-on-surface">Total Due</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Inclusive of all local food taxes
              </span>
            </div>
            <span className="font-headline-xl-mobile text-headline-xl-mobile text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
        </section>

        {/* Bottom Action & Quick Pay Area */}
        <div className="flex flex-col gap-space-sm pt-2">
          {/* Primary Pay Button */}
          <button
            onClick={() => handleCheckout('One-Tap Order')}
            disabled={isCheckingOut || cart.length === 0}
            className="w-full bg-primary hover:bg-tertiary text-on-primary py-4 px-space-md rounded-full shadow-[0_8px_24px_-4px_rgba(255,84,30,0.35)] flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  {isCheckingOut ? 'progress_activity' : 'local_fire_department'}
                </span>
              </div>
              <span className="font-label-lg text-label-lg tracking-wide uppercase">
                {isCheckingOut ? 'Processing Sizzle...' : 'Place Order Now'}
              </span>
            </div>
            <div className="flex items-center gap-1 font-headline-md text-headline-md">
              <span>${total.toFixed(2)}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </div>
          </button>

          {/* Apple / Google Pay Express Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCheckout('Apple Pay')}
              className="w-full bg-on-surface text-surface py-3 px-3 rounded-full flex items-center justify-center gap-1.5 font-label-md text-label-md transition-transform active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">payments</span>
              <span>Apple Pay</span>
            </button>
            <button
              onClick={() => handleCheckout('Google Pay')}
              className="w-full bg-surface-container-high text-on-surface py-3 px-3 rounded-full flex items-center justify-center gap-1.5 font-label-md text-label-md transition-transform active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              <span>Google Pay</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 text-on-surface-variant font-body-sm text-body-sm pt-2">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                verified_user
              </span>
              <span>256-Bit Encrypted</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
              <span>Fresh Off the Grill Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
