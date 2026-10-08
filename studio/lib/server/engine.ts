/**
 * Studio's bridge to the Creative Engine. Server-only: it reads and writes
 * the engine's files (creative/shots, creative/director/slate.json,
 * creative/voiceover) and runs the director in-process.
 *
 * Library reads come from the committed films in shots/, not from
 * re-planning, so what Studio shows is exactly what the engine will render.
 */
import fs from "node:fs";
import path from "node:path";
import { runSlate, voiceoverInputs, dossierFor, voiceoverDossier, guideBrief, runVoiceovers } from "@engine/director/run";
import { direct, type Brief } from "@engine/director/direct";
import { planVoiceover, type VoiceoverInput } from "@engine/director/voiceover";
import { productForGuide, guideMaterial } from "@engine/director/guide";
import { treatment } from "@engine/director/treatment";
import { writeDirected, writeVoiceovers, CREATIVE_DIR } from "@engine/director/write";
import { PLATFORMS, type PlatformId, type Goal } from "@engine/director/platforms";
import type { Film } from "@engine/director/film";
import { filmPath } from "@engine/director/film";
import { SHOP_LISTINGS, productLine } from "@engine/src/shop-listings";
import { THEMES } from "@engine/src/theme-registry";
import { GUIDES } from "@/content/guides";
import { LIFE_AREAS } from "@/content/areas";
import SLATE_FILE from "@engine/director/slate.json";

export type FilmKind = "product" | "guide" | "voiceover";
export type RenderedFile = { bytes: number; at: string };
export type FilmEntry = { film: Film; kind: FilmKind; rendered: RenderedFile | null };

export const kindOf = (f: Film): FilmKind => (f.voiceover ? "voiceover" : f.guide ? "guide" : "product");

const SHOTS = path.join(CREATIVE_DIR, "shots");
const OUT_FILMS = path.join(CREATIVE_DIR, "out", "films");
const SLATE_PATH = path.join(CREATIVE_DIR, "director", "slate.json");

function filmFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".film.json")) out.push(p);
    }
  };
  walk(SHOTS);
  return out.sort();
}

export function renderedFile(id: string): RenderedFile | null {
  const p = path.join(OUT_FILMS, `${id}.mp4`);
  if (!fs.existsSync(p)) return null;
  const s = fs.statSync(p);
  return { bytes: s.size, at: s.mtime.toISOString() };
}

export function videoPath(id: string): string | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  const p = path.join(OUT_FILMS, `${id}.mp4`);
  return fs.existsSync(p) ? p : null;
}

/** Every committed film, product films first (slate order), then guide films, then voice-overs. */
export function listFilms(): FilmEntry[] {
  const films = filmFiles().map((f) => JSON.parse(fs.readFileSync(f, "utf8")) as Film);
  const order = (f: Film) => ({ product: 0, guide: 1, voiceover: 2 })[kindOf(f)];
  return films
    .sort((a, b) => order(a) - order(b) || a.id.localeCompare(b.id))
    .map((film) => ({ film, kind: kindOf(film), rendered: renderedFile(film.id) }));
}

export function getFilm(id: string): (FilmEntry & { doc: string }) | null {
  const entry = listFilms().find((e) => e.film.id === id);
  if (!entry) return null;
  const md = path.join(SHOTS, `${filmPath(entry.film)}.md`);
  return { ...entry, doc: fs.existsSync(md) ? fs.readFileSync(md, "utf8") : "" };
}

// ------------------------------------------------------------------ sources

export type ProductSource = {
  slug: string; name: string; price: string; compareAt: string | null; free: boolean;
  accent: string; tagline: string; screens: number; motif: string;
};

export function listProducts(): ProductSource[] {
  return Object.keys(SHOP_LISTINGS).map((slug) => {
    const d = dossierFor(slug);
    const line = productLine(slug);
    return {
      slug, name: line.name, price: line.price, compareAt: line.compareAt, free: d.free,
      accent: THEMES[slug].accent, tagline: SHOP_LISTINGS[slug].promise?.split(/(?<=\.)\s/)[0] ?? "",
      screens: d.screens.length, motif: d.motif,
    };
  });
}

export type GuideSource = { slug: string; title: string; dek: string; area: string; areaLabel: string; product: string | null; query: string | null; startHere: boolean; locale: string | null };

export function listGuides(): GuideSource[] {
  const start = new Set(LIFE_AREAS.flatMap((a) => a.startHere));
  return GUIDES.map((g) => {
    const area = LIFE_AREAS.find((a) => a.slug === g.areaSlug);
    let product: string | null = null;
    try { product = area ? productForGuide(g.slug).product : null; } catch { product = null; }
    return {
      slug: g.slug, title: g.title, dek: g.dek, area: area?.slug ?? (g.areaSlug ?? "none"), areaLabel: area?.label ?? (g.areaSlug === "series" ? "Whole series" : "No area"),
      product, query: g.primaryQuery ?? null, startHere: start.has(g.slug), locale: g.locale ?? null,
    };
  });
}

export function areas() {
  return LIFE_AREAS.map((a) => ({ slug: a.slug, label: a.label, products: a.productSlugs }));
}

export function platforms() {
  return Object.values(PLATFORMS).map((p) => ({ id: p.id, label: p.label, width: p.width, height: p.height, duration: p.duration, soundOn: p.soundOn, hookBy: p.hookBy, close: p.close, notes: p.notes }));
}

