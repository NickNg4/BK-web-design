/**
 * Electrician website intake — Google Form generator
 * -------------------------------------------------
 * Builds a 17-section Google Form with ~95 questions, plus a linked
 * spreadsheet that collects the answers.
 *
 * HOW TO RUN
 *   1. Go to script.google.com and click New project.
 *   2. Delete whatever is in the editor, paste this whole file in.
 *   3. Press Save, then Run. Pick buildIntakeForm if asked which function.
 *   4. Google will ask you to authorise it — it needs permission to create
 *      a form and a spreadsheet in your own Drive. Click through the
 *      "unverified app" warning via Advanced > Go to project.
 *   5. Open View > Logs (or the Execution log panel). It prints three links:
 *      the form to send out, the editor, and the responses spreadsheet.
 *
 * A NOTE ON REQUIRED QUESTIONS
 *   Nothing is marked required. Google Forms refuses to submit at all while
 *   a required answer is blank, and on a 95-question form filled in over
 *   several sittings that turns one unknown licence number into an
 *   abandoned form. The questions that block the build are marked with a
 *   star in the title instead, and listed on the intro page. Chase those.
 */

var FORM_TITLE = 'Electrician Website — Build Brief';

var FORM_INTRO = [
  'Everything needed to build your website, in one pass.',
  '',
  'Fill in what you know. Skip anything that does not apply — a half-answer',
  'beats a blank, because "not sure" tells us what to chase.',
  '',
  'Questions marked with a star (*) are the ones that actually block the',
  'build. Four things stall these projects more than anything else:',
  'no usable job photos, no licence and insurance numbers, nobody can log',
  'in to the domain, and nobody has decided who writes the words.',
  '',
  'It saves as you go and you can come back to it — when you submit, keep',
  'the "Edit your response" link that appears, and you can carry on later',
  'or correct anything.'
].join('\n');

var CONFIRMATION = [
  'Got it — thank you.',
  '',
  'Keep the "Edit your response" link above. It lets you come back and fill',
  'in anything you skipped, or fix something you got wrong, without',
  'starting again.'
].join('\n');

/**
 * t: text | area | one | many
 * r: true  -> blocks the build (marked with a star)
 */
