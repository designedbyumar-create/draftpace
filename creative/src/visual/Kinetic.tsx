/**
 * Kinetic headline: words rise out of their own clipped line one after
 * another, sharpening as they land, and any word listed in `emphasis`
 * takes the product's accent with an underline that draws itself in.
 * At `frame` far past `start` it is simply the settled headline, which is
 * how a still uses it.
 */
import { interpolate, Easing } from "remotion";

const EASE = Easing.bezier(0.16, 1, 0.3, 1); // expo-out: quick lift, long soft landing

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9%$']/g, "");

/**
 * The largest size (up to `max`) at which the longest line fits `width` on
 * one row. A shot's line breaks are deliberate, so a line is never
 * re-wrapped; it is set smaller instead.
 */
export function fitFontSize(lines: string[], width: number, max: number, font: "Newsreader" | "IBM Plex Sans" = "Newsreader"): number {
  const em = font === "Newsreader" ? 0.5 : 0.56; // average advance per character, measured on these faces, plus word padding
  const longest = Math.max(1, ...lines.map((l) => l.length));
  return Math.floor(Math.min(max, width / (longest * em)));
}

export function isEmphasised(word: string, emphasis: string[] = []): boolean {
  const n = norm(word);
  return n.length > 0 && emphasis.some((e) => e.split(/\s+/).map(norm).includes(n));
}

export function KineticHeadline({
  lines,
  emphasis = [],
  frame,
  start,
  fontSize,
  align = "center",
  wordStagger = 3,
  lineStagger = 5,
  font = "Newsreader",
  weight = 600,
  color = "var(--post-ink)",
}: {
  lines: string[];
  emphasis?: string[];
  frame: number;
  start: number;
  fontSize: number;
  align?: "center" | "left";
  wordStagger?: number;
  lineStagger?: number;
  font?: string;
  weight?: number;
  color?: string;
}) {
  let wordIndex = 0;
  return (
    <div style={{ textAlign: align }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "block", whiteSpace: "nowrap", lineHeight: 1.08, paddingBottom: fontSize * 0.08, marginRight: -fontSize * 0.25 }}>
          {line.split(" ").map((word, wi) => {
            const at = start + wordIndex++ * wordStagger + li * lineStagger;
            const p = interpolate(frame, [at, at + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
            const accent = isEmphasised(word, emphasis);
            const underline = interpolate(frame, [at + 14, at + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", padding: `0 ${fontSize * 0.25}px ${fontSize * 0.1}px 0`, marginBottom: -fontSize * 0.1 }}>
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    transform: `translateY(${(1 - p) * 105}%)`,
                    filter: `blur(${(1 - p) * 6}px)`,
                    fontFamily: font,
                    fontWeight: weight,
                    fontSize,
                    letterSpacing: "-0.015em",
                    color: accent ? "var(--post-accent)" : color,
                    fontStyle: accent && font === "Newsreader" ? "italic" : "normal",
                  }}
                >
                  {word}
                  {accent && (
                    <svg
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                      style={{ position: "absolute", left: 0, right: 0, bottom: -fontSize * 0.06, width: "100%", height: fontSize * 0.14, overflow: "visible" }}
                    >
                      <path
                        d="M2 7 C 25 3, 55 3, 98 5"
                        fill="none"
                        stroke="var(--post-accent)"
                        strokeWidth={4}
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1 - underline}
                        opacity={0.55}
                      />
                    </svg>
                  )}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
