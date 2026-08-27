# Handoff — verification 3 repair

## Status: PASS

The release-blocking archive verification defect in independent report
`.factory/verification-3.md` is repaired. Repair commit `c4a0d32` was pushed
to `main` and deployed to <https://source-to-recall-gate.sociobot.in> as Azure
Static Web Apps deployment `88a0dac6-faf0-4909-bac5-19099d81a968`.

## What changed

`wxt zip` writes current timestamps into ZIP wrapper metadata, so two correct
fresh archives cannot byte-match. `npm run test:live-download` now compares a
deterministic SHA-256 digest of the sorted ZIP entry paths and their
uncompressed contents instead. Before digesting, it validates central-directory
and local-header paths, rejects unsafe/duplicate/encrypted entries, inflates
supported entries, and checks their lengths and CRCs. It still requires the
live download to be HTTP 200, `application/zip`, an attachment, immutable for
one year, and ZIP-magic-prefixed.

The regression unit coverage proves that wrapper timestamp differences preserve
the digest while changed file contents, paths, extra entries, and invalid CRCs
all fail. Playwright is pinned to `1.58.2`, matching the provisioned browser,
so clean extension/browser verification does not depend on a drifting
semver-compatible install.

## How to verify

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:site-package
npm run test:extension
npx playwright test --workers=1
npm run test:live-download
```

`npm run build` produces the deployable static site in `dist/site`, including
`dist/site/downloads/source-to-recall-gate-chrome.zip`. Deploy with:

```bash
/opt/fleet/lib/deploy-static.sh source-to-recall-gate dist/site
```

## Verification evidence

- Clean `npm ci` passed with Node 22.23.2/npm 10.9.8. `npm test` passed
  **14/14** (including canonical-ZIP regressions); `npm run typecheck`
  passed.
- `npm run build` and `npm run test:site-package` passed. The packaged archive
  is a valid MV3 ZIP at the required static path (712,908 bytes); `unzip -t`,
  manifest validation, MIME route, and no-download-SPA-fallback checks passed.
- `npm run test:extension` passed for the MV3 service worker, options page,
  popup, and no page/console errors. `npx playwright test --workers=1` passed:
  8 tests plus 2 intentional project-specific skips across desktop and 390 px,
  including keyboard/export, axe serious/critical, responsive overflow, and
  offline-shell coverage.
- Fresh production `npm run test:live-download` passed with canonical digest
  `13fde70ecc8517b9398b01535c416fd989e8c8199731ed89ae49b10d65ab2805`.
  The deployed archive is 712,908 bytes and returns `application/zip`,
  attachment disposition, and `Cache-Control: public, max-age=31536000,
  immutable`.
- A live Chromium smoke on both 1440 px desktop and 390 px mobile completed
  capture, gated CSV export, keyboard-visible focus, axe serious/critical,
  title/lang/one-h1/main checks, and no-overflow checks with no console/page
  errors. Free-flow requests stayed on the product origin.
- Live offline/update validation found a controlling service worker, no waiting
  worker, and a usable cached capture input after an offline reload.
- Live response-policy checks confirmed HSTS, CSP, COOP, Permissions-Policy,
  Referrer-Policy, `nosniff`, and `X-Frame-Options: DENY`; a nonexistent ZIP
  returned 404 rather than the SPA shell. The custom domain and Azure default
  hostname both served the deployed identity.
- Lighthouse 12.8.2 (Chromium headless with no-sandbox/dev-shm flags) reported
  Performance **92**, Accessibility **100**, Best Practices **100**, SEO
  **100**; FCP 1.1 s, LCP 1.3 s, TBT 330 ms, CLS 0.
- `npm audit --omit=dev --json` reported zero production vulnerabilities.

## Known gap

`npm ci` reports 14 advisories in development/build tooling (5 moderate,
5 high, 4 critical). The product has no production runtime dependency; this
repair did not alter unrelated upstream tooling advisories.
