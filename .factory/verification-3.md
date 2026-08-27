# Independent verification 3 — FAIL

- **Verifier:** `source-to-recall-gate-verify-3`
- **Candidate:** `3932a28650585e2ba2861adc336b98c0063ea303` (`main`)
- **Live URL:** <https://source-to-recall-gate.sociobot.in>
- **Verified:** 2026-08-27 UTC
- **Decision:** **FAIL**

## Release-blocking defect

### P1 — fresh production verification cannot prove the published archive byte-match

The repository documents `npm run test:live-download` as the post-publish release regression. From a clean checkout and fresh exact production build it fails:

```text
Error: Live download bytes do not match the archive in dist/site.
```

At verification both archives were valid 712,908-byte ZIPs, but had different wrapper hashes:

```text
live:  33fad2a10b48c2f868fb0e14b79ceac52b7754c847a698f049234fe78ddc4dd1
local: e4ec16736e0c8d2fdb49154ed5710fb8accc91993985e40828c2a3fedb3f012a
```

This is **not** the former missing-download deployment defect. Live serves HTTP 200, `application/zip`, attachment disposition, immutable one-year caching, ZIP magic, and `unzip -t` succeeds. Extraction and `diff -rq` of live and fresh local archives found no file-content differences across all 28 entries (manifest, background/options code, CSS, assets, and icons). ZIP entries have build timestamps (live 22:00 UTC; fresh build later), so WXT's archive wrapper is not reproducible while this regression requires byte equality.

The release artifact is functionally the candidate, but the required shipped verification command does not pass on a fresh build and cannot distinguish metadata-only packaging from a real deployment mismatch. Make the archive deterministic or compare a canonical content digest rather than raw ZIP bytes; then rerun verification.

## Clean local verification

Clean checkout was exactly the requested commit with no pre-existing worktree changes. Environment: Node `v22.23.2`, npm `10.9.8`.

```text
npm ci                            PASS
npm test                          PASS — 11/11
npm run typecheck                 PASS
npm run build                     PASS — site, MV3 build, ZIP
npm run build:extension           PASS
npm run test:extension            PASS — MV3 worker, options, popup, console
npx playwright test --workers=1  PASS — 8 passed, 2 intended project skips
npm run test:site-package         PASS — ZIP integrity/MV3/static route policy
npm run test:live-download        FAIL — non-reproducible ZIP byte comparison
npm audit --omit=dev --json       PASS — 0 production vulnerabilities
```

Playwright Chromium was installed once with `npx playwright install chromium`; the initial smoke attempt was blocked only because the clean container had no browser binary. `npm ci` reports 14 advisories in development/build-only packages (5 moderate, 5 high, 4 critical); no production runtime dependency is affected.

The fresh site build emits 22.96 KB main JS (7.32 KB gzip), 19.31 KB CSS (4.84 KB gzip), no webfonts, and a 106.85 KB mobile WebP hero, within static budgets. Lighthouse 12.8.2 was attempted with Chrome for Testing but Chrome crashed before it produced scores; no Lighthouse score is claimed.

## Product and extension evidence

Fresh Playwright testing on the live URL covered desktop (1440 px) and 390 × 844 mobile:

- A normal passage was captured; paraphrase, recall cue, and concrete use-case were required before CSV export enabled. Export persisted unsaved visible values and reload restored the ready item. Discard then Undo restored the exact cue.
- A two-character passage gave an actionable validation error and recovery worked. Duplicate capture gave its explicit error. A `javascript:` source URL was normalized away; a passage containing an image/event-handler string rendered only as text, with no injected image or page error.
- No desktop/mobile overflow occurred (1440/1440 and 390/390 client/scroll widths). Keyboard Tab reached a visible `rgb(18, 91, 104) solid 3px` focus outline. Reduced-motion transition duration was `0.00001s`.
- Axe found zero serious/critical issues on desktop, 390 px, `/privacy/`, and `/terms/`. Expected title, `lang=en`, one `h1`, and `main` landmarks were present; no console/page errors occurred.
- The live service worker controlled the page with no waiting worker. After first load an offline reload rendered the cached shell and usable capture input. The offline notice appears as soon as the offline event fires; Chromium reports `navigator.onLine` true after the cached reload, so that notice is not retained despite the app working.
- The downloaded live archive was freshly extracted and loaded in a clean Chromium profile. Its MV3 service worker, options workbench, popup, gated Anki TSV export, and console/page-error checks passed. Native context-menu/keyboard-command gestures are not exposed to Playwright.

## Privacy, policy, parity, and delivery

- Free-flow request recording saw only `https://source-to-recall-gate.sociobot.in`. An invalid synthetic license made exactly one expected request to the narrowly scoped Sociobot verification endpoint; no study content was sent and no error occurred.
- Source/runtime inspection confirms local browser storage, no analytics/tracking, remote fonts, CDN scripts, cloud study-content API, or AI generation. MV3 permissions are `storage`, `contextMenus`, `activeTab`, and `scripting`, plus only the Sociobot verification host.
- Live root, service worker, manifest, JS, CSS, privacy page, and terms page SHA-256 byte-match the fresh candidate build. The ZIP is the sole raw-byte exception; every extracted ZIP payload matches exactly.
- Live root/assets/ZIP have HSTS, `nosniff`, strict referrer policy, self-only CSP with Sociobot `connect-src`, COOP, Permissions-Policy, and `X-Frame-Options: DENY`. Hashed assets and ZIP use immutable one-year caching. A non-existent ZIP returns 404, not SPA fallback.

## Required remediation

1. Make `wxt zip` deterministic (including entry timestamps), or replace raw SHA-256 in `scripts/verify-live-download.mjs` with a canonical extracted-file/content-manifest comparison that preserves MV3 integrity checks.
2. Run `npm run build && npm run test:live-download` from a fresh checkout until it passes against the live deployment, then request a new independent QA pass.

