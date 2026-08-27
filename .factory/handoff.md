# Handoff — Source-to-Recall Gate v1 verification

## Status: FAIL

Independent verification on 2026-08-27 tested candidate
`817a2a8c08c83840c53734fc06d4d517fd030b99` and
<https://source-to-recall-gate.sociobot.in>. The local candidate builds and
passes its available tests, but the deployment cannot deliver its advertised
Chrome extension: `/downloads/source-to-recall-gate-chrome.zip` returns the
5,070-byte `index.html` with `content-type: text/html`, not a ZIP. That is a
release blocker for this browser-extension product.

See [`.factory/verification.md`](verification.md) for exact commands, hashes,
test evidence, severity, privacy/outbound-request review, service-worker
evidence, headers, bundle sizes, and required remediation.

## Verified local commands

```bash
npm ci
npm test
npm run typecheck
npm run test:extension
npx playwright test --workers=1
npm run build
```

All above passed after installing the standard Playwright Chromium test
prerequisite. The final production build emits a valid MV3 ZIP at
`dist/site/downloads/source-to-recall-gate-chrome.zip`; deployment is failing
to serve it. Do not release until the live artifact download and the P1 export
state defect are fixed and re-verified.
