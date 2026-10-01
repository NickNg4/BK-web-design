/**
 * End-to-end check of the built site in a real browser, the way a visitor
 * uses it. Run after `node website/build.js`:
 *
 *   npm run test:site
 *
 * Needs Chromium. `npx playwright install chromium` fetches one; or point
 * CHROMIUM_PATH at an existing binary.
 *
 * Checks every page at desktop and phone width (JS errors, sideways scroll,
 * one <h1>, alt text, every image actually loaded), every internal link and
 * #anchor, the phone menu, the enquiry form's validation and sample mode,
 * the contrast of every placeholder marker, and copy that has been wrong
 * before. Screenshots land in website/test/shots/.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const DIST = path.join(__dirname, '..', 'dist');
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const url = (f) => 'file://' + path.join(DIST, f);
const pages = fs.readdirSync(DIST).filter((f) => f.endsWith('.html')).sort();
const fail = [];
const note = (s) => console.log('  ' + s);

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  /* ---- 1. every page, desktop and phone ---- */
  console.log(`1. ${pages.length} pages at desktop and phone width`);
  let imagesChecked = 0;
  for (const [label, viewport] of [['desktop', { width: 1280, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport });
    for (const f of pages) {
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', (e) => errs.push(e.message));
      p.on('requestfailed', (r) => {
        if (!/fonts\.(googleapis|gstatic)\.com/.test(r.url())) errs.push('failed load: ' + r.url());
      });
      await p.goto(url(f));
      // Scroll the whole page so lazy images are requested, then wait for them;
      // otherwise an image below the fold is never actually checked.
      await p.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
        window.scrollTo(0, 0);
      });
      await p.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 10000 }).catch(() => {});
      const r = await p.evaluate(() => ({
        hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
        h1: document.querySelectorAll('h1').length,
        imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
        brokenImgs: [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute('src')),
        imgCount: document.images.length,
        navWrapped: [...document.querySelectorAll('#site-nav ul a')].filter((a) => a.getClientRects().length > 1 || a.offsetHeight > 48).map((a) => a.textContent),
        heroLazy: !!document.querySelector('.hero-img[loading="lazy"]'),
        // WCAG contrast of every placeholder marker against its own background
        lowContrast: (() => {
          const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
          const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
            .reduce((acc, v, i) => acc + v * [0.2126, 0.7152, 0.0722][i], 0);
          return [...document.querySelectorAll('.ph')].map((el) => {
            const cs = getComputedStyle(el);
            const a = lum(rgb(cs.color)), b = lum(rgb(cs.backgroundColor));
            return { text: el.textContent, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
          }).filter((x) => x.ratio < 4.5).map((x) => `${x.text} (${x.ratio.toFixed(1)}:1)`);
        })(),
        lang: document.documentElement.lang,
        undef: /\bundefined\b|\bNaN\b|\[object Object\]/.test(document.body.innerText),
      }));
      if (errs.length) fail.push(`${label} ${f}: ${errs.join('; ')}`);
      if (r.hScroll) fail.push(`${label} ${f}: scrolls sideways`);
      if (r.h1 !== 1) fail.push(`${label} ${f}: ${r.h1} <h1> elements`);
      if (r.imgsNoAlt) fail.push(`${label} ${f}: ${r.imgsNoAlt} images without alt`);
      if (r.brokenImgs.length) fail.push(`${label} ${f}: broken images ${r.brokenImgs.join(', ')}`);
      if (r.lang !== 'en-AU') fail.push(`${label} ${f}: lang="${r.lang}"`);
      if (r.undef) fail.push(`${label} ${f}: "undefined"/"NaN" in visible text`);
      if (label === 'desktop' && r.navWrapped.length) fail.push(`${label} ${f}: nav labels wrap: ${r.navWrapped.join(', ')}`);
      if (r.heroLazy) fail.push(`${f}: hero image is lazy-loaded`);
      if (r.lowContrast.length) fail.push(`${label} ${f}: placeholder text below 4.5:1 contrast: ${r.lowContrast.slice(0, 3).join('; ')}`);
      imagesChecked += r.imgCount;
      await p.close();
    }
    await ctx.close();
    note(`${label}: checked (${imagesChecked} images verified loaded so far)`);
  }

  /* ---- 2. every internal link resolves, including #anchors ---- */
  console.log('2. internal links');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  let links = 0;
  const idsByPage = {};
  for (const f of pages) {
    await p.goto(url(f));
    idsByPage[f] = await p.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
  }
  for (const f of pages) {
    await p.goto(url(f));
    const hrefs = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
    for (const h of hrefs) {
      if (/^(https?:|mailto:|tel:)/.test(h)) continue;
      links++;
      const [file, hash] = h.split('#');
      const target = file || f;
      if (!fs.existsSync(path.join(DIST, target))) { fail.push(`${f}: link to missing ${h}`); continue; }
      if (hash && !(idsByPage[target] || []).includes(hash)) fail.push(`${f}: link to missing anchor ${h}`);
    }
  }
  note(`${links} internal links checked`);

  /* ---- 3. mobile menu ---- */
  console.log('3. mobile menu');
  const m = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await m.goto(url('index.html'));
  const navVisible = () => m.evaluate(() => getComputedStyle(document.getElementById('site-nav')).display !== 'none');
  if (await navVisible()) fail.push('menu open before tapping');
  await m.click('.nav-toggle');
  if (!(await navVisible())) fail.push('menu did not open');
  if ((await m.getAttribute('.nav-toggle', 'aria-expanded')) !== 'true') fail.push('aria-expanded not true when open');
  await m.keyboard.press('Escape');
  if (await navVisible()) fail.push('Escape did not close the menu');
  const ctaShown = await m.evaluate(() => getComputedStyle(document.querySelector('.mobile-cta')).display !== 'none');
  if (!ctaShown) fail.push('sticky call bar missing at phone width');
  await m.screenshot({ path: path.join(SHOTS, 'home-phone.png') });
  await m.click('.nav-toggle');
  await m.screenshot({ path: path.join(SHOTS, 'menu-phone.png') });
  note('opens, closes on Escape, sticky call bar present');

  /* ---- 4. contact form ---- */
  console.log('4. enquiry form');
  const c = await (await browser.newContext({ viewport: { width: 1280, height: 1100 } })).newPage();
  await c.goto(url('contact.html'));
  await c.click('#enquiry button[type=submit]');
  const errs1 = await c.evaluate(() => [...document.querySelectorAll('.field-error')].filter((e) => !e.hidden).map((e) => e.id));
  const focused = await c.evaluate(() => document.activeElement && document.activeElement.id);
  if (errs1.join() !== 'f-name-err,f-phone-err,f-suburb-err,f-message-err') fail.push(`empty submit errors: ${errs1.join()}`);
  if (focused !== 'f-name') fail.push(`focus after empty submit on ${focused}, not the first bad field`);
  note(`empty submit -> ${errs1.length} errors, focus on #${focused}`);

  await c.fill('#f-name', 'Sam');
  await c.fill('#f-phone', '12345');
  await c.fill('#f-email', 'not-an-email');
  await c.fill('#f-suburb', 'Dandenong');
  await c.fill('#f-message', 'Safety switch keeps tripping.');
  await c.click('#enquiry button[type=submit]');
  const errs2 = await c.evaluate(() => [...document.querySelectorAll('.field-error')].filter((e) => !e.hidden).map((e) => e.id));
  if (errs2.join() !== 'f-phone-err,f-email-err') fail.push(`bad phone/email errors: ${errs2.join()}`);
  note(`bad phone + email -> ${errs2.join(', ')}`);

  for (const [num, ok] of [['0412 345 678', true], ['+61 412 345 678', true], ['(03) 9123 4567', true], ['1300 123 456', true], ['0412 345', false]]) {
    await c.fill('#f-phone', num);
    const valid = await c.evaluate(() => {
      document.getElementById('enquiry').dispatchEvent(new Event('submit', { cancelable: true }));
      return document.getElementById('f-phone').getAttribute('aria-invalid') !== 'true';
    });
    if (valid !== ok) fail.push(`phone "${num}" judged ${valid ? 'valid' : 'invalid'}`);
  }
  note('AU phone formats: mobile, +61, landline, 1300 accepted; short number rejected');

  await c.fill('#f-phone', '0412 345 678');
  await c.fill('#f-email', 'sam@example.com');
  await c.click('#enquiry button[type=submit]');
  const st = await c.evaluate(() => {
    const s = document.querySelector('.form-status');
    return { hidden: s.hidden, cls: s.className, text: s.textContent };
  });
  if (st.hidden || !/is-sample/.test(st.cls)) fail.push(`valid submit did not show the sample notice: ${JSON.stringify(st)}`);
  note(`valid submit -> "${st.text.slice(0, 60)}…"`);
  await c.screenshot({ path: path.join(SHOTS, 'contact.png'), fullPage: true });

  /* ---- 5. copy that has been wrong before ---- */
  console.log('5. copy checks');
  const home = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  if (/for prescribed work/.test(home)) fail.push('home still limits the COES to prescribed work');
  if (!/Certificate of Electrical Safety<\/dt><dd><span class="tick">✓<\/span> Every installation job/.test(home)) fail.push('COES line missing from the test sheet');
  for (const f of pages.filter((f) => /^(split|ducted|air-con|switchboard)/.test(f))) {
    const html = fs.readFileSync(path.join(DIST, f), 'utf8');
    const name = (html.match(/<h1>([^<]+)<\/h1>/) || [])[1] || '';
    const closing = html.match(/<section class="cta-band">[\s\S]*?<\/h2>/)[0];
    // the old template glued "Book" to the lower-cased service name
    if (name && closing.includes(`Book ${name.toLowerCase()}`)) fail.push(`${f}: closing heading reads "Book ${name.toLowerCase()}"`);
  }
  if (!/ARCtick/.test(home)) fail.push('ARCtick licence missing from the home test sheet');
  const recOnEvery = pages.filter((f) => !/REC&nbsp;<span class="ph">\[00000\]<\/span>|REC&nbsp;\d/.test(fs.readFileSync(path.join(DIST, f), 'utf8')));
  if (recOnEvery.length) fail.push(`REC number missing from the header of: ${recOnEvery.join(', ')}`);
  note('COES wording, service headings, REC on every page (required on advertising in Victoria)');

  /* ---- 6. screenshots ---- */
  const d = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await d.goto(url('index.html'));
  await d.screenshot({ path: path.join(SHOTS, 'home-desktop-top.png') });
  await d.screenshot({ path: path.join(SHOTS, 'home-desktop-full.png'), fullPage: true });
  await d.goto(url('split-system-installation.html'));
  await d.screenshot({ path: path.join(SHOTS, 'service-page.png'), fullPage: true });

  await browser.close();
  console.log(fail.length ? `\nFAILURES (${fail.length}):\n  ✗ ${fail.join('\n  ✗ ')}` : '\nAll checks passed.');
  process.exit(fail.length ? 1 : 0);
})();