/** What a guide film could teach from: shown in Make so the choice is informed. */
export function guidePreview(slug: string) {
  const g = guideMaterial(slug);
  return {
    title: g.title, url: g.url,
    blocks: g.blocks.map((b) => ({ kind: b.kind, heading: b.heading?.text ?? null, items: b.items.length })),
    faq: g.faq.length,
    product: productForGuide(slug),
  };
}

// ------------------------------------------------------------------ planning

type SlateFile = { $comment?: string; briefs: Brief[]; guides?: { guide: string; platform: PlatformId; goal?: Goal }[] };
const readSlate = (): SlateFile => JSON.parse(fs.readFileSync(SLATE_PATH, "utf8"));

export type PlanRequest =
  | { kind: "product"; product: string; platform: PlatformId; goal: Goal }
  | { kind: "guide"; guide: string; platform: PlatformId };

function briefOf(req: PlanRequest): Brief {
  return req.kind === "product" ? { product: req.product, platform: req.platform, goal: req.goal } : guideBrief({ guide: req.guide, platform: req.platform });
}

const idOf = (b: Brief) => (b.guide ? `guide-${b.guide}--${b.platform}` : `${b.product}--${b.platform}--${b.goal}`);

/**
 * Plan a film without saving it: the director runs with the whole slate as
 * context, so it avoids repeating what the slate already does, exactly as
 * if the brief were appended to slate.json.
 */
export function planFilm(req: PlanRequest): { film: Film; doc: string; exists: boolean } {
  const brief = briefOf(req);
  const id = idOf(brief);
  const planned = runSlate();
  const existing = planned.find((x) => x.film.id === id);
  if (existing) return { ...existing, exists: true };
  const film = direct(brief, dossierFor(brief.product, brief.guide), planned.map((x) => x.film));
  return { film, doc: treatment(film), exists: false };
}

/** Append the brief to slate.json and re-write every film, as `node scripts/direct.mjs` does. */
export function saveBrief(req: PlanRequest): string {
  const slate = readSlate();
  const brief = briefOf(req);
  const id = idOf(brief);
  if (req.kind === "product") {
    if (!slate.briefs.some((b) => idOf(b) === id)) slate.briefs.push({ product: req.product, platform: req.platform, goal: req.goal });
  } else {
    slate.guides = slate.guides ?? [];
    if (!slate.guides.some((g) => g.guide === req.guide && g.platform === req.platform)) slate.guides.push({ guide: req.guide, platform: req.platform });
  }
  fs.writeFileSync(SLATE_PATH, JSON.stringify(slate, null, 2) + "\n");
  writeDirected(runSlate(slate.briefs, slate.guides ?? []));
  return id;
}

// ------------------------------------------------------------------ voice-over

export type VoiceoverDraft = Omit<VoiceoverInput, "audio"> & { audio?: VoiceoverInput["audio"] };

export function planVoiceoverDraft(v: VoiceoverDraft): { film: Film; doc: string } {
  const film = planVoiceover(v as VoiceoverInput, voiceoverDossier(v.product, v.guide));
  return { film, doc: treatment(film) };
}

export function listVoiceovers(): VoiceoverInput[] {
  return voiceoverInputs();
}

/** Save a voice-over's script and settings to creative/voiceover/<id>/ and re-plan every voice-over, as scripts/voiceover.mjs does. */
export function saveVoiceover(v: VoiceoverDraft, files: { srt?: string; audio?: { name: string; data: Buffer; seconds: number } } = {}): string {
  if (!/^[a-z0-9-]+$/.test(v.id)) throw new Error("Use lowercase letters, numbers and dashes for the name.");
  const dir = path.join(CREATIVE_DIR, "voiceover", v.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "script.txt"), v.lines.join("\n") + "\n");
  if (files.srt) fs.writeFileSync(path.join(dir, "captions.srt"), files.srt);
  let input: VoiceoverInput = { ...v } as VoiceoverInput;
  if (files.audio) {
    const ext = path.extname(files.audio.name).toLowerCase();
    for (const f of fs.readdirSync(dir)) if (/^voice\./.test(f)) fs.rmSync(path.join(dir, f));
    fs.writeFileSync(path.join(dir, `voice${ext}`), files.audio.data);
    fs.mkdirSync(path.join(CREATIVE_DIR, "public", "voiceover"), { recursive: true });
    fs.writeFileSync(path.join(CREATIVE_DIR, "public", "voiceover", `${v.id}${ext}`), files.audio.data);
    input = { ...input, audio: { src: `voiceover/${v.id}${ext}`, seconds: files.audio.seconds } };
    delete input.seconds;
  }
  fs.writeFileSync(path.join(dir, "voiceover.json"), JSON.stringify(input, null, 2) + "\n");
  writeVoiceovers(runVoiceovers());
  return planVoiceover(input, voiceoverDossier(input.product, input.guide)).id;
}

export function deleteVoiceover(id: string) {
  if (!/^[a-z0-9-]+$/.test(id)) return;
  fs.rmSync(path.join(CREATIVE_DIR, "voiceover", id), { recursive: true, force: true });
  writeVoiceovers(runVoiceovers());
}

export { SLATE_FILE, CREATIVE_DIR, PLATFORMS };
