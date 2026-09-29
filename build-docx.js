const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, ShadingType, PageBreak, Footer, PageNumber, TabStopType,
} = require("docx");

/* ---------------- palette ---------------- */
const SLATE = "1B2A30";
const AMBER = "A06200";
const EARTH = "3A6F20";
const GREY  = "6B7678";
const FIELD = "F1F2ED";
const GHOST = "A2ABAC";
const RULE  = "C9CEC4";
const FONT  = "Arial";

/* ---------------- content ---------------- */
const SECTIONS = [
  { n: "01", title: "Where you operate",
    why: "Decides which licensing bodies, tax display, privacy law and consumer-rights notices apply. Everything below hangs off this.",
    fields: [
      { t: "text", r: true, q: "Country", ph: "United Kingdom" },
      { t: "text", r: true, q: "State, county or region", ph: "West Midlands" },
      { t: "text", q: "Languages the site must be in", ph: "English. Welsh version for the Powys jobs?" },
    ]},
  { n: "02", title: "The business on paper",
    why: "Goes in the footer, the legal pages and every directory listing. It has to match your other records letter for letter.",
    fields: [
      { t: "text", r: true, q: "Registered legal name", ph: "Hartley Electrical Services Ltd" },
      { t: "text", r: true, q: "Trading name customers actually say", ph: "Hartley Electrical" },
      { t: "text", q: "Company or business registration number" },
      { t: "text", q: "VAT / GST / ABN / EIN number", hint: "Leave blank if you're not registered — that's a normal answer, and it changes how prices are shown." },
      { t: "one", r: true, q: "Prices on the site should read...", opts: ["Including tax", "Excluding tax", "No prices on the site at all"] },
      { t: "area", q: "Registered address" },
      { t: "area", q: "Workshop, unit or depot address", hint: "Only if it differs from the registered one." },
      { t: "text", q: "Year you started", ph: "2011" },
      { t: "text", q: "Owner or director names, spelled as you want them printed" },
      { t: "text", q: "Who's on the books", ph: "3 electricians, 1 apprentice, 1 in the office" },
    ]},
  { n: "03", title: "Licences, insurance, memberships",
    why: "The single strongest trust signal on an electrician's site. Someone deciding between you and a rival looks for these before anything else.",
    fields: [
      { t: "text", r: true, q: "Electrical licence or registration number" },
      { t: "text", r: true, q: "Who issued it", ph: "NICEIC / NAPIT / SELECT / state licensing board" },
      { t: "text", q: "Renewal or expiry date", ph: "March 2027" },
      { t: "many", q: "Schemes and trade bodies you belong to", opts: ["NICEIC", "NAPIT", "ELECSA", "SELECT", "RECI", "Part P registered", "Master Electricians", "NECA", "IBEW", "TrustMark", "Which? Trusted Trader", "SafeContractor", "CHAS", "Constructionline", "Other"] },
      { t: "text", q: "Anything not on that list" },
      { t: "many", q: "Qualifications worth putting on the page", opts: ["18th Edition (BS 7671)", "C&G 2391 inspection & testing", "C&G 2919 EV charging", "NVQ Level 3", "JIB / ECS Gold Card", "MCS solar PV", "Other"] },
      { t: "text", r: true, q: "Public liability — cover amount and insurer", ph: "£5m, Aviva" },
      { t: "text", q: "Employers' liability — cover amount and insurer" },
      { t: "text", q: "Professional indemnity — cover amount" },
      { t: "many", q: "Site tickets and safety cards", opts: ["CSCS / ECS card", "IPAF", "PASMA", "Working at heights", "Asbestos awareness", "Confined space", "First aid", "Manual handling"] },
      { t: "one", q: "Background checks on staff", hint: "Matters more than you'd think to people letting a stranger into the house.", opts: ["Everyone is checked", "Some staff", "None", "Not relevant — commercial only"] },
      { t: "one", r: true, q: "Can you send the logo file for each scheme you belong to?", hint: "Most schemes hand members a badge pack. Displaying one you're not entitled to is a real problem, so we only use what you can evidence.", opts: ["Yes, I'll send them", "I'll need help finding them", "No"] },
    ]},
  { n: "04", title: "What you actually do",
    why: "Your top earners get a page each — that's where the enquiries come from. The rest get a line on a list.",
    fields: [
      { t: "many", q: "Domestic work", opts: ["Full and partial rewires", "Consumer unit / fuse board upgrades", "EICR inspection & testing", "Landlord certificates", "PAT testing", "Fault finding", "Sockets & switches", "Indoor lighting design", "Garden & outdoor lighting", "EV charger install", "Solar PV & battery storage", "Smart home / automation", "CCTV & alarms", "Data & network cabling", "Kitchen & bathroom electrics", "Underfloor heating", "Garage & outbuilding supply", "Hot tub supply", "New build first & second fix", "Electric showers & cookers"] },
      { t: "many", q: "Commercial and industrial work", opts: ["Commercial EICR", "Fire alarm install & testing", "Emergency lighting", "Three-phase work", "Shop & office fit-out", "Machinery & control panels", "Distribution boards", "Data centre / comms rooms", "Landlord & agent contracts", "Planned maintenance contracts", "Street & car park lighting", "Generators & UPS"] },
      { t: "area", r: true, q: "Your top three to five earners, best first", hint: "Be honest about what pays, not what's interesting. These decide the shape of the whole site.", ph: "1. Consumer unit upgrades   2. EV chargers   3. Landlord EICRs   4. Full rewires" },
      { t: "area", q: "Jobs you do NOT want the phone ringing about", hint: "Just as valuable. Every wasted call costs you twenty minutes.", ph: "Anything with a hot tub. Appliance repairs. Jobs under £80." },
      { t: "one", q: "Emergency callout", opts: ["24/7, genuinely", "Evenings and weekends", "Business hours only", "No emergency work"] },
      { t: "text", q: "Response time you'd put in writing", ph: "On site within 2 hours inside the ring road" },
      { t: "one", q: "EV chargers — approval status", opts: ["Grant-approved installer (OZEV or equivalent)", "Manufacturer approved", "I install them, no formal approvals", "Don't do EV work"] },
      { t: "text", q: "Brands you're approved or certified for", ph: "Zappi, Ohme, Tesla, GivEnergy, Hypervolt" },
    ]},
  { n: "05", title: "Where you'll travel",
    why: "Each named town can earn its own page, and those pages are how you show up for “electrician near me”. “And surrounding areas” earns nothing.",
    fields: [
      { t: "text", r: true, q: "Postcode or suburb you work out of" },
      { t: "area", r: true, q: "Every town, suburb or postcode you cover — all of them", hint: "Write them out. Twenty names beats a radius, because people search the name of their own town.", ph: "Solihull, Shirley, Knowle, Dorridge, Hockley Heath, Balsall Common, Olton, Acocks Green..." },
      { t: "text", q: "How far you'll travel", ph: "25 miles, further for commercial" },
      { t: "text", q: "What you charge beyond that" },
      { t: "text", q: "Three areas you'd most like more work in", hint: "We can weight the site toward these." },
    ]},
  { n: "06", title: "Money",
    why: "Published prices filter out tyre-kickers before they ring. Hidden prices get more calls, more of them wasted. Your call — but decide it deliberately.",
    fields: [
      { t: "one", r: true, q: "Do we publish prices?", opts: ["Yes — show everything", "Some — fixed-price jobs only", "No — quote on request"] },
      { t: "text", q: "Call-out fee" },
      { t: "text", q: "Hourly rate" },
      { t: "text", q: "Day rate" },
      { t: "text", q: "Minimum charge" },
      { t: "text", q: "Out-of-hours and emergency rate" },
      { t: "area", q: "Fixed-price jobs you're happy to see in print", ph: "EICR, 3-bed house: £180   ·   Consumer unit change: £550   ·   EV charger, standard install: £899" },
      { t: "one", q: "Quotes", opts: ["Free, always", "Free inside my area", "Chargeable, refunded against the job", "Chargeable"] },
      { t: "many", q: "How customers can pay", opts: ["Bank transfer", "Card", "Cash", "Cheque", "Direct debit", "Finance / pay monthly", "Trade account"] },
      { t: "text", q: "Deposit terms", ph: "30% up front on jobs over £1,000" },
    ]},
  { n: "07", title: "How people reach you",
    why: "On a phone, the call button is the whole website. Everything else is there to make someone press it.",
    fields: [
      { t: "text", r: true, q: "Main phone number" },
      { t: "text", q: "Emergency or out-of-hours number" },
      { t: "text", q: "WhatsApp number", hint: "People will happily send a photo of a scorched socket at 9pm." },
      { t: "text", r: true, q: "Main email address" },
      { t: "text", q: "Where quote requests should land", hint: "If it's a different inbox from the main one." },
      { t: "one", r: true, q: "Street address on the site", hint: "Plenty of electricians work from home and would rather not publish it. Town-only still works for local search.", opts: ["Yes, full address", "Town or suburb only", "No address at all"] },
      { t: "area", r: true, q: "Opening hours, written how you'd say them", ph: "Mon–Fri 7.30am–5.30pm   ·   Sat 8am–1pm   ·   Sun emergencies only" },
      { t: "one", q: "How you'd rather be contacted", opts: ["Phone call", "Enquiry form", "WhatsApp or text", "Whatever suits them"] },
      { t: "text", q: "Who picks up the phone and watches the inbox" },
      { t: "text", q: "How fast do you reply to an emailed enquiry, realistically?", hint: "We'll put your real number on the page. A promise you can keep beats a better-sounding one you can't." },
    ]},
  { n: "08", title: "Your look",
    why: "The site should be recognisably the same outfit as the van that pulls up. Matching them is free and does a lot of work.",
    fields: [
      { t: "one", r: true, q: "Logo files you can send", hint: "A vector file (.svg, .ai, .eps) stays sharp at any size. A logo lifted off a JPG goes fuzzy the moment it's enlarged.", opts: ["I have the vector files", "Only a JPG or PNG", "No logo yet"] },
      { t: "text", q: "Your colours", ph: "Van is navy with lime green lettering" },
      { t: "one", q: "Brand guidelines document", opts: ["Yes", "No"] },
      { t: "one", q: "Photos of the van livery and uniform", opts: ["Yes, can send", "No"] },
    ]},
  { n: "09", title: "Photos and video",
    why: "The commonest reason one of these builds stalls. Real photos of your own work outsell stock images by a distance — visitors can tell, even if they can't say how.",
    fields: [
      { t: "one", r: true, q: "Before-and-after job photos", opts: ["Plenty, decent quality", "A handful of phone shots", "None"] },
      { t: "one", r: true, q: "Do you have the customer's permission to publish those photos?", hint: "Inside someone's home, you need it. A one-line text asking is usually enough — keep the reply.", opts: ["Yes, for all of them", "For some", "Haven't asked", "Not relevant — commercial only"] },
      { t: "one", q: "Photos of you and the team", hint: "A real face beats a stock model every time. It doesn't need to be a studio shot.", opts: ["Yes", "No", "Happy to get some taken"] },
      { t: "one", q: "Van or fleet photos", opts: ["Yes", "No"] },
      { t: "one", q: "Video footage", opts: ["Have some", "Would film some", "None"] },
      { t: "one", r: true, q: "If the photos are thin, what's the plan?", hint: "Decide now rather than at launch. A half-day with a photographer usually pays for itself.", opts: ["Book a photographer", "I'll shoot on my phone to a brief", "Use stock images", "Not decided"] },
    ]},
  { n: "10", title: "Proof you're any good",
    why: "Claims about quality persuade nobody. Named customers, real jobs and a written guarantee do.",
    fields: [
      { t: "text", q: "Google Business Profile link" },
      { t: "area", q: "Other review profiles", ph: "Checkatrade, Trustpilot, MyBuilder, Rated People, Yelp, Angi — paste the links" },
      { t: "text", q: "Roughly how many reviews, and the average score", ph: "84 reviews, 4.9" },
      { t: "area", q: "Testimonials you're allowed to publish", hint: "Quote, first name, town. A specific one about a difficult job beats five saying “great service”.", ph: "“Found a fault two other sparkies had missed.” — Dave, Shirley" },
      { t: "area", r: true, q: "Three to six jobs worth writing up properly", hint: "For each: what was wrong, what you did, what it cost or saved them. These become the pages that win the bigger work.", ph: "Victorian semi in Moseley — no earth on the lighting circuit, rewired over 4 days while the family stayed in..." },
      { t: "text", q: "Commercial clients you're allowed to name" },
      { t: "text", q: "Awards or recognition" },
      { t: "text", r: true, q: "Your workmanship guarantee, word for word", hint: "Whatever you already tell people on the doorstep. It belongs on every page.", ph: "12-month guarantee on all workmanship" },
    ]},
  { n: "11", title: "Domain, email and what exists now",
    why: "Access is what delays launches, not building. Pointing a domain at a new site can knock out your email if nobody knows where it's hosted — so we find out now, not on launch day.",
    fields: [
      { t: "text", r: true, q: "Your domain name, or the one you want" },
      { t: "one", r: true, q: "Who can log in and change the domain settings?", opts: ["Me, and I have the login", "My old web person", "No idea", "No domain yet"] },
      { t: "text", r: true, q: "Where your email is hosted", hint: "If you genuinely don't know, write “don't know” — we can look it up. Guessing is what breaks things.", ph: "Google Workspace / Microsoft 365 / through the domain company / don't know" },
      { t: "text", q: "Current website address" },
      { t: "text", q: "What it's built on and who hosts it", ph: "WordPress, built by a lad in 2019, hosted somewhere — don't know" },
      { t: "one", q: "The current site", opts: ["Replace it completely", "Keep some of the pages", "There isn't one"] },
      { t: "one", r: true, q: "Google Business Profile", hint: "The map listing with your reviews on it. Often worth more traffic than the website itself.", opts: ["Claimed, I have access", "Claimed by someone else", "Not claimed", "Don't know what that is"] },
      { t: "area", q: "Social accounts", ph: "Facebook, Instagram, TikTok, LinkedIn, YouTube — paste the links" },
      { t: "one", q: "Existing Google Analytics or Search Console", opts: ["Yes, I have access", "Yes, but no access", "No", "Don't know"] },
    ]},
  { n: "12", title: "What the site is for",
    why: "A site built to ring the phone looks different from one built to look credible when a facilities manager checks you out. It can't be excellent at both.",
    fields: [
      { t: "one", r: true, q: "The one thing the site must do", opts: ["Make the phone ring", "Fill in a quote form", "Book jobs into the diary", "Look credible when people check you out"] },
      { t: "many", q: "Who you want more of", opts: ["Homeowners", "Landlords", "Letting & estate agents", "Builders & contractors", "Commercial property / facilities", "Industrial", "Shops & hospitality", "Other trades"] },
      { t: "text", q: "Enquiries a month now, and where they come from", ph: "About 30 — mostly word of mouth and Checkatrade" },
      { t: "text", q: "Where you want that number" },
      { t: "area", q: "Two or three competitor sites you like, and why" },
      { t: "area", q: "Two or three you don't, and why" },
      { t: "area", r: true, q: "Why should someone pick you over the next electrician?", hint: "Plain words, the way you'd say it to a customer on the doorstep. This becomes the headline.", ph: "We turn up when we say. Every job gets a certificate before we leave. No apprentice left on his own." },
    ]},
  { n: "13", title: "What the site needs to do",
    why: "Each feature is build time and something to maintain. Pick what you'll actually use.",
    fields: [
      { t: "many", q: "Features you want", opts: ["Quote request form", "Photo upload of the fault", "Online booking / calendar", "WhatsApp button", "Live chat", "Sticky emergency call bar", "Blog / advice articles", "Photo gallery", "Service area map", "Finance calculator (EV / solar)", "Customer certificate downloads", "Recruitment page", "Newsletter signup"] },
      { t: "text", q: "Job management software you already use", hint: "If it has a booking widget we should plug into it rather than build a second diary you'd forget to check.", ph: "ServiceM8 / Tradify / Jobber / Commusoft / Housecall Pro / none" },
      { t: "area", q: "What should the enquiry form ask?", ph: "Name, phone, postcode, type of job, when they need it, photo of the problem" },
      { t: "text", q: "Where form submissions should be emailed" },
      { t: "one", q: "Hiring?", opts: ["Yes — want a recruitment page", "Maybe later", "No"] },
      { t: "one", q: "Accessibility standard to build to", hint: "Worth getting right — it also helps older customers, who are a big slice of domestic work.", opts: ["WCAG 2.2 AA", "Best effort", "Don't know — advise me"] },
    ]},
  { n: "14", title: "The words",
    why: "The single most common thing a half-finished website is waiting on. Decide who writes them before anything gets built.",
    fields: [
      { t: "one", r: true, q: "Who writes the text?", opts: ["I'll write it", "You write it, I'll approve", "Hire a copywriter", "Reuse what already exists"] },
      { t: "one", q: "Existing wording we can reuse — leaflets, van, old site", opts: ["Yes, I'll send it", "No"] },
      { t: "one", q: "How it should sound", opts: ["Friendly local tradesman", "Straight and professional", "Premium, high-end", "No preference"] },
      { t: "area", r: true, q: "Your story", hint: "How you started, why you went out on your own, what you care about getting right. A few sentences in your own words is plenty — this is the About page, and people do read it.", ph: "Started as an apprentice at 17 with a firm in Redditch, went out on my own in 2011 after..." },
    ]},
  { n: "15", title: "Legal bits",
    why: "Small, dull, and the thing that gets forgotten until the week of launch.",
    fields: [
      { t: "many", q: "Documents you already have", opts: ["Privacy policy", "Cookie policy", "Terms & conditions", "Complaints procedure", "Cancellation notice", "None of these"] },
      { t: "text", q: "Anything that has to appear in the footer", ph: "Company number, registered office, scheme registration number" },
      { t: "area", q: "Your complaints procedure", hint: "Several schemes require members to publish one. If you have wording from them, paste it here." },
    ]},
  { n: "16", title: "Budget, dates and who owns what",
    why: "Worth being blunt about early. It changes what gets built, not whether anything does.",
    fields: [
      { t: "text", r: true, q: "Budget for the build" },
      { t: "text", q: "Monthly budget for hosting, upkeep and advertising" },
      { t: "text", r: true, q: "When it needs to be live, and why", ph: "Before the spring rush — end of March" },
      { t: "one", q: "Who pays for the domain and hosting after launch?", opts: ["Me, directly", "You, bill me", "Not decided"] },
      { t: "one", r: true, q: "Do you want to change the site yourself afterwards?", hint: "This decides how it gets built. Retro-fitting an editor later is a rebuild.", opts: ["Yes, regularly", "Occasionally", "No, I'd rather you did it"] },
      { t: "one", q: "How comfortable are you with a computer?", hint: "No wrong answer. It decides how simple the editing has to be.", opts: ["Very", "Average", "Not at all"] },
      { t: "one", q: "Ongoing support", opts: ["Monthly retainer", "Ad hoc, as needed", "I'll handle it", "Not decided"] },
      { t: "text", r: true, q: "Who signs the design off — name and email", hint: "One person. If your partner has a veto, name them here rather than at the end." },
    ]},
  { n: "17", title: "What you want to be found for",
    why: "The phrases people type, not the ones you'd use in the trade. Nobody searches “domestic electrical contracting solutions”.",
    fields: [
      { t: "area", q: "Exactly what you want to come up for", ph: "electrician Solihull / EV charger installer Birmingham / emergency electrician near me / landlord EICR Shirley" },
      { t: "text", q: "Who comes up first when you search those now?" },
      { t: "area", r: true, q: "Your name, address and phone, written exactly as they appear everywhere else", hint: "Letter for letter, including “Ltd”, “Street” vs “St”, and the spacing in the phone number. Inconsistency between your website, Google and the directories quietly costs you local ranking.", ph: "Hartley Electrical Services Ltd / 14 Mill Lane, Solihull, B91 3AA / 0121 496 0000" },
    ]},
];

