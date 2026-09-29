# Handover — electrician website project

Last updated: 2026-09-29

## Where this is

Requirements-gathering stage. **No website has been designed or built yet.** All work so far
is about getting the client's information out of his head and into a usable brief, because
almost every downstream decision (page structure, local SEO, whether prices are published,
whether he can edit the site himself) depends on answers only he has.

Client: an electrician's company. Referred to below as "the client".

## Client facts already established

Only three answers are in. Everything else is blank and waiting on the intake form.

| Ref | Fact | Consequence |
|---|---|---|
| §11 | **Never had a website.** No domain yet. | Domain needs sourcing and registering. No redirects, no legacy URLs, no existing SEO to preserve, no email-hosting risk at cutover — a clean start. Also means no Google Business Profile history to assume. |
| §14 | **We write the copy, client approves.** | Removes the single most common cause of a stalled build. But it means the About page and the differentiator must be extracted from him verbally — §12 and §14 of the form matter more than usual. |
| §4 | Service lists now carry an "other" free-text on both domestic and commercial. | He flagged that the fixed lists didn't cover everything he does. |

## Files in this repo

| File | What it is |
|---|---|
| `electrician-intake.html` | The fillable web page. Source for the published artifact. 118 questions across 17 sections. |
| `build-intake-form.gs` | Google Apps Script. Run it in script.google.com and it builds the same questionnaire as a real Google Form plus a linked responses spreadsheet. |
| `build-docx.js` | Node script that generates the Word version. `npm install` then `node build-docx.js`. |
| `electrician-build-brief.docx` | The Word version, for emailing or printing. |

**Warning: the question set exists in three separate copies** — inside the HTML, inside the
`.gs`, and inside `build-docx.js`. They drift. A change to one is not a change to the others.
As of this handover the `.docx` is one revision behind: it lacks the two "other" service
fields added on 2026-09-29. Regenerate it with `node build-docx.js` if that matters.

## The three routes to collect answers

All three ask the same questions. They differ only in how the answers come back.

### 1. Published web page (live, shared)

https://claude.ai/artifact/Nm2V51zqZHb3wPzjAozCRk

Sharing is set to **anyone with the link**. The client can open and fill it without an account.
"Can view, not edit" refers to editing the artifact itself, not to using the page — he can
still type, and his draft saves in his own browser.

No submit button. He fills it in, presses **Copy to clipboard**, pastes into an email. Tell him
that explicitly or he will fill in 118 questions and wait for something to happen.

**Editing it:** `electrician-intake.html` in this repo is the source, but editing the file does
not change the live page. Republish explicitly, passing the URL above — a publish without the
URL creates a separate artifact at a new address, orphaning the link the client already has.

### 2. Google Form (best option — answers return automatically)

Not yet created at time of writing; the script was mid-run.

1. script.google.com → New project → paste `build-intake-form.gs` → Save → Run
2. Authorise past the "unverified app" warning (Advanced → Go to project)
3. Execution log prints the form link, the editor link and the responses spreadsheet link.
   The log stays empty until the run **finishes** — `Logger.log` buffers. Expect 1–3 minutes
   for ~135 API calls.
4. Responses tab → ⋮ → **Get email notifications for new responses**
5. Workspace accounts only: Settings → uncheck **Restrict to users in [org]**

Re-running the script builds a **brand new form and sheet** every time. Delete the old ones
from Drive first, or you will end up sending the wrong link.

### 3. Word document

`electrician-build-brief.docx`. Zero setup, email it, he fills and returns it. Most friction
for us, least for him.

## Decisions already made — don't re-open these

- **The web page has no backend and cannot receive answers.** The only mechanism that would
  have returned them automatically is the artifact `db` capability, which forces the artifact
  organization-internal, which means the client cannot open it at all. That is why the return
  path is copy-and-paste. Not an oversight.
- **Nothing is marked required in the Google Form.** Google Forms refuses the whole submission
  while any required field is blank. On a 118-question form filled in over several sittings,
  one unknown licence number would produce an abandoned form. Blockers are flagged visually
  instead — an amber dot on the web page, a leading `*` in the Google Form.
- **Blockers over completeness.** ~28 of the 118 questions genuinely block the build. The form
  tracks those separately from overall progress, and the intro tells him that doing sections
  3, 9, 11 and 14 alone is enough to start.

## The four things that stall builds like this

Carried into the form's intro copy deliberately. Chase these by phone rather than waiting.

1. **No usable job photos** — and no customer permission to publish the ones that exist.
2. **No licence and insurance numbers** — the strongest trust signal on a trade site.
3. **Nobody can log in to the domain.** Not applicable here: there is no domain yet. Instead
   the risk shifts to *registering it in the client's name, not ours* — get that right at
   purchase, it is painful to unwind later.
4. **Nobody decided who writes the copy.** Settled: we do.

## Next actions

1. Finish the Apps Script run, get the form link, turn on email notifications.
2. Send the client one route — the Google Form unless there's a reason not to. Don't send
   three, he'll do none.
3. Source a domain. Check availability against the trading name once §02 comes back. Register
   in the client's name.
4. Everything else waits on answers. Do not start designing pages before §04 (top earners),
   §05 (service areas) and §12 (goal, audience, differentiator) are in — they determine the
   site's structure, not just its content.

## Working on this from a cloud session

Repo: https://github.com/NickNg4/BK-web-design

The published artifact is not part of the repo and is not version-controlled with it. To change
the live page from a fresh session, read the artifact by its URL first, then publish with that
same URL. Changes made to `electrician-intake.html` in git do not reach the live page on their
own, and versions published from elsewhere do not flow back into git. Keep them in step by hand.
