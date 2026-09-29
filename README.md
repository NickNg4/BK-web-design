# BK Web Design — electrician site

Client intake material for an electrician's company website. The site itself does not exist
yet; this repo holds the questionnaire used to gather what's needed to build it.

Start with [HANDOVER.md](HANDOVER.md) — project state, client facts, decisions and next actions.

## Contents

| File | Purpose |
|---|---|
| `electrician-intake.html` | Fillable web page — 118 questions, 17 sections. Source for the published page. |
| `build-intake-form.gs` | Google Apps Script that builds the same questionnaire as a Google Form. |
| `build-docx.js` | Generates the Word version. |
| `electrician-build-brief.docx` | Word version, for email or print. |

## Regenerating the Word document

```bash
npm install
node build-docx.js
```

## Building the Google Form

Paste `build-intake-form.gs` into a new project at [script.google.com](https://script.google.com),
save, and run `buildIntakeForm`. It prints the form link, the editor link and the responses
spreadsheet link once the run completes. Full steps and gotchas are in HANDOVER.md.

## Note

The question set is duplicated across the HTML, the `.gs` and `build-docx.js`. Changing one does
not change the others.
