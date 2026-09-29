import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { LOGO_URL } from '../data/menu';

interface DiningTableQRGeneratorProps {
  currentTable?: number;
  onSelectTableForOrder: (tableNumber: number, zone: string) => void;
  onShowToast: (msg: string) => void;
  onBack: () => void;
}

export const DiningTableQRGenerator: React.FC<DiningTableQRGeneratorProps> = ({
  currentTable = 4,
  onSelectTableForOrder,
  onShowToast,
  onBack,
}) => {
  const [tableNumber, setTableNumber] = useState<number>(currentTable);
  const [zone, setZone] = useState<string>('Main Dining Room');
  const [promoCode, setPromoCode] = useState<string>('SIZZLE20');
  const [welcomeNote, setWelcomeNote] = useState<string>('Fresh off the flattop to your seat');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');
  const [batchQrs, setBatchQrs] = useState<{ table: number; qr: string }[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const zones = [
    'Main Dining Room',
    'Outdoor Patio Terrace',
    'Ember Bar & High-Top',
    'Booth Row A',
    'Private Event Nook',
  ];

  // Construct target ordering URL
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://sizzle-and-bun.restaurant';
  const targetUrl = `${baseUrl}?table=${tableNumber}&zone=${encodeURIComponent(zone)}&mode=dine-in`;

  // Generate single QR code
  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#1e1b19',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [targetUrl]);

  // Generate batch QRs
  useEffect(() => {
    if (viewMode === 'batch') {
      const promises = Array.from({ length: 8 }, (_, i) => {
        const num = i + 1;
        const bUrl = `${baseUrl}?table=${num}&zone=${encodeURIComponent(zone)}&mode=dine-in`;
        return QRCode.toDataURL(bUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#1e1b19', light: '#ffffff' },
        }).then((qr) => ({ table: num, qr }));
      });

      Promise.all(promises).then((results) => setBatchQrs(results));
    }
  }, [viewMode, zone, baseUrl]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(targetUrl);
    onShowToast(`Table #${tableNumber} order link copied!`);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Sizzle_and_Bun_Table_${tableNumber}_QR.png`;
    a.click();
    onShowToast(`Table #${tableNumber} QR downloaded!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateScan = () => {
    onSelectTableForOrder(tableNumber, zone);
    onShowToast(`Scanned Table #${tableNumber}! Digital Dine-In activated 🔥`);
  };

  return (
    <div className="flex flex-col relative w-full bg-surface min-h-screen max-w-xl mx-auto pb-32 pt-20 px-margin">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              Table QR Generator
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Generate scannable menu cards for dining customers
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-surface-container p-1 rounded-full text-xs font-bold">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              viewMode === 'single'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Stand Card
          </button>
          <button
            onClick={() => setViewMode('batch')}
            className={`px-3 py-1.5 rounded-full transition-all ${
              viewMode === 'batch'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Batch (1-8)
          </button>
        </div>
      </div>

      {viewMode === 'single' ? (
        <div className="flex flex-col gap-5 pt-4">
          {/* Controls: Table # and Zone Pickers */}
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-xs space-y-3 border border-black/[0.03]">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-bold">
                Select Table Number
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTableNumber(Math.max(1, tableNumber - 1))}
                  className="w-8 h-8 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold hover:bg-surface-container-high"
                >
                  -
                </button>
                <span className="w-10 text-center font-headline-md text-headline-md text-primary">
                  #{tableNumber}
                </span>
                <button
                  onClick={() => setTableNumber(Math.min(30, tableNumber + 1))}
                  className="w-8 h-8 rounded-full bg-surface-container text-on-surface flex items-center justify-center font-bold hover:bg-surface-container-high"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick table pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 12, 16, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => setTableNumber(num)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    tableNumber === num
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Table {num}
                </button>
              ))}
            </div>

            {/* Zone Selector */}
            <div>
              <label className="font-label-sm text-on-surface-variant block mb-1">
                Dining Section / Area
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Stand Card Preview (Printable Component) */}
          <div
            ref={printRef}
            className="bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-black/[0.06] text-center flex flex-col relative"
          >
            {/* Header Banner */}
            <div className="bg-primary text-on-primary py-4 px-4 flex flex-col items-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 mb-1">
                <img
                  src={LOGO_URL}
                  alt="Logo"
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
                <span className="font-headline-md text-headline-md tracking-tight font-extrabold text-white">
                  Sizzle &amp; Bun
                </span>
              </div>
              <p className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed-dim">
                Contactless Digital Ordering
              </p>
            </div>

            {/* Table Number Display */}
            <div className="pt-4 pb-1">
              <span className="inline-block px-4 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-extrabold shadow-xs">
                {zone}
              </span>
              <h2 className="font-headline-xl text-headline-xl text-on-surface mt-2 tracking-tight">
                TABLE <span className="text-primary">#{tableNumber}</span>
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {welcomeNote}
              </p>
            </div>

            {/* Scannable QR Container */}
            <div className="flex flex-col items-center justify-center p-4">
              <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-primary/20 relative group">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Table #${tableNumber} QR`}
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-surface-container text-on-surface-variant text-sm">
                    Generating scannable QR...
                  </div>
                )}
                {/* Center Badge */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg border-2 border-white pointer-events-none">
                  <span className="material-symbols-outlined text-[20px] fill-1">
                    local_fire_department
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1 text-primary font-label-md text-label-md uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>Scan with phone camera to order</span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="bg-surface-container-low mx-4 mb-4 p-3 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mb-1">
                  1
                </span>
                <span className="font-semibold text-on-surface">Scan QR</span>
                <span className="text-[10px] text-on-surface-variant">View live menu</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mb-1">
                  2
                </span>
                <span className="font-semibold text-on-surface">Order &amp; Pay</span>
                <span className="text-[10px] text-on-surface-variant">Apple / Google Pay</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold mb-1">
                  3
                </span>
                <span className="font-semibold text-on-surface">Table Delivery</span>
                <span className="text-[10px] text-on-surface-variant">Hot to Table #{tableNumber}</span>
              </div>
            </div>

            {/* Promo Code Strip */}
            <div className="bg-secondary-fixed text-on-secondary-fixed py-2 px-4 text-xs font-bold flex items-center justify-center gap-1.5 border-t border-black/[0.04]">
              <span className="material-symbols-outlined text-[16px]">loyalty</span>
              <span>Dine-In Special: Use promo code {promoCode} for 20% off!</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {/* Primary: Simulate Scan */}
            <button
              onClick={handleSimulateScan}
              className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">phone_android</span>
              <span>Dine as Table #{tableNumber} (Simulate Scan)</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Stand</span>
              </button>

              <button
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Save Image</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-xs flex items-center justify-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Batch View: Tables 1 to 8 Cards */
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-on-surface">
              Restaurant Table Tent Cards (Tables 1 - 8)
            </span>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">print</span>
              Print All 8
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {batchQrs.map((item) => (
              <div
                key={item.table}
                onClick={() => {
                  setTableNumber(item.table);
                  setViewMode('single');
                }}
                className="bg-surface-container-lowest p-3 rounded-xl shadow-xs border border-black/[0.05] text-center cursor-pointer hover:border-primary transition-all flex flex-col items-center"
              >
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary text-on-primary mb-1">
                  Table #{item.table}
                </span>
                <img
                  src={item.qr}
                  alt={`Table ${item.table}`}
                  className="w-28 h-28 object-contain my-1"
                />
                <span className="text-[11px] font-bold text-on-surface truncate">
                  Sizzle &amp; Bun
                </span>
                <span className="text-[9px] text-on-surface-variant">Tap to customize</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
