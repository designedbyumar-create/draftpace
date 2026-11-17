#!/usr/bin/env node
/**
 * Turns approved Pinterest-ratio posts into hosted pin images and a
 * Pinterest bulk-upload CSV, the same shape the existing pin pipeline uses
 * (scripts/pinterest-pins-host/build-csvs.mjs).
 *
 *   node scripts/publish-pinterest.mjs approvals.json
 *
 * Reads only posts marked "approve" in approvals.json (from review.mjs) at
 * the `pinterest` ratio. For each:
 *  - converts out/images/Post-<id>-pinterest.png to a quality-90 JPEG at
 *    ../public/store/pinterest-creative/<product>/<id>.jpg (it resolves as a
 *    Media URL once deployed, like the existing pins);
 *  - writes one CSV row whose every field comes from the real product:
 *    Title = the post's headline; Description = the real problemsSolved
 *    solution it shows, plus the product name and price from the Shop
 *    listing; Link = the product's Shop page; Pinterest board = the board
 *    named for that product in creative/publishing.json (left blank, with a
 *    warning, rather than guessed). Publish date and Keywords are left for
 *    whoever schedules the batch.
 *
 * Output CSV: creative/out/pinterest-<date>.csv. Nothing is posted to
 * Pinterest; this only prepares the upload.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createServer } from "vite";

const SITE = "https://draftpace.com";
const [approvalsFile] = process.argv.slice(2);
if (!approvalsFile) throw new Error("usage: publish-pinterest.mjs approvals.json");

const approvals = JSON.parse(await readFile(approvalsFile, "utf8"));
const boards = existsSync("publishing.json") ? JSON.parse(await readFile("publishing.json", "utf8")).pinterestBoards ?? {} : {};

// The real Shop listings, loaded from source (through Vite, which already
// powers the app's tests) rather than from a copy that could drift.
const vite = await createServer({
  configFile: false,
  logLevel: "error",
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true },
  appType: "custom",
  resolve: { alias: { "@": path.resolve("../src") } },
});
const { listingFor, productLine } = await vite.ssrLoadModule(path.resolve("src/shop-listings.ts"));
const posts = {};
for (const slug of await readdir("shots")) {
  const f = path.join("shots", slug, "feature-posts.json");
  if (existsSync(f)) for (const p of JSON.parse(await readFile(f, "utf8")).posts) posts[p.id] = p;
}

const csv = (v) => (/[",\n\r]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const rows = [["Title", "Media URL", "Pinterest board", "Description", "Link", "Publish date", "Keywords"]];
const missingBoards = new Set();

for (const d of approvals.decisions.filter((d) => d.decision === "approve" && d.kind === "still" && d.ratio === "pinterest")) {
  const postId = d.id.replace(/^Post-/, "").replace(/-pinterest$/, "");
  const post = posts[postId];
  if (!post) { console.warn(`skip ${d.id}: not a promotional post`); continue; }
  const listing = listingFor(post.themeSlug);
  const { name, price } = productLine(post.themeSlug);
  const entry = listing.problemsSolved[post.problem];
  const src = path.join("out/images", `${d.id}.png`);
  if (!existsSync(src)) throw new Error(`${src} is missing; render it first`);
  const dir = path.resolve("../public/store/pinterest-creative", post.themeSlug);
  await mkdir(dir, { recursive: true });
  await sharp(src).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(dir, `${postId}.jpg`));
  const board = boards[post.themeSlug] ?? "";
  if (!board) missingBoards.add(post.themeSlug);
  rows.push([
    post.headline.join(" "),
    `${SITE}/store/pinterest-creative/${post.themeSlug}/${postId}.jpg`,
    board,
    `${entry.solution} ${name}, ${price}. Made by Draftpace.`,
    `${SITE}/shop/${post.themeSlug}`,
    "",
    "",
  ]);
}

await mkdir("out", { recursive: true });
const out = `out/pinterest-${new Date().toISOString().slice(0, 10)}.csv`;
await writeFile(out, rows.map((r) => r.map(csv).join(",")).join("\n") + "\n");
console.log(`${out}: ${rows.length - 1} pins; images in public/store/pinterest-creative/`);
await vite.close();
if (missingBoards.size) console.warn(`No board set for: ${[...missingBoards].join(", ")}. Add them to creative/publishing.json { "pinterestBoards": { "<slug>": "<board>" } }.`);
