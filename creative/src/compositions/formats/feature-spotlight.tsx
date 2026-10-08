/**
 * Feature Spotlight format. Consumes a shot file (see
 * shots/monthly-money-reset/feature-spotlight.shot.json) rather than
 * hardcoding a timeline: every beat's timing, camera move, typography and
 * caption comes from that JSON. This is the one format built for the MVP —
 * see creative/README.md for the others still to come.
 */
import { AbsoluteFill, Audio, Img, Sequence, staticFile, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pushIn } from "../../motion/camera";
import { fadeUpLine } from "../../motion/typography";
import { blurDissolve } from "../../motion/transitions";
import { cardPop, countUpValue } from "../../motion/ui";
import { SFX_FILES, BED_FILE, hasAudioAsset } from "../../motion/sound";
import { monthlyMoneyResetDemo, SafeToSpendCard, NextActionCard, formatCurrency } from "../../ui-adapter/monthlyMoneyReset";
import { themeFor, postCssVars } from "../../theme-registry";
import { productLine } from "../../shop-listings";

type Beat = {
  id: string;
  kind: "typography" | "noise" | "wordmark" | "safeToSpendCard" | "nextActionCard" | "screen" | "cta";
  startFrame: number;
  durationFrames: number;
  typography?: { lines?: string[]; eyebrow?: string; headline?: string; sub?: string };
  camera?: { move: "static" | "pushIn"; fromScale?: number; toScale?: number };
  transition?: { in?: string; out?: string; frames?: number };
  ui?: { reveal?: "cardPop"; countUp?: { fromMinorUnits: number; toMinorUnits: number; durationFrames: number } };
  screen?: { src: string };
  caption?: string | null;
  cta?: { label: string; url: string };
  sound?: { sfx?: string | null };
};

/** A very slow, continuous drift, applied to every beat (not just card beats) so the whole film reads as one steadily-moving camera rather than static slides cut together. */
function ambientDrift(frame: number, start: number, durationInFrames: number) {
  return pushIn({ frame, start, durationInFrames, fromScale: 1, toScale: 1.025 });
}

export type Shot = {
  id: string;
  product: string;
  themeSlug: string;
  format: string;
  fps: number;
  width: number;
  height: number;
  beats: Beat[];
};

/** Fills `{price}` / `{name}` in a beat's text from the product's real Shop listing, so no shot file states a price of its own. */
function withListing(beat: Beat, slug: string): Beat {
  const { name, price } = productLine(slug);
  const fill = (t: string) => t.replaceAll("{price}", price).replaceAll("{name}", name);
  const typo = beat.typography;
  return {
    ...beat,
    caption: beat.caption ? fill(beat.caption) : beat.caption,
    typography: typo && {
      ...typo,
      lines: typo.lines?.map(fill),
      eyebrow: typo.eyebrow && fill(typo.eyebrow),
      headline: typo.headline && fill(typo.headline),
      sub: typo.sub && fill(typo.sub),
    },
  };
}

function TransitionWrap({ beat, frame, children }: { beat: Beat; frame: number; children: React.ReactNode }) {
  const edge = beat.transition?.frames ?? 15;
  let opacity = 1;
  let filter = "none";
  let scale = 1;
  if (beat.transition?.in) {
    const d = blurDissolve({ frame, start: beat.startFrame, durationInFrames: beat.durationFrames, edgeFrames: edge, direction: "in" });
    opacity = Math.min(opacity, d.opacity);
    filter = d.filter;
    scale = d.scale;
  }
  if (beat.transition?.out) {
    const d = blurDissolve({ frame, start: beat.startFrame, durationInFrames: beat.durationFrames, edgeFrames: edge, direction: "out" });
    opacity = Math.min(opacity, d.opacity);
    filter = d.filter;
    scale = d.scale;
  }
  const sfx = beat.sound?.sfx;
  return (
    <>
      {hasAudioAsset(sfx) && <Audio src={SFX_FILES[sfx]} startFrom={0} />}
      {/* position/width/height are load-bearing, not decorative: without them this
          div doesn't establish a sized containing block, so the AbsoluteFill
          beats mount inside it collapse to height 0 (confirmed via DOM inspection
          in Remotion Studio: inset:0 against a 0-height ancestor still measures
          0), which is why text rendered pinned to the top of the frame instead
          of centered. */}
      <div style={{ opacity, filter, transform: `scale(${scale})`, position: "relative", width: "100%", height: "100%" }}>{children}</div>
    </>
  );
}

