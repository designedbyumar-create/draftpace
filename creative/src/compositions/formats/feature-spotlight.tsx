/**
 * Feature Spotlight: a 9:16 product film, PROBLEM -> NOISE -> REVEAL ->
 * CLARITY -> NEXT MOVE -> CTA, driven entirely by a shot file
 * (shots/<product>/feature-spotlight.shot.json). Every beat's timing,
 * text, screen and transition comes from that JSON; this file decides how
 * it is shot.
 *
 * How it is shot:
 *  - One continuous set: the product's own backdrop (Backdrop.tsx) runs
 *    under every beat, so cuts read as one film, not slides.
 *  - Type is the brand's own (Newsreader display, IBM Plex Sans), kinetic,
 *    with the shot's `emphasis` words in the product accent.
 *  - Real UI only: a real captured screen held in a phone (Phone.tsx) that
 *    enters in 3D, scrolls the real page and can focus a region of it; or
 *    a live Monthly Money Reset component computing real numbers.
 *  - Sound is designed from the beats, not placed by hand: a whoosh on
 *    every transition, a riser into the product reveal landing on a soft
 *    impact, a pop as the UI lands, a tap on focus, a settle on the CTA,
 *    with the music bed ducking under the big moments. A beat can still
 *    name its own `sound.sfx`, which is played as well.
 *
 * Everything text-safe stays inside SAFE (the area Reels/TikTok/Shorts
 * don't cover with their own UI).
 */
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile, Easing } from "remotion";
import { LogoMark } from "@/design-system/Logo";
import { edgeStyle, type TransitionKind } from "../../motion/transitions";
import { countUpValue } from "../../motion/ui";
import { SFX_CUES, BED } from "../../motion/sound-cues";
import { monthlyMoneyResetDemo, SafeToSpendCard, NextActionCard, formatCurrency } from "../../ui-adapter/monthlyMoneyReset";
import { themeFor, postCssVars } from "../../theme-registry";
import { productLine } from "../../shop-listings";
import { Backdrop } from "../../visual/Backdrop";
import { KineticHeadline, fitFontSize } from "../../visual/Kinetic";
import { Phone, overflowPx, scrollToFocus, screenSize, type Focus } from "../../visual/Phone";

/** Platform UI keeps out of these bands on a 1080x1920 frame. */
export const SAFE = { top: 240, bottom: 1500, side: 80 };

type Beat = {
  id: string;
  kind: "typography" | "noise" | "wordmark" | "safeToSpendCard" | "nextActionCard" | "screen" | "cta";
  startFrame: number;
  durationFrames: number;
  typography?: { lines?: string[]; eyebrow?: string; headline?: string; sub?: string; emphasis?: string[] };
  camera?: { move: "static" | "pushIn"; fromScale?: number; toScale?: number };
  transition?: { in?: TransitionKind; out?: TransitionKind; frames?: number };
  ui?: { reveal?: "cardPop"; countUp?: { fromMinorUnits: number; toMinorUnits: number; durationFrames: number } };
  /**
   * scroll: [[at, to], ...] keyframes, `at` as a fraction of the beat, `to` 0..1 of the page's overflow.
   * focus: a region of the real page (fractions of its height) brought forward at `at`.
   */
  screen?: { src: string; scroll?: [number, number][]; focus?: { at: number; top: number; height: number } };
  caption?: string | null;
  cta?: { label: string; url: string };
  sound?: { sfx?: string | null };
};

export type Shot = {
  id: string;
  product: string;
  themeSlug: string;
  problem?: number;
  format: string;
  fps: number;
  width: number;
  height: number;
  beats: Beat[];
};

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

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

// ---------------------------------------------------------------- sound

type Cue = { at: number; sfx: keyof typeof SFX_CUES; volume: number };

