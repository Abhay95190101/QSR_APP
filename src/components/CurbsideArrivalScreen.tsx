import React, { useState } from 'react';
import { OrderState } from '../types';
import { LOGO_URL, AVATAR_URL } from '../data/menu';

interface CurbsideArrivalScreenProps {
  order: OrderState;
  onBack: () => void;
  onConfirmParking: (stall: string, vehicle: { description: string; licensePlate: string }) => void;
  onShowToast: (msg: string) => void;
}

export const CurbsideArrivalScreen: React.FC<CurbsideArrivalScreenProps> = ({
  order,
  onBack,
  onConfirmParking,
  onShowToast,
}) => {
  const [selectedStall, setSelectedStall] = useState<string>(order.stallNumber || '04');
  const [showStallSelector, setShowStallSelector] = useState<boolean>(false);
  const [vehicle, setVehicle] = useState({
    description: order.vehicleInfo.description || 'Silver Honda Civic',
    licensePlate: order.vehicleInfo.licensePlate || '7XYZ89',
  });
  const [showVehicleModal, setShowVehicleModal] = useState<boolean>(false);
  const [hazardChecked, setHazardChecked] = useState<boolean>(false);
  const [isAlerting, setIsAlerting] = useState<boolean>(false);
  const [isNotified, setIsNotified] = useState<boolean>(order.runnerNotified || false);

  const [editVehicleDesc, setEditVehicleDesc] = useState(vehicle.description);
  const [editLicense, setEditLicense] = useState(vehicle.licensePlate);

  const handleSelectStall = (stall: string) => {
    setSelectedStall(stall);
    setShowStallSelector(false);
    onShowToast(`Curbside Stall updated to Bay #${stall}`);
  };

  const handleSaveVehicle = () => {
    setVehicle({
      description: editVehicleDesc,
      licensePlate: editLicense,
    });
    setShowVehicleModal(false);
    onShowToast('Vehicle info updated for runner recognition.');
  };

  const handleConfirmParking = () => {
    setIsAlerting(true);
    setTimeout(() => {
      setIsAlerting(false);
      setIsNotified(true);
      onConfirmParking(selectedStall, vehicle);
      onShowToast('Runner Marcus notified! Walking to Bay #' + selectedStall);
    }, 1000);
  };

  return (
    <div className="flex flex-col relative w-full bg-surface min-h-screen max-w-xl mx-auto pb-safe">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(30,27,25,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm max-w-xl mx-auto">
          <div className="flex items-center gap-space-sm min-w-0">
            <button
              onClick={onBack}
              aria-label="Back"
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
              Curbside Arrival Confirmation
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

      {/* Main Content */}
      <main className="flex flex-col relative w-full pt-20 p-gutter space-y-space-lg pb-24">
        {/* Hero / Status Banner Card */}
        <div className="bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] flex flex-col items-center text-center relative overflow-hidden border border-black/[0.03]">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-space-md shadow-xs">
            <span className="material-symbols-outlined text-[32px] fill-1">local_shipping</span>
          </div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-space-xs">
            You've Arrived at Downtown Hub!
          </h2>
          <p className="font-body-md text-on-surface-variant mb-space-md">
            Order {order.orderNumber} • Preparing your hot drop
          </p>
          <div className="inline-flex items-center gap-space-sm bg-secondary-fixed text-on-secondary-fixed px-space-md py-space-xs rounded-full font-label-md">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            Runner on the way in ~2 mins
          </div>
        </div>

        {/* Stall & Vehicle Confirmation Card */}
        <div className="bg-surface-container-lowest rounded-lg p-space-lg shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] space-y-space-md border border-black/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-sm text-on-surface-variant uppercase">Current Stall</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Stall #{selectedStall}
              </h3>
            </div>
            <button
              onClick={() => setShowStallSelector(!showStallSelector)}
              className="bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-space-sm rounded-full font-label-md transition-colors flex items-center gap-space-xs active:scale-95"
            >
              <span>Change Stall</span>
              <span
                className={`material-symbols-outlined text-[18px] transition-transform ${
                  showStallSelector ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>
          </div>

          {/* Stall selector drawer */}
          {showStallSelector && (
            <div className="grid grid-cols-3 gap-space-sm pt-space-xs animate-in fade-in">
              {['01', '02', '03', '04', '05', '06'].map((stall) => (
                <button
                  key={stall}
                  onClick={() => handleSelectStall(stall)}
                  className={`p-space-sm rounded-full font-label-md text-center transition-all ${
                    selectedStall === stall
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Bay {parseInt(stall, 10)}
                </button>
              ))}
            </div>
          )}

          <div className="h-[1px] bg-surface-container my-space-sm" />

          {/* Vehicle Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
              <div>
                <h4 className="font-label-lg text-on-surface">{vehicle.description}</h4>
                <p className="font-body-sm text-on-surface-variant">License: {vehicle.licensePlate}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditVehicleDesc(vehicle.description);
                setEditLicense(vehicle.licensePlate);
                setShowVehicleModal(true);
              }}
              className="text-primary font-label-md hover:underline active:scale-95"
            >
              Edit Vehicle
            </button>
          </div>
        </div>

        {/* Safety & Runner Instructions Banner */}
        <div className="bg-surface-container rounded-lg p-space-md flex items-start gap-space-md">
          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[22px] fill-1">lightbulb</span>
          </div>
          <div className="flex-1">
            <h4 className="font-label-lg text-on-surface mb-space-xs">Turn on hazard lights</h4>
            <p className="font-body-sm text-on-surface-variant leading-relaxed">
              So our runner can spot your car quickly in the lot and deliver your burgers piping hot.
            </p>
          </div>
        </div>

        {/* Interactive Checklist / Actions */}
        <div className="space-y-space-md">
          <label className="flex items-center gap-space-md bg-surface-container-lowest p-space-md rounded-lg cursor-pointer hover:bg-surface-container transition-colors shadow-xs border border-black/[0.03]">
            <input
              type="checkbox"
              checked={hazardChecked}
              onChange={(e) => setHazardChecked(e.target.checked)}
              className="w-6 h-6 rounded accent-primary cursor-pointer"
            />
            <span className="font-body-lg text-on-surface font-medium select-none">
              I am parked and my hazard lights are on
            </span>
          </label>

          <div className="flex flex-col gap-space-sm pt-space-xs">
            <button
              disabled={!hazardChecked || isAlerting}
              onClick={handleConfirmParking}
              className={`w-full h-14 rounded-full font-label-lg shadow-md flex items-center justify-center gap-space-sm transition-all active:scale-[0.98] ${
                isNotified
                  ? 'bg-emerald-600 text-white'
                  : hazardChecked
                  ? 'bg-primary text-on-primary hover:bg-primary-container'
                  : 'bg-primary/40 text-on-primary/70 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isAlerting
                  ? 'progress_activity'
                  : isNotified
                  ? 'check_circle'
                  : 'notifications_active'}
              </span>
              <span>
                {isAlerting
                  ? 'Alerting Runner...'
                  : isNotified
                  ? 'Runner Notified (Marcus on the way!)'
                  : 'Confirm Parking & Alert Runner'}
              </span>
            </button>

            <button
              onClick={onBack}
              className="w-full h-12 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors flex items-center justify-center"
            >
              Cancel / I'm not here yet
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="pt-space-sm pb-space-lg text-center">
          <p className="font-body-sm text-on-surface-variant mb-space-xs">
            Need to make a change to your order?
          </p>
          <a
            onClick={(e) => {
              e.preventDefault();
              onShowToast('Connecting call to Downtown Hub (555-0198)...');
            }}
            href="tel:5550198"
            className="inline-flex items-center gap-space-xs text-primary font-label-md hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            Call Downtown Hub (555-0198)
          </a>
        </div>
      </main>

      {/* Edit Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-5 shadow-2xl relative">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-3">
              Edit Vehicle Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1">
                  Car Make, Model &amp; Color
                </label>
                <input
                  type="text"
                  value={editVehicleDesc}
                  onChange={(e) => setEditVehicleDesc(e.target.value)}
                  placeholder="e.g. Silver Honda Civic"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-medium"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  value={editLicense}
                  onChange={(e) => setEditLicense(e.target.value.toUpperCase())}
                  placeholder="e.g. 7XYZ89"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container text-on-surface text-sm font-medium uppercase"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowVehicleModal(false)}
                className="flex-1 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicle}
                className="flex-1 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-sm"
              >
                Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
