/**
 * Renders the In Order document in all three variants and both page
 * sizes, so every state can be proofed before anyone can produce one.
 *
 *   node scripts/run-tsx.mjs scripts/generate-in-order.ts
 *
 * The document is generated from the same knowledge base and the same
 * readiness function the live product uses, so a proof here is a proof
 * of what a person would actually receive. Nothing about the layout is
 * duplicated for print.
 *
 * Fonts are fetched once into a local cache shared with the Home Survey
 * generator. They are needed only at generation time, never at runtime.
 */
import { Font, renderToFile } from "@react-pdf/renderer";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { InOrderDocument } from "../src/products/personal-life-affairs-companion/printables/document";
import { deriveReadiness, describeReadiness } from "../src/products/personal-life-affairs-companion/completion";
import { relevantSteps, type StepRecord } from "../src/products/personal-life-affairs-companion/sequencer";
import { AFFAIR_STEP_BY_KEY } from "../src/products/personal-life-affairs-companion/affairsKnowledge";

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
    if (!res.ok) throw new Error(`Could not fetch ${name}: ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    console.log(`fetched ${name}`);
  }
}

Font.register({ family: "Newsreader", src: path.resolve(FONTS, "Newsreader.ttf") });
Font.register({ family: "PlexSans", src: path.resolve(FONTS, "IBMPlexSans.ttf") });
Font.registerHyphenationCallback((word: string) => [word]);

const NOW = new Date();
function monthsAgo(n: number): string {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n * 31);
  return d.toISOString();
}

/** A person with a full life, so every gated branch is exercised. */
const PROFILE = {
  hasChildren: true,
  partnered: true,
  hasEmployerRetirement: true,
  ownsHome: true,
  hasLifeInsurance: true,
  hasDependantsWithExtraNeeds: false,
  hasPets: true,
  hasBusiness: false,
};

const steps = relevantSteps(PROFILE);

function record(stepKey: string, over: Partial<StepRecord> = {}): StepRecord {
  return { stepKey, state: "confirmed", confirmedAt: NOW.toISOString(), snoozedUntil: null, ...over };
}

/** Every state a real copy can be in, including the awkward middles. */
const VARIANTS: { name: string; records: StepRecord[] }[] = [
  { name: "blank", records: [] },
  {
    name: "in-progress",
    records: [
      ...steps.slice(0, 6).map((s) => record(s.key)),
      record(steps[6].key, { state: "open", confirmedAt: null }),
      record(steps[7].key, { state: "notRelevant", confirmedAt: null }),
    ],
  },
  {
    name: "verified",
    records: steps.map((s) =>
      // One deliberately stale confirmation, so the proof shows how a
      // copy ages rather than only how it looks on day one.
      record(s.key, {
        confirmedAt:
          s.key === "money.beneficiary-check"
            ? monthsAgo((AFFAIR_STEP_BY_KEY[s.key].confirmEveryMonths ?? 12) + 3)
            : NOW.toISOString(),
      })
    ),
  },
];

for (const variant of VARIANTS) {
  const readiness = deriveReadiness({ profile: PROFILE, records: variant.records }, NOW);
  for (const size of ["LETTER", "A4"] as const) {
    const file = path.join(OUT, `in-order-${variant.name}-${size.toLowerCase()}.pdf`);
    await renderToFile(
      InOrderDocument({
        size,
        preparedBy: "Dana Whitfield",
        readiness,
        summary: describeReadiness(readiness),
        generatedAt: NOW,
      }),
      file
    );
    const bytes = await readFile(file);
    if (size === "LETTER") {
      console.log(`${variant.name.padEnd(12)} ${describeReadiness(readiness)}`);
    }
    console.log(`  ${path.basename(file)}  ${bytes.length.toLocaleString()} bytes`);
  }
}
