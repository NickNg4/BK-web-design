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
// Questions come from questions.js — the single source of truth. This file only
// decides how they look on paper. `q` is this builder's own name for a question
// label, aliased here so the layout code below reads unchanged.
const { SECTIONS: CANON, counts, validate, priorityPhrase } = require("./questions");
validate();
const SECTIONS = CANON.map((s) => ({
  ...s,
  fields: s.fields.map((f) => ({ ...f, q: f.label })),
}));

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
    // Free-text catch-all: a ruled line rather than a grey box, so it reads as
    // part of the list above rather than a question of its own.
    if (f.other) {
      out.push(new Paragraph({
        spacing: { before: 60, after: 30, line: 260 },
        indent: { left: 200 },
        children: [
          t((f.otherLabel || "Anything not on that list") + " — ", { size: 19, color: GREY, italics: true }),
          t("……………………………………………………………", { size: 19, color: GHOST }),
        ],
      }));
    }
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
  children: [t("No usable job photos. No licence and insurance numbers. Nobody can log in to the domain. Nobody has decided who writes the words. If you do nothing else, do sections " + priorityPhrase() + ".", { size: 21 })],
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
  const c = counts();
  console.log(`wrote ${out}  (${Math.round(buf.length / 1024)} KB)  `
    + `${c.sections} sections, ${c.questions} questions, ${c.blockers} blockers`);
});
