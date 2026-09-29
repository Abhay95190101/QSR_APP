import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/menu';
import { MenuItem } from '../types';

interface FullMenuScreenProps {
  onOpenCustomizer: (item: MenuItem) => void;
  onAddToCart: (item: MenuItem) => void;
  onShowToast: (msg: string) => void;
}

export const FullMenuScreen: React.FC<FullMenuScreenProps> = ({
  onOpenCustomizer,
  onAddToCart,
  onShowToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Smashburgers',
    'Crispy Chicken',
    'Loaded Fries',
    'Shakes & Sips',
    'Plant-Based',
  ];

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-margin pb-32 pt-20">
      {/* Header and Search */}
      <div className="pb-4">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
          Explore The Flattop Menu
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
          Razor-thin smash patties, crispy hot honey chicken, &amp; truffle loaded sides
        </p>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search burgers, truffle fries, shakes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container text-on-surface font-body-md placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-on-background text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="flex flex-col gap-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] mb-2">sentiment_dissatisfied</span>
            <p className="font-headline-md text-headline-md text-on-surface">No sizzlers found</p>
            <p className="text-sm mt-1">Try another search keyword or category filter</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-lg p-4 shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] flex gap-3 relative border border-black/[0.03] cursor-pointer hover:shadow-md transition-all"
              onClick={() => onOpenCustomizer(item)}
            >
              <div className="w-24 h-24 rounded bg-surface-container flex-shrink-0 overflow-hidden relative">
                <img
                  className="w-full h-full object-cover"
                  alt={item.name}
                  src={item.image}
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 right-1 bg-on-background/80 backdrop-blur-sm text-on-primary font-label-sm text-[9px] px-1.5 py-0.5 rounded-full">
                  {item.calories} CAL
                </span>
              </div>

              <div className="flex flex-col flex-1 min-w-0 justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-headline-md text-[17px] text-on-surface leading-tight hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                    <span className="font-headline-md text-[17px] text-primary whitespace-nowrap">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                      {item.prepTime}
                    </span>
                    {item.dietary && (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                        {item.dietary}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {item.isCustomizable ? (
                      <button
                        onClick={() => onOpenCustomizer(item)}
                        className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-xs flex items-center gap-1 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        Customize
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onAddToCart(item);
                          onShowToast(`${item.name} added to bag!`);
                        }}
                        className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-xs flex items-center gap-1 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
