/**
 * Single source of truth for analytics and advertising.
 *
 * The Cookie Policy, Privacy Policy and cookie banner read these flags, so the
 * disclosures stay accurate as integrations are switched on. Update the flags
 * in the same change that actually adds an analytics or AdSense script.
 */

/** Set to true only when an analytics script is actually loaded on the site. */
export const ANALYTICS_ENABLED = false;
/** Name of the analytics provider once chosen, e.g. the product name shown to users. */
export const ANALYTICS_PROVIDER_NAME = '';
/** Link to that provider's privacy policy. */
export const ANALYTICS_PROVIDER_PRIVACY_URL = '';

/** Set to true only after AdSense approval, real ad-unit IDs and a Google-certified CMP are in place. */
export const ADSENSE_ENABLED = false;
export const ADSENSE_PUBLISHER_ID = 'ca-pub-9543978037261848';
