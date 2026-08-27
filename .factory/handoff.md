# Handoff — Source-to-Recall Gate v1

## Delivered

- A WXT/TypeScript Chrome MV3 extension with popup, selection-only context-menu
  capture, `Alt + Shift + G` capture, local extension storage, and a full-tab
  decision workbench.
- A matching installable/offline-capable PWA and product site at the deploy root.
- The complete passage-to-prompt workflow: manual/clipboard intake, duplicate
  protection, optional source metadata, queue filters, three required encoding
  decisions, draft persistence, readiness feedback, reversible discard,
  confirmed local-data deletion, and Markdown/CSV/Anki TSV downloads.
- CSV formula-injection protection and HTML escaping for Anki output.
- A $9 one-time Press Pass integration using the Sociobot product-slug checkout,
  returned-token storage, daily cached verification, optimistic offline unlock,
  invalid-license reconciliation, restore-by-token, batch export, and local JSON
  backup/restore. No product ID is hardcoded. The free individual export path is
  never gated.
- Product-specific dithered/halftone “memory press” visual system, responsive
  390 px layout, keyboard paths, reduced-motion behavior, focus treatments, and
  local/offline/error/empty states.
- Original generated hero art with its prompt and generator provenance in
  `.factory/design.md` and `assets/src/`; reviewed responsive WebP assets are
  108 KB mobile and 240 KB desktop.
- Privacy and terms pages, MIT license, PWA manifest/service worker, robots and
  sitemap, README, unit tests, browser-flow tests, and packaged extension link.

## Build and verification

Run from `/work/repo`:

```bash
npm install
npm test
npm run typecheck
npm run test:e2e
npm run build
```

Verified on 2026-08-27:

- `npm test`: 11/11 passing.
- `npm run typecheck`: passing with strict TypeScript.
- `npm run test:e2e`: 6 passing, 2 intentionally skipped where tests target only
  one project; desktop and 390 px capture → gate → persistence → download flows
  pass, and the complete PWA reopens offline after first load.
- `npm run test:extension`: packaged MV3 service worker starts; popup and full-tab
  options workbench render with one `h1` and no console errors.
- Axe (Playwright integration): no serious or critical violations on the home,
  privacy, or terms pages in desktop and 390 px projects.
- Factory `verify-url.sh`: HTTP 200, zero console/page errors, title and `lang`
  present, exactly one `h1`, main landmark present, no missing image alt text,
  and no unlabeled buttons.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.2 s, TBT 20 ms, CLS 0, Speed Index 1.0 s.
- Production asset budgets: initial site JS 22.90 KB (7.30 KB gzip), CSS 19.31
  KB (4.84 KB gzip), no fonts, mobile hero 108 KB. All are below the contract.
- `npm audit --omit=dev`: 0 production vulnerabilities. npm reports issues only
  in WXT/build-time transitive tooling, which is not shipped at runtime.
- `npm run build` writes `dist/site/index.html` and
  `dist/site/downloads/source-to-recall-gate-chrome.zip` as required.

## Known release steps / gaps

- The factory must register the paid product slug with the Sociobot billing
  engine and configure its return URL before real purchases can complete. The
  application already targets the documented production API and needs no
  product ID change.
- Store submission/signing and deployment are intentionally outside this repo.
- The packaged artifact targets Chrome MV3 per the work order; Firefox packaging
  has not been release-tested.
