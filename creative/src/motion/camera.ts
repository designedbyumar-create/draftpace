/**
 * Camera primitives. MVP implements one move: a slow push-in, the one named
 * in the MVP's first motion set ("slow camera push-in"). Nothing else from
 * the full camera list (pull out, pan, orbit, parallax, 2.5D depth,
 * perspective shift) is built yet — see creative/README.md.
 */
import { interpolate, Easing } from "remotion";

/**
 * A slow, continuous scale increase across a beat's duration, the classic
 * cinematic "lean in" move. Returns a CSS transform string, applied to the
 * beat's outer wrapper.
 */
export function pushIn({
  frame,
  start,
  durationInFrames,
  fromScale = 1,
  toScale = 1.06,
}: {
  frame: number;
  start: number;
  durationInFrames: number;
  fromScale?: number;
  toScale?: number;
}): string {
  const scale = interpolate(frame, [start, start + durationInFrames], [fromScale, toScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return `scale(${scale})`;
}
