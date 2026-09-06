# Review 1: Turn selected passages into recall prompts

## Verdict: FAIL

- Findings: **7** — 3 P1, 3 P2, 1 P3
- Untested public claims: **7**
- Live URL: <https://source-to-recall-gate.sociobot.in>
- Reviewed: 2026-09-06 UTC
- Implementation candidate: `c4a0d32d6ee85f47b218fdf3a50a362bd124d942`
- Documentation reviewed: `8f6f30cc5c25958cec191d459b5481a1f09be9ab`

Commits after `c4a0d32` change tests and reports only. They do not change the
runtime product. A fresh build at the documentation commit byte-matched the
deployed HTML, JavaScript, CSS, service worker, and manifest. The downloaded
extension matched the local archive by canonical content digest.

## Job, audience, and first action before scrolling

- Job shown: turn a selected passage into a recall cue by writing a paraphrase,
  a cue, and a use-case before export.
- Intended audience: students converting reading highlights into study
  prompts. The first screen does not say this.
- First action shown: **Try the local gate**. It scrolls to an empty form. It
  does not load sample data.

On a 390 × 844 phone, the headline, description, both actions, and three short
facts are visible before scrolling. On a 1440 × 900 desktop, the three facts
begin below the viewport at 910 px. Fresh screenshots are in
`/work/.evidence/screens/desktop-first-screen.png` and
`/work/.evidence/screens/phone-first-screen.png`.

## Findings

### P1 — The required one-click sample and isolated demo do not exist

There is no **Try it with sample data** action. Clicking **Try the local gate**
leaves an empty queue and empty passage field. Neither `/demo` nor `/?demo=1`
starts a demo; both return the normal home page. There is no realistic sample,
no “Demo — sample data, nothing is saved” label, no **Reset demo**, and no
**Start for real** action. `.factory/demo.md` is also absent.

Isolation fails as a direct consequence. In a disposable browser context, I
seeded one sentinel record in the normal
`source-to-recall-gate:captures:v1` key and opened `/?demo=1`. The page displayed
that record and reported one queue item. It used the normal key and created no
`demo:` namespace. This proves that the advertised demo entry pattern would
read real local data rather than isolate it.

### P1 — The advertised $9 purchase cannot start

The live **Buy Press Pass — $9** link points to the required product-scoped
Sociobot endpoint, but a fresh GET returned HTTP 404 on 2026-09-06. A visitor
cannot buy the advertised one-time pass or reach the paid batch export and
backup tools. The product's invalid-license verification endpoint separately
returned HTTP 200 with `valid: false`, so the failure is specific to checkout.

### P1 — Public claims are not registered, and seven remain untested

`.factory/claims.json` is missing, so there are no declared claim commands and
no tests tagged `@claim:<id>`. This violates the required claim-to-test mapping
even where ordinary unit or browser tests happen to cover a promise.

Independent checks covered local storage and outbound requests, the
three-decision gate, all three individual export formats, offline reload,
validation, persistence, undo, deletion, and archive delivery. These seven
public claims still lack end-to-end evidence from a clean claim sandbox:

1. Capture through the native context-menu item.
2. Capture through `Alt + Shift + G`.
3. Capture through the toolbar popup.
4. Successful checkout return and valid Press Pass activation.
5. Paid batch export.
6. Paid backup download.
7. Paid backup restore.

The live MV3 archive was installed in a fresh Chromium profile. Its worker,
options page, manual passage flow, and CSV export worked. A headless attempt to
invoke `Alt + Shift + G` did not open the options page. Native toolbar and
context-menu gestures are not exposed by the available browser automation.
That limitation is evidence missing from the product, not grounds for a pass.

### P2 — The first screen does not meet the plain-words contract

The title is `Source-to-Recall Gate — remember less, better`; it does not name
the job. The headline says “Earn the recall cue,” which is metaphorical. The
description does not name students or their study situation. The primary
action is not the required sample action, and the three facts fall below the
first desktop viewport. Other headings such as “The queue-debt rule,” “Working
proof,” “Opening the local press,” and “Privacy, in plain ink” also use product
lore instead of direct section names. The required `.factory/copy-audit.md` is
absent.

### P2 — Required route and metadata structure is incomplete

An unknown path and `/404.html` both return HTTP 200 and render the home page.
There is no designed 404 response, status, or way to identify the missing page.
This is a defect because the required 404 structure is absent; an intentional
HTTP 404 would have been expected.

The home page also has no canonical URL, Open Graph metadata, Twitter card, or
Apple touch icon. `/demo` has neither a demo-specific title nor demo content.
The header has no Demo or Privacy link, and the footer has no version/build id.
Privacy and Terms themselves return 200, have route-specific titles, one `h1`,
one `main`, and no Axe violations. All same-origin links found on the home page
returned 200.

