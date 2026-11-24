# MyPDFBuilder Security, QA & Production Readiness Audit

**Audit date:** November 24, 2026  
**Project:** `text-to-pdf-pro` from `mypdfbuilder.zip`  
**Scope:** Source, dependencies, local build, browser workflows, generated files, SEO output, responsive layout, and static-host security configuration. No production deployment or DNS changes were made.

## Executive summary

**Estimated readiness: 85%**  
**Final recommendation: READY AFTER MINOR FIXES**

The local application builds cleanly, the dependency audit reports zero vulnerabilities, and the tested conversion paths work in Chromium. Two High-severity vulnerabilities in the original PDF and spreadsheet parsers were addressed. The app processes documents in the browser and has no backend API or database to audit.

Production readiness is not fully confirmed: no hosting provider or live domain was tested, production TLS/redirects/headers are unverified, one generated JPG download could not be verified in the browser sandbox, and cross-browser and assistive-technology testing remain. The Auto-Save privacy fix compiled and passed Lighthouse, but its toggle behavior was not manually retested after that final change.

## System overview

- Static React/Vite application; document conversion and editing run in the user's browser.
- No application server, database, or app API endpoints were found. The contact form opens a prefilled `mailto:` draft and does not send data to a website server.
- Analytics and advertising scripts are disabled. The ad component returns no content. The supplied publisher ID is staged in `ads.txt`, but it must be checked against the AdSense account before launch.
- Theme, language, and notice preferences use browser `localStorage`. Draft auto-save is off by default. A legacy draft is restored for one session during migration; it is not saved again unless the user enables Auto-Save.
- Final parser versions: `jspdf@4.2.1`, `pdfjs-dist@6.5.438`, and vendored `xlsx@0.20.3`.
- Build creates 16 dedicated tool landing pages plus the homepage.

## Findings and remediation