/* ---------------- builders ---------------- */
const t = (text, o = {}) => new TextRun({ text, font: FONT, ...o });

function answerBox(lines, ph) {
  const out = [];
  for (let i = 0; i < lines; i++) {
    out.push(new Paragraph({
      spacing: { before: i === 0 ? 40 : 0, after: i === lines - 1 ? 200 : 0, line: 300 },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: FIELD },
      border: {
        top:    { style: i === 0 ? BorderStyle.SINGLE : BorderStyle.NONE, size: 4, color: RULE, space: 4 },
        bottom: { style: i === lines - 1 ? BorderStyle.SINGLE : BorderStyle.NONE, size: 4, color: RULE, space: 4 },
        left:   { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 },
        right:  { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 },
      },
      children: [i === 0 && ph
        ? t("e.g. " + ph, { color: GHOST, size: 17, italics: true })
        : t("", { size: 20 })],
    }));
  }
  return out;
}

function field(f) {
  const out = [];

  // question
  const qRuns = [];
  if (f.r) qRuns.push(t("◆  ", { color: AMBER, bold: true, size: 20 }));
  qRuns.push(t(f.q, { bold: true, size: 21, color: SLATE }));
  out.push(new Paragraph({
    spacing: { before: 260, after: f.hint ? 20 : 60 },
    keepNext: true,
    children: qRuns,
  }));

  if (f.hint) {
    out.push(new Paragraph({
      spacing: { after: 60 },
      keepNext: true,
      children: [t(f.hint, { italics: true, size: 17, color: GREY })],
    }));
  }

  if (f.t === "one" || f.t === "many") {
    out.push(new Paragraph({
      spacing: { after: 70 },
      keepNext: true,
      children: [t(f.t === "one" ? "Mark one — put an X in the box." : "Mark all that apply — put an X in each box.", { size: 16, color: GREY, italics: true })],
    }));
    f.opts.forEach((o) => {
      out.push(new Paragraph({
        spacing: { after: 30, line: 260 },
        indent: { left: 200 },
        children: [t("☐   ", { size: 22, color: SLATE }), t(o, { size: 20 })],
      }));
    });
    out.push(new Paragraph({ spacing: { after: 120 }, children: [t("", { size: 12 })] }));
    return out;
  }

  out.push(...answerBox(f.t === "area" ? 4 : 1, f.ph));
  return out;
}

