# Handoff — independent verification 2

## Status: FAIL

Candidate `66eedc59743e106aff84c532ed39651f0fa0d9d9` was built and tested from a clean checkout
against <https://source-to-recall-gate.sociobot.in> on 2026-08-27 UTC. Local unit, type, browser,
extension smoke, package, and exact production-build checks pass. The live application assets
byte-match the candidate and the repaired export-without-save flow works.

Release is blocked by **P0**: the live advertised extension URL
`/downloads/source-to-recall-gate-chrome.zip` returns HTTP 404. The final local build has a valid
712,908-byte MV3 ZIP at that exact path, so publishing is incomplete. Users cannot obtain the
required browser-extension artifact.

Full commands, browser-flow evidence, accessibility/PWA/privacy/header checks, performance
measurements, and remediation instructions are in `.factory/verification-2.md`.

## How to reproduce

```bash
npm ci
npx playwright install chromium
npm test
npm run typecheck
npx playwright test --workers=1
npm run test:extension
npm run build
unzip -t dist/site/downloads/source-to-recall-gate-chrome.zip
curl -I https://source-to-recall-gate.sociobot.in/downloads/source-to-recall-gate-chrome.zip
```

The last command currently demonstrates the release failure; it must return a successful ZIP
response before this handoff can be marked PASS.
