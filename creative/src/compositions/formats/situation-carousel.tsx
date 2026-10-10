/**
 * Situation carousel: one slide of a swipeable Instagram / Facebook post
 * planned by director/carousel.ts. Every word arrives with its source; this
 * file only sets it. Calm and editorial on purpose: one idea per slide,
 * generous space, the product's own palette, its real screen, its monogram.
 *
 * The cover is set dark so it stops a scroll; everything after it sits on
 * the product's light ground, like the films' light scenes.
 */
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { LogoMark } from "@/design-system/Logo";
import { ArrowRight, Check } from "@/design-system/Icon";
import { monthlyMoneyResetDemo, SafeToSpendCard, NextActionCard } from "../../ui-adapter/monthlyMoneyReset";
import { themeFor, postCssVars, type ProductTheme } from "../../theme-registry";
import { Backdrop } from "../../visual/Backdrop";
import { isEmphasised } from "../../visual/Kinetic";
import { Phone } from "../../visual/Phone";
import { Illustration, type Palette } from "../../visual/illustrations";
import type { Carousel, Slide } from "../../../director/carousel";

export type CarouselSlideProps = { carousel: Carousel; index: number };

const SERIF = "Newsreader";
const SANS = "IBM Plex Sans";

/** A size for a block of prose by its length: short lines large, long ones smaller, never below what reads on a phone. */
function sizeFor(chars: number, steps: [number, number][], min: number): number {
  for (const [upTo, size] of steps) if (chars <= upTo) return size;
  return min;
}

/** Text with the emphasised words in the accent, italic, as the films set them. Wraps naturally. */
function Rich({ text, emphasis = [], accent = "var(--post-accent)" }: { text: string; emphasis?: string[]; accent?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          {isEmphasised(w, emphasis) ? <span style={{ color: accent, fontStyle: "italic" }}>{w}</span> : w}
        </React.Fragment>
      ))}
    </>
  );
}

/** A slide's spot illustration, in the product's palette. */
function Art({ motif, size, palette, style, solid }: { motif?: string; size: number; palette: Palette; style: React.CSSProperties; solid?: boolean }) {
  if (!motif) return null;
  return <div style={{ position: "absolute", ...style }}><Illustration motif={motif} palette={palette} size={size} ground={solid ? 1 : undefined} /></div>;
}

const paletteOf = (t: ProductTheme): Palette => ({ ink: t.ink, accent: t.accent, soft: t.accentSoft, paper: t.card });

function Eyebrow({ children, color = "var(--post-accent)" }: { children: React.ReactNode; color?: string }) {
  return <p style={{ margin: 0, fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: "0.2em", textTransform: "uppercase", color }}>{children}</p>;
}

/** The product's monogram and name: the only branding on a slide. */
function Brand({ name, dark }: { name: string; dark?: boolean }) {
  return (
    <div style={{ position: "absolute", left: 88, bottom: 64, display: "flex", alignItems: "center", gap: 16, ["--logo-mark" as string]: "var(--post-accent)", ["--logo-mark-glyph" as string]: dark ? "var(--post-ink)" : "var(--post-card)" }}>
      <LogoMark size={44} />
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: dark ? "var(--post-bg)" : "var(--post-ink)", opacity: dark ? 0.85 : 0.9 }}>{name}</span>
    </div>
  );
}

/** Where this slide sits in the carousel, as small dots: no words to read, just how far there is to go. */
function Dots({ index, count, dark }: { index: number; count: number; dark?: boolean }) {
  return (
    <div style={{ position: "absolute", right: 88, bottom: 80, display: "flex", gap: 10 }}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ width: i === index ? 28 : 10, height: 10, borderRadius: 5, background: i === index ? "var(--post-accent)" : dark ? "rgba(255,255,255,0.28)" : "color-mix(in srgb, var(--post-ink) 18%, transparent)" }} />
      ))}
    </div>
  );
}