/** The sound design, derived from the beats. */
export function soundCues(beats: Beat[]): Cue[] {
  const cues: Cue[] = [];
  for (const b of beats) {
    const s = b.startFrame;
    if (b.transition?.in && s > 0) cues.push({ at: s - 6, sfx: b.transition.in === "wipe" || b.transition.in === "slideUp" ? "swish" : "whoosh", volume: 0.32 });
    if (b.kind === "noise") (b.typography?.lines ?? []).forEach((_, i) => cues.push({ at: s + 6 + i * 10, sfx: "tick", volume: 0.5 }));
    if (b.kind === "wordmark") {
      cues.push({ at: s - 40, sfx: "riser", volume: 0.42 });
      cues.push({ at: s, sfx: "impact", volume: 0.75 });
      cues.push({ at: s + 4, sfx: "shimmer", volume: 0.28 });
    }
    if (b.kind === "screen" || b.kind === "safeToSpendCard" || b.kind === "nextActionCard") cues.push({ at: s + 14, sfx: "pop", volume: 0.45 });
    if (b.kind === "screen" && b.screen?.focus) cues.push({ at: s + Math.round(b.screen.focus.at * b.durationFrames), sfx: "tap", volume: 0.6 });
    if (b.kind === "cta") cues.push({ at: s + 10, sfx: "settle", volume: 0.5 });
    const own = b.sound?.sfx;
    if (own && own in SFX_CUES) cues.push({ at: s, sfx: own as keyof typeof SFX_CUES, volume: 0.25 });
  }
  return cues.map((c) => ({ ...c, at: Math.max(0, c.at) }));
}

/** 0..1: how hard the bed ducks at `frame`, from the cues that should cut through it. */
function duck(frame: number, cues: Cue[]): number {
  let d = 0;
  for (const c of cues) {
    if (c.sfx !== "impact" && c.sfx !== "settle" && c.sfx !== "riser") continue;
    const len = c.sfx === "riser" ? 40 : 30;
    d = Math.max(d, interpolate(frame, [c.at - 4, c.at + 2, c.at + len], [0, 1, 0], clamp));
  }
  return d;
}

// ---------------------------------------------------------------- shared pieces

function Edge({ beat, frame, children }: { beat: Beat; frame: number; children: React.ReactNode }) {
  const edge = beat.transition?.frames ?? 15;
  const end = beat.startFrame + beat.durationFrames;
  let style: React.CSSProperties = {};
  if (beat.transition?.in && frame < beat.startFrame + edge) {
    style = edgeStyle(beat.transition.in, "in", interpolate(frame, [beat.startFrame, beat.startFrame + edge], [0, 1], clamp));
  } else if (beat.transition?.out && frame > end - edge) {
    style = edgeStyle(beat.transition.out, "out", interpolate(frame, [end - edge, end], [0, 1], clamp));
  }
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
}

/** Slow continuous drift so a held frame never goes dead. */
function drift(frame: number, start: number, dur: number, amount = 0.03) {
  return interpolate(frame, [start, start + dur], [1, 1 + amount], clamp);
}

function Caption({ text, frame, start }: { text: string; frame: number; start: number }) {
  const p = interpolate(frame, [start, start + 20], [0, 1], { ...clamp, easing: EXPO });
  return (
    <div style={{ position: "absolute", left: SAFE.side, right: SAFE.side, top: SAFE.bottom - 170, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          opacity: p,
          transform: `translateY(${(1 - p) * 30}px)`,
          display: "flex",
          gap: 22,
          alignItems: "stretch",
          maxWidth: 860,
          padding: "26px 34px 26px 26px",
          borderRadius: 26,
          background: "color-mix(in srgb, var(--post-card) 88%, transparent)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 24px 60px -24px rgba(16,20,24,0.35), 0 0 0 1px var(--post-line)",
        }}
      >
        <div style={{ width: 6, borderRadius: 3, background: "var(--post-accent)", flexShrink: 0 }} />
        <p style={{ margin: 0, fontFamily: "IBM Plex Sans", fontWeight: 500, fontSize: 36, lineHeight: 1.32, color: "var(--post-ink)", textWrap: "balance" }}>{text}</p>
      </div>
    </div>
  );
}

/** The 3D entrance every piece of real UI makes: up from below, tilted, settling almost flat. */
function entrance(frame: number, start: number, fps: number) {
  const s = spring({ frame: frame - start, fps, config: { damping: 19, mass: 0.95, stiffness: 90 } });
  return {
    s,
    y: (1 - s) * 900,
    rotateX: 4 + (1 - s) * 26,
    rotateY: -7 - (1 - s) * 18,
    rotateZ: (1 - s) * -5,
    shadow: 0.6 + 0.4 * s,
  };
}

// ---------------------------------------------------------------- beats

function ProblemBeat({ beat, frame }: { beat: Beat; frame: number }) {
  const lines = beat.typography?.lines ?? [];
  const size = fitFontSize(lines, 1080 - SAFE.side * 2 - 20, 112);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: `0 ${SAFE.side + 10}px`, transform: `scale(${drift(frame, beat.startFrame, beat.durationFrames)})` }}>
      <KineticHeadline lines={lines} emphasis={beat.typography?.emphasis} frame={frame} start={beat.startFrame + 4} fontSize={size} />
    </AbsoluteFill>
  );
}

