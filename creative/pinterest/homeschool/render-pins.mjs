#!/usr/bin/env node
/**
 * Renders the Homeschooling Companion mockup pins: every pins/*.mjs, or
 * the files named, or only the idea numbers given after --only.
 *
 *   node pinterest/homeschool/render-pins.mjs                  all
 *   node pinterest/homeschool/render-pins.mjs app              pins/app*.mjs
 *   node pinterest/homeschool/render-pins.mjs --only 55,4      those ideas
 *   ... --scale 2 --out out/homeschool/hq                       2000 x 3000 into another folder
 *
 * A pin module exports `pins`: [{ n, id, html }] (n = the idea's number in
 * ideas-101.json). Writes out/homeschool/pins/<NN>-<id>.png at 1000 x 1500
 * and out/homeschool/pins/sheet-<scope>.png, and prints ⚠ for anything
 * marked data-check that leaves the page, overflows its box or runs into
 * the product line.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const HERE = import.meta.dirname;
const OUT = path.resolve(HERE, "../../out/homeschool/pins");
const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const only = flag("--only") ? flag("--only").split(",").map(Number) : null;
// --scale 2 renders at 2000 x 3000 (device pixel ratio 2); --out puts the files elsewhere.
const scale = Number(flag("--scale") ?? 1);
const OUTDIR = flag("--out") ? path.resolve(flag("--out")) : OUT;
const names = args.filter((a, k) => !a.startsWith("--") && !["--only", "--scale", "--out"].includes(args[k - 1]));
fs.mkdirSync(OUTDIR, { recursive: true });

const files = fs.readdirSync(path.join(HERE, "pins")).filter((f) => f.endsWith(".mjs")).filter((f) => !names.length || names.some((x) => f.startsWith(x))).sort();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const pg = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: scale });
const done = [];
for (const f of files) {
  const { pins } = await import(path.join(HERE, "pins", f));
  for (const pin of pins) {
    if (only && !only.includes(pin.n)) continue;
    const html = path.join(OUTDIR, `${String(pin.n).padStart(3, "0")}.html`);
    fs.writeFileSync(html, pin.html);
    await pg.goto(`file://${html}`);
    await pg.evaluate(() => document.fonts.ready);
    await pg.evaluate(() => Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })))));
    const spill = await pg.evaluate(() => {
      const out = [];
      const foot = document.querySelector(".foot")?.getBoundingClientRect();
      for (const el of document.querySelectorAll("[data-check]")) {
        const r = el.getBoundingClientRect();
        const what = el.dataset.check;
        // A phone or page may bleed off the pin on purpose; text blocks may not.
        if (!["phone", "page"].includes(what) && (r.left < -1 || r.top < -1 || r.right > 1001 || r.bottom > 1501)) out.push(`${what} leaves the page`);
        if (!["phone", "page"].includes(what) && foot && r.bottom > foot.top && r.top < foot.bottom && r.right > foot.left && r.left < foot.right) out.push(`${what} runs into the product line`);
        if (el.dataset.bottomMax && r.bottom > Number(el.dataset.bottomMax)) out.push(`${what} ends at y=${Math.round(r.bottom)}, past ${el.dataset.bottomMax} where the scene starts`);
        if (!["phone", "page"].includes(what) && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) out.push(`${what} overflows its box`);
      }
      return out;
    });
    const png = path.join(OUTDIR, `${String(pin.n).padStart(3, "0")}-${pin.id.replace(/^\d+-/, "")}.png`);
    await pg.screenshot({ path: png });
    fs.rmSync(html);
    done.push(png);
    console.log(`${path.relative(process.cwd(), png)}${spill.length ? `  ⚠ ${[...new Set(spill)].join("; ")}` : ""}`);
  }
}
await browser.close();
if (done.length) {
  const scope = (only ?? names).length ? (only ?? names).join("-") : "all";
  const cols = Math.min(4, done.length);
  const py = `import sys\nfrom PIL import Image\nfs=sys.argv[2:];c=${cols};w,h=400,600\nrows=(len(fs)+c-1)//c\ns=Image.new('RGB',(w*c,h*rows),'white')\nfor i,f in enumerate(fs):s.paste(Image.open(f).convert('RGB').resize((w,h)),((i%c)*w,(i//c)*h))\ns.save(sys.argv[1])`;
  execFileSync("python3", ["-c", py, path.join(OUTDIR, `sheet-${scope}.png`), ...done]);
}
