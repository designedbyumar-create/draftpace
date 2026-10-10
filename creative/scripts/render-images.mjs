#!/usr/bin/env node
/**
 * Renders every registered <Still> (every slide x aspect ratio) to
 * out/images/. Same bundling approach as render-direct.mjs, same reasons:
 * the `remotion render` CLI stalled unpredictably in this environment, the
 * direct @remotion/renderer API didn't.
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { mkdir } from "node:fs/promises";
import { webpackOverride } from "../webpack-override.mjs";
import { browserExecutable } from "./browser.mjs";

const OUT_DIR = path.resolve(process.cwd(), "out/images");

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  log("bundling...");
  const bundled = await bundle({ entryPoint: path.resolve(process.cwd(), "src/index.ts"), webpackOverride });
  log(`bundled: ${bundled}`);

  // Discover every Image-* composition id registered in Root.tsx by asking
  // Remotion for the full list, rather than re-deriving the slide x ratio
  // product here (one source of truth: Root.tsx).
  const { getCompositions } = await import("@remotion/renderer");
  const all = await getCompositions(bundled, { browserExecutable });
  // Optional args narrow the set: each is a substring an id must contain
  // (e.g. `travel-companion`, or `01-alongside-pinterest`). None = everything.
  // `--ratio pinterest` keeps one aspect ratio (see aspect-ratios.mjs).
  const args = process.argv.slice(2);
  const ratioAt = args.indexOf("--ratio");
  const ratio = ratioAt >= 0 ? args.splice(ratioAt, 2)[1] : null;
  const filters = args;
  const stills = all
    .filter((c) => c.id.startsWith("Image-") || c.id.startsWith("Post-") || c.id.startsWith("Carousel-"))
    .filter((c) => !ratio || c.id.endsWith(`-${ratio}`))
    .filter((c) => filters.length === 0 || filters.some((f) => c.id.includes(f)));
  if (stills.length === 0) throw new Error(`no stills match ${filters.join(", ")}`);
  log(`found ${stills.length} stills to render`);

  for (const composition of stills) {
    const outPath = path.join(OUT_DIR, `${composition.id}.png`);
    await renderStill({ browserExecutable, composition, serveUrl: bundled, output: outPath });
    log(`  rendered ${composition.id} (${composition.width}x${composition.height})`);
  }
  log(`done: ${stills.length} images in ${OUT_DIR}`);
}

// Exit explicitly: a pending per-phase timeout timer would otherwise keep
// the process alive for its full length after the work is done.
main().then(() => process.exit(0)).catch((err) => {
  console.error(`[${new Date().toISOString()}] FAILED:`, err);
  process.exit(1);
});
