/**
 * The real material the mockup pins are made from, prepared once:
 *
 * - the pages of the printed book "The Alongside Book", rasterised from
 *   the product's own PDF (src/products/alongside/printables/
 *   homeSurveyLetter.base64.ts, the file the app hands people), as
 *   out/adhd/assets/book-pNN.png at 200 dpi;
 * - the product's real app screens (creative/public/screens), used as they
 *   are. Pins crop them with `phone()`; nothing is redrawn.
 *
 *   node pinterest/adhd/kit/assets.mjs        prepare everything
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const CREATIVE = path.resolve(import.meta.dirname, "../../..");
const REPO = path.resolve(CREATIVE, "..");
export const OUT = path.join(CREATIVE, "out/adhd/assets");
export const SCREENS = path.join(CREATIVE, "public/screens");

const pad = (n) => String(n).padStart(2, "0");

/** Rasterise the printed book (out/adhd/assets/book.pdf, produced from the real document code by capture/book.mjs). Idempotent. */
export function prepareBook() {
  fs.mkdirSync(OUT, { recursive: true });
  const pdf = path.join(OUT, "book.pdf");
  if (!fs.existsSync(pdf)) throw new Error("no out/adhd/assets/book.pdf yet: run node pinterest/adhd/capture/book.mjs");
  if (!fs.existsSync(path.join(OUT, "book-p01.png"))) {
    execFileSync("pdftoppm", ["-r", "200", "-png", pdf, path.join(OUT, "book-p")]);
    for (const f of fs.readdirSync(OUT)) {
      const m = f.match(/^book-p-(\d+)\.png$/);
      if (m) fs.renameSync(path.join(OUT, f), path.join(OUT, `book-p${pad(Number(m[1]))}.png`));
    }
  }
}

/** file:// URL of a book page (1-N). */
export function bookPage(n) {
  prepareBook();
  const file = path.join(OUT, `book-p${pad(n)}.png`);
  if (!fs.existsSync(file)) throw new Error(`no book page ${n} (${file})`);
  return pathToFileURL(file).href;
}

/** file:// URL of a real app screen: "help", "life" or "workspace". */
export function screen(name) {
  const file = path.join(SCREENS, `alongside-${name}.png`);
  if (!fs.existsSync(file)) throw new Error(`no real screen ${name} (${file})`);
  return pathToFileURL(file).href;
}

/** file:// URL of any file under out/adhd/assets (record pages, captures), failing loudly if it was not produced. */
export function asset(name) {
  const file = path.join(OUT, name);
  if (!fs.existsSync(file)) throw new Error(`asset ${name} has not been produced (${file})`);
  return pathToFileURL(file).href;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  prepareBook();
  console.log(`book pages ready in ${path.relative(process.cwd(), OUT)}`);
}
