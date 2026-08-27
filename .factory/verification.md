# Independent verification — FAIL

- **Verifier:** source-to-recall-gate-verify-1
- **Candidate:** `817a2a8c08c83840c53734fc06d4d517fd030b99` (`main`)
- **Live URL:** <https://source-to-recall-gate.sociobot.in>
- **Verified:** 2026-08-27 UTC
- **Scope:** clean-checkout build, MV3 package, PWA/site flows, live parity,
  privacy, accessibility, performance, and delivery security.

## Decision

**FAIL.** The locally built candidate is substantially functional, but the live
product's advertised Chrome-extension download is not an extension archive. It
returns the application HTML instead. This prevents users from obtaining the
primary browser-extension artifact, so the deployed product does not meet the
brief or artifact-class contract.

## Release-blocking defect

### P0 — live Chrome extension download is an HTML document

`GET /downloads/source-to-recall-gate-chrome.zip` on the live URL returned:

- HTTP `200`, `content-type: text/html`, `content-length: 5070`
- SHA-256 `f794eb22e515efae81ad293c1e83e75533a8bfbe6190ca679104cc03cee2d81f`,
  exactly the live `index.html` SHA-256
- `unzip -l /tmp/live-extension.zip` failed with
  `End-of-central-directory signature not found`.

The final local `npm run build` does produce a valid archive at
`dist/site/downloads/source-to-recall-gate-chrome.zip` (`unzip -t` passes; SHA
at final build `bb1800329d6d354146cd13ebb5e883197c55df0cfba023475f67861f75143992`).
The fault is therefore deployment/delivery, not absence of package generation.

## Other defects

### P1 — export control promises an action that fails until a hidden extra step

After filling all three required decisions, Markdown/CSV/Anki controls become
enabled as the UI says the prompt is ready. Clicking CSV before clicking **Save
decisions** fails with `Finish the paraphrase, cue, and use-case before export.`
The values are only persisted on Save, but the enabled state and error do not
tell the user this. A normal keyboard-only flow can save with Ctrl/Cmd+Enter,
and export works after that, but the visible affordance is misleading.

### P2 — live security and caching headers are incomplete

The live root and hashed JS response include HSTS, `nosniff`, and Referrer
Policy, but no Content-Security-Policy, frame-ancestors/X-Frame-Options,
Permissions-Policy, or Cross-Origin-Opener-Policy. Hashed static JS also uses
`cache-control: public, must-revalidate, max-age=30` rather than a long-lived
immutable policy. These are deployment configuration issues and do not expose
study content in the tested free flow, but they miss the stated security and
static-asset caching expectations.

## Passing local checks

Clean checkout at the candidate SHA, Node `v22.23.2`, npm `10.9.8`:

```text
npm ci                                      PASS (Playwright Chromium installed separately)
npm test                                    PASS — 11/11
npm run typecheck                           PASS
npm run build                               PASS — PWA/site + MV3 + ZIP
npm run test:extension                      PASS — service worker, options, popup, console
npx playwright test --workers=1             PASS — 6 passed, 2 correctly project-skipped
```

The first extension smoke attempt only failed because the clean container did
not have the browser binary; after `npx playwright install chromium`, the same
repository command passed. An accidental overlapping browser-suite retry caused
connection-refused results; the isolated serial rerun above is the recorded
result.

The exact final production build produced 22.90 KB JS (7.30 KB gzip), 19.31 KB
CSS (4.84 KB gzip), no webfonts, and a 106.85 KB mobile WebP hero, all within
the stated asset budgets. `npm audit --omit=dev --json` reported zero production
vulnerabilities. `npm ci` reports 14 audit findings in development/build
dependencies (5 moderate, 5 high, 4 critical), which are not runtime
dependencies but should be maintained.

## Product-flow evidence

On the live site, desktop and 390 px Chromium tests exercised the actual gate:

- A normal selected passage captured, saved, persisted, and exported as CSV.
- Three decision fields gate export; Markdown/CSV/Anki TSV are available after
  a saved ready prompt.
- A two-character passage was rejected with the useful minimum-length error.
- `javascript:alert(1)` as source URL was normalized away; the byline became
  `Saved passage` rather than rendering/executing it.
- Duplicate passage protection displayed its error; discard followed by Undo
  restored the exact passage.
- CSV cells beginning `=`, `+`, and `@` were prefixed with an apostrophe in the
  emitted download, preventing spreadsheet formula execution.
- Desktop and 390 px had no page horizontal overflow. Keyboard Tab reached a
  visible 3 px focus outline; reduced motion computed a `0.01ms` transition.
- Live axe checks found no serious or critical violations on desktop or 390 px;
  each had a title, `lang=en`, one `h1`, one `main`, and no missing image alt.
- No console/page errors occurred in the representative free flow.

## PWA, privacy, and outbound requests

The deployed service worker controlled the page using
`source-to-recall-gate-v2`; an update check completed with no waiting worker.
After a first load, an offline reload retained the app shell, showed the
offline notice, and exposed the capture input. This confirms the offline path
for the current SW version (not a future changed-version rollout).

Request recording during the free capture/export flow found only
`https://source-to-recall-gate.sociobot.in`. Source inspection and the privacy
page agree: captures are local (`localStorage`/`chrome.storage.local`), there
are no analytics, remote fonts, or third-party scripts, and the only designed
outbound endpoint is the Sociobot license API when a user supplies a license.
The MV3 manifest limits host permission to `https://api.sociobot.in/*` and uses
storage, contextMenus, activeTab, and scripting.

## Live parity, headers, and performance

Live byte-for-byte SHA-256 parity was confirmed for `/`, `/sw.js`,
`/manifest.webmanifest`, `/assets/home-DrfhYzV_.js`,
`/assets/style-BZ4IfPXn.css`, `/assets/styles-B5Qt9EMX.js`, `/privacy/`, and
`/terms/`. The missing ZIP is the parity exception.

Live mobile Lighthouse (Chrome for Testing 145) reported Performance **94**,
Accessibility **100**, Best Practices **100**, and SEO **100**, with FCP
1.0 s, LCP 1.2 s, TBT 300 ms, and CLS 0. Lighthouse later reported a
`TARGET_CRASHED` error while taking its full-page screenshot; the score/metric
payload was nevertheless emitted, so treat that one audit as indicative rather
than a clean Lighthouse process exit. Browser and axe checks above completed
without a crash.

## Required next steps

1. Configure the static host/deployment to publish the generated
   `dist/site/downloads/source-to-recall-gate-chrome.zip` without SPA fallback,
   then verify ZIP magic/content type/download installation from the live URL.
2. Make export either save current decision edits before serializing or keep
   export disabled with an explicit “Save decisions first” instruction.
3. Add CSP (including an appropriately narrow `connect-src`), clickjacking
   protection, Permissions Policy/COOP as appropriate, and immutable caching
   for content-hashed assets at the deployment layer.
