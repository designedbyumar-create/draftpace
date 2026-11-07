/**
 * The real material the mockup pins are made from, prepared once:
 *
 * - the pages of the printed book "The Homeschool Year", rasterised from
 *   the product's own PDF (src/products/homeschooling-companion/printables/
 *   homeschoolYearLetter.base64.ts, the file the app hands people), as
 *   out/homeschool/assets/book-pNN.png at 200 dpi;
 * - the product's real app screens (creative/public/screens), used as they
 *   are. Pins crop them with `phone()`; nothing is redrawn.
 *
 *   node pinterest/homeschool/kit/assets.mjs        prepare everything
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const CREATIVE = path.resolve(import.meta.dirname, "../../..");
const REPO = path.resolve(CREATIVE, "..");
export const OUT = path.join(CREATIVE, "out/homeschool/assets");
export const SCREENS = path.join(CREATIVE, "public/screens");

const pad = (n) => String(n).padStart(2, "0");

/** Decode the book PDF from the product source and rasterise every page. Idempotent. */
export function prepareBook() {
  fs.mkdirSync(OUT, { recursive: true });
  const pdf = path.join(OUT, "book.pdf");
  if (!fs.existsSync(pdf)) {
    const src = fs.readFileSync(path.join(REPO, "src/products/homeschooling-companion/printables/homeschoolYearLetter.base64.ts"), "utf8");
    const b64 = (src.match(/"([A-Za-z0-9+/=]{1000,})"/) ?? src.match(/`([A-Za-z0-9+/=\s]{1000,})`/))?.[1];
    if (!b64) throw new Error("no base64 PDF in homeschoolYearLetter.base64.ts");
    fs.writeFileSync(pdf, Buffer.from(b64.replace(/\s/g, ""), "base64"));
  }
  if (!fs.existsSync(path.join(OUT, "book-p01.png"))) {
    execFileSync("pdftoppm", ["-r", "200", "-png", pdf, path.join(OUT, "book-p")]);
    // pdftoppm names pages book-p-01.png or book-p-1.png depending on the page count: normalise to book-pNN.png.
    for (const f of fs.readdirSync(OUT)) {
      const m = f.match(/^book-p-(\d+)\.png$/);
      if (m) fs.renameSync(path.join(OUT, f), path.join(OUT, `book-p${pad(Number(m[1]))}.png`));
    }
  }
}

/** file:// URL of a book page (1-30). */
export function bookPage(n) {
  prepareBook();
  const file = path.join(OUT, `book-p${pad(n)}.png`);
  if (!fs.existsSync(file)) throw new Error(`no book page ${n} (${file})`);
  return pathToFileURL(file).href;
}

/** file:// URL of a real app screen: "kids", "record" or "workspace". */
export function screen(name) {
  const file = path.join(SCREENS, `homeschooling-companion-${name}.png`);
  if (!fs.existsSync(file)) throw new Error(`no real screen ${name} (${file})`);
  return pathToFileURL(file).href;
}

/** file:// URL of any file under out/homeschool/assets (record pages, captures), failing loudly if it was not produced. */
export function asset(name) {
  const file = path.join(OUT, name);
  if (!fs.existsSync(file)) throw new Error(`asset ${name} has not been produced (${file})`);
  return pathToFileURL(file).href;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  prepareBook();
  console.log(`book pages ready in ${path.relative(process.cwd(), OUT)}`);
}
