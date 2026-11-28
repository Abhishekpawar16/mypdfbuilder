import React from 'react';
import { X } from 'lucide-react';
import {
  ADSENSE_ENABLED,
  ANALYTICS_ENABLED,
  ANALYTICS_PROVIDER_NAME,
  ANALYTICS_PROVIDER_PRIVACY_URL,
} from '../config/tracking';
import { openCookieSettings } from '../utils/consent';

const POLICY_LAST_UPDATED = 'November 28, 2026';
const linkClass = 'font-medium text-indigo-600 underline dark:text-indigo-400';
const h3Class = 'text-base font-bold text-slate-900 dark:text-white';

const ExtLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
    {children}
  </a>
);

const CookieSettingsButton: React.FC = () => (
  <button type="button" onClick={openCookieSettings} className={linkClass}>
    Cookie Settings
  </button>
);

const analyticsProviderText = ANALYTICS_PROVIDER_NAME ? ANALYTICS_PROVIDER_NAME : 'a third-party analytics service';

const AnalyticsStatus: React.FC = () =>
  ANALYTICS_ENABLED ? (
    <>
      We use {analyticsProviderText} to understand website traffic and how visitors use our tools.
      {ANALYTICS_PROVIDER_PRIVACY_URL && (
        <>
          {' '}See the provider&apos;s <ExtLink href={ANALYTICS_PROVIDER_PRIVACY_URL}>privacy policy</ExtLink>.
        </>
      )}
    </>
  ) : (
    <>
      We are introducing analytics to understand website traffic and how visitors use our tools. At the time of this
      update, analytics scripts are not yet running on the site; this policy will name the provider once it is live.
    </>
  );

const AdsStatus: React.FC = () =>
  ADSENSE_ENABLED ? (
    <>We use Google AdSense to display advertising that helps keep MyPDFBuilder free.</>
  ) : (
    <>
      We plan to display advertising through Google AdSense to keep MyPDFBuilder free. At the time of this update,
      AdSense ads are not yet active on the site.
    </>
  );

export type LegalDocType = 'privacy' | 'terms' | 'disclaimer' | 'cookies' | 'about' | null;

interface LegalModalProps {
  docType: LegalDocType;
  onClose: () => void;
}

