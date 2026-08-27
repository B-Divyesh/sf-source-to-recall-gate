# Source-to-Recall Gate

Source-to-Recall Gate is a local-first browser extension and installable web app
for students who turn highlights into study prompts. It inserts one deliberate
step before Anki or another review queue: explain the passage in your own words,
write the cue that should retrieve it, and name a concrete use-case. Only then
does export become available.

Live site: <https://source-to-recall-gate.sociobot.in>

## What it does

- Captures only text the user selects through a context menu, `Alt + Shift + G`,
  the extension popup, or an explicit paste in the PWA.
- Stores passages and decisions locally (`chrome.storage.local` in the
  extension; `localStorage` in the PWA). No account, cloud sync, tracking, or AI
  card generation.
- Requires a paraphrase, recall cue, and use-case before export.
- Exports each ready prompt as Markdown, CSV, or Anki-compatible TSV.
- Supports offline use after the PWA’s first load and includes clear empty,
  offline, error, undo, and delete-confirmation states.
- Offers an optional $9 one-time Press Pass for batch export and local JSON
  backup/restore. Individual exports, accessibility, and privacy controls remain
  free. Checkout and license verification use only the Sociobot billing API.

## Develop

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev              # PWA/site at the printed local URL
npm run dev:extension    # WXT extension development mode
```

## Test and build

```bash
npm test                 # unit tests
npm run typecheck        # strict TypeScript
npx playwright install chromium  # once, for browser tests
npm run test:e2e         # desktop + 390 px flows and axe checks
npm run build:site       # exact static deploy build, including the MV3 ZIP
npm run test:site-package # built ZIP + static route regression
npm run build            # alias for the exact production build command
```

`npm run build` produces:

- `dist/site/index.html` and the complete static PWA/landing site;
- `dist/site/privacy/index.html` and `dist/site/terms/index.html`;
- `dist/site/downloads/source-to-recall-gate-chrome.zip`, the packaged MV3
  extension.

After publishing, `npm run test:live-download` verifies that the production
download has ZIP headers and byte-matches the archive in `dist/site`.

To inspect the built extension without publishing it, open
`chrome://extensions`, enable Developer mode, choose “Load unpacked,” and select
`.output/chrome-mv3`. Select text on a normal web page, then use the context menu,
toolbar popup, or `Alt + Shift + G`.

## Architecture and privacy

The stack is WXT + TypeScript for the extension and Vite + vanilla TypeScript
for the static PWA. The two surfaces share validation, storage, export, and
license modules in `src/`. There are no runtime packages, remote fonts, CDN
scripts, analytics, or backend storage.

The extension requests `storage`, `contextMenus`, `activeTab`, `scripting`, and
access to the Sociobot license-verification endpoint.
Active-page access is used only following the user’s capture action to read the
current selection. See [`site/privacy/index.html`](site/privacy/index.html) for
the published policy.

The visual system and generated-image provenance are documented in
[`.factory/design.md`](.factory/design.md). The source code is MIT licensed.