function NoiseBeat({ beat, frame }: { beat: Beat; frame: number }) {
  const lines = beat.typography?.lines ?? [];
  // Thoughts at three depths: nearer ones bigger, sharper, moving faster.
  const layers = [
    { x: -150, y: -260, size: 58, blur: 0, speed: 1.0, rot: -3 },
    { x: 130, y: -10, size: 70, blur: 0, speed: 1.4, rot: 2 },
    { x: -90, y: 250, size: 50, blur: 1.6, speed: 0.7, rot: -1.5 },
  ];
  const t = frame - beat.startFrame;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {lines.map((line, i) => {
        const L = layers[i % layers.length];
        const at = 6 + i * 10;
        const p = interpolate(t, [at, at + 18], [0, 1], { ...clamp, easing: EXPO });
        return (
          <p
            key={i}
            style={{
              position: "absolute",
              margin: 0,
              whiteSpace: "nowrap",
              opacity: p * (L.blur ? 0.55 : 0.85),
              transform: `translate(${L.x}px, ${L.y - t * L.speed * 1.2 + (1 - p) * 40}px) rotate(${L.rot}deg) scale(${0.9 + 0.1 * p})`,
              filter: `blur(${L.blur + (1 - p) * 8}px)`,
              fontFamily: "Newsreader",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: L.size,
              color: "var(--post-muted)",
            }}
          >
            {line}
          </p>
        );
      })}
    </AbsoluteFill>
  );
}

