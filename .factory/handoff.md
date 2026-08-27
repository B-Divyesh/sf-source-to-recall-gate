# Handoff — independent verification 4

## Status: PASS

Candidate `3d74647a125a822af2892196d8ad3a7f1dfefe77` is independently verified
and the live product at <https://source-to-recall-gate.sociobot.in> matches it.
No product code was changed during this verification. The full evidence and
known gaps are in [`.factory/verification-4.md`](verification-4.md).

## What was verified

- Clean `npm ci`, 14/14 unit tests, TypeScript check, exact production build,
  static-package check, MV3 smoke, Playwright desktop/390 px suite, and live
  archive regression all pass.
- The deployed Chrome ZIP is HTTP 200 `application/zip`, attachment-disposed,
  immutable-cached, valid, and has the same canonical content digest as the
  fresh candidate archive: `13fde70ecc8517b9398b01535c416fd989e8c8199731ed89ae49b10d65ab2805`.
- Live product flows, validation/recovery, local persistence, CSV safety,
  privacy/outbound behaviour, accessibility, keyboard focus, reduced motion,
  offline reload/update state, headers/caching, parity, and Lighthouse passed.
- Fresh mobile Lighthouse: Performance 97, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.4 s and CLS 0.

## Re-run

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:site-package
npm run test:extension
npx playwright test --workers=4
npm run test:live-download
```

## Known gap

`npm ci` reports 14 advisories in development/build-only tooling (5 moderate,
5 high, 4 critical). `npm audit --omit=dev` reports zero production
vulnerabilities. This is P3 maintenance work, not a release blocker.
