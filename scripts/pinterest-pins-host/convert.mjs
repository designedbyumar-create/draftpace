/**
 * Converts the 450 pre-built Pinterest pin images (from
 * ~/Documents/Draftpace Pinterest Assets/pins/<product>/pin-*.png, built
 * by a separate session, not this one) into web-ready JPEGs under
 * public/store/pinterest-pins/<product>/, so they're real, publicly
 * reachable Media URLs once deployed.
 *
 *   node scripts/pinterest-pins-host/convert.mjs
 *
 * Source is 2000x3000 PNG (lossless, ~465KB average, 209MB total across
 * all 450). Pinterest's own recommended Pin size is 1000x1500, so the
 * source already has 2x the linear resolution of what Pinterest
 * actually targets, and Pinterest recompresses every image it ingests
 * regardless of source format. So pins are hosted at 1000x1500: every
 * deployment carries a full copy of public/, and they count toward the
 * same Vercel storage. JPEG quality 90 at the same 2000x3000 is
 * visually lossless for this content (flat color graphics and text, not
 * photography) while cutting file size by roughly 80-90%.
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC_ROOT = "/Users/user/Documents/Draftpace Pinterest Assets/pins";
const OUT_ROOT = path.resolve(process.cwd(), "public/store/pinterest-pins");

async function main() {
  const products = (await readdir(SRC_ROOT, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let total = 0;
  for (const product of products) {
    const srcDir = path.join(SRC_ROOT, product);
    const outDir = path.join(OUT_ROOT, product);
    await mkdir(outDir, { recursive: true });

    const files = (await readdir(srcDir)).filter((f) => /^pin-\d+\.\d+\.png$/.test(f));
    for (const file of files) {
      const outName = file.replace(/\.png$/, ".jpg");
      await sharp(path.join(srcDir, file))
        .resize(1000, 1500)
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(path.join(outDir, outName));
      total++;
    }
    console.log(`${product}: ${files.length} converted`);
  }
  console.log(`total: ${total}`);
}

await main();