function Cover({ s, palette }: { s: Extract<Slide, { kind: "cover" }>; palette: Palette }) {
  const size = sizeFor(s.quote.text.length, [[34, 112], [48, 100], [62, 90], [80, 80]], 72);
  const light = "color-mix(in srgb, var(--post-accent) 62%, white)";
  return (
    <AbsoluteFill style={{ background: "var(--post-ink)" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 88% 6%, color-mix(in srgb, var(--post-accent) 42%, transparent) 0%, transparent 52%), radial-gradient(circle at 0% 100%, color-mix(in srgb, var(--post-accent) 18%, transparent) 0%, transparent 46%)" }} />
      {/* The scene: the topic's two pictures, set low so the words own the top of the slide. */}
      <Art motif={s.art?.also} size={300} palette={palette} solid style={{ left: 420, bottom: 140 }} />
      <Art motif={s.art?.motif} size={500} palette={palette} solid style={{ left: 30, bottom: 100 }} />
      <div style={{ position: "absolute", left: 88, right: 88, top: 110 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 200, lineHeight: 0.7, color: light, marginLeft: -8, height: 110 }}>“</div>
        <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 500, fontSize: size, lineHeight: 1.1, letterSpacing: "-0.015em", color: "var(--post-bg)", textWrap: "balance" }}>
          <Rich text={s.quote.text} emphasis={s.emphasis} accent={light} />
        </p>
        <div style={{ width: 72, height: 4, borderRadius: 2, background: light, margin: "44px 0 24px" }} />
        <p style={{ margin: 0, maxWidth: 820, fontFamily: SANS, fontWeight: 500, fontSize: 36, lineHeight: 1.35, color: "var(--post-bg)", opacity: 0.78, textWrap: "balance" }}>{s.promise.text}</p>
      </div>
      <div style={{ position: "absolute", right: 88, bottom: 150, width: 92, height: 92, borderRadius: 46, background: light, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--post-ink)" }}>
        <ArrowRight size={44} />
      </div>
    </AbsoluteFill>
  );
}

function Answer({ s, palette }: { s: Extract<Slide, { kind: "answer" }>; palette: Palette }) {
  const text = s.lines.map((l) => l.text).join(" ");
  const size = sizeFor(text.length, [[110, 82], [170, 72], [230, 64], [300, 56]], 50);
  return (
    <>
    <Art motif={s.art?.motif} size={400} palette={palette} style={{ right: 60, bottom: 150 }} />
    <div style={{ position: "absolute", left: 88, right: 88, top: 170, display: "flex", flexDirection: "column", gap: 40 }}>
      <Eyebrow>{s.eyebrow.text}</Eyebrow>
      <div>
        {s.lines.map((l, i) => (
          <p key={i} style={{ margin: i ? `${size * 0.5}px 0 0` : 0, fontFamily: SERIF, fontWeight: i ? 400 : 500, fontSize: i ? size * 0.82 : size, lineHeight: 1.18, color: i ? "color-mix(in srgb, var(--post-ink) 78%, transparent)" : "var(--post-ink)", textWrap: "pretty" }}>{l.text}</p>
        ))}
      </div>
    </div>
    </>
  );
}

