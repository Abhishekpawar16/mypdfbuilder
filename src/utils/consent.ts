/**
 * Cookie / storage consent for MyPDFBuilder.
 *
 * Categories:
 *  - necessary:   always on (theme, language, consent choice, optional drafts)
 *  - analytics:   off until the visitor opts in
 *  - advertising: off until the visitor opts in
 *
 * Any analytics or advertising integration must check `hasConsent()` (or listen
 * with `onConsentChange`) before loading. Choices are also forwarded to Google
 * Consent Mode v2 through `window.dataLayer`, so Google tags added later start
 * in a denied state and respect the visitor's choice.
 */

export type ConsentCategory = 'analytics' | 'advertising';

export interface ConsentState {
  version: 2;
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
}

export const CONSENT_STORAGE_KEY = 'mypdfbuilder_cookie_consent_v2';
const LEGACY_CONSENT_KEYS = ['texttopdf_cookie_consent_v1'];
const CHANGE_EVENT = 'mpb:consent-change';
const OPEN_SETTINGS_EVENT = 'mpb:open-cookie-settings';

type GtagWindow = Window & { dataLayer?: unknown[] };

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  // Google tags read the `arguments` object, matching the official gtag snippet.
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments);
  void args;
}

function toConsentModeSignals(state: Pick<ConsentState, 'analytics' | 'advertising'> | null) {
  const analytics = state?.analytics ? 'granted' : 'denied';
  const ads = state?.advertising ? 'granted' : 'denied';
  return {
    analytics_storage: analytics,
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  };
}

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed?.version !== 2) return null;
    return {
      version: 2,
      necessary: true,
      analytics: parsed.analytics === true,
      advertising: parsed.advertising === true,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  return readConsent()?.[category] === true;
}

export function saveConsent(choice: { analytics: boolean; advertising: boolean }): ConsentState {
  const state: ConsentState = {
    version: 2,
    necessary: true,
    analytics: choice.analytics,
    advertising: choice.advertising,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    LEGACY_CONSENT_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  gtag('consent', 'update', toConsentModeSignals(state));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<ConsentState>(CHANGE_EVENT, { detail: state }));
  }
  return state;
}

export function onConsentChange(listener: (state: ConsentState) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<ConsentState>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

/** Reopens the cookie preferences panel (used by the footer "Cookie Settings" link). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export function onOpenCookieSettings(listener: () => void): () => void {
  window.addEventListener(OPEN_SETTINGS_EVENT, listener);
  return () => window.removeEventListener(OPEN_SETTINGS_EVENT, listener);
}

/**
 * Must run before any Google tag loads. Sets Consent Mode defaults to denied and
 * then applies a previously saved choice, if any. Makes no network requests.
 */
export function initConsentDefaults() {
  if (typeof window === 'undefined') return;
  gtag('consent', 'default', { ...toConsentModeSignals(null), wait_for_update: 500 });
  const saved = readConsent();
  if (saved) gtag('consent', 'update', toConsentModeSignals(saved));
}
