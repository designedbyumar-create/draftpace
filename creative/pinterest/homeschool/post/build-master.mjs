#!/usr/bin/env node
/**
 * Builds ONE package of all 101 homeschool pins in a single priority order
 * (post 1, then 2, ... then 101): high-quality JPEGs named 001_..., 002_...
 * and one text document.
 *
 *   node pinterest/homeschool/post/build-master.mjs
 *
 * Priority = how time-sensitive the pin is. Tier 1 is for the weeks now
 * (mid-year slump, systems that stall, an October portfolio); tier 2 for
 * mid-November through January (winter break, a new-year start); tier 3 is
 * evergreen; tier 4 is spring (evaluation season, end of year), to start in
 * February. Inside a tier the order keeps pins on the same guide apart, keeps
 * the product pins spaced, and keeps the near-duplicate pairs a month apart.
 * Descriptions, tags and alt text come from post/batch-1..4.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const HERE = import.meta.dirname;
const CREATIVE = path.resolve(HERE, "../../..");
const OUT = path.join(CREATIVE, "out/homeschool");
const bank = JSON.parse(fs.readFileSync(path.join(HERE, "../ideas-101.json"), "utf8"));
const pad = (n, w = 3) => String(n).padStart(w, "0");

// 1. Everything we have: copy, tags and alt from the four batch modules, the 2000 x 3000 render from its batch's folder.
const FOLDERS = { 1: "hq", 2: "hq2", 3: "hq3", 4: "hq4" };
const have = new Map();
for (const b of [1, 2, 3, 4]) {
  const m = await import(path.join(HERE, `batch-${b}.mjs`));
  for (const p of m.PINS) {
    if (have.has(p.n)) throw new Error(`#${p.n} is in two batches`);
    const dir = path.join(OUT, FOLDERS[b]);
    const src = fs.readdirSync(dir).find((f) => f.startsWith(`${pad(p.n)}-`) && f.endsWith(".png"));
    if (!src) throw new Error(`no 2000 x 3000 render for #${p.n} in ${dir}`);
    have.set(p.n, { ...p, batch: b, src: path.join(dir, src) });
  }
}
for (let n = 1; n <= 101; n++) if (!have.has(n)) throw new Error(`no copy or render for idea #${n}`);

// 2. The priority tiers (by idea number, in the order they should be tried).
const T1 = [81, 90, 44, 60, 10, 42, 49, 54];
const T2 = [32, 93, 101, 6, 30, 96, 97, 95, 17, 94, 66, 33, 2, 3, 21, 29, 25, 84, 67, 75, 86, 77, 56, 73, 38, 8, 12, 16, 19, 27, 28, 37];
const T4 = [98, 99, 47, 53, 41, 100, 20, 22, 46, 64, 68, 88, 45, 63, 80, 48, 11, 39];
const T3 = bank.map((i) => i.n).filter((n) => ![...T1, ...T2, ...T4].includes(n));
const tiers = [T1, T2, T3, T4];
const NEAR = [[4, 69], [56, 65]];

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
const FOLDER = "Homeschooling-Companion-All-101-Pins";
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
  "Homeschool Planner Printables": "Printable planners, logs and record pages for homeschool",
  "Homeschool Record Keeping": "Simple ways to keep a homeschool record you will actually keep",
  "Homeschool Mid-Year Reset": "Starting, restarting and resetting a homeschool year after a break",
  "Homeschool Reading Log": "Reading log printables and simple ways to keep a record of what your child reads",
};
const boards = [...new Set(jobs.map((j) => meta(j.n).board))].sort();

const out = [];
out.push(rule, "HOMESCHOOLING COMPANION: ALL 101 PINS, IN PRIORITY ORDER", "PIN DETAILS FOR POSTING BY HAND", rule, "");
out.push("101 pins. Post them in number order: 001 first, then 002, and so on to 101. The image files are named with the same number (images/001_..., images/002_...), and each entry below gives the fields to type into Pinterest.", "");
out.push("WHAT THE ORDER MEANS", thin);
out.push(`- 001 to ${pad(lastOf(1))}: post NOW. Time-sensitive for November (the mid-year slump, systems that stall, a portfolio a few months in).`);
out.push(`- ${pad(firstOf(2))} to ${pad(lastOf(2))}: mid-November through January (winter-break catch-up, a new-year start, January resets), then the rest of the January and back-to-school favourites.`);
out.push(`- ${pad(firstOf(3))} to ${pad(lastOf(3))}: evergreen. Good any time.`);
out.push(`- ${pad(firstOf(4))} to ${pad(lastOf(4))}: spring pins (evaluation and portfolio review season, end-of-year records). If you reach them before February, it is fine to pause and start them in early February, when their searches begin to rise.`);
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
out.push(`- Product pins: ${list(product)} link to the product page and show its price on the pin. Every other pin links to a free guide. No description states a price. Check the price in Lemon Squeezy matches the product page before posting.`);
out.push(`- Pins with a small 'Example' tag (${list(example)}) show an illustration from a guide, not a real family.`);
out.push(`- Pins that refer to your state's rules (${list(caution)}) carry a line telling readers to confirm with their state. Keep it if you edit anything. State pins summarise the guides; they are not legal advice.`);
out.push("- Many pins show a demo family (Ava, Leo, Oregon, Maya) because the real app screens and printed record are shown exactly as the app makes them. None implies a real family.");
out.push("- Look-alike pairs (the daily log, the weekly planner) are already a month apart in this order. Do not reorder them together.");
out.push("- Tags are suggestions based on Pinterest-style search phrases. Pinterest search data was not available, so check the suggestions Pinterest offers as you type each tag.", "");
out.push("BOARDS USED", thin);
for (const b of boards) out.push(`- ${b}${NEW_BOARDS[b] ? `   (NEW if you have not made it: create it. Suggested board description: ${NEW_BOARDS[b]})` : ""}`);
out.push("", rule, "");
const WHEN = { 1: "Post now (November)", 2: "Mid-November to January", 3: "Evergreen, any time", 4: "Spring: start about early February" };
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
  out.push(`Links to:     ${i.link.kind === "guide" ? `the free guide "${i.link.slug}"` : "the product page (Homeschooling Companion)"}`);
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