function WordmarkBeat({ beat, frame, fps }: { beat: Beat; frame: number; fps: number }) {
  const t = frame - beat.startFrame;
  const mark = spring({ frame: t, fps, config: { damping: 13, mass: 0.7, stiffness: 110 } });
  const eyebrow = interpolate(t, [10, 30], [0, 1], { ...clamp, easing: EXPO });
  // A soft light bloom behind the mark on the impact.
  const bloom = interpolate(t, [0, 6, 40], [0, 0.9, 0.35], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${drift(frame, beat.startFrame, beat.durationFrames, 0.025)})` }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, var(--post-card) 0%, transparent 62%)", opacity: bloom }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div
          style={{
            transform: `scale(${0.55 + 0.45 * mark}) rotate(${(1 - mark) * -12}deg)`,
            opacity: Math.min(1, mark * 1.5),
            filter: "drop-shadow(0 30px 50px rgba(16,20,24,0.25))",
            ["--logo-mark" as string]: "var(--post-accent)",
            ["--logo-mark-glyph" as string]: "var(--post-card)",
          }}
        >
          <LogoMark size={170} />
        </div>
        <KineticHeadline lines={[beat.typography?.headline ?? ""]} frame={frame} start={beat.startFrame + 8} fontSize={fitFontSize([beat.typography?.headline ?? ""], 900, 104)} wordStagger={4} />
        <p style={{ margin: 0, opacity: eyebrow, transform: `translateY(${(1 - eyebrow) * 16}px)`, fontFamily: "IBM Plex Sans", fontWeight: 600, fontSize: 26, letterSpacing: "0.32em", color: "var(--post-accent)" }}>
          {beat.typography?.eyebrow}
        </p>
      </div>
    </AbsoluteFill>
  );
}

function ScreenBeat({ beat, frame, fps }: { beat: Beat; frame: number; fps: number }) {
  const src = beat.screen!.src;
  const t = (frame - beat.startFrame) / beat.durationFrames;
  const enter = entrance(frame, beat.startFrame, fps);
  const width = 560;

  // Scroll: explicit keyframes, or a gentle auto-pan down a page taller than the viewport.
  const focus = beat.screen?.focus;
  const over = overflowPx(src);
  const auto: [number, number][] = over > 120 ? [[0.3, 0], [0.85, Math.min(0.55, 900 / over)]] : [];
  let keys = beat.screen?.scroll ?? auto;
  if (focus) keys = [[0, 0], [Math.max(0.05, focus.at - 0.22), 0], [focus.at, scrollToFocus(src, focus)]];
  const scroll = keys.length ? interpolate(t, keys.map((k) => k[0]), keys.map((k) => k[1]), { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;

  // Focus: dim the rest of the real page, ring the region, and push the camera in on it.
  const fAmt = focus ? interpolate(t, [focus.at, focus.at + 0.12], [0, 1], { ...clamp, easing: EXPO }) : 0;
  const zoom = 1 + 0.16 * fAmt;
  const focusState: Focus | undefined = focus ? { top: focus.top, height: focus.height, amount: fAmt } : undefined;
  // Where the focus region sits inside the phone, so the zoom can centre on it.
  let shiftY = 0;
  if (focus) {
    const s = screenSize(src);
    const k = (width * 0.93) / 390;
    const pageH = s.height * (390 / s.width) * k;
    const regionCentre = width * 0.035 + (focus.top + focus.height / 2) * pageH - over * k * scroll;
    const phoneH = 844 * k + width * 0.07;
    shiftY = (phoneH / 2 - regionCentre) * (zoom - 1) * 1.6;
  }
  const sway = Math.sin((frame - beat.startFrame) / 38) * 1.6;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `translateY(${enter.y - 90 + shiftY}px) scale(${zoom * drift(frame, beat.startFrame, beat.durationFrames, 0.03)})` }}>
        <Phone
          src={src}
          width={width}
          scroll={scroll}
          rotateX={enter.rotateX * (1 - fAmt * 0.8)}
          rotateY={(enter.rotateY + sway) * (1 - fAmt * 0.8)}
          rotateZ={enter.rotateZ}
          focus={focusState}
          shadow={enter.shadow}
        />
      </div>
      {beat.caption && <Caption text={beat.caption} frame={frame} start={beat.startFrame + Math.round(beat.durationFrames * 0.3)} />}
    </AbsoluteFill>
  );
}

function CardStage({ beat, frame, fps, children }: { beat: Beat; frame: number; fps: number; children: React.ReactNode }) {
  const enter = entrance(frame, beat.startFrame, fps);
  const push = beat.camera?.move === "pushIn"
    ? interpolate(frame, [beat.startFrame, beat.startFrame + beat.durationFrames], [beat.camera.fromScale ?? 1, beat.camera.toScale ?? 1.06], { ...clamp, easing: Easing.out(Easing.quad) })
    : drift(frame, beat.startFrame, beat.durationFrames);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ perspective: 2400 }}>
        <div
          style={{
            width: 700,
            transform: `translateY(${enter.y - 80}px) rotateX(${enter.rotateX * 0.6}deg) rotateY(${enter.rotateY * 0.5}deg) scale(${push})`,
            filter: `drop-shadow(0 ${50 * enter.shadow}px ${70 * enter.shadow}px rgba(16,20,24,0.28))`,
          }}
        >
          {children}
        </div>
      </div>
      {beat.caption && <Caption text={beat.caption} frame={frame} start={beat.startFrame + Math.round(beat.durationFrames * 0.45)} />}
    </AbsoluteFill>
  );
}

function SafeToSpendBeat({ beat, frame, fps }: { beat: Beat; frame: number; fps: number }) {
  const demo = monthlyMoneyResetDemo();
  const countUp = beat.ui?.countUp;
  const countUpEnd = countUp ? beat.startFrame + countUp.durationFrames : beat.startFrame;
  const showCountUp = countUp && frame < countUpEnd;
  // The last 8 frames of the count-up crossfade into the real card already at rest (trap #9 in SKILL.md).
  const countUpFade = countUp ? Math.min(1, Math.max(0, (frame - (countUpEnd - 8)) / 8)) : 1;
  return (
    <CardStage beat={beat} frame={frame} fps={fps}>
      <div style={{ position: "relative" }}>
        {countUp && (
          <div style={{ position: "absolute", top: 96, left: 36, opacity: showCountUp ? 1 - countUpFade : 0, pointerEvents: "none" }}>
            <span style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 86, letterSpacing: "-0.05em", color: "var(--mmr-hero-ink)", fontFeatureSettings: "'tnum' 1, 'cv11' 1" }}>
              {formatCurrency(countUpValue({ frame, start: beat.startFrame, durationInFrames: countUp.durationFrames, from: countUp.fromMinorUnits, to: countUp.toMinorUnits }), demo.state.currency)}
            </span>
          </div>
        )}
        <div style={{ opacity: countUpFade }}>
          <SafeToSpendCard breakdown={demo.breakdown} currency={demo.state.currency} updatedAt={demo.now} weeksRemaining={demo.weeksRemaining} tightestDay={demo.tightestDay} />
        </div>
      </div>
    </CardStage>
  );
}

function NextActionBeat({ beat, frame, fps }: { beat: Beat; frame: number; fps: number }) {
  const demo = monthlyMoneyResetDemo();
  return (
    <CardStage beat={beat} frame={frame} fps={fps}>
      <NextActionCard nextAction={demo.nextAction} checkInDay={demo.state.preferences.checkInDay} onDismiss={() => {}} onAct={() => {}} />
    </CardStage>
  );
}

function CtaBeat({ beat, frame, fps, slug }: { beat: Beat; frame: number; fps: number; slug: string }) {
  const t = frame - beat.startFrame;
  const { name, price, compareAt } = productLine(slug);
  const mark = spring({ frame: t, fps, config: { damping: 16, mass: 0.7 } });
  const priceIn = interpolate(t, [14, 32], [0, 1], { ...clamp, easing: EXPO });
  const pillIn = spring({ frame: t - 20, fps, config: { damping: 14, mass: 0.8 } });
  const pulse = 1 + 0.025 * Math.max(0, Math.sin((t - 36) / 7));
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 38, marginTop: -60 }}>
        <div style={{ opacity: mark, transform: `scale(${0.7 + 0.3 * mark})`, ["--logo-mark" as string]: "var(--post-accent)", ["--logo-mark-glyph" as string]: "var(--post-card)" }}>
          <LogoMark size={110} />
        </div>
        <KineticHeadline lines={[name]} frame={frame} start={beat.startFrame + 2} fontSize={fitFontSize([name], 900, 88)} wordStagger={3} />
        {beat.typography?.headline && (
          <KineticHeadline lines={[beat.typography.headline]} frame={frame} start={beat.startFrame + 8} fontSize={44} font="IBM Plex Sans" weight={500} color="var(--post-muted)" />
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, opacity: priceIn, transform: `translateY(${(1 - priceIn) * 20}px)` }}>
          {compareAt && <span style={{ fontFamily: "IBM Plex Sans", fontSize: 44, color: "var(--post-muted)", textDecoration: "line-through", textDecorationThickness: 3 }}>{compareAt}</span>}
          <span style={{ fontFamily: "Newsreader", fontWeight: 600, fontSize: 96, color: "var(--post-ink)", letterSpacing: "-0.02em" }}>{price}</span>
        </div>
        {beat.cta && (
          <div
            style={{
              transform: `scale(${pillIn * pulse})`,
              opacity: Math.min(1, pillIn * 1.4),
              padding: "26px 54px",
              borderRadius: 999,
              background: "var(--post-accent)",
              color: "var(--post-card)",
              fontFamily: "IBM Plex Sans",
              fontWeight: 600,
              fontSize: 38,
              letterSpacing: "0.01em",
              boxShadow: "0 24px 50px -18px color-mix(in srgb, var(--post-accent) 70%, transparent)",
            }}
          >
            {beat.cta.url}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------- film

export function FeatureSpotlight({ shot }: { shot: Shot }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = themeFor(shot.themeSlug);
  const beats = shot.beats.map((b) => withListing(b, shot.product));
  const last = beats[beats.length - 1];
  const total = last.startFrame + last.durationFrames;
  const cues = soundCues(beats);
  const bed = (f: number) => interpolate(f, [0, 24, total - 36, total], [0, 0.2, 0.2, 0], clamp) * (1 - 0.55 * duck(f, cues));

  return (
    <AbsoluteFill style={{ ...postCssVars(theme) } as React.CSSProperties}>
      <Backdrop frame={frame} />
      <Audio src={staticFile(BED)} volume={bed} />
      {cues.map((c, i) => (
        <Sequence key={`cue-${i}`} from={c.at} layout="none">
          <Audio src={staticFile(SFX_CUES[c.sfx])} volume={c.volume} />
        </Sequence>
      ))}
      {beats.map((beat) => (
        <Sequence key={beat.id} from={beat.startFrame} durationInFrames={beat.durationFrames} layout="none">
          <Edge beat={beat} frame={frame}>
            {beat.kind === "typography" && <ProblemBeat beat={beat} frame={frame} />}
            {beat.kind === "noise" && <NoiseBeat beat={beat} frame={frame} />}
            {beat.kind === "wordmark" && <WordmarkBeat beat={beat} frame={frame} fps={fps} />}
            {beat.kind === "safeToSpendCard" && <SafeToSpendBeat beat={beat} frame={frame} fps={fps} />}
            {beat.kind === "nextActionCard" && <NextActionBeat beat={beat} frame={frame} fps={fps} />}
            {beat.kind === "screen" && <ScreenBeat beat={beat} frame={frame} fps={fps} />}
            {beat.kind === "cta" && <CtaBeat beat={beat} frame={frame} fps={fps} slug={shot.product} />}
          </Edge>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
