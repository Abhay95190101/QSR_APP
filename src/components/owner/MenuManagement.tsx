import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { BulkMenuUploadModal } from './BulkMenuUploadModal';
import { MultiLanguageMenuModal } from './MultiLanguageMenuModal';

interface MenuManagementProps {
  categories: string[];
  items: MenuItem[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
  onAddItem: (item: MenuItem) => void;
  onUpdateItem: (item: MenuItem) => void;
  onRemoveItem: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  currency: string;
  onShowToast: (msg: string) => void;
}

export const MenuManagement: React.FC<MenuManagementProps> = ({
  categories,
  items,
  onAddCategory,
  onRemoveCategory,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onToggleAvailability,
  currency,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newCatName, setNewCatName] = useState<string>('');
  const [showAddCatModal, setShowAddCatModal] = useState<boolean>(false);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showMultiLangModal, setShowMultiLangModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [modalTab, setModalTab] = useState<'basic' | 'translation'>('basic');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0] || 'Smashburgers');
  const [price, setPrice] = useState<string>('249');
  const [description, setDescription] = useState<string>('');
  const [calories, setCalories] = useState<string>('650');
  const [prepTime, setPrepTime] = useState<string>('8-10 min');
  const [image, setImage] = useState<string>('');
  const [badge, setBadge] = useState<string>('CHEF SPECIAL');
  const [badgeType, setBadgeType] = useState<'primary' | 'secondary' | 'neutral'>('primary');
  const [dietary, setDietary] = useState<string>('Chef Recommendation');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  // Multi-Language translation fields
  const [hindiName, setHindiName] = useState<string>('');
  const [hindiDescription, setHindiDescription] = useState<string>('');
  const [marathiName, setMarathiName] = useState<string>('');
  const [bengaliName, setBengaliName] = useState<string>('');

  const openAddItemModal = () => {
    setEditingItem(null);
    setModalTab('basic');
    setName('');
    setCategory(categories[0] || 'Smashburgers');
    setPrice('249');
    setDescription('Delicious recipe cooked fresh to order with artisan ingredients.');
    setCalories('650');
    setPrepTime('8-10 min');
    setImage('https://lh3.googleusercontent.com/aida-public/AB6AXuClRm3N0nDhuETUc_J8IsBtbuFRf0vO59Wb_cr-CY9o6z0iXliOfIZG6_zNuiw1n0FDiqHbQSTuUKQeDAbOg5eaYvcAomKXA19NgEWRDv9I8GeXK4XT4xXDd41BR83YGfkeZGa6Z1UBt2DMxaPlW1RudZTrgRIprsYX3PEmzMxCW3YnPP_HArrhDhkGC_jqSt3lOWri0pgA2Lx1dXVy-ILhdXAOenoVRsS2IkX2Mauy4BopQMbAZ6Il7Q');
    setBadge('CHEF SPECIAL');
    setBadgeType('primary');
    setDietary('Best Seller');
    setIsAvailable(true);
    setHindiName('');
    setHindiDescription('');
    setMarathiName('');
    setBengaliName('');
    setShowItemModal(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setModalTab('basic');
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price.toString());
    setDescription(item.description);
    setCalories(item.calories.toString());
    setPrepTime(item.prepTime);
    setImage(item.image);
    setBadge(item.badge || '');
    setBadgeType(item.badgeType || 'primary');
    setDietary(item.dietary || '');
    setIsAvailable(item.isAvailable);

    // Load translations if available
    setHindiName(item.translations?.hi?.name || '');
    setHindiDescription(item.translations?.hi?.description || '');
    setMarathiName(item.translations?.mr?.name || '');
    setBengaliName(item.translations?.bn?.name || '');
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Please provide an item name');
      return;
    }

    // Prepare multi-language translations map
    const translations: MenuItem['translations'] = {};
    if (hindiName.trim()) {
      translations.hi = {
        name: hindiName.trim(),
        description: hindiDescription.trim() || description.trim(),
      };
    }
    if (marathiName.trim()) {
      translations.mr = {
        name: marathiName.trim(),
        description: description.trim(),
      };
    }
    if (bengaliName.trim()) {
      translations.bn = {
        name: bengaliName.trim(),
        description: description.trim(),
      };
    }

    const itemPayload: MenuItem = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      name: name.trim(),
      category,
      price: parseFloat(price) || 0,
      description: description.trim(),
      calories: parseInt(calories, 10) || 500,
      prepTime: prepTime.trim() || '8-10 min',
      image: image.trim() || 'https://lh3.googleusercontent.com/aida-public/AB6AXuClRm3N0nDhuETUc_J8IsBtbuFRf0vO59Wb_cr-CY9o6z0iXliOfIZG6_zNuiw1n0FDiqHbQSTuUKQeDAbOg5eaYvcAomKXA19NgEWRDv9I8GeXK4XT4xXDd41BR83YGfkeZGa6Z1UBt2DMxaPlW1RudZTrgRIprsYX3PEmzMxCW3YnPP_HArrhDhkGC_jqSt3lOWri0pgA2Lx1dXVy-ILhdXAOenoVRsS2IkX2Mauy4BopQMbAZ6Il7Q',
      badge: badge.trim() || undefined,
      badgeType,
      dietary: dietary.trim() || undefined,
      isAvailable,
      translations: Object.keys(translations).length > 0 ? translations : undefined,
    };

    if (editingItem) {
      onUpdateItem(itemPayload);
      onShowToast(`Updated "${itemPayload.name}" successfully!`);
    } else {
      onAddItem(itemPayload);
      onShowToast(`Added "${itemPayload.name}" to menu!`);
    }

    setShowItemModal(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (categories.includes(newCatName.trim())) {
      onShowToast('Category already exists');
      return;
    }
    onAddCategory(newCatName.trim());
    onShowToast(`Category "${newCatName.trim()}" created!`);
    setNewCatName('');
    setShowAddCatModal(false);
  };

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
            Menu &amp; Catalog Control
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {items.length} items across {categories.length} categories • Prices in <strong className="text-primary">{currency} (INR)</strong> • Multi-language supported
          </p>
        </div>

        {/* Action Buttons: Multi-Language, Bulk Upload, Add Category, Add New Item */}
        <div className="flex flex-wrap items-center gap-2">
          {/* MULTI-LANGUAGE MENU STUDIO BUTTON */}
          <button
            type="button"
            onClick={() => setShowMultiLangModal(true)}
            className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-xs font-black flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            title="Update dish names and descriptions in Hindi, Bengali, Marathi, and other languages"
          >
            <span className="material-symbols-outlined text-[17px]">translate</span>
            <span>Update Languages</span>
          </button>

          {/* BULK UPLOAD BUTTON */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-2 rounded-xl bg-secondary-container hover:bg-secondary hover:text-white text-on-secondary-container text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">upload_file</span>
            <span>Upload Bulk Items</span>
          </button>

          <button
            onClick={() => setShowAddCatModal(true)}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
            <span>+ Category</span>
          </button>

          <button
            onClick={openAddItemModal}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Category Horizontal Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          All Items ({items.length})
        </button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <div key={cat} className="flex items-center group relative flex-shrink-0">
              <button
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cat} ({count})
              </button>
              {categories.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Remove category "${cat}"? Items will remain in catalog.`)) {
                      onRemoveCategory(cat);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 -ml-2 mr-1 w-5 h-5 rounded-full bg-error-container text-error text-[10px] flex items-center justify-center transition-opacity"
                  title="Remove category"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Dishes Cards Grid (Responsive Mobile Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-surface-container-lowest rounded-2xl p-4 shadow-xs border transition-all flex flex-col justify-between ${
              item.isAvailable ? 'border-black/[0.05]' : 'border-dashed border-neutral-300 opacity-70'
            }`}
          >
            {/* Top Info */}
            <div className="flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover bg-surface-container flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-headline-md text-sm font-bold text-on-surface leading-snug truncate">
                    {item.name}
                  </h3>
                  <span className="font-headline-md text-sm font-black text-primary whitespace-nowrap">
                    {currency}{item.price.toFixed(2)}
                  </span>
                </div>

                {/* Multi-language subtitle if available */}
                {item.translations?.hi?.name && (
                  <p className="text-[11px] font-medium text-emerald-800 truncate">
                    {item.translations.hi.name}
                  </p>
                )}

                <p className="font-body-sm text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                  {item.description}
                </p>

                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.2 rounded-full bg-surface-container text-on-surface text-[10px] font-medium">
                    {item.calories} CAL
                  </span>
                  {item.badge && (
                    <span className="px-2 py-0.2 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-extrabold uppercase">
                      {item.badge}
                    </span>
                  )}
                  {item.translations && Object.keys(item.translations).length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                      🌐 {Object.keys(item.translations).length + 1} Lang
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Available Switch & Edit/Delete */}
            <div className="mt-3 pt-2.5 border-t border-black/[0.04] flex items-center justify-between">
              {/* Availability Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => onToggleAvailability(item.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
                    item.isAvailable ? 'bg-emerald-600 justify-end' : 'bg-neutral-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
                <span className={`text-[11px] font-bold ${item.isAvailable ? 'text-emerald-700' : 'text-neutral-500'}`}>
                  {item.isAvailable ? 'Available' : 'Sold Out'}
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditItemModal(item)}
                  className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${item.name}" from the menu?`)) {
                      onRemoveItem(item.id);
                    }
                  }}
                  className="w-7 h-7 rounded-lg bg-surface-container hover:bg-error-container text-error flex items-center justify-center transition-colors"
                  title="Delete item"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-5 shadow-2xl relative border border-black/10">
            <h3 className="font-headline-md text-base font-bold text-on-surface mb-1">
              Create New Category
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant mb-3">
              Add a menu section like Wraps, Gourmet Shakes, Mocktails, or Combos.
            </p>
            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Masala Wraps"
                className="w-full px-3 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm font-semibold outline-none border border-black/10 focus:border-primary"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Item Modal (Supports Multi-Language) */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col border border-black/10">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] flex-shrink-0">
              <h3 className="font-headline-md text-base sm:text-lg font-black text-on-surface">
                {editingItem ? 'Edit Dish & Translations' : 'Add New Dish'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs: Basic Info vs Multi-Language Translations */}
            <div className="flex bg-surface-container p-1 rounded-xl my-3 text-xs font-bold flex-shrink-0">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  modalTab === 'basic'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                General Details ({currency})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('translation')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                  modalTab === 'translation'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span>🌐 Multi-Language (हिंदी/क्षेत्रीय)</span>
                {hindiName && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {modalTab === 'basic' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="font-label-sm text-on-surface-variant block mb-1">
                        Dish Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sizzling Paneer Crunch"
                        className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-semibold outline-none border border-black/5 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="font-label-sm text-on-surface-variant block mb-1">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-semibold outline-none border border-black/5"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-label-sm text-on-surface-variant block mb-1">
                        Price in {currency} (INR) *
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-bold text-primary outline-none border border-black/5 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-label-sm text-on-surface-variant block mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ingredients, seasonings, style..."
                      className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-medium resize-none outline-none border border-black/5"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="font-label-sm text-on-surface-variant block mb-1">Calories</label>
                      <input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-label-sm text-on-surface-variant block mb-1">Prep Time</label>
                      <input
                        type="text"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        placeholder="6-8 min"
                        className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-label-sm text-on-surface-variant block mb-1">Dietary Tag</label>
                      <input
                        type="text"
                        value={dietary}
                        onChange={(e) => setDietary(e.target.value)}
                        placeholder="Veg / Non-Veg"
                        className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-label-sm text-on-surface-variant block mb-1">Image URL</label>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-black/5">
                    <div>
                      <span className="font-label-md text-on-surface block text-xs font-bold">
                        Available for Ordering
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Toggle off if temporarily out of stock
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                  </div>
                </>
              ) : (
                /* Multi-Language Translation Tab */
                <div className="space-y-4 py-1">
                  <div className="p-3 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-on-surface space-y-1">
                    <span className="font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">translate</span>
                      Multi-Language Menu Display
                    </span>
                    <p className="text-on-surface-variant text-[11px]">
                      When customers select Hindi or regional languages from the menu, these translated names and descriptions will be displayed automatically.
                    </p>
                  </div>

                  {/* Hindi (हिंदी) */}
                  <div className="p-3.5 rounded-2xl bg-surface-container/60 border border-black/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-900 text-[10px] font-black flex items-center justify-center">हि</span>
                        Hindi (हिंदी में नाम व विवरण)
                      </span>
                      {name && !hindiName && (
                        <button
                          type="button"
                          onClick={() => {
                            setHindiName(name);
                            onShowToast('Copied English name as Hindi draft');
                          }}
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          Use English Name
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] text-on-surface-variant block mb-1">
                        डिश का हिंदी में नाम (Hindi Dish Name):
                      </label>
                      <input
                        type="text"
                        value={hindiName}
                        onChange={(e) => setHindiName(e.target.value)}
                        placeholder="उदा. सिज़लिंग पनीर बर्गर"
                        className="w-full px-3 py-2 rounded-xl bg-white text-on-surface text-sm font-medium outline-none border border-black/10 focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-on-surface-variant block mb-1">
                        हिंदी विवरण (Hindi Description):
                      </label>
                      <textarea
                        rows={2}
                        value={hindiDescription}
                        onChange={(e) => setHindiDescription(e.target.value)}
                        placeholder="स्वादिष्ट सामग्री, मसालों और तैयारी का विवरण..."
                        className="w-full px-3 py-2 rounded-xl bg-white text-on-surface text-xs font-medium resize-none outline-none border border-black/10 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Regional Languages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                        Marathi Name (मराठीत नाव):
                      </label>
                      <input
                        type="text"
                        value={marathiName}
                        onChange={(e) => setMarathiName(e.target.value)}
                        placeholder="उदा. खास व्हेज बर्गर"
                        className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                        Bengali Name (বাংলায় নাম):
                      </label>
                      <input
                        type="text"
                        value={bengaliName}
                        onChange={(e) => setBengaliName(e.target.value)}
                        placeholder="যেমন: স্পেশাল বার্গার"
                        className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-3 border-t border-black/[0.06] justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-primary text-on-primary text-xs font-extrabold shadow-md hover:bg-primary-container active:scale-95 transition-all"
                >
                  {editingItem ? 'Save Modifications' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK MENU UPLOAD MODAL */}
      <BulkMenuUploadModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        categories={categories}
        onAddCategory={onAddCategory}
        onAddItem={onAddItem}
        onShowToast={onShowToast}
        currency={currency}
      />

      {/* MULTI-LANGUAGE MENU STUDIO MODAL */}
      <MultiLanguageMenuModal
        isOpen={showMultiLangModal}
        onClose={() => setShowMultiLangModal(false)}
        items={items}
        categories={categories}
        onUpdateItem={onUpdateItem}
        currency={currency}
        onShowToast={onShowToast}
      />
    </div>
  );
};
