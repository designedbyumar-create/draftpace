/**
 * Brings every hosted Pinterest pin in the public/store/pinterest folders down to
 * Pinterest's own recommended size, 1000 x 1500. Pinterest recompresses
 * every image it takes in, so a 2000 x 3000 source only costs space: each
 * deployment carries a full copy of public/, and on the Hobby plan every
 * kept deployment counts toward the same 10 GB.
 *
 *   node scripts/pinterest-pins-host/shrink.mjs
 *
 * Same file names and formats, so every CSV's Media URL still works.
 * Images already 1000 wide or smaller are left alone, so it is safe to
 * run after any pin build.
 */
import sharp from "sharp";
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const STORE = path.resolve(process.cwd(), "public/store");
const WIDTH = 1000, HEIGHT = 1500;

async function files(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await files(p)));
    else if (/\.(jpe?g|png)$/i.test(e.name)) out.push(p);
  }
  return out;
}

let before = 0, after = 0, changed = 0;
const sets = (await readdir(STORE, { withFileTypes: true })).filter((d) => d.isDirectory() && d.name.startsWith("pinterest"));
for (const set of sets) {
  for (const file of await files(path.join(STORE, set.name))) {
    const size = (await stat(file)).size;
    before += size;
    const { width } = await sharp(file).metadata();
    if (width <= WIDTH) { after += size; continue; }
    const img = sharp(file).resize(WIDTH, HEIGHT, { fit: "cover" });
    const buf = /\.png$/i.test(file) ? await img.png({ compressionLevel: 9 }).toBuffer() : await img.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    await writeFile(file, buf);
    after += buf.length;
    changed++;
  }
}
console.log(`${changed} pins resized to ${WIDTH}x${HEIGHT}: ${(before / 1e6).toFixed(0)} MB -> ${(after / 1e6).toFixed(0)} MB`);
