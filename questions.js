/**
 * Electrician website intake — THE question set.
 * ==============================================
 *
 * This file is the single source of truth. Nothing else defines a question.
 *
 *   node build-html.js   -> electrician-intake.html   (the fillable web page)
 *   node build-gs.js     -> build-intake-form.gs      (paste into script.google.com)
 *   node build-docx.js   -> electrician-build-brief.docx
 *   node verify.js       -> checks all three still agree with this file
 *
 * 14 sections, 78 questions, 22 of them flagged as build blockers.
 *
 * This is the shorter questionnaire, matching the copy supplied on 2026-09-29.
 * A longer 115-question version exists in git history at 9d7fbe0 — it adds
 * service areas, domain and email, budget and sign-off, and the rest of "The
 * words". Restore from there rather than retyping if it is ever wanted back.
 *
 * FIELD SHAPE
 *   k          storage key. NEVER change one once the page is live — the client's
 *              draft is kept in their own browser under these keys, so renaming a
 *              key throws away whatever they had typed into it.
 *   t          text | area | tel | email | url | one (pick one) | many (pick any)
 *   r          true means this genuinely blocks the build. Shown as an amber dot on
 *              the web page and a leading "*" in the Google Form.
 *   label      the question itself.
 *   hint       the "why we are asking" line under it. Optional.
 *   ph         placeholder / example answer. Optional. Use \n for multi-line.
 *   opts       choices. Required for `one` and `many`, ignored otherwise.
 *   other      `many` only — adds a free-text catch-all to the same question,
 *              stored under k + "_other". Not used in this version, which asks
 *              the catch-alls as questions of their own instead.
 *   otherLabel / otherPh   wording for that catch-all. Optional.
 *
 * NOTHING IS MARKED REQUIRED in the Google Form on purpose — Forms refuses the
 * whole submission while any required answer is blank, so one unknown licence
 * number would produce an abandoned form. `r` flags blockers visually instead.
 * See HANDOVER.md.
 */

