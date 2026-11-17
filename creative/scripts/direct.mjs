#!/usr/bin/env node
/**
 * Runs the director over director/slate.json: for every brief, analyses
 * the placement and product, plans a unique film and writes
 *
 *   shots/<product>/films/<platform>--<goal>.film.json   the frame-exact script the Film composition renders
 *   shots/<product>/films/<platform>--<goal>.md          the treatment: analysis, decisions and the script, for review
 *   shots/guides/<guide>/<platform>.film.json / .md      the same, for a guide-driven film
 *   src/films.generated.ts                                every film, for Root.tsx
 *
 *   node scripts/direct.mjs            plan the whole slate
 *   node scripts/direct.mjs travel     ...and print only briefs matching "travel"
 */
import path from "node:path";
import { createServer } from "vite";

const filter = process.argv[2];
const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom",
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.resolve("../src") } },
});
const { runSlate, skippedGuides } = await vite.ssrLoadModule(path.resolve("director/run.ts"));
const { writeDirected } = await vite.ssrLoadModule(path.resolve("director/write.ts"));
const results = runSlate();
await vite.close();

writeDirected(results);
for (const { film } of results) {
  if (!filter || film.id.includes(filter)) console.log(`${film.id.padEnd(60)} ${film.structure.padEnd(12)} ${(film.durationInFrames / 30).toFixed(1)}s  "${film.angle.text.slice(0, 60)}"`);
}
console.log(`${results.length} films planned`);
if (skippedGuides.length) console.log(`No Short for ${skippedGuides.length} guide(s), nothing short enough to teach from: ${skippedGuides.join(", ")}`);
process.exit(0);
