import React, { useState } from 'react';
import { MenuItem, LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../utils/i18n';

interface MultiLanguageMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  categories: string[];
  onUpdateItem: (item: MenuItem) => void;
  currency: string;
  onShowToast: (msg: string) => void;
}

// Built-in intelligent localization dictionaries for common restaurant/burger items
const DISH_TRANSLATION_PRESETS: Record<string, Partial<Record<LanguageCode, { name: string; desc: string }>>> = {
  'Truffle Ember Smash': {
    hi: { name: 'ट्रफल एम्बर स्मैश बर्गर', desc: 'डबल ग्रास-फेड स्मैश पैटी, स्मोक्ड गौडा चीज़, ब्लैक ट्रफल सॉस और बटर ब्रियोश बन।' },
    mr: { name: 'ट्रफल एम्बर स्मॅश बर्गर', desc: 'डबल स्मोक्ड चीझ, ब्लॅक ट्रफल सॉस आणि भाजलेला ब्रिओश बन.' },
    bn: { name: 'ট্রাফেল এম্বার স্ম্যাশ বার্গার', desc: 'ডাবল গ্রাস-ফেড প্যাটি, স্মোকড চিজ, ব্ল্যাক ট্রাফেল সস ও মাখনে ভাজা বান।' },
    gu: { name: 'ટ્રફલ એમ્બર સ્મેશ બર્ગર', desc: 'બેવડી સ્મેશ પેટી, સ્મોક્ડ ચીઝ, ટ્રફલ સોસ અને બ્રિઓશ બન.' },
    ta: { name: 'ட்ரஃபிள் எம்பர் ஸ்மாஷ் பர்கர்', desc: 'இரட்டை ஸ்மாஷ் பேட்டி, சீஸ், ட்ரஃபிள் சாஸ் மற்றும் பிரியோஷ் பன்.' },
    te: { name: 'ట్రఫుల్ ఎంబర్ స్మాష్ బర్గర్', desc: 'రెండు స్మాష్ ప్యాటీలు, చీజ్, బ్లాక్ ట్రఫుల్ సాస్ మరియు బ్రియోష్ బన్.' },
    es: { name: 'Truffle Ember Smash Burger', desc: 'Doble hamburguesa smash, queso gouda ahumado, alioli de trufa negra en pan brioche.' },
    fr: { name: 'Truffle Ember Smash Burger', desc: 'Double steak smashé, gouda fumé, aïoli à la truffe noire sur pain brioché.' },
    ar: { name: 'برغر ترافل إمبر سماش', desc: 'شريحتان من اللحم المحمر المقرمش، جبن غودا مدخن، صلصة الترافل وخبز البريوش.' },
  },
  'The Double Sizzle Smash': {
    hi: { name: 'द डबल सिज़ल स्मैश', desc: 'दो करारी स्मैश पैटी, अमेरिकन चेडर चीज़, क्रिस्पी प्रिमियम अचार और स्पेशल सिज़ल सॉस।' },
    mr: { name: 'द डबल सिझल स्मॅश', desc: 'दोन कुरकुरीत स्मॅश पॅटी, अमेरिकन चेडर चीझ आणि स्पेशल सॉस.' },
    bn: { name: 'ডাবল সিজল স্ম্যাশ বার্গার', desc: 'দুটি ক্রিস্পি প্যাটি, আমেরিকান চেডার চিজ, আচার ও স্পেশাল সিজল সস।' },
    gu: { name: 'ડબલ સિઝલ સ્મેશ બર્ગર', desc: 'બે કુરકુરી પેટી, અમેરિકન ચેડર ચીઝ અને સ્પેશિયલ સોસ.' },
    ta: { name: 'தி டபுள் சிஸில் ஸ்மாஷ்', desc: 'இரண்டு மொறுமொறுப்பான பேட்டிகள், அமெரிக்கன் சீஸ் மற்றும் சிறப்பு சாஸ்.' },
    te: { name: 'ది డబుల్ సిజిల్ స్మాష్', desc: 'రెండు క్రిస్పీ స్మాష్ ప్యాటీలు, అమెరికన్ చెడ్డార్ చీజ్ మరియు ప్రత్యేక సాస్.' },
    es: { name: 'Doble Sizzle Smash Burger', desc: 'Doble carne smash crujiente, cheddar americano, pepinillos y salsa especial Sizzle.' },
    fr: { name: 'Le Double Sizzle Smash', desc: 'Deux steaks smashés croustillants, cheddar américain, cornichons et sauce secrète Sizzle.' },
    ar: { name: 'ذا دبل سيزل سماش', desc: 'شريحتا لحم مقرمشة، جبنة شيدر أمريكية، مخلل، وصلصة سيزل الخاصة.' },
  },
  'Parmesan Herb Truffle Fries': {
    hi: { name: 'पारमेज़ान हर्ब ट्रफल फ्राइज़', desc: 'सफ़ेद ट्रफल ऑयल, कसा हुआ पारमेज़ान चीज़, लहसुन और रोज़मेरी से तैयार कुरकुरी फ्राइज़।' },
    mr: { name: 'पारमेसान हर्ब ट्रफल फ्राईज', desc: 'कुरकुरीत फ्राईज, ट्रफल तेल, पारमेसान चीझ आणि ताज्या औषधी वनस्पती.' },
    bn: { name: 'পারমেসান হার্ব ট্রাফেল ফ্রাইস', desc: 'সাদা ট্রাফেল তেল, পারমেসান চিজ, রসুন ও ভেষজ পাতা দিয়ে তৈরি মুচমুচে ফ্রাইস।' },
    gu: { name: 'પારમેસન હર્બ ટ્રફલ ફ્રાઈઝ', desc: 'કુરકુરી ફ્રાઈઝ, પારમેસન ચીઝ, લસણ અને હર્બ્સ સાથે.' },
    ta: { name: 'பார்மிசான் ஹெர்ப் ட்ரஃபிள் ஃப்ரைஸ்', desc: 'மொறுமொறுப்பான உருளைக்கிழங்கு பிரைஸ், சீஸ் மற்றும் மூலிகைகள்.' },
    te: { name: 'పార్మెసన్ హెర్బ్ ట్రఫుల్ ఫ్రైస్', desc: 'క్రిస్పీ పొటాటో ఫ్రైస్, పార్మెసన్ చీజ్, వెల్లుల్లి మరియు రోజ్మేరీ.' },
    es: { name: 'Patatas Fritas Trufadas con Parmesano', desc: 'Patatas fritas crujientes con aceite de trufa blanca, parmesano rallado y finas hierbas.' },
    fr: { name: 'Frites Truffées au Parmesan et Herbes', desc: 'Frites croustillantes à l’huile de truffe blanche, parmesan râpé et romarin frais.' },
    ar: { name: 'بطاطس مقلية بالكمأة والبارميزان', desc: 'بطاطس مقرمشة بزيت الكمأة الأبيض، جبن بارميزان وأعشاب طازجة.' },
  },
};

