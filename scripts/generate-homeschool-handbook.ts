/**
 * Renders The Homeschool Year, so every page can be proofed before
 * anybody can buy one.
 *
 *   node scripts/run-tsx.mjs scripts/generate-homeschool-handbook.ts
 */
import { Font, renderToFile } from "@react-pdf/renderer";
import { mkdir, readFile, access, writeFile } from "node:fs/promises";
import path from "node:path";
import { HomeschoolHandbook } from "../src/products/homeschooling-companion/printables/handbook";

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

for (const size of ["LETTER", "A4"] as const) {
  const file = path.join(OUT, `homeschool-year-${size.toLowerCase()}.pdf`);
  await renderToFile(HomeschoolHandbook({ size }), file);
  const bytes = await readFile(file);
  console.log(`${path.basename(file)}  ${bytes.length.toLocaleString()} bytes`);
}
