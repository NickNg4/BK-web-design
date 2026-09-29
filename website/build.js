/**
 * Builds the BK Electrician website from content.js.
 *
 *   node website/build.js
 *
 * Output goes to website/dist — a plain static site with no dependencies.
 * Upload that folder to any host (Netlify, Cloudflare Pages, cPanel...).
 *
 * The build also reports every placeholder still to fill and every photo
 * still needed. While any placeholder remains, the site marks itself as a
 * sample: a banner on every page, and search engines are asked not to index
 * it — so a half-finished site cannot end up in Google with "[0400 000 000]"
 * as the phone number.
 */
const fs = require('fs');
const path = require('path');
const C = require('./content');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');
const IMAGES = path.join(ROOT, 'images');
const B = C.business;

/* ------------------------------------------------------------------ */
/* placeholders                                                        */
/* ------------------------------------------------------------------ */

const PH = /\[[^\]\n]+\]/g;
const isPh = (s) => typeof s === 'string' && /\[[^\]\n]+\]/.test(s);

/** Every placeholder in content.js, with where it lives. */
function findPlaceholders(node, at = '', out = []) {
  if (typeof node === 'string') {
    (node.match(PH) || []).forEach((m) => out.push({ at, value: m }));
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => findPlaceholders(v, `${at}[${i}]`, out));
  } else if (node && typeof node === 'object') {
    Object.entries(node).forEach(([k, v]) => findPlaceholders(v, at ? `${at}.${k}` : k, out));
  }
  return out;
}

// Only what the site actually shows counts. Photos are reported separately
// (their alt text is not something to fill), and a street address that is
// deliberately not published should not hold the site in sample mode forever.
const shown = { ...C, photos: undefined, business: { ...B } };
if (!B.showStreetAddress) delete shown.business.address;
if (!(B.emergency && B.emergency.offered)) {
  shown.services = C.services.filter((s) => !s.emergency);
  delete shown.business.emergency;
}
const placeholders = findPlaceholders(shown);

// src: null = still needed; src: false = slot dropped on purpose.
const photosNeeded = Object.entries(C.photos).filter(([, p]) => p.src == null);

const formLive = C.form.provider === 'netlify' || (C.form.provider === 'formspree' && !!C.form.endpoint);

// Launch-ready means: nothing in brackets, every photo in, and the form sends.
const SAMPLE = placeholders.length > 0 || photosNeeded.length > 0 || !formLive;

/* ------------------------------------------------------------------ */
/* escaping                                                            */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// {tokens} in copy are filled from `business`, so each fact is typed once.
const TOKENS = {
  name: B.name,
  region: B.region,
  baseSuburb: B.baseSuburb,
  rec: B.rec,
  phone: B.phone,
  replyWithin: B.replyWithin,
  emergencyWhen: B.emergency ? B.emergency.when : '',
};
const fill = (s) => String(s).replace(/\{(\w+)\}/g, (m, k) => {
  if (!(k in TOKENS)) throw new Error(`content.js uses {${k}}, which is not a known token. Known: ${Object.keys(TOKENS).join(', ')}`);
  return TOKENS[k];
});

/** Body text: escaped, with any placeholder highlighted. */
const t = (s) => esc(fill(s)).replace(PH, (m) => `<span class="ph">${m}</span>`);

/** Attribute or <title> text: escaped, placeholders left as plain text. */
const a = (s) => esc(fill(s));

/* ------------------------------------------------------------------ */
/* derived details                                                     */
/* ------------------------------------------------------------------ */

const phoneReal = !isPh(B.phone);
const emailReal = !isPh(B.email);

// +61 form for the dialler; 13/1300/1800 numbers are left as they are.
const telHref = phoneReal
  ? 'tel:' + B.phone.replace(/[^\d+]/g, '').replace(/^0(?=[2-9])/, '+61')
  : 'contact.html';
const mailHref = emailReal ? `mailto:${B.email}` : 'contact.html';

const emergencyOn = !!(B.emergency && B.emergency.offered);
const services = C.services.filter((s) => emergencyOn || !s.emergency);
const featured = services.filter((s) => s.page);
const serviceHref = (s) => (s.page ? `${s.slug}.html` : `services.html#${s.slug}`);
const SERVICE_SLUGS = new Set(C.services.map((s) => s.slug));

const year = new Date().getFullYear();

/* ------------------------------------------------------------------ */
/* icons — 24px line icons, drawn for this site                        */
/* ------------------------------------------------------------------ */

