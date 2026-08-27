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

Published the final `dist/site` through the factory's Standard static deployer
on 2026-08-27 (Azure Static Web Apps deployment
`9bae732d-c71a-4b73-891c-18fc708b7d8d`). The live URL is
<https://source-to-recall-gate.sociobot.in>.

Live verification passed:

- `/opt/fleet/lib/verify-url.sh` returned HTTP 200 with no browser console or
  page errors; it found the title, `lang=en`, exactly one `h1`, a `main`, and
  no images missing `alt`.
- Playwright's axe integration at 390 px found zero serious or critical
  violations and no console errors. (The standalone axe CLI could not launch
  Chrome as root in this container, so the repository's Playwright axe runner
  was used.)
- The download endpoint returned HTTP 200, `content-type: application/zip`,
  `content-disposition: attachment`, immutable cache control, ZIP magic, and
  passed `unzip -t`. A missing ZIP returns HTTP 404 instead of `index.html`.
- Mobile Lighthouse: Performance **100**, Accessibility **100**; FCP **1.1 s**,
  LCP **1.3 s**, TBT **70 ms**, CLS **0**.

## Known gaps

`npm ci` reports 14 advisories in development/build dependencies; production
has no runtime dependencies. No product-flow or privacy gaps are known from
this repair.
