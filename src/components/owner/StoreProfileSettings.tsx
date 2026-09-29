import React, { useState, useRef } from 'react';
import { StoreProfile, StaffUser } from '../../types';
import { StaffUserManager } from './StaffUserManager';

interface StoreProfileSettingsProps {
  profile: StoreProfile;
  onUpdateProfile: (updated: StoreProfile) => void;
  staffUsers?: StaffUser[];
  onUpdateStaffUsers?: (users: StaffUser[]) => void;
  onShowToast: (msg: string) => void;
}

type ProfileSubTab = 'brand' | 'location' | 'tax-payment' | 'hours-zones' | 'wifi-security' | 'staff';

const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', name: '₹ - INR (Indian Rupee)' },
  { code: 'USD', symbol: '$', name: '$ - USD (US Dollar)' },
  { code: 'EUR', symbol: '€', name: '€ - EUR (Euro)' },
  { code: 'GBP', symbol: '£', name: '£ - GBP (British Pound)' },
  { code: 'AED', symbol: 'AED ', name: 'AED - UAE Dirham' },
  { code: 'SAR', symbol: 'SAR ', name: 'SAR - Saudi Riyal' },
  { code: 'CAD', symbol: 'C$', name: 'C$ - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'A$ - Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'S$ - Singapore Dollar' },
  { code: 'BDT', symbol: '৳', name: '৳ - BDT (Bangladeshi Taka)' },
  { code: 'PKR', symbol: '₨', name: '₨ - PKR (Pakistani Rupee)' },
  { code: 'LKR', symbol: 'Rs ', name: 'Rs - Sri Lankan Rupee' },
  { code: 'NPR', symbol: 'रू ', name: 'रू - Nepalese Rupee' },
  { code: 'MYR', symbol: 'RM ', name: 'RM - Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: '฿ - THB (Thai Baht)' },
  { code: 'IDR', symbol: 'Rp ', name: 'Rp - Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: '₱ - Philippine Peso' },
  { code: 'JPY', symbol: '¥', name: '¥ - JPY (Japanese Yen)' },
  { code: 'CNY', symbol: '¥', name: '¥ - CNY (Chinese Yuan)' },
  { code: 'KRW', symbol: '₩', name: '₩ - South Korean Won' },
  { code: 'QAR', symbol: 'QAR ', name: 'QAR - Qatari Riyal' },
  { code: 'KWD', symbol: 'KWD ', name: 'KWD - Kuwaiti Dinar' },
  { code: 'ZAR', symbol: 'R ', name: 'R - South African Rand' },
  { code: 'CHF', symbol: 'CHF ', name: 'CHF - Swiss Franc' },
  { code: 'BRL', symbol: 'R$ ', name: 'R$ - Brazilian Real' },
  { code: 'CUSTOM', symbol: '', name: 'Custom Symbol...' },
];

export const StoreProfileSettings: React.FC<StoreProfileSettingsProps> = ({
  profile,
  onUpdateProfile,
  staffUsers = [],
  onUpdateStaffUsers = () => {},
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('brand');

  // Form states with null-safe fallbacks
  const [name, setName] = useState(profile.name || 'Sizzle & Bun Flattop Grill');
  const [tagline, setTagline] = useState(profile.tagline || '');
  const [description, setDescription] = useState(profile.description || '');
  const [address, setAddress] = useState(profile.address || '');
  const [city, setCity] = useState(profile.city || 'New Delhi');
  const [state, setState] = useState(profile.state || 'Delhi');
  const [pincode, setPincode] = useState(profile.pincode || '110001');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [upiId, setUpiId] = useState(profile.upiId || '');
  const [upiMerchantName, setUpiMerchantName] = useState(profile.upiMerchantName || profile.name || '');
  const [taxRate, setTaxRate] = useState((profile.taxRate ?? 5.0).toString());
  const [serviceCharge, setServiceCharge] = useState((profile.serviceCharge ?? 2.5).toString());
  const [gstin, setGstin] = useState(profile.gstin || '');
  const [fssaiNumber, setFssaiNumber] = useState(profile.fssaiNumber || '');
  const [currencySymbol, setCurrencySymbol] = useState(profile.currencySymbol || '₹');
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80');
  const [wifiName, setWifiName] = useState(profile.wifiName || '');
  const [wifiPassword, setWifiPassword] = useState(profile.wifiPassword || '');
  const [isOpen, setIsOpen] = useState(profile.isOpen ?? true);
  const [openingTime, setOpeningTime] = useState(profile.openingTime || '11:00 AM');
  const [closingTime, setClosingTime] = useState(profile.closingTime || '11:30 PM');
  const [totalTables, setTotalTables] = useState((profile.totalTables ?? 16).toString());
  const [ownerPin, setOwnerPin] = useState(profile.ownerPin || '1234');
  const [diningZones, setDiningZones] = useState<string[]>(
    profile.diningZones && Array.isArray(profile.diningZones) && profile.diningZones.length > 0
      ? profile.diningZones
      : ['Main Dining Room', 'Patio Garden', 'Rooftop Lounge', 'Flattop Bar']
  );
  const [newZoneInput, setNewZoneInput] = useState<string>('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
        onShowToast('Logo uploaded! Click "Save Store Profile" to save.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBannerUrl(reader.result);
        onShowToast('Banner uploaded! Click "Save Store Profile" to save.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddZone = () => {
    if (!newZoneInput.trim()) return;
    if (diningZones.includes(newZoneInput.trim())) {
      onShowToast('Dining zone already exists');
      return;
    }
    setDiningZones([...diningZones, newZoneInput.trim()]);
    setNewZoneInput('');
    onShowToast(`Added zone "${newZoneInput.trim()}"`);
  };

  const handleRemoveZone = (zoneToRemove: string) => {
    if (diningZones.length <= 1) {
      onShowToast('At least one dining zone is required');
      return;
    }
    setDiningZones(diningZones.filter((z) => z !== zoneToRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Restaurant name cannot be empty');
      return;
    }

    const updated: StoreProfile = {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim() || undefined,
      upiId: upiId.trim(),
      upiMerchantName: upiMerchantName.trim() || name.trim(),
      taxRate: parseFloat(taxRate) || 0,
      serviceCharge: parseFloat(serviceCharge) || 0,
      gstin: gstin.trim() || undefined,
      fssaiNumber: fssaiNumber.trim() || undefined,
      currencySymbol: currencySymbol.trim() || '₹',
      logoUrl: logoUrl.trim(),
      bannerUrl: bannerUrl.trim(),
      qrLogoUrl: logoUrl.trim(),
      wifiName: wifiName.trim() || undefined,
      wifiPassword: wifiPassword.trim() || undefined,
      isOpen,
      openingTime: openingTime.trim(),
      closingTime: closingTime.trim(),
      totalTables: parseInt(totalTables, 10) || 16,
      diningZones,
      ownerPin: ownerPin.trim() || '1234',
    };

    onUpdateProfile(updated);
    onShowToast(`Full profile saved! Customer QR menus and bills updated for "${updated.name}"`);
  };

  const tabs = [
    { id: 'brand' as ProfileSubTab, label: 'Identity & Brand', icon: 'storefront' },
    { id: 'location' as ProfileSubTab, label: 'Location & Contact', icon: 'pin_drop' },
    { id: 'tax-payment' as ProfileSubTab, label: 'GST, UPI & Tax', icon: 'payments' },
    { id: 'hours-zones' as ProfileSubTab, label: 'Hours & Tables', icon: 'schedule' },
    { id: 'wifi-security' as ProfileSubTab, label: 'Wi-Fi & Security', icon: 'wifi' },
    { id: 'staff' as ProfileSubTab, label: 'Staff & Managers', icon: 'group' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">settings_suggest</span>
            </div>
            <h2 className="font-headline-md text-base sm:text-lg font-black text-on-surface">
              Restaurant Profile &amp; Settings Setup
            </h2>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Configure branding, official GST &amp; FSSAI compliance, UPI digital payments, dining zones, and assign staff managers.
          </p>
        </div>

        {/* Store Live Badge & Quick Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              onShowToast(isOpen ? 'Store marked as Closed' : 'Store marked as Live / Open');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              isOpen
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{isOpen ? 'Store is Live & Open' : 'Store is Closed'}</span>
          </button>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-surface-container/60 p-1.5 rounded-2xl border border-black/5 text-xs font-bold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeSubTab === tab.id
                ? 'bg-white text-on-surface shadow-xs font-black'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* If Staff Tab Selected, Render Staff & Manager Component */}
      {activeSubTab === 'staff' ? (
        <StaffUserManager
          storeProfile={profile}
          staffUsers={staffUsers}
          onUpdateStaffUsers={onUpdateStaffUsers}
          onShowToast={onShowToast}
        />
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          {/* SubTab 1: Brand & Basic Identity */}
          {activeSubTab === 'brand' && (
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-4">
              <h3 className="font-headline-md text-sm font-black text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">storefront</span>
                Brand Identity &amp; Visuals
              </h3>

              {/* Logo & Banner Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-container/40 border border-black/5">
                {/* Logo Upload */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                    Brand Logo
                  </span>
                  <div className="w-20 h-20 rounded-2xl bg-surface-container p-2 border border-black/10 flex items-center justify-center overflow-hidden shadow-xs">
                    <img src={logoUrl} alt="Store Logo" className="w-full h-full object-contain" />
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span>
                    Change Logo
                  </button>
                </div>

                {/* Banner Upload */}
                <div className="md:col-span-2 flex flex-col justify-between space-y-2">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                    Store Header Banner Image
                  </span>
                  <div className="w-full h-24 rounded-2xl bg-surface-container overflow-hidden border border-black/10 relative">
                    <img
                      src={bannerUrl}
                      alt="Store Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-xs font-bold drop-shadow">
                        Displayed on Customer Menu Header
                      </span>
                    </div>
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs flex items-center gap-1 self-end"
                    >
                      <span className="material-symbols-outlined text-sm">photo</span>
                      Upload Banner
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Registered Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sizzle & Bun Flattop Grill"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Razor-thin smashed patties & craft gourmet buns"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-on-surface-variant block mb-1">
                    About Us / Restaurant Story
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your specialties, ingredients, and story..."
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Location & Contact */}
          {activeSubTab === 'location' && (
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-4">
              <h3 className="font-headline-md text-sm font-black text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">pin_drop</span>
                Address, City &amp; Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Connaught Circle, Block B, Central Hub"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Delhi / Maharashtra"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 110001"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Official Mobile / Landline *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="orders@sizzleandbun.in"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Website / Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://sizzleandbun.in"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: GST, UPI & Tax */}
          {activeSubTab === 'tax-payment' && (
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-4">
              <h3 className="font-headline-md text-sm font-black text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">payments</span>
                UPI Payments &amp; Tax Compliance (GST &amp; FSSAI)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* UPI VPA */}
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    UPI Payment Virtual Address (VPA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. sizzlebun@oksbi"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-mono font-bold outline-none border border-black/5 text-primary"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                    GPay, PhonePe, Paytm QR codes generate directly to this ID
                  </span>
                </div>

                {/* Merchant Name */}
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    UPI Merchant / Business Name
                  </label>
                  <input
                    type="text"
                    value={upiMerchantName}
                    onChange={(e) => setUpiMerchantName(e.target.value)}
                    placeholder="e.g. Sizzle & Bun Flattop Grill"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    GSTIN (GST Registration Number)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 07AAAAA1234A1Z5"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-mono outline-none border border-black/5 uppercase"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                    Printed on customer thermal receipts and invoices
                  </span>
                </div>

                {/* FSSAI */}
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    FSSAI Food License Number (14 Digits)
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    value={fssaiNumber}
                    onChange={(e) => setFssaiNumber(e.target.value)}
                    placeholder="e.g. 13324001000543"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-mono outline-none border border-black/5"
                  />
                </div>

                {/* GST Rate */}
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Restaurant GST Rate (%) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="28"
                    required
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold outline-none border border-black/5"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                    Standard restaurant GST is 5.0% (2.5% CGST + 2.5% SGST)
                  </span>
                </div>

                {/* Service Charge */}
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Optional Service Charge (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="15"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold outline-none border border-black/5"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                    Discretionary service charge (set 0 to disable)
                  </span>
                </div>

                {/* Currency Selection Dropdown */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-on-surface-variant block mb-1">
                      Store Currency *
                    </label>
                    <select
                      value={
                        CURRENCY_OPTIONS.some((c) => c.symbol.trim() === currencySymbol.trim())
                          ? CURRENCY_OPTIONS.find((c) => c.symbol.trim() === currencySymbol.trim())?.code
                          : 'CUSTOM'
                      }
                      onChange={(e) => {
                        const selected = CURRENCY_OPTIONS.find((c) => c.code === e.target.value);
                        if (selected && selected.code !== 'CUSTOM') {
                          setCurrencySymbol(selected.symbol);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold outline-none border border-black/5 cursor-pointer"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                      Select currency for all menu prices, invoices, receipts, and UPI QR codes
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-on-surface-variant block mb-1">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      placeholder="e.g. ₹ or $"
                      className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-black outline-none border border-black/5 font-mono text-primary"
                    />
                    <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                      Preview: <strong className="text-on-surface">{currencySymbol} 299.00</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 4: Hours, Tables & Zones */}
          {activeSubTab === 'hours-zones' && (
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-4">
              <h3 className="font-headline-md text-sm font-black text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                Operational Hours, Capacity &amp; Dining Zones
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Daily Opening Time
                  </label>
                  <input
                    type="text"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Daily Closing Time
                  </label>
                  <input
                    type="text"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    placeholder="e.g. 11:30 PM"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Total Tables Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalTables}
                    onChange={(e) => setTotalTables(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-bold outline-none border border-black/5"
                  />
                </div>
              </div>

              {/* Dining Zones Tags Manager */}
              <div className="p-3.5 rounded-2xl bg-surface-container/40 border border-black/5 space-y-2.5">
                <label className="font-bold text-xs text-on-surface block">
                  Configured Dining Zones / Floors
                </label>
                <div className="flex flex-wrap gap-2">
                  {diningZones.map((zone) => (
                    <span
                      key={zone}
                      className="px-3 py-1 rounded-xl bg-white border border-black/10 text-on-surface text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{zone}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveZone(zone)}
                        className="text-on-surface-variant hover:text-error text-xs"
                        title="Remove Zone"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={newZoneInput}
                    onChange={(e) => setNewZoneInput(e.target.value)}
                    placeholder="Add zone (e.g. Rooftop Deck)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white text-on-surface text-xs outline-none border border-black/10"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddZone())}
                  />
                  <button
                    type="button"
                    onClick={handleAddZone}
                    className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex-shrink-0"
                  >
                    + Add Zone
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 5: Wi-Fi & Security */}
          {activeSubTab === 'wifi-security' && (
            <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-black/[0.04] space-y-4">
              <h3 className="font-headline-md text-sm font-black text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-lg">wifi</span>
                Guest Wi-Fi Standee &amp; Master Security PIN
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Guest Wi-Fi Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiName}
                    onChange={(e) => setWifiName(e.target.value)}
                    placeholder="e.g. SizzleBun_Guest"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs outline-none border border-black/5"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                    Printed on table standee QR cards for customer convenience
                  </span>
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Guest Wi-Fi Password
                  </label>
                  <input
                    type="text"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="e.g. eatmoreburgers"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-mono outline-none border border-black/5"
                  />
                </div>

                <div>
                  <label className="font-bold text-on-surface-variant block mb-1">
                    Owner Master PIN (4 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-mono font-bold outline-none border border-black/5 text-primary"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                    Used to lock / unlock the Owner Portal from dining tablets
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Save Profile Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-on-surface-variant">
              Changes apply instantly to live customer menus and kitchen tickets.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-md text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">save</span>
              <span>Save Full Profile Setup</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