const ICONS = {
  bolt: '<path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2z"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5"/><path d="m9 13 2 2 4-4"/>',
  switchboard: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7v4M12 7v4M16 7v4"/><path d="M8 15h8"/>',
  car: '<path d="M5 16v-5l1.8-4.2A2 2 0 0 1 8.6 5.5h6.8a2 2 0 0 1 1.8 1.3L19 11v5"/><path d="M4 16h16v2.5H4z"/><path d="M12.6 8 11 11h2l-1.6 3"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
  plug: '<path d="M9 3v5M15 3v5"/><path d="M7 8h10v3a5 5 0 0 1-10 0V8z"/><path d="M12 16v5"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.7-5.7a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.3-.7-.7-2.3 2.6-2.6z"/>',
  alarm: '<path d="M4 5h16"/><path d="M6 5a6 6 0 0 0 12 0"/><circle cx="12" cy="8" r="1"/><path d="M8.5 15.5c1.2-1 2.3-1 3.5 0s2.3 1 3.5 0M8.5 19.5c1.2-1 2.3-1 3.5 0s2.3 1 3.5 0"/>',
  fan: '<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2C11.6 6 13 3.4 15.4 4c2 .5 1.5 3.9-3.4 6.2z"/><path d="M13.6 12.9c3.5 2.3 4.8 5 3 6.6-1.5 1.3-4.1-.9-3-6.6z"/><path d="M10.4 12.9c-3.9 1.8-6.8 1.7-7.2-.7-.3-2 3.1-3 7.2.7z"/>',
  home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
  data: '<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/>',
  building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16"/><path d="M15 9h4a1 1 0 0 1 1 1v11"/><path d="M8 8h3M8 12h3M8 16h3"/><path d="M3 21h18"/>',
  phone: '<path d="M21 16.5v3a2 2 0 0 1-2.2 2A19.5 19.5 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.4 10.9a16 16 0 0 0 4.7 4.7l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  shield: '<path d="M12 3 5 6v5.5c0 4.5 3 8 7 9.5 4-1.5 7-5 7-9.5V6l-7-3z"/><path d="m9 12 2 2 4-4"/>',
  certificate: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 8.5h10M7 12h6"/><circle cx="16" cy="16" r="2.5"/><path d="m14.8 18.2-.8 3.3 2-1 2 1-.8-3.3"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
};

function icon(name, cls = 'icon') {
  const filled = name === 'star' ? ' fill="currentColor"' : ' fill="none"';
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"${filled} stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

/* ------------------------------------------------------------------ */
/* photos                                                              */
/* ------------------------------------------------------------------ */

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((w) => {
    if ((line + ' ' + w).trim().length > maxChars && line) { lines.push(line); line = w; } else line = (line + ' ' + w).trim();
  });
  if (line) lines.push(line);
  return lines;
}

/** A placeholder image that says exactly which photo belongs there. */
function placeholderSvg(key, p) {
  const { w, h } = p;
  const fs1 = Math.max(18, Math.round(Math.min(w, h * 1.4) / 26));
  const fs2 = Math.round(fs1 * 0.78);
  const maxChars = Math.floor((w * 0.78) / (fs2 * 0.52));
  const lines = wrapText(p.brief, maxChars).slice(0, 5);
  const shape = w > h * 1.15 ? 'landscape' : w < h * 0.87 ? 'portrait' : 'square-ish';
  const cx = w / 2;
  const iconSize = fs1 * 2.2;
  const blockH = iconSize + fs1 * 1.9 + lines.length * fs2 * 1.35 + fs2 * 2.2;
  let y = (h - blockH) / 2;

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Photo needed">`);
  out.push('<defs><pattern id="s" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="28" height="28" fill="#e8ebe4"/><rect width="14" height="28" fill="#e2e6de"/></pattern></defs>');
  out.push(`<rect width="${w}" height="${h}" fill="url(#s)"/>`);
  const inset = Math.round(Math.min(w, h) * 0.035);
  out.push(`<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="none" stroke="#b5bdb0" stroke-width="3" stroke-dasharray="14 10" rx="10"/>`);
  // camera
  const s = iconSize / 24;
  out.push(`<g transform="translate(${cx - iconSize / 2} ${y}) scale(${s})" fill="none" stroke="#7d887f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/></g>`);
  y += iconSize + fs1 * 1.5;
  out.push(`<text x="${cx}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fs1}" font-weight="700" letter-spacing="1" fill="#3f4a42">PHOTO NEEDED</text>`);
  y += fs1 * 0.5;
  lines.forEach((ln) => {
    y += fs2 * 1.35;
    out.push(`<text x="${cx}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fs2}" fill="#4b5750">${esc(ln)}</text>`);
  });
  y += fs2 * 1.9;
  out.push(`<text x="${cx}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(fs2 * 0.85)}" fill="#6f7a72">${w} × ${h} px or larger · ${shape} · file: ${esc(key)}</text>`);
  out.push('</svg>');
  return out.join('\n');
}

/**
 * An image tag for a photo slot, or '' if the slot has been dropped (src: false).
 * `eager` is for the one image at the top of the page; everything else loads
 * as it scrolls into view.
 */