export const MultiLanguageMenuModal: React.FC<MultiLanguageMenuModalProps> = ({
  isOpen,
  onClose,
  items,
  categories,
  onUpdateItem,
  currency,
  onShowToast,
}) => {
  // Only non-English target languages
  const targetLanguages = SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en');
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('hi');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local draft state of translations: itemId -> { name, description }
  const [drafts, setDrafts] = useState<Record<string, { name: string; description: string }>>(() => {
    const init: Record<string, { name: string; description: string }> = {};
    items.forEach((item) => {
      const existing = item.translations?.hi;
      init[item.id] = {
        name: existing?.name || '',
        description: existing?.description || '',
      };
    });
    return init;
  });

  if (!isOpen) return null;

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || targetLanguages[0];

  const handleLanguageSwitch = (newLang: LanguageCode) => {
    setSelectedLang(newLang);
    // Reload drafts for this language
    const newDrafts: Record<string, { name: string; description: string }> = {};
    items.forEach((item) => {
      const existing = item.translations?.[newLang];
      newDrafts[item.id] = {
        name: existing?.name || '',
        description: existing?.description || '',
      };
    });
    setDrafts(newDrafts);
  };

  const handleDraftChange = (itemId: string, field: 'name' | 'description', value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  // Auto-translate / generate smart draft for all items
  const handleAutoTranslateAll = () => {
    const newDrafts = { ...drafts };
    let count = 0;

    items.forEach((item) => {
      const preset = DISH_TRANSLATION_PRESETS[item.name]?.[selectedLang];
      const currentName = newDrafts[item.id]?.name;

      if (!currentName || currentName.trim() === '') {
        if (preset) {
          newDrafts[item.id] = {
            name: preset.name,
            description: preset.desc || item.description,
          };
          count++;
        } else {
          // Provide a formatted draft
          const langSuffix = `(${currentLangObj.nativeLabel})`;
          newDrafts[item.id] = {
            name: `${item.name} ${langSuffix}`,
            description: item.description,
          };
          count++;
        }
      }
    });

    setDrafts(newDrafts);
    onShowToast(`Auto-drafted ${count} menu translations in ${currentLangObj.nativeLabel}!`);
  };

  // Save all translated items to the system
  const handleSaveAll = () => {
    let savedCount = 0;

    items.forEach((item) => {
      const draft = drafts[item.id];
      if (draft && draft.name.trim()) {
        const updatedTranslations = {
          ...(item.translations || {}),
          [selectedLang]: {
            name: draft.name.trim(),
            description: draft.description.trim() || item.description,
            dietary: item.dietary,
          },
        };

        const updatedItem: MenuItem = {
          ...item,
          translations: updatedTranslations,
        };

        onUpdateItem(updatedItem);
        savedCount++;
      }
    });

    onShowToast(`Saved ${savedCount} menu items in ${currentLangObj.label} (${currentLangObj.nativeLabel})!`);
    onClose();
  };

  const filteredItems = items.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-black/10 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.06] bg-surface flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">translate</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-black text-on-surface">
                Multi-Language Menu Studio
              </h3>
              <p className="text-xs text-on-surface-variant">
                Provide localized dish names and descriptions so customers can read the menu in their mother tongue.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Target Language Selection Bar */}
        <div className="px-4 sm:px-5 py-3 bg-surface-container/50 border-b border-black/[0.04] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] uppercase font-black text-on-surface-variant tracking-wider whitespace-nowrap mr-1">
            Choose Language:
          </span>
          {targetLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageSwitch(lang.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedLang === lang.code
                  ? 'bg-primary text-on-primary shadow-xs font-black scale-102'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-white border border-black/5'
              }`}
            >
              <span>{lang.nativeLabel}</span>
              <span className={`text-[10px] ${selectedLang === lang.code ? 'text-white/80' : 'text-on-surface-variant'}`}>
                ({lang.label})
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar: Category Filter, Search, Auto-Draft */}
        <div className="p-4 border-b border-black/[0.04] bg-surface-container-lowest flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {['All', ...categories].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-on-surface text-surface'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5 w-40 sm:w-48"
            />

            <button
              type="button"
              onClick={handleAutoTranslateAll}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all whitespace-nowrap"
              title="Automatically draft translations for empty dishes"
            >
              <span>⚡</span>
              <span>Auto-Draft All</span>
            </button>
          </div>
        </div>

        {/* Item Rows Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-black/[0.04]">
          {filteredItems.map((item) => {
            const draft = drafts[item.id] || { name: '', description: '' };
            const hasExisting = Boolean(item.translations?.[selectedLang]?.name);

            return (
              <div key={item.id} className="pt-3.5 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                {/* English Original Reference */}
                <div className="md:col-span-4 flex items-start gap-2.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-surface-container border border-black/5"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-on-surface truncate block">{item.name}</span>
                      {hasExisting && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Translated" />
                      )}
                    </div>
                    <span className="text-[10px] text-primary font-bold block">
                      {currency}{item.price.toFixed(2)} • {item.category}
                    </span>
                    <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Localized Name & Description Inputs */}
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-0.5">
                      Name in {currentLangObj.nativeLabel} *
                    </label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => handleDraftChange(item.id, 'name', e.target.value)}
                      placeholder={`e.g. ${item.name} (${currentLangObj.nativeLabel})`}
                      className="w-full px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs font-bold outline-none border border-black/5 focus:border-primary focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase block mb-0.5">
                      Description in {currentLangObj.nativeLabel}
                    </label>
                    <input
                      type="text"
                      value={draft.description}
                      onChange={(e) => handleDraftChange(item.id, 'description', e.target.value)}
                      placeholder="Localized ingredients, taste profile..."
                      className="w-full px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5 focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: Save & Close */}
        <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-surface flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">
              Active Language: <strong className="text-on-surface">{currentLangObj.label} ({currentLangObj.nativeLabel})</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save {currentLangObj.nativeLabel} Menu Updates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
