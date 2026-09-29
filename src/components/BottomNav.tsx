import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
}) => {
  return (
    <nav
      className="fixed bottom-0 w-full z-40 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(30,27,25,0.06)]"
      data-active-classes="text-primary font-label-md"
    >
      <div className="h-16 px-gutter flex items-center justify-around max-w-xl mx-auto">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
            activeTab === 'home'
              ? 'text-primary font-label-md'
              : 'text-on-surface-variant'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
          >
            local_fire_department
          </span>
          <span className="font-label-sm text-label-sm mt-0.5">Home</span>
        </button>

        {/* Menu */}
        <button
          onClick={() => onSelectTab('menu')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
            activeTab === 'menu'
              ? 'text-primary font-label-md'
              : 'text-on-surface-variant'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'menu' ? "'FILL' 1" : "'FILL' 0" }}
          >
            lunch_dining
          </span>
          <span className="font-label-sm text-label-sm mt-0.5">Menu</span>
        </button>

        {/* Bag with Badge */}
        <button
          onClick={() => onSelectTab('bag')}
          className={`relative flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
            activeTab === 'bag'
              ? 'text-primary font-label-md'
              : 'text-on-surface-variant'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: activeTab === 'bag' ? "'FILL' 1" : "'FILL' 0" }}
            >
              shopping_bag
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-on-primary font-label-sm text-label-sm px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight">
                {cartCount}
              </span>
            )}
          </div>
          <span className="font-label-sm text-label-sm mt-0.5">Bag</span>
        </button>

        {/* Live Order Tracker */}
        <button
          onClick={() => onSelectTab('live-order')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
            activeTab === 'live-order'
              ? 'text-primary font-label-md'
              : 'text-on-surface-variant'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'live-order' ? "'FILL' 1" : "'FILL' 0" }}
          >
            moped
          </span>
          <span className="font-label-sm text-label-sm mt-0.5">Live Order</span>
        </button>

        {/* Dine-In Table QR Generator */}
        <button
          onClick={() => onSelectTab('table-qr')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors ${
            activeTab === 'table-qr'
              ? 'text-primary font-label-md'
              : 'text-on-surface-variant'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: activeTab === 'table-qr' ? "'FILL' 1" : "'FILL' 0" }}
          >
            qr_code_scanner
          </span>
          <span className="font-label-sm text-label-sm mt-0.5">Table QR</span>
        </button>
      </div>
    </nav>
  );
};
