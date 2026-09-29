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
 * Previously the question set was hand-maintained in three places. They drifted,
 * and the web page silently lost three whole sections (service areas, domain and
 * email, budget and sign-off) plus most of "The words" — 37 questions, 14 of them
 * blockers. Add a question here and it appears in all three. Do not edit the
 * generated files by hand; `node verify.js` will fail if you do.
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
 *   other      `many` only — adds a free-text catch-all to the same question.
 *              It is part of the question, not an extra one, so the three formats
 *              stay comparable. Stored under k + "_other" on the web page.
 *   otherLabel / otherPh   wording for that catch-all. Optional.
 *
 * NOTHING IS MARKED REQUIRED in the Google Form on purpose — Forms refuses the
 * whole submission while any required answer is blank, and on a 115-question form
 * filled in over several sittings that turns one unknown licence number into an
 * abandoned form. `r` flags blockers visually instead. See HANDOVER.md.
 */

const SECTIONS = [
  {
    id: 's1', n: '01', title: 'Where you operate',
    why: 'Decides which licensing bodies, tax display, privacy law and consumer-rights notices apply. Everything below hangs off this.',
    fields: [
      { k: 'country', t: 'text', r: true, label: 'Country', ph: 'United Kingdom' },
      { k: 'region', t: 'text', r: true, label: 'State, county or region', ph: 'West Midlands' },
      { k: 'languages', t: 'text', label: 'Languages the site must be in',
        ph: 'English. Welsh version for the Powys jobs?' },
    ],
  },

  {
    id: 's2', n: '02', title: 'The business on paper',
    why: 'Goes in the footer, the legal pages and every directory listing. It has to match your other records letter for letter.',
    fields: [
      { k: 'legal_name', t: 'text', r: true, label: 'Registered legal name', ph: 'Hartley Electrical Services Ltd' },
      { k: 'trading_name', t: 'text', r: true, label: 'Trading name customers actually say', ph: 'Hartley Electrical' },
      { k: 'reg_number', t: 'text', label: 'Company or business registration number' },
      { k: 'vat_number', t: 'text', label: 'VAT / GST / ABN / EIN number',
        hint: "Leave blank if you're not registered — that's a normal answer, and it changes how prices are shown." },
      { k: 'tax_display', t: 'one', r: true, label: 'Prices on the site should read',
        opts: ['Including tax', 'Excluding tax', 'No prices on the site at all'] },
      { k: 'reg_address', t: 'area', label: 'Registered address' },
      { k: 'depot_address', t: 'area', label: 'Workshop, unit or depot address',
        hint: 'Only if it differs from the registered one.' },
      { k: 'founded', t: 'text', label: 'Year you started', ph: '2011' },
      { k: 'owner', t: 'text', label: 'Owner or director names, spelled as you want them printed' },
      { k: 'headcount', t: 'text', label: "Who's on the books", ph: '3 electricians, 1 apprentice, 1 in the office' },
    ],
  },

  {
    id: 's3', n: '03', title: 'Licences, insurance, memberships',
    why: "The single strongest trust signal on an electrician's site. Someone deciding between you and a rival looks for these before they look at anything else.",
    fields: [
      { k: 'licence_no', t: 'text', r: true, label: 'Electrical licence or registration number' },
      { k: 'licence_body', t: 'text', r: true, label: 'Who issued it',
        ph: 'NICEIC · NAPIT · SELECT · state licensing board' },
      { k: 'licence_expiry', t: 'text', label: 'Renewal or expiry date', ph: 'March 2027' },
      { k: 'schemes', t: 'many', other: true, label: "Schemes and trade bodies you're a member of",
        otherLabel: 'Anything not on that list',
        opts: ['NICEIC', 'NAPIT', 'ELECSA', 'SELECT', 'RECI', 'Part P registered', 'Master Electricians',
               'NECA', 'IBEW', 'TrustMark', 'Which? Trusted Trader', 'SafeContractor', 'CHAS', 'Constructionline'] },
      { k: 'quals', t: 'many', other: true, label: 'Qualifications worth putting on the page',
        otherLabel: 'Anything not on that list',
        opts: ['18th Edition (BS 7671)', 'C&G 2391 inspection & testing', 'C&G 2919 EV charging',
               'NVQ Level 3', 'JIB / ECS Gold Card', 'MCS solar PV'] },
      { k: 'ins_pl', t: 'text', r: true, label: 'Public liability — cover amount and insurer', ph: '£5m, Aviva' },
      { k: 'ins_el', t: 'text', label: "Employers' liability — cover amount and insurer" },
      { k: 'ins_pi', t: 'text', label: 'Professional indemnity — cover amount' },
      { k: 'tickets', t: 'many', label: 'Site tickets and safety cards',
        opts: ['CSCS / ECS card', 'IPAF', 'PASMA', 'Working at heights', 'Asbestos awareness',
               'Confined space', 'First aid', 'Manual handling'] },
      { k: 'checks', t: 'one', label: 'Background checks on staff',
        hint: 'Matters more than you would think to someone letting a stranger into the house.',
        opts: ['Everyone is checked', 'Some staff', 'None', 'Not relevant — commercial only'] },
      { k: 'scheme_logos', t: 'one', r: true, label: 'Can you send the logo file for each scheme you belong to?',
        hint: "Most schemes hand members a badge pack. Displaying one you're not entitled to is a real problem, so we only use what you can evidence.",
        opts: ['Yes, I will send them', 'I will need help finding them', 'No'] },
    ],
  },

  {
    id: 's4', n: '04', title: 'What you actually do',
    why: "Your top earners get a page each — that's where the enquiries come from. The rest get a line on a list.",
    fields: [
      { k: 'svc_dom', t: 'many', other: true, label: 'Domestic work',
        otherLabel: 'Other domestic work — anything not on that list',
        otherPh: 'Immersion heaters, extractor fans, doorbells and intercoms…',
        opts: ['Full and partial rewires', 'Consumer unit / fuse board upgrades', 'EICR inspection & testing',
               'Landlord certificates', 'PAT testing', 'Fault finding', 'Sockets & switches',
               'Indoor lighting design', 'Garden & outdoor lighting', 'EV charger install',
               'Solar PV & battery storage', 'Smart home / automation', 'CCTV & alarms',
               'Data & network cabling', 'Kitchen & bathroom electrics', 'Underfloor heating',
               'Garage & outbuilding supply', 'Hot tub supply', 'New build first & second fix',
               'Electric showers & cookers'] },
      { k: 'svc_com', t: 'many', other: true, label: 'Commercial and industrial work',
        otherLabel: 'Other commercial or industrial work — anything not on that list',
        otherPh: 'Shop-front signage supplies, refrigeration isolators, EV fleet charging…',
        opts: ['Commercial EICR', 'Fire alarm install & testing', 'Emergency lighting', 'Three-phase work',
               'Shop & office fit-out', 'Machinery & control panels', 'Distribution boards',
               'Data centre / comms rooms', 'Landlord & agent contracts', 'Planned maintenance contracts',
               'Street & car park lighting', 'Generators & UPS'] },
      { k: 'svc_top', t: 'area', r: true, label: 'Your top three to five earners, best first',
        hint: 'Be honest about what pays, not what is interesting. These decide the shape of the whole site.',
        ph: '1. Consumer unit upgrades\n2. EV chargers\n3. Landlord EICRs\n4. Full rewires' },
      { k: 'svc_never', t: 'area', label: 'Jobs you do NOT want the phone ringing about',
        hint: 'Just as valuable. Every wasted call costs you twenty minutes.',
        ph: 'Anything with a hot tub. Appliance repairs. Jobs under £80.' },
      { k: 'emergency', t: 'one', label: 'Emergency callout',
        opts: ['24/7, genuinely', 'Evenings and weekends', 'Business hours only', 'No emergency work'] },
      { k: 'emergency_promise', t: 'text', label: "Response time you'd put in writing, on average",
        ph: 'On site within 2 hours inside the ring road' },
      { k: 'ev_status', t: 'one', label: 'EV chargers — approval status',
        opts: ['Grant-approved installer (OZEV or equivalent)', 'Manufacturer approved',
               'I install them, no formal approvals', "Don't do EV work"] },
      { k: 'ev_brands', t: 'text', label: "Brands you're approved or certified for",
        ph: 'Zappi, Ohme, Tesla, GivEnergy, Hypervolt' },
    ],
  },

  {
    id: 's5', n: '05', title: 'Where you will travel',
    why: 'Each named town can earn its own page, and those pages are how you show up for "electrician near me". "And surrounding areas" earns nothing.',
    fields: [
      { k: 'base_postcode', t: 'text', r: true, label: 'Postcode or suburb you work out of', ph: 'B90' },
      { k: 'areas_covered', t: 'area', r: true, label: 'Every town, suburb or postcode you cover — all of them',
        hint: 'Write them out. Twenty names beats a radius, because people search the name of their own town.',
        ph: 'Solihull, Shirley, Hall Green, Moseley, Knowle, Dorridge, Balsall Common…' },
      { k: 'travel_distance', t: 'text', label: "How far you'll travel", ph: '25 miles, further for commercial' },
      { k: 'travel_surcharge', t: 'text', label: 'What you charge beyond that' },
      { k: 'growth_areas', t: 'text', label: "Three areas you'd most like more work in" },
    ],
  },

  {
    id: 's6', n: '06', title: 'Money',
    why: 'Published prices filter out tyre-kickers before they ring. Hidden prices get more calls, more of them wasted. Your call — but decide it deliberately.',
    fields: [
      { k: 'price_show', t: 'one', r: true, label: 'Do we publish prices?',
        opts: ['Yes — show everything', 'Some — fixed-price jobs only', 'No — quote on request'] },
      { k: 'price_callout', t: 'text', label: 'Call-out fee' },
      { k: 'price_hour', t: 'text', label: 'Hourly rate' },
      { k: 'price_day', t: 'text', label: 'Day rate' },
      { k: 'price_min', t: 'text', label: 'Minimum charge' },
      { k: 'price_ooh', t: 'text', label: 'Out-of-hours and emergency rate' },
      { k: 'price_fixed', t: 'area', label: "Fixed-price jobs you're happy to see in print",
        ph: 'EICR, 3-bed house: £180\nConsumer unit change: £550\nEV charger, standard install: £899' },
      { k: 'price_quote', t: 'one', label: 'Quotes',
        opts: ['Free, always', 'Free inside my area', 'Chargeable, refunded against the job', 'Chargeable'] },
      { k: 'price_pay', t: 'many', label: 'How customers can pay',
        opts: ['Bank transfer', 'Card', 'Cash', 'Cheque', 'Direct debit', 'Finance / pay monthly', 'Trade account'] },
      { k: 'price_deposit', t: 'text', label: 'Deposit terms', ph: '30% up front on jobs over £1,000' },
    ],
  },

  {
    id: 's7', n: '07', title: 'How people reach you',
    why: 'On a phone the call button is the whole website. Everything else is there to make someone press it.',
    fields: [
      { k: 'phone_main', t: 'tel', r: true, label: 'Main phone number' },
      { k: 'phone_emerg', t: 'tel', label: 'Emergency or out-of-hours number' },
      { k: 'whatsapp', t: 'tel', label: 'WhatsApp number',
        hint: 'People will happily send a photo of a scorched socket at 9pm.' },
      { k: 'email_main', t: 'email', r: true, label: 'Main email address' },
      { k: 'email_quotes', t: 'email', label: 'Where quote requests should land',
        hint: "If it's a different inbox from the main one." },
      { k: 'address_display', t: 'one', r: true, label: 'Street address on the site',
        hint: 'Plenty of electricians work from home and would rather not publish it. Town-only still works for local search.',
        opts: ['Yes, full address', 'Town or suburb only', 'No address at all'] },
      { k: 'hours', t: 'area', r: true, label: "Opening hours, written how you'd say them",
        ph: 'Mon–Fri 7.30am–5.30pm\nSat 8am–1pm\nSun emergencies only' },
      { k: 'contact_pref', t: 'one', label: "How you'd rather be contacted",
        opts: ['Phone call', 'Enquiry form', 'WhatsApp or text', 'Whatever suits them'] },
      { k: 'who_answers', t: 'text', label: 'Who picks up the phone and watches the inbox' },
      { k: 'response_time', t: 'text', label: 'How fast do you reply to an emailed enquiry, realistically?',
        hint: "We'll put your real number on the page. A promise you can keep beats a better-sounding one you can't." },
    ],
  },

  {
    id: 's8', n: '08', title: 'Your look',
    why: 'The site should be recognisably the same outfit as the van that pulls up. Matching them is free and does a lot of work.',
    fields: [
      { k: 'logo_files', t: 'one', r: true, label: 'Logo files you can send',
        hint: "A vector file (.svg, .ai, .eps) stays sharp at any size. A logo lifted off a JPG goes fuzzy the moment it's enlarged.",
        opts: ['I have the vector files', 'Only a JPG or PNG', 'No logo yet'] },
      { k: 'brand_colors', t: 'text', label: 'Your colours', ph: 'Van is navy with lime green lettering' },
      { k: 'brand_guidelines', t: 'one', label: 'Brand guidelines document', opts: ['Yes', 'No'] },
      { k: 'van_photos', t: 'one', label: 'Photos of the van livery and uniform', opts: ['Yes, can send', 'No'] },
    ],
  },

  {
    id: 's9', n: '09', title: 'Photos and video',
    why: "The commonest reason one of these builds stalls. Real photos of your own work outsell stock images by a distance — visitors can tell, even if they can't say how.",
    fields: [
      { k: 'photos_job', t: 'one', r: true, label: 'Before-and-after job photos',
        opts: ['Plenty, decent quality', 'A handful of phone shots', 'None'] },
      { k: 'photos_perm', t: 'one', r: true, label: "Do you have the customer's permission to publish those photos?",
        hint: "Inside someone's home, you need it. A one-line text asking is usually enough — keep the reply.",
        opts: ['Yes, for all of them', 'For some', "Haven't asked", 'Not relevant — commercial only'] },
      { k: 'photos_team', t: 'one', label: 'Photos of you and the team',
        hint: "A real face beats a stock model every time. It doesn't need to be a studio shot.",
        opts: ['Yes', 'No', 'Happy to get some taken'] },
      { k: 'photos_van', t: 'one', label: 'Van or fleet photos', opts: ['Yes', 'No'] },
      { k: 'photos_video', t: 'one', label: 'Video footage', opts: ['Have some', 'Would film some', 'None'] },
      { k: 'photos_plan', t: 'one', r: true, label: "If the photos are thin, what's the plan?",
        hint: 'Decide now rather than at launch. A half-day with a photographer usually pays for itself.',
        opts: ['Book a photographer', "I'll shoot on my phone to a brief", 'Use stock images', 'Not decided'] },
    ],
  },

  {
    id: 's10', n: '10', title: 'Proof of your work',
    why: 'Claims about quality persuade nobody. Named customers, real jobs and a written guarantee do.',
    fields: [
      { k: 'gbp_link', t: 'url', label: 'Google Business Profile link' },
      { k: 'reviews_other', t: 'area', label: 'Other review profiles',
        ph: 'Checkatrade, Trustpilot, MyBuilder, Rated People, Yelp, Angi — paste the links' },
      { k: 'reviews_count', t: 'text', label: 'Roughly how many reviews, and the average score', ph: '84 reviews, 4.9' },
      { k: 'testimonials', t: 'area', label: "Testimonials you're allowed to publish",
        hint: 'Quote, first name, town. A specific one about a difficult job beats five saying "great service".',
        ph: '"Found a fault two other sparkies had missed." — Dave, Shirley' },
      { k: 'casestudies', t: 'area', r: true, label: 'Three to six jobs worth writing up properly',
        hint: 'For each: what was wrong, what you did, what it cost or saved them. These become the pages that win the bigger work.',
        ph: 'Victorian semi in Moseley — no earth on the lighting circuit, rewired over 4 days while family stayed in…' },
      { k: 'clients_named', t: 'text', label: "Commercial clients you're allowed to name" },
      { k: 'awards', t: 'text', label: 'Awards or recognition' },
      { k: 'guarantee', t: 'text', r: true, label: 'Your workmanship guarantee, word for word',
        hint: 'Whatever you already tell people on the doorstep. It belongs on every page.',
        ph: '12-month guarantee on all workmanship' },
    ],
  },

  {
    id: 's11', n: '11', title: 'Domain, email and what exists now',
    why: 'Access is what delays launches, not building. Pointing a domain at a new site can knock out your email if nobody knows where it is hosted — so we find out first, not on launch day.',
    fields: [
      { k: 'domain', t: 'text', r: true, label: 'Your domain name, or the one you want' },
      { k: 'domain_access', t: 'one', r: true, label: 'Who can log in and change the domain settings?',
        opts: ['Me, and I have the login', 'My old web person', 'No idea', 'No domain yet'] },
      { k: 'email_host', t: 'text', r: true, label: 'Where your email is hosted',
        hint: 'If you genuinely do not know, write "don\'t know" — we can look it up. Guessing is what breaks things.' },
      { k: 'site_current', t: 'url', label: 'Current website address' },
      { k: 'site_stack', t: 'text', label: "What it's built on and who hosts it" },
      { k: 'site_plan', t: 'one', label: 'The current site',
        opts: ['Replace it completely', 'Keep some of the pages', 'There is not one'] },
      { k: 'gbp_status', t: 'one', r: true, label: 'Google Business Profile',
        hint: 'The map listing with your reviews on it. Often worth more traffic than the website itself.',
        opts: ['Claimed, I have access', 'Claimed by someone else', 'Not claimed', 'Do not know what that is'] },
      { k: 'social', t: 'area', label: 'Social accounts',
        ph: 'Facebook, Instagram, TikTok, LinkedIn, YouTube — paste the links' },
      { k: 'analytics', t: 'one', label: 'Existing Google Analytics or Search Console',
        opts: ['Yes, I have access', 'Yes, but no access', 'No', 'Do not know'] },
    ],
  },

  {
    id: 's12', n: '12', title: 'What the site is for',
    why: "A site built to ring the phone looks different from one built to look credible when a facilities manager checks you out. It can't be excellent at both.",
    fields: [
      { k: 'goal_main', t: 'one', r: true, label: 'The one thing the site must do',
        opts: ['Make the phone ring', 'Fill in a quote form', 'Book jobs into the diary',
               'Look credible when people check you out'] },
      { k: 'customers', t: 'many', label: 'Who you want more of',
        opts: ['Homeowners', 'Landlords', 'Letting & estate agents', 'Builders & contractors',
               'Commercial property / facilities', 'Industrial', 'Shops & hospitality', 'Other trades'] },
      { k: 'leads_now', t: 'text', label: 'Enquiries a month now, and where they come from',
        ph: 'About 30 — mostly word of mouth and Checkatrade' },
      { k: 'leads_target', t: 'text', label: 'Where you want that number' },
      { k: 'competitors_like', t: 'area', label: 'Two or three competitor sites you like, and why' },
      { k: 'competitors_dislike', t: 'area', label: "Two or three you don't, and why" },
      { k: 'differentiator', t: 'area', r: true, label: 'Why should someone pick you over the next electrician?',
        hint: "Plain words, the way you'd say it to a customer on the doorstep. This becomes the headline.",
        ph: 'We turn up when we say. Every job gets a certificate before we leave. No apprentice left on his own.' },
    ],
  },

  {
    id: 's13', n: '13', title: 'What the site needs to do',
    why: "Each feature is build time and something to maintain. Pick what you'll actually use.",
    fields: [
      { k: 'features', t: 'many', label: 'Features you want',
        opts: ['Quote request form', 'Photo upload of the fault', 'Online booking / calendar', 'WhatsApp button',
               'Live chat', 'Sticky emergency call bar', 'Blog / advice articles', 'Photo gallery',
               'Service area map', 'Finance calculator (EV / solar)', 'Customer certificate downloads',
               'Recruitment page', 'Newsletter signup'] },
      { k: 'job_software', t: 'text', label: 'Job management software you already use',
        hint: "If it has a booking widget we should plug into it rather than build a second diary you'd forget to check.",
        ph: 'ServiceM8 · Tradify · Jobber · Commusoft · Housecall Pro · none' },
      { k: 'form_fields', t: 'area', label: 'What should the enquiry form ask?',
        ph: 'Name, phone, postcode, type of job, when they need it, photo of the problem' },
      { k: 'form_dest', t: 'email', label: 'Where form submissions should be emailed' },
      { k: 'hiring', t: 'one', label: 'Hiring?', opts: ['Yes — want a recruitment page', 'Maybe later', 'No'] },
      { k: 'accessibility', t: 'one', label: 'Accessibility standard to build to',
        hint: 'Worth getting right — it also helps older customers, who are a big slice of domestic work.',
        opts: ['WCAG 2.2 AA', 'Best effort', "Don't know — advise me"] },
    ],
  },

  {
    id: 's14', n: '14', title: 'The words',
    why: 'The single most common thing a half-finished website is waiting on. Decide who writes them before anything gets built.',
    fields: [
      { k: 'copy_owner', t: 'one', r: true, label: 'Who writes the text?',
        opts: ['I will write it', "You write it, I'll approve", 'Hire a copywriter', 'Reuse what already exists'] },
      { k: 'copy_existing', t: 'one', label: 'Existing wording we can reuse — leaflets, van, old site',
        opts: ['Yes, I will send it', 'No'] },
      { k: 'tone', t: 'one', label: 'How it should sound',
        opts: ['Friendly local tradesman', 'Straight and professional', 'Premium, high-end', 'No preference'] },
      { k: 'story', t: 'area', r: true, label: 'Your story',
        hint: 'How you started, why you went out on your own, what you care about getting right. A few sentences in your own words is plenty — this is the About page and people do read it.',
        ph: 'Started as an apprentice at 17 with a firm in Redditch, went out on my own in 2011 after…' },
    ],
  },

  {
    id: 's15', n: '15', title: 'Legal bits',
    why: 'Small, dull, and the thing that gets forgotten until the week of launch.',
    fields: [
      { k: 'legal_have', t: 'many', label: 'Documents you already have',
        opts: ['Privacy policy', 'Cookie policy', 'Terms & conditions', 'Complaints procedure',
               'Cancellation notice', 'None of these'] },
      { k: 'legal_footer', t: 'text', label: 'Anything that has to appear in the footer',
        ph: 'Company number, registered office, scheme registration number' },
      { k: 'complaints', t: 'area', label: 'Your complaints procedure',
        hint: 'Several schemes require members to publish one. If you have wording from them, paste it here.' },
    ],
  },

  {
    id: 's16', n: '16', title: 'Budget, dates and who owns what',
    why: 'Worth being blunt about early. It changes what gets built, not whether anything does.',
    fields: [
      { k: 'budget_build', t: 'text', r: true, label: 'Budget for the build' },
      { k: 'budget_monthly', t: 'text', label: 'Monthly budget for hosting, upkeep and advertising' },
      { k: 'deadline', t: 'text', r: true, label: 'When it needs to be live, and why' },
      { k: 'who_pays', t: 'one', label: 'Who pays for the domain and hosting after launch?',
        opts: ['Me, directly', 'You, bill me', 'Not decided'] },
      { k: 'self_edit', t: 'one', r: true, label: 'Do you want to change the site yourself afterwards?',
        hint: 'This decides how it gets built. Retro-fitting an editor later is a rebuild.',
        opts: ['Yes, regularly', 'Occasionally', 'No, I would rather you did it'] },
      { k: 'tech_comfort', t: 'one', label: 'How comfortable are you with a computer?',
        hint: 'No wrong answer. It decides how simple the editing has to be.',
        opts: ['Very', 'Average', 'Not at all'] },
      { k: 'support', t: 'one', label: 'Ongoing support',
        opts: ['Monthly retainer', 'Ad hoc, as needed', 'I will handle it', 'Not decided'] },
      { k: 'signoff', t: 'text', r: true, label: 'Who signs the design off — name and email',
        hint: 'One person. If your partner has a veto, name them here rather than at the end.' },
    ],
  },

  {
    id: 's17', n: '17', title: 'What you want to be found for',
    why: 'The phrases people type, not the ones you would use in the trade. Nobody searches "domestic electrical contracting solutions".',
    fields: [
      { k: 'seo_terms', t: 'area', label: 'Exactly what you want to come up for',
        ph: 'electrician Solihull\nEV charger installer Birmingham\nemergency electrician near me\nlandlord EICR Shirley' },
      { k: 'seo_rivals', t: 'text', label: 'Who comes up first when you search those now?' },
      { k: 'nap', t: 'area', r: true, label: 'Your name, address and phone, written exactly as they appear everywhere else',
        hint: 'Letter for letter, including "Ltd", "Street" vs "St", and the spacing in the phone number. Inconsistency between your website, Google and the directories quietly costs you local ranking.' },
    ],
  },
];

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
    if (!s.why) errs.push(`section ${s.n}: missing "why" — the page renders it unconditionally`);
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
      // The web page derives the catch-all's storage key by suffix; a real field
      // already holding that key would overwrite it.
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

module.exports = { SECTIONS, allFields, counts, validate };
