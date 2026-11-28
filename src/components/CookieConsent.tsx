import React, { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';

interface CookieConsentProps {
  onOpenCookiePolicy: () => void;
}

const CONSENT_KEY = 'mypdfbuilder_cookie_consent_v2';
const OPEN_SETTINGS_EVENT = 'mypdfbuilder:open-cookie-settings';

type Preferences = { essential: true; analytics: boolean; ads: boolean; updatedAt: string };

export const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenCookiePolicy }) => {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Preferences>;
        setAnalytics(parsed.analytics === true);
        setAds(parsed.ads === true);
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
    const openSettings = () => {
      setVisible(true);
      setShowPrefs(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
  }, []);

  const saveChoice = (nextAnalytics: boolean, nextAds: boolean) => {
    const preferences: Preferences = {
      essential: true,
      analytics: nextAnalytics,
      ads: nextAds,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    } catch {
      // Keep the banner available when browser storage is restricted.
    }
    setAnalytics(nextAnalytics);
    setAds(nextAds);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy and cookie preferences"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Your Privacy &amp; Cookie Preferences</p>
            <p className="mt-1 leading-relaxed">
              Essential browser storage supports site features. Analytics and advertising technologies are not active in this release.
              Optional categories remain off unless you choose them.{' '}
              <button type="button" onClick={onOpenCookiePolicy} className="font-medium text-indigo-600 underline dark:text-indigo-400">
                Cookie Policy
              </button>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <button type="button" onClick={() => setShowPrefs((v) => !v)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
            {showPrefs ? 'Hide preferences' : 'Customize'}
          </button>
          <button type="button" onClick={() => saveChoice(false, false)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold dark:border-slate-700">
            Reject Non-Essential
          </button>
          <button type="button" onClick={() => saveChoice(true, true)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
            Accept All
          </button>
        </div>
      </div>
      {showPrefs && (
        <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
          <label className="flex items-center justify-between gap-4">
            <span><strong>Strictly necessary</strong><span className="block text-xs text-slate-500">Required for core site functionality; always enabled.</span></span>
            <input type="checkbox" checked disabled aria-label="Strictly necessary cookies always enabled" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span><strong>Analytics</strong><span className="block text-xs text-slate-500">May be used in future to understand traffic and site performance.</span></span>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span><strong>Advertising</strong><span className="block text-xs text-slate-500">May be used if advertising, including Google AdSense, is activated.</span></span>
            <input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} />
          </label>
          <div className="flex justify-end">
            <button type="button" onClick={() => saveChoice(analytics, ads)} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
