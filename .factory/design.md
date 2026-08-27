# Visual thesis: The memory press

## Direction and rationale

Source-to-Recall Gate uses a dithered, two-ink editorial print system. A captured
passage begins as a dense block of ink; the gate reduces it into a sharp recall
cue. The visual language borrows from proof sheets, crop marks, overprint, and
halftone screens because this product is about editorial judgment—not automated
card production. Decoration appears only where it explains that compression.

The interface is deliberately single-mode: warm paper is the canvas and the
explicit painted background is essential to the print metaphor. A high-contrast
ink treatment and browser color-scheme metadata keep native controls legible.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F4EEDC` | Page background, like uncoated stock |
| Paper lift | `#FFF9E9` | Editable sheets and elevated panels |
| Ink | `#171713` | Primary text and hard rules |
| Muted ink | `#615D50` | Secondary copy (7.0:1 on paper) |
| Registration red | `#B52A1D` | Primary actions and selected state |
| Deep red | `#7D1C13` | Hover/pressed and readable red text |
| Proof blue | `#125B68` | Focus, links, and informational state |
| Good green | `#285B36` | Complete/export-ready state |
| Warning ochre | `#7A4B00` | Local/offline warnings |
| Danger | `#8B1F1A` | Destructive actions and errors |

No gradients. Surfaces use ink rules, offset shadows, and halftone patterns.
All body/text combinations are designed for at least WCAG AA contrast.

## Type

- Display and labels: `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, then
  system sans-serif. Tight, uppercase proof marks convey editorial decisiveness.
- Reading and input copy: Georgia, `Times New Roman`, serif. It makes source
  passages feel like reading matter rather than app data.
- UI body: Inter-like system stack (`Arial`, `Helvetica`, sans-serif) for clear
  controls without a font download. No third-party or runtime font requests.
- Scale: 14 / 16 / 20 / 28 / 44 / 68 px, fluid at the two largest steps.
  Body is never below 16 px; reading line-height is 1.55.

## Spacing and composition

An 8 px base rhythm with 4 px for tight label relationships. Working widths are
bounded to 72 rem; reading measures to 68 characters. Hard 2 px rules, clipped
corners, numbered steps, and 4 px offset shadows make state and hierarchy clear.
At 390 px, the proof rail collapses, controls stack, and dense metadata yields to
the source and three required decisions. Touch targets are at least 44 px.

## Interaction grammar

- Capture is a physical intake: the saved passage appears at the top of a proof.
- The three encoding fields are a numbered gate. Their countermarks fill as the
  student writes; readiness uses both icon/text and color.
- Export is visually last and stays unavailable until all three decisions exist.
- Discard is always reversible for one action through an undo notice. Delete-all
  names the consequence and requires confirmation.
- Keyboard: context menu or extension command captures; arrows move queue
  selection where provided; `Ctrl/Cmd+Enter` saves an edited proof.

## Motion policy

Only state changes move. New proofs rise 8 px and fade over 180 ms; readiness
marks stamp in at 160 ms; notices enter from their point of origin. Motion uses
only opacity and transform. Under `prefers-reduced-motion: reduce`, transitions
and smooth scrolling become instant. Nothing loops or flashes.

## Original asset plan and provenance

### `press-gate`

- Use: landing-page hero, explaining conversion from source density to a single cue.
- Subject: an abstract tabletop letterpress where a wide paper passage passes
  through three registration gates and exits as one crisp flashcard-sized slip.
- World/materials: uncoated paper, rubber stamp, crop marks, steel press parts,
  coarse halftone dots, slightly imperfect two-color overprint.
- Light/lens: flat editorial studio light, orthographic/isometric composition,
  strong negative space and no photorealistic depth blur.
- Palette words: warm oat paper, soot black, registration red, proof blue.
- Negative list: no people, no hands, no readable text, no letters, no logos,
  no watermark, no gradients, no glossy 3D, no UI mockup, no branded objects.
- Prompt: “Dithered editorial print illustration for a study utility landing
  page. An abstract tabletop letterpress: a wide dense paper strip enters from
  the left, passes through exactly three simple registration gates, and exits
  at right as one small crisp blank flashcard slip. Coarse halftone dots,
  imperfect two-ink overprint, crop marks, uncoated paper and steel press
  textures. Orthographic/isometric framing, flat studio light, strong readable
  silhouette, warm oat paper, soot black, registration red and proof blue.
  No people, no hands, no readable text or letters, no logos, no watermark, no
  gradients, no glossy 3D, no UI screens.”
- Generator: Azure AI Foundry factory image deployment via
  `/opt/fleet/lib/gen-image.sh`; generated 2026-08-27. Original generated asset
  for this product. Source prompt sidecar is stored in `assets/src/`.

The product mark and functional icons are hand-authored SVG/CSS geometry. The
footer discloses that the hero artwork is AI-generated.
