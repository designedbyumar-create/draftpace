#!/usr/bin/env node
/**
 * Plans every situation carousel (director/carousel.ts): five per product,
 * each about one moment people search for, taught from the guide that
 * covers it. Writes
 *
 *   shots/carousels/<product>/<moment>.carousel.json   the slides, every word with its source, and why
 *   src/carousels.generated.ts                          every carousel, for Root.tsx
 *
 *   node scripts/carousels.mjs            plan them all
 *   node scripts/carousels.mjs travel     ...and print only those matching "travel"
 */
import path from "node:path";
import { createServer } from "vite";

const filter = process.argv[2];
const vite = await createServer({
  configFile: false, logLevel: "error", appType: "custom",
  server: { middlewareMode: true }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.resolve("../src") } },
});
const { planCarousels } = await vite.ssrLoadModule(path.resolve("director/carousel.ts"));
const { writeCarousels } = await vite.ssrLoadModule(path.resolve("director/write.ts"));
const carousels = planCarousels();
await vite.close();

writeCarousels(carousels);
for (const car of carousels) {
  if (filter && !car.id.includes(filter)) continue;
  const cover = car.slides[0];
  console.log(`${car.id.padEnd(52)} ${String(car.slides.length).padStart(2)} slides  "${cover.quote.text.slice(0, 60)}"`);
}
console.log(`${carousels.length} carousels planned`);
process.exit(0);
