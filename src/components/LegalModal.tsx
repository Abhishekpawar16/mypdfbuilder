import React from 'react';
import { X } from 'lucide-react';

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
        <p className="text-xs text-slate-400">Last Updated: November 28, 2026</p>
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
            Theme and language preferences, and your cookie category choice, are stored in your browser&apos;s{' '}
            <code>localStorage</code>. Text Auto-Save is off by default for new browser profiles. If you enable it in
            the Text to PDF editor, your draft is stored locally so you can restore it after a refresh. Turning
            Auto-Save off or using Clear Saved Data removes the saved draft. A draft from an earlier version may be
            restored for one session, but is not saved again unless you enable Auto-Save. Files selected for conversion
            are processed in the browser and are not uploaded to MyPDFBuilder.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Information processed by hosting and security providers</h3>
          <p className="mt-1">
            When your browser requests a page, the service hosting or protecting the website may process technical
            request information such as your IP address, browser and device details, requested page, referring page,
            and request time to deliver and secure the site. MyPDFBuilder has no account system or application
            database. We have not verified the exact fields or retention periods used by the hosting and security
            providers; their own privacy notices and terms apply.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Analytics and advertising</h3>
          <p className="mt-1">
            As of November 28, 2026, no analytics service is configured and no Google AdSense advertising script is
            active on this site. Analytics and AdSense are planned, not current services. Before either is enabled, we
            will identify the provider, purposes, data categories, and controls here. If advertising is activated,
            Google and its advertising partners may process technical and ad interaction information using cookies or
            similar technologies to deliver and measure ads, limit repetition, and personalize ads where permitted.
            The configuration and your choices determine what applies. The tools do not send document contents to
            analytics or advertising services.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Sharing and retention</h3>
          <p className="mt-1">
            The site does not receive the contents of files processed in your browser. Hosting and security providers
            may handle technical request data to operate the site; analytics and advertising providers are not
            currently configured. The contact form opens a draft in your email application and does not send anything
            until you choose to send it. If you email us, we use the message to respond. We have not verified
            provider-specific log or correspondence retention periods and do not state a fixed period here.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">6. Contact and privacy choices</h3>
          <p className="mt-1">
            Depending on where you live, applicable privacy laws may give you rights concerning personal information,
            such as requesting access, correction, deletion, or limits on certain uses. The rights available depend
            on the law that applies. To ask a question or make a request, email{' '}
            <a href="mailto:support@mypdfbuilder.com" className="font-medium text-indigo-600 underline dark:text-indigo-400">
              support@mypdfbuilder.com
            </a>
            . You can review or change optional cookie category preferences from Cookie Settings in the site footer.
          </p>
        </div>
      </div>
    ),
  },
  terms: {
    title: 'Terms and Conditions',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="text-xs text-slate-400">Last Updated: November 28, 2026</p>
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
        <p className="text-xs text-slate-400">Last Updated: November 28, 2026</p>
        <p>
          This notice explains how <strong>MyPDFBuilder</strong> (<code>mypdfbuilder.com</code>) uses cookies and similar
          browser technologies. The application currently uses <code>localStorage</code> for preferences; analytics
          and advertising technologies are described separately as planned services, not active integrations.
        </p>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Strictly necessary storage</h3>
          <p className="mt-1">
            The site saves the cookie category choice in <code>localStorage</code> so it can remember your selection.
            Theme and language are also saved there as preferences; these are browser storage, not cookies set by the
            application. Text Auto-Save is a separate optional feature, off by default for new browser profiles. If
            enabled, the draft stays in your browser until you turn Auto-Save off or clear saved data. A draft from an
            earlier version may be restored for one session. We have not verified whether the hosting or security
            provider uses its own cookies or similar technologies.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Analytics technologies</h3>
          <p className="mt-1">
            No analytics service, script, or analytics cookie is active as of November 28, 2026. If analytics is
            introduced, it may be used to understand visits, tools used, visitor behavior, and site performance. The
            provider and technologies will be identified here before activation; analytics will follow your saved
            choice and any consent required by applicable law.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Advertising technologies</h3>
          <p className="mt-1">
            Google AdSense is planned but is not active. No AdSense script or advertising cookie is currently enabled
            by the application. If advertising is activated, Google and other providers may use cookies, pixels,
            scripts, or similar technologies to deliver ads, limit frequency, measure performance, and show
            personalized or non-personalized ads depending on the configuration, your choices, and applicable rules.
            The providers and controls will be identified before activation.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Third-party technologies</h3>
          <p className="mt-1">
            Hosting, security, analytics, and advertising providers may process information using their own cookies,
            pixels, scripts, or similar technologies, depending on the service and its configuration. Providers do not
            all use the same technologies. For its publisher products, Google requires a Google-certified CMP
            integrated with the IAB Transparency and Consent Framework when serving personalized ads to users in the
            EEA, UK, or Switzerland. This site&apos;s preference panel is not a certified CMP and does not by itself
            meet that requirement. Before Google ads are served to those regions, the applicable requirements and
            consent setup must be verified. See{' '}
            <a
              href="https://support.google.com/adsense/answer/13554116"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-indigo-600 underline dark:text-indigo-400"
            >
              Google&apos;s AdSense CMP guidance
            </a>
            .
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Your choices</h3>
          <p className="mt-1">
            The banner lets you accept all, reject non-essential, or customize analytics and advertising separately.
            You can save and later change your selection from Cookie Settings in the site footer. Analytics and
            advertising are not currently active, so saving a choice records your preference but does not load either
            technology. Optional technologies must be connected to and respect the saved choice before activation.
            Applicable requirements vary by location; this notice is not a certification of legal compliance.
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
