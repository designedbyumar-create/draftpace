/**
 * UI motion primitives. MVP implements two: a spring card reveal and a
 * number count-up. List population, chart animation, cursor interaction,
 * button interaction, modal reveal, scrolling, typing and state-change
 * transitions are not built yet — see creative/README.md.
 */
import { interpolate, spring, Easing } from "remotion";

/** Scale + opacity "pop" for a card's entrance, using Remotion's own deterministic spring (not framer-motion's). */
export function cardPop({
  frame,
  start,
  fps,
}: {
  frame: number;
  start: number;
  fps: number;
}): { opacity: number; scale: number } {
  const progress = spring({
    frame: frame - start,
    fps,
    config: { damping: 16, mass: 0.6, stiffness: 120 },
  });
  return {
    opacity: interpolate(progress, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    scale: interpolate(progress, [0, 1], [0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  };
}

/**
 * Interpolates a minor-units integer from `from` to `to` over
 * `durationInFrames`. Returns the raw number; formatting it as currency is
 * the caller's job, so this stays free of any product-specific import.
 */
export function countUpValue({
  frame,
  start,
  durationInFrames,
  from,
  to,
}: {
  frame: number;
  start: number;
  durationInFrames: number;
  from: number;
  to: number;
}): number {
  const value = interpolate(frame, [start, start + durationInFrames], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return Math.round(value);
}
