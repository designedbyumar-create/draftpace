/**
 * Renders one product's Etsy-edition printable: its flagship book, plus
 * an extra "Activate your digital [Product]" page with a real code on
 * it. Output only ever lands in a local, untracked directory for manual
 * upload to an Etsy listing; nothing this script produces is committed
 * or shipped in the server bundle, so a real code can never leak into
 * the app the way it would if it were baked into a base64 asset that
 * also ships to paying customers downloading their own free copy.
 *
 *   ACTIVATION_CODE=AB3D-EFG7 node scripts/run-tsx.mjs scripts/generate-etsy-pdf.ts travel-companion
 *
 * Run once per Etsy print run, with that batch's freshly-minted code
 * (see generate_redeemable_codes in supabase/migrations/202608190006_
 * redeemable_codes.sql). Without ACTIVATION_CODE set, renders the
 * obvious placeholder XXXX-XXXX rather than a real-looking fabricated
 * code, the same discipline generate-home-survey.ts already follows.
 *
 * Each product's flagship document is imported directly, so the book
 * cannot drift from what the live product actually knows; adding a
 * product here is one new case in PRODUCTS below, nothing else.
 */
import { Font, renderToFile, type DocumentProps } from "@react-pdf/renderer";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { TripBookDocument, DEFAULT_MANIFEST as TRAVEL_MANIFEST } from "../src/products/travel-companion/printables/document";
import type { Size as TravelSize } from "../src/products/travel-companion/printables/document";
import { HomeschoolHandbook } from "../src/products/homeschooling-companion/printables/handbook";
import { InOrderDocument } from "../src/products/personal-life-affairs-companion/printables/document";
import { deriveReadiness } from "../src/products/personal-life-affairs-companion/completion";
import { GloveBoxBookDocument, DEFAULT_MANIFEST as VMC_MANIFEST } from "../src/products/vehicle-maintenance-companion/printables/document";
import type { Size as VmcSize } from "../src/products/vehicle-maintenance-companion/printables/document";
import { FamilyHealthBinderDocument, DEFAULT_MANIFEST as FHB_MANIFEST } from "../src/products/family-health-binder/printables/document";
import type { Size as FhbSize } from "../src/products/family-health-binder/printables/document";
import { MoneyBookDocument, DEFAULT_MANIFEST as PFC_MANIFEST } from "../src/products/personal-finance-companion/printables/moneyBook";
import type { Size as PfcSize } from "../src/products/personal-finance-companion/printables/moneyBook";
import { AlongsideBookDocument, DEFAULT_MANIFEST as ALONGSIDE_MANIFEST } from "../src/products/alongside/printables/document";
import type { Size as AlongsideSize } from "../src/products/alongside/printables/document";

const OUT = process.env.OUT_DIR ?? "./.etsy-pdfs";
const FONTS = path.join(OUT, "fonts");

const FONT_SOURCES: Record<string, string> = {
  "Newsreader.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf",
  "IBMPlexSans.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexsans/IBMPlexSans%5Bwdth%2Cwght%5D.ttf",
};

/**
 * A placeholder on purpose, never a real-looking fabricated code.
 * generate_redeemable_codes() has to run against the live database to
 * mint one; the real value is passed in per print run, never hardcoded.
 */
const CODE = process.env.ACTIVATION_CODE ?? "XXXX-XXXX";

type Renderer = (size: "LETTER" | "A4", code: string) => React.ReactElement<DocumentProps>;

/** One entry per sellable product. Each renderer must thread `code` through to that document's own ActivatePage. */
const PRODUCTS: Record<string, { title: string; render: Renderer }> = {
  "travel-companion": {
    title: "My Trip Book",
    render: (size, code) => TripBookDocument({ manifest: { ...TRAVEL_MANIFEST, size: size as TravelSize }, code }),
  },
  "homeschooling-companion": {
    title: "The Homeschool Year",
    render: (size, code) => HomeschoolHandbook({ size, code }),
  },
  "personal-life-affairs-companion": {
    title: "My Affairs",
    render: (size, code) =>
      InOrderDocument({
        size,
        preparedBy: "",
        readiness: deriveReadiness({ profile: {}, records: [], items: [] }, new Date()),
        generatedAt: new Date(),
        code,
      }),
  },
  "vehicle-maintenance-companion": {
    title: "The Glove Box Book",
    render: (size, code) => GloveBoxBookDocument({ manifest: { ...VMC_MANIFEST, size: size as VmcSize }, code }),
  },
  "family-health-binder": {
    title: "The Family Health Binder",
    render: (size, code) => FamilyHealthBinderDocument({ manifest: { ...FHB_MANIFEST, size: size as FhbSize }, code }),
  },
  "personal-finance-companion": {
    title: "The Money Book",
    render: (size, code) => MoneyBookDocument({ manifest: { ...PFC_MANIFEST, size: size as PfcSize }, code }),
  },
  "alongside": {
    title: "The Alongside Book",
    render: (size, code) => AlongsideBookDocument({ manifest: { ...ALONGSIDE_MANIFEST, size: size as AlongsideSize }, code }),
  },
};

// argv[2] is the entry file path itself (run-tsx.mjs's own arg), so the
// product slug is argv[3], the first argument after it.
const slug = process.argv[3];
if (!slug) {
  console.error(`Usage: ACTIVATION_CODE=AB3D-EFG7 node scripts/run-tsx.mjs scripts/generate-etsy-pdf.ts <product-slug>`);
  console.error(`Known products: ${Object.keys(PRODUCTS).join(", ")}`);
  process.exit(1);
}
const product = PRODUCTS[slug];
if (!product) {
  console.error(`Unknown product "${slug}". Known products: ${Object.keys(PRODUCTS).join(", ")}`);
  process.exit(1);
}

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

await mkdir(OUT, { recursive: true });

for (const size of ["LETTER", "A4"] as const) {
  const file = path.join(OUT, `${slug}-${size.toLowerCase()}.pdf`);
  await renderToFile(product.render(size, CODE), file);
  console.log(`${product.title} (${size}) -> ${file}`);
}
