/**
 * Renders My Homeschool Record so every page can be proofed before a
 * parent can produce one.
 *
 *   node scripts/run-tsx.mjs scripts/generate-homeschool-record.ts
 *
 * Built from the same buildBook the live product uses, so a proof here
 * is a proof of what somebody would actually receive.
 */
import { Font, renderToFile } from "@react-pdf/renderer";
import { mkdir, readFile, access, writeFile } from "node:fs/promises";
import path from "node:path";
import { HomeschoolRecordDocument } from "../src/products/homeschooling-companion/printables/document";
import { buildBook, DEFAULT_BOOK_SECTIONS } from "../src/products/homeschooling-companion/book";
import type { Child, Curriculum, PlanEntry, Position } from "../src/products/homeschooling-companion/learning";
import type { Observation, WorkEntry } from "../src/products/homeschooling-companion/record";

const OUT = process.env.OUT_DIR ?? "./.workbook";
const FONTS = path.join(OUT, "fonts");
const FONT_SOURCES: Record<string, string> = {
  "Newsreader.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf",
  "IBMPlexSans.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/IBMPlexSans%5Bwdth%2Cwght%5D.ttf",
};

await mkdir(FONTS, { recursive: true });
for (const [name, url] of Object.entries(FONT_SOURCES)) {
  const file = path.join(FONTS, name);
  try {
    await access(file);
  } catch {
    const res = await fetch(url);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
}
Font.register({ family: "Newsreader", src: path.resolve(FONTS, "Newsreader.ttf") });
Font.register({ family: "PlexSans", src: path.resolve(FONTS, "IBMPlexSans.ttf") });
Font.registerHyphenationCallback((word: string) => [word]);

const child: Child = {
  id: "emma", name: "Emma", age: 9, schoolingType: "homeschool",
  notes: "Gets tired after lunch.",
  nameVisibility: "shareable", ageVisibility: "private", notesVisibility: "private",
  status: "active", createdAt: "2026-06-01T00:00:00Z",
};
const curricula: Curriculum[] = [
  { id: "c1", childId: "emma", source: "publisher", title: "Abeka Grade 4", publisher: null, subject: "Math", visibility: "private", status: "active" },
  { id: "c2", childId: "emma", source: "publisher", title: "Abeka Grade 4", publisher: null, subject: "Reading", visibility: "private", status: "active" },
];
const positions: Position[] = [
  { id: "p1", childId: "emma", curriculumId: "c1", nodeId: null, label: "Unit 3, Lesson 12", movedAt: "" },
  { id: "p2", childId: "emma", curriculumId: "c2", nodeId: null, label: "Chapter 6", movedAt: "" },
];
const plan: PlanEntry[] = [
  { id: "pl1", childId: "emma", subject: "Math", daysPerWeek: 4, active: true, minutesPerSession: 35, origin: "parent" },
  { id: "pl2", childId: "emma", subject: "Reading", daysPerWeek: 5, active: true, minutesPerSession: 30, origin: "parent" },
  { id: "pl3", childId: "emma", subject: "Science", daysPerWeek: 2, active: true, minutesPerSession: 35, origin: "draftpace-outline" },
];
const days = ["2026-08-10","2026-08-11","2026-08-12","2026-08-13","2026-08-17","2026-08-18","2026-08-19","2026-08-20","2026-08-21"];
const events: WorkEntry[] = days.flatMap((onDate, i) => [
  { childId: "emma", subject: "Math", onDate, state: "done" as const, difficulty: i % 4 === 0 ? "difficult" as const : "about-right" as const, helpNeeded: i % 3 === 0 ? "a-little" as const : null, positionLabel: `Unit 3, Lesson ${10 + i}` },
  { childId: "emma", subject: "Reading", onDate, state: i === 5 ? "not-completed" as const : "done" as const, difficulty: null, helpNeeded: null, positionLabel: `Chapter ${4 + Math.floor(i / 3)}` },
]);
const observations: Observation[] = [
  { id: "o1", childId: "emma", onDate: "2026-08-12", note: "Finally got equivalent fractions today, after weeks of it not landing.", visibility: "shareable" },
  { id: "o2", childId: "emma", onDate: "2026-08-18", note: "Cried during maths. Tired week, not the work.", visibility: "private" },
  { id: "o3", childId: "emma", onDate: "2026-08-21", note: "Read a whole chapter aloud without stopping.", visibility: "shareable" },
];
const checks = [
  { createdAt: "2026-08-14T10:00:00Z", topicKey: "math.multiplication", standing: "looked-solid" as const, answered: 5, right: 5 },
  { createdAt: "2026-08-19T10:00:00Z", topicKey: "math.fractions-equivalent", standing: "worth-another-look" as const, answered: 4, right: 1 },
  { createdAt: "2026-08-19T10:00:00Z", topicKey: "math.long-division", standing: "not-enough-to-say" as const, answered: 2, right: 2 },
];

const book = buildBook({
  child, curricula, positions, plan, events, observations, checks,
  topicKeys: ["math.multiplication", "math.fractions-equivalent", "reading.fluency", "reading.comprehension-literal"],
  sections: { ...DEFAULT_BOOK_SECTIONS, checks: true },
  generatedAt: new Date("2026-08-22T12:00:00Z"),
});

for (const size of ["LETTER", "A4"] as const) {
  const file = path.join(OUT, `homeschool-record-${size.toLowerCase()}.pdf`);
  await renderToFile(HomeschoolRecordDocument({ book, size }), file);
  const bytes = await readFile(file);
  console.log(`${path.basename(file)}  ${bytes.length.toLocaleString()} bytes`);
}
console.log(`sessions=${book.sessions} subjects=${book.subjects.length} days=${book.days.length} notes=${book.observations.length} checks=${book.checks.length}`);
