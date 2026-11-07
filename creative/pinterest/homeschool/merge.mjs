#!/usr/bin/env node
/**
 * Merges the seven slices of the Homeschooling Companion idea bank,
 * checks them, and writes the bank.
 *
 *   node pinterest/homeschool/merge.mjs            check + write ideas-101.{json,csv,md}
 *   node pinterest/homeschool/merge.mjs --check    check only
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

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, "../../..");
const IDEAS = path.join(HERE, "ideas");
const TARGET = 101;
const SLICES = ["rules", "records", "rhythm", "portfolio", "product", "states", "seasonal"];
const WANT = { rules: 16, records: 18, rhythm: 18, portfolio: 8, product: 16, states: 11, seasonal: 10 };
const check = process.argv.includes("--check");

const norm = (t) => String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\\n/g, " ").replace(/\\"/g, '"').replace(/["'`]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const cache = new Map();
const source = (file) => { if (!cache.has(file)) cache.set(file, norm(fs.readFileSync(path.join(ROOT, file), "utf8"))); return cache.get(file); };
const book = norm(fs.readFileSync("/tmp/claude-0/-home-user-draftpace/3601f45e-71e9-5dd0-a897-05358699fd6f/scratchpad/hsbook/book.txt", "utf8"));

const guides = new Set([...fs.readFileSync(path.join(ROOT, "src/content/guides.ts"), "utf8").matchAll(/\n    slug: "([^"]+)"/g)].map((m) => m[1]));
const made = fs.readFileSync("/tmp/claude-0/-home-user-draftpace/3601f45e-71e9-5dd0-a897-05358699fd6f/scratchpad/existing.txt", "utf8").split("\n").map((l) => norm(l.replace(/^- \S+ \S+ \[[^\]]+\] /, "")));
const problems = [];
const bad = (idea, why) => problems.push(`${idea.slice}: "${idea.headline}": ${why}`);

let all = [];
for (const slice of SLICES) {
  const file = path.join(IDEAS, `${slice}.json`);
  if (!fs.existsSync(file)) { problems.push(`${slice}: no ${path.relative(ROOT, file)}`); continue; }
  const list = JSON.parse(fs.readFileSync(file, "utf8"));
  list.forEach((idea, i) => all.push({ ...idea, slice, order: i }));
}

for (const idea of all) {
  for (const f of ["angle", "headline", "link", "proof", "query", "board", "when", "visual"]) if (!idea[f] || (Array.isArray(idea[f]) && !idea[f].length)) bad(idea, `missing ${f}`);
  if (idea.headline && idea.headline.length > 90) bad(idea, `headline is ${idea.headline.length} characters (max 90)`);
  if (idea.link?.kind === "guide" && !guides.has(idea.link.slug)) bad(idea, `no guide "${idea.link.slug}"`);
  if (idea.link?.kind === "shop" && idea.link.slug !== "homeschooling-companion") bad(idea, `shop link must be homeschooling-companion`);
  if (idea.link && !["guide", "shop"].includes(idea.link.kind)) bad(idea, `link kind "${idea.link.kind}"`);
  const src = idea.proofFile === "book" ? book : idea.proofFile ? (fs.existsSync(path.join(ROOT, idea.proofFile)) ? source(idea.proofFile) : null) : null;
  if (src === null) { bad(idea, `proofFile "${idea.proofFile}" not found`); continue; }
  for (const p of idea.proof ?? []) if (!src.includes(norm(p))) bad(idea, `proof not in ${idea.proofFile}: "${String(p).slice(0, 80)}"`);
}

const seen = new Map();
for (const idea of all) {
  const h = norm(idea.headline ?? "");
  if (seen.has(h)) bad(idea, `same headline as ${seen.get(h)}`); else seen.set(h, idea.slice);
  if (made.includes(h)) bad(idea, "repeats a pin already made");
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

const md = [`# Homeschooling Companion: 101 pin ideas`, ``, `${ordered.length} ideas, each a different angle on a guide or the product. Angles: ${Object.entries(byAngle).sort((a, b) => b[1] - a[1]).map(([a, n]) => `${a} ${n}`).join(", ")}.`, ``];
const groups = { rules: "Starting out and the rules", records: "A record system you will keep", rhythm: "Attendance, the weekly rhythm and checking what was learned", portfolio: "Portfolio and evaluation", product: "The product (mockup style)", states: "State record keeping", seasonal: "Timely pins" };
for (const s of SLICES) {
  md.push(`## ${groups[s]}`, ``, `| # | Angle | Headline | Searched as | Links to | When |`, `|---|---|---|---|---|---|`);
  for (const i of ordered.filter((x) => x.slice === s)) md.push(`| ${i.n} | ${i.angle} | ${i.headline.replace(/\|/g, "/")} | ${String(i.query).replace(/\|/g, "/")} | ${i.link.kind === "shop" ? "the product" : i.link.slug} | ${i.when} |`);
  md.push(``);
}
fs.writeFileSync(path.join(HERE, "ideas-101.md"), md.join("\n"));
console.log("wrote ideas-101.json, .csv, .md");
