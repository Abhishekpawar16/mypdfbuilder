import React, { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

interface CookieConsentProps {
  onOpenCookiePolicy: () => void;
}

const CONSENT_KEY = 'texttopdf_cookie_consent_v1';

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenCookiePolicy }) => {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const saveChoice = () => {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          essential: true,
          analytics: false,
          ads: false,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore storage errors in restricted contexts
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy and storage notice"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Your Privacy &amp; Cookie Preferences</p>
            <p className="mt-1 leading-relaxed">
              Your documents stay in this browser. This release stores local preferences and optional drafts; analytics
              and advertising scripts are not active.{' '}
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
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {showPrefs ? 'Hide Details' : 'Details'}
          </button>
          <button
            type="button"
            onClick={saveChoice}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Got it
          </button>
          <button
            type="button"
            aria-label="Close cookie banner"
            onClick={saveChoice}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showPrefs && (
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            Only browser storage for preferences and optional text drafts is active. No analytics or advertising cookies
            are set by this release.
          </div>
        </div>
      )}
    </div>
  );
};
