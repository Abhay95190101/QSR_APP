import React, { useState } from 'react';
import { MENU_ITEMS, YOUR_USUAL_ORDERS } from '../data/menu';
import { FulfillmentMode, MenuItem } from '../types';

interface HomeScreenProps {
  fulfillmentMode: FulfillmentMode;
  setFulfillmentMode: (mode: FulfillmentMode) => void;
  tableNumber?: number;
  onAddToCart: (item: MenuItem | { name: string; price: number; image: string; calories?: number; customizationSummary?: string }) => void;
  onOpenCustomizer: (item: MenuItem) => void;
  onSelectTab: (tab: string) => void;
  onShowToast: (msg: string) => void;
  onApplyPromoCode: (code: string) => void;
  flamePoints: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  fulfillmentMode,
  setFulfillmentMode,
  tableNumber,
  onAddToCart,
  onOpenCustomizer,
  onSelectTab,
  onShowToast,
  onApplyPromoCode,
  flamePoints,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [copiedCode, setCopiedCode] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'truffle-ember-smash': true,
  });

  const categories = [
    { label: 'All Items', icon: 'stars' },
    { label: 'Smashburgers', icon: 'lunch_dining' },
    { label: 'Crispy Chicken', icon: 'egg' },
    { label: 'Loaded Fries', icon: 'downloading' },
    { label: 'Shakes & Sips', icon: 'local_cafe' },
    { label: 'Plant-Based', icon: 'eco' },
  ];

  const filteredItems = selectedCategory === 'All Items'
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  const toggleFavorite = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = !prev[itemId];
      onShowToast(next ? 'Saved to Favorites ❤️' : 'Removed from Favorites');
      return { ...prev, [itemId]: next };
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('SIZZLE20');
    setCopiedCode(true);
    onApplyPromoCode('SIZZLE20');
    onShowToast('Promo code SIZZLE20 applied (-20%)!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-28 pt-20">
      {/* Table Dine-In Notice if active */}
      {fulfillmentMode === 'dine-in' && tableNumber && (
        <div className="px-margin pt-2 pb-1">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-extrabold">
                #{tableNumber}
              </span>
              <div>
                <p className="font-label-md text-label-md text-on-surface">Dine-In Active: Table #{tableNumber}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Hot orders will be served straight to your seat</p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('table-qr')}
              className="text-primary font-label-sm text-label-sm underline"
            >
              Switch Table
            </button>
          </div>
        </div>
      )}

      {/* Fulfillment Switcher */}
      <div className="px-margin pt-space-xs pb-space-sm">
        <div className="bg-surface-container p-1 rounded-full flex items-center shadow-xs">
          <button
            onClick={() => setFulfillmentMode('pickup')}
            className={`fulfillment-btn flex-1 py-2 px-3 rounded-full font-label-md text-label-md flex items-center justify-center gap-1 transition-all ${
              fulfillmentMode === 'pickup'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>Pickup</span>
            <span
              className={`text-[10px] font-medium ml-0.5 px-1.5 py-0.5 rounded-full ${
                fulfillmentMode === 'pickup' ? 'bg-on-primary/20' : 'opacity-75'
              }`}
            >
              8-12m
            </span>
          </button>

          <button
            onClick={() => setFulfillmentMode('curbside')}
            className={`fulfillment-btn flex-1 py-2 px-3 rounded-full font-label-md text-label-md flex items-center justify-center gap-1 transition-all ${
              fulfillmentMode === 'curbside'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">directions_car</span>
            <span>Curbside</span>
            <span
              className={`text-[10px] font-medium ml-0.5 px-1.5 py-0.5 rounded-full ${
                fulfillmentMode === 'curbside' ? 'bg-on-primary/20' : 'opacity-75'
              }`}
            >
              12-16m
            </span>
          </button>

          <button
            onClick={() => setFulfillmentMode('delivery')}
            className={`fulfillment-btn flex-1 py-2 px-3 rounded-full font-label-md text-label-md flex items-center justify-center gap-1 transition-all ${
              fulfillmentMode === 'delivery'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">moped</span>
            <span>Delivery</span>
            <span
              className={`text-[10px] font-medium ml-0.5 px-1.5 py-0.5 rounded-full ${
                fulfillmentMode === 'delivery' ? 'bg-on-primary/20' : 'opacity-75'
              }`}
            >
              25-35m
            </span>
          </button>
        </div>
      </div>

      {/* Sizzle Club Loyalty Perk Card */}
      <div className="px-margin pt-space-xs pb-space-md">
        <div className="bg-gradient-to-r from-inverse-surface via-inverse-surface to-on-surface-variant text-on-primary rounded-lg p-4 shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary-container/20 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-label-lg text-label-lg text-inverse-on-surface">Sizzle Club</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">
                    VIP Tier
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-surface-variant/90">{flamePoints} points unlocked</p>
              </div>
            </div>
            <button
              onClick={() => {
                onShowToast('VIP Flame Perk: $3.00 voucher applied to your bag!');
                onSelectTab('bag');
              }}
              className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-1"
            >
              <span>Redeem</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
          <div className="mt-3.5 relative z-10">
            <div className="flex justify-between items-center mb-1.5 text-surface-variant font-label-sm text-label-sm">
              <span>{Math.max(0, 500 - flamePoints)} pts to Free Crispy Truffle Fries</span>
              <span className="text-secondary-fixed">{flamePoints} / 500</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-variant/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary-container to-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (flamePoints / 500) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Special Offer Highlight Strip */}
      <div className="px-margin pb-space-md">
        <div className="bg-surface-container-low rounded-lg p-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">loyalty</span>
            </div>
            <div className="min-w-0">
              <div className="font-label-md text-label-md text-on-surface truncate">
                20% off your next pickup
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Apply code <span className="font-label-sm text-primary font-extrabold uppercase">SIZZLE20</span> at bag
              </div>
            </div>
          </div>
          <button
            onClick={handleCopyCode}
            className={`copy-code-btn px-2.5 py-1 rounded-full font-label-sm text-label-sm flex-shrink-0 active:scale-95 transition-all ${
              copiedCode
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {copiedCode ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Instant Reorder / Your Usual Carousel */}
      <div className="pt-space-xs pb-space-lg">
        <div className="px-margin flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">history</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Your Usual Order</h2>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Last ordered 2d ago</span>
        </div>

        <div className="flex gap-3 overflow-x-auto px-margin no-scrollbar pb-1">
          {YOUR_USUAL_ORDERS.map((usual) => (
            <div
              key={usual.id}
              className="min-w-[260px] max-w-[260px] bg-surface-container-lowest rounded-lg p-3 shadow-[0_4px_16px_-2px_rgba(26,23,21,0.06)] flex flex-col justify-between flex-shrink-0 border border-black/[0.03]"
            >
              <div className="flex gap-3 items-center">
                <img
                  className="w-16 h-16 rounded-DEFAULT object-cover flex-shrink-0 bg-surface-container"
                  alt={usual.title}
                  src={usual.image}
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <span
                    className={`font-label-sm text-label-sm uppercase tracking-wider ${
                      usual.tag === 'Most Reordered'
                        ? 'text-secondary'
                        : usual.tag === 'Spicy Favorite'
                        ? 'text-tertiary'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {usual.tag}
                  </span>
                  <h3 className="font-label-lg text-label-lg text-on-surface truncate mt-0.5">
                    {usual.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {usual.sub}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 flex items-center justify-between">
                <div>
                  <span className="font-headline-md text-headline-md text-on-surface">
                    ${usual.price.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onAddToCart({
                      name: usual.title,
                      price: usual.price,
                      image: usual.image,
                      customizationSummary: usual.sub,
                    });
                    onShowToast(`${usual.title} reordered to bag!`);
                  }}
                  className="add-to-bag-btn flex items-center gap-1 py-1.5 px-3 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-xs active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Categories Filter Pill Stream */}
      <div className="pb-space-md">
        <div className="flex gap-2 overflow-x-auto px-margin no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`category-chip px-4 py-2 rounded-full font-label-md text-label-md flex items-center gap-1.5 flex-shrink-0 transition-colors ${
                  isActive
                    ? 'bg-on-background text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chef Hot Drops & Trending Section */}
      <div className="px-margin flex flex-col gap-space-md">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Chef's Hot Drops</span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mt-0.5">
              {selectedCategory === 'All Items' ? 'Trending Sizzlers' : selectedCategory}
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('menu')}
            className="font-label-md text-label-md text-primary flex items-center gap-0.5 hover:underline"
          >
            <span>View Full Menu</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Product Cards Stream */}
        {filteredItems.map((item) => {
          const isFav = !!favorites[item.id];
          return (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-lg p-4 shadow-[0_4px_20px_-2px_rgba(26,23,21,0.06)] flex flex-col gap-3 relative border border-black/[0.03] transition-all hover:shadow-md"
            >
              <div
                className="relative w-full h-44 rounded-DEFAULT overflow-hidden bg-surface-container cursor-pointer group"
                onClick={() => onOpenCustomizer(item)}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={item.name}
                  src={item.image}
                  referrerPolicy="no-referrer"
                />

                {/* Floating Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 shadow-xs ${
                        item.badgeType === 'primary'
                          ? 'bg-primary text-on-primary'
                          : item.badgeType === 'secondary'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container-highest text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {item.badgeType === 'primary' ? 'local_fire_department' : 'grade'}
                      </span>
                      <span>{item.badge}</span>
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-full bg-on-background/80 backdrop-blur-sm text-on-primary font-label-sm text-label-sm">
                    {item.calories} CAL
                  </span>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  aria-label="Toggle favorite"
                  className={`favorite-toggle-btn absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 ${
                    isFav ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col gap-1 cursor-pointer" onClick={() => onOpenCustomizer(item)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-md text-headline-md text-on-surface hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <span className="font-headline-md text-headline-md text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Details Tags & CTA */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                    <span>{item.prepTime}</span>
                  </span>
                  {item.dietary && (
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                      {item.dietary}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.isCustomizable ? (
                    <button
                      onClick={() => onOpenCustomizer(item)}
                      className="px-3.5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-md hover:bg-primary-container active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                      <span>Customize</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onAddToCart(item);
                        onShowToast(`${item.name} added to bag!`);
                      }}
                      className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 shadow-md hover:bg-primary-container active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      <span>Add to Bag</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
