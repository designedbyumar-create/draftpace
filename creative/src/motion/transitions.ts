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
