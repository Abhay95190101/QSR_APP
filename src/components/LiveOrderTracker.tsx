import React, { useState } from 'react';
import { OrderState } from '../types';

interface LiveOrderTrackerProps {
  order: OrderState;
  onCheckIn: () => void;
  onOpenCurbside: () => void;
  onOpenRating: () => void;
  onShowToast: (msg: string) => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  order,
  onCheckIn,
  onOpenCurbside,
  onOpenRating,
  onShowToast,
}) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);

  const handleArrivalCheckIn = () => {
    onCheckIn();
    setShowArrivalModal(true);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-margin pb-32 pt-20 space-y-space-md">
      {/* Live Status Hero Banner */}
      <div className="w-full bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_20px_-2px_rgba(30,27,25,0.06)] relative overflow-hidden border border-black/[0.03]">
        <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-space-sm mb-space-sm">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/10 text-primary font-label-sm text-label-sm uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Live Kitchen Feed
          </div>
          <span className="font-label-lg text-label-lg text-on-surface-variant">
            {order.orderNumber}
          </span>
        </div>

        <div className="flex items-start justify-between gap-space-md mt-1">
          <div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              {order.status === 'delivered'
                ? 'Order Delivered!'
                : order.status === 'ready'
                ? 'Ready for Pickup'
                : 'Cooking on the Grill'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              {order.fulfillmentMode === 'dine-in' && order.tableNumber
                ? `Table #${order.tableNumber} • Smashing two Angus patties with aged cheddar`
                : 'Smashing two Angus patties with aged cheddar'}
            </p>
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-inner">
            <span
              className="material-symbols-outlined text-[26px] animate-bounce fill-1"
            >
              local_fire_department
            </span>
          </div>
        </div>

        {/* Countdown Pill */}
        <div className="mt-space-md p-space-sm bg-surface-container-low rounded-DEFAULT flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
            <div>
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant block">
                Estimated Ready
              </span>
              <span className="font-headline-md text-headline-md text-on-surface">
                {order.estimatedReadyTime}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md">
              in ~{order.remainingMinutes} mins
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Stepper Tracker */}
      <div className="w-full bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.04)] border border-black/[0.03]">
        <div className="flex items-center justify-between mb-space-md">
          <h2 className="font-label-lg text-label-lg text-on-surface">Prep Milestones</h2>
          <span className="font-label-sm text-label-sm text-primary uppercase">
            Step {order.currentStep} of 4
          </span>
        </div>

        <div className="relative pl-7 space-y-space-lg">
          {/* Vertical Connecting Line */}
          <div className="absolute left-3 top-2 bottom-3 w-0.5 bg-surface-container-high rounded-full -translate-x-1/2" />
          <div
            className="absolute left-3 top-2 w-0.5 bg-primary rounded-full -translate-x-1/2 transition-all duration-700"
            style={{
              height:
                order.currentStep === 1
                  ? '0px'
                  : order.currentStep === 2
                  ? '96px'
                  : order.currentStep === 3
                  ? '192px'
                  : '100%',
            }}
          />

          {/* Step 1: Order Received */}
          <div className="relative flex items-start justify-between">
            <div className="absolute -left-7 top-0.5 w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px] font-bold">check</span>
            </div>
            <div>
              <h3 className="font-label-lg text-label-lg text-on-surface">Order Received</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ticket sent to Downtown line • 12:38 PM
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
              receipt_long
            </span>
          </div>

          {/* Step 2: Sizzling on Grill */}
          <div className="relative flex items-start justify-between">
            <div
              className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                order.currentStep >= 2
                  ? 'bg-primary text-on-primary ring-4 ring-primary-fixed-dim/40 animate-pulse'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] fill-1">outdoor_grill</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-label-lg text-label-lg text-primary">Sizzling on Grill</h3>
                <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm text-[9px] uppercase">
                  Active
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Chef Marcus • Bun toasted golden brown
              </p>
            </div>
            <span className="material-symbols-outlined text-primary text-[20px] animate-spin">
              skillet
            </span>
          </div>

          {/* Step 3: Packaging & Quality Check */}
          <div
            className={`relative flex items-start justify-between ${
              order.currentStep >= 3 ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <div
              className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                order.currentStep >= 3
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
            </div>
            <div>
              <h3 className="font-label-lg text-label-lg text-on-surface">
                Packaging &amp; Quality Check
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Thermal sealed box + golden crisp fries check
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
              verified
            </span>
          </div>

          {/* Step 4: Smart Heated Locker or Table Delivery */}
          <div
            className={`relative flex items-start justify-between ${
              order.currentStep >= 4 ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <div
              className={`absolute -left-7 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${
                order.currentStep >= 4
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">meeting_room</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-label-lg text-label-lg text-on-surface">
                  {order.fulfillmentMode === 'dine-in' && order.tableNumber
                    ? `Dine-In Server Delivery`
                    : 'Smart Heated Locker'}
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                  {order.fulfillmentMode === 'dine-in' && order.tableNumber
                    ? `Table #${order.tableNumber}`
                    : `Cubby #${order.lockerNumber}`}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {order.fulfillmentMode === 'dine-in'
                  ? 'Runner brings hot trays straight to your seat'
                  : 'Kept at 145°F until your arrival'}
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
              lock_open
            </span>
          </div>
        </div>
      </div>

      {/* Smart Locker Digital Pickup Pass */}
      <div className="w-full bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.04)] relative border border-black/[0.03]">
        <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-container-high/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px] fill-1">
              qr_code_scanner
            </span>
            <div>
              <h2 className="font-label-lg text-label-lg text-on-surface">
                {order.fulfillmentMode === 'dine-in'
                  ? 'Dine-In Table Pass'
                  : 'Express Pickup Pass'}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {order.fulfillmentMode === 'dine-in'
                  ? 'Order linked to your physical seat'
                  : 'Contactless cubby release'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-on-surface-variant font-label-sm text-label-sm block uppercase">
              Assigned Slot
            </span>
            <span className="font-headline-md text-headline-md text-primary">
              {order.fulfillmentMode === 'dine-in' && order.tableNumber
                ? `Table #${order.tableNumber}`
                : `Locker #${order.lockerNumber}`}
            </span>
          </div>
        </div>

        {/* Scannable Code Display */}
        <div className="flex flex-col items-center justify-center bg-surface-container-low rounded-DEFAULT p-space-md">
          {/* Simulated Crisp Vector QR */}
          <div className="w-36 h-36 bg-surface-container-lowest p-2 rounded-DEFAULT shadow-xs flex items-center justify-center">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 100 100">
              <path
                className="text-on-surface"
                d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z"
              />
              <path
                className="text-on-surface"
                d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z"
              />
              <path
                className="text-on-surface"
                d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z"
              />
              <rect className="text-primary" height="8" width="8" x="38" y="6" />
              <rect className="text-on-surface" height="6" width="14" x="50" y="6" />
              <rect className="text-on-surface" height="6" width="18" x="38" y="20" />
              <rect className="text-on-surface" height="6" width="12" x="6" y="38" />
              <rect className="text-primary" height="12" width="12" x="24" y="44" />
              <rect className="text-on-surface" height="16" width="16" x="42" y="38" />
              <rect className="text-on-surface" height="20" width="10" x="64" y="38" />
              <rect className="text-primary" height="8" width="14" x="80" y="44" />
              <rect className="text-on-surface" height="8" width="18" x="40" y="62" />
              <rect className="text-on-surface" height="14" width="14" x="64" y="66" />
              <rect className="text-primary" height="10" width="10" x="84" y="62" />
              <rect className="text-on-surface" height="16" width="14" x="42" y="78" />
              <rect className="text-on-surface" height="14" width="12" x="82" y="80" />
            </svg>
          </div>

          {/* Scannable Barcode & PIN fallback */}
          <div className="mt-space-sm flex flex-col items-center">
            <div className="h-6 flex items-center gap-0.5 opacity-80">
              <div className="w-0.5 h-full bg-on-surface" />
              <div className="w-1.5 h-full bg-on-surface" />
              <div className="w-0.5 h-full bg-on-surface" />
              <div className="w-1 h-full bg-on-surface" />
              <div className="w-2 h-full bg-on-surface" />
              <div className="w-0.5 h-full bg-on-surface" />
              <div className="w-1 h-full bg-on-surface" />
              <div className="w-0.5 h-full bg-on-surface" />
              <div className="w-2 h-full bg-on-surface" />
              <div className="w-1 h-full bg-on-surface" />
              <div className="w-0.5 h-full bg-on-surface" />
              <div className="w-1.5 h-full bg-on-surface" />
              <div className="w-0.5 h-full bg-on-surface" />
              <div className="w-2 h-full bg-on-surface" />
              <div className="w-0.5 h-full bg-on-surface" />
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest mt-1">
              {order.orderNumber}-7924
            </span>
          </div>

          {/* PIN Code Highlight */}
          <div className="mt-space-sm flex items-center gap-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Locker PIN:</span>
            <span className="px-2 py-0.5 bg-surface-container text-on-surface font-headline-md text-headline-md tracking-wider rounded">
              {order.lockerPin}
            </span>
          </div>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-space-sm">
          {order.fulfillmentMode === 'dine-in'
            ? 'Show this screen if runner asks to confirm table ownership.'
            : 'Scan screen at Locker Bay B scanner, or tap PIN on screen.'}
        </p>
      </div>

      {/* Primary One-Tap Arrival & Support Buttons */}
      <div className="flex flex-col gap-space-sm">
        <button
          onClick={handleArrivalCheckIn}
          className={`w-full h-14 font-label-lg text-label-lg rounded-full shadow-[0_8px_24px_-4px_rgba(215,59,0,0.35)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
            order.checkedIn
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-primary text-on-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {order.checkedIn ? 'check' : 'where_to_vote'}
          </span>
          <span>
            {order.checkedIn
              ? 'Checked In (Staff Notified)'
              : 'I Have Arrived (Check-in)'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-space-sm">
          <button
            onClick={() => onShowToast('Opening navigation map to 4th & Main Downtown Hub (0.6 mi)...')}
            className="h-12 bg-surface-container-high/80 text-on-surface font-label-md text-label-md rounded-full flex items-center justify-center gap-1.5 active:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">directions</span>
            Directions (0.6 mi)
          </button>
          <button
            onClick={() => onShowToast('Calling Downtown Hub at 555-0198...')}
            className="h-12 bg-surface-container-high/80 text-on-surface font-label-md text-label-md rounded-full flex items-center justify-center gap-1.5 active:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">call</span>
            Call Downtown Hub
          </button>
        </div>

        {/* Quick link to Curbside screen */}
        <button
          onClick={onOpenCurbside}
          className="w-full py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">directions_car</span>
          <span>View Curbside Bay &amp; Vehicle Check-in</span>
        </button>

        {/* Quick link to Rating screen */}
        <button
          onClick={onOpenRating}
          className="w-full py-2.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-secondary text-[18px]">star</span>
          <span>Rate Your Meal &amp; Tip Kitchen</span>
        </button>
      </div>

      {/* Order Details Accordion */}
      <div className="w-full bg-surface-container-lowest rounded-lg p-space-md shadow-[0_4px_16px_-2px_rgba(26,23,21,0.04)] border border-black/[0.03]">
        <button
          className="w-full flex items-center justify-between text-left"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">receipt</span>
            <div>
              <span className="font-label-lg text-label-lg text-on-surface block">
                Order Summary ({order.items.reduce((s: number, i) => s + i.quantity, 0)} Items)
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Paid via {order.paymentMethod} • ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
          <span
            className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${
              isAccordionOpen ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </button>

        {/* Expandable Content */}
        {isAccordionOpen && (
          <div className="pt-space-md mt-space-sm border-t border-surface-container-high/60 space-y-space-sm animate-in fade-in">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-start justify-between">
                <div className="flex items-start gap-space-sm">
                  <span className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center font-label-sm text-label-sm text-on-surface">
                    {item.quantity}×
                  </span>
                  <div>
                    <span className="font-label-lg text-label-lg text-on-surface block">
                      {item.name}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block">
                      {item.customizationSummary || 'Chef signature recipe'}
                    </span>
                  </div>
                </div>
                <span className="font-label-lg text-label-lg text-on-surface">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}

            {/* Cost Breakdown */}
            <div className="pt-space-sm border-t border-surface-container-high/40 space-y-1 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Discounts</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxes &amp; Local Bag Fee</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kitchen Tip</span>
                <span>${order.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-label-lg text-label-lg text-on-surface pt-1">
                <span>Total</span>
                <span className="text-primary font-extrabold">${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Pickup Location Card inside dropdown */}
            <div className="mt-space-sm p-space-sm rounded-DEFAULT bg-surface-container flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">store</span>
              <div className="min-w-0">
                <span className="font-label-md text-label-md text-on-surface block truncate">
                  Sizzle &amp; Bun • Downtown Flagship
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate block">
                  4th &amp; Main St, Suite 102
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Arrival Confirmation Dialog (Modal) */}
      {showArrivalModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-gutter animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-lg p-space-lg shadow-xl relative animate-in zoom-in-95">
            <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mx-auto mb-space-sm">
              <span className="material-symbols-outlined text-[28px] fill-1">check_circle</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface text-center">
              You're Checked In!
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-center mt-1">
              The kitchen has been notified that you are outside. Your food is moving to{' '}
              <strong className="text-on-surface">Locker #{order.lockerNumber}</strong> now!
            </p>
            <button
              className="mt-space-md w-full h-12 bg-primary text-on-primary font-label-lg text-label-lg rounded-full shadow-md active:scale-95 transition-all"
              onClick={() => setShowArrivalModal(false)}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
