/**
 * Renders The Home Survey to PDF in both page sizes.
 *
 *   node scripts/run-tsx.mjs scripts/generate-home-survey.ts
 *
 * The document imports homeKnowledge.ts directly, so the care schedule and
 * the seasonal calendar in the book are generated from exactly what the
 * live product knows. Regenerate whenever the knowledge layer changes and
 * the book cannot drift from the app.
 *
 * Fonts are fetched once into a local cache. They are needed only at
 * generation time, never at runtime, so they are not a dependency of the
 * app itself.
 */
import { Font, renderToFile } from "@react-pdf/renderer";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { HomeSurveyWorkbook } from "../src/products/home-management-companion/printables/workbook";

const OUT = process.env.OUT_DIR ?? "./.workbook";
const FONTS = path.join(OUT, "fonts");

const FONT_SOURCES: Record<string, string> = {
  "Newsreader.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf",
  "IBMPlexSans.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/IBMPlexSans%5Bwdth%2Cwght%5D.ttf",
};

/**
 * A placeholder on purpose, never a real-looking fabricated code.
 * generate_redeemable_codes() has to run against the live database to mint
 * one, so the real value is passed in per Etsy print run and the book
 * regenerated. Same discipline the PFC activation page follows.
 */
const CODE = process.env.ACTIVATION_CODE ?? "XXXX-XXXX";

await mkdir(FONTS, { recursive: true });
for (const [name, url] of Object.entries(FONT_SOURCES)) {
  const file = path.join(FONTS, name);
  try {
    await access(file);
  } catch {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not fetch ${name}: ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`fetched ${name}`);
  }
}

Font.register({ family: "Newsreader", src: path.resolve(FONTS, "Newsreader.ttf") });
Font.register({ family: "PlexSans", src: path.resolve(FONTS, "IBMPlexSans.ttf") });
Font.registerHyphenationCallback((word: string) => [word]);

const PRINTABLES = "src/products/home-management-companion/printables";

const targets: { size: "LETTER" | "A4"; file: string; module: string; constant: string }[] = [
  {
    size: "LETTER",
    file: "home-survey-letter.pdf",
    module: "homeSurveyLetter.base64.ts",
    constant: "HOME_SURVEY_LETTER_BASE64",
  },
  { size: "A4", file: "home-survey-a4.pdf", module: "homeSurveyA4.base64.ts", constant: "HOME_SURVEY_A4_BASE64" },
];

/**
 * The base64 module the server actually ships, written in the same shape
 * Personal Finance Companion's own printable uses: embedded rather than a
 * public/ file or a request-time fs read, so the exact bytes travel with
 * the server bundle whatever Vercel's file tracing decides to do with
 * loose binaries.
 */
function base64Module(constant: string, base64: string): string {
  return `/**
 * Generated. Do not hand-edit.
 *
 *   node scripts/run-tsx.mjs scripts/generate-home-survey.ts
 *
 * Base64-embedded rather than a public/ static file or a request-time fs
 * read, so the exact bytes are guaranteed to ship with the server bundle
 * regardless of file-tracing behavior for arbitrary binaries. Only ever
 * imported by printables/assetBytes.ts, which only the download route
 * imports, so this payload never reaches catalog.ts and never enters a
 * client bundle.
 */
export const ${constant} =
  "${base64}";
`;
}

for (const { size, file, module, constant } of targets) {
  const target = path.join(OUT, file);
  // Called directly rather than through createElement: renderToFile wants
  // an element whose props are DocumentProps, which is what the workbook
  // returns, not an element of the workbook component itself.
  await renderToFile(HomeSurveyWorkbook({ size, code: CODE }), target);
  const bytes = await readFile(target);
  await writeFile(path.join(PRINTABLES, module), base64Module(constant, bytes.toString("base64")));
  console.log(`${file}  ${bytes.length.toLocaleString()} bytes  ->  ${module}`);
}