| Severity / status | Finding | Fix and retest |
|---|---|---|
| **High — resolved** | The original `pdfjs-dist@3.11.174` was within the affected range for PDF.js arbitrary JavaScript execution from a malicious PDF (CVE-2024-4367). A later PDF.js advisory affects `pdfjs-dist` 5.6.83 through versions before 6.2.108. | Upgraded to `pdfjs-dist@6.5.438`, above the patched version, and narrowed CSP `script-src` to `'self'`. PDF parsing/conversion smoke tests, malformed-PDF handling, the local CSP route check, and final dependency audit passed. The public proof-of-concept was not run. [Mozilla advisory: CVE-2024-4367](https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq), [Mozilla advisory: CVE-2026-16633](https://github.com/mozilla/pdf.js/security/advisories/GHSA-hq66-cqwq-w95j). |
| **High — resolved** | The original `xlsx@0.18.5` was affected by SheetJS prototype-pollution and ReDoS advisories when reading crafted workbooks (CVE-2023-30533 and CVE-2024-22363). | Replaced the npm-registry release with official SheetJS `0.20.3` tarball at `vendor/xlsx-0.20.3.tgz`; SHA-256 verified as `8DC73FC3B00203E72D176E85B50938627C7B086E607C682E8D3C22C02BB99FE8`. XLSX conversion and OOXML archive checks passed; `npm audit --audit-level=low` reports 0 vulnerabilities. [Prototype-pollution advisory](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6), [ReDoS advisory](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9). |
| **Medium — resolved** | The prior CSP allowed Google advertising and font origins although those integrations are inactive; HSTS also covered every subdomain and requested preload before the hosting/domain setup was known. | CSP now allows same-origin scripts/connections, local `blob:` workers, and `data:`/`blob:` images. HSTS is limited to `max-age=31536000`. `vercel.json` and `public/_headers` match. A local response returned the expected headers, and `/pdf-to-jpg` passed Lighthouse under the CSP with no console errors. Production headers and HTTPS remain unverified. |
| **Medium — resolved in source; interaction retest pending** | Draft auto-save was enabled by default and a saved draft remained when the user disabled it. | Added a versioned preference that defaults off, clears the legacy saved value, and restores an old draft for the current session with a notice. Disabling Auto-Save removes the draft. TypeScript/build and Lighthouse passed after the change, but the final migration/toggle interaction was not manually exercised again. |
| **Low — product-truth fixes** | Several descriptions implied features the app did not provide or overstated output (including PDF/A validation, editable PowerPoint objects, page deletion, and placeholder cloud/URL actions). The contact form could imply server submission. | Claims and nonfunctional actions were corrected or removed. PDF archive metadata is explicitly not PDF/A validation; PDF-to-PowerPoint says slides are raster images; contact clearly opens an email draft. |

### Security notes

- No `dangerouslySetInnerHTML`, direct `innerHTML` assignment, app-side `fetch`/Axios calls, or analytics scripts were found in the scanned application source.
- The HTML-to-PDF path parses input and consumes text content; a supplied `onerror` test string did not produce a script dialog.
- PDF and office-file parsers still process user-controlled files in the browser. Fuzzing and hostile-file proof-of-concept testing were not performed.
- `npm audit` is a point-in-time registry audit, not a guarantee against future or unlisted advisories. Track upstream PDF.js, jsPDF, and SheetJS security releases.

## Functional and artifact verification

| Area | Result |
|---|---|
| Production build | **Pass.** TypeScript, Vite, and the 16-page SEO generator completed without warnings. |
| Dependency audit | **Pass.** `npm audit --audit-level=low`: 0 vulnerabilities. |
| Automated test/CI setup | **Not configured.** No `test` script or CI workflow was found; functional verification was browser-driven/manual, with build, artifact, dependency, SEO, and Lighthouse checks. |
| Text-to-PDF | **Pass.** Letter landscape, A3, multi-page A4, margins/fonts/header/footer/date/page-number options were sampled. Empty input was rejected clearly. |
| Long input | **Pass.** A 105,000-character text produced a 132-page A4 PDF. A long unbroken token wrapped across pages; PDF-to-Text retained the 2,500-character token and URL. |
| Unicode | **Pass with limitation.** Hindi and emoji rendered. Unicode fallback rasterizes the page, so text may not remain selectable/searchable in that case. |
| PDF tools | **Pass.** Merge, split, compress, edit/rotate, metadata-copy, PDF-to-Text, PDF-to-Word, PDF-to-PowerPoint, and PDF-to-Excel generated outputs. Compression test reduced a 14.5 KB PDF to 10.4 KB (28%). |
| Other conversions | **Pass.** JPG/PNG-to-PDF, DOCX/PPTX/XLSX-to-PDF, and HTML-to-PDF produced outputs from synthetic/local fixtures. DOCX/PPTX/XLSX archives and required XML parts validated. |
| Invalid inputs | **Pass.** Malformed PDF showed `Invalid PDF structure.`; empty PDF generation showed a clear validation message. |
| PDF-to-JPG download | **Partial.** The PDF rendered and showed an image preview. The sandbox rejected the generated data URL download, so the JPG download itself needs a normal-browser retest. |
| Editor controls | **Partial.** Clear, reset, sample, undo, and redo were exercised. Print dialog and every formatting boundary were not exhaustively tested. |

A small generated sample PDF is included: [MyPDFBuilder-Sample-Generated.pdf](MyPDFBuilder-Sample-Generated.pdf).

## SEO, accessibility, and performance

### SEO

- 17 generated HTML pages have 17 unique titles and title, description, and canonical metadata.
- `sitemap.xml` contains 17 URLs with `2026-11-24` last-modified dates; `robots.txt` points to the sitemap.
- Direct navigation to `/pdf-to-jpg` loaded the tool page and its distinct metadata. This was a local check, not proof of Google indexing.

### Accessibility and responsive layout

- Lighthouse Accessibility: **100 desktop / 100 mobile**. The missing accessible name on the hidden TXT upload input was fixed.
- Responsive layout checked at 320, 375, 425, 768, 1024, 1366, 1440, and 1920 CSS pixels; no horizontal overflow was observed.
- Keyboard-only, screen-reader, Firefox, Safari, and physical iOS/Android checks remain.

### Lighthouse (local lab results)

| Profile | Performance | Accessibility | Best Practices | SEO | FCP / LCP | TBT | CLS |
|---|---:|---:|---:|---:|---|---:|---:|
| Desktop | 100 | 100 | 100 | 100 | 0.6 s / 0.6 s | 20 ms | 0 |
| Mobile | 92 | 100 | 100 | 100 | 2.5 s / 2.5 s | 170 ms | 0 |

These are local Lighthouse runs, not field Core Web Vitals. The test server supplied production-like security headers but did not enable gzip or production cache behavior; the mobile Performance score should be rechecked after deployment. The Vite build splits the app and lazy-loads PDF tools. Large on-demand assets remain: PDF.js about 501 KB, spreadsheet about 500 KB, and PDF worker about 1.27 MB before transfer compression.

## Backend and deployment status

Backend/API/DB checks are **not applicable** to this browser-only app. The repository contains static-host header configuration, but no production host was deployed. The domain `mypdfbuilder.com` appears in canonical metadata; domain ownership, TLS, redirects, caching/compression, deployed response headers, mailbox ownership, Search Console, and indexing were not verified. The supplied GitHub `main` was fetched and currently contains only a README. The complete audited app is committed locally in a separate worktree on `codex/cloudflare-prep` (`ba63f5c`), based on that remote commit; it has not been pushed.

## Deployment handoff update

The user selected Cloudflare, provided `https://github.com/Abhishekpawar16/mypdfbuilder`, and supplied AdSense publisher ID `pub-9543978037261848`. The Cloudflare Pages build settings are prepared in the updated deployment guide: repository root, `npm run build`, `dist`, no environment variables. The publisher record is staged in `public/ads.txt` and the ad component uses the supplied ID while remaining disabled. The ID has not been verified against the AdSense account. Branch `codex/cloudflare-prep` completed a fresh `npm ci` with zero reported vulnerabilities and `npm run build` generated all 16 tool pages successfully; local commit `ba63f5c` is ready to push. GitHub CLI authentication is currently invalid, so no push was made. No Cloudflare Pages project, deployment, or DNS change has been made; the user's earlier instruction requires approval before production and DNS actions.

## Pre-launch checklist

1. Connect the reviewed branch to Cloudflare Pages; build with `npm run build`, publish `dist/`, and confirm direct routes and refresh work for all tools.
2. Confirm control of `mypdfbuilder.com`, configure HTTPS, and redirect `www.mypdfbuilder.com` to the canonical apex host.
3. Verify production security headers on the homepage and tool routes, including CSP worker behavior, and confirm the host serves compressed assets with sensible cache headers.
4. Confirm `support@mypdfbuilder.com` is a working support address; review legal/privacy copy against the operator's actual hosting and target markets.
5. Retest PDF-to-JPG download and the Auto-Save on/off/clear flow in a regular browser. Smoke-test the PDF worker under the deployed CSP.
6. Test Firefox, Safari, physical mobile devices, keyboard navigation, and a screen reader.
7. Verify `robots.txt` and `sitemap.xml` on the live domain, then add the property and submit the sitemap in Search Console.
8. Verify the supplied publisher ID in AdSense. Keep ads disabled until site approval and ad-unit IDs are in place; then confirm the `ads.txt` record, applicable consent management, and CSP update.

The project is locally verified and suitable to proceed to hosting setup, followed by the outstanding checks above. **No production deployment or DNS changes were made.**
