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
| §4 | Service lists carry a free-text catch-all on both domestic and commercial. | He flagged that the fixed lists didn't cover everything he does. |

## The questionnaire

**14 sections, 78 questions, 22 of them flagged as build blockers.**

This is the shorter questionnaire, set to match the copy the client supplied on
2026-09-29. A longer 115-question version — adding service areas, domain and email,
budget and sign-off, and the rest of "The words" — is in git history at `9d7fbe0`.
Restore from there rather than retyping if it is ever wanted back.

`questions.js` is the only place a question is defined. The three formats the client might
fill in are generated from it — see README.md for the file map and the build commands.

This was not always true, and it caused a real problem. Read the next section before touching
anything.

### What went wrong on 2026-09-29, and what now stops it

The question set used to be hand-maintained in three separate copies — inside the HTML, inside
the `.gs`, and inside `build-docx.js`. They drifted, silently. By the time anyone counted:

- **§05 (service areas), §11 (domain and email) and §16 (budget, dates, sign-off) were gone
  from the web page entirely.**
- §14 "The words" was down to 1 of its 4 questions, and had lost its `why` line, so the page
  rendered the literal string **"undefined"** under that heading.
- §17 was down to 1 of 3 questions and mis-numbered `"5"`, so it sat between §04 and §06.
- The intro told the client *"if you only do four sections, do 3, 9, 11 and 14"* while §11 was
  not on the page at all.

That is 37 questions, 14 of them blockers — including the service areas and the differentiator
that decide the site's structure, not just its content. The published page the client has the
link to was byte-identical to the repo copy, so it was broken in exactly the same way. Nobody
would have found out until the answers came back with three sections missing.

Fixed by generating all three formats from `questions.js`, and by `verify.js`, which counts the
questions back out of each built file and fails if they disagree. It is checked against four
mutations, including this exact bug.

**So: add a question in `questions.js`, run `npm run check`, and never edit a generated file.**

Two counts that were wrong in earlier notes, in case they are quoted anywhere else: the header
of the `.gs` claimed 95 questions and an earlier version of this document claimed 118. Both were
stale. The real figures are in `questions.js` and are printed by every build.

## The three routes to collect answers

All three ask the same questions. They differ only in how the answers come back.

### 1. Published web page (live, shared)

https://claude.ai/artifact/Nm2V51zqZHb3wPzjAozCRk

Sharing is set to **anyone with the link**. The client can open and fill it without an account.
"Can view, not edit" refers to editing the artifact itself, not to using the page — he can
still type, and his draft saves in his own browser.

No submit button. He fills it in, presses **Copy to clipboard**, pastes into an email. Tell him
that explicitly or he will fill in 78 questions and wait for something to happen.

**Editing it:** `electrician-intake.html` is the source, but `npm run build` does not touch the
live page. Republishing is a separate, manual step, and it must pass that URL — a publish
without it creates a separate artifact at a new address, orphaning the link the client has.

The field storage keys are stable, so republishing does not throw away a draft the client has
already started. Renaming a `k` in `questions.js` would; don't.

### 2. Google Form (best option — answers return automatically)

Not yet created. The script is ready and verified as far as it can be without running it:
it parses, every Forms API call in it is a real one, and its question set matches the source.

1. script.google.com → New project → paste `build-intake-form.gs` → Save → Run
2. Authorise past the "unverified app" warning (Advanced → Go to project)
3. Execution log prints the form link, the editor link and the responses spreadsheet link.
   The log stays empty until the run **finishes** — `Logger.log` buffers. Expect 1–3 minutes
   for ~92 items.
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
  while any required field is blank. On a 78-question form filled in over several sittings,
  one unknown licence number would produce an abandoned form. Blockers are flagged visually
  instead — an amber dot on the web page, a leading `*` in the Google Form.
- **Blockers over completeness.** 22 of the 78 questions genuinely block the build. The form
  tracks those separately from overall progress, and the intro tells him that doing sections
  3, 9 and 14 alone is enough to start.
- **The sections the intro points at are derived, never typed.** `questions.js` exports
  `priorityPhrase()`, filtered against the sections that actually exist, and all three formats
  use it. The page used to tell the client to fill in section 11 after section 11 had been
  removed from it; that is now impossible, and `verify.js` fails if the intro names a section
  that is not there.
- **The free-text catch-alls are questions of their own** in this version (`schemes_other`,
  `svc_dom_other`, `svc_com_other`), matching the supplied copy. `questions.js` also supports
  attaching one to its list with `other: true`, which is what the 115-question version used.

## The four things that stall builds like this

Carried into the form's intro copy deliberately. Chase these by phone rather than waiting.

1. **No usable job photos** — and no customer permission to publish the ones that exist.
2. **No licence and insurance numbers** — the strongest trust signal on a trade site.
3. **Nobody can log in to the domain.** Not applicable here: there is no domain yet. Instead
   the risk shifts to *registering it in the client's name, not ours* — get that right at
   purchase, it is painful to unwind later.
4. **Nobody decided who writes the copy.** Settled: we do.

## Next actions

1. Run the Apps Script, get the form link, turn on email notifications.
2. Send the client one route — the Google Form unless there's a reason not to. Don't send
   three, he'll do none.
3. Source a domain. Check availability against the trading name once §02 comes back. Register
   in the client's name.
4. Everything else waits on answers. Do not start designing pages before §04 (top earners)
   and §12 (goal, audience, differentiator) are in — they determine the site's structure, not
   just its content.
5. **This version does not ask for the service areas, the domain and email details, or the
   budget and sign-off.** Those sections were dropped to match the supplied copy. The towns he
   covers decide whether there are location pages at all, and email hosting decides whether
   pointing the domain breaks his mail — so get both by phone, or restore those sections from
   `9d7fbe0`.

## Working on this from a cloud session

Repo: https://github.com/NickNg4/BK-web-design

The published artifact is not part of the repo and is not version-controlled with it. To change
the live page from a fresh session, read the artifact by its URL first, then publish with that
same URL. Changes made to `electrician-intake.html` in git do not reach the live page on their
own, and versions published from elsewhere do not flow back into git. Keep them in step by hand.
