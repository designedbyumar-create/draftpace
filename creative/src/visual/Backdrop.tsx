/**
 * The ground every creative sits on: the product's own background, two or
 * three large soft fields of its own accent tones drifting very slowly,
 * a whisper of film grain and a soft vignette. Nothing here is UI and
 * nothing here carries a claim; it is the lighting the real UI is shot in.
 *
 * Deterministic per frame (Remotion renders frames out of order and in
 * parallel): blob positions are pure functions of `frame`, and the grain
 * is an SVG turbulence whose seed steps with the frame.
 */
import { AbsoluteFill } from "remotion";

type Field = { x: number; y: number; size: number; color: string; opacity: number; speed: number; phase: number };

const FIELDS: Field[] = [
  { x: -14, y: -10, size: 78, color: "var(--post-card-soft)", opacity: 1, speed: 0.011, phase: 0 },
  { x: 58, y: 62, size: 70, color: "var(--post-accent-soft)", opacity: 0.85, speed: 0.009, phase: 2.1 },
  { x: 40, y: 18, size: 46, color: "var(--post-accent-soft)", opacity: 0.35, speed: 0.013, phase: 4.2 },
];

export function Backdrop({ frame = 0, grain = true, motion = 1 }: { frame?: number; grain?: boolean; motion?: number }) {
  return (
    <AbsoluteFill style={{ background: "var(--post-bg)", overflow: "hidden" }}>
      {FIELDS.map((f, i) => {
        const dx = Math.sin(frame * f.speed + f.phase) * 4 * motion;
        const dy = Math.cos(frame * f.speed * 0.8 + f.phase) * 3 * motion;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${f.x + dx}%`,
              top: `${f.y + dy}%`,
              width: `${f.size}%`,
              aspectRatio: "1",
              borderRadius: "50%",
              background: f.color,
              opacity: f.opacity,
              filter: "blur(60px)",
            }}
          />
        );
      })}
      {/* Vignette: pulls the eye to the centre without a visible edge. */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(20,20,20,0.10) 100%)" }} />
      {grain && <Grain seed={Math.floor(frame / 2)} />}
    </AbsoluteFill>
  );
}

/** Very fine animated grain: what stops a flat digital gradient from banding and reading as "template". */
export function Grain({ seed = 0, opacity = 0.07 }: { seed?: number; opacity?: number }) {
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "multiply", pointerEvents: "none" }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
}
