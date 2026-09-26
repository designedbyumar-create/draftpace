// Exports one in-article figure and one cover per guide from the flattened
// Pinterest pins: crop the card (see detect.mjs), resize, write WebP into
// public/guides/img/, and record it in src/content/guideImages.generated.json.
//
//   node scripts/figures/export.mjs "<path to Draftpace Pinterest Assets/pins>" "<path to pin_guide_map.csv>" "<path to pinmap.json>"
//
// A guide with no usable card gets no image. Nothing is invented.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { detectCard } from "./detect.mjs";

const [PINS, CSV, PINMAP] = process.argv.slice(2);
if (!PINS || !CSV || !PINMAP) throw new Error("usage: export.mjs <pins dir> <pin_guide_map.csv> <pinmap.json>");
const OUT = path.join(process.cwd(), "public/guides/img");
fs.mkdirSync(OUT, { recursive: true });

const COLOURS = {
  money: ["#176b51", "#e2efe9"], home: ["#96591a", "#f6ebda"], "mind-and-focus": ["#5a4bb8", "#e9e6f7"],
  "family-and-learning": ["#97417a", "#f7e6f1"], "affairs-and-endings": ["#4d5a68", "#e9ecef"], travel: ["#1f6291", "#e2edf5"],
  vehicles: ["#4d5a35", "#e9ecdf"], "family-health": ["#424c62", "#e6e9f0"],
};

const map = JSON.parse(fs.readFileSync(PINMAP, "utf8")).map;
const rows = fs.readFileSync(CSV, "utf8").split(/\r?\n/).slice(1).filter(Boolean);
const meta = {};
for (const line of rows) {
  const m = line.match(/^([^,]+),([^,]+),(\d+),(.*)$/);
  if (!m) continue;
  const texts = {};
  for (const part of m[4].replace(/^"|"$/g, "").split(" ; ")) {
    const t = part.match(/^([a-z]+\/[\d.]+): (.*)$/);
    if (t) texts[t[1]] = t[2];
  }
  meta[m[1]] = { area: m[2], texts };
}

const cache = new Map();
async function crop(dir, n) {
  const k = `${dir}/${n}`;
  if (!cache.has(k)) {
    const f = path.join(PINS, dir, `pin-${n}.png`);
    cache.set(k, fs.existsSync(f) ? await detectCard(f) : null);
  }
  return cache.get(k);
}

// A crop whose top and bottom edges are not both plain background has cut
// through the card (a dark card sliced mid-way, text touching the edge).
async function edgesClean(src, r) {
  const strip = async (top) => {
    const { data } = await sharp(src).extract({ left: r.left, top, width: r.width, height: 3 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const n = data.length / 3;
    const mean = [0, 1, 2].map((c) => { let t = 0; for (let i = 0; i < n; i++) t += data[i * 3 + c]; return t / n; });
    let v = 0;
    for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) v = Math.max(v, Math.abs(data[i * 3 + c] - mean[c]));
    return { mean, spread: v };
  };
  const a = await strip(r.top), b = await strip(r.top + r.height - 3);
  const dist = Math.max(...a.mean.map((m, c) => Math.abs(m - b.mean[c])));
  return a.spread < 40 && b.spread < 40 && dist < 60;
}

const manifest = {};
for (const [slug, pins] of Object.entries(map)) {
  let best = null;
  for (const [dir, n] of pins) {
    const r = await crop(dir, n);
    if (!r) continue;
    const aspect = r.width / r.height;
    if (aspect < 1.1 || aspect > 4.2 || r.height < 300) continue;
    if (!(await edgesClean(path.join(PINS, dir, `pin-${n}.png`), r))) continue;
    const score = r.width * r.height;
    if (!best || score > best.score) best = { dir, n, r, score };
  }
  if (!best) continue;
  const src = path.join(PINS, best.dir, `pin-${best.n}.png`);
  const { r } = best;
  const figW = Math.min(960, r.width);
  const fig = await sharp(src).extract(r).resize(figW).webp({ quality: 82, effort: 6 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(OUT, `${slug}.webp`), fig.data);

  const [accent, soft] = COLOURS[meta[slug]?.area] ?? ["#0e6e75", "#e0f0f0"];
  const scale = Math.min(1000 / r.width, 470 / r.height);
  const cw = Math.round(r.width * scale), ch = Math.round(r.height * scale);
  const card = await sharp(src).extract(r).resize(cw, ch).png().toBuffer();
  const mask = Buffer.from(`<svg width="${cw}" height="${ch}"><rect width="${cw}" height="${ch}" rx="22"/></svg>`);
  const rounded = await sharp(card).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  const bg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${soft}"/><stop offset="1" stop-color="${accent}" stop-opacity="0.32"/></linearGradient><filter id="s" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity="0.18"/></filter></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="${(1200 - cw) / 2}" y="${(630 - ch) / 2}" width="${cw}" height="${ch}" rx="22" fill="#fff" filter="url(#s)"/></svg>`);
  await sharp(bg).composite([{ input: rounded, left: Math.round((1200 - cw) / 2), top: Math.round((630 - ch) / 2) }]).webp({ quality: 82, effort: 6 }).toFile(path.join(OUT, `${slug}-cover.webp`));

  const headline = meta[slug]?.texts[`${best.dir}/${best.n}`];
  manifest[slug] = {
    pin: `${best.dir}/${best.n}`,
    src: `/guides/img/${slug}.webp`,
    width: fig.info.width,
    height: fig.info.height,
    cover: `/guides/img/${slug}-cover.webp`,
    headline: headline ?? null,
  };
}
fs.writeFileSync(path.join(process.cwd(), "src/content/guideImages.generated.json"), JSON.stringify(manifest, null, 1) + "\n");
console.log(Object.keys(manifest).length, "guides with an image");
