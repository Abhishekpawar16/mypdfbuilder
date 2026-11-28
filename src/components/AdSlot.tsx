import React from 'react';
import { ADSENSE_ENABLED, ADSENSE_PUBLISHER_ID } from '../config/tracking';

export type AdPlacement =
  | 'header-banner'
  | 'below-hero'
  | 'mid-content'
  | 'before-faq'
  | 'footer-banner';

interface AdSlotProps {
  placement: AdPlacement;
  slotId?: string;
  className?: string;
}

const PLACEMENT_META: Record<AdPlacement, { label: string; sizeHint: string; minHeight: string }> = {
  'header-banner': {
    label: 'Header Leaderboard Ad Slot',
    sizeHint: 'Responsive 728×90 / 320×50',
    minHeight: 'min-h-[90px]',
  },
  'below-hero': {
    label: 'Below Hero Ad Slot',
    sizeHint: 'Responsive Display Banner',
    minHeight: 'min-h-[100px]',
  },
  'mid-content': {
    label: 'In-Article Ad Slot',
    sizeHint: 'Responsive In-Feed / Display',
    minHeight: 'min-h-[120px]',
  },
  'before-faq': {
    label: 'Pre-FAQ Ad Slot',
    sizeHint: 'Responsive Horizontal Unit',
    minHeight: 'min-h-[100px]',
  },
  'footer-banner': {
    label: 'Footer Ad Slot',
    sizeHint: 'Responsive Footer Banner',
    minHeight: 'min-h-[90px]',
  },
};

// ADSENSE_ENABLED lives in src/config/tracking.ts so the privacy disclosures
// update together with the ad integration. Consent for EEA/UK/Switzerland
// visitors must be collected by a Google-certified CMP before ads are enabled.
const PUBLISHER_ID = ADSENSE_PUBLISHER_ID;

export const AdSlot: React.FC<AdSlotProps> = ({
  placement,
  slotId = 'TO_BE_CONFIGURED',
  className = '',
}) => {
  const meta = PLACEMENT_META[placement];

  if (!ADSENSE_ENABLED) return null;

  return (
    <aside
      aria-label={`Advertisement - ${meta.label}`}
      className={`mx-auto w-full max-w-5xl px-4 py-3 ${className}`}
    >
      <div
        className={`flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-center dark:border-slate-800 dark:bg-slate-900/50 ${meta.minHeight}`}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Advertisement
        </span>
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block' }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
};
