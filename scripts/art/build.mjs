// Validates every spec in scripts/art/specs/*.json, renders hero, thumb and
// figure WebPs into public/guides/art/, and writes the manifest the site reads.
//   node scripts/art/build.mjs [slug ...]      (no slugs: everything, and stale files are removed)
import fs from "node:fs";
import path from "node:path";
import { renderSpecs } from "./render.mjs";
import { PIECES, AREAS } from "./lib.mjs";

const root = process.cwd();
const specDir = path.join(root, "scripts/art/specs");
const out = path.join(root, "public/guides/art");
const only = process.argv.slice(2);

const specs = fs.readdirSync(specDir).filter((f) => f.endsWith(".json")).flatMap((f) => JSON.parse(fs.readFileSync(path.join(specDir, f), "utf8")));
const bad = [];
const seen = new Set();
for (const s of specs) {
  if (seen.has(s.slug)) bad.push(`${s.slug}: duplicated`);
  seen.add(s.slug);
  if (!AREAS[s.area]) bad.push(`${s.slug}: unknown area ${s.area}`);
  if (!s.line1 || !s.line2 || s.line1.length > 26 || s.line2.length > 26) bad.push(`${s.slug}: headline lines must be 1 to 26 characters`);
  if (!s.alt || s.alt.length < 40 || s.alt.length > 200) bad.push(`${s.slug}: alt text must be 40 to 200 characters`);
  if (!s.caption || s.caption.length > 130) bad.push(`${s.slug}: caption missing or over 130 characters`);
  if (!Array.isArray(s.pieces) || s.pieces.length < 1 || s.pieces.length > 2) bad.push(`${s.slug}: needs 1 or 2 pieces`);
  for (const p of s.pieces ?? []) if (!PIECES[p.type]) bad.push(`${s.slug}: unknown piece type ${p.type}`);
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }

const todo = specs.filter((s) => !only.length || only.includes(s.slug));
await renderSpecs(todo, out);

const manifestPath = path.join(root, "src/content/guideArt.generated.json");
const manifest = fs.existsSync(manifestPath) && only.length ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
for (const s of todo) {
  manifest[s.slug] = { hero: `/guides/art/${s.slug}-hero.webp`, thumb: `/guides/art/${s.slug}-thumb.webp`, figure: `/guides/art/${s.slug}-figure.webp`, figureWidth: 1000, figureHeight: 700, alt: s.alt, caption: s.caption };
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1) + "\n");
if (!only.length) {
  const keep = new Set(specs.flatMap((s) => ["hero", "thumb", "figure"].map((m) => `${s.slug}-${m}.webp`)));
  for (const f of fs.readdirSync(out)) if (!keep.has(f)) fs.unlinkSync(path.join(out, f));
}
console.log(`${todo.length} guides rendered`);
