/**
 * A real captured screen, presented in a phone. The screen inside is
 * always the real capture, never redrawn; this component only decides how
 * it is held: its size, its tilt in 3D, how far down the capture it has
 * scrolled, and which region of it is in focus.
 *
 * Screens are captured at the device's CSS width (390) and can be much
 * taller than one viewport (a whole itinerary, a whole record), so
 * `scroll` (0..1) pans down the real page the way a thumb would.
 */
import { Img, staticFile } from "remotion";
import MANIFEST from "../screens-manifest.json";

/** The viewport the captures were taken at (iPhone 14/15 CSS size). */
const VIEWPORT = { width: 390, height: 844 };

export type Focus = {
  /** Region of the full capture, as fractions of its height (0 = top of the page). */
  top: number;
  height: number;
  /** 0..1: how strongly everything outside the region is dimmed. */
  amount: number;
};

export function screenSize(src: string): { width: number; height: number } {
  const size = (MANIFEST as Record<string, { width: number; height: number }>)[src];
  if (!size) throw new Error(`${src} is not in screens-manifest.json; run node scripts/screens-manifest.mjs`);
  return size;
}

/** How far (in capture px) the page scrolls at scroll=1: the part below the first viewport. */
export function overflowPx(src: string): number {
  const s = screenSize(src);
  return Math.max(0, s.height * (VIEWPORT.width / s.width) - VIEWPORT.height);
}

/**
 * The page offset (in capture px, top of the viewport) that puts a focus
 * region in the middle of the viewport, clamped to what can scroll.
 */
export function scrollToFocus(src: string, focus: Pick<Focus, "top" | "height">): number {
  const s = screenSize(src);
  const pageH = s.height * (VIEWPORT.width / s.width);
  const centre = (focus.top + focus.height / 2) * pageH;
  const max = overflowPx(src);
  return max === 0 ? 0 : Math.min(1, Math.max(0, (centre - VIEWPORT.height / 2) / max));
}

export function Phone({
  src,
  width = 460,
  scroll = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  focus,
  shadow = 1,
}: {
  src: string;
  width?: number;
  scroll?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  focus?: Focus;
  shadow?: number;
}) {
  const bezel = width * 0.035;
  const screenW = width - bezel * 2;
  const k = screenW / VIEWPORT.width; // capture px -> on-screen px
  const screenH = VIEWPORT.height * k;
  const s = screenSize(src);
  const pageH = s.height * (VIEWPORT.width / s.width) * k;
  const offset = overflowPx(src) * k * Math.min(1, Math.max(0, scroll));
  const radius = width * 0.13;

  // The dim mask cut-out, in the viewport's own coordinates.
  const fTop = focus ? focus.top * pageH - offset : 0;
  const fH = focus ? focus.height * pageH : 0;

  return (
    <div style={{ perspective: 2400, width, height: screenH + bezel * 2 }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
          borderRadius: radius,
          // Titanium-ish edge: a dark body with a lighter rim, which is what
          // makes a flat rectangle read as an object.
          background: "linear-gradient(145deg, #2b2b31 0%, #121216 45%, #1d1d22 100%)",
          boxShadow: [
            `0 0 0 ${Math.max(1, width * 0.004)}px rgba(255,255,255,0.10) inset`,
            `0 ${60 * shadow}px ${110 * shadow}px -${30 * shadow}px rgba(16,20,24,${0.42 * shadow})`,
            `0 ${18 * shadow}px ${36 * shadow}px -${12 * shadow}px rgba(16,20,24,${0.25 * shadow})`,
          ].join(", "),
          padding: bezel,
        }}
      >
        <div style={{ position: "relative", width: screenW, height: screenH, overflow: "hidden", borderRadius: radius - bezel, background: "#fff" }}>
          <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: -offset, width: screenW, height: pageH }} />
          {focus && focus.amount > 0 && (
            <>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: Math.max(0, fTop), background: `rgba(14,18,22,${0.5 * focus.amount})` }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: fTop + fH, bottom: 0, background: `rgba(14,18,22,${0.5 * focus.amount})` }} />
              <div
                style={{
                  position: "absolute",
                  left: 6,
                  right: 6,
                  top: fTop - 4,
                  height: fH + 8,
                  borderRadius: 14,
                  boxShadow: `0 0 0 ${3 * focus.amount}px var(--post-accent), 0 0 40px rgba(0,0,0,${0.15 * focus.amount})`,
                }}
              />
            </>
          )}
          {/* Dynamic island: small, but it is what says "phone" at a glance. */}
          <div style={{ position: "absolute", top: screenH * 0.012, left: "50%", transform: "translateX(-50%)", width: screenW * 0.3, height: screenW * 0.085, borderRadius: 999, background: "#0c0c0f" }} />
          {/* Glass: one soft diagonal sheen, the cheapest realism there is. */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.05) 100%)", pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
}
