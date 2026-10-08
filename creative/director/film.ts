/**
 * A film script: what the director writes and the Film composition
 * renders. Frame-exact, and every word on screen carries its source.
 */
import type { PlatformId, Goal } from "./platforms";

export type Ground = "light" | "accent" | "ink";

export type FilmTransition =
  | "cut" | "blurDissolve" | "wipe" | "zoomThrough" | "slideUp"
  | "slideLeft" | "whip" | "iris" | "pageTurn" | "lineWipe" | "radial" | "cardSlide";

/** A piece of on-screen text and where its words come from: a listing path (see dossier.ts), "screen:<src>#<region>" (text visible in a real capture), or "micro" (MICROCOPY). */
export type Copy = { text: string; source: string };

export type SfxCue = { at: number; cue: string; volume: number };

export type Scene = {
  id: string;
  kind: "title" | "list" | "phone" | "split" | "live" | "brand" | "cta" | "contrast";
  /** How this kind is shot here, e.g. title: "editorial" | "native" | "quote" | "label". */
  variant: string;
  from: number;
  dur: number;
  ground: Ground;
  transition: FilmTransition;
  /** Lines of a title, items of a list, the boundary of a contrast. Already broken into lines where it matters. */
  copy: Copy[];
  lines?: string[][];
  emphasis?: string[];
  eyebrow?: Copy;
  screen?: {
    src: string;
    pose: "float" | "flat" | "tiltLeft" | "tiltRight" | "pair";
    also?: string;
    scroll?: [number, number][];
    focus?: { at: number; y: number; h: number; region: string };
  };
  caption?: Copy;
  live?: "safeToSpendCard" | "nextActionCard";
  sfx: SfxCue[];
  /** Why the director put this here. Printed in the treatment. */
  why: string;
};

export type Treatment = {
  voice: "editorial" | "native";
  camera: "float" | "locked" | "dolly";
  transitions: FilmTransition[];
  motif: string;
  grounds: Ground[];
  pace: number;
};

export type Film = {
  id: string;
  product: string;
  platform: PlatformId;
  goal: Goal;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  structure: string;
  angle: Copy;
  treatment: Treatment;
  music: { bed: string; level: number; energy: "low" | "mid" | "high" };
  scenes: Scene[];
  /** The director's analysis and decisions, in order, for the treatment document. */
  reasoning: { topic: string; decision: string; because: string }[];
};

/**
 * A film's shape with the product taken out: what two films would share
 * if one were a template of the other. The director checks a new film's
 * shape against the slate, and the guards check every pair.
 */
export function shape(f: Pick<Film, "structure" | "scenes" | "treatment">): Set<string> {
  return new Set([
    `structure:${f.structure}`,
    ...f.scenes.map((s, i) => `scene${i}:${s.kind}/${s.variant}`),
    ...f.scenes.map((s, i) => `ground${i}:${s.ground}`),
    ...f.scenes.map((s, i) => `in${i}:${s.transition}`),
    ...f.scenes.map((s, i) => (s.screen ? `pose${i}:${s.screen.pose}` : `pose${i}:-`)),
    `camera:${f.treatment.camera}`,
    `voice:${f.treatment.voice}`,
    `scenes:${f.scenes.length}`,
  ]);
}

export function similarity(a: Set<string>, b: Set<string>): number {
  return [...a].filter((x) => b.has(x)).length / new Set([...a, ...b]).size;
}

/** Above this, two films are the same film with different words. */
export const MAX_SIMILARITY = 0.7;
