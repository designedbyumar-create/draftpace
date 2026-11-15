#!/usr/bin/env node
/** Builds creative/out/adhd/assets/book.pdf (US Letter) from the real Alongside Book document code, then book.txt for proof checks.
 *  The activation code is a placeholder: it must never appear on a pin. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "../../../..");
const OUT = path.join(ROOT, "creative/out/adhd/assets");
fs.mkdirSync(OUT, { recursive: true });
execFileSync("node", ["scripts/run-tsx.mjs", "scripts/generate-etsy-pdf.ts", "alongside"], { cwd: ROOT, env: { ...process.env, ACTIVATION_CODE: "AB3D-EFG7" }, stdio: "inherit" });
fs.copyFileSync(path.join(ROOT, ".etsy-pdfs/alongside-letter.pdf"), path.join(OUT, "book.pdf"));
execFileSync("pdftotext", ["-layout", path.join(OUT, "book.pdf"), path.join(OUT, "book.txt")]);
console.log("book.pdf, book.txt in", OUT);
