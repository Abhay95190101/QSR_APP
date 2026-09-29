import React, { useState, useRef } from 'react';
import { MenuItem } from '../../types';

interface BulkMenuUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onAddItem: (item: MenuItem) => void;
  onShowToast: (msg: string) => void;
  currency: string;
}

interface ParsedItemPreview {
  name: string;
  category: string;
  price: number;
  description: string;
  calories: number;
  prepTime: string;
  dietary?: string;
  isAvailable: boolean;
  hindiName?: string;
  hindiDescription?: string;
}

const SAMPLE_CSV = `Name,Category,Price,Description,Calories,PrepTime,Dietary,IsAvailable,HindiName,HindiDescription
Butter Chicken Smash,Smashburgers,289,Tender spiced pulled chicken with makhani glaze & pickled onions,720,8-10 min,Non-Veg,true,बटर चिकन स्मैश,मखनी ग्लेज और प्याज के साथ स्पेशल बर्गर
Paneer Tikka Melt,Smashburgers,249,Charred cottage cheese cubes with mint mayo and melting cheddar,650,6-8 min,Vegetarian,true,पनीर टिक्का मेल्ट,पुदीना मेयो और चेडर चीज के साथ
Cheesy Masala Fries,Loaded Fries,159,Crispy fries tossed in Delhi chaat spice with double cheese dip,480,4-5 min,Vegetarian,true,चीज़ी मसाला फ्राइज़,दिल्ली चाट मसाला और चीज़ डिप के साथ
Mango Lassi Shake,Shakes & Sips,139,Rich Alphonso mango cream shake with crushed pistachios,410,3-4 min,Beverage,true,मैंगो लस्सी शेक,अल्फांसो आम और पिस्ता से भरपूर शेक`;

