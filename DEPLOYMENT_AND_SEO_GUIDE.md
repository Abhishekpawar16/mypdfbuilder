# Cloudflare Pages, Search & Advertising Launch Guide

## Current project setup

- Canonical origin: `https://mypdfbuilder.com/`.
- Static React/Vite application; processing runs in the browser. There is no backend, database, or required environment variable.
- The GitHub source is `https://github.com/Abhishekpawar16/mypdfbuilder`.
- Cloudflare Pages build command: `npm run build`; output directory: `dist`; root directory: repository root.
- `public/_headers` is copied to `dist/_headers` and contains the current security headers. [Cloudflare Pages applies `_headers` rules to static asset responses](https://developers.cloudflare.com/pages/configuration/headers/).
- No analytics or ad code is active. `ADSENSE_ENABLED` remains `false`; no ad-unit slot IDs are configured. `public/ads.txt` now contains the publisher ID supplied for this project: `pub-9543978037261848`. Verify the ID in AdSense before launch.
- Contact opens a prefilled email draft; it does not submit to a website server.

## Build locally

```bash
npm ci
npm run build
npm run preview
```

The build generates 16 dedicated tool pages under `dist/<tool>/index.html`. No environment variables are needed. Cloudflare Pages should serve the generated directory pages on clean URLs such as `/pdf-to-jpg`.

## Cloudflare Pages setup

1. In Cloudflare, create a Pages project and connect the GitHub repository above. [Git integration creates branch previews and automatically deploys pushes](https://developers.cloudflare.com/pages/configuration/git-integration/).
2. Set root directory to the repository root, build command to `npm run build`, output directory to `dist`, and production branch to `main` after the reviewed changes are merged.
3. Confirm a preview deployment on the Pages-provided hostname before attaching the custom domain.
4. Add `mypdfbuilder.com` in the Pages project's custom-domain settings and confirm HTTPS works.
5. Redirect `www.mypdfbuilder.com` to `https://mypdfbuilder.com/:splat` with a Cloudflare zone-level Redirect Rule. [Pages `_redirects` does not handle domain-level redirects](https://developers.cloudflare.com/pages/configuration/redirects/).
6. Verify the deployed headers on `/` and a tool route, then retest PDF processing under the deployed CSP.

Choose Git integration or Direct Upload before creating the Pages project: [Cloudflare documents that a Git-integrated project cannot later be switched to Direct Upload](https://developers.cloudflare.com/pages/get-started/git-integration/). This project has a GitHub repository, so Git integration is the expected route.

## Production verification

- Confirm direct navigation and reload for `/` and all 16 tool paths.
- Confirm `https://mypdfbuilder.com/robots.txt`, `/sitemap.xml`, and `/ads.txt` return HTTP 200. Google requires the `ads.txt` publisher ID to match the account; see [Google's ads.txt guidance](https://support.google.com/adsense/answer/9785052/ads-txt-faqs).
- Verify TLS, canonical host, `www` redirect, CSP, HSTS, MIME sniffing, framing, referrer, and browser-permission headers from the live origin.
- Enable Brotli/gzip and static asset caching as supported by the platform, then rerun Lighthouse against production.
- Confirm `support@mypdfbuilder.com` is a monitored mailbox and review privacy/legal copy against the actual host and target markets.
- Add the verified domain to Search Console and submit the sitemap.

No live deployment, domain ownership, TLS, DNS, redirect, production headers, Search Console property, or indexing status has been verified yet.

## AdSense

The supplied publisher ID is staged in `ads.txt` and in the disabled ad component. Before serving ads, verify that the ID matches the AdSense account, confirm site approval, obtain real ad-unit slot IDs, enable the ad component and global script deliberately, update CSP only for required Google endpoints, and configure Google's required consent management for applicable regions. Do not treat the `ads.txt` entry by itself as active ad integration.
