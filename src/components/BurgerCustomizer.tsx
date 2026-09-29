import React, { useState } from 'react';
import { MenuItem, BurgerCustomization } from '../types';
import { AVATAR_URL, LOGO_URL } from '../data/menu';

interface BurgerCustomizerProps {
  item: MenuItem;
  onBack: () => void;
  onAddToOrder: (
    item: MenuItem,
    customization: BurgerCustomization,
    quantity: number,
    finalPrice: number
  ) => void;
  onShowToast: (msg: string) => void;
}

export const BurgerCustomizer: React.FC<BurgerCustomizerProps> = ({
  item,
  onBack,
  onAddToOrder,
  onShowToast,
}) => {
  const [selectedBun, setSelectedBun] = useState<{ name: string; price: number }>({
    name: 'Toasted Potato Brioche',
    price: 0,
  });

  const [selectedPatty, setSelectedPatty] = useState<{
    name: string;
    price: number;
    extraCals: number;
  }>({
    name: 'Double Smash (Standard)',
    price: 0,
    extraCals: 0,
  });

  const [selectedCheeses, setSelectedCheeses] = useState<
    { name: string; price: number }[]
  >([{ name: 'Aged Smoked Cheddar', price: 0 }]);

  const [selectedAddons, setSelectedAddons] = useState<
    { name: string; price: number }[]
  >([{ name: 'House Dill Pickles', price: 0 }]);

  const [isCombo, setIsCombo] = useState<boolean>(false);
  const [kitchenNote, setKitchenNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorite, setIsFavorite] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Calorie calculation
  const baseCalsMin = 780;
  const baseCalsMax = 980;
  const currentCalsMin =
    baseCalsMin + selectedPatty.extraCals + (isCombo ? 490 : 0);
  const currentCalsMax =
    baseCalsMax + selectedPatty.extraCals + (isCombo ? 580 : 0);

  // Unit price calculation
  const unitPrice =
    item.price +
    selectedBun.price +
    selectedPatty.price +
    selectedCheeses.reduce((sum, c) => sum + c.price, 0) +
    selectedAddons.reduce((sum, a) => sum + a.price, 0) +
    (isCombo ? 4.99 : 0);

  const totalPrice = unitPrice * quantity;

  const handleCheeseToggle = (cheese: { name: string; price: number }) => {
    setSelectedCheeses((prev) => {
      const exists = prev.some((c) => c.name === cheese.name);
      if (exists) {
        return prev.filter((c) => c.name !== cheese.name);
      } else {
        return [...prev, cheese];
      }
    });
  };

  const handleAddonToggle = (addon: { name: string; price: number }) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.name === addon.name);
      if (exists) {
        return prev.filter((a) => a.name !== addon.name);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddToOrder(
        item,
        {
          bun: selectedBun,
          patty: selectedPatty,
          cheeses: selectedCheeses,
          addons: selectedAddons,
          isCombo,
          comboPrice: isCombo ? 4.99 : 0,
          specialInstructions: kitchenNote,
        },
        quantity,
        totalPrice
      );
      onShowToast(`${item.name} customized and added to bag!`);
      setIsAdding(false);
      onBack();
    }, 500);
  };

  return (
    <div className="flex flex-col relative w-full bg-surface min-h-screen max-w-xl mx-auto pb-32">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(30,27,25,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <button
              onClick={onBack}
              aria-label="Back to menu"
              className="w-11 h-11 -ml-2 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <img
              alt="Sizzle & Bun Logo"
              className="h-7 w-auto object-contain flex-shrink-0"
              src={LOGO_URL}
            />
            <h1 className="font-headline-md text-headline-md text-on-surface truncate">
              Burger Customizer
            </h1>
          </div>
          <div className="flex items-center flex-shrink-0">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              src={AVATAR_URL}
            />
          </div>
        </div>
      </header>

      {/* Top Visual Showcase */}
      <div className="relative w-full px-gutter pt-space-sm pb-space-md">
        <div className="relative w-full rounded-lg overflow-hidden bg-surface-container shadow-sm">
          <div className="relative w-full h-72 sm:h-80 overflow-hidden flex items-center justify-center">
            <img
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              alt={item.name}
              src={item.image}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 via-transparent to-black/20 pointer-events-none" />

            {/* Floating Badges Top */}
            <div className="absolute top-space-md left-space-md flex items-center gap-space-xs">
              <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm shadow-md">
                <span className="material-symbols-outlined text-[14px] fill-1">
                  local_fire_department
                </span>
                CHEF SIGNATURE
              </span>
              <span className="inline-flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow-sm">
                <span className="material-symbols-outlined text-[13px] text-primary">bolt</span>
                8-12 MIN PREP
              </span>
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label="Favorite item"
              className="absolute top-space-md right-space-md w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <span
                className={`material-symbols-outlined text-[20px] text-primary ${
                  isFavorite ? 'fill-1' : ''
                }`}
              >
                favorite
              </span>
            </button>

            {/* Dynamic Calorie & Rating Badges Bottom */}
            <div className="absolute bottom-space-md left-space-md right-space-md flex items-center justify-between pointer-events-none">
              <div className="inline-flex items-center gap-1.5 bg-on-background/85 backdrop-blur-md px-3 py-1.5 rounded-full text-on-primary font-label-md text-label-md shadow-md">
                <span className="material-symbols-outlined text-secondary-container text-[16px]">
                  local_fire_department
                </span>
                <span>
                  {currentCalsMin} - {currentCalsMax} kcal
                </span>
              </div>
              <div className="inline-flex items-center gap-1 bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md text-on-surface font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-secondary text-[14px] fill-1">
                  star
                </span>
                <span className="font-bold">4.9</span>
                <span className="text-outline">(1.8k)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Title & Highlights */}
      <section className="px-gutter flex flex-col gap-space-sm mb-space-lg">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface leading-tight tracking-tight">
              {item.name}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              {item.description}
            </p>
          </div>
        </div>

        {/* Flavor Attributes Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm tracking-wider uppercase">
            Crispy Edge
          </span>
          <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm tracking-wider uppercase">
            Double Patty
          </span>
          <span className="bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm tracking-wider uppercase">
            House Secret Sauce
          </span>
          <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full font-label-sm text-label-sm tracking-wider uppercase font-extrabold">
            Hot Grill Favorite
          </span>
        </div>
      </section>

      {/* Interactive Customizer Steps Form */}
      <div className="flex flex-col gap-space-xl px-gutter">
        {/* STEP 1: Bun Selection */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                1
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Choose Your Bun</h3>
            </div>
            <span className="font-label-sm text-label-sm uppercase bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant">
              Required
            </span>
          </div>

          <div className="grid grid-cols-1 gap-space-xs">
            {[
              { name: 'Toasted Potato Brioche', desc: 'Chef recommended, butter griddled', price: 0 },
              { name: 'Gluten-Free Artisanal', desc: 'Sesame-crusted bakery blend', price: 1.5 },
              { name: 'Lettuce Wrap (Low-Carb)', desc: 'Fresh cold-crisped leaf shield', price: 0 },
            ].map((bun) => {
              const isSelected = selectedBun.name === bun.name;
              return (
                <label
                  key={bun.name}
                  onClick={() => setSelectedBun({ name: bun.name, price: bun.price })}
                  className={`cursor-pointer flex items-center justify-between p-space-md rounded-DEFAULT transition-all shadow-xs border ${
                    isSelected
                      ? 'bg-primary-fixed text-on-primary-fixed border-primary/30'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="bun"
                      checked={isSelected}
                      onChange={() => setSelectedBun({ name: bun.name, price: bun.price })}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className={`font-label-lg text-label-lg ${isSelected ? 'font-extrabold' : ''} text-on-surface`}>
                        {bun.name}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {bun.desc}
                      </span>
                    </div>
                  </div>
                  <span className={`font-label-md text-label-md ${bun.price > 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {bun.price === 0 ? (bun.name.includes('Lettuce') ? 'Free' : 'Included') : `+$${bun.price.toFixed(2)}`}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* STEP 2: Patty Stack & Protein */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                2
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Patty Stack &amp; Protein</h3>
            </div>
            <span className="font-label-sm text-label-sm uppercase bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant">
              Pick 1
            </span>
          </div>

          <div className="grid grid-cols-1 gap-space-xs">
            {[
              { name: 'Double Smash (Standard)', desc: 'Two 3.5oz patties pressed ultra-lacy', price: 0, extraCals: 0 },
              { name: 'Triple Sizzle Smash', desc: 'Three patties + extra cheese drape', price: 3.0, extraCals: 260 },
              { name: 'Beyond Meat® Plant-Based', desc: '100% vegan protein griddled hot', price: 1.0, extraCals: -40 },
            ].map((patty) => {
              const isSelected = selectedPatty.name === patty.name;
              return (
                <label
                  key={patty.name}
                  onClick={() =>
                    setSelectedPatty({
                      name: patty.name,
                      price: patty.price,
                      extraCals: patty.extraCals,
                    })
                  }
                  className={`cursor-pointer flex items-center justify-between p-space-md rounded-DEFAULT transition-all shadow-xs border ${
                    isSelected
                      ? 'bg-primary-fixed text-on-primary-fixed border-primary/30'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="patty"
                      checked={isSelected}
                      onChange={() =>
                        setSelectedPatty({
                          name: patty.name,
                          price: patty.price,
                          extraCals: patty.extraCals,
                        })
                      }
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className={`font-label-lg text-label-lg ${isSelected ? 'font-extrabold' : ''} text-on-surface`}>
                        {patty.name}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {patty.desc}
                      </span>
                    </div>
                  </div>
                  <span className={`font-label-md text-label-md ${patty.price > 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {patty.price === 0 ? 'Standard' : `+$${patty.price.toFixed(2)}`}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Cheese & Melt */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                3
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Cheese &amp; Melt</h3>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Multiple allowed</span>
          </div>

          <div className="grid grid-cols-1 gap-space-xs">
            {[
              { name: 'Aged Smoked Cheddar', desc: 'Sharp, deeply savory melt', price: 0 },
              { name: 'Pepper Jack Zing', desc: 'Spiced with fiery habanero flakes', price: 0.75 },
              { name: 'Extra Sharp American', desc: 'Silky diner-style fondue coat', price: 0.75 },
            ].map((cheese) => {
              const isChecked = selectedCheeses.some((c) => c.name === cheese.name);
              return (
                <label
                  key={cheese.name}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCheeseToggle(cheese);
                  }}
                  className={`cursor-pointer flex items-center justify-between p-space-md rounded-DEFAULT transition-all shadow-xs border ${
                    isChecked
                      ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary/30'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheeseToggle(cheese)}
                      className="w-5 h-5 rounded accent-primary cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-label-lg text-label-lg text-on-surface">
                        {cheese.name}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {cheese.desc}
                      </span>
                    </div>
                  </div>
                  <span className={`font-label-md text-label-md ${cheese.price === 0 ? 'text-on-secondary-fixed font-bold' : 'text-primary font-bold'}`}>
                    {cheese.price === 0 ? 'Included' : `+$${cheese.price.toFixed(2)}`}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* STEP 4: Sauces & Crispy Toppings */}
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                4
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Sauces &amp; Crispy Toppings</h3>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Customize</span>
          </div>

          <div className="grid grid-cols-2 gap-space-xs">
            {[
              { name: 'Extra Ember Sauce', icon: 'flare', iconColor: 'text-primary', price: 0.5 },
              { name: 'Onion Jam', icon: 'skillet', iconColor: 'text-secondary', price: 1.25 },
              { name: 'Crispy Jalapeños', icon: 'whatshot', iconColor: 'text-error', price: 0.85 },
              { name: 'House Dill Pickles', icon: 'eco', iconColor: 'text-on-surface-variant', price: 0 },
            ].map((addon) => {
              const isChecked = selectedAddons.some((a) => a.name === addon.name);
              return (
                <label
                  key={addon.name}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddonToggle(addon);
                  }}
                  className={`cursor-pointer flex flex-col justify-between p-space-md rounded-DEFAULT transition-all shadow-xs border ${
                    isChecked
                      ? 'bg-surface-container-high border-primary/30'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className={`material-symbols-outlined ${addon.iconColor} text-[22px]`}>
                      {addon.icon}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAddonToggle(addon)}
                      className="w-5 h-5 rounded accent-primary cursor-pointer"
                    />
                  </div>
                  <div className="mt-space-sm">
                    <span className="font-label-md text-label-md text-on-surface block">
                      {addon.name}
                    </span>
                    <span className={`font-body-sm text-body-sm ${addon.price > 0 ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      {addon.price === 0 ? 'Free' : `+$${addon.price.toFixed(2)}`}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* UPSELL: Make it a Combo Box */}
        <div className="p-space-md rounded-lg bg-surface-container-high relative overflow-hidden shadow-xs border border-secondary-container/40">
          <div className="flex items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">fastfood</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-lg text-label-lg text-on-surface">Make it a Combo!</span>
                  <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                    Save $2
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Crispy Waffle Fries + 16oz Hand-Spun Shake
                </p>
              </div>
            </div>

            {/* Custom Tactile Switch */}
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={isCombo}
                onChange={(e) => setIsCombo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-surface-container-lowest after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner" />
            </label>
          </div>
          <div className="flex items-center justify-between mt-space-sm pt-space-xs text-on-surface-variant">
            <span className="font-body-sm text-body-sm text-primary font-bold">
              + $4.99 Meal Upgrade
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wide bg-surface-container px-2 py-0.5 rounded-full">
              Best Value
            </span>
          </div>
        </div>

        {/* Special Kitchen Request Note */}
        <div className="flex flex-col gap-space-xs">
          <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5" htmlFor="kitchen-note">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Kitchen Instructions
          </label>
          <input
            id="kitchen-note"
            type="text"
            value={kitchenNote}
            onChange={(e) => setKitchenNote(e.target.value)}
            placeholder="e.g. Cut in half, sauce on the side, extra crispy edges"
            className="w-full px-space-md py-3 rounded-full bg-surface-container-low text-on-surface font-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors shadow-xs border border-transparent focus:border-primary/40"
          />
        </div>
      </div>

      {/* Sticky Bottom Floating Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-gutter bg-surface/90 backdrop-blur-xl pb-safe border-t border-black/[0.04]">
        <div className="max-w-md mx-auto flex items-center gap-space-sm">
          {/* Tactile Quantity Stepper */}
          <div className="flex items-center bg-surface-container-high rounded-full p-1 shadow-xs">
            <button
              type="button"
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              aria-label="Decrease quantity"
              className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="w-8 text-center font-headline-md text-headline-md text-on-surface">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => quantity < 10 && setQuantity(quantity + 1)}
              aria-label="Increase quantity"
              className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-on-surface hover:bg-surface-container active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          {/* Add to Cart Primary Pill Action */}
          <button
            type="button"
            disabled={isAdding}
            onClick={handleAddToCart}
            className="flex-1 h-12 px-space-md rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-between shadow-lg active:scale-[0.98] transition-all"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[20px]">
                {isAdding ? 'progress_activity' : 'shopping_bag'}
              </span>
              <span>{isAdding ? 'Sizzling in your tray...' : 'Add to Order'}</span>
            </span>
            <span className="font-extrabold tracking-tight font-headline-md text-headline-md">
              ${totalPrice.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