function rule(after = 180) {
  return new Paragraph({
    spacing: { after },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 1 } },
    children: [t("")],
  });
}

/* ---------------- document ---------------- */
const body = [];

// cover
body.push(new Paragraph({
  spacing: { before: 400, after: 40 },
  children: [t("BUILD BRIEF", { bold: true, size: 20, color: AMBER, characterSpacing: 60 })],
}));
body.push(new Paragraph({
  spacing: { after: 160 },
  children: [t("Everything needed to build your website", { bold: true, size: 40, color: SLATE })],
}));
body.push(rule(240));

[
  "Fill in what you know, straight into this document. It saves itself as you go, so you can stop halfway and pick it up from your phone, the van or the office. Nothing has to be done in one sitting.",
  "Skip anything that doesn't apply. A half-answer beats a blank: “not sure” or “ask my wife” is a useful answer, because it tells us what to chase.",
].forEach((p) => body.push(new Paragraph({
  spacing: { after: 140, line: 300 },
  children: [t(p, { size: 21 })],
})));

body.push(new Paragraph({
  spacing: { before: 120, after: 100 },
  children: [t("How to fill it in", { bold: true, size: 22, color: SLATE })],
}));
[
  ["Grey boxes", "click in and type. They grow as you write."],
  ["☐ Tick boxes", "put an X between the brackets, like this: ☒"],
  ["◆ Amber diamond", "these are the questions that actually block the build. If you only do some of this, do those."],
].forEach(([k, v]) => body.push(new Paragraph({
  spacing: { after: 70, line: 280 },
  indent: { left: 200, hanging: 0 },
  children: [t(k + " — ", { bold: true, size: 20, color: SLATE }), t(v, { size: 20 })],
})));

