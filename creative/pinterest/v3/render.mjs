#!/usr/bin/env node
/**
 * Renders the v3 test pins: every products/<slug>.mjs, or the ones named.
 *
 *   node pinterest/v3/render.mjs                    all products
 *   node pinterest/v3/render.mjs travel-companion   one product
 *
 * Each product module exports `pins`: [{ id, html }] where html is a whole
 * page from kit.page(). Writes out/v3/<slug>--<id>.png (1000 x 1500) and
 * out/v3/sheet.png, every pin side by side, to review.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const HERE = import.meta.dirname;
const OUT = path.resolve(HERE, "../../out/v3");
const only = process.argv.slice(2);
const slugs = fs.readdirSync(path.join(HERE, "products")).filter((f) => f.endsWith(".mjs")).map((f) => f.replace(/\.mjs$/, "")).filter((s) => !only.length || only.includes(s)).sort();
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1000, height: 1500 } });
const written = [];
for (const slug of slugs) {
  const { pins } = await import(path.join(HERE, "products", `${slug}.mjs`));
  for (const pin of pins) {
    const html = path.join(OUT, `${slug}--${pin.id}.html`);
    fs.writeFileSync(html, pin.html);
    await page.goto(`file://${html}`);
    await page.evaluate(() => document.fonts.ready);
    // A pin must not spill: anything that leaves the page or overlaps the product line is a layout bug.
    const spill = await page.evaluate(() => {
      const out = [];
      const foot = document.querySelector(".foot")?.getBoundingClientRect();
      for (const el of document.querySelectorAll("[data-check]")) {
        const r = el.getBoundingClientRect();
        if (r.left < 0 || r.top < 0 || r.right > 1000 || r.bottom > 1500) out.push(`${el.dataset.check} leaves the page`);
        if (foot && r.bottom > foot.top && r.top < foot.bottom && r.right > foot.left && r.left < foot.right) out.push(`${el.dataset.check} runs into the product line`);
        if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) out.push(`${el.dataset.check} overflows its box`);
      }
      return out;
    });
    const png = path.join(OUT, `${slug}--${pin.id}.png`);
    await page.screenshot({ path: png });
    fs.rmSync(html);
    written.push(png);
    console.log(`${path.relative(process.cwd(), png)}${spill.length ? `  ⚠ ${spill.join("; ")}` : ""}`);
  }
}
await browser.close();

// A contact sheet of what was just rendered, three across.
const { execFileSync } = await import("node:child_process");
const cols = Math.min(3, written.length);
const py = `import sys\nfrom PIL import Image\nfs=sys.argv[2:];c=${cols};w,h=500,750\nrows=(len(fs)+c-1)//c\ns=Image.new('RGB',(w*c,h*rows),'white')\nfor i,f in enumerate(fs):s.paste(Image.open(f).convert('RGB').resize((w,h)),((i%c)*w,(i//c)*h))\ns.save(sys.argv[1])`;
if (written.length) execFileSync("python3", ["-c", py, path.join(OUT, "sheet.png"), ...written]);
