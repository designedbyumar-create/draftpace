/**
 * Light summaries of every film for lists (Library, Today, Calendar), with
 * Studio's own state (review, schedule) joined on. A list never ships a
 * whole script to the browser; the film page loads that.
 */
import { listFilms, type FilmKind } from "./engine";
import { readState, type Review } from "./store";
import { productLine } from "@engine/src/shop-listings";
import { THEMES } from "@engine/src/theme-registry";
import { PLATFORMS, type PlatformId } from "@engine/director/platforms";

export type FilmSummary = {
  id: string; kind: FilmKind; product: string; productName: string; accent: string; ink: string; bg: string;
  platform: PlatformId; platformLabel: string; goal: string; structure: string; seconds: number;
  hook: string; guide: string | null; width: number; height: number;
  rendered: boolean; review: Review | null; scheduled: number;
};

export function summaries(): FilmSummary[] {
  const state = readState();
  return listFilms().map(({ film, kind, rendered }) => {
    const t = THEMES[film.product];
    return {
      id: film.id, kind, product: film.product, productName: productLine(film.product).name,
      accent: t.accent, ink: t.ink, bg: t.bg,
      platform: film.platform, platformLabel: PLATFORMS[film.platform].label, goal: film.goal, structure: film.structure,
      seconds: Math.round((film.durationInFrames / film.fps) * 10) / 10,
      hook: film.angle.source === "micro" ? film.scenes.flatMap((s) => s.copy).find((c) => c.source !== "micro")?.text ?? film.angle.text : film.angle.text,
      guide: film.guide ?? null, width: film.width, height: film.height,
      rendered: !!rendered, review: state.reviews[film.id] ?? null,
      scheduled: state.schedule.filter((p) => p.filmId === film.id).length,
    };
  });
}

export const STRUCTURE_NAMES: Record<string, string> = {
  cascade: "Problem cascade", searched: "In their words", walkthrough: "How it works", isThisYou: "Is this you?",
  honestNo: "What it is not", whatYouGet: "What you get", oneScreen: "One screen, closely", beforeAfter: "Before and after",
  question: "The question before buying", guideTimeline: "In order", guideSteps: "Do this", guideChecklist: "The checklist",
  guideQuestion: "The question people ask", voiceover: "Cut to a voice-over",
};
