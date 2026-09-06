# Handoff: Turn highlights into recall prompts

## Status

Review 2 passed with zero findings of every severity and zero untested public
claims.

- Live product: <https://source-to-recall-gate.sociobot.in>
- Implementation reviewed: `7b944230aa186b912498cd379348a6cdc05b8064`
- Documentation baseline: `e1a8cd937fc4fdc514d54ddb2dea9d1be43d8e35`
- Full report: `.factory/review-2.md`

No product code changed during this review.

## What was verified

The live browser extension and PWA perform the researched job. Students can
capture selected text, write a paraphrase, recall cue, and use-case, then export
a ready prompt as Markdown, CSV, or Anki TSV. Captures remain in browser-local
storage, and the PWA works after an offline reload.

The one-click sample at `/demo/` contains three realistic passages in a
separate `demo:` namespace. Its persistent sample label, populated output,
reset action, and exit action were verified without changing a normal-storage
sentinel.

Fresh live desktop and phone contexts passed the first screen, normal flow,
invalid and boundary input, recovery, keyboard, focus, reduced motion, touch
targets, 200% scale, privacy request logging, offline/update state, all links,
route titles, legal pages, and the designed HTTP 404. Axe found zero violations
on every public route and both installed extension pages.

The live extension ZIP matches the clean implementation build by canonical
content digest. A fresh Chromium profile loaded its MV3 worker, options page,
and popup. Capture, CSV export, reload persistence, and console checks passed
using the downloaded artifact.

## Clean verification

From a fresh checkout at the implementation SHA with Node 22.23.2, npm 10.9.8,
and Playwright 1.58.2:

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
verify-url.sh                PASS
```

Fresh local output matched the live HTML, service worker, manifest, and every
built asset. The live archive's canonical content digest is
`ab9e45359bf3c604175398263545ca8b54e5395677713635ea48c705a0b8ddbf`.

Mobile Lighthouse scored 100 for Performance, Accessibility, Best Practices,
and SEO. FCP was 0.99 s, LCP 1.17 s, TBT 9 ms, and CLS 0. Initial JavaScript is
8.30 KB gzip, CSS is 5.35 KB gzip, and the phone hero image is 106.85 KB.

Evidence:

- `.factory/review-2.md`
- `/work/.evidence/review2-desktop-first-screen.png`
- `/work/.evidence/review2-phone-first-screen.png`
- `/work/.evidence/review2-phone-demo.png`
- `/work/.evidence/review2-live.json`
- `/work/.evidence/review2-live-extension.json`
- `/work/.evidence/review2-license-recovery.json`
- `/work/.evidence/review2-service-worker-update.json`
- `/work/.evidence/review2-url/verify.json`
- `/work/.evidence/lighthouse-review2.json`

## Earlier findings

All earlier findings are closed. The live extension download, archive
comparison, export persistence, response headers, dependency advisories,
native capture tests, sample isolation, plain first screen, route metadata,
designed 404, text sizes, and paid fixture evidence all passed this review.

## Remaining operator step

New checkout is not registered. The product does not link the unavailable
endpoint. It says **Checkout setup pending — $9**, keeps free tools available,
and continues to verify existing licenses.

Register the one-time offer through the separate Sociobot billing operation.
After registration, replace the pending state with the product-scoped checkout
link, deploy that product change, and verify one paid return and entitlement.

## Run the checks

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
