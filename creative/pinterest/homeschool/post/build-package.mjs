#!/usr/bin/env node
/**
 * Builds the hand-posting package for a batch: high-quality JPEGs plus one
 * text document with, for each pin, the title, description, link, board,
 * tags and alt text.
 *
 *   node pinterest/homeschool/post/build-package.mjs batch-1 out/homeschool/hq
 *
 * `batch-1` is post/<name>.mjs (PINS in posting order); the second argument
 * is the folder of 2000 x 3000 renders (render-pins.mjs --scale 2). Writes
 * out/homeschool/package-<name>/ and out/homeschool/Homeschooling-Companion-<Name>.zip.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const HERE = import.meta.dirname;
const CREATIVE = path.resolve(HERE, "../../..");
const [name, hqArg] = process.argv.slice(2);
if (!name || !hqArg) throw new Error("usage: build-package.mjs <batch-name> <hq-folder>");
const HQ = path.resolve(hqArg);
const { PINS, NAME, NOTES } = await import(path.join(HERE, `${name}.mjs`));
const bank = JSON.parse(fs.readFileSync(path.join(HERE, "../ideas-101.json"), "utf8"));
const label = name.replace(/^batch-(\d+)$/, "Batch-$1");
const PKG = path.join(CREATIVE, "out/homeschool", `package-${name}`);
const FOLDER = `Homeschooling-Companion-${label}`;
fs.rmSync(PKG, { recursive: true, force: true });
fs.mkdirSync(path.join(PKG, FOLDER, "images"), { recursive: true });

const link = (i) => {
  const base = i.link.kind === "guide" ? `https://draftpace.com/guides/${i.link.slug}` : `https://draftpace.com/shop/${i.link.slug}`;
  return `${base}?utm_source=pinterest&utm_medium=organic_social&utm_campaign=homeschool&utm_content=hs-${String(i.n).padStart(3, "0")}`;
};
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52).replace(/-$/, "");
const pad2 = (n) => String(n).padStart(2, "0");

// 1. The images: 2000 x 3000 PNG renders to JPEG, quality 95, full colour detail (4:4:4) so small text stays crisp.
const jobs = PINS.map((p, k) => {
  const i = bank.find((x) => x.n === p.n);
  const src = fs.readdirSync(HQ).find((f) => f.startsWith(`${String(p.n).padStart(3, "0")}-`) && f.endsWith(".png"));
  if (!src) throw new Error(`no render for #${p.n} in ${HQ}`);
  return { p, i, src: path.join(HQ, src), file: `${pad2(k + 1)}_${slug(i.headline)}.jpg` };
});
const py = `import sys,json\nfrom PIL import Image\njobs=json.load(sys.stdin)\nfor j in jobs:\n    im=Image.open(j['src']).convert('RGB')\n    assert im.size==(2000,3000),(j['src'],im.size)\n    im.save(j['dst'],'JPEG',quality=95,subsampling=0,optimize=True)\n`;
execFileSync("python3", ["-c", py], { input: JSON.stringify(jobs.map((j) => ({ src: j.src, dst: path.join(PKG, FOLDER, "images", j.file) }))) });

// 2. The text document.
const rule = "=".repeat(78), thin = "-".repeat(78);
const boards = [...new Set(PINS.map((p) => bank.find((x) => x.n === p.n).board))];
const NEW_BOARDS = { "Homeschool Planner Printables": "Printable planners, logs and record pages for homeschool", "Homeschool Record Keeping": "Simple ways to keep a homeschool record you will actually keep", "Homeschool Mid-Year Reset": "Starting, restarting and resetting a homeschool year after a break" };
const out = [];
out.push(rule, `${NAME.toUpperCase()}`, "PIN DETAILS FOR POSTING BY HAND", rule, "");
out.push(`${PINS.length} pins, listed in the order to post them. Each pin has its image file (in the images folder), then the fields to type into Pinterest.`, "");
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
const DEFAULT_NOTES = [
  "Near-duplicate pairs: pins 05 and 21 both show the daily log, and 03 and 17 both show the weekly planner, with similar titles. Post each pair at least a week apart (the order below already does).",
  "The price on the pins comes from the product page. No description states a price. Check the price in Lemon Squeezy matches the product page before posting.",
  "Many pins show a demo family (Ava, Leo, Oregon) because the real app screens and printed record are shown exactly as the app makes them. None implies a real family.",
  "State pins carry 'Laws change. Confirm with your state before relying on this.' Keep that line if you edit anything.",
];
for (const n of NOTES ?? DEFAULT_NOTES) out.push(`- ${n}`);
out.push("");
out.push("BOARDS USED", thin);
for (const b of boards) out.push(`- ${b}${NEW_BOARDS[b] ? `   (NEW: create it. Suggested board description: ${NEW_BOARDS[b]})` : ""}`);
out.push("", rule, "");
jobs.forEach((j, k) => {
  const { p, i } = j;
  out.push(`PIN ${pad2(k + 1)} OF ${PINS.length}   (idea #${p.n})`, thin);
  out.push(`Image file:   images/${j.file}`);
  out.push(`Title:        ${i.headline}`);
  out.push(`Description:  ${p.description}`);
  out.push(`Link:         ${link(i)}`);
  out.push(`Board:        ${i.board}`);
  out.push(`Tags:         ${p.tags.join(", ")}`);
  out.push(`Alt text:     ${p.alt}`);
  out.push(`Good timing:  ${i.when}`);
  out.push(`Links to:     ${i.link.kind === "guide" ? `the free guide "${i.link.slug}"` : "the product page (Homeschooling Companion)"}`);
  out.push("", "");
});
for (const j of jobs) {
  const { p, i } = j;
  const issues = [];
  if (i.headline.length > 100) issues.push("title");
  if (p.description.length > 500) issues.push("description");
  if (p.alt.length > 500) issues.push("alt");
  if (p.tags.length > 10) issues.push("tags");
  if (issues.length) throw new Error(`#${p.n}: ${issues.join(", ")} over Pinterest's limit`);
}
fs.writeFileSync(path.join(PKG, FOLDER, "PIN-DETAILS.txt"), out.join("\n"), "utf8");

// 3. The zip.
const zip = path.join(CREATIVE, "out/homeschool", `${FOLDER}.zip`);
fs.rmSync(zip, { force: true });
execFileSync("python3", ["-c", "import shutil,sys;shutil.make_archive(sys.argv[1][:-4],'zip',sys.argv[2],sys.argv[3])", zip, PKG, FOLDER]);
const mb = fs.statSync(zip).size / 1e6;
console.log(`${jobs.length} images + PIN-DETAILS.txt -> ${path.relative(process.cwd(), zip)} (${mb.toFixed(1)} MB)`);
