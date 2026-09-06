# Handoff: Turn highlights into recall prompts

## Status

Independent verification 5 passed with zero findings and zero untested public
claims.

- Live product: <https://source-to-recall-gate.sociobot.in>
- Implementation verified: `7b944230aa186b912498cd379348a6cdc05b8064`
- Documentation reviewed: `a0d4cc63d88cfcaab565889c147411d618236caa`
- Full report: `.factory/verification-5.md`

No product code changed during verification.

## What is ready

The live browser extension and PWA complete the researched job. Students can
capture selected text, write a paraphrase, recall cue, and use-case, then export
a ready prompt as Markdown, CSV, or Anki TSV. Captures remain in browser-local
storage and the PWA works offline after its first visit.

The one-click sample at `/demo/` has three realistic passages in a separate
`demo:` storage namespace. Its persistent label, reset action, and exit action
were verified without changing a normal-storage sentinel.

The live extension ZIP matches the clean implementation build by canonical
content digest. A clean Chromium profile loaded its MV3 worker, options page,
and popup without errors.

The product-specific design, generated-art provenance, spacing, type, palette,
and motion policy remain documented in `.factory/design.md`. The demo contract
is in `.factory/demo.md`, and all public claims are in
`.factory/claims.json`.

## Verification 5

From a fresh checkout at the implementation SHA with Node 22.23.2, npm 10.9.8,
and Playwright 1.58.2:

```text
npm ci                       PASS (0 advisories)
npm test                     PASS (18/18)
npm run typecheck            PASS
npm run test:claims          PASS (all 15 declared commands)
npm run build                PASS
npm run test:site-package    PASS
npm run test:extension       PASS
npm run test:e2e             PASS (35 passed, 1 intended project skip)
npm audit                    PASS (0 advisories)
npm run test:live-download   PASS
verify-url.sh                PASS
```

Fresh live desktop and phone browsers passed the first screen, one-click demo,
realistic output, persistent demo label, reset, real-data isolation, normal and
invalid input, 4,000/4,001-character boundaries, recovery, keyboard, focus,
44-pixel touch targets, 200% scale, reduced motion, privacy, offline reload,
route titles, legal pages, all links, and the designed HTTP 404.

Axe found zero violations on every public route and the 404. Lighthouse scored
100 for Performance, Accessibility, Best Practices, and SEO. FCP was 0.99 s,
LCP 1.21 s, TBT 9 ms, and CLS 0. Initial JavaScript is 8.30 KB gzip and CSS is
5.35 KB gzip.

Evidence:

- `.factory/verification-5.md`
- `/work/.evidence/verify5-desktop-first-screen.png`
- `/work/.evidence/verify5-phone-first-screen.png`
- `/work/.evidence/verify5-phone-demo.png`
- `/work/.evidence/verify5-url/verify.json`
- `/work/.evidence/lighthouse-verify5.json`

## Earlier findings

All earlier product findings are closed:

- The live extension archive returns a valid ZIP, matches the candidate by
  canonical content digest, and loads in a clean Chromium profile.
- Export saves visible decisions before serialization.
- Security and immutable cache headers are live.
- The isolated sample, claims registry, plain first screen, route metadata,
  designed 404, 16-pixel text baseline, and current dependencies are present.
- Context-menu, shortcut, toolbar, paid activation, batch export, backup, and
  restore have passing outcome tests.

## Remaining operator step

New checkout is not registered yet. The product does not link the unavailable
endpoint. It says **Checkout setup pending — $9**, keeps free tools available,
and continues to verify existing licenses.

Register the one-time offer through the separate Sociobot billing operation.
After registration, replace the pending state with the product-scoped checkout
link, deploy that small product change, and verify one paid return and license
entitlement. The referenced `/work/.evidence/billing-offer.json` was not present
in this disposable verification workspace, so the operator must supply or
regenerate that external registration input.

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
