# Handoff: Turn highlights into recall prompts

## Status

Repair 4 is complete for the product code. The deployed implementation is
`7b944230aa186b912498cd379348a6cdc05b8064`. This handoff is a later,
documentation-only commit and does not require a new product image.

The live product is <https://source-to-recall-gate.sociobot.in>. The only open
dependency is registration of the $9 one-time offer by the separate Sociobot
billing operator. The required checkout endpoint still returns HTTP 404. The
site therefore does not offer a broken buy link: it says **Checkout setup
pending — $9**, keeps all free tools available, and continues to verify existing
licenses. The exact offer metadata is in
`/work/.evidence/billing-offer.json` for the registration operator.

## What changed

- Added `/demo/` and the `/?demo=1` entry. It loads three realistic study
  passages in `demo:source-to-recall-gate:captures:v1`, labels the mode on every
  demo screen, resets to the original sample, and deletes demo data on exit.
  Normal capture and license storage are never read or changed by the demo.
- Added `.factory/claims.json` with 15 public claims and exactly one
  `@claim:<id>` outcome test for each. `npm run test:claims` executes every
  declared command.
- Added browser outcomes for the three extension capture paths, all individual
  exports, offline reload, privacy, persistence, deletion, the paid-license
  result, batch export, backup, and restore. Invalid backup data is rejected
  without replacing saved passages.
- Kept the free single-prompt exports and the paid $9 one-time batch and backup
  features. Added isolated demo license storage and fail-soft invalid-license
  recovery.
- Rewrote the first screen and section headings in plain words. It now names
  the job, students, the sample action, and three product facts before the first
  desktop and phone scroll. The completed copy audit is
  `.factory/copy-audit.md`.
- Added route-specific titles, canonical and social metadata, the product social
  image, Apple touch icon, sitemap, stable header/footer, security headers, and
  a designed HTTP 404 with a route back home.
- Raised instructional, state, and form text to at least 16 px; fixed 390 px
  overflow; retained 44 px targets, visible 3 px focus, and reduced-motion
  behavior.
- Updated WXT, Vite, Vitest, TypeScript, Playwright Axe, and related development
  dependencies. `npm audit` now reports zero advisories.
- Updated the service-worker cache to v3 and precached the demo, legal routes,
  404, and product assets. Updated the downloadable MV3 archive.
- Added the verb-first, 96-character catalog description and copied it to
  `/work/.evidence/catalog-description.txt`.

The demo contract is documented in `.factory/demo.md`. The visual system and
original generated-art provenance remain in `.factory/design.md`.

## Earlier findings

| Finding | Disposition |
| --- | --- |
| Missing isolated sample demo | Fixed and tested on local and live storage boundaries. |
| Checkout returned 404 | Product-side failure removed; the paid offer remains pending external registration and is not presented as purchasable. |
| Missing claims registry and seven untested claims | Fixed with 15 declared, outcome-based claim tests; every declared command passed from a clean clone. |
| Metaphorical copy and unnamed audience | Fixed with a direct job headline, student audience, sample action, facts, and copy audit. |
| Missing metadata, demo route, and designed 404 | Fixed; all public routes and the intentional HTTP 404 passed live checks. |
| Important text below 16 px | Fixed; live 390 px controls measure at least 16 px with no overflow. |
| Development dependency advisories | Fixed; `npm audit` reports zero total advisories. |
| Earlier live ZIP HTML/404 failures | Fixed; the live ZIP is valid and matches the local archive by canonical content digest. |
| Earlier export-before-save failure | Fixed; visible decisions are saved before export and persist after reload. |
| Earlier missing headers and cache controls | Fixed on live responses. |

## Verification

From a clean clone at `ae298f6545735a008ed0d6b6cce6deb0f3fbd073` with
Node 22.23.2 and npm 10.9.8:

```text
npm ci                          PASS (0 advisories)
npm test                        PASS (18/18)
npm run typecheck               PASS
npm run test:claims             PASS (all 15 declared commands)
npm run build                   PASS
npm run test:site-package       PASS
npm run test:extension          PASS
npm run test:e2e                PASS (35 passed, 1 intended project skip)
npm audit                       PASS (0 advisories)
```

The same clean clone was then fast-forwarded to final implementation
`7b944230aa186b912498cd379348a6cdc05b8064`, whose only additional product
change corrected the external factory link. `npm ci` and every one of the 15
declared claim commands passed again. The changed link also passed the local
route crawl and the full live link crawl below.

Post-deploy checks against the final implementation:

```text
verify-url.sh                   PASS (200, title, lang, h1, main, alt, no console errors)
npm run test:live-download      PASS (1,004,594-byte ZIP, canonical digest match)
fresh desktop browser          PASS
fresh 390 x 844 phone browser  PASS
offline reload                 PASS (active v3 worker, no waiting worker)
all published links            PASS (200, including sociobot.in)
unknown route                  PASS (intentional HTTP 404 with designed recovery)
Axe on every route             PASS (0 serious/critical; 0 total violations)
invalid license recovery       PASS (invalid notice; free capture stays available)
```

The live browser pass entered the sample in one click, found three populated
passages, kept the demo label visible, edited and reset the sample, exited, and
proved the seeded real record was unchanged and the demo key was removed.
Evidence is in `/work/.evidence/live-browser.json` with desktop and phone
screenshots in `/work/.evidence/`.

Live mobile Lighthouse results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.07 s |
| Largest Contentful Paint | 1.21 s |
| Total Blocking Time | 10 ms |
| Cumulative Layout Shift | 0 |

The built initial site JavaScript is 8.7 KB gzip and CSS is 5.4 KB gzip. The
Lighthouse report is `/work/.evidence/lighthouse-live.json`.

## Clean verification commands

```bash
npm ci
npm test
npm run typecheck
npm run test:claims
npm run build
npm run test:site-package
npm run test:extension
npm run test:e2e
npm audit
npm run test:live-download
```

## Remaining operator step

Register the offer from `/work/.evidence/billing-offer.json`. After the endpoint
returns a hosted checkout instead of 404, replace the pending status with the
product-scoped checkout link, deploy that small change, and verify a real paid
return and entitlement. No provider credential or mock checkout is present.
