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
 * {phone}, {baseSuburb}, {emergencyWhen}, {replyWithin}, {name}, {owner},
 * {arctick}. Use them in
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
    arctick: '[ARCtick licence number]',  // refrigerant handling licence — needed to install split systems
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

  // Written in his voice — first person, plain words. Anything bracketed is a
  // claim only he can make: confirm it with him (§12, §14 of the brief) rather
  // than leaving our guess in.
  home: {
    greeting: "G'day, I'm {owner}.",
    headline: '[I turn up when I say I will.]',
    lead: 'I run {name} in {region}. Split systems and ducted air-con, installed and serviced by one licensed electrician who does the refrigeration work too — so you are not waiting on two trades. Quoted upfront, tested before I leave.',
    status: '[Taking new jobs this week]',
    directLine: 'Straight to my mobile',
    // Seasonal: installs book out before summer. Set to null in autumn.
    notice: {
      text: '[Summer installs book out early — get your quote in before December.] Victorian Energy Upgrades discounts may apply to efficient reverse-cycle systems.',
      link: 'split-system-installation.html',
      cta: 'Get a split system quote',
    },
    // The promises, as he would say them on the doorstep.
    promises: [
      ['On time, or I call', '[If I am running late, you hear it from me before the time we agreed — not after.]'],
      ['Price first', 'You get a fixed price before I start. The invoice matches the quote.'],
      ['Photo before I leave', '[I send you a photo of the finished work, and the certificate, before I drive away.]'],
      ['Tidy', '[Drop sheets down, dust gone, old parts taken away. You would not know I had been — apart from it working.]'],
    ],
    steps: [
      ['Call or text a photo', 'A photo of the room and your switchboard often gets you a price on the spot.'],
      ['Fixed quote', 'You know the price before any work starts.'],
      ['Job done, tested', 'On time, tidy, and tested before I leave.'],
      ['Certified', 'A Certificate of Electrical Safety, lodged with Energy Safe Victoria.'],
    ],
    // Published prices — the most specific thing a trade site can say, and
    // the thing competitors avoid. Delete any line he would rather quote.
    rates: [
      ['Split system, 2.5kW back-to-back install', 'from [$0,000]'],
      ['Split system, 7kW installed', 'from [$0,000]'],
      ['Ducted reverse-cycle', 'from [$00,000]'],
      ['Air-con service & clean (per unit)', '[$000]'],
      ['Dedicated air-con circuit', '[$000]'],
      ['Switchboard upgrade', 'from [$0,000]'],
    ],
    ratesNote: 'Prices include GST. Fixed quote before any work starts.',
  },

  // Services. `page: true` gets its own page (the work that pays — see §04 of
  // the brief); the rest get a line on the services page. Confirm this list
  // against what he actually does.
  services: [
    {
      slug: 'split-system-installation', cta: 'Get your split system quoted', icon: 'ac', page: true,
      name: 'Split system air conditioning',
      short: 'Reverse-cycle split systems, supplied and installed — cooling for summer, cheap heating for winter.',
      lead: 'A reverse-cycle split system is the cheapest way to cool a room in summer and heat it in winter. I size it for the room, mount it neatly, run a dedicated circuit, and do the refrigerant work myself — one licensed tradesman, start to finish, no second contractor to wait for.',
      price: 'From [$0,000] installed',
      included: [
        'Room sized properly — not just the biggest unit that fits',
        'Indoor and outdoor units mounted, pipework neatly covered',
        'Refrigerant work done under my ARCtick licence {arctick}',
        'Dedicated circuit and isolator, safety switch protected',
        'Tested, commissioned, and a run-through of the remote before I leave',
        'Certificate of Electrical Safety',
      ],
      whoFor: [
        'Rooms that cook in summer',
        'Homes moving off gas heating',
        'Bedrooms, home offices and granny flats',
        'Replacing an old or noisy unit',
      ],
      faq: [
        ['Can I get the Victorian Energy Upgrades discount?', '[If you are an accredited VEU provider: yes — eligible efficient reverse-cycle systems get an upfront discount, taken straight off the invoice. If not, say who you work with.]'],
        ['Which brands do you install?', '[Brands you install — e.g. Daikin, Mitsubishi Heavy Industries, Fujitsu.]'],
        ['Do I need a switchboard upgrade?', 'Sometimes. I check your switchboard and supply before quoting, so it is in the price — not a surprise on the day.'],
        ['How long does an install take?', '[Most back-to-back installs are done in half a day.]'],
      ],
      photo: 'service-split',
    },
    {
      slug: 'ducted-air-conditioning', cta: 'Get your ducted system quoted', icon: 'ducted', page: true,
      name: 'Ducted air conditioning',
      short: 'Whole-house ducted reverse-cycle, including swapping out old ducted gas heating.',
      lead: 'Ducted reverse-cycle heats and cools the whole house from one quiet system, with zones so you only run the rooms you use. It is also the usual replacement for old ducted gas heating — often with a Victorian Energy Upgrades discount.',
      price: 'From [$00,000]',
      included: [
        'Load calculation for the house, room by room',
        'Zoning so you only pay to run the rooms you use',
        'Ducting, outlets and a wall controller',
        'Old gas heater decommissioned [with a licensed gasfitter]',
        'Electrical supply and switchboard checked and upgraded if needed',
        'Certificate of Electrical Safety',
      ],
      whoFor: [
        'Replacing ducted gas heating',
        'New builds and extensions',
        'Larger homes where splits would mean four or five heads',
      ],
      faq: [
        ['Is the Victorian Energy Upgrades discount available?', '[Larger discounts apply when an efficient ducted reverse-cycle system replaces ducted gas heating — through an accredited provider. Say whether that is you.]'],
        ['Can you reuse my existing ducts?', 'Sometimes. Old gas ducting is often the wrong size or poorly insulated for cooling — I check before quoting.'],
        ['How long does it take?', '[Usually two to three days for a typical house.]'],
      ],
      photo: 'service-ducted',
    },
    {
      slug: 'air-conditioning-service-repairs', cta: 'Book an air-con service', icon: 'wrench', page: true,
      name: 'Air-con servicing & repairs',
      short: 'Cleans, re-gassing and repairs — before the first heatwave, not during it.',
      lead: 'A dirty or under-gassed system works harder, costs more to run and fails on the hottest day of the year. A service before summer catches most problems while there is still time to fix them.',
      price: 'From [$000] per unit',
      included: [
        'Filters, coils and drain cleaned',
        'Refrigerant pressures checked, topped up if needed',
        'Electrical connections and isolator checked',
        'Fault finding on units that will not start, leak or ice up',
        'Written note of anything that needs attention',
      ],
      whoFor: [
        'Systems not serviced in the last year or two',
        'Units that smell, drip, or blow warm air',
        'Landlords — add it to the rental safety check visit',
      ],
      faq: [
        ['How often should it be serviced?', '[Once a year for most homes — before summer is ideal.]'],
        ['Do you fix brands you did not install?', '[Yes — most major brands.]'],
        ['My unit is old — repair or replace?', 'I will tell you straight. If a repair costs more than a year or two of the savings a new efficient unit would bring, replacing usually wins.'],
      ],
      photo: 'service-servicing',
    },
    {
      slug: 'switchboard-upgrades', cta: 'Get your switchboard upgrade quoted', icon: 'switchboard', page: true,
      name: 'Switchboard & power upgrades',
      short: 'Old fuses out, circuit breakers and safety switches in — with room for air-con and more.',
      lead: 'Most older Victorian switchboards were never meant to run several air conditioners. An upgrade brings the board up to current standards and gives your air-con, EV charger or solar the capacity it needs — without tripping on the first hot night.',
      price: 'From [$0,000]',
      included: [
        'New switchboard with circuit breakers',
        'Safety switches (RCDs) on power and lighting circuits',
        'Dedicated circuits for air conditioning',
        'Circuits tested and clearly labelled',
        'Independent inspection by a Licensed Electrical Inspector — required for switchboard work in Victoria',
        'Certificate of Electrical Safety',
      ],
      whoFor: [
        'Older homes with ceramic fuses',
        'Power that trips when the air-con kicks in',
        'Anyone adding air-con, an EV charger or solar',
      ],
      faq: [
        ['What is a safety switch?', 'A safety switch (RCD) cuts the power in a fraction of a second when current leaks to earth — such as through a person. It is the single most effective protection against electric shock in the home.'],
        ['Will the power be off all day?', '[Usually a few hours. I tell you in advance and keep it as short as I can.]'],
        ['Do I need to contact the power company?', 'Sometimes the supply has to be disconnected by your distributor. If so, I arrange it.'],
      ],
      photo: 'service-switchboard',
    },
    { slug: 'rental-safety-checks', icon: 'clipboard', name: 'Rental electrical safety checks', short: 'The two-yearly check every Victorian rental needs from 13 October 2026. Written report included.' },
    { slug: 'emergency', icon: 'bolt', emergency: true, name: 'Breakdowns & emergencies', short: 'Air-con dead in a heatwave, or power out? {emergencyWhen} call-outs.' },
    { slug: 'ev-chargers', icon: 'car', name: 'EV charger installation', short: 'Home chargers installed and load-checked against your air-con and switchboard.' },
    { slug: 'power-points', icon: 'plug', name: 'Power points & lighting', short: 'Extra power points, USB outlets, LED downlights and outdoor lighting.' },
    { slug: 'fans', icon: 'fan', name: 'Ceiling & exhaust fans', short: 'Ceiling fans, bathroom and kitchen exhaust fans.' },
    { slug: 'fault-finding', icon: 'alarm', name: 'Fault finding & smoke alarms', short: 'Tripping power, dead circuits, and hardwired smoke alarms.' },
    { slug: 'commercial', icon: 'building', name: 'Commercial air-con & electrical', short: 'Shops, offices and small commercial — installs, servicing and maintenance.' },
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
      brief: 'You installing a split system — outdoor unit or indoor head — or the van outside a job. Landscape, bright, in focus.' },
    about: { src: null, w: 1200, h: 1400, alt: '[Owner name], owner of BK Electrician',
      brief: 'You, in uniform, on site. A friendly face beats a studio shot — and beats a stock photo every time.' },
    'service-split': { src: null, w: 1400, h: 900, alt: 'A split system air conditioner installed by BK Electrician',
      brief: 'A finished indoor head on a wall — neat, level, pipework covered. Outdoor unit on its bracket as a second shot.' },
    'service-ducted': { src: null, w: 1400, h: 900, alt: 'Ducted air conditioning installation',
      brief: 'Ceiling outlets in a finished room, or you in the roof space mid-install.' },
    'service-servicing': { src: null, w: 1400, h: 900, alt: 'Servicing an air conditioner',
      brief: 'Cleaning a head with the cover off, or gauges on an outdoor unit.' },
    'service-switchboard': { src: null, w: 1400, h: 900, alt: 'A newly upgraded switchboard',
      brief: 'A finished switchboard — labelled, tidy, with the air-con circuits visible.' },
    'work-1': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'A split system head, installed — clean wall, no messy pipework.' },
    'work-2': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'An outdoor unit on a neat bracket or pad.' },
    'work-3': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'Ducted outlets or a zone controller in a finished room.' },
    'work-4': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'Before/after: an old fuse board and the new switchboard.' },
    'work-5': { src: null, w: 900, h: 700, alt: 'Recent job', brief: 'A commercial job — shop, office or warehouse.' },
    'work-6': { src: null, w: 900, h: 700, alt: 'The team', brief: 'The team together, or with the van.' },
    map: { src: null, w: 1200, h: 800, alt: 'Map of the area BK Electrician covers',
      brief: 'A simple map of your service area — or we swap this for an embedded Google map.' },
  },
};
