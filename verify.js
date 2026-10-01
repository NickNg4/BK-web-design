/**
 * Checks the three generated formats still agree with questions.js.
 *
 *   node verify.js
 *
 * Exits non-zero and says what is wrong if they do not. Run it after any change
 * to the questions, and before sending anything to the client.
 *
 * This exists because the question set used to be hand-maintained in three
 * places. They drifted silently: the web page lost three whole sections
 * (service areas, domain and email, budget and sign-off) plus most of "The
 * words" — 37 questions, 14 of them blockers — and nothing complained. Counting
 * the questions back out of each built file is the cheap way to notice.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { SECTIONS, counts, validate } = require('./questions');

const D = __dirname;
const problems = [];
const note = (s) => console.log('  ' + s);

function fail(where, msg) { problems.push(`${where}: ${msg}`); }

/** Pull a `SECTIONS = [...]` / `= {...}` literal out of a built file by brace matching. */
function extractLiteral(src, file) {
  const m = /SECTIONS\s*=\s*(\[|\{)/.exec(src);
  if (!m) throw new Error(`no SECTIONS literal in ${file}`);
  let i = m.index + m[0].length - 1, depth = 0, inStr = null;
  for (; i < src.length; i++) {
    const c = src[i], p = src[i - 1];
    if (inStr) { if (c === inStr && p !== '\\') inStr = null; continue; }
    if (c === '"' || c === "'" || c === String.fromCharCode(96)) { inStr = c; continue; }
    if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { depth--; if (depth === 0) break; }
  }
  // eslint-disable-next-line no-eval
  return eval(src.slice(m.index + m[0].length - 1, i + 1));
}

/**
 * A .docx is a zip. Pull word/document.xml out of it without a dependency:
 * walk the local file headers, inflate the one we want. Returns the question
 * labels that are not in the document, or null if it could not be read.
 */
function docxMissingQuestions(file) {
  let xml = null;
  try {
    const buf = fs.readFileSync(file);
    const zlib = require('zlib');
    let p = 0;
    while (p + 30 <= buf.length && buf.readUInt32LE(p) === 0x04034b50) {
      const flags = buf.readUInt16LE(p + 6);
      const method = buf.readUInt16LE(p + 8);
      const compSize = buf.readUInt32LE(p + 18);
      const nameLen = buf.readUInt16LE(p + 26);
      const extraLen = buf.readUInt16LE(p + 28);
      const name = buf.slice(p + 30, p + 30 + nameLen).toString('latin1');
      const dataAt = p + 30 + nameLen + extraLen;
      if (name === 'word/document.xml') {
        const raw = buf.slice(dataAt, dataAt + compSize);
        xml = (method === 0 ? raw : zlib.inflateRawSync(raw)).toString('utf8');
        break;
      }
      // Bit 3 means the sizes come after the data instead, so we cannot skip
      // the entry from the header alone. Directory entries are empty by nature
      // and are not that case.
      if (flags & 0x08) return null;
      p = dataAt + compSize;
    }
  } catch (e) {
    return null;
  }
  if (!xml) return null;

  // Match how the docx writer escapes text — it entity-encodes apostrophes and
  // quotes as well as the three that strictly need it.
  const esc = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
  return SECTIONS.flatMap((s) => s.fields)
    .map((f) => f.label)
    .filter((label) => !xml.includes(esc(label)));
}

/** The shape we compare on: what the client is actually asked, in order. */
function shape(secs, labelKey) {
  return secs.map((s) => ({
    n: s.n,
    title: s.title,
    fields: s.fields.map((f) => ({
      label: f[labelKey] !== undefined ? f[labelKey] : f.label,
      r: !!f.r,
      opts: f.opts ? f.opts.slice() : null,
      other: !!f.other,
    })),
  }));
}

/**
 * Compare a built format against canonical. `typeMap` accounts for a format
 * that cannot represent every input type — Google Forms has no tel/email/url.
 */
function compare(name, built, expected) {
  if (built.length !== expected.length) {
    fail(name, `${built.length} sections, expected ${expected.length}`);
    return;
  }
  expected.forEach((exp, i) => {
    const got = built[i];
    if (got.n !== exp.n) fail(name, `section ${i + 1} numbered "${got.n}", expected "${exp.n}"`);
    if (got.title !== exp.title) fail(name, `§${exp.n} titled "${got.title}", expected "${exp.title}"`);
    if (got.fields.length !== exp.fields.length) {
      fail(name, `§${exp.n} has ${got.fields.length} questions, expected ${exp.fields.length}`);
      return;
    }
    exp.fields.forEach((ef, j) => {
      const gf = got.fields[j];
      const at = `§${exp.n} Q${j + 1}`;
      if (gf.label !== ef.label) fail(name, `${at} asks "${gf.label}", expected "${ef.label}"`);
      if (gf.r !== ef.r) fail(name, `${at} blocker flag is ${gf.r}, expected ${ef.r}`);
      if (gf.other !== ef.other) fail(name, `${at} catch-all is ${gf.other}, expected ${ef.other}`);
      const a = JSON.stringify(gf.opts), b = JSON.stringify(ef.opts);
      if (a !== b) fail(name, `${at} choices differ\n      built:    ${a}\n      expected: ${b}`);
    });
  });
}

/* ------------------------------------------------------------------ */

console.log('questions.js');
validate();
const c = counts();
note(`valid — ${c.sections} sections, ${c.questions} questions, ${c.blockers} blockers`);
const expected = shape(SECTIONS, 'label');

/* ---- the web page ---- */
console.log('\nelectrician-intake.html');
const htmlPath = path.join(D, 'electrician-intake.html');
if (!fs.existsSync(htmlPath)) {
  fail('electrician-intake.html', 'missing — run `node build-html.js`');
} else {
  const html = fs.readFileSync(htmlPath, 'utf8');
  compare('electrician-intake.html', shape(extractLiteral(html, 'electrician-intake.html'), 'label'), expected);
  if (html.includes('__QUESTIONS__')) {
    fail('electrician-intake.html', 'still contains the template placeholder — the build did not run');
  }
  if (html.includes('<!--__PRIORITY__-->')) {
    fail('electrician-intake.html', 'the priority-sections placeholder was not filled in');
  }
  // The intro points the client at particular sections by number. Every number
  // it names has to be a section that exists — naming a removed one is exactly
  // how the page ended up telling the client to fill in a section that was not
  // there.
  const intro = /do a few sections, do ([^.<]+)\./.exec(html);
  if (!intro) {
    fail('electrician-intake.html', 'intro no longer names the priority sections');
  } else {
    intro[1].split(/,| and /).map((s) => s.trim()).filter(Boolean).forEach((n) => {
      if (!SECTIONS.some((s) => Number(s.n) === Number(n))) {
        fail('electrician-intake.html', `intro tells the client to do §${n}, which does not exist`);
      }
    });
  }
  note(`${Math.round(html.length / 1024)} KB, question set matches`);
}

/* ---- the Google Form script ---- */
console.log('\nbuild-intake-form.gs');
const gsPath = path.join(D, 'build-intake-form.gs');
if (!fs.existsSync(gsPath)) {
  fail('build-intake-form.gs', 'missing — run `node build-gs.js`');
} else {
  const gs = fs.readFileSync(gsPath, 'utf8');

  // Apps Script has no separate tel/email/url, so those legitimately arrive as
  // plain text. Everything the client reads must still match exactly.
  compare('build-intake-form.gs', shape(extractLiteral(gs, 'build-intake-form.gs'), 'label'), expected);

  // Syntax-check it the only way we can without an Apps Script runtime: copy to
  // a .js and let node parse it. Catches a broken generated literal before the
  // user spends an authorisation round trip finding out.
  const tmp = path.join(fs.mkdtempSync(path.join(require('os').tmpdir(), 'gs-')), 'check.js');
  fs.writeFileSync(tmp, gs);
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
    note('parses as JavaScript');
  } catch (e) {
    fail('build-intake-form.gs', `does not parse:\n${(e.stderr || '').toString().trim()}`);
  }

  // Every Forms API call the script makes must be one that exists.
  const KNOWN = ['addPageBreakItem', 'addParagraphTextItem', 'addMultipleChoiceItem',
                 'addCheckboxItem', 'addTextItem', 'showOtherOption', 'setChoiceValues',
                 'setTitle', 'setHelpText', 'setDestination'];
  (gs.match(/\.(add|show|setChoice)[A-Za-z]+\(/g) || []).forEach((call) => {
    const nm = call.slice(1, -1);
    if (!KNOWN.includes(nm)) fail('build-intake-form.gs', `unrecognised Forms call ${nm}()`);
  });
}

/* ---- the Word document ---- */
console.log('\nelectrician-build-brief.docx');
const docxPath = path.join(D, 'electrician-build-brief.docx');
if (!fs.existsSync(docxPath)) {
  fail('electrician-build-brief.docx', 'missing — run `node build-docx.js`');
} else {
  // Can't diff a .docx as text, so check it is newer than the questions and that
  // build-docx.js really reads from canonical rather than its own old copy.
  const builder = fs.readFileSync(path.join(D, 'build-docx.js'), 'utf8');
  if (!/require\(["']\.\/questions["']\)/.test(builder)) {
    fail('build-docx.js', 'does not require ./questions — it has its own copy of the questions again');
  }
  // Read the questions back out of the .docx itself. Timestamps are no use —
  // a fresh clone gives every file the same checkout time, so an mtime
  // comparison here would pass or fail at random.
  const missing = docxMissingQuestions(docxPath);
  if (missing === null) {
    fail('electrician-build-brief.docx', 'could not be read as a .docx — regenerate it');
  } else if (missing.length) {
    fail('electrician-build-brief.docx',
      `${missing.length} question(s) missing — run \`node build-docx.js\`\n`
      + missing.slice(0, 5).map((m) => `      · ${m}`).join('\n')
      + (missing.length > 5 ? `\n      · …and ${missing.length - 5} more` : ''));
  } else {
    note(`${Math.round(fs.statSync(docxPath).size / 1024)} KB, all ${c.questions} questions present`);
  }
}

/* ------------------------------------------------------------------ */

if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length > 1 ? 's' : ''}:\n`);
  problems.forEach((p) => console.error('  ✗ ' + p));
  console.error('\nRebuild with: node build-html.js && node build-gs.js && node build-docx.js');
  process.exit(1);
}

console.log('\nAll three formats agree with questions.js.');
console.log('Reminder: the published web page is NOT updated by this build. Republish it to');
console.log('the artifact URL the client already has, or their link stops working (HANDOVER.md).');
