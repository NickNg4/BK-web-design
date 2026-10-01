# BK Web Design — BK Electrician

Website project for BK Electrician, an electrical contractor in Victoria, Australia. Two parts:

- **The intake questionnaire** — gathers what is needed to build the site, in three formats.
- **The website** — in [`website/`](website/README.md): a complete sample site with
  placeholders for every business detail, photo and the logo, ready to fill in and launch.

Start with [HANDOVER.md](HANDOVER.md) — project state, client facts, the domain, decisions and
next actions.

## The questionnaire

`questions.js` is the only place a question is defined. Everything the client sees is generated
from it, so the three formats cannot say different things.

```
questions.js ──┬─ build-html.js ─→ electrician-intake.html   (+ intake-template.html)
               ├─ build-gs.js   ─→ build-intake-form.gs
               └─ build-docx.js ─→ electrician-build-brief.docx
```

| File | Purpose |
|---|---|
| `questions.js` | **The questions.** 14 sections, 78 questions, 22 flagged as build blockers. Edit this. |
| `intake-template.html` | Chrome, styling and page logic for the web page. Edit this for how the page *behaves*. |
| `electrician-intake.html` | Generated. The fillable web page, and the source for the published link. |
| `build-intake-form.gs` | Generated. Paste into script.google.com to build the Google Form. |
| `electrician-build-brief.docx` | Generated. Word version, for email or print. |
| `verify.js` | Checks the three generated formats still agree with `questions.js`. |

## Working on it

```bash
npm install
npm run check        # questionnaire: rebuild all three formats, then verify they agree
npm run build:site   # website: build website/dist and list what is still a placeholder
npm run test:site    # website: check every page in a real browser
```

Questionnaire steps individually: `npm run build`, `npm run verify`.

Do not edit the generated files by hand — the next build overwrites them, and `verify.js` will
fail in the meantime.

## Building the Google Form

Paste `build-intake-form.gs` into a new project at [script.google.com](https://script.google.com),
save, and run `buildIntakeForm`. It prints the form link, the editor link and the responses
spreadsheet link once the run completes. Full steps and gotchas are in HANDOVER.md.

## Two things that have bitten before

**The published web page is not built by `npm run build`.** Publishing is a separate manual step,
and it has to go to the artifact URL the client already has or their link stops working. See
HANDOVER.md.

**The question set used to be hand-maintained in three copies.** They drifted, and the web page
silently lost three whole sections and most of a fourth — 37 questions, 14 of them blockers —
without anything complaining. That is what `questions.js` and `verify.js` exist to prevent. Run
`npm run verify` before sending anything to the client.