body.push(new Paragraph({
  spacing: { before: 220, after: 100 },
  children: [t("The four things that stall these projects", { bold: true, size: 22, color: SLATE })],
}));
body.push(new Paragraph({
  spacing: { after: 120, line: 300 },
  children: [t("No usable job photos. No licence and insurance numbers. Nobody can log in to the domain. Nobody has decided who writes the words. If you do nothing else, do sections 3, 9, 11 and 14.", { size: 21 })],
}));
body.push(rule(160));
body.push(new Paragraph({
  spacing: { after: 0 },
  children: [t("Completed by ", { size: 19, color: GREY }), t("………………………………………………", { size: 19, color: GHOST }), t("     Date ", { size: 19, color: GREY }), t("…………………………", { size: 19, color: GHOST })],
}));
body.push(new Paragraph({ children: [new PageBreak()] }));

// sections
SECTIONS.forEach((s, i) => {
  if (i > 0) body.push(new Paragraph({ children: [new PageBreak()] }));

  body.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 0, after: 40 },
    children: [
      t(s.n + "   ", { bold: true, size: 26, color: AMBER }),
      t(s.title, { bold: true, size: 28, color: SLATE }),
    ],
  }));
  body.push(new Paragraph({
    spacing: { after: 100, line: 280 },
    children: [t(s.why, { italics: true, size: 19, color: GREY })],
  }));
  body.push(rule(60));

  s.fields.forEach((f) => body.push(...field(f)));
});

