# MyPDFBuilder Verification Record

Last run: November 24, 2026. Detailed findings and launch checks: [Audit Report](../outputs/MyPDFBuilder-Audit-Report.md).

## Passed

- Production TypeScript/Vite build and generation of 16 dedicated tool pages.
- `npm audit --audit-level=low`: zero reported vulnerabilities.
- Text-to-PDF output checked as Letter landscape, A3, and multi-page A4; 105,000-character input produced 132 pages.
- Long unbroken text wrapped across pages; extracted text retained a 2,500-character token and URL.
- Hindi and emoji output rendered; Unicode fallback is rasterized in that case.
- Merge, split, compression, PDF-to-Word, PDF-to-PowerPoint, PDF-to-Excel, PDF-to-Text, image-to-PDF, Word/PowerPoint/Excel-to-PDF, HTML-to-PDF, metadata-copy, and edit/rotate flows produced outputs.
- DOCX, PPTX, and XLSX outputs passed ZIP integrity and required XML-part checks.
- Invalid PDF input produced a visible parse error; empty PDF generation was blocked with a clear message.
- Layout checked at 320, 375, 425, 768, 1024, 1366, 1440, and 1920 CSS pixels without horizontal overflow.
- 17 generated HTML pages have unique titles and title/description/canonical metadata; sitemap contains 17 URLs.
- Desktop Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Mobile Lighthouse (local static server with production-like headers): Performance 92, Accessibility 100, Best Practices 100, SEO 100. The test server did not provide gzip or production cache behavior.
- Direct `/pdf-to-jpg` route passed Lighthouse Accessibility, Best Practices, and SEO checks under the configured CSP; no console errors were reported.
- Cloudflare Pages `_headers` and `ads.txt` publisher record are staged in the build output; live HTTP status and account ownership are not verified.
- Local response-header check returned HTTP 200 and the configured CSP/HSTS values.

## Partial or not verified

- PDF-to-JPG rendering worked, but downloading the generated JPG was blocked by the browser sandbox's data-URL policy; retest the download in a normal browser.
- Auto-Save now defaults off, migrates old drafts for one session, and removes stored text when disabled. The final change compiled and passed Lighthouse, but migration/toggle storage behavior was not manually retested after that change.
- PDF formatting controls were sampled, not exhaustively tested one by one. The print dialog and TXT size/type boundary cases were not tested.
- Only Chromium was used. Firefox, Safari, physical iOS/Android, keyboard-only, and screen-reader testing remain.
- No live domain, Cloudflare Pages deployment, TLS, redirect, production response-header, Search Console, or indexing checks were performed. The local Git checkout has no remote configured yet.
- No automated unit/integration test command is defined in `package.json`; functional coverage here is browser-driven/manual plus build, dependency, artifact, and Lighthouse checks.