function Step({ s, palette }: { s: Extract<Slide, { kind: "step" }>; palette: Palette }) {
  const head = sizeFor(s.head.text.length, [[36, 96], [70, 80], [110, 68]], 60);
  const bodyText = s.body.map((b) => b.text).join(" ");
  const body = sizeFor(bodyText.length, [[140, 44], [220, 40]], 37);
  const timeline = !s.number && !!s.eyebrow;
  return (
    // Anchored at the same height on every step, so swiping through them the number stays put and only the words change.
    // The illustration sits beside the number, where the slide is otherwise empty.
    <>
    <Art motif={s.art?.motif} size={380} palette={palette} style={{ right: 40, top: 60 }} />
    <div style={{ position: "absolute", left: 88, right: 88, top: 150, bottom: 200, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 48, minHeight: 280 }}>
        {s.number && s.eyebrow && <div style={{ maxWidth: 600 }}><Eyebrow color="color-mix(in srgb, var(--post-ink) 55%, transparent)">{s.eyebrow.text}</Eyebrow></div>}
        {s.number && <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 250, lineHeight: 0.78, color: "var(--post-accent)", letterSpacing: "-0.03em" }}>{s.number.text}</div>}
        {timeline && (
          <span style={{ alignSelf: "flex-start", maxWidth: 560, padding: "14px 28px", borderRadius: 999, background: "var(--post-accent)", color: "var(--post-card)", fontFamily: SANS, fontWeight: 600, fontSize: 30 }}>{s.eyebrow!.text}</span>
        )}
      </div>
      <div style={{ marginTop: 52 }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: head, lineHeight: 1.1, letterSpacing: "-0.015em", color: "var(--post-ink)", textWrap: "balance" }}>
          <Rich text={s.head.text} emphasis={s.emphasis} />
        </p>
        {s.body.length > 0 && (
          <p style={{ margin: "40px 0 0", maxWidth: 880, fontFamily: SANS, fontWeight: 400, fontSize: body, lineHeight: 1.48, color: "color-mix(in srgb, var(--post-ink) 74%, transparent)", textWrap: "pretty" }}>{bodyText}</p>
        )}
      </div>
    </div>
    </>
  );
}

