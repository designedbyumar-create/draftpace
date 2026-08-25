/**
 * Renders My Trip Book, the standalone blank planner, so every page can
 * be proofed before anybody can buy or generate one.
 *
 *   node scripts/run-tsx.mjs scripts/generate-travel-companion-trip-book.ts
 */
import { Font, renderToFile } from "@react-pdf/renderer";
import { mkdir, readFile, access, writeFile } from "node:fs/promises";
import path from "node:path";
import { TripBookDocument, DEFAULT_MANIFEST } from "../src/products/travel-companion/printables/document";

const OUT = process.env.OUT_DIR ?? "./.workbook";
const FONTS = path.join(OUT, "fonts");
const FONT_SOURCES: Record<string, string> = {
  "Newsreader.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf",
  "IBMPlexSans.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/IBMPlexSans%5Bwdth%2Cwght%5D.ttf",
};

await mkdir(FONTS, { recursive: true });
for (const [name, url] of Object.entries(FONT_SOURCES)) {
  const file = path.join(FONTS, name);
  try {
    await access(file);
  } catch {
    const res = await fetch(url);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
}
Font.register({ family: "Newsreader", src: path.resolve(FONTS, "Newsreader.ttf") });
Font.register({ family: "PlexSans", src: path.resolve(FONTS, "IBMPlexSans.ttf") });
Font.registerHyphenationCallback((word: string) => [word]);

for (const size of ["LETTER", "A4"] as const) {
  const file = path.join(OUT, `trip-book-template-${size.toLowerCase()}.pdf`);
  const manifest = { ...DEFAULT_MANIFEST, size };
  await renderToFile(TripBookDocument({ manifest }), file);
  const bytes = await readFile(file);
  console.log(`${path.basename(file)}  ${bytes.length.toLocaleString()} bytes`);
}

// A small, cheap-to-print sample, so a "just the essentials" version can be proofed too.
const smallManifest = {
  destinations: 1,
  travellers: 1,
  bookings: 2,
  bookingConnections: 1,
  transport: 1,
  accommodation: 1,
  reservations: 1,
  threads: 1,
  dailyOperations: 2,
  changeImpacts: 1,
  incidents: 1,
  tripRecordPages: 1,
  size: "LETTER" as const,
};
const smallFile = path.join(OUT, "trip-book-template-small.pdf");
await renderToFile(TripBookDocument({ manifest: smallManifest }), smallFile);
const smallBytes = await readFile(smallFile);
console.log(`${path.basename(smallFile)}  ${smallBytes.length.toLocaleString()} bytes`);
