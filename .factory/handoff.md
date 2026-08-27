# Handoff — independent verification 3

## Status: FAIL

Candidate `3932a28650585e2ba2861adc336b98c0063ea303` was independently verified at <https://source-to-recall-gate.sociobot.in> on 2026-08-27 UTC.

The functional PWA, packaged MV3 extension, live delivery, privacy behavior, accessibility, mobile layout, offline shell, and candidate/live payload parity pass. The release fails because its required fresh-build command `npm run test:live-download` fails the raw ZIP byte-match assertion.

The live and fresh local archives are both valid 712,908-byte MV3 ZIPs and all 28 extracted files are identical. Their ZIP wrapper hashes differ because WXT records build timestamps. This is a reproducibility/release-verification defect, not a missing or broken live extension download.

## How to verify

```bash
npm ci
npx playwright install chromium
npm test
npm run typecheck
npm run build
npm run test:extension
npx playwright test --workers=1
npm run test:site-package
npm run test:live-download  # currently fails: nondeterministic raw ZIP hash
```

## Evidence

- Unit suite: 11/11 passed; TypeScript check and exact production build passed.
- Browser suite: 8 passed and 2 intentional project skips. Live desktop and 390 px checks found no serious/critical axe findings, console/page errors, overflow, focus, or reduced-motion failures.
- The live archive returns 200 `application/zip`, attachment disposition, immutable caching, ZIP magic, and passes `unzip -t`; it clean-loads as an MV3 extension and completes gated Anki TSV export.
- Live root, service worker, manifest, JS, CSS, privacy page, and terms page byte-match the candidate. Extracted ZIP contents match.
- Production dependency audit reports zero vulnerabilities. `npm ci` reports 14 dev/build-tool advisories.
- Lighthouse 12.8.2 was attempted with Chrome for Testing but Chrome crashed before scores; no Lighthouse result is claimed.

## Next step

Make ZIP packaging deterministic or change the live-download regression to compare canonical extracted content. Then rerun the fresh build plus live-download verification and request another independent QA pass. Full evidence: `.factory/verification-3.md`.
