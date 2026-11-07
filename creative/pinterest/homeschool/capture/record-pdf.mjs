#!/usr/bin/env node
/**
 * Homeschooling Companion, pin assets #88 and #80: a REAL "My Homeschool
 * Record" PDF for the demo household.
 *
 * Runs the product's own code in Node: buildBook() (src/products/
 * homeschooling-companion/book.ts) builds the Book, HomeschoolRecordDocument
 * (printables/document.tsx, @react-pdf/renderer) draws it, exactly as
 * printables/download.tsx does in the browser (same two fonts, same
 * hyphenation callback). Nothing here lays out, words or counts anything:
 * every number on the state page is what stateComplianceRows() computes.
 *
 * THE DEMO DATA is only what the real app screens show
 * (creative/public/screens/homeschooling-companion-{kids,record,workspace}.png):
 *   Ava, age 9, Homeschool, Math Journey (Math), Reading; position
 *   "Lesson 4: Halves and quarters" (the Today screen); log 4 Oct 2026
 *   "Math, Lesson 3: Thirds" Easy / No help needed, "Reading, Chapter 6"
 *   Not finished; one note on 5 Oct 2026 that the Record screen shows as
 *   "Kept private". Section ticks are the app's defaults (log and notes on,
 *   checks off), as on the Record screen. Printed 8 October 2026 (the
 *   Today screen's date). Nothing else is invented: no checks, no topics.
 *
 * Writes, under creative/out/homeschool/assets/ (gitignored):
 *   record-oregon.pdf   record-pa.pdf   record-pa-sharednote.pdf
 *   record-<oregon|pa|pa-sharednote>-p<N>.png   (pdftoppm -r 200)
 *   record-pages.md     (which page is which, plus the text of each page)
 *
 *   node creative/pinterest/homeschool/capture/record-pdf.mjs
 */
import { createServer } from "vite";
import { Font, renderToFile } from "@react-pdf/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CREATIVE = path.resolve(import.meta.dirname, "../../..");
const REPO = path.resolve(CREATIVE, "..");
const OUT = path.join(CREATIVE, "out/homeschool/assets");
fs.mkdirSync(OUT, { recursive: true });

// Fonts, as download.tsx registers them but from disk (Node cannot fetch "/fonts/...").
Font.register({ family: "Newsreader", src: path.join(REPO, "public/fonts/Newsreader.ttf") });
Font.register({ family: "PlexSans", src: path.join(REPO, "public/fonts/IBMPlexSans.ttf") });
Font.registerHyphenationCallback((word) => [word]);

const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom", root: CREATIVE,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.join(REPO, "src") } },
});
const P = "/src/products/homeschooling-companion";
const { buildBook, DEFAULT_BOOK_SECTIONS, stateComplianceRows } = await vite.ssrLoadModule(path.join(REPO, P, "book.ts"));
const { HomeschoolRecordDocument } = await vite.ssrLoadModule(path.join(REPO, P, "printables/document.tsx"));
const { getHomeschoolStateRequirement } = await vite.ssrLoadModule(path.join(REPO, "src/lib/homeschoolStateRequirements.ts"));

// ---- the demo household: only what the screens show --------------------
const child = {
  id: "ava", name: "Ava", age: 9, schoolingType: "homeschool", notes: null,
  // The product's own defaults (learning.ts DEFAULT_VISIBILITY): name on paper, age and notes off.
  nameVisibility: "shareable", ageVisibility: "private", notesVisibility: "private",
  status: "active", createdAt: "2026-09-01T00:00:00Z",
};
const curricula = [
  // "Math Journey" is Ava's curriculum on the Kids screen; the Today screen labels its task "Your plan" (source: parent).
  { id: "c-math", childId: "ava", source: "parent", title: "Math Journey", publisher: null, subject: "Math", visibility: "private", status: "active" },
];
const positions = [
  // Today screen: "Math Journey, Lesson 4: Halves and quarters"
  { id: "p-math", childId: "ava", curriculumId: "c-math", nodeId: null, label: "Lesson 4: Halves and quarters", movedAt: "" },
];
const plan = [
  { id: "pl-math", childId: "ava", subject: "Math", daysPerWeek: 4, active: true, minutesPerSession: null, origin: "parent" },
  { id: "pl-reading", childId: "ava", subject: "Reading", daysPerWeek: 4, active: true, minutesPerSession: null, origin: "parent" },
];
const events = [
  { childId: "ava", subject: "Math", onDate: "2026-10-04", state: "done", difficulty: "easy", helpNeeded: "none", positionLabel: "Lesson 3: Thirds" },
  { childId: "ava", subject: "Reading", onDate: "2026-10-04", state: "not-completed", difficulty: null, helpNeeded: null, positionLabel: "Chapter 6" },
];
const note = (visibility) => ({
  id: "o-1", childId: "ava", onDate: "2026-10-05", visibility,
  note: "Found the halves on her own when she cut the sandwich. Used the word quarter without prompting.",
});

