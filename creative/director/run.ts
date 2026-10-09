/**
 * Plans every brief in slate.json, in order, each knowing the films before
 * it. Returns the films and their treatments; scripts/direct.mjs writes them.
 *
 * Before launch (slate.json "stage": "prelaunch") the slate is situation
 * films (every real moment in every listing, situationBriefs) and a guide
 * Short for every guide (allGuideBriefs). The hand-written product briefs
 * are for later, when there are users to sell to ("stage": "growth").
 */
import fs from "node:fs";
import path from "node:path";
import { planVoiceover, type VoiceoverInput } from "./voiceover";
import SLATE from "./slate.json";
import { direct, relevance, type Brief } from "./direct";
import { GUIDES } from "@/content/guides";
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
  const d = { ...baseDossier(slug), background: backgroundWords() };
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
  return { product: productForGuide(b.guide).product, platform: b.platform, goal: b.goal ?? "awareness", guide: b.guide, stage: STAGE };
}

// ------------------------------------------------------------------ situations

type Stage = "prelaunch" | "growth";
const STAGE: Stage = ((SLATE as { stage?: Stage }).stage ?? "prelaunch");

/** Placements in turn, so a product's moments spread across them. Searched phrases suit search-led places; felt moments suit Reels. */
const SEARCHED_ROTATION: PlatformId[] = ["pinterest-video", "youtube-short", "tiktok", "instagram-feed", "pinterest-video", "instagram-reel", "youtube-short", "facebook-feed"];
const MOMENT_ROTATION: PlatformId[] = ["instagram-reel", "facebook-reel", "tiktok", "instagram-feed", "facebook-feed", "youtube-short", "pinterest-video", "instagram-reel", "tiktok"];

const usableGuide = (slug: string | undefined) => !!slug && GUIDES.some((g) => g.slug === slug && g.locale !== "uk");

/**
 * Every real moment in every product's listing, each as one film: the
 * searched phrases (in people's own words, most linked by the listing to
 * the guide that helps) and the problems the listing says it solves (matched
 * to the closest guide that hands over to this product, when one is close).
 * A new line in a listing is a new film; nothing here is written by hand.
 */
export function situationBriefs(stage: Stage = STAGE): Brief[] {
  const out: Brief[] = [];
  Object.keys(SHOP_LISTINGS).forEach((product, pi) => {
    const L = SHOP_LISTINGS[product];
    const d = dossierFor(product);
    const rel = relevance(d);
    const ownGuides = GUIDES.filter((g) => g.locale !== "uk" && (() => { try { return productForGuide(g.slug).product === product; } catch { return false; } })())
      .map((g) => ({ slug: g.slug, topic: guideMaterial(g.slug).topic }));
    const taken = new Set<string>();
    (L.searchedProblems ?? []).forEach((sp, i) => {
      const guide = usableGuide(sp.guideSlug) ? sp.guideSlug : undefined;
      if (guide) taken.add(guide);
      out.push({ product, situation: `searchedProblems[${i}].phrase`, platform: SEARCHED_ROTATION[(i + pi) % SEARCHED_ROTATION.length], goal: "awareness", stage, ...(guide ? { guide } : {}) });
    });
    (L.problemsSolved ?? []).forEach((ps, i) => {
      const best = ownGuides
        .map((g) => ({ g, score: rel(`${ps.problem} ${ps.solution}`, g.topic) }))
        .sort((a, b) => Number(taken.has(a.g.slug)) - Number(taken.has(b.g.slug)) || b.score - a.score)[0];
      const guide = best && best.score >= 0.2 ? best.g.slug : undefined;
      if (guide) taken.add(guide);
      out.push({ product, situation: `problemsSolved[${i}].problem`, platform: MOMENT_ROTATION[(i + pi) % MOMENT_ROTATION.length], goal: "awareness", stage, ...(guide ? { guide } : {}) });
    });
  });
  return out;
}

/**
 * A guide Short for every guide that hands over to a product, except the
 * guides a situation film already teaches from (one film per topic). The
 * slate's own guide briefs keep their placement; the rest take turns on
 * YouTube and Pinterest, the two places people search.
 */
export function allGuideBriefs(listed: GuideBrief[], situations: Brief[]): GuideBrief[] {
  const covered = new Set(situations.map((b) => b.guide).filter(Boolean));
  const chosen = new Map(listed.map((g) => [g.guide, g]));
  const rest = GUIDES.filter((g) => g.locale !== "uk" && !chosen.has(g.slug) && !covered.has(g.slug) && (() => { try { productForGuide(g.slug); return true; } catch { return false; } })());
  return [...listed.filter((g) => !covered.has(g.guide)), ...rest.map((g, i) => ({ guide: g.slug, platform: (i % 2 ? "pinterest-video" : "youtube-short") as PlatformId }))];
}

/** Films made in Studio (or by hand) are planned in every stage; the slate's own product briefs only once Draftpace is selling. */
const MADE: Brief[] = ((SLATE as { made?: Brief[] }).made ?? []).map((b) => ({ ...b, stage: STAGE }));

export function runSlate(
  briefs: Brief[] = [...(STAGE === "prelaunch" ? [] : (SLATE.briefs as Brief[])), ...MADE],
  guides?: GuideBrief[],
  situations: Brief[] = situationBriefs(),
): { film: Film; doc: string }[] {
  const listedGuides = guides ?? (SLATE as { guides?: GuideBrief[] }).guides ?? [];
  const allGuides = guides ? listedGuides : allGuideBriefs(listedGuides, situations);
  const out: { film: Film; doc: string }[] = [];
  skippedGuides.length = 0;
  for (const b of [...briefs, ...situations]) {
    const film = direct(b, dossierFor(b.product, b.guide), out.map((x) => x.film));
    out.push({ film, doc: treatment(film) });
  }
  // A guide Short needs a list, a timeline or a short answer to teach from. A guide with none is skipped and reported, never
  // allowed to stop the slate: the next guide written for the site should never break every film.
  for (const g of allGuides) {
    const b = guideBrief(g);
    try {
      const film = direct(b, dossierFor(b.product, b.guide), out.map((x) => x.film));
      out.push({ film, doc: treatment(film) });
    } catch (e) {
      if (!guides && /no structure/.test((e as Error).message)) skippedGuides.push(g.guide);
      else throw e;
    }
  }
  return out;
}

/** Guides the last runSlate() could not make a Short from (nothing short enough to teach from), for scripts/direct.mjs to report. */
export const skippedGuides: string[] = [];

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
