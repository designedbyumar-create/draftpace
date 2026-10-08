/**
 * Plans every brief in slate.json, in order, each knowing the films before
 * it. Returns the films and their treatments; scripts/direct.mjs writes them.
 *
 * Product films come first, then guide-driven films: a guide brief names
 * only the guide and the placement, and the product is the one the guide
 * itself hands over to (guide.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { planVoiceover, type VoiceoverInput } from "./voiceover";
import SLATE from "./slate.json";
import { direct, type Brief } from "./direct";
import { buildDossier, type Dossier } from "./dossier";
import { guideMaterial, productForGuide } from "./guide";
import { treatment } from "./treatment";
import { CREATIVE_DIR } from "./write";
import { SHOP_LISTINGS, productLine } from "../src/shop-listings";
import { PRODUCT_DEFINITIONS, THEMES } from "../src/theme-registry";
import type { Film } from "./film";
import type { PlatformId, Goal } from "./platforms";

export type GuideBrief = { guide: string; platform: PlatformId; goal?: Goal };

function baseDossier(slug: string): Dossier {
  const { price, compareAt } = productLine(slug);
  return buildDossier({ listing: SHOP_LISTINGS[slug], definition: PRODUCT_DEFINITIONS[slug], accent: THEMES[slug].accent, price, compareAt });
}

let background: string[] | undefined;
/** Every product's words and screens: what counts as a common word when matching a line to a screen. */
function backgroundWords(): string[] {
  return (background ??= Object.keys(SHOP_LISTINGS).flatMap((slug) => {
    const d = baseDossier(slug);
    return [...d.copy.map((u) => u.text), ...d.screens.map((s) => [s.heading, s.shows, ...s.regions.map((r) => r.label)].join(" "))];
  }));
}

export function dossierFor(slug: string, guide?: string): Dossier {
  const d = baseDossier(slug);
  if (!guide) return d;
  const g = guideMaterial(guide);
  return { ...d, guide: g, copy: [...d.copy, ...g.copy], background: backgroundWords() };
}

/** A voice-over's dossier: like a guide film's, it matches words to screens against every product's vocabulary. */
export function voiceoverDossier(slug: string, guide?: string): Dossier {
  return { ...dossierFor(slug, guide), background: backgroundWords() };
}

/** A guide brief, resolved to the product the guide hands over to. */
export function guideBrief(b: GuideBrief): Brief {
  return { product: productForGuide(b.guide).product, platform: b.platform, goal: b.goal ?? "awareness", guide: b.guide };
}

export function runSlate(
  briefs: Brief[] = SLATE.briefs as Brief[],
  guides: GuideBrief[] = (SLATE as { guides?: GuideBrief[] }).guides ?? [],
): { film: Film; doc: string }[] {
  const out: { film: Film; doc: string }[] = [];
  for (const b of [...briefs, ...guides.map(guideBrief)]) {
    const film = direct(b, dossierFor(b.product, b.guide), out.map((x) => x.film));
    out.push({ film, doc: treatment(film) });
  }
  return out;
}

// ------------------------------------------------------------------ voice-overs


export const VOICEOVER_DIR = path.join(CREATIVE_DIR, "voiceover") + path.sep;

/** Every voice-over's saved settings (voiceover/<id>/voiceover.json), in name order. */
export function voiceoverInputs(): VoiceoverInput[] {
  if (!fs.existsSync(VOICEOVER_DIR)) return [];
  return fs.readdirSync(VOICEOVER_DIR).sort()
    .map((id) => `${VOICEOVER_DIR}${id}/voiceover.json`)
    .filter((f) => fs.existsSync(f))
    .map((f) => JSON.parse(fs.readFileSync(f, "utf8")) as VoiceoverInput);
}

export function runVoiceovers(inputs: VoiceoverInput[] = voiceoverInputs()): { film: Film; doc: string; input: VoiceoverInput }[] {
  return inputs.map((v) => {
    const film = planVoiceover(v, voiceoverDossier(v.product, v.guide));
    return { film, doc: treatment(film), input: v };
  });
}
