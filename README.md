# MyPDFBuilder

Browser-based PDF and document tools built with React, TypeScript, Vite, PDF.js, pdf-lib, and jsPDF. Files are processed locally in the browser; the project has no application backend or database.

## Tools

Text to PDF, image to PDF, merge, split, compress, edit and rotate, PDF to JPG/text/Word/PowerPoint/Excel, Word/PowerPoint/Excel to PDF, HTML to PDF, and PDF metadata editing.

## Local development

```bash
npm ci
npm run dev
npm run build
npm run preview
```

The production build is written to `dist/` and includes dedicated landing pages for the tool routes. No environment variables are required.

## Cloudflare Pages

- Repository root: `/`
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main` after the reviewed site changes are merged

The project uses `public/_headers` for Cloudflare Pages security headers. See [DEPLOYMENT_AND_SEO_GUIDE.md](DEPLOYMENT_AND_SEO_GUIDE.md) for domain, redirect, Search Console, and AdSense setup.

AdSense is not active. The ad component remains disabled until the site is approved and real ad-unit IDs and applicable consent settings are configured.
