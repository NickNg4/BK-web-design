# BK Electrician — website

A complete static website for BK Electrician, built from one content file. Every business
detail, photo and logo is a placeholder until the real one is supplied.

```
content.js ─ build.js ─→ dist/     (upload this folder to any host)
             src/site.css, src/site.js
```

## Pages

Home · Services · four service pages (rental safety checks, switchboard upgrades, EV
chargers, emergency) · Areas we cover · About · Contact · Thank you · Privacy · 404 — plus
`sitemap.xml`, `robots.txt` and a favicon.

Mobile-first, with a sticky call button on phones. No frameworks, no build dependencies,
works from any host or straight off the disk.

## Filling it in

Everything the site says is in **`content.js`**. Anything in `[square brackets]` is a
placeholder: it shows highlighted on the page, and the build lists every one left.

```bash
node website/build.js        # or: npm run build:site
```

- **Each fact is typed once.** Copy uses `{region}`, `{rec}`, `{phone}` and similar, filled
  from `business`. A mistyped token fails the build.
- **Photos.** Each placeholder image describes the shot it needs, so they double as the shot
  list. Put files in `images/` and set `src` in `photos`. `src: false` drops a slot and the
  layout closes up.
- **Logo.** Put the file in `images/` and set `business.logo`. Until then the header uses a
  plain wordmark.
- **No Google reviews yet?** Set `google.rating` to `''` and every mention disappears. Same
  for `reviews: []` and `memberships: []`.
- **No after-hours work?** Set `emergency.offered: false`; the emergency page and every
  mention of it go.

### Sample mode, and why it matters

Until every placeholder is filled, every photo is in, and the form is connected, the site
marks itself as a **sample**: a banner on every page, `noindex` on every page, and a
`robots.txt` that blocks search engines. A half-finished site cannot end up in Google with
`[0400 000 000]` as the phone number.

When the last one is done, the build says `LAUNCH-READY` and all three switch off on their
own. The build also refuses to finish if a placeholder has been typed straight into
`build.js`, where the report could not see it.

## Checking it

```bash
npm run test:site
```

Opens every page in a real browser at desktop and phone width and checks: no script
errors, no sideways scrolling, one `<h1>` per page, alt text, every image actually loaded,
every internal link and `#anchor`, the phone menu, the form's validation, the contrast of
every placeholder marker, and copy that has been wrong before. Needs Chromium —
`npx playwright install chromium`, or set `CHROMIUM_PATH`.

## Going live

1. **Domain** — register it in the **client's** name, against his ABN (see HANDOVER.md).
   If it is not `bkelectrician.com.au`, change `site.url` in `content.js`.
2. **Form** — set `form.provider` to `'netlify'` (no set-up if hosted on Netlify) or to
   `'formspree'` with `form.endpoint`. Formspree's free plan does not take photos: set
   `allowPhotos: false` if using it.
3. **Host** — upload `dist/` to Netlify (drag and drop, or connect the repo with build
   command `node website/build.js` and publish directory `website/dist`). Cloudflare Pages
   or any web host works the same way. HTTPS is automatic on both.
4. **Point the domain** at the host, using the DNS records the host gives you.
5. **Email** — there is no email on the domain yet. Set it up (Google Workspace, Microsoft
   365, or the registrar's own) before printing the address on the van.

## Rules this site follows

These are Victorian requirements, checked against Energy Safe Victoria and Consumer Affairs
Victoria. Keep them if the design changes.

- **REC number on all advertising.** A Registered Electrical Contractor must show its REC
  number on any advertising — it is in the header and footer of every page.
- **Certificates of Electrical Safety** are required for all electrical installation work.
  Prescribed work — switchboards, consumer mains, meter boxes, main earthing, solar and
  batteries — must also be independently inspected by a Licensed Electrical Inspector.
- **Rental safety checks.** From 13 October 2026 every Victorian rental needs gas and
  electrical safety checks every two years, not just leases signed since 29 March 2021.
  The electrical check follows section 4 of AS/NZS 3019. The site leads with this; set
  `home.notice` to `null` once it is old news.
- **Fallen powerlines** — ESV's advice is to stay at least eight metres away and call 000.
  Used as-is on the emergency page.

## Revisit when the brief comes back

The structure is a starting point. The answers that should change it:

- **§04 — top earners.** Which services get their own page (`page: true`). The four here
  are a guess based on what pays in Victoria right now.
- **§12 — the differentiator.** Goes in `home.why` — it is the one point on the home page
  that is still entirely a placeholder.
- **Service areas.** No longer asked in the questionnaire, so get the suburb list by phone.
  Twenty named suburbs beat a radius.
