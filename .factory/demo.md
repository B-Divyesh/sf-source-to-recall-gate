# Sample demo

- URL: <https://source-to-recall-gate.sociobot.in/demo/>
- Alternate entry: `/?demo=1` redirects to `/demo/`.
- Local verification URL: <http://127.0.0.1:4173/demo/>

The demo starts with three realistic study passages. Two have a paraphrase,
recall cue, and use-case and are ready to export. The interleaving passage is a
draft so the unfinished state is visible.

Demo captures use `demo:source-to-recall-gate:captures:v1`. A returned or pasted
demo license uses `demo:sb_license:source-to-recall-gate`, and its cached result
uses the same `demo:` prefix. The demo never reads or writes the normal capture
or license keys.

**Reset demo** replaces the demo captures with the original three samples.
**Start for real** removes every demo capture and demo license key before opening
the normal tool. It does not copy the sample or change normal saved passages.

The claim test seeds a normal sentinel passage, edits and resets the demo, exits,
and then checks that the sentinel is unchanged.
