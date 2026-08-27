# Independent verification 2 — FAIL

- **Verifier:** `source-to-recall-gate-verify-2`
- **Candidate commit:** `66eedc59743e106aff84c532ed39651f0fa0d9d9` (`main`)
- **Live URL:** <https://source-to-recall-gate.sociobot.in>
- **Verified:** 2026-08-27 UTC
- **Decision:** **FAIL**

## Release-blocking defect

### P0 — live Chrome-extension download is absent

The product presents **Get extension** and **Download Chrome extension**, both pointing to
`/downloads/source-to-recall-gate-chrome.zip`. Fresh HEAD and GET requests to the live URL
returned **HTTP 404** / `text/html` on 2026-08-27. This is not a browser-side download issue:
the final local production build contains a valid 712,908-byte ZIP at that same path, with ZIP
magic, and `unzip -t` passes. A fresh extraction also loaded cleanly as an MV3 extension (one
options-page `h1`, one popup `h1`, no console or page errors).

The deployed HTML, service worker, manifest, main JS, and main CSS have exact SHA-256 parity
with the final build. The missing archive is therefore a deployment/publishing failure, not a
source-build failure. Since the brief's artifact class and primary capture workflow require a
browser extension, users cannot obtain the advertised product. This blocks release.

## Clean local candidate checks

Clean install used Node 22.23.2 / npm 10.9.8:

```text
npm ci                                PASS
npm test                              PASS — 11/11
npm run typecheck                     PASS
npx playwright test --workers=1       PASS — 10 project cases (8 pass, 2 expected project skips)
npm run test:extension                PASS — MV3 worker, options, popup, console
npm run zip                           PASS
npm run build                         PASS — site, MV3 package, and copied ZIP
unzip -t dist/site/downloads/...zip   PASS
npm audit --omit=dev --json           PASS — 0 production vulnerabilities
```

`npm ci` reports 14 dependency advisories (5 moderate, 5 high, 4 critical) in development/build
tooling. They are not production runtime dependencies, but should be maintained. The exact build
emitted 22.96 KB main JS (7.32 KB gzip), 19.31 KB CSS (4.84 KB gzip), no webfonts, and a 106.85
KB mobile hero WebP, all within the stated static asset budgets. The local download route returns
HTTP 200 / `application/zip`; static-host configuration specifies attachment and immutable caching.

## Product flow evidence on the live candidate

Independent Playwright checks ran on desktop (1440 px) and 390×844 mobile:

- Captured a normal passage; supplied paraphrase, cue, and concrete use-case; exported CSV
  *without* separately pressing Save; reloaded and confirmed all decisions persisted. This
  verifies the repair from verification 1.
- Rejected a two-character passage with an actionable error, then recovered by adding a valid
  passage. A `javascript:alert(1)` source URL was normalized away and showed `Saved passage`.
- Prevented duplicate capture; discard and Undo restored the exact passage.
- Confirmed CSV values starting `=`, `+`, and `@` are apostrophe-prefixed against spreadsheet
  formula execution.
- Confirmed no desktop or 390 px horizontal overflow, no page/console errors, and only same-origin
  requests in the free capture/export flow.
- An intentionally invalid license restoration made the single expected request to
  `https://api.sociobot.in`, displayed `License no longer active.`, and caused no error. No study
  content was sent.

The freshly extracted archive loaded with manifest version 3 and only `storage`, `contextMenus`,
`activeTab`, `scripting`, and the narrowly scoped Sociobot license host permission. Its options
page and popup had no console/page errors. Native Chrome context-menu invocation is not
automatable with Playwright; this run provides package/runtime evidence for the extension but not
an automated native-menu gesture. That limitation does not change the P0 delivery failure.

## Accessibility, PWA, privacy, response policy, and performance

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, one `h1`, `main`, image alt
  text, and no console/page errors.
- Fresh Axe Playwright scans on both desktop and 390 px found **zero serious or critical
  violations**. Tab navigation reaches the skip link, capture controls, queue filters, paid
  controls, and license summary with a visible 3 px `#125B68` focus outline.
- With `prefers-reduced-motion: reduce`, observed button and gate transition durations were
  `0.01ms`; desktop and 390 px layouts had equal client and scroll widths.
- The live service worker controls the page (`source-to-recall-gate-v2`), has an active worker and
  no waiting worker. After first load, offline reload rendered the cached shell and exposed capture.
- Free-flow recording observed only `https://source-to-recall-gate.sociobot.in`; source/runtime
  inspection found browser-local storage, no analytics, remote fonts, CDN scripts, cloud study
  content API, or AI card generation.
- Live HTML, `sw.js`, web manifest, `home-f3lff4m7.js`, and `style-BZ4IfPXn.css` byte-match local
  candidate output. Hashed assets have `Cache-Control: public, max-age=31536000, immutable`.
- Live root applies HSTS, `nosniff`, strict referrer policy, self-only CSP (Sociobot-only connect
  exception), COOP, Permissions-Policy, and `X-Frame-Options: DENY`. The ZIP cannot receive its
  configured policy because it is 404.
- Mobile Lighthouse emitted Performance **91** and Accessibility **100**; FCP 1.2 s, LCP 1.4 s,
  TBT 370 ms, CLS 0. Lighthouse later reported a Chrome tab crash, so these emitted metrics are
  informative rather than a clean Lighthouse process exit; normal browser/a11y runs passed.

## Required remediation

1. Publish `dist/site/downloads/source-to-recall-gate-chrome.zip` with the deploy; do not send it
   through SPA fallback.
2. Confirm live HTTP 200, `Content-Type: application/zip`, attachment disposition, immutable
   caching, ZIP magic, `unzip -t`, and a fresh Chrome install.
3. Re-run independent live verification. This report indicates no application-code change is needed.