### P2 — Important interface text is below the 16 px baseline

The live page renders the three privacy facts at 12 px, form labels and license
state at 13 px, and field limits at 12 px on both desktop and phone. These are
instructions and state, not decorative text. This conflicts with the stated
16 px body-text minimum and makes the compact phone workbench harder to read.
Automated contrast checks passed, but they do not test this size requirement.

### P3 — The prior development dependency finding remains open

`npm ci` still reports 14 development/build-tool advisories: 5 moderate, 5
high, and 4 critical. Direct affected tools include Vitest and WXT; production
dependencies remain at zero advisories. This is the same minor finding recorded
in verification 4 and is not fixed.

## Product and recovery checks

The free workflow works on live desktop and phone in fresh contexts:

- A realistic learning-science passage was added, completed, and exported as
  Markdown, CSV, and Anki TSV. The output contained the cue, paraphrase,
  use-case, source passage, and source title.
- Visible decisions were saved during export and survived reload.
- Two-character input produced “Select or paste a passage with at least 3
  characters,” then accepted corrected input.
- Exactly 4,000 passage characters were accepted. The input control prevents
  entry beyond that boundary, and the model rejects a forced 4,001 characters.
- A duplicate produced a clear error. Discard, Undo, delete confirmation,
  cancel, and confirmed deletion all behaved correctly.
- The delete dialog moved focus to **Keep my passages**. Keyboard Tab order was
  usable and every sampled focus state had a 3 px blue outline.
- A 390 px viewport and a 640 px reflow check had no horizontal overflow.
- Reduced motion changed transitions and animations to 0.01 ms.
- Axe found zero violations on desktop, phone, Privacy, Terms, `/demo`, and the
  unknown route. The supplied URL verifier passed with no console errors.

No real user data was read or changed. All state tests used fresh disposable
browser contexts. Free-flow requests stayed on the product origin. The only
off-origin request made by the reviewer was to the product's own Sociobot
license and checkout endpoints; no study content or credentials were sent.

## Offline, update, delivery, and performance

- The active service worker controlled a fresh page with cache
  `source-to-recall-gate-v2`; no worker was waiting or installing after an
  update check.
- After network access was disabled, the offline notice appeared and a reload
  kept the complete capture interface usable.
- The live extension download returned 200, `application/zip`, attachment
  disposition, and immutable one-year caching. `unzip -t` passed.
- `npm run test:live-download` passed with canonical digest
  `13fde70ecc8517b9398b01535c416fd989e8c8199731ed89ae49b10d65ab2805`.
- Live security headers include CSP with a narrow Sociobot connection rule,
  HSTS, `nosniff`, strict referrer policy, COOP, Permissions Policy, and frame
  denial.
- Mobile Lighthouse completed with Performance 100, Accessibility 100, Best
  Practices 100, and SEO 100. FCP was 0.98 s, LCP 1.22 s, TBT 68 ms, and CLS 0.
- The build emits 22.96 KB initial JavaScript and 19.31 KB CSS, both within the
  stated budgets.

This is a static PWA and browser extension. Backend tenant isolation, server
restart persistence, health checks, and HTTP 429 behavior do not apply.

## Clean-checkout commands

The documented prerequisite was installed with `npm ci` under Node 22.23.2 and
npm 10.9.8. Results:

```text
npm ci                          PASS (14 dev/build advisories reported)
npm test                        PASS (14/14)
npm run typecheck               PASS
npm run build                   PASS
npm run test:e2e                PASS (8 passed, 2 project-specific skips)
npm run test:site-package       PASS
npm run test:extension          PASS on a clean serial rerun
npm run test:live-download      PASS
npm audit --omit=dev --json     PASS (0 production advisories)
verify-url.sh <url> <evidence>  PASS
```

No claim command could be run because `.factory/claims.json` does not exist.
The standalone Axe CLI could not locate the preinstalled Chromium binary; the
repository's pinned `@axe-core/playwright` 4.10.2 integration was run directly
against every audited live route and found zero violations.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1: live ZIP returned home HTML | Fixed. Live ZIP is valid and matches the candidate. |
| Verification 1: export enabled before unsaved decisions could export | Fixed. Export saves visible decisions first and persists them. |
| Verification 1: security headers and immutable asset caching missing | Fixed on live responses. |
| Verification 2: live ZIP returned 404 | Fixed. It returns 200 `application/zip`. |
| Verification 3: raw ZIP byte comparison failed on timestamps | Fixed. Canonical content comparison passes and detects extra entries. |
| Verification 4: 14 development dependency advisories | Open. Recorded as P3 above. |
| Verification 4: native extension gestures unautomated | Open. Counted among the seven untested claims above. |

Because findings and untested claims remain, this review cannot declare PASS.
