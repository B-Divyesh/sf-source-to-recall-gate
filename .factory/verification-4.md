# Independent verification 4 — PASS

- **Verifier:** `source-to-recall-gate-verify-4`
- **Candidate commit:** `3d74647a125a822af2892196d8ad3a7f1dfefe77` (`main`)
- **Live URL:** <https://source-to-recall-gate.sociobot.in>
- **Verified:** 2026-08-27 UTC
- **Decision:** **PASS**

## Decision and release evidence

The deployed product matches the requested candidate and meets the researched
brief's primary browser-extension and local-first PWA workflow. This is a fresh
verification from a clean worktree at the candidate SHA; it does not rely on the
earlier reports' conclusion. In particular, the historical release-blocking ZIP
delivery/check failure is fixed.

`npm run test:live-download` passed against production. It received a 712,908
byte `application/zip` response with attachment disposition and immutable
one-year caching, then verified its canonical payload digest against the fresh
local production archive:

```text
13fde70ecc8517b9398b01535c416fd989e8c8199731ed89ae49b10d65ab2805
```

The live archive passed `unzip -t`, was extracted, and loaded in a clean
Chromium profile as an MV3 extension. Its service worker started; options and
popup each contained one `h1`; and there were no console/page errors. The
manifest requests only `storage`, `contextMenus`, `activeTab`, and `scripting`,
with the sole host permission `https://api.sociobot.in/*`.

Fresh local-to-live SHA-256 parity was confirmed for the home page, Privacy,
Terms, service worker, web manifest, main JS, and main CSS. The live content
hashes exactly match the fresh build output.

## Clean candidate checks

Environment: Node `v22.23.2`, npm `10.9.8`, Playwright Chromium supplied for
Playwright `1.58.2`.

```text
npm ci                         PASS
npm test                       PASS — 14/14
npm run typecheck              PASS
npm run build                  PASS — exact PWA/site + MV3 + ZIP production build
npm run test:site-package      PASS — static routes and valid packaged MV3 ZIP
npm run test:extension         PASS — MV3 worker, options, popup, no errors
npx playwright test --workers=4 PASS — 8 passed, 2 intentional project skips
npm run test:live-download     PASS — live canonical archive digest matches build
npm audit --omit=dev --json    PASS — zero production vulnerabilities
```

The built initial main JS is 22.96 KB (7.32 KB gzip); CSS is 19.31 KB (4.84 KB
gzip); no webfonts ship; and the mobile hero WebP is 106.85 KB. These are under
the static-product budgets. A fresh live mobile Lighthouse run completed cleanly:
Performance **97**, Accessibility **100**, Best Practices **100**, SEO **100**;
FCP 1.3 s, LCP 1.4 s, TBT 190 ms, CLS 0.

## End-to-end product checks

Independent live Chromium checks on 1440 px desktop and 390 x 844 mobile
covered the actual gate rather than a mock:

- A normal passage was added, required paraphrase/cue/use-case were supplied,
  CSV exported, and the unsaved visible decisions persisted across reload.
- A two-character passage produced the actionable minimum-length error and the
  user could immediately recover. A duplicate passage was rejected. Discard
  followed by Undo restored the capture and cue.
- A `javascript:` source URL was discarded. A passage containing an image/event
  handler string remained literal text (no injected image or script execution).
- CSV fields beginning with `=`, `+`, and `@` were apostrophe-prefixed in the
  emitted download, protecting spreadsheet consumers from formula injection.
- A deliberately invalid restored license made the one expected Sociobot verify
  request and displayed `License no longer active.`; no study content was sent.
  Free capture/export uses browser-local storage and does not require this
  request.
- Desktop had no page/console errors. On mobile, document client and scroll
  widths were both 390 px. Reduced-motion transition duration was 0.01 ms.
  Keyboard Tab begins at the Skip link, and input focus was a visible
  `rgb(18, 91, 104) solid 3px` outline.
- Axe found zero serious/critical violations on desktop and 390 px. Home,
  Privacy, and Terms have `lang=en`, a title, one `h1`, a `main` landmark, and
  no images without alt attributes.

The live service worker controlled a freshly loaded page, had an active worker
and no waiting worker, and after first load an offline reload rendered a usable
capture field and the offline notice. This validates the current update/offline
path; a future changed worker version necessarily requires its own rollout
check.

## Privacy, delivery, and response policy

The code and runtime behaviour align with the privacy policy: captures and
decisions use local storage (or extension-local storage), there are no analytics,
remote fonts, CDN scripts, cloud study-content APIs, scraping, or AI-card calls.
The only intentional off-origin request is license verification to Sociobot
after a license is supplied. The free capture/export flow stays local to the
product origin.

Live root, assets, and the ZIP return HSTS, `nosniff`, strict referrer policy,
self-only CSP with the narrow Sociobot `connect-src` exception, COOP,
Permissions-Policy, and `X-Frame-Options: DENY`. Hash-named assets and the
extension ZIP are `public, max-age=31536000, immutable`; a nonexistent ZIP is
404 rather than the SPA fallback.

## Defects / known gaps

No P0/P1/P2 product or deployment defects were found.

- **P3 — development dependency advisories:** `npm ci` reports 14 advisories
  (5 moderate, 5 high, 4 critical) in development/build tooling. `npm audit
  --omit=dev` reports zero production vulnerabilities and the shipped product
  has no runtime package dependency. This does not block this local-static
  release, but upstream tooling should be updated in routine maintenance.

Native browser context-menu invocation and the registered keyboard-command
gesture are not directly exposed by Playwright. The shipped live archive's
service worker/options/popup and its declared command/context-menu implementation
were verified; manual Chrome interaction remains the only unautomated gesture.