function TypographyBeat({ beat, frame, align = "center" }: { beat: Beat; frame: number; align?: "center" }) {
  const lines = beat.typography?.lines ?? [];
  const drift = ambientDrift(frame, beat.startFrame, beat.durationFrames);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 96px", transform: drift }}>
      <div style={{ textAlign: align }}>
        {lines.map((line, i) => {
          const { opacity, translateY } = fadeUpLine({ frame, start: beat.startFrame, index: i, staggerFrames: 7 });
          return (
            <p
              key={line}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                fontFamily: "var(--font-inter)",
                fontWeight: 600,
                fontSize: 58,
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                color: "var(--post-ink)",
                margin: 0,
              }}
            >
              {line}
            </p>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function NoiseBeat({ beat, frame }: { beat: Beat; frame: number }) {
  const lines = beat.typography?.lines ?? [];
  // Each fragment sits at a different depth: later, smaller, blurrier,
  // quieter — a 2.5D-reading drift without any camera move or fake UI.
  const positions = [
    { x: -10, y: -120, size: 34, blur: 0 },
    { x: 18, y: 0, size: 40, blur: 0.6 },
    { x: -14, y: 120, size: 30, blur: 1.1 },
  ];
  const drift = ambientDrift(frame, beat.startFrame, beat.durationFrames);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: drift }}>
      {lines.map((line, i) => {
        const { opacity, translateY } = fadeUpLine({ frame, start: beat.startFrame, index: i, staggerFrames: 8, riseDistance: 10 });
        const pos = positions[i % positions.length];
        return (
          <p
            key={line}
            style={{
              position: "absolute",
              opacity: opacity * 0.68,
              transform: `translate(${pos.x}px, ${pos.y + translateY}px)`,
              filter: `blur(${pos.blur}px)`,
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: pos.size,
              color: "var(--post-muted)",
              margin: 0,
            }}
          >
            {line}
          </p>
        );
      })}
    </AbsoluteFill>
  );
}

function WordmarkBeat({ beat, frame }: { beat: Beat; frame: number }) {
  const eyebrow = fadeUpLine({ frame, start: beat.startFrame, index: 0, staggerFrames: 6 });
  const headline = fadeUpLine({ frame, start: beat.startFrame, index: 1, staggerFrames: 6 });
  const drift = ambientDrift(frame, beat.startFrame, beat.durationFrames);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: drift }}>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
            fontFamily: "var(--font-space-mono)",
            fontSize: 20,
            letterSpacing: "0.22em",
            color: "var(--post-accent)",
            margin: 0,
          }}
        >
          {beat.typography?.eyebrow}
        </p>
        <p
          style={{
            opacity: headline.opacity,
            transform: `translateY(${headline.translateY}px)`,
            fontFamily: "var(--font-inter)",
            fontWeight: 700,
            fontSize: 52,
            letterSpacing: "-0.02em",
            color: "var(--post-ink)",
            margin: "10px 0 0",
          }}
        >
          {beat.typography?.headline}
        </p>
      </div>
    </AbsoluteFill>
  );
}

function SafeToSpendBeat({ beat, frame, fps }: { beat: Beat; frame: number; fps: number }) {
  const demo = monthlyMoneyResetDemo();
  const pop = cardPop({ frame, start: beat.startFrame, fps });
  const scale = beat.camera?.move === "pushIn"
    ? pushIn({ frame, start: beat.startFrame, durationInFrames: beat.durationFrames, fromScale: beat.camera.fromScale, toScale: beat.camera.toScale })
    : "scale(1)";
  const countUp = beat.ui?.countUp;
  const countUpEnd = countUp ? beat.startFrame + countUp.durationFrames : beat.startFrame;
  const showCountUp = countUp && frame < countUpEnd;
  const countUpFade = countUp
    ? Math.min(1, Math.max(0, (frame - (countUpEnd - 8)) / 8)) // last 8 frames of count-up fade it out as the real card fades in
    : 0;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${pop.scale})`, opacity: pop.opacity }}>
      <div style={{ width: 620, transform: scale, transformOrigin: "center" }}>
        <div style={{ position: "relative" }}>
          {countUp && (
            <div
              style={{
                position: "absolute",
                top: 86,
                left: 32,
                opacity: showCountUp ? 1 - countUpFade : 0,
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 600,
                  fontSize: 76,
                  letterSpacing: "-0.05em",
                  color: "var(--mmr-hero-ink)",
                  fontFeatureSettings: "'tnum' 1, 'cv11' 1",
                }}
              >
                {formatCurrency(
                  countUpValue({ frame, start: beat.startFrame, durationInFrames: countUp.durationFrames, from: countUp.fromMinorUnits, to: countUp.toMinorUnits }),
                  demo.state.currency
                )}
              </span>
            </div>
          )}
          <div style={{ opacity: countUp ? countUpFade : 1 }}>
            <SafeToSpendCard
              breakdown={demo.breakdown}
              currency={demo.state.currency}
              updatedAt={demo.now}
              weeksRemaining={demo.weeksRemaining}
              tightestDay={demo.tightestDay}
            />
          </div>
        </div>
      </div>
      {beat.caption && (
        <p
          style={{
            position: "absolute",
            bottom: 420,
            left: 96,
            right: 96,
            textAlign: "center",
            fontFamily: "var(--font-inter)",
            fontSize: 26,
            lineHeight: 1.4,
            color: "var(--post-muted)",
            opacity: Math.min(1, Math.max(0, (frame - (beat.startFrame + 140)) / 20)),
          }}
        >
          {beat.caption}
        </p>
      )}
    </AbsoluteFill>
  );
}

/** The product-agnostic real-UI beat: a real captured screen image, pushed in on. This is what every product besides Monthly Money Reset uses, since only MMR has live components wired into the ui-adapter today. */
function ScreenBeat({ beat, frame, fps }: { beat: Beat; frame: number; fps: number }) {
  const pop = cardPop({ frame, start: beat.startFrame, fps });
  const scale = beat.camera?.move === "pushIn"
    ? pushIn({ frame, start: beat.startFrame, durationInFrames: beat.durationFrames, fromScale: beat.camera.fromScale, toScale: beat.camera.toScale })
    : "scale(1)";
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${pop.scale})`, opacity: pop.opacity }}>
      <div
        style={{
          width: 420,
          height: 420 * 1.8,
          transform: scale,
          transformOrigin: "center",
          overflow: "hidden",
          borderRadius: 32,
          background: "#15151a",
          padding: 12,
          boxShadow: "0 50px 90px -30px rgba(20,20,20,0.4)",
        }}
      >
        <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 22 }}>
          {beat.screen && (
            <Img
              src={staticFile(beat.screen.src)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
          )}
        </div>
      </div>
      {beat.caption && (
        <p
          style={{
            position: "absolute",
            bottom: 160,
            left: 96,
            right: 96,
            textAlign: "center",
            fontFamily: "var(--font-inter)",
            fontSize: 26,
            lineHeight: 1.4,
            color: "var(--post-muted)",
            opacity: Math.min(1, Math.max(0, (frame - (beat.startFrame + 60)) / 20)),
          }}
        >
          {beat.caption}
        </p>
      )}
    </AbsoluteFill>
  );
}

