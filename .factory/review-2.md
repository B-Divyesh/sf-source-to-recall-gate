# Review 2: Turn highlights into recall prompts

## Verdict: PASS

- Findings: **0** — no P0, P1, P2, or P3 findings
- Untested public claims: **0**
- Live URL: <https://source-to-recall-gate.sociobot.in>
- Reviewed: 6 September 2026 UTC
- Implementation candidate: `7b944230aa186b912498cd379348a6cdc05b8064`
- Documentation baseline: `e1a8cd937fc4fdc514d54ddb2dea9d1be43d8e35`

The commits after the implementation candidate change only `.factory` reports.
A fresh candidate build matched the live pages, service worker, manifest, and
every built asset byte for byte. The live extension matched the build by its
canonical archive-content digest.

## Job, audience, and first action

Before scrolling in fresh 1440 × 900 desktop and 390 × 844 phone browsers:

- Job: **Turn highlights into recall prompts**.
- Audience: students who want useful prompts without copied passages filling a
  review queue.
- First action: **Try it with sample data**.
- The first screen explains that the action opens three separate sample
  passages. It also shows local storage, offline use, and three export formats.

The facts ended at 625 px on desktop and 683 px on phone, inside both initial
viewports. Neither viewport had horizontal overflow. Screenshots are
`/work/.evidence/review2-desktop-first-screen.png` and
`/work/.evidence/review2-phone-first-screen.png`.

## Sample and core workflow

The one-click action opened `/demo/` with three realistic study passages. Two
were ready and one was unfinished. The selected sample included a source
passage, paraphrase, recall cue, and concrete use-case. Its downloaded Markdown
contained all three written answers.

The **Demo — sample data, nothing is saved** label remained visible after
scrolling. An edited cue used only the `demo:` key. **Reset demo** restored the
original cue. **Start for real** removed the demo key and preserved a sentinel
in normal storage. No existing browser profile or user data was read or changed.

Fresh live and clean-candidate contexts also covered:

- A normal passage, three decisions, export, reload persistence, discard, Undo,
  delete confirmation, cancellation, and deletion.
- A two-character passage, a duplicate, exactly 4,000 characters, a forced
  4,001 characters, correction, and recovery.
- An invalid backup without data replacement, plus valid fixture-based batch
  export, backup download, and backup restore.
- An invalid live license response. The inactive notice appeared, free capture
  stayed enabled, and the only API request contained the test token—not study
  content.

## Declared claims

`.factory/claims.json` declares 15 claims. Every ID occurs in exactly one tagged
test. From a clean checkout, `npm run test:claims` executed every declared
command and ended with `All 15 declared claim commands passed.`

| Claim | Declared command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS |
| `three-decisions` | `npm run test:e2e -- --grep @claim:three-decisions` | PASS |
| `individual-exports` | `npm run test:e2e -- --grep @claim:individual-exports` | PASS |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | PASS |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS |
| `local-persistence` | `npm run test:e2e -- --grep @claim:local-persistence` | PASS |
| `delete-local-data` | `npm run test:e2e -- --grep @claim:delete-local-data` | PASS |
| `extension-download` | `npm run test:e2e -- --grep @claim:extension-download` | PASS |
| `extension-context-menu` | `npm test -- --testNamePattern @claim:extension-context-menu` | PASS |
| `extension-shortcut` | `npm test -- --testNamePattern @claim:extension-shortcut` | PASS |
| `extension-toolbar` | `npm test -- --testNamePattern @claim:extension-toolbar` | PASS |
| `press-pass-activation` | `npm run test:e2e -- --grep @claim:press-pass-activation` | PASS |
| `batch-export` | `npm run test:e2e -- --grep @claim:batch-export` | PASS |
| `backup-download` | `npm run test:e2e -- --grep @claim:backup-download` | PASS |
| `backup-restore` | `npm run test:e2e -- --grep @claim:backup-restore` | PASS |

The landing page, workbench, extension popup, Privacy, Terms, and README were
cross-checked against the registry. Their public product outcomes are covered.
The paid activation and paid export tests use a recorded valid verification
response; this is fixture evidence, not a claim that live checkout is ready.

## Accessibility, mobile, and routes

Fresh Axe scans found zero violations on Home, Demo, Privacy, Terms, the
designed 404, the downloaded extension options page, and its popup. Each public
route has `lang=en`, one `h1`, one `main`, its own title, canonical and social
metadata, labelled controls, and image alt attributes.

Keyboard focus began on **Skip to main content**. Dialog focus moved to **Keep
my passages**, Escape closed the dialog, and sampled focus used a visible 3 px
blue outline. Reduced-motion durations were effectively instant. On a 390 px
phone, all 24 exposed controls measured at least 44 × 44 CSS pixels. At 200%
page scale, demo actions, fields, and the save action remained available.

Home, Demo, Privacy, and Terms returned HTTP 200. The unknown route returned the
intended HTTP 404 with the title `Page not found — Source-to-Recall Gate`, one
`h1`, one `main`, and working recovery links. Chromium logged only its expected
failed-navigation message for that deliberate 404; there were no unexpected
console or page errors. Every published home-page link returned 200.