function makeBook(state, noteVisibility) {
  return buildBook({
    child, curricula, positions, plan, events,
    observations: [note(noteVisibility)],
    checks: [], topicKeys: [],
    sections: DEFAULT_BOOK_SECTIONS,
    generatedAt: new Date("2026-10-08T12:00:00"),
    stateRequirement: getHomeschoolStateRequirement(state) ?? null,
  });
}

const variants = [
  { id: "oregon", state: "Oregon", noteVisibility: "private", what: "Ava, Oregon (the state the Kids screen shows); the note stays Kept private, as on the Record screen" },
  { id: "pa", state: "Pennsylvania", noteVisibility: "private", what: "the same record with the state set to Pennsylvania (High); note still Kept private" },
  { id: "pa-sharednote", state: "Pennsylvania", noteVisibility: "shareable", what: "EXTRA: as 'pa' but the one existing note toggled to 'In the printed record' (a real parent action; NOT how the Record screen shows it)" },
];

let md = `# My Homeschool Record: demo household pages\n\nGenerated by capture/record-pdf.mjs from the product's own buildBook() + HomeschoolRecordDocument (US Letter, 612 x 792 pt; PNGs at 200 dpi = 1700 x 2200). Printed date on the covers: 8 October 2026.\n\n`;
for (const v of variants) {
  const book = makeBook(v.state, v.noteVisibility);
  const pdfPath = path.join(OUT, `record-${v.id}.pdf`);
  await renderToFile(HomeschoolRecordDocument({ book, size: "LETTER" }), pdfPath);
  for (const f of fs.readdirSync(OUT)) if (f.startsWith(`record-${v.id}-p`) && f.endsWith(".png")) fs.unlinkSync(path.join(OUT, f));
  execFileSync("pdftoppm", ["-r", "200", "-png", pdfPath, path.join(OUT, `record-${v.id}-p`)]);
  const n = Number(/Pages:\s+(\d+)/.exec(execFileSync("pdfinfo", [pdfPath]).toString())[1]);
  // pdftoppm pads the page number by the page count's digits; normalise to p<N>.png
  for (const f of fs.readdirSync(OUT)) {
    const m = new RegExp(`^record-${v.id}-p-0*(\\d+)\\.png$`).exec(f);
    if (m) fs.renameSync(path.join(OUT, f), path.join(OUT, `record-${v.id}-p${m[1]}.png`));
  }
  md += `## record-${v.id}  (${v.what})\n\nrecord-${v.id}.pdf, ${n} pages. Book: sessions=${book.sessions}, days=${book.days.length}, notes printed=${book.observations.length}, checks=${book.checks.length}, state=${book.stateRequirement?.state ?? "none"} (${book.stateRequirement?.level ?? "-"}).\n\n`;
  md += `State page rows as computed by stateComplianceRows(): ${JSON.stringify(stateComplianceRows(book))}\n\n`;
  for (let i = 1; i <= n; i++) {
    const text = execFileSync("pdftotext", ["-f", String(i), "-l", String(i), "-layout", pdfPath, "-"]).toString().replace(/\n{2,}/g, "\n").trim();
    const role = i === 1 ? "COVER" : /What your state asks for\./.test(text) ? "STATE PAGE ('What your state asks for.')"
      : /The log/.test(text) ? "LOG ('The log')"
      : /Subjects/.test(text) ? "SUBJECTS"
      : /Notes\n/.test(text) ? "NOTES" : "PAGE";
    md += `- record-${v.id}-p${i}.png: **${role}**\n\n\`\`\`\n${text}\n\`\`\`\n\n`;
  }
  console.log(`record-${v.id}: ${n} pages`);
}
fs.writeFileSync(path.join(OUT, "record-pages.md"), md);
await vite.close();
process.exit(0);
