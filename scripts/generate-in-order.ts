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
import { type AffairStep } from "../src/products/personal-life-affairs-companion/affairsKnowledge";
import { buildDraft, captureFor } from "../src/products/personal-life-affairs-companion/capture";
import { computeNextReview, type AffairItem } from "../src/products/personal-life-affairs-companion/lifeAffairs";

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
  return {
    stepKey,
    state: "confirmed",
    confirmedAt: NOW.toISOString(),
    snoozedUntil: null,
    legacyConfirmation: false,
    ...over,
  };
}

/**
 * Plausible answers, so a proof shows a document somebody would actually
 * receive rather than a grid of the word "Confirmed".
 *
 * Built by running the real capture specs, which means the proof cannot
 * show a field the app would never ask for, and a new prompt added to a
 * spec appears here without anybody remembering to add it.
 */
const NAMES = ["Jane Whitfield", "Tom Okafor", "Priya Raman", "Alan Whitfield", "Marta Silva", "Dev Chaudhry"];
const RELATIONS = ["Partner", "Brother", "Oldest friend", "Sister", "Neighbour", "Cousin"];
let nameIndex = 0;

const NAME_SHAPED = new Set([
  "personName",
  "relationship",
  "personContact",
  "copyHeldBy",
  "openableBy",
  "namedToReceive",
  "shouldGoTo",
  "writtenFor",
  "otherCarers",
]);

function answerFor(field: string, prompt: { choices?: string[]; placeholder?: string }): string {
  if (prompt.choices) return prompt.choices[0];
  if (prompt.placeholder && !NAME_SHAPED.has(field)) return prompt.placeholder;
  switch (field) {
    case "personName":
    case "copyHeldBy":
    case "openableBy":
    case "namedToReceive":
    case "shouldGoTo":
    case "writtenFor":
    case "otherCarers":
      nameIndex += 1;
      return NAMES[nameIndex % NAMES.length];
    case "relationship":
      return RELATIONS[nameIndex % RELATIONS.length];
    case "personContact":
      return "07700 900123";
    case "whereabouts":
      return "Study, second drawer of the grey filing cabinet";
    case "notes":
      return "She has a key and knows the folder is the first place to look.";
    case "provider":
      return "Aviva";
    case "label":
      return "Recorded";
    default:
      return "Noted";
  }
}

let itemIndex = 0;

function itemFor(step: AffairStep, at: Date): AffairItem | null {
  const spec = captureFor(step.key);
  if (!spec) return null;
  const answers: Record<string, string> = {};
  // Two passes, so a prompt gated on an earlier answer still gets one.
  for (let pass = 0; pass < 2; pass += 1) {
    for (const prompt of spec.prompts) {
      if (prompt.askIf) {
        const value = answers[prompt.askIf.field];
        if (!value) continue;
        if (prompt.askIf.equals && !prompt.askIf.equals.includes(value)) continue;
      }
      if (answers[prompt.field]) continue;
      answers[prompt.field] = answerFor(prompt.field, prompt);
    }
  }
  const draft = buildDraft(spec, step.key, step.area, answers);
  itemIndex += 1;
  const iso = at.toISOString();
  return {
    id: `proof-${itemIndex}`,
    kind: draft.kind,
    area: draft.area,
    originStepKey: draft.originStepKey,
    label: draft.label,
    whereabouts: draft.whereabouts,
    personName: draft.personName,
    personContact: draft.personContact,
    notes: draft.notes,
    fields: draft.fields,
    status: draft.status,
    establishedAt: iso,
    lastConfirmedAt: iso,
    reviewIntervalMonths: step.confirmEveryMonths ?? null,
    nextReviewAt: computeNextReview(step.confirmEveryMonths ?? null, at),
  };
}

function itemsFor(list: AffairStep[], at: Date): AffairItem[] {
  return list.map((step) => itemFor(step, at)).filter((i): i is AffairItem => i !== null);
}

const establishSteps = steps.filter((s) => s.kind === "establish");
const actionSteps = steps.filter((s) => s.kind === "action");

/** One record deliberately old, so the proof shows how a copy ages. */
const stale = new Date(monthsAgo(40));

/** Every state a real copy can be in, including the awkward middles. */
const VARIANTS: { name: string; records: StepRecord[]; items: AffairItem[] }[] = [
  { name: "blank", records: [], items: [] },
  {
    name: "in-progress",
    records: [
      record(actionSteps[0].key),
      record(establishSteps[6].key, { state: "open", confirmedAt: null }),
      record(establishSteps[7].key, { state: "notRelevant", confirmedAt: null }),
      record(actionSteps[1].key, { state: "unsure", confirmedAt: null }),
      // An old confirmation from before answers were captured, which is
      // the one state the migration had to be able to print honestly.
      record(establishSteps[8].key, { legacyConfirmation: true }),
    ],
    items: itemsFor(establishSteps.slice(0, 6), NOW),
  },
  {
    name: "verified",
    records: actionSteps.map((s) => record(s.key)),
    items: [
      ...itemsFor(
        establishSteps.filter((s) => s.key !== "money.pensions"),
        NOW
      ),
      ...itemsFor(
        establishSteps.filter((s) => s.key === "money.pensions"),
        stale
      ),
    ],
  },
];

for (const variant of VARIANTS) {
  const readiness = deriveReadiness({ profile: PROFILE, records: variant.records, items: variant.items }, NOW);
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