const LEGAL_CONTENT: Record<Exclude<LegalDocType, null>, { title: string; body: React.ReactNode }> = {
  about: {
    title: 'About MyPDFBuilder',
    body: (
      <div className="space-y-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          <strong>MyPDFBuilder</strong> (<code>mypdfbuilder.com</code>) is a free online PDF toolkit with 16 tools to
          create, edit, convert, compress, merge, split, and organize PDF files — all directly from your browser. We
          built it because everyday PDF tasks shouldn&apos;t require installing heavy software, creating an account, or
          uploading private documents to a server you don&apos;t trust.
        </p>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">What we do</h3>
          <p className="mt-1">
            From one clean toolkit you can turn plain text or <code>.txt</code> files into formatted PDFs, shrink a
            document to fit upload limits, combine certificates into a single PDF for a job or visa application, convert
            PDFs to Word, Excel, PowerPoint, or JPG, and add text annotations, set annotation colors, add watermarks, or rotate pages. Each
            tool is purpose-built to do one job cleanly without burying you in clutter.
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Privacy first</h3>
          <p className="mt-1">
            Every tool on MyPDFBuilder runs 100% inside your browser, which means your files never leave your device.
            We don&apos;t upload, store, or inspect your documents on any external server — you keep the original, and we
            keep nothing.
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Built for the world</h3>
          <p className="mt-1">
            MyPDFBuilder is designed for the everyday paperwork people handle everywhere — compressing scans to meet
            strict upload limits, merging certificates and IDs for applications, and converting notes, reports, and
            invoices fast on any phone, tablet, or desktop worldwide, with support for A4, A3, Letter, Legal, and
            global Unicode text.
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Free to use</h3>
          <p className="mt-1">
            All 16 tools on MyPDFBuilder are completely free to use with no sign-up, no watermarks, and no paywalls —
            so a quick task never costs you anything.
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Learn more</h3>
          <p className="mt-1">
            Have a question, bug report, or feature suggestion? We&apos;d love to hear from you — email{' '}
            <a href="mailto:support@mypdfbuilder.com" className="font-medium text-indigo-600 underline dark:text-indigo-400">
              support@mypdfbuilder.com
            </a>{' '}
            or use the Contact section on our homepage.
          </p>
        </div>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="text-xs text-slate-400">Last Updated: {POLICY_LAST_UPDATED}</p>
        <p>
          At <strong>MyPDFBuilder</strong> (<code>mypdfbuilder.com</code>), your privacy comes first. This Privacy
          Policy explains what happens when you use our tools, what limited data may be processed, and the choices you
          control.
        </p>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Your files stay on your device</h3>
          <p className="mt-1">
            The conversion tools process document contents in your browser and do not upload them to MyPDFBuilder. The
            hosting provider may process routine request metadata, such as IP address and browser information, to serve
            and secure the website; its own privacy terms and retention practices apply.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Optional local auto-save</h3>
          <p className="mt-1">
            Auto-Save is off by default for new browser profiles. If you enable it in the Text to PDF editor, your
            browser stores your current draft locally in <code>localStorage</code> so you don&apos;t lose work on
            refresh. Turning Auto-Save off removes the saved draft. A draft from an earlier version may be restored for
            one session, but is not saved again unless you enable Auto-Save. You can clear saved data anytime with one
            click.
          </p>
        </div>
        <div>
          <h3 className={h3Class}>3. Analytics</h3>
          <p className="mt-1">
            <AnalyticsStatus /> Analytics may collect information such as pages visited, tools used, approximate
            location derived from your IP address, device and browser type, referring website, and timestamps.
            Analytics never receives the contents of the documents or text you process. Analytics runs only if you allow
            it in <CookieSettingsButton />.
          </p>
        </div>
        <div>
          <h3 className={h3Class}>4. Advertising &amp; Google AdSense</h3>
          <p className="mt-1">
            <AdsStatus /> When advertising is active:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website
              or other websites.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your
              visits to this site and/or other sites on the Internet.
            </li>
            <li>
              You may opt out of personalized advertising by visiting{' '}
              <ExtLink href="https://www.google.com/settings/ads">Google Ads Settings</ExtLink>. You can also opt out of
              some third-party vendors&apos; use of cookies for personalized advertising at{' '}
              <ExtLink href="https://www.aboutads.info/choices/">www.aboutads.info</ExtLink>.
            </li>
            <li>
              Learn{' '}
              <ExtLink href="https://policies.google.com/technologies/partner-sites">
                how Google uses information from sites that use its services
              </ExtLink>
              .
            </li>
          </ul>
          <p className="mt-2">
            Visitors in the European Economic Area, the United Kingdom, and Switzerland will be asked for consent
            through a Google-certified consent tool before personalized ads are shown. Elsewhere, you can turn
            advertising cookies on or off in <CookieSettingsButton />.
          </p>
        </div>
        <div>
          <h3 className={h3Class}>5. Third-party services</h3>
          <p className="mt-1">
            Third parties that may process information when you use the site include our hosting provider (to deliver
            and secure the website), the analytics provider (only with your consent, once active), and Google and its
            advertising partners (once advertising is active, subject to your consent choices where required). These
            providers process data under their own privacy policies.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">6. Contact &amp; your rights</h3>
          <p className="mt-1">
            The contact form opens a draft in your email application; it does not submit the message to our website.
            If you send that message or email us at{' '}
            <a href="mailto:support@mypdfbuilder.com" className="font-medium text-indigo-600 underline dark:text-indigo-400">
              support@mypdfbuilder.com
            </a>
            , we use your name and email solely to reply. Depending on where you live, laws such as the GDPR or CCPA
            may give you rights to access or delete your personal information; contact us to make a request. You can
            withdraw or change cookie consent at any time in <CookieSettingsButton />.
          </p>
        </div>
      </div>
    ),
  },
  terms: {
    title: 'Terms and Conditions',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="text-xs text-slate-400">Last Updated: November 24, 2026</p>
        <p>
          By accessing or using <strong>MyPDFBuilder</strong> (<code>mypdfbuilder.com</code>), you agree to these Terms
          and Conditions. If you do not agree, please discontinue use of the website.
        </p>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Free personal &amp; commercial use</h3>
          <p className="mt-1">
            You may use MyPDFBuilder free of charge for personal, academic, and commercial document tasks. You retain
            100% ownership and copyright over every file you create, convert, or edit.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Acceptable use</h3>
          <p className="mt-1">
            You agree not to misuse the platform, attempt to disrupt site availability, scrape or reverse-engineer
            site scripts for abusive automation, or process unlawful content.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Service availability</h3>
          <p className="mt-1">
            MyPDFBuilder is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. We may update,
            improve, or modify tools and limits at any time without prior notice.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Limitation of liability</h3>
          <p className="mt-1">
            To the fullest extent permitted by law, MyPDFBuilder is not liable for any direct, indirect, incidental, or
            consequential damages arising from your use of generated or converted files. Always review critical documents
            before printing or official submission.
          </p>
        </div>
      </div>
    ),
  },
  disclaimer: {
    title: 'Disclaimer',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          <strong>MyPDFBuilder</strong> (<code>mypdfbuilder.com</code>) is an independent browser-based document utility
          and is not affiliated with, endorsed by, or sponsored by Adobe Inc., Microsoft Corporation, Google LLC,
          Smallpdf, iLovePDF, or PDF24.
        </p>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Formatting &amp; conversion accuracy</h3>
          <p className="mt-1">
            While our client-side tools are built for clean typography, pagination, and layout fidelity, exact rendering
            may vary slightly depending on your device, browser engine, installed fonts, or PDF viewer. Complex scanned
            PDFs or heavily styled Office files may require a quick visual check after conversion.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No professional or legal advice</h3>
          <p className="mt-1">
            Educational guides, FAQs, and templates on this website are for general informational purposes only and do
            not constitute legal, financial, or compliance advice.
          </p>
        </div>
      </div>
    ),
  },
  cookies: {
    title: 'Cookie Policy',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="text-xs text-slate-400">Last Updated: {POLICY_LAST_UPDATED}</p>
        <p>
          This notice explains how <strong>MyPDFBuilder</strong> (<code>mypdfbuilder.com</code>) uses cookies and
          similar technologies such as <code>localStorage</code>, and how you can control them. The documents and text
          you process stay in your browser and are not placed in cookies.
        </p>
        <div>
          <h3 className={h3Class}>1. Necessary storage (always active)</h3>
          <p className="mt-1">
            These are required for the site to work and do not need consent. The site stores your theme, language, and
            cookie choice in <code>localStorage</code>. Text drafts are saved only if you enable Auto-Save in the Text
            to PDF editor; it is off by default. Turning Auto-Save off or using Clear Saved Data removes the saved draft.
            Our hosting provider may also set strictly necessary security cookies to protect the site from abuse.
          </p>
        </div>
        <div>
          <h3 className={h3Class}>2. Analytics cookies (optional)</h3>
          <p className="mt-1">
            <AnalyticsStatus /> Analytics cookies and similar identifiers help us measure visits, popular tools, and
            errors. They are set only if you allow &ldquo;Analytics&rdquo; in <CookieSettingsButton />.
          </p>
        </div>
        <div>
          <h3 className={h3Class}>3. Advertising cookies (optional)</h3>
          <p className="mt-1">
            <AdsStatus /> Google and its partners may use advertising cookies and similar technologies to serve ads,
            limit how often you see an ad, measure ad performance, prevent fraud, and, where permitted, show
            personalized ads based on your visits to this and other websites. You can opt out of personalized
            advertising at <ExtLink href="https://www.google.com/settings/ads">Google Ads Settings</ExtLink> or{' '}
            <ExtLink href="https://www.aboutads.info/choices/">www.aboutads.info</ExtLink>, and read{' '}
            <ExtLink href="https://policies.google.com/technologies/ads">how Google uses cookies in advertising</ExtLink>.
          </p>
        </div>
        <div>
          <h3 className={h3Class}>4. Your choices</h3>
          <p className="mt-1">
            On your first visit you can accept all, reject non-essential, or customize analytics and advertising
            separately. You can change your choice at any time in <CookieSettingsButton /> (also in the website
            footer). Visitors in the EEA, UK, and Switzerland will see a Google-certified consent message before
            personalized ads are shown. You can also block or delete cookies in your browser settings; necessary
            storage may then stop working.
          </p>
        </div>
        <div>
          <h3 className={h3Class}>5. Changes and contact</h3>
          <p className="mt-1">
            We will update this policy when we add or change analytics or advertising services. Questions? Email{' '}
            <a href="mailto:support@mypdfbuilder.com" className={linkClass}>
              support@mypdfbuilder.com
            </a>
            .
          </p>
        </div>
      </div>
    ),
  },
};

export const LegalModal: React.FC<LegalModalProps> = ({ docType, onClose }) => {
  if (!docType) return null;
  const content = LEGAL_CONTENT[docType];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 id="legal-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
            {content.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{content.body}</div>
        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