const SECTIONS = [
  {
    id: "s1", n: "01", title: "Where you operate",
    why: "Decides which licensing bodies, tax display, privacy law and consumer-rights notices apply. Everything below hangs off this.",
    fields: [
      { k: "country", t: "text", r: true, label: "Country", ph: "Australia" },
      { k: "region", t: "text", r: true, label: "State and area", ph: "Victoria — Melbourne's south-east" },
    ],
  },

  {
    id: "s2", n: "02", title: "The business on paper",
    why: "Goes in the footer, the legal pages and every directory listing. It has to match your other records letter for letter.",
    fields: [
      { k: "legal_name", t: "text", r: true, label: "Registered business or company name, and ABN", ph: "BK Electrician Pty Ltd — ABN 12 345 678 901" },
      { k: "trading_name", t: "text", r: true, label: "Trading name customers actually say", ph: "BK Electrician" },
      { k: "tax_display", t: "one", r: true, label: "Prices on the site should read…", opts: ["Including GST", "Excluding GST", "No prices on the site at all"] },
      { k: "reg_address", t: "area", label: "Registered business address" },
      { k: "founded", t: "text", label: "Year you started", ph: "2011" },
      { k: "owner", t: "text", label: "Owner or director names, spelled as you want them printed" },
      { k: "headcount", t: "text", label: "Who's on the books", ph: "3 electricians, 1 apprentice, 1 in the office" },
    ],
  },

  {
    id: "s3", n: "03", title: "Licences, insurance, memberships",
    why: "The single strongest trust signal on an electrician's site. A visitor deciding between you and a rival looks for these before they look at anything else.",
    fields: [
      { k: "licence_no", t: "text", r: true, label: "REC number and A-grade licence number", hint: "Your REC number has to appear on the website — Energy Safe Victoria requires it on all advertising." },
      { k: "licence_body", t: "text", r: true, label: "Who issued it", ph: "Energy Safe Victoria" },
      { k: "licence_expiry", t: "text", label: "Renewal or expiry date", ph: "March 2027" },
      { k: "schemes", t: "many", label: "Schemes and trade bodies you're a member of",
        opts: ["Master Electricians Australia", "NECA", "Solar installer accreditation (SAA / CEC)", "Housing Industry Association (HIA)", "Master Builders Victoria", "Other"] },
      { k: "schemes_other", t: "text", label: "Anything not on that list" },
      { k: "quals", t: "many", label: "Qualifications worth putting on the page",
        opts: ["A-grade electrician's licence", "Licensed Electrical Inspector (LEI)", "Solar & battery installer accreditation", "EV charger manufacturer training", "Registered cabler (data & phone)", "Refrigerant handling licence (ARCtick)", "Other"] },
      { k: "ins_pl", t: "text", r: true, label: "Public liability — cover amount and insurer", ph: "$20m, CGU" },
      { k: "ins_el", t: "text", label: "WorkCover (WorkSafe Victoria) — if you employ staff" },
      { k: "ins_pi", t: "text", label: "Professional indemnity — cover amount" },
      { k: "tickets", t: "many", label: "Tickets and safety training",
        opts: ["White Card (construction induction)", "EWP licence", "Working at heights", "Asbestos awareness", "Confined space", "First aid / CPR", "Low voltage rescue (LVR)", "Test & tag"] },
    ],
  },

  {
    id: "s4", n: "04", title: "What you actually do",
    why: "Your top earners get a page each — that's where the enquiries come from. The rest get a line on a list.",
    fields: [
      { k: "svc_dom", t: "many", label: "Domestic work",
        opts: ["Full and partial rewires", "Switchboard upgrades", "Safety switch (RCD) installation", "Rental electrical safety checks", "Pre-purchase electrical inspections", "Fault finding", "Power points & USB outlets", "Indoor lighting & downlights", "Garden & outdoor lighting", "EV charger install", "Solar & battery storage", "Smart home / automation", "CCTV & alarms", "Data & TV points", "Kitchen & bathroom electrics", "Split-system air-con (electrical side)", "Ceiling & exhaust fans", "Smoke alarms", "New builds & extensions (rough-in & fit-off)", "Hot water systems & cooktops"] },
      { k: "svc_dom_other", t: "area", label: "Other domestic work — anything not on that list", ph: "Pool pumps, doorbells and intercoms, sheds and granny flats…" },
      { k: "svc_com", t: "many", label: "Commercial and industrial work",
        opts: ["Commercial electrical inspections", "Emergency & exit lighting testing", "Three-phase work", "Shop & office fit-outs", "Machinery & control panels", "Distribution boards", "Data & comms rooms", "Real estate & property manager work", "Planned maintenance contracts", "Workplace test & tag", "Car park & security lighting", "Generators & UPS"] },
      { k: "svc_com_other", t: "area", label: "Other commercial or industrial work — anything not on that list", ph: "Shop signage supplies, cool room isolators, EV fleet charging…" },
      { k: "svc_top", t: "area", r: true, label: "Your top three to five earners, best first", ph: "1. Switchboard upgrades\n2. EV chargers\n3. Rental safety checks\n4. Full rewires" },
      { k: "svc_never", t: "area", label: "Jobs you do NOT want the phone ringing about", hint: "Just as valuable. Every wasted call costs you twenty minutes.", ph: "Pool pumps. Appliance repairs. Jobs under $150." },
      { k: "emergency", t: "one", label: "Emergency callout",
        opts: ["24/7, genuinely", "Evenings and weekends", "Business hours only", "No emergency work"] },
      { k: "emergency_promise", t: "text", label: "Response time you'd put in writing (in average)", ph: "On site within 2 hours across the south-east suburbs" },
      { k: "ev_status", t: "one", label: "EV chargers — approval status",
        opts: ["Manufacturer approved / certified", "I install them, no formal approvals", "Don't do EV work"] },
      { k: "ev_brands", t: "text", label: "Brands you're approved or certified for", ph: "Tesla, Zappi, Wallbox, Schneider, ABB" },
    ],
  },

  {
    id: "s5", n: "5", title: "What you want to be found for",
    why: "The phrases people type, not the ones you'd use in the trade. Nobody searches \"domestic electrical contracting solutions\".",
    fields: [
      { k: "seo_terms", t: "area", label: "Exactly what you want to come up for", ph: "electrician Dandenong\nEV charger installer Melbourne\nemergency electrician near me\nrental safety check Berwick" },
    ],
  },

  {
    id: "s6", n: "06", title: "Money",
    why: "Published prices filter out tyre-kickers before they ring. Hidden prices get more calls, more of them wasted. Your call — but decide it deliberately.",
    fields: [
      { k: "price_show", t: "one", r: true, label: "Do we publish prices?",
        opts: ["Yes — show everything", "Some — fixed-price jobs only", "No — quote on request"] },
      { k: "price_callout", t: "text", label: "Call-out fee" },
      { k: "price_hour", t: "text", label: "Hourly rate" },
      { k: "price_day", t: "text", label: "Day rate" },
      { k: "price_min", t: "text", label: "Minimum charge" },
      { k: "price_ooh", t: "text", label: "Out-of-hours and emergency rate" },
      { k: "price_fixed", t: "area", label: "Fixed-price jobs you're happy to see in print", ph: "Rental safety check: $180\nSwitchboard upgrade: $1,800\nEV charger, standard install: $1,200" },
      { k: "price_quote", t: "one", label: "Quotes",
        opts: ["Free, always", "Free inside my area", "Chargeable, refunded against the job", "Chargeable"] },
      { k: "price_pay", t: "many", label: "How customers can pay",
        opts: ["Bank transfer", "Card", "Cash", "Direct debit", "Afterpay / buy now, pay later", "Finance / pay monthly", "Trade account"] },
      { k: "price_deposit", t: "text", label: "Deposit terms", ph: "30% up front on jobs over $1,000" },
    ],
  },

  {
    id: "s7", n: "07", title: "How people reach you",
    why: "On a phone the call button is the whole website. Everything else is there to make someone press it.",
    fields: [
      { k: "phone_main", t: "tel", r: true, label: "Main phone number" },
      { k: "phone_emerg", t: "tel", label: "Emergency or out-of-hours number" },
      { k: "email_main", t: "email", r: true, label: "Main email address" },
      { k: "hours", t: "area", r: true, label: "Contact hours", ph: "Mon–Fri 7.30am–5.30pm\nSat 8am–1pm\nSun emergencies only" },
      { k: "who_answers", t: "text", label: "Who picks up the phone and watches the inbox" },
      { k: "response_time", t: "text", label: "How fast do you reply to an emailed enquiry, realistically?", hint: "We'll put your real number on the page. A promise you can keep beats a better-sounding one you can't." },
    ],
  },

  {
    id: "s8", n: "08", title: "Your look",
    why: "The site should be recognisably the same outfit as the van that pulls up. Matching them is free and does a lot of work.",
    fields: [
      { k: "logo_files", t: "one", r: true, label: "Logo files you can send", hint: "A vector file (.svg, .ai, .eps) stays sharp at any size. A logo lifted off a JPG goes fuzzy the moment it's enlarged.", opts: ["I have the vector files", "Only a JPG or PNG", "No logo yet"] },
      { k: "brand_colors", t: "text", label: "Your colours", ph: "Van is navy with lime green lettering" },
      { k: "van_photos", t: "one", label: "Photos of the van signwriting and uniform", opts: ["Yes, can send", "No"] },
    ],
  },

  {
    id: "s9", n: "09", title: "Photos and video",
    why: "The commonest reason one of these builds stalls. Real photos of your own work outsell stock images by a distance — visitors can tell, even if they can't say how.",
    fields: [
      { k: "photos_job", t: "one", r: true, label: "Before-and-after job photos", opts: ["Plenty, decent quality", "A handful of phone shots", "None"] },
      { k: "photos_perm", t: "one", r: true, label: "Do you have the customer's permission to publish those photos?", hint: "Inside someone's home, you need it. A one-line text asking is usually enough — keep the reply.",
        opts: ["Yes, for all of them", "For some", "Haven't asked", "Not relevant — commercial only"] },
      { k: "photos_team", t: "one", label: "Photos of you and the team", hint: "A real face beats a stock model every time. It doesn't need to be a studio shot.", opts: ["Yes", "No", "Happy to get some taken"] },
      { k: "photos_van", t: "one", label: "Van or fleet photos", opts: ["Yes", "No"] },
      { k: "photos_video", t: "one", label: "Video footage", opts: ["Have some", "Would film some", "None"] },
      { k: "photos_plan", t: "one", r: true, label: "If the photos are thin, what's the plan?", hint: "Decide now rather than at launch. A half-day with a photographer usually pays for itself.",
        opts: ["Book a photographer", "I'll shoot on my phone to a brief", "Use stock images", "Not decided"] },
    ],
  },

  {
    id: "s10", n: "10", title: "Proof of your work",
    why: "Claims about quality persuade nobody. Named customers, real jobs and a written guarantee do.",
    fields: [
      { k: "gbp_link", t: "url", label: "Google Business Profile link" },
      { k: "reviews_other", t: "area", label: "Other review profiles", ph: "hipages, Oneflare, ServiceSeeking, Airtasker, Facebook — paste the links" },
      { k: "reviews_count", t: "text", label: "Roughly how many reviews, and the average score", ph: "84 reviews, 4.9" },
      { k: "testimonials", t: "area", label: "Testimonials you're allowed to publish", hint: "Quote, first name, town. A specific one about a difficult job beats five saying \"great service\".", ph: "\"Found a fault two other sparkies had missed.\" — Dave, Frankston" },
      { k: "casestudies", t: "area", r: true, label: "Three to six jobs worth writing up properly", hint: "For each: what was wrong, what you did, what it cost or saved them. These become the pages that win the bigger work.", ph: "1950s weatherboard in Cheltenham — ceramic fuses, no safety switches. New switchboard and rewire over 3 days…" },
      { k: "clients_named", t: "text", label: "Commercial clients you're allowed to name" },
      { k: "awards", t: "text", label: "Awards or recognition" },
      { k: "guarantee", t: "text", r: true, label: "Your workmanship guarantee, word for word", hint: "Whatever you already tell people on the doorstep. It belongs on every page.", ph: "12-month guarantee on all workmanship" },
    ],
  },

  {
    id: "s12", n: "12", title: "What the site is for",
    why: "A site built to ring the phone looks different from one built to look credible when a facilities manager checks you out. It can't be excellent at both.",
    fields: [
      { k: "goal_main", t: "one", r: true, label: "The one thing the site must do",
        opts: ["Make the phone ring", "Fill in a quote form", "Book jobs into the diary", "Look credible when people check you out"] },
      { k: "customers", t: "many", label: "Who you want more of",
        opts: ["Homeowners", "Landlords / rental providers", "Real estate agents & property managers", "Builders & contractors", "Commercial property / facilities", "Industrial", "Shops & hospitality", "Other trades"] },
      { k: "leads_now", t: "text", label: "Enquiries a month now, and where they come from", ph: "About 30 — mostly word of mouth and hipages" },
      { k: "leads_target", t: "text", label: "Where you want that number" },
      { k: "differentiator", t: "area", r: true, label: "Why should someone pick you over the next electrician?", hint: "Plain words, the way you'd say it to a customer on the doorstep. This becomes the headline.", ph: "We turn up when we say. Every job gets a certificate before we leave. No apprentice left on his own." },
    ],
  },

  {
    id: "s13", n: "13", title: "What the site needs to do",
    why: "Each feature is build time and something to maintain. Pick what you'll actually use.",
    fields: [
      { k: "features", t: "many", label: "Features you want",
        opts: ["Quote request form", "Photo upload of the fault", "Online booking / calendar", "WhatsApp button", "Live chat", "Sticky emergency call bar", "Blog / advice articles", "Photo gallery", "Service area map", "Finance calculator (EV / solar)", "Customer certificate downloads", "Recruitment page", "Newsletter signup"] },
      { k: "job_software", t: "text", label: "Job management software you already use", hint: "If it has a booking widget we should plug into it rather than build a second diary you'd forget to check.", ph: "ServiceM8 · Tradify · Fergus · simPRO · AroFlo · none" },
      { k: "form_fields", t: "area", label: "What should the enquiry form ask?", ph: "Name, phone, postcode, type of job, when they need it, photo of the problem" },
      { k: "form_dest", t: "email", label: "Where form submissions should be emailed" },
      { k: "hiring", t: "one", label: "Hiring?", opts: ["Yes — want a recruitment page", "Maybe later", "No"] },
      { k: "accessibility", t: "one", label: "Accessibility standard to build to", hint: "Worth getting right — it also helps older customers, who are a big slice of domestic work.", opts: ["WCAG 2.2 AA", "Best effort", "Don't know — advise me"] },
    ],
  },

  {
    id: "s14", n: "14", title: "The words",
    why: "",
    fields: [
      { k: "story", t: "area", r: true, label: "Your story", hint: "How you started, why you went out on your own, what you care about getting right. A few sentences in your own words is plenty — this is the About page and people do read it.", ph: "Did my apprenticeship with a firm in Dandenong, went out on my own in 2015 after…" },
    ],
  },

  {
    id: "s15", n: "15", title: "Legal bits",
    why: "Small, dull, and the thing that gets forgotten until the week of launch.",
    fields: [
      { k: "legal_have", t: "many", label: "Documents you already have",
        opts: ["Privacy policy", "Cookie policy", "Terms & conditions", "Complaints procedure", "Cancellation notice", "None of these"] },
      { k: "legal_footer", t: "text", label: "Anything that has to appear in the footer", ph: "ABN, REC number, licence number" },
      { k: "complaints", t: "area", label: "Your complaints procedure", hint: "How a customer raises a problem, and what you do about it. If a trade association you belong to has wording for this, paste it here." },
    ],
  },
];

