import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "playwright";
import { pageHtml } from "./lib.mjs";

// node scripts/art/render.mjs <specs.json> [slug ...]   writes public/guides/art/<slug>-{hero,thumb,figure}.webp
export async function renderSpecs(specs, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const br = await chromium.launch();
  const sizes = { hero: [1200, 630], thumb: [800, 600], figure: [1000, 700] };
  for (const spec of specs) {
    for (const mode of ["hero", "thumb", "figure"]) {
      const [w, h] = sizes[mode];
      const page = await br.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
      await page.setContent(pageHtml(spec, mode), { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => window.__layout()));
      const png = await page.screenshot();
      await sharp(png).resize(w * (mode === "hero" ? 1 : 1), h).webp({ quality: 86, effort: 5 }).toFile(path.join(outDir, `${spec.slug}-${mode}.webp`));
      await page.close();
    }
  }
  await br.close();
}
if (process.argv[1].endsWith("render.mjs")) {
  const [file, ...only] = process.argv.slice(2);
  const specs = JSON.parse(fs.readFileSync(file, "utf8")).filter((s) => !only.length || only.includes(s.slug));
  await renderSpecs(specs, path.resolve(process.cwd(), process.env.OUT ?? "public/guides/art"));
  console.log("rendered", specs.length);
}
