import React, { useState } from 'react';
import { LOGO_URL, AVATAR_URL } from '../data/menu';
import { OrderState } from '../types';

interface RatingTipScreenProps {
  order: OrderState;
  onBack: () => void;
  onSubmitRating: (rating: number, tags: string[], tip: number, feedback: string) => void;
  onShowToast: (msg: string) => void;
}

export const RatingTipScreen: React.FC<RatingTipScreenProps> = ({
  order,
  onBack,
  onSubmitRating,
  onShowToast,
}) => {
  const ratingLabels = ['', 'Needs Work', "It's Okay", 'Pretty Good', 'So Good', 'Absolute Fire'];

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Hot & Fresh', 'Melty Cheese']);
  const [selectedTip, setSelectedTip] = useState<number>(5);
  const [customTip, setCustomTip] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const tagsList = [
    { label: 'Hot & Fresh', icon: 'local_fire_department' },
    { label: 'Super Fast', icon: 'bolt' },
    { label: 'Melty Cheese', icon: 'lunch_dining' },
    { label: 'Crispy Fries', icon: 'drive_file_rename' },
    { label: 'Perfect Toast', icon: 'favorite' },
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectTip = (amount: number, custom = false) => {
    setIsCustom(custom);
    if (!custom) {
      setSelectedTip(amount);
    }
  };

  const currentTipValue = isCustom ? parseFloat(customTip) || 0 : selectedTip;

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onSubmitRating(rating, selectedTags, currentTipValue, feedback);
      onShowToast(`Thank you! $${currentTipValue.toFixed(2)} sent directly to the kitchen crew 🔥`);
      setTimeout(() => {
        onBack();
      }, 1400);
    }, 900);
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
              Order Rating &amp; Tip
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
      <main className="flex flex-col relative w-full pt-20 p-4 gap-6 bg-surface pb-28">
        {/* Success Header / Order Celebration */}
        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface-container-low shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] relative overflow-hidden border border-black/[0.03]">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4 shadow-xs animate-bounce">
            <span className="material-symbols-outlined text-[32px] fill-1">
              local_fire_department
            </span>
          </div>
          <span className="font-label-sm text-primary mb-1 uppercase tracking-widest font-extrabold">
            {order.orderNumber} DELIVERED
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            How was your Sizzle &amp; Bun drop?
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-[280px]">
            Fresh off the flattop and delivered right to your door. Let us know how we did!
          </p>
        </div>

        {/* Interactive 5-Star Rating Component */}
        <div className="flex flex-col items-center p-6 rounded-2xl bg-surface-container-low shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] border border-black/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`star-btn p-1 transition-transform active:scale-90 ${
                  star <= rating ? 'text-secondary-container' : 'text-outline hover:text-secondary-container'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[36px]"
                  style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            ))}
          </div>
          <div className="font-headline-md text-headline-md text-primary h-8 flex items-center transition-all">
            {ratingLabels[rating] || 'Tap to rate!'}
          </div>
        </div>

        {/* Quick Feedback Tags */}
        <div className="flex flex-col p-6 rounded-2xl bg-surface-container-low shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] border border-black/[0.03]">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
            What made it great?
          </h3>
          <p className="font-body-sm text-on-surface-variant mb-4">
            Select all the highlights that apply
          </p>
          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag) => {
              const isSelected = selectedTags.includes(tag.label);
              return (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => toggleTag(tag.label)}
                  className={`tag-btn px-4 py-2.5 rounded-full font-label-md transition-all active:scale-95 flex items-center gap-1.5 border-0 ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tip Selector for Line Cooks & Runners */}
        <div className="flex flex-col p-6 rounded-2xl bg-surface-container-low shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] border border-black/[0.03]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Tip the Kitchen &amp; Runner
            </h3>
            <span className="font-label-sm px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
              100% to staff
            </span>
          </div>
          <p className="font-body-sm text-on-surface-variant mb-4">
            Show some love for the team smashing your patties!
          </p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[2, 3, 5].map((amt) => {
              const isSelected = !isCustom && selectedTip === amt;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectTip(amt, false)}
                  className={`tip-btn py-3 rounded-full font-label-lg transition-all active:scale-95 text-center ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  ${amt}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleSelectTip(0, true)}
              className={`tip-btn py-3 rounded-full font-label-lg transition-all active:scale-95 text-center ${
                isCustom
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Custom
            </button>
          </div>

          {isCustom && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-semibold text-on-surface-variant">Amount: $</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                placeholder="0.00"
                className="w-28 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface font-bold text-sm"
              />
            </div>
          )}

          <div className="flex items-center justify-between px-2 font-body-sm text-on-surface-variant">
            <span>
              Selected tip:{' '}
              <strong className="text-on-surface">${currentTipValue.toFixed(2)}</strong>
            </span>
            <span className="text-xs">Instant payout</span>
          </div>
        </div>

        {/* Optional Review Comment Textarea */}
        <div className="flex flex-col p-6 rounded-2xl bg-surface-container-low shadow-[0_4px_16px_-2px_rgba(26,23,21,0.05)] border border-black/[0.03]">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
            Any extra flavor notes?
          </h3>
          <p className="font-body-sm text-on-surface-variant mb-3">
            Tell the crew what you loved or how we can improve
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full h-28 p-4 rounded-xl bg-surface-container text-on-surface placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all font-body-md"
            placeholder="e.g. The secret sauce was extra generous tonight, absolutely crushed it!"
          />
        </div>

        {/* Primary Submit CTA Button */}
        <div className="pt-2 pb-4">
          <button
            type="button"
            disabled={isSubmitting || isSubmitted}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-full font-label-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
              isSubmitted
                ? 'bg-emerald-600 text-white'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] fill-1">
              {isSubmitting ? 'progress_activity' : isSubmitted ? 'check_circle' : 'send'}
            </span>
            <span>
              {isSubmitting
                ? 'Sending Sizzle...'
                : isSubmitted
                ? 'Tip & Rating Sent!'
                : 'Submit Rating & Tip'}
            </span>
          </button>
        </div>
      </main>
    </div>
  );
};