// closing
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { after: 60 },
  children: [t("That's the lot", { bold: true, size: 28, color: SLATE })],
}));
body.push(rule(140));
body.push(new Paragraph({
  spacing: { after: 140, line: 300 },
  children: [t("Nothing here is set in stone — it's a starting point, and half of it will change once we see the site taking shape. Anything you left blank, flag it and we'll work through it on a call.", { size: 21 })],
}));
body.push(new Paragraph({
  spacing: { before: 120, after: 80 },
  children: [t("What to gather alongside this", { bold: true, size: 22, color: SLATE })],
}));
[
  "Logo files — the original vector versions if you can find them, not a screenshot",
  "Scheme and trade body badges (NICEIC, NAPIT and the rest)",
  "Insurance certificates",
  "Job photos — before and after, the biggest files you have, not the ones WhatsApp shrank",
  "Photos of you, the team and the van",
  "Any leaflets, business cards or old website wording",
].forEach((x) => body.push(new Paragraph({
  spacing: { after: 50, line: 270 },
  indent: { left: 200 },
  children: [t("☐   ", { size: 22, color: SLATE }), t(x, { size: 20 })],
})));

const doc = new Document({
  creator: "Website build brief",
  title: "Electrician website — build brief",
  description: "Intake questionnaire for an electrical contractor's website build",
  styles: {
    default: {
      document: { run: { font: FONT, size: 21, color: "1A1A1A" }, paragraph: { spacing: { line: 276 } } },
      heading1: { run: { font: FONT, size: 28, bold: true, color: SLATE }, paragraph: { spacing: { before: 0, after: 80 } } },
    },
  },
  sections: [{
    properties: { page: { margin: { top: 1000, right: 1100, bottom: 1000, left: 1100 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 8 } },
          children: [t("Website build brief          ", { size: 16, color: GREY }), t("", { size: 16 }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: GREY })],
        })],
      }),
    },
    children: body,
  }],
});

const out = process.argv[2] || "electrician-build-brief.docx";
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log("wrote " + out + "  (" + Math.round(buf.length / 1024) + " KB)");
});