function Checklist({ s, palette }: { s: Extract<Slide, { kind: "checklist" }>; palette: Palette }) {
  const longest = Math.max(...s.items.map((i) => i.text.length));
  const size = s.items.length > 5 || longest > 80 ? 32 : 36;
  return (
    <>
    <Art motif={s.art?.motif} size={260} palette={palette} style={{ right: 50, top: 50 }} />
    <div style={{ position: "absolute", left: 88, right: 88, top: 120, bottom: 180, display: "flex", flexDirection: "column", justifyContent: "center", gap: 44 }}>
      {s.eyebrow && <p style={{ margin: 0, maxWidth: 640, fontFamily: SERIF, fontWeight: 600, fontSize: s.eyebrow.text.length > 32 ? 56 : 66, lineHeight: 1.08, letterSpacing: "-0.015em", color: "var(--post-ink)", textWrap: "balance" }}>{s.eyebrow.text}</p>}
      <div style={{ borderRadius: 32, background: "var(--post-card)", boxShadow: "0 30px 60px -36px rgba(16,20,24,0.35), 0 0 0 1px var(--post-line)", padding: "12px 40px" }}>
        {s.items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 26, alignItems: "flex-start", padding: "26px 0", borderTop: i ? "1px solid var(--post-line)" : "none" }}>
            {s.ticks ? (
              <span style={{ flexShrink: 0, marginTop: size * 0.12, width: size * 1.1, height: size * 1.1, borderRadius: size, background: "var(--post-accent)", color: "var(--post-card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={size * 0.68} />
              </span>
            ) : (
              <span style={{ flexShrink: 0, marginTop: size * 0.5, width: 12, height: 12, borderRadius: 6, background: "var(--post-accent)" }} />
            )}
            <p style={{ margin: 0, fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: 1.38, color: "var(--post-ink)", textWrap: "pretty" }}>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

function Help({ s }: { s: Extract<Slide, { kind: "help" }> }) {
  const line = sizeFor(s.line.text.length, [[90, 44], [140, 40]], 37);
  const demo = s.ui.kind === "live" ? monthlyMoneyResetDemo() : null;
  return (
    <>
      <div style={{ position: "absolute", left: 88, right: 88, top: 110 }}>
        <Eyebrow>{s.eyebrow.text}</Eyebrow>
        <p style={{ margin: "22px 0 0", fontFamily: SERIF, fontWeight: 600, fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--post-ink)" }}>{s.name.text}</p>
        <p style={{ margin: "28px 0 0", maxWidth: 880, fontFamily: SANS, fontWeight: 400, fontSize: line, lineHeight: 1.45, color: "color-mix(in srgb, var(--post-ink) 80%, transparent)", textWrap: "pretty" }}>{s.line.text}</p>
      </div>
      {s.ui.kind === "screen" ? (
        <div style={{ position: "absolute", left: "50%", top: 560, transform: "translateX(-50%)" }}>
          <Phone src={s.ui.src} width={560} rotateX={10} />
        </div>
      ) : (
        <div style={{ position: "absolute", left: 88, right: 88, top: 560, display: "flex", justifyContent: "center" }}>
          <div style={{ ...(demo!.themeStyle as React.CSSProperties), width: s.ui.live === "nextActionCard" ? 620 : 800, transform: s.ui.live === "nextActionCard" ? "scale(1.3)" : undefined, transformOrigin: "50% 0", filter: "drop-shadow(0 40px 60px rgba(16,20,24,0.28))" }}>
            {s.ui.live === "nextActionCard"
              ? <NextActionCard nextAction={demo!.nextAction} checkInDay={demo!.state.preferences.checkInDay} onDismiss={() => {}} onAct={() => {}} />
              : <SafeToSpendCard breakdown={demo!.breakdown} currency={demo!.state.currency} updatedAt={demo!.now} weeksRemaining={demo!.weeksRemaining} tightestDay={demo!.tightestDay} />}
          </div>
        </div>
      )}
    </>
  );
}

function Close({ s, palette }: { s: Extract<Slide, { kind: "close" }>; palette: Palette }) {
  const title = sizeFor(s.title.text.length, [[40, 76], [64, 66]], 58);
  return (
    <div style={{ position: "absolute", left: 88, right: 88, top: 0, bottom: 160, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 0 }}>
      {s.art && <div style={{ marginBottom: 36 }}><Illustration motif={s.art.motif} palette={palette} size={320} /></div>}
      <Eyebrow>{s.eyebrow.text}</Eyebrow>
      <p style={{ margin: "30px 0 0", fontFamily: SERIF, fontWeight: 600, fontSize: title, lineHeight: 1.08, letterSpacing: "-0.015em", color: "var(--post-ink)", textWrap: "balance" }}>{s.title.text}</p>
      <p style={{ margin: "30px 0 0", maxWidth: 820, fontFamily: SANS, fontWeight: 500, fontSize: 27, lineHeight: 1.4, color: "color-mix(in srgb, var(--post-ink) 60%, transparent)", overflowWrap: "anywhere" }}>{s.url.text}</p>
      <span style={{ marginTop: 56, padding: "22px 44px", borderRadius: 999, background: "var(--post-accent)", color: "var(--post-card)", fontFamily: SANS, fontWeight: 600, fontSize: 32 }}>{s.link.text}</span>
      <p style={{ margin: "40px 0 0", fontFamily: SERIF, fontWeight: 500, fontStyle: "italic", fontSize: 38, color: "var(--post-ink)" }}>{s.save.text}</p>
    </div>
  );
}

export function SituationCarouselSlide({ carousel, index }: CarouselSlideProps) {
  const { width } = useVideoConfig();
  const theme = themeFor(carousel.product);
  const s = carousel.slides[index];
  const name = carousel.slides.find((x): x is Extract<Slide, { kind: "help" }> => x.kind === "help")!.name.text;
  const dark = s.kind === "cover";
  const palette = paletteOf(theme);
  return (
    <AbsoluteFill style={{ ...postCssVars(theme), transform: `scale(${width / 1080})`, transformOrigin: "0 0", width: 1080, height: 1350 } as React.CSSProperties}>
      {s.kind === "cover" ? <Cover s={s} palette={palette} /> : <Backdrop frame={0} motion={0} />}
      {s.kind === "answer" && <Answer s={s} palette={palette} />}
      {s.kind === "step" && <Step s={s} palette={palette} />}
      {s.kind === "checklist" && <Checklist s={s} palette={palette} />}
      {s.kind === "help" && <Help s={s} />}
      {s.kind === "close" && <Close s={s} palette={palette} />}
      {/* The help slide's phone runs off the bottom edge; the brand sits on a soft fade so it stays readable over it. */}
      {s.kind === "help" && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "linear-gradient(to top, var(--post-bg) 42%, transparent)" }} />}
      <Brand name={name} dark={dark} />
      <Dots index={index} count={carousel.slides.length} dark={dark} />
    </AbsoluteFill>
  );
}