function NextActionBeat({ beat, frame, fps }: { beat: Beat; frame: number; fps: number }) {
  const demo = monthlyMoneyResetDemo();
  const pop = cardPop({ frame, start: beat.startFrame, fps });
  const scale = beat.camera?.move === "pushIn"
    ? pushIn({ frame, start: beat.startFrame, durationInFrames: beat.durationFrames, fromScale: beat.camera.fromScale, toScale: beat.camera.toScale })
    : "scale(1)";
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${pop.scale})`, opacity: pop.opacity }}>
      <div style={{ width: 620, transform: scale, transformOrigin: "center" }}>
        <NextActionCard nextAction={demo.nextAction} checkInDay={demo.state.preferences.checkInDay} onDismiss={() => {}} onAct={() => {}} />
      </div>
    </AbsoluteFill>
  );
}

function CtaBeat({ beat, frame }: { beat: Beat; frame: number }) {
  const headline = fadeUpLine({ frame, start: beat.startFrame, index: 0, staggerFrames: 6 });
  const sub = fadeUpLine({ frame, start: beat.startFrame, index: 1, staggerFrames: 6 });
  const drift = ambientDrift(frame, beat.startFrame, beat.durationFrames);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: drift }}>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            opacity: headline.opacity,
            transform: `translateY(${headline.translateY}px)`,
            fontFamily: "var(--font-inter)",
            fontWeight: 700,
            fontSize: 54,
            letterSpacing: "-0.02em",
            color: "var(--post-ink)",
            margin: 0,
          }}
        >
          {beat.typography?.headline}
        </p>
        <p
          style={{
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            fontFamily: "var(--font-space-mono)",
            fontSize: 22,
            letterSpacing: "0.04em",
            color: "var(--post-accent)",
            margin: "14px 0 0",
          }}
        >
          {beat.typography?.sub}
        </p>
      </div>
    </AbsoluteFill>
  );
}

export function FeatureSpotlight({ shot }: { shot: Shot }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = themeFor(shot.themeSlug);
  const totalDuration = shot.beats[shot.beats.length - 1].startFrame + shot.beats[shot.beats.length - 1].durationFrames;
  const bedVolume = interpolate(
    frame,
    [0, 20, totalDuration - 30, totalDuration],
    [0, 0.12, 0.12, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ ...postCssVars(theme), background: "var(--post-bg)" } as React.CSSProperties}>
      <Audio src={BED_FILE} volume={bedVolume} />
      {shot.beats.map((b) => withListing(b, shot.product)).map((beat) => (
        <Sequence key={beat.id} from={beat.startFrame} durationInFrames={beat.durationFrames} layout="none">
          <TransitionWrap beat={beat} frame={frame}>
            {beat.kind === "typography" && <TypographyBeat beat={beat} frame={frame} />}
            {beat.kind === "noise" && <NoiseBeat beat={beat} frame={frame} />}
            {beat.kind === "wordmark" && <WordmarkBeat beat={beat} frame={frame} />}
            {beat.kind === "safeToSpendCard" && <SafeToSpendBeat beat={beat} frame={frame} fps={fps} />}
            {beat.kind === "nextActionCard" && <NextActionBeat beat={beat} frame={frame} fps={fps} />}
            {beat.kind === "screen" && <ScreenBeat beat={beat} frame={frame} fps={fps} />}
            {beat.kind === "cta" && <CtaBeat beat={beat} frame={frame} />}
          </TransitionWrap>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
