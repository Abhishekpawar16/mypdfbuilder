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
        <p className="text-xs text-slate-400">Last Updated: November 24, 2026</p>
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
          <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Analytics &amp; Google AdSense</h3>
          <p className="mt-1">
            Analytics and advertising scripts are not enabled in this release. If they are added later, this policy and
            the consent controls will be updated before they are activated.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Contact &amp; your rights</h3>
          <p className="mt-1">
            The contact form opens a draft in your email application; it does not submit the message to our website.
            If you send that message or email us at{' '}
            <a href="mailto:support@mypdfbuilder.com" className="font-medium text-indigo-600 underline dark:text-indigo-400">
              support@mypdfbuilder.com
            </a>
            , we use your name and email solely to reply. Under GDPR, CCPA, and similar laws, you may request access to
            or deletion of any direct correspondence at any time.
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
        <p className="text-xs text-slate-400">Last Updated: November 24, 2026</p>
        <p>
          This notice explains how <strong>MyPDFBuilder</strong> (<code>mypdfbuilder.com</code>) uses browser storage.
        </p>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Essential browser storage</h3>
          <p className="mt-1">
            The site stores your theme, language, and notice dismissal in localStorage. Text drafts are not saved unless
            you enable Auto-Save in the editor; it is off by default for new browser profiles. A draft from an earlier
            version may be restored for one session. Turning Auto-Save off or using Clear Saved Data removes the saved
            draft.
          </p>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Analytics and advertising</h3>
          <p className="mt-1">
            No analytics or advertising scripts or cookies are enabled in this release.
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
