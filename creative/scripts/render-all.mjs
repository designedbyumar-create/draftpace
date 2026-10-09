#!/usr/bin/env node
/**
 * Make every film as a video file, sorted into a folder per platform.
 *
 *   npm run videos                 from the draftpace folder: every film (hours; leave it running)
 *   npm run videos -- pinterest    only the folders whose name contains "pinterest"
 *   npm run videos -- --limit 5    only the next 5 videos (run it again for the next 5)
 *
 * Output goes to "Draftpace Videos" on the Desktop (or DRAFTPACE_VIDEOS):
 *
 *   Draftpace Videos/
 *     1 Pinterest/
 *       Home Base - Seasonal home maintenance checklist.mp4
 *       Home Base - Seasonal home maintenance checklist.txt   the caption, title and tracked link to paste
 *     2 Facebook - Reels/ ...  3 Facebook - Feed/ ...  4 Instagram - Reels/ ...  6 YouTube Shorts/ ...
 *
 * A video already in its folder is skipped, so this can be stopped (Ctrl+C)
 * and started again at any time and carries on where it left off. Each file
 * is rendered and its sound mastered before it is moved into its folder, so
 * a folder never holds a half-made video.
 */
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { createServer } from "vite";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { webpackOverride } from "../webpack-override.mjs";
import { browserExecutable } from "./browser.mjs";
import { masterVideo } from "./master-audio.mjs";

const CREATIVE = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const limitAt = args.indexOf("--limit");
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;
const filter = (args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--limit") ?? "").toLowerCase();
const withVoiceover = process.argv.includes("--with-voiceover");
const desktop = path.join(os.homedir(), "Desktop");
const ROOT = process.env.DRAFTPACE_VIDEOS ?? (fs.existsSync(desktop) ? path.join(desktop, "Draftpace Videos") : path.join(CREATIVE, "out", "by-platform"));

// The order folders are made in, one platform finished before the next starts: Pinterest, then Facebook, then the rest.
const FOLDERS = [
  ["pinterest-video", "1 Pinterest"],
  ["facebook-reel", "2 Facebook - Reels"],
  ["facebook-feed", "3 Facebook - Feed"],
  ["instagram-reel", "4 Instagram - Reels"],
  ["instagram-feed", "5 Instagram - Feed"],
  ["youtube-short", "6 YouTube Shorts"],
  ["tiktok", "7 TikTok"],
];

const log = (m) => console.log(`[${new Date().toLocaleTimeString()}] ${m}`);
const clean = (t) => t.replace(/[\/\\:*?"<>|]+/g, "").replace(/\s+/g, " ").trim();
const short = (t, n) => (t.length <= n ? t : t.slice(0, n).replace(/\s+\S*$/, ""));

// Words and copy come from the engine's own modules (the listings, the guides, Studio's publishing drafts).
const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom", root: CREATIVE,
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.join(CREATIVE, "..", "src"), "@engine": CREATIVE } },
});
const { SHOP_LISTINGS } = await vite.ssrLoadModule(path.join(CREATIVE, "src", "shop-listings.ts"));
const { GUIDES } = await vite.ssrLoadModule(path.join(CREATIVE, "..", "src", "content", "guides.ts"));
const { publishCopy } = await vite.ssrLoadModule(path.join(CREATIVE, "..", "studio", "lib", "publish.ts"));
await vite.close();

function filmFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filmFiles(path.join(dir, e.name)) : e.name.endsWith(".film.json") ? [path.join(dir, e.name)] : []));
}

const films = filmFiles(path.join(CREATIVE, "shots"))
  .map((f) => JSON.parse(fs.readFileSync(f, "utf8")))
  .filter((f) => withVoiceover || !f.voiceover);

// Plan every file first: its folder, a name a person can read, and its caption.
const taken = new Set();
const jobs = [];
for (const [platform, folder] of FOLDERS) {
  if (filter && !folder.toLowerCase().includes(filter) && !platform.includes(filter)) continue;
  for (const film of films.filter((f) => f.platform === platform).sort((a, b) => a.id.localeCompare(b.id))) {
    const product = SHOP_LISTINGS[film.product].title;
    let name = clean(`${product} - ${short(film.angle.text, 70)}`);
    if (taken.has(`${folder}/${name}`)) name = clean(`${name} (${film.id.slice(-24)})`);
    taken.add(`${folder}/${name}`);
    const guide = film.guide ? GUIDES.find((g) => g.slug === film.guide) : undefined;
    jobs.push({ film, folder, name, copy: publishCopy(film, { productName: product, guideDek: guide?.dek }) });
  }
}

const remaining = jobs.filter((j) => !fs.existsSync(path.join(ROOT, j.folder, `${j.name}.mp4`)));
const todo = remaining.slice(0, limit);
log(`${jobs.length} videos for ${new Set(jobs.map((j) => j.folder)).size} folders in "${ROOT}"`);
log(`${jobs.length - remaining.length} already made, ${remaining.length} to make${todo.length < remaining.length ? `, making the next ${todo.length} now` : ""}`);
if (!todo.length) process.exit(0);

function writeCaption(j) {
  const c = j.copy;
  const lines = [
    `${j.folder}: ${j.name}`,
    "",
    ...(c.title ? ["TITLE", c.title, ""] : []),
    "CAPTION",
    c.caption,
    "",
    "LINK",
    c.link,
    c.linkNote,
    "",
    "ALT TEXT",
    c.altText,
    "",
    `Film id: ${j.film.id}`,
  ];
  fs.writeFileSync(path.join(ROOT, j.folder, `${j.name}.txt`), lines.join("\n") + "\n");
}

log("preparing the engine (about a minute)...");
const bundled = await bundle({ entryPoint: path.join(CREATIVE, "src", "index.ts"), webpackOverride });
const tmpDir = path.join(CREATIVE, "out", "render-all-tmp");
fs.mkdirSync(tmpDir, { recursive: true });

const started = Date.now();
for (const [i, j] of todo.entries()) {
  const dir = path.join(ROOT, j.folder);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(tmpDir, `${j.film.id}.mp4`);
  log(`${i + 1}/${todo.length}  ${j.folder} / ${j.name}`);
  try {
    const composition = await selectComposition({ browserExecutable, serveUrl: bundled, id: `Film-${j.film.id}` });
    await renderMedia({ browserExecutable, composition, serveUrl: bundled, codec: "h264", outputLocation: tmp });
    masterVideo(tmp);
    fs.renameSync(tmp, path.join(dir, `${j.name}.mp4`));
    writeCaption(j);
  } catch (e) {
    log(`  could not make this one, skipping it: ${e.message.split("\n")[0]}`);
    fs.rmSync(tmp, { force: true });
    continue;
  }
  const each = (Date.now() - started) / (i + 1);
  const left = Math.round((each * (todo.length - i - 1)) / 60000);
  if (todo.length - i - 1) log(`  done. About ${left >= 60 ? `${Math.floor(left / 60)}h ${left % 60}m` : `${left}m`} to go.`);
}
fs.rmSync(tmpDir, { recursive: true, force: true });
log(`Finished. Your videos are in "${ROOT}".`);
process.exit(0);
