#!/usr/bin/env node
/**
 * Merges the seven slices of the Home Base idea bank,
 * checks them, and writes the bank.
 *
 *   node pinterest/homebase/merge.mjs            check + write ideas-101.{json,csv,md}
 *   node pinterest/homebase/merge.mjs --check    check only
 *
 * Checks, each of which fails the build with the idea named:
 *  - every idea has the fields the brief asks for, a headline of at most 90 characters,
 *    and a link to a guide that exists in src/content/guides.ts or to the product;
 *  - every `proof` string occurs in its `proofFile` (whitespace and quote style ignored),
 *    so the words on a pin are the words of its source;
 *  - no two ideas share a headline, and none repeats one of the 50 pins already made;
 *  - the bank has 101 ideas once reserves are used to fill any gap, and no angle
 *    is more than a quarter of it.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, "../../..");
const IDEAS = path.join(HERE, "ideas");
const TARGET = 101;
const SLICES = ["product", "appliances", "maintenance", "seasonal", "moving", "binder", "safety"];
const WANT = { product: 20, appliances: 13, maintenance: 15, seasonal: 17, moving: 14, binder: 12, safety: 10 };
const check = process.argv.includes("--check");

const norm = (t) => String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\\n/g, " ").replace(/\\"/g, '"').replace(/["'`]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const cache = new Map();
const source = (file) => { if (!cache.has(file)) cache.set(file, norm(fs.readFileSync(path.join(ROOT, file), "utf8"))); return cache.get(file); };
const BOOKDIR = path.join(ROOT, "creative/out/homebase");
if (!fs.existsSync(path.join(BOOKDIR, "book.txt"))) {
  fs.mkdirSync(BOOKDIR, { recursive: true });
  const src = fs.readFileSync(path.join(ROOT, "src/products/home-management-companion/printables/homeSurveyLetter.base64.ts"), "utf8");
  const b64 = (src.match(/"([A-Za-z0-9+/=]{1000,})"/) ?? src.match(/`([A-Za-z0-9+/=\s]{1000,})`/))?.[1];
  fs.writeFileSync(path.join(BOOKDIR, "book.pdf"), Buffer.from(b64.replace(/\s/g, ""), "base64"));
  execFileSync("pdftotext", ["-layout", path.join(BOOKDIR, "book.pdf"), path.join(BOOKDIR, "book.txt")]);
}
const book = norm(fs.readFileSync(path.join(BOOKDIR, "book.txt"), "utf8"));

const guidesText = fs.readFileSync(path.join(ROOT, "src/content/guides.ts"), "utf8");
/** One guide's own text: from its slug to the next guide's, so a pin cannot quote a different guide. */
const guideBlocks = new Map();
{
  const marks = [...guidesText.matchAll(/\n    slug: "([^"]+)"/g)];
  marks.forEach((m, i) => guideBlocks.set(m[1], norm(guidesText.slice(m.index, marks[i + 1]?.index ?? guidesText.length))));
}
const guides = new Set([...fs.readFileSync(path.join(ROOT, "src/content/guides.ts"), "utf8").matchAll(/\n    slug: "([^"]+)"/g)].map((m) => m[1]));
const made = JSON.parse(fs.readFileSync(path.join(ROOT, "creative/pinterest/strategy/home-management-companion.json"), "utf8")).pins.map((p) => norm(String(p.title).replace(/^[^:]*:\s*/, "")).replace(/\s+/g, " "));
const madeFull = JSON.parse(fs.readFileSync(path.join(ROOT, "creative/pinterest/strategy/home-management-companion.json"), "utf8")).pins.map((p) => norm(p.title));
const problems = [];
const bad = (idea, why) => problems.push(`${idea.slice}: "${idea.headline}": ${why}`);

let all = [];
for (const slice of SLICES) {
  const file = path.join(IDEAS, `${slice}.json`);
  if (!fs.existsSync(file)) { problems.push(`${slice}: no ${path.relative(ROOT, file)}`); continue; }
  const list = JSON.parse(fs.readFileSync(file, "utf8"));
  list.forEach((idea, i) => {
    // Slices were written by different agents: normalise the two shapes they varied.
    if (idea.link?.kind === "product") idea.link = { ...idea.link, kind: "shop" };
    // A board is its name only: a proposed new board's reason belongs in the notes, not the board.
    if (idea.board) idea.board = idea.board.replace(/\s*\(.*$/, "").trim();
    if (idea.proofExtra && !Array.isArray(idea.proofExtra)) idea.proofExtra = [idea.proofExtra];
    all.push({ ...idea, slice, order: i });
  });
}

for (const idea of all) {
  for (const f of ["angle", "headline", "link", "proof", "query", "board", "when", "visual"]) if (!idea[f] || (Array.isArray(idea[f]) && !idea[f].length)) bad(idea, `missing ${f}`);
  if (idea.headline && idea.headline.length > 90) bad(idea, `headline is ${idea.headline.length} characters (max 90)`);
  if (idea.link?.kind === "guide" && !guides.has(idea.link.slug)) bad(idea, `no guide "${idea.link.slug}"`);
  if (idea.link?.kind === "shop" && idea.link.slug !== "home-management-companion") bad(idea, `shop link must be home-management-companion`);
  if (idea.link && !["guide", "shop"].includes(idea.link.kind)) bad(idea, `link kind "${idea.link.kind}"`);
  const textOf = (file) => (file === "book" || /hsbook\/book\.txt$/.test(file ?? "") ? book : file && path.isAbsolute(file) && fs.existsSync(file) ? norm(fs.readFileSync(file, "utf8")) : file && fs.existsSync(path.join(ROOT, file)) ? source(file) : null);
  let src = textOf(idea.proofFile);
  if (src === null) { bad(idea, `proofFile "${idea.proofFile}" not found`); continue; }
  // A pin linked to a guide that quotes guides.ts must quote THAT guide.
  if (idea.link?.kind === "guide" && idea.proofFile === "src/content/guides.ts") {
    const own = guideBlocks.get(idea.link.slug);
    if (own) src = own;
  }
  for (const p of idea.proof ?? []) if (!src.includes(norm(p))) bad(idea, `proof not in ${idea.link?.kind === "guide" && idea.proofFile === "src/content/guides.ts" ? `the guide ${idea.link.slug}` : idea.proofFile}: "${String(p).slice(0, 80)}"`);
  for (const extra of idea.proofExtra ?? []) {
    const t = textOf(extra.file);
    if (t === null) { bad(idea, `proofExtra file "${extra.file}" not found`); continue; }
    for (const p of extra.proof ?? []) if (!t.includes(norm(p))) bad(idea, `proofExtra not in ${extra.file}: "${String(p).slice(0, 80)}"`);
  }
}

const seen = new Map();
for (const idea of all) {
  const h = norm(idea.headline ?? "");
  if (seen.has(h)) bad(idea, `same headline as ${seen.get(h)}`); else seen.set(h, idea.slice);
  if (made.includes(h) || madeFull.includes(h)) bad(idea, "repeats a pin already made");
}

// Take the wanted number from each slice (non-reserves first, then reserves in order), then fill any gap from the rest.
const pick = [];
const rest = [];
for (const slice of SLICES) {
  const mine = all.filter((i) => i.slice === slice);
  const strong = mine.filter((i) => !i.reserve);
  const spare = mine.filter((i) => i.reserve);
  const chosen = [...strong, ...spare].slice(0, WANT[slice]);
  pick.push(...chosen);
  rest.push(...[...strong, ...spare].slice(WANT[slice]));
  if (chosen.length < WANT[slice]) problems.push(`${slice}: ${chosen.length} ideas, wanted ${WANT[slice]}`);
}
while (pick.length < TARGET && rest.length) pick.push(rest.shift());
const bank = pick.slice(0, TARGET);
if (bank.length < TARGET) problems.push(`the bank has ${bank.length} ideas, wanted ${TARGET}`);

const byAngle = {};
for (const i of bank) byAngle[i.angle] = (byAngle[i.angle] ?? 0) + 1;
for (const [a, n] of Object.entries(byAngle)) if (n > TARGET / 4) problems.push(`angle "${a}" is ${n} of ${bank.length} ideas (max ${Math.floor(TARGET / 4)})`);

console.log(`${all.length} ideas read, ${bank.length} in the bank, ${all.length - bank.length} spare`);
console.log("angles:", Object.entries(byAngle).sort((a, b) => b[1] - a[1]).map(([a, n]) => `${a} ${n}`).join(", "));
console.log("by slice:", SLICES.map((s) => `${s} ${bank.filter((i) => i.slice === s).length}`).join(", "));
if (problems.length) { console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`); process.exit(1); }
if (check) process.exit(0);

// Order the bank so that neighbours differ in angle and slice, then number it.
const left = [...bank];
const ordered = [];
while (left.length) {
  const prev = ordered.at(-1), prev2 = ordered.at(-2);
  let k = left.findIndex((i) => (!prev || (i.angle !== prev.angle && i.slice !== prev.slice)) && (!prev2 || i.angle !== prev2.angle));
  if (k < 0) k = left.findIndex((i) => !prev || i.angle !== prev.angle);
  ordered.push(left.splice(k < 0 ? 0 : k, 1)[0]);
}
ordered.forEach((i, n) => { i.n = n + 1; });
fs.writeFileSync(path.join(HERE, "ideas-101.json"), JSON.stringify(ordered.map(({ order, ...i }) => i), null, 2) + "\n");

const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const url = (l) => (l.kind === "guide" ? `https://draftpace.com/guides/${l.slug}` : `https://draftpace.com/shop/${l.slug}`);
const rows = [["#", "Angle", "Headline", "Sub", "Pinterest search phrase", "Board", "Links to", "When", "What is drawn", "Flags"].map(q).join(",")];
for (const i of ordered) rows.push([i.n, i.angle, i.headline, i.sub, i.query, i.board, url(i.link), i.when, i.visual, (i.flags ?? []).join("; ")].map(q).join(","));
fs.writeFileSync(path.join(HERE, "ideas-101.csv"), rows.join("\r\n") + "\r\n");

const md = [`# Home Base: 101 pin ideas`, ``, `${ordered.length} ideas, each a different angle on a guide or the product. Angles: ${Object.entries(byAngle).sort((a, b) => b[1] - a[1]).map(([a, n]) => `${a} ${n}`).join(", ")}.`, ``];
const groups = { product: "The product (mockup style)", appliances: "Appliances, model numbers and warranties", maintenance: "Maintenance schedules, service intervals and the log", seasonal: "Seasonal and monthly checklists", moving: "Moving in: a new house, an inherited house, a rental", binder: "The home binder and the life admin binder", safety: "Shutoffs and the jobs that cost the most to skip" };
for (const s of SLICES) {
  md.push(`## ${groups[s]}`, ``, `| # | Angle | Headline | Searched as | Links to | When |`, `|---|---|---|---|---|---|`);
  for (const i of ordered.filter((x) => x.slice === s)) md.push(`| ${i.n} | ${i.angle} | ${i.headline.replace(/\|/g, "/")} | ${String(i.query).replace(/\|/g, "/")} | ${i.link.kind === "shop" ? "the product" : i.link.slug} | ${i.when} |`);
  md.push(``);
}
fs.writeFileSync(path.join(HERE, "ideas-101.md"), md.join("\n"));
console.log("wrote ideas-101.json, .csv, .md");
