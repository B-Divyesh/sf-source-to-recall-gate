# Handoff: Review selected passages into recall prompts

## Status: FAIL

Review 1 audited implementation candidate
`c4a0d32d6ee85f47b218fdf3a50a362bd124d942` against the live product. The
documentation state before this report was
`8f6f30cc5c25958cec191d459b5481a1f09be9ab`. No product code was changed.

The full report is [`.factory/review-1.md`](review-1.md). It records seven
findings and seven untested public claims. The main release blockers are the
missing isolated sample demo, the live checkout URL returning 404, and the
missing claim registry and claim-tagged tests.

## Verified working

- Normal, invalid, boundary, persistence, export, undo, and deletion flows on
  live desktop and phone.
- Markdown, CSV, and Anki TSV individual exports.
- Offline reload and current service-worker update state.
- Keyboard order, dialog focus, reduced motion, reflow, and zero Axe violations.
- Privacy behavior for the free flow and invalid-license recovery.
- Live/local runtime parity and the downloadable MV3 archive.
- Mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices,
  and 100 SEO; LCP 1.22 s and CLS 0.

## Re-run

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:e2e
npm run test:site-package
npm run test:extension
npm run test:live-download
```

## Work left

1. Add the required one-click sample in an isolated `demo:` namespace, with a
   persistent label, reset, exit, direct URL, and `.factory/demo.md`.
2. Register or repair the Sociobot checkout product so the advertised link
   works, then test valid-license and paid-feature paths.
3. Add `.factory/claims.json` and one tagged sandbox test for every public
   claim, including the extension's native capture paths.
4. Replace metaphorical first-screen copy, name students, add required route
   metadata and a real 404, and raise instructional text to at least 16 px.
5. Update the vulnerable development/build dependencies.
