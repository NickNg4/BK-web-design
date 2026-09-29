/**
 * BK Electrician — everything the website says, in one place.
 * ===========================================================
 *
 * Anything in [square brackets] is a placeholder. On the page it shows up
 * highlighted, and the build lists every one that is left:
 *
 *   node website/build.js
 *
 * Fill a placeholder by replacing the whole bracketed value, e.g.
 *   phone: '[0400 000 000]'   ->   phone: '0412 345 678'
 *
 * Words in {braces} are filled in from `business` below — {region}, {rec},
 * {phone}, {baseSuburb}, {emergencyWhen}, {replyWithin}, {name}. Use them in
 * copy instead of repeating a fact, so each fact is typed once.
 *
 * When nothing in brackets is left, the "sample site" bar disappears on its
 * own, the call buttons start dialling, and the business details go into the
 * page's search-engine data. Nothing else needs editing to change the details.
 *
 * Victorian rules this site is built around:
 *   - A Registered Electrical Contractor must show its REC number on any
 *     advertising, which includes the website. It is in the header and the
 *     footer of every page.
 *   - All electrical installation work needs a Certificate of Electrical
 *     Safety. Prescribed work — switchboards, consumer mains, meter boxes,
 *     main earthing, solar and batteries — is also independently inspected
 *     by a Licensed Electrical Inspector.
 *   - From 13 October 2026 every Victorian rental needs an electrical safety
 *     check every two years, not just leases signed since March 2021.
 */

