import React, { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { onOpenCookieSettings, readConsent, saveConsent } from '../utils/consent';
import { ADSENSE_ENABLED, ANALYTICS_ENABLED } from '../config/tracking';

interface CookieConsentProps {
  onOpenCookiePolicy: () => void;
}

interface CategoryRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ id, title, description, checked, disabled, onChange }) => (
  <div className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
    <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </label>
      <p className="mt-0.5">{description}</p>
    </div>
    <input
      id={id}
      type="checkbox"
      role="switch"
      checked={checked}
      disabled={disabled}
      aria-checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      className="mt-1 h-4 w-4 shrink-0 accent-indigo-600 disabled:opacity-60"
    />
  </div>
);

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenCookiePolicy }) => {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    if (!saved) {
      setVisible(true);
    } else {
      setAnalytics(saved.analytics);
      setAdvertising(saved.advertising);
    }
    return onOpenCookieSettings(() => {
      const current = readConsent();
      setAnalytics(current?.analytics ?? false);
      setAdvertising(current?.advertising ?? false);
      setShowPrefs(true);
      setVisible(true);
    });
  }, []);

  const commit = (choice: { analytics: boolean; advertising: boolean }) => {
    saveConsent(choice);
    setAnalytics(choice.analytics);
    setAdvertising(choice.advertising);
    setShowPrefs(false);
    setVisible(false);
  };

  if (!visible) return null;

  const analyticsStatus = ANALYTICS_ENABLED ? '' : ' Not yet active on this site; your choice will apply once it is.';
  const adsStatus = ADSENSE_ENABLED ? '' : ' Google AdSense is planned but not yet active; your choice will apply once it is.';

  return (
    <div
      role="region"
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-h-[85vh] max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Your Privacy &amp; Cookie Preferences</p>
            <p className="mt-1 leading-relaxed">
              Your documents are processed in this browser and are not uploaded. We use necessary browser storage to
              run the site. With your permission, we also use analytics to understand site traffic and advertising
              technologies, including Google AdSense, to fund the free tools. You can change your choice anytime from
              &ldquo;Cookie Settings&rdquo; in the footer.{' '}
              <button
                type="button"
                onClick={onOpenCookiePolicy}
                className="font-medium text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
              >
                Cookie Policy
              </button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => setShowPrefs(!showPrefs)}
            aria-expanded={showPrefs}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {showPrefs ? 'Hide Settings' : 'Customize'}
          </button>
          <button
            type="button"
            onClick={() => commit({ analytics: false, advertising: false })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => commit({ analytics: true, advertising: true })}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            Accept all
          </button>
          <button
            type="button"
            aria-label="Close cookie banner"
            onClick={() => {
              // First visit: closing counts as rejecting non-essential cookies.
              // Reopened from Cookie Settings: closing keeps the saved choice.
              if (readConsent()) {
                setShowPrefs(false);
                setVisible(false);
              } else {
                commit({ analytics: false, advertising: false });
              }
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showPrefs && (
        <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <CategoryRow
            id="consent-necessary"
            title="Necessary (always on)"
            description="Stores your theme, language, this cookie choice, and an optional Text to PDF draft (only if you enable Auto-Save). Your hosting provider may also use security cookies to protect the site."
            checked
            disabled
          />
          <CategoryRow
            id="consent-analytics"
            title="Analytics"
            description={`Helps us understand how visitors use the site (for example, pages visited and tools used) so we can improve it. Document contents are never sent.${analyticsStatus}`}
            checked={analytics}
            onChange={setAnalytics}
          />
          <CategoryRow
            id="consent-advertising"
            title="Advertising"
            description={`Lets Google and its partners use cookies to show and measure ads, including personalized ads based on your visits to this and other websites.${adsStatus}`}
            checked={advertising}
            onChange={setAdvertising}
          />
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => commit({ analytics, advertising })}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              Save preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