/**
 * The sections to point the client at when he can only manage a few — the
 * four things that stall these builds: licences and insurance, photos, the
 * domain, and who writes the words.
 *
 * Filtered against the sections that actually exist, because the intro copy
 * used to name section 11 after it had been removed from the page.
 */
const PRIORITY = ['03', '09', '11', '14'].filter((n) => SECTIONS.some((s) => s.n === n));

/** "3, 9 and 14" — for dropping straight into the intro copy. */
function priorityPhrase() {
  const ns = PRIORITY.map((n) => String(Number(n)));
  if (ns.length <= 1) return ns[0] || '';
  return ns.slice(0, -1).join(', ') + ' and ' + ns[ns.length - 1];
}

/** Every field, flattened, each carrying a `sec` back-reference. */
function allFields() {
  const out = [];
  SECTIONS.forEach((s) => s.fields.forEach((f) => out.push({ ...f, sec: s })));
  return out;
}

/** Counts used in the intro copy and the build logs, so they can never go stale. */
function counts() {
  const all = allFields();
  return { sections: SECTIONS.length, questions: all.length, blockers: all.filter((f) => f.r).length };
}

/**
 * Fail loudly on a malformed question rather than emitting a broken form.
 * Every builder calls this first.
 */
function validate() {
  const errs = [];
  const keys = new Set();
  const TYPES = ['text', 'area', 'tel', 'email', 'url', 'one', 'many'];

  SECTIONS.forEach((s) => {
    if (!s.id || !s.n || !s.title) errs.push(`section ${s.n || '?'}: missing id, n or title`);
    // An omitted "why" is the bug that once rendered the word "undefined" on the
    // page. An empty string is allowed: that is a deliberate blank.
    if (s.why === undefined) errs.push(`section ${s.n}: "why" is missing (use "" for a deliberate blank)`);
    if (!Array.isArray(s.fields) || !s.fields.length) errs.push(`section ${s.n}: no fields`);

    (s.fields || []).forEach((f) => {
      const at = `${s.n} "${f.label || '(no label)'}"`;
      if (!f.k) errs.push(`${at}: missing k`);
      else if (keys.has(f.k)) errs.push(`${at}: duplicate key "${f.k}"`);
      else keys.add(f.k);

      if (!f.label) errs.push(`${at}: missing label`);
      if (!TYPES.includes(f.t)) errs.push(`${at}: bad type "${f.t}"`);

      const choice = f.t === 'one' || f.t === 'many';
      if (choice && (!Array.isArray(f.opts) || !f.opts.length)) errs.push(`${at}: ${f.t} needs opts`);
      if (!choice && f.opts) errs.push(`${at}: opts on a ${f.t} would be silently dropped`);
      if (f.other && f.t !== 'many') errs.push(`${at}: other:true only works on "many"`);
      if (choice && f.opts) {
        const seen = new Set();
        f.opts.forEach((o) => {
          if (typeof o !== 'string' || !o.trim()) errs.push(`${at}: empty choice`);
          if (seen.has(o)) errs.push(`${at}: duplicate choice "${o}"`);
          seen.add(o);
        });
      }
      if (f.other && keys.has(`${f.k}_other`)) errs.push(`${at}: "${f.k}_other" collides with the catch-all`);
    });
  });

  // Duplicate question text makes the responses spreadsheet ambiguous.
  const byLabel = new Map();
  allFields().forEach((f) => byLabel.set(f.label, (byLabel.get(f.label) || 0) + 1));
  [...byLabel].filter(([, n]) => n > 1).forEach(([l, n]) => errs.push(`question text appears ${n}x: "${l}"`));

  if (errs.length) throw new Error(`questions.js is invalid:\n  - ${errs.join('\n  - ')}`);
  return true;
}

module.exports = { SECTIONS, allFields, counts, validate, PRIORITY, priorityPhrase };