var SECTIONS = [
  {
    n: '01', title: 'Where you operate',
    why: 'Decides which licensing bodies, tax display, privacy law and consumer-rights notices apply. Everything else hangs off this.',
    fields: [
      { t: 'text', r: true, label: 'Country', hint: 'e.g. United Kingdom' },
      { t: 'text', r: true, label: 'State, county or region', hint: 'e.g. West Midlands' },
      { t: 'text', label: 'Languages the site must be in', hint: 'e.g. English. Welsh version for the Powys jobs?' }
    ]
  },
  {
    n: '02', title: 'The business on paper',
    why: 'Goes in the footer, the legal pages and every directory listing. It has to match your other records letter for letter.',
    fields: [
      { t: 'text', r: true, label: 'Registered legal name', hint: 'e.g. Hartley Electrical Services Ltd' },
      { t: 'text', r: true, label: 'Trading name customers actually say', hint: 'e.g. Hartley Electrical' },
      { t: 'text', label: 'Company or business registration number' },
      { t: 'text', label: 'VAT / GST / ABN / EIN number', hint: 'Leave blank if you are not registered — that is a normal answer, and it changes how prices are shown.' },
      { t: 'one', r: true, label: 'Prices on the site should read', opts: ['Including tax', 'Excluding tax', 'No prices on the site at all'] },
      { t: 'area', label: 'Registered address' },
      { t: 'area', label: 'Workshop, unit or depot address', hint: 'Only if different from the registered one.' },
      { t: 'text', label: 'Year you started' },
      { t: 'text', label: 'Owner or director names, spelled as you want them printed' },
      { t: 'text', label: 'Who is on the books', hint: 'e.g. 3 electricians, 1 apprentice, 1 in the office' }
    ]
  },
  {
    n: '03', title: 'Licences, insurance, memberships',
    why: 'The strongest trust signal on an electrician’s site. Someone deciding between you and a rival looks for these before anything else.',
    fields: [
      { t: 'text', r: true, label: 'Electrical licence or registration number' },
      { t: 'text', r: true, label: 'Who issued it', hint: 'e.g. NICEIC, NAPIT, SELECT, state licensing board' },
      { t: 'text', label: 'Renewal or expiry date' },
      { t: 'many', label: 'Schemes and trade bodies you are a member of', other: true,
        opts: ['NICEIC', 'NAPIT', 'ELECSA', 'SELECT', 'RECI', 'Part P registered', 'Master Electricians', 'NECA', 'IBEW', 'TrustMark', 'Which? Trusted Trader', 'SafeContractor', 'CHAS', 'Constructionline'] },
      { t: 'many', label: 'Qualifications worth putting on the page', other: true,
        opts: ['18th Edition (BS 7671)', 'C&G 2391 inspection & testing', 'C&G 2919 EV charging', 'NVQ Level 3', 'JIB / ECS Gold Card', 'MCS solar PV'] },
      { t: 'text', r: true, label: 'Public liability — cover amount and insurer', hint: 'e.g. £5m, Aviva' },
      { t: 'text', label: 'Employers’ liability — cover amount and insurer' },
      { t: 'text', label: 'Professional indemnity — cover amount' },
      { t: 'many', label: 'Site tickets and safety cards',
        opts: ['CSCS / ECS card', 'IPAF', 'PASMA', 'Working at heights', 'Asbestos awareness', 'Confined space', 'First aid', 'Manual handling'] },
      { t: 'one', label: 'Background checks on staff',
        hint: 'Matters more than you would think to people letting a stranger into the house.',
        opts: ['Everyone is checked', 'Some staff', 'None', 'Not relevant — commercial only'] },
      { t: 'one', r: true, label: 'Can you send the logo file for each scheme you belong to?',
        hint: 'Most schemes hand members a badge pack. Displaying one you are not entitled to is a real problem, so we only use what you can evidence.',
        opts: ['Yes, I will send them', 'I will need help finding them', 'No'] }
    ]
  },
  {
    n: '04', title: 'What you actually do',
    why: 'Your top earners get a page each — that is where the enquiries come from. The rest get a line on a list.',
    fields: [
      { t: 'many', label: 'Domestic work', other: true,
        opts: ['Full and partial rewires', 'Consumer unit / fuse board upgrades', 'EICR inspection & testing', 'Landlord certificates', 'PAT testing', 'Fault finding', 'Sockets & switches', 'Indoor lighting design', 'Garden & outdoor lighting', 'EV charger install', 'Solar PV & battery storage', 'Smart home / automation', 'CCTV & alarms', 'Data & network cabling', 'Kitchen & bathroom electrics', 'Underfloor heating', 'Garage & outbuilding supply', 'Hot tub supply', 'New build first & second fix', 'Electric showers & cookers'] },
      { t: 'many', label: 'Commercial and industrial work', other: true,
        opts: ['Commercial EICR', 'Fire alarm install & testing', 'Emergency lighting', 'Three-phase work', 'Shop & office fit-out', 'Machinery & control panels', 'Distribution boards', 'Data centre / comms rooms', 'Landlord & agent contracts', 'Planned maintenance contracts', 'Street & car park lighting', 'Generators & UPS'] },
      { t: 'area', r: true, label: 'Your top three to five earners, best first',
        hint: 'Be honest about what pays, not what is interesting. These decide the shape of the whole site.' },
      { t: 'area', label: 'Jobs you do NOT want the phone ringing about',
        hint: 'Just as valuable. Every wasted call costs you twenty minutes.' },
      { t: 'one', label: 'Emergency callout', opts: ['24/7, genuinely', 'Evenings and weekends', 'Business hours only', 'No emergency work'] },
      { t: 'text', label: 'Response time you would put in writing', hint: 'e.g. on site within 2 hours inside the ring road' },
      { t: 'one', label: 'EV chargers — approval status',
        opts: ['Grant-approved installer (OZEV or equivalent)', 'Manufacturer approved', 'I install them, no formal approvals', 'Do not do EV work'] },
      { t: 'text', label: 'Brands you are approved or certified for', hint: 'e.g. Zappi, Ohme, Tesla, GivEnergy, Hypervolt' }
    ]
  },
  {
    n: '05', title: 'Where you will travel',
    why: 'Each named town can earn its own page, and those pages are how you show up for "electrician near me". "And surrounding areas" earns nothing.',
    fields: [
      { t: 'text', r: true, label: 'Postcode or suburb you work out of' },
      { t: 'area', r: true, label: 'Every town, suburb or postcode you cover — all of them',
        hint: 'Write them out. Twenty names beats a radius, because people search the name of their own town.' },
      { t: 'text', label: 'How far you will travel' },
      { t: 'text', label: 'What you charge beyond that' },
      { t: 'text', label: 'Three areas you would most like more work in' }
    ]
  },
  {
    n: '06', title: 'Money',
    why: 'Published prices filter out tyre-kickers before they ring. Hidden prices get more calls, more of them wasted. Your call — but decide it deliberately.',
    fields: [
      { t: 'one', r: true, label: 'Do we publish prices?', opts: ['Yes — show everything', 'Some — fixed-price jobs only', 'No — quote on request'] },
      { t: 'text', label: 'Call-out fee' },
      { t: 'text', label: 'Hourly rate' },
      { t: 'text', label: 'Day rate' },
      { t: 'text', label: 'Minimum charge' },
      { t: 'text', label: 'Out-of-hours and emergency rate' },
      { t: 'area', label: 'Fixed-price jobs you are happy to see in print',
        hint: 'e.g. EICR 3-bed: £180 / consumer unit change: £550 / EV charger: £899' },
      { t: 'one', label: 'Quotes', opts: ['Free, always', 'Free inside my area', 'Chargeable, refunded against the job', 'Chargeable'] },
      { t: 'many', label: 'How customers can pay',
        opts: ['Bank transfer', 'Card', 'Cash', 'Cheque', 'Direct debit', 'Finance / pay monthly', 'Trade account'] },
      { t: 'text', label: 'Deposit terms' }
    ]
  },
  {
    n: '07', title: 'How people reach you',
    why: 'On a phone the call button is the whole website. Everything else is there to make someone press it.',
    fields: [
      { t: 'text', r: true, label: 'Main phone number' },
      { t: 'text', label: 'Emergency or out-of-hours number' },
      { t: 'text', label: 'WhatsApp number', hint: 'People will happily send a photo of a scorched socket at 9pm.' },
      { t: 'text', r: true, label: 'Main email address' },
      { t: 'text', label: 'Where quote requests should land', hint: 'If it is a different inbox from the main one.' },
      { t: 'one', r: true, label: 'Street address on the site',
        hint: 'Plenty of electricians work from home and would rather not publish it. Town-only still works for local search.',
        opts: ['Yes, full address', 'Town or suburb only', 'No address at all'] },
      { t: 'area', r: true, label: 'Opening hours, written how you would say them',
        hint: 'e.g. Mon–Fri 7.30am–5.30pm, Sat 8am–1pm, Sun emergencies only' },
      { t: 'one', label: 'How you would rather be contacted', opts: ['Phone call', 'Enquiry form', 'WhatsApp or text', 'Whatever suits them'] },
      { t: 'text', label: 'Who picks up the phone and watches the inbox' },
      { t: 'text', label: 'How fast do you reply to an emailed enquiry, realistically?',
        hint: 'We will put your real number on the page. A promise you can keep beats a better-sounding one you cannot.' }
    ]
  },
  {
    n: '08', title: 'Your look',
    why: 'The site should be recognisably the same outfit as the van that pulls up. Matching them is free and does a lot of work.',
    fields: [
      { t: 'one', r: true, label: 'Logo files you can send',
        hint: 'A vector file (.svg, .ai, .eps) stays sharp at any size. A logo lifted off a JPG goes fuzzy the moment it is enlarged.',
        opts: ['I have the vector files', 'Only a JPG or PNG', 'No logo yet'] },
      { t: 'text', label: 'Your colours', hint: 'e.g. van is navy with lime green lettering' },
      { t: 'one', label: 'Brand guidelines document', opts: ['Yes', 'No'] },
      { t: 'one', label: 'Photos of the van livery and uniform', opts: ['Yes, can send', 'No'] }
    ]
  },
  {
    n: '09', title: 'Photos and video',
    why: 'The commonest reason one of these builds stalls. Real photos of your own work outsell stock images by a distance — visitors can tell, even if they cannot say how.',
    fields: [
      { t: 'one', r: true, label: 'Before-and-after job photos', opts: ['Plenty, decent quality', 'A handful of phone shots', 'None'] },
      { t: 'one', r: true, label: 'Do you have the customer’s permission to publish those photos?',
        hint: 'Inside someone’s home, you need it. A one-line text asking is usually enough — keep the reply.',
        opts: ['Yes, for all of them', 'For some', 'Have not asked', 'Not relevant — commercial only'] },
      { t: 'one', label: 'Photos of you and the team',
        hint: 'A real face beats a stock model every time. It does not need to be a studio shot.',
        opts: ['Yes', 'No', 'Happy to get some taken'] },
      { t: 'one', label: 'Van or fleet photos', opts: ['Yes', 'No'] },
      { t: 'one', label: 'Video footage', opts: ['Have some', 'Would film some', 'None'] },
      { t: 'one', r: true, label: 'If the photos are thin, what is the plan?',
        hint: 'Decide now rather than at launch. A half-day with a photographer usually pays for itself.',
        opts: ['Book a photographer', 'I will shoot on my phone to a brief', 'Use stock images', 'Not decided'] }
    ]
  },
  {
    n: '10', title: 'Proof you are any good',
    why: 'Claims about quality persuade nobody. Named customers, real jobs and a written guarantee do.',
    fields: [
      { t: 'text', label: 'Google Business Profile link' },
      { t: 'area', label: 'Other review profiles', hint: 'Checkatrade, Trustpilot, MyBuilder, Rated People, Yelp, Angi — paste the links' },
      { t: 'text', label: 'Roughly how many reviews, and the average score' },
      { t: 'area', label: 'Testimonials you are allowed to publish',
        hint: 'Quote, first name, town. A specific one about a difficult job beats five saying "great service".' },
      { t: 'area', r: true, label: 'Three to six jobs worth writing up properly',
        hint: 'For each: what was wrong, what you did, what it cost or saved them. These become the pages that win the bigger work.' },
      { t: 'text', label: 'Commercial clients you are allowed to name' },
      { t: 'text', label: 'Awards or recognition' },
      { t: 'text', r: true, label: 'Your workmanship guarantee, word for word',
        hint: 'Whatever you already tell people on the doorstep. It belongs on every page.' }
    ]
  },
  {
    n: '11', title: 'Domain, email and what exists now',
    why: 'Access is what delays launches, not building. Pointing a domain at a new site can knock out your email if nobody knows where it is hosted — so we find out first, not on launch day.',
    fields: [
      { t: 'text', r: true, label: 'Your domain name, or the one you want' },
      { t: 'one', r: true, label: 'Who can log in and change the domain settings?',
        opts: ['Me, and I have the login', 'My old web person', 'No idea', 'No domain yet'] },
      { t: 'text', r: true, label: 'Where your email is hosted',
        hint: 'If you genuinely do not know, write "don’t know" — we can look it up. Guessing is what breaks things.' },
      { t: 'text', label: 'Current website address' },
      { t: 'text', label: 'What it is built on and who hosts it' },
      { t: 'one', label: 'The current site', opts: ['Replace it completely', 'Keep some of the pages', 'There is not one'] },
      { t: 'one', r: true, label: 'Google Business Profile',
        hint: 'The map listing with your reviews on it. Often worth more traffic than the website itself.',
        opts: ['Claimed, I have access', 'Claimed by someone else', 'Not claimed', 'Do not know what that is'] },
      { t: 'area', label: 'Social accounts', hint: 'Facebook, Instagram, TikTok, LinkedIn, YouTube — paste the links' },
      { t: 'one', label: 'Existing Google Analytics or Search Console', opts: ['Yes, I have access', 'Yes, but no access', 'No', 'Do not know'] }
    ]
  },
  {
    n: '12', title: 'What the site is for',
    why: 'A site built to ring the phone looks different from one built to look credible when a facilities manager checks you out. It cannot be excellent at both.',
    fields: [
      { t: 'one', r: true, label: 'The one thing the site must do',
        opts: ['Make the phone ring', 'Fill in a quote form', 'Book jobs into the diary', 'Look credible when people check you out'] },
      { t: 'many', label: 'Who you want more of',
        opts: ['Homeowners', 'Landlords', 'Letting & estate agents', 'Builders & contractors', 'Commercial property / facilities', 'Industrial', 'Shops & hospitality', 'Other trades'] },
      { t: 'text', label: 'Enquiries a month now, and where they come from' },
      { t: 'text', label: 'Where you want that number' },
      { t: 'area', label: 'Two or three competitor sites you like, and why' },
      { t: 'area', label: 'Two or three you do not, and why' },
      { t: 'area', r: true, label: 'Why should someone pick you over the next electrician?',
        hint: 'Plain words, the way you would say it to a customer on the doorstep. This becomes the headline.' }
    ]
  },
  {
    n: '13', title: 'What the site needs to do',
    why: 'Each feature is build time and something to maintain. Pick what you will actually use.',
    fields: [
      { t: 'many', label: 'Features you want',
        opts: ['Quote request form', 'Photo upload of the fault', 'Online booking / calendar', 'WhatsApp button', 'Live chat', 'Sticky emergency call bar', 'Blog / advice articles', 'Photo gallery', 'Service area map', 'Finance calculator (EV / solar)', 'Customer certificate downloads', 'Recruitment page', 'Newsletter signup'] },
      { t: 'text', label: 'Job management software you already use',
        hint: 'If it has a booking widget we should plug into it rather than build a second diary you would forget to check. e.g. ServiceM8, Tradify, Jobber, Commusoft, Housecall Pro, none' },
      { t: 'area', label: 'What should the enquiry form ask?' },
      { t: 'text', label: 'Where form submissions should be emailed' },
      { t: 'one', label: 'Hiring?', opts: ['Yes — want a recruitment page', 'Maybe later', 'No'] },
      { t: 'one', label: 'Accessibility standard to build to',
        hint: 'Worth getting right — it also helps older customers, who are a big slice of domestic work.',
        opts: ['WCAG 2.2 AA', 'Best effort', 'Do not know — advise me'] }
    ]
  },
  {
    n: '14', title: 'The words',
    why: 'The single most common thing a half-finished website is waiting on. Decide who writes them before anything gets built.',
    fields: [
      { t: 'one', r: true, label: 'Who writes the text?', opts: ['I will write it', 'You write it, I will approve', 'Hire a copywriter', 'Reuse what already exists'] },
      { t: 'one', label: 'Existing wording we can reuse — leaflets, van, old site', opts: ['Yes, I will send it', 'No'] },
      { t: 'one', label: 'How it should sound', opts: ['Friendly local tradesman', 'Straight and professional', 'Premium, high-end', 'No preference'] },
      { t: 'area', r: true, label: 'Your story',
        hint: 'How you started, why you went out on your own, what you care about getting right. A few sentences in your own words is plenty — this is the About page and people do read it.' }
    ]
  },
  {
    n: '15', title: 'Legal bits',
    why: 'Small, dull, and the thing that gets forgotten until the week of launch.',
    fields: [
      { t: 'many', label: 'Documents you already have',
        opts: ['Privacy policy', 'Cookie policy', 'Terms & conditions', 'Complaints procedure', 'Cancellation notice', 'None of these'] },
      { t: 'text', label: 'Anything that has to appear in the footer', hint: 'Company number, registered office, scheme registration number' },
      { t: 'area', label: 'Your complaints procedure',
        hint: 'Several schemes require members to publish one. If you have wording from them, paste it here.' }
    ]
  },
  {
    n: '16', title: 'Budget, dates and who owns what',
    why: 'Worth being blunt about early. It changes what gets built, not whether anything does.',
    fields: [
      { t: 'text', r: true, label: 'Budget for the build' },
      { t: 'text', label: 'Monthly budget for hosting, upkeep and advertising' },
      { t: 'text', r: true, label: 'When it needs to be live, and why' },
      { t: 'one', label: 'Who pays for the domain and hosting after launch?', opts: ['Me, directly', 'You, bill me', 'Not decided'] },
      { t: 'one', r: true, label: 'Do you want to change the site yourself afterwards?',
        hint: 'This decides how it gets built. Retro-fitting an editor later is a rebuild.',
        opts: ['Yes, regularly', 'Occasionally', 'No, I would rather you did it'] },
      { t: 'one', label: 'How comfortable are you with a computer?',
        hint: 'No wrong answer. It decides how simple the editing has to be.',
        opts: ['Very', 'Average', 'Not at all'] },
      { t: 'one', label: 'Ongoing support', opts: ['Monthly retainer', 'Ad hoc, as needed', 'I will handle it', 'Not decided'] },
      { t: 'text', r: true, label: 'Who signs the design off — name and email',
        hint: 'One person. If your partner has a veto, name them here rather than at the end.' }
    ]
  },
  {
    n: '17', title: 'What you want to be found for',
    why: 'The phrases people type, not the ones you would use in the trade. Nobody searches "domestic electrical contracting solutions".',
    fields: [
      { t: 'area', label: 'Exactly what you want to come up for',
        hint: 'e.g. electrician Solihull / EV charger installer Birmingham / emergency electrician near me' },
      { t: 'text', label: 'Who comes up first when you search those now?' },
      { t: 'area', r: true, label: 'Your name, address and phone, written exactly as they appear everywhere else',
        hint: 'Letter for letter, including "Ltd", "Street" vs "St", and the spacing in the phone number. Inconsistency between your website, Google and the directories quietly costs you local ranking.' }
    ]
  }
];