The privacy page explains local storage, license-token requests, browser
permissions, deletion, export, and where to send privacy questions. The Terms
page states the $9 one-time license terms and keeps individual export, privacy,
and accessibility features free.

## Privacy, offline use, and update state

The complete free live flow made only same-origin GET requests. It made no
fetch, XHR, event-source, analytics, sync, AI, or study-content request. The
invalid-license recovery made one GET to the product's Sociobot verification
endpoint and sent no study content.

The active service worker controlled a fresh page. A forced update check left
one activated worker with no waiting or installing worker. After the browser
went offline, a reload retained the sample label, all three passages, the full
tool, and the offline notice.

This is a static PWA and MV3 browser extension with browser-local state. Backend
tenant isolation, server restart persistence, health endpoints, and product
HTTP 429 behavior do not apply.

## Extension and live parity

The live download returned HTTP 200, `application/zip`, attachment disposition,
and immutable one-year caching. Its 1,004,594-byte content passed the canonical
archive comparison with digest:

```text
ab9e45359bf3c604175398263545ca8b54e5395677713635ea48c705a0b8ddbf
```

The live ZIP was downloaded, extracted to a new consumer directory, and loaded
in a fresh Chromium profile. Its MV3 service worker started. The options page
captured a passage, exported CSV, and restored the ready prompt after reload.
The popup loaded, both extension pages had zero Axe violations, and no console
or page errors occurred.

Fresh SHA-256 values matched between candidate output and live Home, Demo,
Privacy, Terms, the 404 body, service worker, and web manifest. Every file in
the built `assets/` directory also matched. Live pages and assets include CSP,
HSTS, `nosniff`, strict referrer policy, Permissions Policy, COOP, and frame
denial. Hash-named assets and the ZIP use immutable one-year caching.

## Clean-checkout commands

Environment: Node 22.23.2, npm 10.9.8, and Playwright 1.58.2. The checkout was
created directly at the implementation candidate.

```text
npm ci                       PASS — 0 advisories
npm test                     PASS — 18/18
npm run typecheck            PASS
npm run test:claims          PASS — all 15 declared commands
npm run build                PASS
npm run test:site-package    PASS
npm run test:extension       PASS
npm run test:e2e             PASS — 35 passed, 1 intended project skip
npm audit                    PASS — 0 advisories
npm run test:live-download   PASS
verify-url.sh                PASS — no console errors
```

The build emits 25.73 KB initial JavaScript, 21.64 KB CSS, no webfonts, and a
106.85 KB phone hero image. A fresh live mobile Lighthouse run produced:

| Measure | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.99 s |
| Largest Contentful Paint | 1.17 s |
| Total Blocking Time | 9 ms |
| Cumulative Layout Shift | 0 |

The first Lighthouse launch did not receive its Chrome path, and a second tab
crashed before measurement. A clean retry with the provided Chromium and
shared-memory-safe flags completed and produced the results above. No failed
run is presented as evidence.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Live extension URL returned the home HTML | Fixed. It returns the matching ZIP and loads as MV3. |
| Live extension URL returned 404 | Fixed. It returns HTTP 200 with ZIP headers. |
| Raw ZIP comparison failed on generated timestamps | Fixed. Canonical archive-content comparison passes and still detects payload changes. |
| Export required an unstated extra save | Fixed. Export persists visible decisions before serialization. |
| Security and cache headers were incomplete | Fixed on live documents, assets, 404, and ZIP. |
| Development tools had 14 advisories | Fixed. Fresh `npm ci` and `npm audit` report zero. |
| Native capture outcomes were untested | Fixed. Context-menu, shortcut, and toolbar handlers each have one passing claim test; the packaged worker also loads. |
| One-click isolated sample was missing | Fixed. Sample, persistent label, reset, exit, and sentinel isolation pass live. |
| Checkout linked to an unavailable offer | Fixed in the product. No checkout link is exposed while registration is pending. |
| Claims registry and paid-tool evidence were missing | Fixed. All 15 declared commands pass from the clean checkout. |
| First-screen copy did not name the job or audience | Fixed before scrolling on desktop and phone. |
| Demo route, route metadata, and designed 404 were missing | Fixed and verified live. |
| Important interface text was smaller than 16 px | Fixed; the browser suite verifies the affected text. |

## External checkout status

The product-scoped checkout endpoint still returns HTTP 404. The live product
does not link to it or say that new purchase is available. It states **Checkout
setup pending — $9**, keeps all free tools usable, and lets existing holders
restore a license. Registering the offer remains an external operator step, not
a defect in the reviewed candidate.

Evidence:

- `/work/.evidence/review2-live.json`
- `/work/.evidence/review2-live-extension.json`
- `/work/.evidence/review2-license-recovery.json`
- `/work/.evidence/review2-service-worker-update.json`
- `/work/.evidence/review2-url/verify.json`
- `/work/.evidence/lighthouse-review2.json`

## Findings

None. The verdict is **PASS** with zero findings of every severity and zero
untested public claims.
