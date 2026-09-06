# Verification 5: Turn highlights into recall prompts

## Verdict: PASS

- Findings: **0**
- Untested public claims: **0**
- Live URL: <https://source-to-recall-gate.sociobot.in>
- Verified: 6 September 2026 UTC
- Implementation reviewed: `7b944230aa186b912498cd379348a6cdc05b8064`
- Documentation reviewed: `a0d4cc63d88cfcaab565889c147411d618236caa`

The documentation commit is later than the implementation commit. Its only
runtime ancestor after the main repair changes the product's external factory
links. The final build at the implementation SHA matches the live product.

## Job, audience, and first action

Before scrolling in fresh 1440 × 900 desktop and 390 × 844 phone browsers:

- Job: **Turn highlights into recall prompts**.
- Audience: students who want useful prompts without copied passages filling a
  review queue.
- First action: **Try it with sample data**.
- The same screen says what happens next and shows the local-storage, offline,
  and three-export facts.

The facts ended inside both initial viewports. The phone page had no horizontal
overflow. Screenshots are
`/work/.evidence/verify5-desktop-first-screen.png` and
`/work/.evidence/verify5-phone-first-screen.png`.

## Declared claims

`.factory/claims.json` contains 15 claims. Each ID occurs in exactly one tagged
test. From a fresh checkout at the implementation SHA, `npm run test:claims`
ran every declared command and ended with `All 15 declared claim commands
passed.`

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

I compared the live landing page, tool, Privacy, Terms, and README with this
registry. Every public behavioral outcome is covered by a declared claim. The
price, license terms, and pending-checkout copy also match the implementation.
The site does not claim that new checkout is available.

## Live product checks

The sample opened in one click with three realistic learning passages. Two were
ready and one was a draft. The selected prompt contained a source passage,
paraphrase, recall cue, and concrete use-case. Markdown output contained the
same populated answers.

The **Demo — sample data, nothing is saved** label stayed visible after
scrolling. Editing and saving changed only the demo key. **Reset demo** restored
the original cue. **Start for real** removed the demo key and preserved a
sentinel record in the normal storage key. No real browser profile or user data
was used.

Fresh live contexts also passed these paths:

- Normal capture, all three required decisions, export, reload persistence,
  discard, undo, delete confirmation, cancellation, and deletion.
- Two-character input, duplicate input, exactly 4,000 characters, forced 4,001
  characters, correction, and recovery.
- Invalid license recovery. It showed the inactive notice while free capture
  stayed enabled.
- Invalid backup rejection without replacing the three saved samples, plus
  valid paid batch export, backup download, and restore in the declared fixture
  sandbox.
- Keyboard starts on the skip link. Dialog focus moves to the safe action,
  Escape closes it, focus rings are visible, and reduced-motion transitions are
  effectively instant.
- At 390 px, all 21 visible buttons and controls measured at least 44 × 44 CSS
  pixels. A 200% page-scale smoke retained the demo actions, fields, and save
  action without document overflow.

## Privacy, offline use, and routes

The free live demo flow made only same-origin GET requests. It made no fetch,
XHR, event-source, analytics, sync, AI, or study-content request. License
verification is the only allowed product API request and sends only the token.

The active `source-to-recall-gate-v3` service worker controlled a fresh page,
was activated, and had no waiting worker. After network access was disabled, a
reload retained the three passages, the demo label, the complete tool, and the
offline notice.

Home, Demo, Privacy, and Terms returned 200 with distinct titles. The unknown
route returned the intended HTTP 404, the title `Page not found —
Source-to-Recall Gate`, one `h1`, one `main`, and working recovery links. That
deliberate response is expected, not a defect. Every published link returned a
successful response; the extension download returned 200.

The pending Sociobot checkout endpoint still returns HTTP 404. The product does
not link to it or present it as available. It says **Checkout setup pending —
$9**, leaves free tools available, and keeps existing-license restore and
verification. External offer registration remains an operator dependency, not
a failed product path. The referenced `/work/.evidence/billing-offer.json` was
not present in this disposable verifier workspace, so no registration action
was attempted.

This is a static PWA and browser extension with browser-local state. Backend
tenant isolation, server restart persistence, health endpoints, and product
HTTP 429 behavior do not apply.

## Accessibility and page quality

Fresh Axe runs found zero violations on Home, Demo, Privacy, Terms, and the
designed 404. Each route has `lang=en`, one `h1`, one `main`, a route title,
canonical and social metadata, alt attributes, ordered headings, and labelled
controls. The supplied URL verifier passed with no console or page errors; its
report is `/work/.evidence/verify5-url/verify.json`.

The initial site JavaScript is 25.73 KB raw and 8.30 KB gzip. CSS is 21.64 KB
raw and 5.35 KB gzip. The mobile hero WebP is 106.85 KB. A fresh live mobile
Lighthouse run produced:

| Measure | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.99 s |
| Largest Contentful Paint | 1.21 s |
| Total Blocking Time | 9 ms |
| Cumulative Layout Shift | 0 |

The Lighthouse report is `/work/.evidence/lighthouse-verify5.json`.

## Build and installed extension

Clean environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2.

```text
npm ci                       PASS (0 advisories)
npm test                     PASS (18/18)
npm run typecheck            PASS
npm run test:claims          PASS (15/15 declared commands)
npm run build                PASS
npm run test:site-package    PASS
npm run test:extension       PASS
npm run test:e2e             PASS (35 passed, 1 intended project skip)
npm audit                    PASS (0 advisories)
npm run test:live-download   PASS
verify-url.sh                PASS
```

The live 1,004,594-byte ZIP matched the fresh production archive by canonical
content digest
`ab9e45359bf3c604175398263545ca8b54e5395677713635ea48c705a0b8ddbf`.
I downloaded and extracted it into a clean temporary consumer directory, then
loaded it in Chromium. The MV3 worker, options workbench, popup, headings, and
console checks passed.

Fresh local and live SHA-256 values matched for Home, Demo, Privacy, Terms, the
designed 404 body, service worker, web manifest, initial JavaScript, and CSS.
The live ZIP and hash-named assets use immutable one-year caching. Responses
include CSP, HSTS, `nosniff`, strict referrer policy, Permissions Policy, COOP,
and frame denial.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Live extension URL returned HTML | Fixed. It returns the matching ZIP and loads as MV3. |
| Live extension URL returned 404 | Fixed. It returns HTTP 200 with ZIP headers. |
| Raw ZIP comparison failed on timestamps | Fixed. Canonical payload comparison passes. |
| Export failed before an extra save | Fixed. Export saves visible decisions and survives reload. |
| Security and cache headers were incomplete | Fixed on live documents, assets, and ZIP. |
| Development dependencies had 14 advisories | Fixed. Fresh `npm ci` and `npm audit` report zero. |
| Native capture claims lacked outcome tests | Fixed. Each context-menu, shortcut, and toolbar handler has one passing tagged test; the packaged worker also loads. |
| One-click isolated sample was missing | Fixed and proven with separate storage, reset, exit, and sentinel preservation. |
| Checkout link led to an unavailable offer | Product-side failure removed. The unavailable endpoint is not linked and is clearly marked pending. |
| Claims registry and paid-tool evidence were missing | Fixed. All 15 declared commands pass from the clean checkout. |
| First-screen copy did not name the job or audience | Fixed on desktop and phone before scrolling. |
| Demo route, metadata, and designed 404 were missing | Fixed and verified live. |
| Important interface text was below 16 px | Fixed; the browser suite checks the affected labels and state text. |

## Findings

None. The verdict is **PASS** with zero findings and zero untested public
claims.
