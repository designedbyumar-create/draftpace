/**
 * Kinetic typography primitives. MVP implements one pattern: a per-line
 * fade-and-rise with stagger, used for the problem line, the wordmark, and
 * the CTA. Word-level and character-level reveal, type-on and masked text
 * are not built yet — see creative/README.md.
 */
import { interpolate, Easing } from "remotion";

const EASE = Easing.bezier(0.22, 0.61, 0.36, 1); // Draftpace's own "calm" easing, design-system/motion.ts

/** Opacity + translateY for one line in a staggered group. `index` is the line's position in the group. */
export function fadeUpLine({
  frame,
  start,
  index,
  staggerFrames = 6,
  durationInFrames = 18,
  riseDistance = 14,
}: {
  frame: number;
  start: number;
  index: number;
  staggerFrames?: number;
  durationInFrames?: number;
  riseDistance?: number;
}): { opacity: number; translateY: number } {
  const lineStart = start + index * staggerFrames;
  const opacity = interpolate(frame, [lineStart, lineStart + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  const translateY = interpolate(frame, [lineStart, lineStart + durationInFrames], [riseDistance, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  return { opacity, translateY };
}