function buildIntakeForm() {
  var form = FormApp.create(FORM_TITLE);
  form.setDescription(FORM_INTRO);
  form.setConfirmationMessage(CONFIRMATION);
  form.setProgressBar(true);
  form.setAllowResponseEdits(true);
  form.setShowLinkToRespondAgain(false);
  form.setCollectEmail(false);

  // Workspace-only settings. Harmless to skip on a personal account.
  try { form.setRequireLogin(false); } catch (e) {}

  var starred = 0;
  var total = 0;

  SECTIONS.forEach(function (section) {
    form.addPageBreakItem()
      .setTitle(section.n + '. ' + section.title)
      .setHelpText(section.why);

    section.fields.forEach(function (f) {
      var title = (f.r ? '* ' : '') + f.label;
      var item;

      switch (f.t) {
        case 'area':
          item = form.addParagraphTextItem();
          break;
        case 'one':
          item = form.addMultipleChoiceItem().setChoiceValues(f.opts);
          break;
        case 'many':
          item = form.addCheckboxItem().setChoiceValues(f.opts);
          if (f.other) { item.showOtherOption(true); }
          break;
        default:
          item = form.addTextItem();
      }

      item.setTitle(title);
      if (f.hint) { item.setHelpText(f.hint); }

      total++;
      if (f.r) { starred++; }
    });
  });

  // Responses land in their own spreadsheet, one row per submission.
  var sheet = SpreadsheetApp.create(FORM_TITLE + ' — responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  var out = [
    '',
    'Built "' + FORM_TITLE + '"',
    '  ' + SECTIONS.length + ' sections, ' + total + ' questions, ' + starred + ' of them flagged as blockers.',
    '',
    'SEND THIS ONE to the electrician:',
    '  ' + form.getPublishedUrl(),
    '',
    'Edit the form:',
    '  ' + form.getEditUrl(),
    '',
    'Answers arrive here:',
    '  ' + sheet.getUrl(),
    '',
    'Before sending: open the form, click Send, and check the link sharing',
    'suits you. A form on a personal Google account is open to anyone with',
    'the link by default, which is what you want here.',
    ''
  ].join('\n');

  Logger.log(out);
  return out;
}