function photo(key, cls = '', eager = false) {
  const p = C.photos[key];
  if (!p) throw new Error(`content.js has no photo "${key}"`);
  if (p.src === false) return '';
  const src = p.src ? `assets/img/${p.src}` : `assets/ph/${key}.svg`;
  const alt = p.src ? p.alt : `Placeholder — photo needed: ${p.brief}`;
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<img class="${cls}" src="${src}" width="${p.w}" height="${p.h}" alt="${a(alt)}" ${loading}>`;
}

/** A photo beside text; the grid closes up to one column if the slot is dropped. */
function split(inner, key, cls = '') {
  const img = photo(key);
  return `<div class="wrap split${img ? '' : ' is-solo'}${cls ? ' ' + cls : ''}">
    ${inner}
    ${img ? `<figure class="split-media">${img}</figure>` : ''}
  </div>`;
}

/* ------------------------------------------------------------------ */
/* shared page parts                                                   */
/* ------------------------------------------------------------------ */

const NAV = [
  ['services.html', 'Services'],
  ['rental-safety-checks.html', 'Rental checks'],
  ['areas.html', 'Areas'],
  ['about.html', 'About'],
  ['contact.html', 'Contact'],
];

function brand() {
  if (B.logo) {
    return `<img class="brand-logo" src="assets/img/${a(B.logo)}" alt="${a(B.name)}" height="44">`;
  }
  return `<span class="brand-mark">${icon('bolt', 'brand-bolt')}</span><span class="brand-name">BK <b>Electrician</b></span>`;
}

function callButton(cls = 'btn btn-volt') {
  return `<a class="${cls}" href="${telHref}">${icon('phone')}<span>Call ${t(B.phone)}</span></a>`;
}

function stars(n = 5) {
  return `<span class="stars" aria-hidden="true">${icon('star').repeat(n)}</span>`;
}

// A blank rating hides every mention of it; a placeholder still shows, highlighted.
const googleOn = !!(B.google && B.google.rating && B.google.count);

function sampleBar() {
  if (!SAMPLE) return '';
  const left = [];
  if (placeholders.length) left.push(`${placeholders.length} placeholders`);
  if (photosNeeded.length) left.push(`${photosNeeded.length} photos`);
  if (!formLive) left.push('the enquiry form');
  const list = left.length > 1 ? `${left.slice(0, -1).join(', ')} and ${left[left.length - 1]}` : left[0];
  return `<div class="sample-bar" role="note"><div class="wrap"><strong>Sample site.</strong> <span class="ph">Highlighted text</span> is placeholder content. Still to do: ${list}. This bar disappears when they are done.</div></div>`;
}

function header(current) {
  // Only link pages that exist — dropping a service from content.js must not
  // leave a dead link in the menu.
  const items = NAV
    .filter(([href]) => !href.endsWith('.html') || !SERVICE_SLUGS.has(href.replace(/\.html$/, '')) || featured.some((s) => `${s.slug}.html` === href))
    .map(([href, label]) => `<li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`)
    .join('');
  return `
<a class="skip" href="#main">Skip to content</a>
${sampleBar()}
<div class="topbar">
  <div class="wrap">
    <span class="topbar-item">${icon('shield')}REC&nbsp;${t(B.rec)}</span>
    <span class="topbar-item hide-sm">Licensed &amp; insured electricians</span>
    <span class="topbar-item hide-sm">${icon('pin')}Servicing ${t(B.region)}, VIC</span>
    ${emergencyOn ? `<span class="topbar-item topbar-urgent">${icon('bolt')}${t(B.emergency.when)} emergency call-outs</span>` : ''}
  </div>
</div>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="index.html" aria-label="${a(B.name)} — home">${brand()}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
      <span class="nav-toggle-open">${icon('menu')}</span><span class="nav-toggle-close">${icon('close')}</span>
      <span class="visually-hidden">Menu</span>
    </button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>${items}</ul>
      <div class="nav-cta">
        <a class="btn btn-ghost" href="contact.html">Get a free quote</a>
        ${callButton('btn btn-volt')}
      </div>
    </nav>
  </div>
</header>`;
}

function footer() {
  const serviceLinks = featured.map((s) => `<li><a href="${serviceHref(s)}">${esc(s.name)}</a></li>`).join('')
    + '<li><a href="services.html">All services</a></li>';
  const hours = B.hours.map(([d, h]) => `<li><span>${esc(d)}</span><span>${t(h)}</span></li>`).join('');
  const where = B.showStreetAddress
    ? `${t(B.address.street)}, ${t(B.address.suburb)} ${t(B.address.state)} ${t(B.address.postcode)}`
    : `${t(B.baseSuburb)}, VIC`;
  return `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand brand-light" href="index.html">${brand()}</a>
      <p>Licensed electricians for homes, rentals and businesses across ${t(B.region)}.</p>
      <ul class="creds">
        <li>REC ${t(B.rec)}</li>
        <li>Licence ${t(B.licence)}</li>
        <li>ABN ${t(B.abn)}</li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Services</h2>
      <ul class="footer-links">${serviceLinks}</ul>
    </div>
    <div>
      <h2 class="footer-h">Contact</h2>
      <ul class="footer-contact">
        <li><a href="${telHref}">${icon('phone')}${t(B.phone)}</a></li>
        <li><a href="${mailHref}">${icon('mail')}${t(B.email)}</a></li>
        <li>${icon('pin')}<span>${where}</span></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Hours</h2>
      <ul class="footer-hours">${hours}</ul>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>© ${year} ${t(B.legalName)} trading as ${esc(B.name)}. ABN ${t(B.abn)}. REC ${t(B.rec)}.</p>
    <p><a href="privacy.html">Privacy</a> · <a href="areas.html">Areas we cover</a> · <a href="contact.html">Contact</a></p>
  </div>
</footer>
<div class="mobile-cta" aria-label="Quick contact">
  <a class="btn btn-volt" href="${telHref}">${icon('phone')}<span>Call now</span></a>
  <a class="btn btn-navy" href="contact.html">${icon('mail')}<span>Get a quote</span></a>
</div>`;
}

/** Search-engine data for the business. Placeholders are left out, never published. */
function structuredData() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    name: B.name,
    url: C.site.url,
    address: { '@type': 'PostalAddress', addressRegion: 'VIC', addressCountry: 'AU' },
  };
  if (!isPh(B.legalName)) ld.legalName = B.legalName;
  if (phoneReal) ld.telephone = B.phone;
  if (emailReal) ld.email = B.email;
  if (B.logo) ld.logo = `${C.site.url}/assets/img/${B.logo}`;
  const locality = B.showStreetAddress ? B.address.suburb : B.baseSuburb;
  if (!isPh(locality)) ld.address.addressLocality = locality;
  if (B.showStreetAddress && !isPh(B.address.street)) ld.address.streetAddress = B.address.street;
  if (B.showStreetAddress && !isPh(B.address.postcode)) ld.address.postalCode = B.address.postcode;
  const areas = C.areas.filter((x) => !isPh(x));
  if (areas.length) ld.areaServed = areas.map((name) => ({ '@type': 'Place', name: `${name}, VIC` }));
  if (!isPh(B.google.rating) && !isPh(B.google.count)) {
    ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: B.google.rating, reviewCount: B.google.count };
  }
  return `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

function layout({ file, title, description, body, current }) {
  const canonical = `${C.site.url}/${file === 'index.html' ? '' : file}`;
  return `<!doctype html>
<html lang="${C.site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${a(title)}</title>
<meta name="description" content="${a(description)}">
${SAMPLE ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<link rel="canonical" href="${a(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${a(title)}">
<meta property="og:description" content="${a(description)}">
<meta property="og:url" content="${a(canonical)}">
<meta property="og:locale" content="en_AU">
<meta name="theme-color" content="#0f2940">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap">
<link rel="stylesheet" href="assets/site.css">
<script>document.documentElement.classList.add('js')</script>
${structuredData()}
</head>
<body>
${header(current)}
<main id="main">
${body}
</main>
${footer()}
<script src="assets/site.js" defer></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* sections reused across pages                                        */
/* ------------------------------------------------------------------ */

function ctaBand(heading = `Need an electrician in ${B.region}?`, text = 'Call for a fixed quote, or send a few details and a photo and we will get back to you.') {
  return `
<section class="cta-band">
  <div class="wrap cta-inner">
    <div>
      <h2>${t(heading)}</h2>
      <p>${t(text)}</p>
    </div>
    <div class="cta-actions">
      ${callButton()}
      <a class="btn btn-outline-light" href="contact.html">Get a free quote</a>
    </div>
  </div>
</section>`;
}

function serviceCard(s) {
  return `
<a class="service-card" href="${serviceHref(s)}">
  <span class="service-icon">${icon(s.icon)}</span>
  <h3>${esc(s.name)}</h3>
  <p>${t(s.short)}</p>
  <span class="more">${s.page ? 'Find out more' : 'See details'} ${icon('arrow')}</span>
</a>`;
}

function reviewsSection() {
  if (!C.reviews.length) return '';
  const cards = C.reviews.map((r) => `
<figure class="review">
  ${stars()}
  <blockquote><p>${t(r.quote)}</p></blockquote>
  <figcaption>${t(r.name)}, ${t(r.suburb)}</figcaption>
</figure>`).join('');
  const rating = googleOn
    ? `<p class="rating-line">${stars()} <strong>${t(B.google.rating)}</strong> from ${t(B.google.count)} Google reviews</p>`
    : '';
  return `
<section class="section section-alt">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Reviews</p>
      <h2>What customers say</h2>
      ${rating}
    </div>
    <div class="reviews">${cards}</div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ */
/* pages                                                               */
/* ------------------------------------------------------------------ */

function homePage() {
  const H = C.home;
  const notice = H.notice ? `
<section class="notice">
  <div class="wrap notice-inner">
    <span class="notice-icon">${icon('clipboard')}</span>
    <p>${t(H.notice.text)}</p>
    <a class="btn btn-navy btn-sm" href="${H.notice.link}">${esc(H.notice.cta)} ${icon('arrow')}</a>
  </div>
</section>` : '';

  const trust = [
    ['certificate', 'Certificate of Electrical Safety on every installation job'],
    ['tag', 'Fixed, upfront quotes'],
    ['shield', `${B.insurance} public liability cover`],
  ];
  if (emergencyOn) trust.push(['bolt', `${B.emergency.when} emergency call-outs`]);

  const work = ['work-1', 'work-2', 'work-3', 'work-4', 'work-5', 'work-6']
    .map((k) => photo(k)).filter(Boolean)
    .map((img) => `<figure class="work-item">${img}</figure>`).join('');

  const areas = C.areas.slice(0, 8).map((x) => `<li>${t(x)}</li>`).join('');
  const heroImg = photo('hero', 'hero-img', true);
  const mapImg = photo('map');

  const body = `
<section class="hero">
  <div class="wrap hero-grid${heroImg ? '' : ' is-solo'}">
    <div class="hero-copy">
      <p class="eyebrow eyebrow-light">${icon('shield')} Licensed · Insured · REC ${t(B.rec)}</p>
      <h1>${t(H.headline)}</h1>
      <p class="lead">${t(H.lead)}</p>
      <div class="hero-actions">
        ${callButton('btn btn-volt btn-lg')}
        <a class="btn btn-outline-light btn-lg" href="contact.html">Get a free quote</a>
      </div>
      <ul class="trust">
        ${trust.map(([ic, txt]) => `<li>${icon(ic)}<span>${t(txt)}</span></li>`).join('')}
      </ul>
    </div>
    ${heroImg ? `<div class="hero-media">
      ${heroImg}
      ${googleOn ? `<div class="hero-badge">${stars()}<span><strong>${t(B.google.rating)}</strong> on Google</span></div>` : ''}
    </div>` : ''}
  </div>
</section>
${notice}
<section class="section">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">What we do</p>
      <h2>Electrical work for homes, rentals and businesses</h2>
      <p>From a single power point to a full switchboard upgrade — quoted upfront, done properly, and tested before we leave.</p>
    </div>
    <div class="services-grid">${services.slice(0, 8).map(serviceCard).join('')}</div>
    <p class="center"><a class="btn btn-ghost" href="services.html">All services ${icon('arrow')}</a></p>
  </div>
</section>

<section class="section section-alt">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Why ${esc(B.name)}</p>
      <h2>Done right the first time</h2>
    </div>
    <div class="why-grid">
      ${H.why.map(([h, p], i) => `<div class="why"><span class="why-n">0${i + 1}</span><h3>${t(h)}</h3><p>${t(p)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">How it works</p>
      <h2>Four steps, no surprises</h2>
    </div>
    <ol class="steps">
      ${H.steps.map(([h, p]) => `<li><h3>${t(h)}</h3><p>${t(p)}</p></li>`).join('')}
    </ol>
  </div>
</section>

${work ? `<section class="section section-alt">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Recent work</p>
      <h2>Jobs we are proud of</h2>
    </div>
    <div class="work-grid">${work}</div>
  </div>
</section>` : ''}

${reviewsSection()}

<section class="section">
  <div class="wrap areas-teaser${mapImg ? '' : ' is-solo'}">
    <div>
      <p class="eyebrow">Where we work</p>
      <h2>Local to ${t(B.region)}</h2>
      <p>Based in ${t(B.baseSuburb)} and working across the suburbs around it.</p>
      <ul class="chips">${areas}</ul>
      <a class="btn btn-ghost" href="areas.html">All areas we cover ${icon('arrow')}</a>
    </div>
    ${mapImg ? `<figure class="areas-map">${mapImg}</figure>` : ''}
  </div>
</section>

${ctaBand()}`;

  return layout({
    file: 'index.html',
    title: `${B.name} | Licensed Electrician in ${B.region}, VIC`,
    description: `${B.name} — licensed, insured electricians in ${B.region}. Switchboard upgrades, rental safety checks, EV chargers and repairs. REC ${B.rec}.`,
    body,
    current: 'index.html',
  });
}

function servicesPage() {
  const big = featured.map((s) => `
<a class="feature-card" href="${serviceHref(s)}">
  <span class="service-icon">${icon(s.icon)}</span>
  <div>
    <h3>${esc(s.name)}</h3>
    <p>${t(s.short)}</p>
    <span class="more">Find out more ${icon('arrow')}</span>
  </div>
</a>`).join('');

  const rest = services.filter((s) => !s.page).map((s) => `
<div class="service-row" id="${s.slug}">
  <span class="service-icon">${icon(s.icon)}</span>
  <div><h3>${esc(s.name)}</h3><p>${t(s.short)}</p></div>
</div>`).join('');

  const body = `
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>Services</span></nav>
    <h1>Electrical services</h1>
    <p class="lead">Everything from a new power point to a full switchboard upgrade, for homes, rentals and businesses across ${t(B.region)}.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    <h2 class="h-sub">Most requested</h2>
    <div class="feature-grid">${big}</div>
    <h2 class="h-sub">Everything else we do</h2>
    <div class="service-list">${rest}</div>
    <p class="muted-note">Not sure if we do it? <a href="${telHref}">Call ${t(B.phone)}</a> and ask — if it is not something we do, we will tell you who does.</p>
  </div>
</section>
${ctaBand()}`;

  return layout({
    file: 'services.html',
    title: `Electrical Services | ${B.name}`,
    description: `Switchboard upgrades, rental safety checks, EV chargers, lighting, power points and repairs across ${B.region}. Licensed and insured.`,
    body,
    current: 'services.html',
  });
}

function servicePage(s) {
  const related = featured.filter((x) => x.slug !== s.slug).map(serviceCard).join('');
  const faq = s.faq.map(([q, ans]) => `
<details class="faq">
  <summary>${t(q)}</summary>
  <p>${t(ans)}</p>
</details>`).join('');

  const body = `
<section class="page-hero">
  <div class="wrap page-hero-grid">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="services.html">Services</a> / <span>${esc(s.name)}</span></nav>
      <h1>${esc(s.name)}</h1>
      <p class="lead">${t(s.lead)}</p>
      <div class="hero-actions">
        ${callButton('btn btn-volt')}
        <a class="btn btn-outline-light" href="contact.html">Get a free quote</a>
      </div>
    </div>
    <div class="price-card">
      <span class="price-label">Price guide</span>
      <strong class="price">${t(s.price)}</strong>
      <span class="price-note">Fixed quote before any work starts.</span>
    </div>
  </div>
</section>
<section class="section">
  ${split(`<div>
      <h2>What’s included</h2>
      <ul class="checks">${s.included.map((x) => `<li>${icon('check')}<span>${t(x)}</span></li>`).join('')}</ul>
      <h2>Who it’s for</h2>
      <ul class="dots">${s.whoFor.map((x) => `<li>${t(x)}</li>`).join('')}</ul>
    </div>`, s.photo)}
</section>
<section class="section section-alt">
  <div class="wrap narrow">
    <h2>Common questions</h2>
    ${faq}
  </div>
</section>
${ctaBand(s.cta || `${s.name} in {region}`)}
<section class="section">
  <div class="wrap">
    <h2 class="h-sub">Other services</h2>
    <div class="services-grid services-grid-3">${related}</div>
  </div>
</section>`;

  return layout({
    file: `${s.slug}.html`,
    title: `${s.name} in ${B.region} | ${B.name}`,
    description: `${s.short} ${B.name}, licensed electricians in ${B.region}. REC ${B.rec}.`,
    body,
    current: s.slug === 'rental-safety-checks' ? 'rental-safety-checks.html' : 'services.html',
  });
}

function areasPage() {
  const list = C.areas.map((x) => `<li>${icon('pin')}<span>${t(x)}</span></li>`).join('');
  const body = `
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>Areas we cover</span></nav>
    <h1>Areas we cover</h1>
    <p class="lead">Based in ${t(B.baseSuburb)} and working across ${t(B.region)}. If your suburb is on the list, we cover it.</p>
  </div>
</section>
<section class="section">
  ${split(`<div>
      <h2>Suburbs we work in</h2>
      <ul class="area-list">${list}</ul>
      <p class="muted-note">${t(C.travel)}</p>
      <p>Not on the list? <a href="${telHref}">Call ${t(B.phone)}</a> — we may still be able to help.</p>
    </div>`, 'map')}
</section>
${ctaBand()}`;

  return layout({
    file: 'areas.html',
    title: `Areas We Cover | Electrician in ${B.region} | ${B.name}`,
    description: `${B.name} works across ${B.region}, VIC — ${C.areas.slice(0, 6).join(', ')} and nearby suburbs.`,
    body,
    current: 'areas.html',
  });
}

function aboutPage() {
  const creds = [
    ['Registered Electrical Contractor', `REC ${B.rec}`],
    ['Electrical licence', B.licence],
    ['Public liability insurance', B.insurance],
    ['ABN', B.abn],
    ['In business since', B.founded],
  ];
  const members = B.memberships.map((m) => `<li class="badge-slot">${t(m)}</li>`).join('');
  const body = `
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>About</span></nav>
    <h1>${t(C.about.headline)}</h1>
    <p class="lead">${esc(B.name)} is run by ${t(B.owner)} — a licensed A-grade electrician looking after homes, rentals and businesses across ${t(B.region)}.</p>
  </div>
</section>
<section class="section">
  ${split(`<div class="story">
      <h2>Our story</h2>
      ${C.about.story.map((p) => `<p>${t(p)}</p>`).join('')}
    </div>`, 'about')}
</section>
<section class="section section-alt">
  <div class="wrap split${members ? '' : ' is-solo'}">
    <div>
      <h2>Licences and insurance</h2>
      <p>Every electrician in Victoria must be licensed, and every business contracting for electrical work must be registered with Energy Safe Victoria. Here are ours — you are welcome to check them.</p>
      <dl class="creds-table">
        ${creds.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${t(v)}</dd></div>`).join('')}
      </dl>
    </div>
    ${members ? `<div>
      <h2>Memberships</h2>
      <ul class="badges">${members}</ul>
      <p class="muted-note">Badges shown only for memberships we can evidence.</p>
    </div>` : ''}
  </div>
</section>
${ctaBand()}`;

  return layout({
    file: 'about.html',
    title: `About Us | ${B.name}`,
    description: `Meet ${B.name}: licensed, insured electricians in ${B.region}. REC ${B.rec}.`,
    body,
    current: 'about.html',
  });
}

function contactPage() {
  const F = C.form;
  const provider = ['netlify', 'formspree'].includes(F.provider) ? F.provider : 'none';
  const action = provider === 'formspree' && F.endpoint ? F.endpoint : 'thank-you.html';
  const attrs = [
    'id="enquiry"', 'class="form"', 'name="enquiry"', 'method="POST"', `action="${a(action)}"`,
    `data-provider="${provider}"`, 'novalidate',
  ];
  if (provider === 'netlify') attrs.push('data-netlify="true"', 'netlify-honeypot="bot-field"');
  if (F.allowPhotos) attrs.push('enctype="multipart/form-data"');

  const options = services.map((s) => `<option>${esc(s.name)}</option>`).join('') + '<option>Something else</option>';
  const hours = B.hours.map(([d, h]) => `<li><span>${esc(d)}</span><span>${t(h)}</span></li>`).join('');

  const body = `
<section class="page-hero">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>Contact</span></nav>
    <h1>Get a free quote</h1>
    <p class="lead">Call for the fastest answer, or send the details below — a photo of the problem helps us quote accurately.</p>
  </div>
</section>
<section class="section">
  <div class="wrap contact-grid">
    <aside class="contact-card">
      <h2>Talk to us</h2>
      ${callButton('btn btn-volt btn-block')}
      <ul class="contact-list">
        <li>${icon('mail')}<a href="${mailHref}">${t(B.email)}</a></li>
        <li>${icon('pin')}<span>Based in ${t(B.baseSuburb)}, VIC</span></li>
        ${emergencyOn ? `<li>${icon('bolt')}<span>${t(B.emergency.when)} emergency call-outs</span></li>` : ''}
      </ul>
      <h3>Hours</h3>
      <ul class="footer-hours hours-dark">${hours}</ul>
      <p class="small">REC ${t(B.rec)} · ABN ${t(B.abn)}</p>
    </aside>

    <form ${attrs.join(' ')}>
      ${provider === 'netlify' ? '<input type="hidden" name="form-name" value="enquiry">' : ''}
      <p class="hp" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>

      <div class="field-row">
        <div class="field">
          <label for="f-name">Name <span class="req">*</span></label>
          <input id="f-name" name="name" type="text" autocomplete="name" required>
          <p class="field-error" id="f-name-err" hidden></p>
        </div>
        <div class="field">
          <label for="f-phone">Phone <span class="req">*</span></label>
          <input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required>
          <p class="field-error" id="f-phone-err" hidden></p>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="f-email">Email</label>
          <input id="f-email" name="email" type="email" autocomplete="email">
          <p class="field-error" id="f-email-err" hidden></p>
        </div>
        <div class="field">
          <label for="f-suburb">Suburb <span class="req">*</span></label>
          <input id="f-suburb" name="suburb" type="text" autocomplete="address-level2" required>
          <p class="field-error" id="f-suburb-err" hidden></p>
        </div>
      </div>
      <div class="field">
        <label for="f-service">What do you need?</label>
        <select id="f-service" name="service">${options}</select>
      </div>
      <div class="field">
        <label for="f-message">Tell us about the job <span class="req">*</span></label>
        <textarea id="f-message" name="message" rows="5" required placeholder="What’s happening, and roughly when you need it done."></textarea>
        <p class="field-error" id="f-message-err" hidden></p>
      </div>
      ${F.allowPhotos ? `
      <div class="field">
        <label for="f-photos">Photos <span class="optional">(optional)</span></label>
        <input id="f-photos" name="photos" type="file" accept="image/*" multiple>
        <p class="field-hint">A photo of the switchboard or the problem helps us quote. Up to 8 MB in total.</p>
        <p class="field-error" id="f-photos-err" hidden></p>
      </div>` : ''}
      <fieldset class="field">
        <legend>Best way to reach you</legend>
        <div class="radios">
          <label><input type="radio" name="contact_pref" value="Call" checked> Call</label>
          <label><input type="radio" name="contact_pref" value="Text"> Text</label>
          <label><input type="radio" name="contact_pref" value="Email"> Email</label>
        </div>
      </fieldset>
      <button class="btn btn-volt btn-lg" type="submit">Send enquiry ${icon('arrow')}</button>
      <p class="small">We reply within ${t(B.replyWithin)}. For anything urgent, call ${t(B.phone)}. See our <a href="privacy.html">privacy policy</a>.</p>
      <div class="form-status" role="status" aria-live="polite" hidden></div>
    </form>
  </div>
</section>`;

  return layout({
    file: 'contact.html',
    title: `Contact & Free Quotes | ${B.name}`,
    description: `Call ${B.name} on ${B.phone} or send an enquiry for a free, fixed quote. Licensed electricians in ${B.region}.`,
    body,
    current: 'contact.html',
  });
}

function thankYouPage() {
  const body = `
<section class="page-hero page-hero-short">
  <div class="wrap narrow center">
    <span class="big-check">${icon('check')}</span>
    <h1>Thanks — we have your enquiry</h1>
    <p class="lead">We will be in touch within ${t(B.replyWithin)}. If it is urgent, give us a call.</p>
    <div class="hero-actions hero-actions-center">
      ${callButton('btn btn-volt btn-lg')}
      <a class="btn btn-outline-light btn-lg" href="index.html">Back to home</a>
    </div>
  </div>
</section>`;
  return layout({ file: 'thank-you.html', title: `Thank you | ${B.name}`, description: 'Enquiry received.', body, current: '' });
}

function privacyPage() {
  const body = `
<section class="page-hero page-hero-short">
  <div class="wrap narrow">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <span>Privacy</span></nav>
    <h1>Privacy policy</h1>
    ${C.privacy.status ? `<p class="lead">${t(C.privacy.status)}</p>` : ''}
  </div>
</section>
<section class="section">
  <div class="wrap narrow prose">
    <h2>What we collect</h2>
    <p>When you contact us we collect what you choose to give us: your name, phone number, email address, suburb, details of the job, and any photos you send.</p>
    <h2>Why we collect it</h2>
    <p>Only to respond to your enquiry, quote for and carry out the work, issue certificates and invoices, and keep the records the law requires of an electrical contractor.</p>
    <h2>Who we share it with</h2>
    <p>We do not sell or rent your information. We share it only where needed to do the job — for example with your electricity distributor if the supply has to be disconnected — or where the law requires it.</p>
    <h2>Where it is stored</h2>
    <p>Enquiries sent through this website are delivered by ${formLive ? esc(C.form.provider === 'netlify' ? 'Netlify' : 'Formspree') : 'our form provider'}, which may store them on servers outside Australia. Job records are kept in ${t(C.privacy.records)}.</p>
    <h2>Seeing or correcting your information</h2>
    <p>Ask us at ${t(B.email)} or on ${t(B.phone)} and we will show you what we hold and correct anything that is wrong.</p>
    <h2>Complaints</h2>
    <p>If you are unhappy with how we have handled your information, tell us first and we will try to fix it. You can also contact the Office of the Australian Information Commissioner at oaic.gov.au.</p>
    <p class="small">Last updated ${t(C.privacy.updated)}.</p>
  </div>
</section>`;
  return layout({ file: 'privacy.html', title: `Privacy | ${B.name}`, description: `How ${B.name} handles your personal information.`, body, current: '' });
}

function notFoundPage() {
  const body = `
<section class="page-hero page-hero-short">
  <div class="wrap narrow center">
    <h1>That page has tripped out</h1>
    <p class="lead">We could not find what you were looking for. Try one of these instead.</p>
    <div class="hero-actions hero-actions-center">
      <a class="btn btn-volt btn-lg" href="index.html">Home</a>
      <a class="btn btn-outline-light btn-lg" href="services.html">Services</a>
      <a class="btn btn-outline-light btn-lg" href="contact.html">Contact</a>
    </div>
  </div>
</section>`;
  return layout({ file: '404.html', title: `Page not found | ${B.name}`, description: 'Page not found.', body, current: '' });
}

/* ------------------------------------------------------------------ */
/* write it all out                                                    */
/* ------------------------------------------------------------------ */

function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0f2940"/><path d="M36 8 16 36h14l-3 20 21-29H33l3-19z" fill="#ffc220"/></svg>`;
}

function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(path.join(DIST, 'assets', 'ph'), { recursive: true });
  fs.mkdirSync(path.join(DIST, 'assets', 'img'), { recursive: true });

  fs.copyFileSync(path.join(SRC, 'site.css'), path.join(DIST, 'assets', 'site.css'));
  fs.copyFileSync(path.join(SRC, 'site.js'), path.join(DIST, 'assets', 'site.js'));
  fs.writeFileSync(path.join(DIST, 'assets', 'favicon.svg'), favicon());

  // Photos: the real file if there is one, otherwise a placeholder that
  // describes the shot needed.
  Object.entries(C.photos).forEach(([key, p]) => {
    if (p.src) {
      const from = path.join(IMAGES, p.src);
      if (!fs.existsSync(from)) throw new Error(`photos.${key}.src is "${p.src}" but website/images/${p.src} does not exist`);
      fs.copyFileSync(from, path.join(DIST, 'assets', 'img', p.src));
    } else {
      fs.writeFileSync(path.join(DIST, 'assets', 'ph', `${key}.svg`), placeholderSvg(key, p));
    }
  });
  if (B.logo) {
    const from = path.join(IMAGES, B.logo);
    if (!fs.existsSync(from)) throw new Error(`business.logo is "${B.logo}" but website/images/${B.logo} does not exist`);
    fs.copyFileSync(from, path.join(DIST, 'assets', 'img', B.logo));
  }

  const pages = {
    'index.html': homePage(),
    'services.html': servicesPage(),
    'areas.html': areasPage(),
    'about.html': aboutPage(),
    'contact.html': contactPage(),
    'thank-you.html': thankYouPage(),
    'privacy.html': privacyPage(),
    '404.html': notFoundPage(),
  };
  featured.forEach((s) => { pages[`${s.slug}.html`] = servicePage(s); });

  // Every placeholder on a page must come from content.js, where the report
  // can see it. Checked on the visible text — a bracket typed straight into a
  // template here never passes through t(), so it would not be highlighted,
  // would not be reported, and would ship. Scripts are skipped: the
  // search-engine data legitimately contains JSON arrays.
  const known = new Set(placeholders.map((p) => esc(p.value)));
  Object.entries(pages).forEach(([file, html]) => {
    const token = /\{[a-z][A-Za-z]*\}/.exec(html);
    if (token) throw new Error(`${file} contains an unfilled ${token[0]} — copy passed through esc() instead of t() or a()`);
    const visible = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    const stray = (visible.match(/\[[^\]\n<>]+\]/g) || []).filter((m) => !known.has(m));
    if (stray.length) {
      throw new Error(`${file} shows ${stray.map((m) => `"${m}"`).join(', ')}, which is not in content.js. `
        + 'A placeholder has been typed into build.js — move it into content.js so the report can see it.');
    }
  });

  Object.entries(pages).forEach(([file, html]) => fs.writeFileSync(path.join(DIST, file), html));

  // Search engines: kept out entirely while this is still a sample.
  const indexable = Object.keys(pages).filter((f) => !['thank-you.html', '404.html'].includes(f));
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + indexable.map((f) => `  <url><loc>${C.site.url}/${f === 'index.html' ? '' : f}</loc></url>`).join('\n')
    + '\n</urlset>\n');
  fs.writeFileSync(path.join(DIST, 'robots.txt'), SAMPLE
    ? '# Sample site — placeholders still to fill. Not for indexing yet.\nUser-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${C.site.url}/sitemap.xml\n`);

  return Object.keys(pages);
}

const pages = build();

/* ------------------------------------------------------------------ */
/* report                                                              */
/* ------------------------------------------------------------------ */

console.log(`Built ${pages.length} pages -> ${path.relative(process.cwd(), DIST) || DIST}`);
console.log(`  ${pages.join('  ')}`);

if (placeholders.length) {
  console.log(`\n${placeholders.length} placeholders still to fill:`);
  placeholders.forEach(({ at, value }) => console.log(`  ${at.padEnd(26)} ${value}`));
}

if (photosNeeded.length) {
  console.log(`\n${photosNeeded.length} photos still needed (each placeholder image describes its shot):`);
  photosNeeded.forEach(([k, p]) => console.log(`  ${k.padEnd(20)} ${p.w}×${p.h}  ${p.brief}`));
}

console.log(`\nEnquiry form: ${formLive ? `sends via ${C.form.provider}` : "not connected — set form.provider to 'netlify', or 'formspree' plus form.endpoint"}`);

console.log(SAMPLE
  ? '\nStatus: SAMPLE — shows the sample bar, and asks search engines not to index it.'
  : '\nStatus: LAUNCH-READY — no placeholders, every photo in, form connected. Indexable.');
