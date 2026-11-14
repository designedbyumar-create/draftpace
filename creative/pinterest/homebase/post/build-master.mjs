#!/usr/bin/env node
/**
 * Builds ONE package of all 101 Home Base pins in a single priority order
 * (post 1, then 2, ... then 101): high-quality JPEGs named 001_..., 002_...
 * and one text document.
 *
 *   node pinterest/homebase/post/build-master.mjs
 *
 * Priority = how time-sensitive the pin is. Tier 1 is for the weeks now
 * (winterizing, fall jobs, the first freeze, gutters in November); tier 2 for
 * the new-year start (January binders, the maintenance calendar, a fresh start for the house); tier 3 is
 * evergreen; tier 4 is the spring and late-summer pins. Inside a tier the order keeps pins on the same guide apart, keeps
 * the product pins spaced, and keeps the near-duplicate pairs a month apart.
 * Descriptions, tags and alt text come from post/copy-*.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const HERE = import.meta.dirname;
const CREATIVE = path.resolve(HERE, "../../..");
const OUT = path.join(CREATIVE, "out/homebase");
const pad = (n, w = 3) => String(n).padStart(w, "0");

// 1. Everything we have: copy, tags and alt from the copy modules, the 2000 x 3000 render from out/homebase/hq.
const bank = JSON.parse(fs.readFileSync(path.join(HERE, "../ideas-101.json"), "utf8"));
const have = new Map();
for (const f of fs.readdirSync(HERE).filter((f) => /^copy-.*\.mjs$/.test(f)).sort()) {
  const m = await import(path.join(HERE, f));
  for (const p of m.PINS) {
    if (have.has(p.n)) throw new Error(`#${p.n} is in two copy files`);
    const dir = path.join(OUT, "hq");
    const src = fs.readdirSync(dir).find((x) => x.startsWith(`${pad(p.n)}-`) && x.endsWith(".png"));
    if (!src) throw new Error(`no 2000 x 3000 render for #${p.n} in ${dir}`);
    have.set(p.n, { ...p, src: path.join(dir, src) });
  }
}
for (let n = 1; n <= 101; n++) if (!have.has(n)) throw new Error(`no copy or render for idea #${n}`);

// 2. The priority tiers (by idea number, in the order they should be tried).
const T1 = [63, 69, 65, 57, 67, 53, 71, 59, 73, 5, 27, 61, 38];
const T2 = [51, 47, 41, 75, 79, 31, 85, 89, 93, 77, 81, 83, 87, 91, 95, 97, 33, 25, 11, 29, 3];
const T4 = [49, 55];
const T3 = bank.map((i) => i.n).filter((n) => ![...T1, ...T2, ...T4].includes(n));
const tiers = [T1, T2, T3, T4];
const NEAR = [[5, 59], [3, 101], [27, 51]];

const meta = (n) => bank.find((i) => i.n === n);
const key = (n) => (meta(n).link.kind === "shop" ? "shop" : meta(n).link.slug);
const order = [];
const placedAt = new Map();
function ok(n, strict) {
  const k = key(n);
  const recent = order.slice(-(strict ? 3 : 1));
  if (k !== "shop" && recent.some((r) => key(r) === k)) return false;
  if (k === "shop" && order.slice(-(strict ? 5 : 2)).some((r) => key(r) === "shop")) return false;
  for (const [a, b] of NEAR) {
    const other = n === a ? b : n === b ? a : null;
    if (other && placedAt.has(other) && order.length - placedAt.get(other) < (strict ? 30 : 10)) return false;
  }
  return true;
}
const tierOf = new Map();
tiers.forEach((tier, t) => {
  const left = [...tier];
  const isShop = (n) => key(n) === "shop";
  const shopTotal = tier.filter(isShop).length;
  let placed = 0, shopPlaced = 0;
  while (left.length) {
    // Spread the product pins evenly through the tier: want a product pin when we are behind the even share.
    const wantShop = shopPlaced < Math.round(((placed + 1) * shopTotal) / tier.length);
    const prefer = (n) => isShop(n) === wantShop;
    let k = left.findIndex((n) => prefer(n) && ok(n, true));
    if (k < 0) k = left.findIndex((n) => ok(n, true));
    if (k < 0) k = left.findIndex((n) => prefer(n) && ok(n, false));
    if (k < 0) k = left.findIndex((n) => ok(n, false));
    if (k < 0) k = 0;
    const [n] = left.splice(k, 1);
    placedAt.set(n, order.length);
    tierOf.set(n, t + 1);
    order.push(n);
    placed++;
    if (isShop(n)) shopPlaced++;
  }
});
// Repair pass: where two neighbours still share a guide (or are both product pins), swap the second with a nearby pin of the same tier so that neither lands next to a match.
const clash = (i) => i > 0 && i < order.length && key(order[i]) === key(order[i - 1]);
for (let pass = 0; pass < 6; pass++) {
  for (let i = 1; i < order.length; i++) {
    if (!clash(i)) continue;
    for (let d = 2; d <= 14; d++) for (const j of [i + d, i - d]) {
      if (j < 1 || j >= order.length || tierOf.get(order[j]) !== tierOf.get(order[i])) continue;
      [order[i], order[j]] = [order[j], order[i]];
      const near = [i, i + 1, j, j + 1];
      const nearDup = NEAR.some(([a, b]) => Math.abs(order.indexOf(a) - order.indexOf(b)) < 20);
      if (!near.some(clash) && !nearDup) { d = 99; break; }
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
}
if (order.length !== 101 || new Set(order).size !== 101) throw new Error("order is not a permutation of 1..101");

// 3. The images.
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52).replace(/-$/, "");
const FOLDER = "Home-Base-All-101-Pins";
const PKG = path.join(OUT, "package-all-101");
fs.rmSync(PKG, { recursive: true, force: true });
fs.mkdirSync(path.join(PKG, FOLDER, "images"), { recursive: true });
const jobs = order.map((n, k) => ({ n, pos: k + 1, file: `${pad(k + 1)}_${slug(meta(n).headline)}.jpg`, ...have.get(n) }));
const py = `import sys,json\nfrom PIL import Image\njobs=json.load(sys.stdin)\nfor j in jobs:\n    im=Image.open(j['src']).convert('RGB')\n    assert im.size==(2000,3000),(j['src'],im.size)\n    im.save(j['dst'],'JPEG',quality=95,subsampling=0,optimize=True)\n`;
execFileSync("python3", ["-c", py], { input: JSON.stringify(jobs.map((j) => ({ src: j.src, dst: path.join(PKG, FOLDER, "images", j.file) }))) });

// 4. The text document.
const link = (i) => `${i.link.kind === "guide" ? `https://draftpace.com/guides/${i.link.slug}` : `https://draftpace.com/shop/${i.link.slug}`}?utm_source=pinterest&utm_medium=organic_social&utm_campaign=homeschool&utm_content=hs-${pad(i.n)}`;
const rule = "=".repeat(78), thin = "-".repeat(78);
const at = (n) => jobs.find((j) => j.n === n).pos;
const list = (ns) => ns.map((n) => pad(at(n), 3)).sort().join(", ");
const firstOf = (t) => Math.min(...jobs.filter((j) => tierOf.get(j.n) === t).map((j) => j.pos));
const lastOf = (t) => Math.max(...jobs.filter((j) => tierOf.get(j.n) === t).map((j) => j.pos));
const product = jobs.filter((j) => meta(j.n).link.kind === "shop").map((j) => j.n);
const example = jobs.filter((j) => (meta(j.n).flags ?? []).includes("example-tag")).map((j) => j.n);
const caution = jobs.filter((j) => /confirm with your state|confirm anything you're relying on/i.test(`${j.description} ${j.alt}`)).map((j) => j.n);
const NEW_BOARDS = {
  "Home Maintenance Checklists": "Checklists and schedules for the jobs a home needs, and how often",
  "Seasonal Home Maintenance": "Fall, winter and spring home jobs in the month they belong to",
  "Appliance Records and Warranties": "Model numbers, serial numbers and warranties, written down once",
  "Home Binder and Printables": "Home binders, life admin binders and printable home pages",
  "New Homeowner Checklists": "What to do in the first week and first year in a new or inherited house",
  "Renting and Move-In": "What to document and keep when you rent",
  "Home Safety and Shutoffs": "Where the shutoffs are and the safety jobs that matter",
  "Home Maintenance Log": "What to write down after a repair or a job so the next one is easy",
};
const boards = [...new Set(jobs.map((j) => meta(j.n).board))].sort();

const out = [];
out.push(rule, "PERSONAL FINANCE COMPANION: ALL 101 PINS, IN PRIORITY ORDER", "PIN DETAILS FOR POSTING BY HAND", rule, "");
out.push("101 pins. Post them in number order: 001 first, then 002, and so on to 101. The image files are named with the same number (images/001_..., images/002_...), and each entry below gives the fields to type into Pinterest.", "");
out.push("WHAT THE ORDER MEANS", thin);
out.push(`- 001 to ${pad(lastOf(1))}: post NOW. Time-sensitive for November and December (winterizing before the freeze, fall jobs, gutters, the first-frost timeline).`);
out.push(`- ${pad(firstOf(2))} to ${pad(lastOf(2))}: the new-year start: the home binder and life admin binder, the monthly checklist, the maintenance calendar and log pages, the product pins. Starting these in mid-December works well.`);
out.push(`- ${pad(firstOf(3))} to ${pad(lastOf(3))}: evergreen. Good any time.`);
out.push(`- ${pad(firstOf(4))} to ${pad(lastOf(4))}: spring and late-summer pins (the spring checklist from late February, the September checklist from August). Hold them for their season.`);
out.push("- Inside each group the order keeps pins about the same guide apart, spaces out the pins that link to the product, and keeps look-alike pairs a month apart, so posting in number order is the right thing to do.", "");
out.push("HOW TO POST EACH PIN", thin);
out.push("1. Pinterest > Create > Create Pin, and upload the image file named on the pin.");
out.push("2. Title: paste the Title (keep the words first; Pinterest shows about the first 40 characters in the feed).");
out.push("3. Description: paste the Description.");
out.push("4. Destination link: paste the Link as it is. It carries tracking (utm) so you can see in analytics which pins send visitors.");
out.push("5. Board: choose the Board named. Create it first if it is new (list below).");
out.push("6. Tagged topics: type each tag from the Tags line and pick the matching suggestion (up to 10; these have 8).");
out.push("7. Alt text: click 'Add alt text' and paste the Alt text.");
out.push("8. Publish now, or schedule. Pace: 3 or 4 pins a day suits a new run of pins better than all at once.", "");
out.push("READ THIS FIRST", thin);
out.push(`- Product pins: ${list(product)} link to the product page and show its price on the pin. Every other pin links to a free guide. No description states a price. The pins show the listing price ($49 once). Check the price in Lemon Squeezy matches the product page before posting.`);
out.push(`- Pins with a small 'Example' tag (${list(example)}) show a figure from a guide's own worked example, not real data.`);
out.push("- Home Base guide pins keep each guide's own limits: intervals are typical and your own manual wins; the seasonal pins are for a US home in the northern hemisphere; the rental pins say usually and mention state law. Keep those lines if you edit anything. Nothing here is professional, safety, insurance or legal advice.");
out.push("- Product pins that show an app screen use the real screens with demo data (a made-up home), shown exactly as the app makes them. None implies a real person's money. The price on product pins is the listing's own.");
out.push(`- Look-alike pairs are kept apart in this order: the two emergency-page mockups (${pad(at(3))} and ${pad(at(101))}), the two fall app pins (${pad(at(5))} and ${pad(at(59))}) and the two calendar pins (${pad(at(27))} and ${pad(at(51))}). Do not reorder them together.`);
out.push("- Tags are suggestions based on Pinterest-style search phrases. Pinterest search data was not available, so check the suggestions Pinterest offers as you type each tag.", "");
out.push("BOARDS USED", thin);
for (const b of boards) out.push(`- ${b}${NEW_BOARDS[b] ? `   (NEW if you have not made it: create it. Suggested board description: ${NEW_BOARDS[b]})` : ""}`);
out.push("", rule, "");
const WHEN = { 1: "Post now (in season: November and December)", 2: "Around the new year (January start)", 3: "Evergreen, any time", 4: "Hold for its season (spring or late summer)" };
for (const j of jobs) {
  const i = meta(j.n);
  const issues = [];
  if (i.headline.length > 100) issues.push("title");
  if (j.description.length > 500) issues.push("description");
  if (j.alt.length > 500) issues.push("alt");
  if (j.tags.length > 10) issues.push("tags");
  if (issues.length) throw new Error(`#${j.n}: ${issues.join(", ")} over Pinterest's limit`);
  out.push(`PIN ${pad(j.pos)} OF 101   (idea #${j.n})`, thin);
  out.push(`Image file:   images/${j.file}`);
  out.push(`Title:        ${i.headline}`);
  out.push(`Description:  ${j.description}`);
  out.push(`Link:         ${link(i)}`);
  out.push(`Board:        ${i.board}`);
  out.push(`Tags:         ${j.tags.join(", ")}`);
  out.push(`Alt text:     ${j.alt}`);
  out.push(`When:         ${WHEN[tierOf.get(j.n)]}. Best search timing: ${i.when}`);
  out.push(`Links to:     ${i.link.kind === "guide" ? `the free guide "${i.link.slug}"` : "the product page (Home Base)"}`);
  out.push("", "");
}
fs.writeFileSync(path.join(PKG, FOLDER, "PIN-DETAILS.txt"), out.join("\n"), "utf8");
fs.writeFileSync(path.join(OUT, "priority-order.json"), JSON.stringify(jobs.map((j) => ({ pos: j.pos, n: j.n, batch: j.batch, tier: tierOf.get(j.n), file: j.file })), null, 1) + "\n");

// 5. The zip.
const zip = path.join(OUT, `${FOLDER}.zip`);
fs.rmSync(zip, { force: true });
execFileSync("python3", ["-c", "import shutil,sys;shutil.make_archive(sys.argv[1][:-4],'zip',sys.argv[2],sys.argv[3])", zip, PKG, FOLDER]);
console.log(`101 images + PIN-DETAILS.txt -> ${path.relative(process.cwd(), zip)} (${(fs.statSync(zip).size / 1e6).toFixed(1)} MB)`);
console.log("tiers:", [1, 2, 3, 4].map((t) => `${t}: ${jobs.filter((j) => tierOf.get(j.n) === t).length}`).join(", "));
