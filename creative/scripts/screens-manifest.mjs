#!/usr/bin/env node
/**
 * Writes src/screens-manifest.json: the pixel size of every real captured
 * screen in public/screens/, so a format can scroll a tall capture inside
 * a device frame without guessing its height. Re-run after adding or
 * re-capturing screens; the guard tests fail if it is out of date.
 */
import sharp from "sharp";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const dir = path.resolve(process.cwd(), "public/screens");
const out = {};
for (const f of (await readdir(dir)).filter((f) => f.endsWith(".png")).sort()) {
  const { width, height } = await sharp(path.join(dir, f)).metadata();
  out[`screens/${f}`] = { width, height };
}
await writeFile(path.resolve(process.cwd(), "src/screens-manifest.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`${Object.keys(out).length} screens`);
