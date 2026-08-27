# Handoff — Source-to-Recall Gate repair

## Status

Release repair for the independent verification report in
`.factory/verification.md`. The static PWA and MV3 extension remain local-first:
captures use browser-local storage, no analytics or remote fonts were added, and
the only optional network endpoint remains the Sociobot license API.

## What changed

- Export now persists the three currently visible decisions before serializing
  the selected prompt. The export-ready state therefore matches the action a
  learner can take; **Save decisions** remains available for explicit draft
  saves and `Ctrl/⌘ + Enter`.
- Added the exact browser regression: complete the fields, click CSV without
  Save decisions, then reload and verify that the completed prompt persists.
- Added `public/staticwebapp.config.json`, copied into `dist/site` by Vite. It
  excludes `/downloads/*` from SPA navigation fallback and declares the Chrome
  archive as an attachment with `Content-Type: application/zip`. It also adds
  CSP, clickjacking/COOP/permissions protections and immutable caching for
  hashes and the downloadable archive.

## Build and verification

From a clean dependency install (`npm ci`, Node 22.23.2 / npm 10.9.8):

```bash
npm test
npm run typecheck
npx playwright install chromium
npm run test:e2e -- --workers=1
npm run build:site
npm run test:extension
npm run zip
npm run build
```

All commands pass. The browser suite reports 10 passing tests across desktop
and 390 px projects (with the expected project-specific skips), including axe
serious/critical checks. Extension smoke passes for the MV3 service worker,
options workbench, popup, and console.

`npm run build` produces
`dist/site/downloads/source-to-recall-gate-chrome.zip` (712,908 bytes in the
final build). `unzip -t` passes and its bytes start with `PK\x03\x04`.
`swa start dist/site --port 4280` served that exact path as HTTP 200,
`Content-Type: application/zip`, an attachment, and `Cache-Control: public,
max-age=31536000, immutable`; a missing `.zip` returned 404 rather than the
SPA document.

Final first-load assets remain within budget: main JS 22.96 KB (7.32 KB gzip),
CSS 19.31 KB (4.84 KB gzip), no webfonts, and the mobile hero is 106.85 KB.

## Deploy and live checks

Deploy the already-built static root with:

```bash
/opt/fleet/lib/deploy-static.sh source-to-recall-gate dist/site
```

Then verify the live root with `/opt/fleet/lib/verify-url.sh`, run the browser
axe suite/Lighthouse, and verify the download with `curl -D -` plus `unzip -t`.
The post-deploy outcome and live measurements are recorded below after
deployment.

## Known gaps

`npm ci` reports 14 advisories in development/build dependencies; production
has no runtime dependencies. No product-flow or privacy gaps are known from
this repair.
