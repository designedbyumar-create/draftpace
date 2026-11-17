/**
 * Transition primitives. MVP implements one: a blur dissolve, used between
 * every beat in this video, refined with Draftpace's own "calm" easing
 * curve (design-system/motion.ts: cubic-bezier(0.22, 0.61, 0.36, 1)) and a
 * subtle scale, instead of a flat linear blur/fade. Match cuts, UI morphs,
 * zoom transitions, wipes and object transitions are not built yet — see
 * creative/README.md.
 */
import { interpolate, Easing } from "remotion";

const CALM_EASE = Easing.bezier(0.22, 0.61, 0.36, 1);

/**
 * Fades, blurs and very slightly scales a beat in over its first `frames`
 * frames, or out over its last `frames` frames. Returns inline style
 * values. The scale (0.98 -> 1 on the way in) is what keeps this reading
 * as a soft camera settle rather than a flat opacity crossfade.
 */
export function blurDissolve({
  frame,
  start,
  durationInFrames,
  edgeFrames = 15,
  direction,
}: {
  frame: number;
  start: number;
  durationInFrames: number;
  edgeFrames?: number;
  direction: "in" | "out";
}): { opacity: number; filter: string; scale: number } {
  const end = start + durationInFrames;
  const range = direction === "in" ? [start, start + edgeFrames] : [end - edgeFrames, end];
  const opacity = interpolate(frame, range, direction === "in" ? [0, 1] : [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CALM_EASE,
  });
  const blurPx = interpolate(frame, range, direction === "in" ? [8, 0] : [0, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CALM_EASE,
  });
  const scale = interpolate(frame, range, direction === "in" ? [0.98, 1] : [1, 1.01], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: CALM_EASE,
  });
  return { opacity, filter: `blur(${blurPx}px)`, scale };
}

export type TransitionKind = "blurDissolve" | "wipe" | "zoomThrough" | "slideUp";

/**
 * One edge of a beat (its entrance or its exit) as a style, for any
 * transition kind. `p` runs 0 -> 1 across the edge: for "in" 0 is
 * invisible and 1 is settled; for "out" 0 is settled and 1 is gone.
 */
export function edgeStyle(kind: TransitionKind, direction: "in" | "out", p: number): React.CSSProperties {
  const e = Easing.bezier(0.16, 1, 0.3, 1)(p); // expo-out
  const v = direction === "in" ? e : 1 - Easing.bezier(0.7, 0, 0.84, 0)(p); // in: settle softly; out: leave decisively
  switch (kind) {
    case "wipe": {
      // A soft-edged reveal rising from the bottom, the way a page turns up.
      // edge runs 110 -> -20 so the 20%-wide soft band fully clears the frame at rest.
      const edge = (1 - e) * 130 - 20;
      const mask = `linear-gradient(to top, #000 ${100 - edge - 10}%, transparent ${100 - edge + 10}%)`;
      return direction === "in"
        ? { WebkitMaskImage: mask, maskImage: mask }
        : { opacity: v, transform: `translateY(${-(1 - v) * 6}%)` };
    }
    case "zoomThrough":
      return direction === "in"
        ? { opacity: v, transform: `scale(${1.18 - 0.18 * e})`, filter: `blur(${(1 - e) * 14}px)` }
        : { opacity: v, transform: `scale(${1 + (1 - v) * 0.35})`, filter: `blur(${(1 - v) * 18}px)` };
    case "slideUp":
      return direction === "in"
        ? { opacity: Math.min(1, e * 1.6), transform: `translateY(${(1 - e) * 22}%)` }
        : { opacity: v, transform: `translateY(${-(1 - v) * 14}%)` };
    case "blurDissolve":
    default:
      return direction === "in"
        ? { opacity: e, filter: `blur(${(1 - e) * 8}px)`, transform: `scale(${0.98 + 0.02 * e})` }
        : { opacity: v, filter: `blur(${(1 - v) * 8}px)`, transform: `scale(${1 + (1 - v) * 0.01})` };
  }
}