export const BulkMenuUploadModal: React.FC<BulkMenuUploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onAddItem,
  onShowToast,
  currency,
}) => {
  const [csvText, setCsvText] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<ParsedItemPreview[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedDefaultCategory, setSelectedDefaultCategory] = useState<string>(categories[0] || 'Smashburgers');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Simple CSV line parser respecting quotes
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const handleProcessText = (rawText: string) => {
    setCsvText(rawText);
    const lines = rawText.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setParsedItems([]);
      setParseErrors([]);
      return;
    }

    const items: ParsedItemPreview[] = [];
    const errors: string[] = [];

    // Check if first line is header
    const firstLineCols = parseCSVLine(lines[0]).map((c) => c.toLowerCase());
    const hasHeader = firstLineCols.includes('name') || firstLineCols.includes('item') || firstLineCols.includes('price');
    const startIdx = hasHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 2) continue;

      const itemName = cols[0] || '';
      const itemCat = cols[1] || selectedDefaultCategory;
      const rawPrice = (cols[2] || '').replace(/[^\d.]/g, '');
      const priceVal = parseFloat(rawPrice);

      if (!itemName) {
        errors.push(`Row ${i + 1}: Missing dish name.`);
        continue;
      }
      if (isNaN(priceVal) || priceVal <= 0) {
        errors.push(`Row ${i + 1} (${itemName}): Invalid price "${cols[2]}".`);
        continue;
      }

      const itemDesc = cols[3] || 'Freshly prepared specialty dish cooked to order.';
      const itemCals = parseInt(cols[4], 10) || 550;
      const itemPrep = cols[5] || '6-8 min';
      const itemDiet = cols[6] || 'Chef Special';
      const itemAvail = cols[7] ? cols[7].toLowerCase() !== 'false' : true;
      const hindiName = cols[8] || undefined;
      const hindiDesc = cols[9] || undefined;

      items.push({
        name: itemName,
        category: itemCat,
        price: priceVal,
        description: itemDesc,
        calories: itemCals,
        prepTime: itemPrep,
        dietary: itemDiet,
        isAvailable: itemAvail,
        hindiName,
        hindiDescription: hindiDesc,
      });
    }

    setParsedItems(items);
    setParseErrors(errors);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleProcessText(content);
        onShowToast(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    handleProcessText(SAMPLE_CSV);
    onShowToast('Loaded sample menu template!');
  };

  const handleImportAll = () => {
    if (parsedItems.length === 0) {
      onShowToast('No valid items to import.');
      return;
    }

    // Default food images
    const defaultImages = [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlUNm4zJcjZFgrfU3YesBrPA05Y5yWBcZbxWak9BeUQPUW_3ZeVY-PJE9wa7v_8Sm-gToI3_I7FxI-C7xnMv1JQC9m9QFQa4h_M0f8pxFOczkyAqh1g6AEj8BfOexgI-aGPFIVE4nUCZSWbLzX07Bhgi4QL1ZHZWnH8aCKUTg4g7gEje_m82_ELVLc3PE9U0GDlw5tSXQccFiss-aMeqmTq5lJ7QDInbHNUGaugh6mGWqEnMnkIqDkFw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClRm3N0nDhuETUc_J8IsBtbuFRf0vO59Wb_cr-CY9o6z0iXliOfIZG6_zNuiw1n0FDiqHbQSTuUKQeDAbOg5eaYvcAomKXA19NgEWRDv9I8GeXK4XT4xXDd41BR83YGfkeZGa6Z1UBt2DMxaPlW1RudZTrgRIprsYX3PEmzMxCW3YnPP_HArrhDhkGC_jqSt3lOWri0pgA2Lx1dXVy-ILhdXAOenoVRsS2IkX2Mauy4BopQMbAZ6Il7Q',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCARjm76ohSRGvMabQTg3HV5hLE_lZ37iKQfOAPUdi4Tq0BKckgmQeT0VAdCJg02JX4EoBqCZ1D-87Zysq9XeTZPLQ7WLSHXdQIuLwZVNmjzKzfiWWlQQAT-_cRmTEQ86vcMi0UVlFDvEG1DzXXzvtM_lqrvEHNQM1H2N6mowDBa-gnGbZe2kFGXzWRTCYPjEmkuK-2_20OWvZPKMFuaA06VLamiOZrJbtSiXgwskvTQ29uHhEIWBaSoA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDx0zOGB217o8JyFwIQwleDRZluStZgWuWxs2LRDuepvQALjKuwHz9NQKNIPaaq7nbj-OM45nYuHLWOyL71VFVITdwbSSFSN5YvV-uvR3_sPpQex8hXSpt9et379-ZyhnKTVUWGI-NRdqCtpC3IM6JFxyu8RgxN19PorXcmsm8UQjF_HhV9iy7OVhGmZ_wL6UHeb2FWAf1fQgwZ2WF5GQzJPXImRjwJfDTzG3gpgzAHGaWykhotPvR3Fw',
    ];

    let count = 0;
    parsedItems.forEach((p, idx) => {
      // Auto-create category if doesn't exist
      if (p.category && !categories.includes(p.category)) {
        onAddCategory(p.category);
      }

      const newItem: MenuItem = {
        id: `item-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        name: p.name,
        category: p.category || selectedDefaultCategory,
        price: p.price,
        description: p.description,
        calories: p.calories,
        prepTime: p.prepTime,
        image: defaultImages[idx % defaultImages.length],
        badge: 'NEW',
        badgeType: 'primary',
        isAvailable: p.isAvailable,
        dietary: p.dietary || 'Chef Recommendation',
        translations: p.hindiName
          ? {
              hi: {
                name: p.hindiName,
                description: p.hindiDescription || p.description,
              },
            }
          : undefined,
      };

      onAddItem(newItem);
      count++;
    });

    onShowToast(`🎉 Successfully imported ${count} menu dishes into your live catalog!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col border border-black/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">upload_file</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-black">
                Bulk Upload Menu Items
              </h3>
              <p className="text-xs text-on-surface-variant">
                Upload CSV or paste spreadsheet columns (Name, Category, Price, Description...)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-container/50 p-3 rounded-2xl border border-black/5">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">file_upload</span>
                <span>Select .CSV File</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                <span>Load Sample Template</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-on-surface-variant">Default Category:</span>
              <select
                value={selectedDefaultCategory}
                onChange={(e) => setSelectedDefaultCategory(e.target.value)}
                className="px-2 py-1 rounded-lg bg-surface-container text-xs font-bold border border-black/5"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Paste CSV Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-on-surface">
                Paste CSV or Spreadsheet Data:
              </label>
              <span className="text-[11px] text-on-surface-variant font-mono">
                Name, Category, Price, Description, Calories, PrepTime, Dietary, Available, HindiName
              </span>
            </div>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => handleProcessText(e.target.value)}
              placeholder="Paste comma-separated rows or Excel copied columns here..."
              className="w-full p-3 rounded-2xl bg-surface-container font-mono text-xs text-on-surface outline-none border border-black/10 focus:border-primary resize-none"
            />
          </div>

          {/* Parse Errors if any */}
          {parseErrors.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-0.5">
              <span className="font-bold block">⚠️ Parsing Warnings:</span>
              {parseErrors.slice(0, 3).map((err, i) => (
                <div key={i} className="text-[11px]">{err}</div>
              ))}
            </div>
          )}

          {/* Live Preview Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                  Preview Ready for Import ({parsedItems.length} Dishes)
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  All prices set in {currency} (INR)
                </span>
              </div>

              <div className="border border-black/10 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container font-bold text-[10px] text-on-surface-variant uppercase border-b border-black/5 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Item Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Hindi Translation</th>
                      <th className="py-2 px-3">Dietary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] bg-white">
                    {parsedItems.map((p, idx) => (
                      <tr key={idx} className="hover:bg-surface-container/30">
                        <td className="py-2 px-3 font-bold text-on-surface truncate max-w-[150px]">
                          {p.name}
                        </td>
                        <td className="py-2 px-3 text-on-surface-variant">{p.category}</td>
                        <td className="py-2 px-3 font-bold text-primary">{currency}{p.price}</td>
                        <td className="py-2 px-3 text-on-surface-variant truncate max-w-[120px]">
                          {p.hindiName || '—'}
                        </td>
                        <td className="py-2 px-3 text-[11px] text-on-surface-variant">{p.dietary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImportAll}
            disabled={parsedItems.length === 0}
            className={`px-5 py-2.5 rounded-full font-headline-md text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all ${
              parsedItems.length > 0
                ? 'bg-primary hover:bg-primary-container text-on-primary active:scale-95'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">library_add</span>
            <span>Import {parsedItems.length} Items to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