module.exports = {
  site: {
    // The planned domain. Change it if a different one is registered.
    url: 'https://www.bkelectrician.com.au',
    lang: 'en-AU',
  },

  business: {
    name: 'BK Electrician',
    legalName: '[Registered business name, exactly as on the ABN]',
    abn: '[00 000 000 000]',
    rec: '[00000]',                 // Registered Electrical Contractor number
    licence: '[A-grade licence number]',
    insurance: '[$20 million]',     // public liability cover

    phone: '[0400 000 000]',
    email: '[email address]',

    baseSuburb: '[Base suburb]',
    region: '[your area]',          // how locals name it, e.g. "Melbourne's south-east"
    // Most electricians work from home and would rather not publish it.
    // Town-only still works for local search.
    showStreetAddress: false,
    address: { street: '[Street address]', suburb: '[Suburb]', state: 'VIC', postcode: '[0000]' },

    owner: '[Owner name]',
    replyWithin: '[one business day]',  // how fast enquiries get an answer
    founded: '[Year]',

    hours: [
      ['Monday – Friday', '[7:00am – 5:00pm]'],
      ['Saturday', '[8:00am – 12:00pm]'],
      ['Sunday & public holidays', '[Emergencies only]'],
    ],

    // Set offered to false if he does not do after-hours work; the emergency
    // page and every mention of it disappear.
    emergency: { offered: true, when: '[24/7]' },

    google: { rating: '[4.9]', count: '[00]', url: '' },
    socials: { facebook: '', instagram: '' },

    // Drop the logo file into website/images/ and name it here, e.g. 'logo.svg'.
    // Until then the header uses a plain wordmark.
    logo: null,

    // Trade association badges, only ones he can evidence.
    memberships: ['[Trade association]', '[Trade association]'],
  },

  // How the enquiry form sends. 'none' shows a sample message instead of
  // sending. 'netlify' works with no set-up when the site is hosted on Netlify.
  // 'formspree' needs the endpoint from formspree.io.
  form: {
    provider: 'none',
    endpoint: '',
    // Formspree's free plan does not take attachments. Netlify's does.
    allowPhotos: true,
  },

  home: {
    headline: 'Electricians you can count on across {region}',
    lead: 'Switchboards, safety checks, EV chargers and everyday repairs — done properly, tested, and certified. Local, licensed, and on time.',
    // Timely: the rental rules change on 13 October 2026. Set to null later.
    notice: {
      text: 'From 13 October 2026, every Victorian rental needs an electrical safety check every two years — not just leases signed since 2021.',
      link: 'rental-safety-checks.html',
      cta: 'Book a rental safety check',
    },
    why: [
      ['Licensed and registered', 'A-grade licensed electricians, registered with Energy Safe Victoria as REC {rec}.'],
      ['Certified, every time', 'Every installation job comes with a Certificate of Electrical Safety — your legal proof it was done to standard.'],
      ['Upfront pricing', 'A clear, fixed quote before we start. No surprises on the invoice.'],
      ['[Your differentiator]', '[Why someone should pick you over the next electrician — in plain words, the way you would say it on the doorstep.]'],
    ],
    steps: [
      ['Call or send photos', 'Tell us what is going on. A photo of the problem often lets us quote on the spot.'],
      ['Get a fixed quote', 'You know the price before any work starts.'],
      ['We do the job', 'On time, tidy, and tested before we leave.'],
      ['You get certified', 'A Certificate of Electrical Safety for the installation work, lodged with Energy Safe Victoria.'],
    ],
  },

  // Services. `page: true` gets its own page (the work that pays — see §04 of
  // the brief); the rest get a line on the services page. Confirm this list
  // against what he actually does.
  services: [
    {
      slug: 'rental-safety-checks', cta: 'Book a rental safety check in {region}', icon: 'clipboard', page: true,
      name: 'Rental electrical safety checks',
      short: 'The two-yearly check every Victorian rental now needs. Written report included.',
      lead: 'Victorian rental providers must have the electrical installation checked every two years by a licensed electrician. From 13 October 2026 that applies to every rental agreement — including leases signed before March 2021.',
      price: 'From [$000]',
      included: [
        'Switchboard, wiring and power points checked',
        'Hardwired light fittings inspected',
        'Safety switches (RCDs) tested',
        'Checked to section 4 of AS/NZS 3019',
        'Written report for your records',
        'Quote for anything that needs fixing — no pressure',
      ],
      whoFor: [
        'Landlords and rental providers',
        'Property managers and real estate agents',
        'Owners with a lease starting soon',
      ],
      faq: [
        ['How often does a rental need a check?', 'Every two years. If a new renter moves in and there has not been a check in the last two years, one is needed as soon as practicable.'],
        ['Does it cover gas as well?', 'No — the gas safety check needs a licensed gasfitter. [We can recommend one we work with.]'],
        ['How long does it take?', '[About an hour for a typical house.] The renter does not need to move out.'],
        ['What if something fails?', 'You get the report and a fixed quote for the repair. Nothing is done without your go-ahead.'],
      ],
      photo: 'service-rental',
    },
    {
      slug: 'switchboard-upgrades', cta: 'Get your switchboard upgrade quoted', icon: 'switchboard', page: true,
      name: 'Switchboard upgrades & safety switches',
      short: 'Old fuses out, modern circuit breakers and safety switches in.',
      lead: 'An old switchboard with ceramic fuses and no safety switches is the most common reason a house is not as safe as its owners think. An upgrade brings it up to current standards and leaves room for what you plan to add next.',
      price: 'From [$000]',
      included: [
        'New switchboard with circuit breakers',
        'Safety switches (RCDs) on power and lighting circuits',
        'Circuits tested and clearly labelled',
        'Capacity for air conditioning, an EV charger or solar',
        'Independent inspection by a Licensed Electrical Inspector — required for switchboard work in Victoria',
        'Certificate of Electrical Safety',
      ],
      whoFor: [
        'Older homes with ceramic fuses',
        'Power that trips or lights that flicker',
        'Anyone adding an EV charger, solar or a big appliance',
        'Buyers who want an older house made safe',
      ],
      faq: [
        ['What is a safety switch?', 'A safety switch (RCD) cuts the power in a fraction of a second when current leaks to earth — such as through a person. It is the single most effective protection against electric shock in the home.'],
        ['Will the power be off all day?', '[Usually a few hours. We tell you in advance and keep it as short as we can.]'],
        ['Do I need to contact the power company?', 'Sometimes the supply has to be disconnected by your distributor. If so, we arrange it.'],
      ],
      photo: 'service-switchboard',
    },
    {
      slug: 'ev-charger-installation', cta: 'Get your EV charger installed', icon: 'car', page: true,
      name: 'EV charger installation',
      short: 'Home and workplace chargers, installed and load-checked.',
      lead: 'A wall charger fills your car several times faster than a standard power point. We check your switchboard can take the load, run a dedicated circuit, and install it safely — so it charges overnight without tripping anything.',
      price: 'From [$0,000]',
      included: [
        'Switchboard and supply capacity check',
        'Dedicated circuit with safety switch protection',
        'Single-phase or three-phase chargers',
        'Neat cable runs, indoor or outdoor',
        'Set-up and a walk-through before we leave',
        'Certificate of Electrical Safety',
      ],
      whoFor: [
        'New EV owners',
        'Homes with solar that want to charge from it',
        'Businesses adding staff or customer charging',
      ],
      faq: [
        ['Which chargers do you install?', '[Brands you install or are approved for.]'],
        ['Will my switchboard need upgrading?', 'Sometimes. We check first and tell you before quoting, so there are no surprises.'],
        ['Can it charge from my solar?', 'Many chargers can prioritise solar. We will set it up if yours supports it.'],
      ],
      photo: 'service-ev',
    },
    {
      slug: 'emergency-electrician', cta: 'Electrical emergency? Call now.', icon: 'bolt', page: true, emergency: true,
      name: 'Emergency electrician',
      short: 'Power out, sparking or a burning smell? {emergencyWhen} call-outs.',
      lead: 'If part of the house has lost power, a breaker will not reset, or something is sparking or smells like it is burning, call us. We will talk you through making it safe while we are on the way.',
      price: '[Call-out fee]',
      included: [
        'Fault finding and repairs',
        'Power restored safely wherever possible',
        'Damaged outlets, switches and cables replaced',
        'Clear explanation of what went wrong',
      ],
      whoFor: [
        'Loss of power to part of the house',
        'A breaker or safety switch that keeps tripping',
        'Sparking, scorch marks or a burning smell',
        'Water near electrics after a storm',
      ],
      faq: [
        ['What should I do right now?', 'If there is smoke, fire or someone has had a shock, call 000 first. If it is safe to reach, switch off the main switch at the switchboard.'],
        ['The whole street is dark — is that you?', 'That is an outage on the network. Check your electricity distributor’s outage page — it is not something an electrician can fix.'],
        ['A powerline is down — what do I do?', 'Stay at least eight metres away — about two car lengths — and call 000. Do not touch it, or anything it is touching.'],
      ],
      photo: 'service-emergency',
    },
    { slug: 'lighting', icon: 'bulb', name: 'Lighting', short: 'LED downlights, pendant and feature lighting, outdoor and security lights.' },
    { slug: 'power-points', icon: 'plug', name: 'Power points & USB outlets', short: 'Extra power points where you actually need them, including USB-C outlets.' },
    { slug: 'fault-finding', icon: 'wrench', name: 'Fault finding & repairs', short: 'Tripping power, dead circuits and things that stopped working.' },
    { slug: 'smoke-alarms', icon: 'alarm', name: 'Smoke alarms', short: 'Hardwired and interconnected smoke alarms, installed and tested.' },
    { slug: 'fans', icon: 'fan', name: 'Ceiling & exhaust fans', short: 'Ceiling fans, bathroom and kitchen exhaust fans.' },
    { slug: 'renovations', icon: 'home', name: 'Renovations & extensions', short: 'Kitchens, bathrooms and extensions, from rough-in to fit-off.' },
    { slug: 'data', icon: 'data', name: 'Data, TV & phone points', short: 'Data cabling, TV points and network outlets.' },
    { slug: 'commercial', icon: 'building', name: 'Commercial electrical', short: 'Fit-outs, maintenance and repairs for shops, offices and warehouses.' },
  ],

  // Every suburb he covers. Named suburbs beat "and surrounding areas" —
  // people search the name of their own suburb.
  areas: [
    '[Base suburb]', '[Suburb 2]', '[Suburb 3]', '[Suburb 4]', '[Suburb 5]', '[Suburb 6]',
    '[Suburb 7]', '[Suburb 8]', '[Suburb 9]', '[Suburb 10]', '[Suburb 11]', '[Suburb 12]',
  ],
  travel: '[How far you travel, and whether a call-out fee applies beyond it.]',

  // Real reviews only — paste them from Google with the customer's first name.
  reviews: [
    { quote: '[A real customer review from Google. A specific one about a real job works best.]', name: '[First name]', suburb: '[Suburb]' },
    { quote: '[A second review — ideally about a different kind of job.]', name: '[First name]', suburb: '[Suburb]' },
    { quote: '[A third review — landlords and property managers are worth including.]', name: '[First name]', suburb: '[Suburb]' },
  ],

  about: {
    headline: 'Local, licensed, and [your years] years on the tools',
    story: [
      '[How you started — where you did your apprenticeship, and when you went out on your own.]',
      '[What you care about getting right. The thing customers thank you for.]',
      '[Who is on the team, and what they are like to deal with.]',
    ],
  },

  privacy: {
    // Delete the status line once the policy has been checked.
    status: '[Template — have this checked before launch, and update it if the way enquiries are handled changes.]',
    records: '[where job records are kept, e.g. your job management software]',
    updated: '[date]',
  },

  // Photos. Until a real file is set in `src`, each slot shows a placeholder
  // that describes the shot needed — so the placeholders double as the shot
  // list. Put files in website/images/ and set src to the file name.
  // Set src to false to drop a slot altogether; the layout closes up.
  photos: {
    hero: { src: null, w: 1600, h: 1100, alt: 'An electrician from BK Electrician at work',
      brief: 'You or the team on a real job, or the van outside a customer’s house. Landscape, bright, in focus.' },
    about: { src: null, w: 1200, h: 1400, alt: '[Owner name], owner of BK Electrician',
      brief: 'You, in uniform, on site. A friendly face beats a studio shot — and beats a stock photo every time.' },
    'service-rental': { src: null, w: 1400, h: 900, alt: 'Electrical safety check at a rental property',
      brief: 'Testing at a switchboard, tester in hand. No tenant belongings in shot.' },
    'service-switchboard': { src: null, w: 1400, h: 900, alt: 'A newly upgraded switchboard',
      brief: 'A finished switchboard — labelled, tidy. A before/after pair is even better.' },
    'service-ev': { src: null, w: 1400, h: 900, alt: 'EV charger installed in a garage',
      brief: 'A finished wall charger in a garage, ideally with a car plugged in.' },
    'service-emergency': { src: null, w: 1400, h: 900, alt: 'The BK Electrician van',
      brief: 'The van — signwritten if possible. Night shots work well for emergency work.' },
    'work-1': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'Before/after: an old fuse board and the new switchboard.' },
    'work-2': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'Finished lighting — downlights or a feature pendant, lights on.' },
    'work-3': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'An EV charger or a new outdoor light — neat cable work.' },
    'work-4': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'A kitchen or bathroom renovation, finished.' },
    'work-5': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'A commercial job — shop, office or warehouse.' },
    'work-6': { src: null, w: 900, h: 700, alt: 'The team', brief: 'The team together, or with the van.' },
    map: { src: null, w: 1200, h: 800, alt: 'Map of the area BK Electrician covers',
      brief: 'A simple map of your service area — or we swap this for an embedded Google map.' },
  },
};
