/**
 * Tiles rendered PNGs into one contact sheet so a whole batch can be
 * looked at in one go: node scripts/contact-sheet.mjs <out.png> <cols> <file...>
 */
import sharp from "sharp";
const [out, colsArg, ...files] = process.argv.slice(2);
const cols = Number(colsArg) || 4;
const W = 360;
const tiles = await Promise.all(files.map(async (f) => {
  const img = sharp(f).resize({ width: W });
  const buf = await img.png().toBuffer();
  const { height } = await sharp(buf).metadata();
  return { buf, height };
}));
const H = Math.max(...tiles.map((t) => t.height));
const rows = Math.ceil(tiles.length / cols);
const gap = 12;
await sharp({ create: { width: cols * (W + gap) + gap, height: rows * (H + gap) + gap, channels: 3, background: "#222" } })
  .composite(tiles.map((t, i) => ({ input: t.buf, left: gap + (i % cols) * (W + gap), top: gap + Math.floor(i / cols) * (H + gap) })))
  .png().toFile(out);
console.log(`${out}: ${tiles.length} tiles`);
