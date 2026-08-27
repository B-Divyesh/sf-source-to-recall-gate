# Handoff — publishing repair 2

## Status: PASS

The missing extension-download release blocker from
`.factory/verification-2.md` is repaired and published. The Standard Azure
Static Web Apps deployment is live at
<https://source-to-recall-gate.sociobot.in> (deployment
`94888d58-ea9b-4d4c-88d1-76356bd028d2`).

## What changed

- `npm run build:site` now creates a fresh WXT MV3 archive, runs the static
  Vite build, and copies the exact versioned WXT output to the deterministic
  deployment path: `dist/site/downloads/source-to-recall-gate-chrome.zip`.
  It validates the ZIP before returning success; `npm run build` delegates to
  the same build.
- Added `npm run test:site-package`, a built-output regression that checks ZIP
  magic, non-empty contents, `unzip -t`, `manifest.json`, MV3 format, and the
  emitted Static Web Apps route policy (`application/zip` and no SPA fallback).
- Added `npm run test:live-download`, a live regression that requires HTTP 200,
  `application/zip`, attachment disposition, immutable one-year caching, ZIP
  magic, and an SHA-256 byte match with the archive in `dist/site`.
- Updated the README with the production packaging and post-publish check.

## How to run and verify

```bash
npm ci
npx playwright install chromium
npm test
npm run typecheck
npm run test:site-package
npm run test:extension
npm run build
npx playwright test --workers=1
npm run test:live-download
```

The deploy command used was:

```bash
/opt/fleet/lib/deploy-static.sh source-to-recall-gate dist/site
```

## Verification evidence

- Clean unit suite: **11/11 passed**.
- Type check: passed.
- Built-output regression: passed; produced valid, non-empty MV3 ZIP at the
  required path (712,908 bytes).
- Extension smoke: passed for MV3 service worker, options page, popup, and no
  page/console errors.
- Browser suite: **8 passed, 2 expected project skips** across desktop and
  390px mobile, including the existing Axe serious/critical checks and offline
  flow.
- Local Static Web Apps emulator returned HTTP 200 and `Content-Type:
  application/zip` for the required download; a nonexistent ZIP returned 404.
- Live-download regression passed after deployment. The served file is 712,908
  bytes, has SHA-256
  `776512db956a09b832883e81be01b3f4882076c98dfee1ae77b63b0dccf03de8`, passes
  `unzip -t`, and exactly byte-matches `dist/site`.
- Live header check: HTTP 200, `content-type: application/zip`, attachment
  disposition, and `Cache-Control: public, max-age=31536000, immutable`.
- Live browser smoke at desktop and mobile sizes passed: no console/page errors,
  title, `lang=en`, one `h1`, a `main` landmark, and no images missing alt text.

## Known gaps

`npm ci` reports 14 advisories in development/build-only dependencies. The app
has no production runtime dependencies; this repair does not change that
upstream tooling risk.
