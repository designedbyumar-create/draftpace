/**
 * Film: renders any script the director writes (director/film.ts). There
 * is no fixed sequence here, only building blocks; the script decides
 * which scenes, in what order, on what ground, entering how, with what
 * camera and sound. Two films share this file the way two films share a
 * camera, not the way two ads share a template.
 *
 * Real UI only, as everywhere in this engine: phone scenes show real
 * captures, live scenes mount the real components, and every word comes
 * from the script, whose words are guarded against the real listing.
 */
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig, staticFile, Easing } from "remotion";
import { LogoMark } from "@/design-system/Logo";
import type { Film, Scene } from "../../../director/film";
import { PLATFORMS } from "../../../director/platforms";
import { SFX_CUES } from "../../motion/sound-cues";
import { edgeStyle } from "../../motion/transitions";
import { countUpValue } from "../../motion/ui";
import { themeFor, postCssVars } from "../../theme-registry";
import { productLine } from "../../shop-listings";
import { Backdrop, Grain } from "../../visual/Backdrop";
import { KineticHeadline, fitFontSize } from "../../visual/Kinetic";
import { Phone, screenSize, type Focus } from "../../visual/Phone";
import { monthlyMoneyResetDemo, SafeToSpendCard, NextActionCard, formatCurrency } from "../../ui-adapter/monthlyMoneyReset";

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const IN = Easing.bezier(0.7, 0, 0.84, 0);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Box = { W: number; H: number; safe: { top: number; bottom: number; left: number; right: number } };
type Ctx = { film: Film; box: Box; frame: number; fps: number };

// ------------------------------------------------------------------ grounds

/** Each ground re-colours everything on it through the same few variables, so no scene hardcodes a colour. */
function groundVars(ground: Scene["ground"]): React.CSSProperties {
  switch (ground) {
    case "accent":
      return { "--fg": "var(--film-card)", "--fg-muted": "color-mix(in srgb, var(--film-card) 75%, transparent)", "--hl": "var(--film-accent-soft)", "--on-hl": "var(--film-accent)", "--chip": "color-mix(in srgb, var(--film-card) 14%, transparent)" } as React.CSSProperties;
    case "ink":
      return { "--fg": "var(--film-bg)", "--fg-muted": "color-mix(in srgb, var(--film-bg) 70%, transparent)", "--hl": "var(--film-accent-soft)", "--on-hl": "var(--film-ink)", "--chip": "color-mix(in srgb, var(--film-bg) 10%, transparent)" } as React.CSSProperties;
    default:
      return { "--fg": "var(--film-ink)", "--fg-muted": "var(--film-muted)", "--hl": "var(--film-accent)", "--on-hl": "var(--film-card)", "--chip": "var(--film-card)" } as React.CSSProperties;
  }
}

function Ground({ ground, frame }: { ground: Scene["ground"]; frame: number }) {
  if (ground === "light") return <Backdrop frame={frame} />;
  const bg = ground === "accent" ? "var(--film-accent)" : "var(--film-ink)";
  return (
    <AbsoluteFill style={{ background: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.10), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(0,0,0,0.18), transparent 55%)" }} />
      <Grain seed={Math.floor(frame / 2)} opacity={0.08} />
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------ transitions (in)

function enterStyle(kind: Scene["transition"], p: number, W: number): React.CSSProperties {
  const e = EXPO(p);
  switch (kind) {
    case "cut": return {};
    case "slideLeft": return { transform: `translateX(${(1 - e) * W}px)` };
    case "whip": return { transform: `translateX(${(1 - e) * W * 1.1}px) skewX(${(1 - e) * -8}deg)`, filter: `blur(${(1 - e) * 26}px)` };
    case "iris": return { clipPath: `circle(${e * 120}% at 50% 48%)` };
    case "pageTurn": return { transformOrigin: "left center", transform: `perspective(2200px) rotateY(${(1 - e) * 88}deg)`, boxShadow: `${-40 * (1 - e)}px 0 80px rgba(0,0,0,${0.35 * (1 - e)})` };
    case "lineWipe": return { clipPath: `inset(0 0 ${(1 - e) * 100}% 0)` };
    case "radial": {
      const m = `conic-gradient(from -90deg at 50% 55%, #000 ${e * 360}deg, transparent ${e * 360 + 0.5}deg)`;
      return { WebkitMaskImage: m, maskImage: m };
    }
    case "cardSlide": return { transform: `translateY(${(1 - e) * 110}%) rotate(${(1 - e) * 5}deg)`, boxShadow: `0 -30px 80px rgba(0,0,0,${0.25 * (1 - e)})` };
    default: return edgeStyle(kind, "in", p);
  }
}

/** The ruled edge a lineWipe leaves as it writes the next scene in. */
function WipeEdge({ kind, p }: { kind: Scene["transition"]; p: number }) {
  if (kind !== "lineWipe" || p >= 1) return null;
  return <div style={{ position: "absolute", left: 0, right: 0, top: `${EXPO(p) * 100}%`, height: 3, background: "var(--film-accent)", opacity: 1 - p }} />;
}

// ------------------------------------------------------------------ motif layer

/** The product's own identity motif, drawn as a quiet graphic layer over the ground. */
function Motif({ film, ctx, index }: { film: Film; ctx: Ctx; index: number }) {
  const { W, H, safe } = ctx.box;
  const progress = ctx.frame / film.durationInFrames;
  const col = "var(--fg-muted)";
  switch (film.treatment.motif) {
    case "timeline":
      return (
        <div style={{ position: "absolute", left: safe.left, right: safe.right, top: safe.top - 70, height: 4, background: "color-mix(in srgb, var(--fg) 15%, transparent)", borderRadius: 2 }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", background: "var(--hl)", borderRadius: 2 }} />
          {film.scenes.map((s, i) => (
            <div key={i} style={{ position: "absolute", left: `${(s.from / film.durationInFrames) * 100}%`, top: -6, width: 16, height: 16, marginLeft: -8, borderRadius: 8, background: i <= index ? "var(--hl)" : "var(--chip)", boxShadow: "0 0 0 2px color-mix(in srgb, var(--fg) 20%, transparent)" }} />
          ))}
        </div>
      );
    case "ledger":
      return (
        <AbsoluteFill style={{ opacity: 0.18, backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 63px, ${col} 63px, ${col} 64px)`, backgroundPosition: `0 ${-ctx.frame * 0.4}px` }} />
      );
    case "gauge": {
      const r = 70, len = Math.PI * r;
      return (
        <svg width={180} height={110} style={{ position: "absolute", left: safe.left, top: safe.top - 40, opacity: 0.85 }}>
          <path d={`M 20 95 A ${r} ${r} 0 0 1 160 95`} fill="none" stroke="color-mix(in srgb, var(--fg) 18%, transparent)" strokeWidth={10} strokeLinecap="round" />
          <path d={`M 20 95 A ${r} ${r} 0 0 1 160 95`} fill="none" stroke="var(--hl)" strokeWidth={10} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - progress)} />
        </svg>
      );
    }
    case "index":
      // File tabs along the top edge, the current scene's raised.
      return (
        <div style={{ position: "absolute", left: safe.left, right: safe.right, top: 0, display: "flex", gap: 12 }}>
          {film.scenes.map((_, i) => (
            <div key={i} style={{ flex: 1, height: i === index ? 26 : 14, borderRadius: "0 0 10px 10px", background: i === index ? "var(--hl)" : "color-mix(in srgb, var(--fg) 14%, transparent)" }} />
          ))}
        </div>
      );
    case "book":
      return <div style={{ position: "absolute", left: 34, top: 0, bottom: 0, width: 10, background: "linear-gradient(to right, color-mix(in srgb, var(--fg) 20%, transparent), transparent)", boxShadow: "16px 0 0 -14px color-mix(in srgb, var(--fg) 25%, transparent)" }} />;
    case "focus":
      return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, transparent ${30 + 8 * Math.sin(ctx.frame / 40)}%, rgba(0,0,0,0.10) 80%)` }} />;
    case "register":
      return <div style={{ position: "absolute", left: safe.left, right: safe.right, top: safe.top - 60, height: 2, background: "color-mix(in srgb, var(--fg) 25%, transparent)" }} />;
    default:
      return null;
  }
  void W;
}

// ------------------------------------------------------------------ text pieces

function Eyebrow({ text, at, frame, align = "center" }: { text: string; at: number; frame: number; align?: "center" | "left" }) {
  const p = interpolate(frame, [at, at + 16], [0, 1], { ...clamp, easing: EXPO });
  const isNumber = /^\d+$/.test(text);
  return (
    <p style={{ margin: 0, textAlign: align, opacity: p, transform: `translateY(${(1 - p) * 16}px)`, fontFamily: isNumber ? "Newsreader" : "IBM Plex Sans", fontWeight: isNumber ? 600 : 700, fontSize: isNumber ? 120 : 30, letterSpacing: isNumber ? "-0.02em" : "0.18em", textTransform: isNumber ? "none" : "uppercase", color: "var(--hl)", lineHeight: 1 }}>
      {text}
    </p>
  );
}

function Caption({ text, frame, at, ctx, native }: { text: string; frame: number; at: number; ctx: Ctx; native: boolean }) {
  const p = interpolate(frame, [at, at + 18], [0, 1], { ...clamp, easing: EXPO });
  const { safe, H } = ctx.box;
  const size = text.length > 90 ? 32 : text.length > 50 ? 36 : 42;
  return (
    <div style={{ position: "absolute", left: safe.left, right: safe.right, top: H - safe.bottom - (text.length > 90 ? 230 : 180), display: "flex", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>
      {native ? (
        <p style={{ margin: 0, textAlign: "center", fontFamily: "IBM Plex Sans", fontWeight: 700, fontSize: size + 4, lineHeight: 1.25, color: "#111", textWrap: "balance" }}>
          <span style={{ background: "#fff", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "4px 14px", borderRadius: 10 }}>{text}</span>
        </p>
      ) : (
        <div style={{ display: "flex", gap: 20, maxWidth: 900, padding: "24px 32px 24px 24px", borderRadius: 26, background: "color-mix(in srgb, var(--film-card) 92%, transparent)", backdropFilter: "blur(14px)", boxShadow: "0 24px 60px -24px rgba(16,20,24,0.4), 0 0 0 1px var(--film-line)" }}>
          <div style={{ width: 6, borderRadius: 3, background: "var(--film-accent)", flexShrink: 0 }} />
          <p style={{ margin: 0, fontFamily: "IBM Plex Sans", fontWeight: 500, fontSize: size, lineHeight: 1.3, color: "var(--film-ink)", textWrap: "balance" }}>{text}</p>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ camera

function cameraTransform(film: Film, s: Scene, frame: number): string {
  const t = (frame - s.from) / s.dur;
  switch (film.treatment.camera) {
    case "locked": return "none";
    case "dolly": return `scale(${1 + 0.06 * t})`;
    default: return `scale(${1 + 0.025 * t}) translateY(${Math.sin(t * Math.PI) * -8}px)`;
  }
}

// ------------------------------------------------------------------ scenes

function TitleScene({ s, ctx }: { s: Scene; ctx: Ctx }) {
  const { frame } = ctx;
  const { W, safe } = ctx.box;
  const lines = s.lines?.[0] ?? [s.copy[0].text];
  const width = W - safe.left - safe.right - 40;
  if (s.variant === "native") {
    const size = fitFontSize(lines, width, 118, "IBM Plex Sans");
    return (
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: safe.left + 10, paddingRight: safe.right }}>
        {s.eyebrow && <Eyebrow text={s.eyebrow.text} at={s.from} frame={frame} align="left" />}
        <KineticHeadline lines={lines} emphasis={s.emphasis} frame={frame} start={s.from + 2} fontSize={size} align="left" font="IBM Plex Sans" weight={700} wordStagger={2} lineStagger={3} />
      </AbsoluteFill>
    );
  }
  if (s.variant === "quote") {
    // The searched phrase types itself out, the way it was typed into a search box.
    const text = s.copy[0].text;
    const shown = Math.floor(interpolate(frame, [s.from + 6, s.from + 6 + text.length * 1.4], [0, text.length], clamp));
    const size = fitFontSize(breakLinesForQuote(text), width, 92);
    const caret = Math.floor(frame / 15) % 2 === 0 && shown < text.length;
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: `0 ${safe.right}px 0 ${safe.left}px` }}>
        <div style={{ fontFamily: "Newsreader", fontSize: size * 2.4, lineHeight: 0.6, color: "var(--hl)", alignSelf: "flex-start", marginLeft: 20 }}>“</div>
        <p style={{ margin: 0, fontFamily: "Newsreader", fontStyle: "italic", fontWeight: 500, fontSize: size, lineHeight: 1.18, color: "var(--fg)", textAlign: "center", textWrap: "balance", maxWidth: width }}>
          {text.slice(0, shown)}
          <span style={{ opacity: 0 }}>{text.slice(shown)}</span>
          {caret && <span style={{ display: "inline-block", width: 4, height: size, marginLeft: 4, background: "var(--hl)", verticalAlign: "text-bottom" }} />}
        </p>
      </AbsoluteFill>
    );
  }
  if (s.variant === "label") {
    const size = fitFontSize(lines, width, 96);
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 28, padding: `0 ${safe.right}px 0 ${safe.left}px` }}>
        {s.eyebrow && <Eyebrow text={s.eyebrow.text} at={s.from} frame={frame} />}
        <KineticHeadline lines={lines} emphasis={s.emphasis} frame={frame} start={s.from + 6} fontSize={size} wordStagger={3} />
      </AbsoluteFill>
    );
  }
  const size = fitFontSize(lines, width, 112);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 24, padding: `0 ${safe.right}px 0 ${safe.left}px` }}>
      {s.eyebrow && <Eyebrow text={s.eyebrow.text} at={s.from} frame={frame} />}
      <KineticHeadline lines={lines} emphasis={s.emphasis} frame={frame} start={s.from + 4} fontSize={size} />
    </AbsoluteFill>
  );
}

function breakLinesForQuote(text: string): string[] {
  const words = text.split(" ");
  const per = Math.ceil(words.length / Math.max(1, Math.ceil(text.length / 22)));
  const out: string[] = [];
  for (let i = 0; i < words.length; i += per) out.push(words.slice(i, i + per).join(" "));
  return out;
}

function ListScene({ s, ctx }: { s: Scene; ctx: Ctx }) {
  const { frame } = ctx;
  const { safe, W } = ctx.box;
  const n = s.copy.length;
  const step = Math.max(14, Math.floor((s.dur - 30) / (n + 0.5)));
  const motif = ctx.film.treatment.motif;
  const longest = Math.max(...s.copy.map((x) => x.text.length));
  const size = longest > 90 ? 44 : longest > 60 ? 52 : longest > 30 ? 62 : 78;
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${safe.right + 10}px 0 ${safe.left + 10}px`, gap: 34 }}>
      {s.eyebrow && <Eyebrow text={s.eyebrow.text} at={s.from} frame={frame} align="left" />}
      {s.copy.map((item, i) => {
        const at = s.from + 10 + i * step;
        const p = interpolate(frame, [at, at + 18], [0, 1], { ...clamp, easing: EXPO });
        const tick = interpolate(frame, [at + 10, at + 22], [0, 1], clamp);
        return (
          <div key={i} style={{ display: "flex", gap: 26, alignItems: "flex-start", opacity: p, transform: `translateX(${(1 - p) * 40}px)`, maxWidth: W - safe.left - safe.right - 20 }}>
            <div style={{ flexShrink: 0, marginTop: size * 0.18, width: size * 0.9, height: size * 0.9, borderRadius: motif === "register" ? 8 : motif === "tag" ? "6px 50% 50% 6px" : size, border: "3px solid var(--hl)", display: "flex", alignItems: "center", justifyContent: "center", background: motif === "register" ? "transparent" : "var(--hl)" }}>
              {motif === "register" ? (
                <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6}><path d="M4 12.5l5 5L20 6.5" fill="none" stroke="var(--hl)" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} /></svg>
              ) : (
                <span style={{ fontFamily: "IBM Plex Sans", fontWeight: 700, fontSize: size * 0.48, color: "var(--on-hl)" }}>{i + 1}</span>
              )}
            </div>
            <p style={{ margin: 0, fontFamily: "IBM Plex Sans", fontWeight: 500, fontSize: size, lineHeight: 1.28, color: "var(--fg)", textWrap: "pretty" }}>{item.text}</p>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function ContrastScene({ s, ctx }: { s: Scene; ctx: Ctx }) {
  const { frame } = ctx;
  const { safe } = ctx.box;
  if (s.variant === "noise") {
    const layers = [
      { x: -120, y: -300, size: 56, blur: 0, speed: 1.0, rot: -3 },
      { x: 100, y: -20, size: 64, blur: 0, speed: 1.4, rot: 2 },
      { x: -60, y: 260, size: 50, blur: 1.4, speed: 0.7, rot: -1.5 },
    ];
    const t = frame - s.from;
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {s.copy.map((line, i) => {
          const L = layers[i % layers.length];
          const p = interpolate(t, [6 + i * 10, 24 + i * 10], [0, 1], { ...clamp, easing: EXPO });
          return (
            <p key={i} style={{ position: "absolute", margin: 0, maxWidth: 820, textAlign: "center", opacity: p * (L.blur ? 0.6 : 0.9), transform: `translate(${L.x}px, ${L.y - t * L.speed + (1 - p) * 40}px) rotate(${L.rot}deg)`, filter: `blur(${L.blur + (1 - p) * 8}px)`, fontFamily: "Newsreader", fontStyle: "italic", fontWeight: 500, fontSize: L.size, lineHeight: 1.15, color: "var(--fg-muted)" }}>
              {line.text}
            </p>
          );
        })}
      </AbsoluteFill>
    );
  }
  // strike: each boundary appears, then a line is drawn through it and it steps back.
  const n = s.copy.length;
  const step = Math.floor((s.dur - 20) / (n + 0.4));
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${safe.right + 10}px 0 ${safe.left + 10}px`, gap: 40 }}>
      {s.eyebrow && <Eyebrow text={s.eyebrow.text} at={s.from} frame={frame} align="left" />}
      {s.copy.map((item, i) => {
        const at = s.from + 8 + i * step;
        const p = interpolate(frame, [at, at + 16], [0, 1], { ...clamp, easing: EXPO });
        const strike = interpolate(frame, [at + step * 0.55, at + step * 0.55 + 14], [0, 1], { ...clamp, easing: EXPO });
        return (
          <div key={i} style={{ position: "relative", opacity: p * (1 - strike * 0.45), transform: `translateY(${(1 - p) * 30}px)` }}>
            <p style={{ margin: 0, fontFamily: "Newsreader", fontWeight: 500, fontSize: item.text.length > 60 ? 60 : 76, lineHeight: 1.15, color: "var(--fg)", textWrap: "balance" }}>{item.text}</p>
            <div style={{ position: "absolute", left: -6, top: "52%", height: 6, width: `${strike * 104}%`, background: "var(--hl)", borderRadius: 3 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function phoneWidth(box: Box): number {
  const { W, H, safe } = box;
  return Math.min(W * 0.52, (H - safe.top - safe.bottom - 200) / 2.25);
}

function PhoneScene({ s, ctx }: { s: Scene; ctx: Ctx }) {
  const { frame, fps } = ctx;
  const { W, H, safe } = ctx.box;
  const sc = s.screen!;
  const t = (frame - s.from) / s.dur;
  const enter = spring({ frame: frame - s.from - 2, fps, config: { damping: 19, mass: 0.9, stiffness: 95 } });
  const width = phoneWidth(ctx.box) * (sc.pose === "pair" ? 0.82 : 1);
  const size = screenSize(sc.src);
  const pageH = size.height * (390 / size.width);
  const f = sc.focus;
  const fAmt = f ? interpolate(t, [f.at, f.at + 0.12], [0, 1], { ...clamp, easing: EXPO }) : 0;
  const focus: Focus | undefined = f ? { top: f.y / pageH, height: f.h / pageH, amount: fAmt } : undefined;
  // Scroll the real page so the focus region is in view by the time it lights up.
  const overflow = Math.max(0, pageH - 844);
  const target = f && overflow > 0 ? Math.min(1, Math.max(0, (f.y + f.h / 2 - 422) / overflow)) : 0;
  const keys = sc.scroll && sc.scroll.length ? sc.scroll : f ? [[0, 0], [Math.max(0.05, f.at - 0.2), 0], [f.at, target]] as [number, number][] : [];
  const scroll = keys.length ? interpolate(t, keys.map((k) => k[0]), keys.map((k) => k[1]), { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
  const poses = { float: [-7, 6, 0], tiltLeft: [-18, 8, -3], tiltRight: [16, 8, 3], flat: [0, 0, 0], pair: [-14, 6, -2] } as const;
  const [ry, rx, rz] = poses[sc.pose];
  const settle = 1 - enter;
  const zoom = 1 + 0.12 * fAmt;
  const top = sc.pose === "flat" ? safe.top + 20 : (H - width * 2.23 * (sc.pose === "pair" ? 1.1 : 1)) / 2 - (sc.pose === "pair" ? 0 : 60);
  const native = ctx.film.treatment.voice === "native";
  return (
    <AbsoluteFill>
      {s.eyebrow && (
        <div style={{ position: "absolute", left: safe.left, right: safe.right, top: safe.top - 10 }}>
          <Eyebrow text={s.eyebrow.text} at={s.from} frame={frame} align={/^\d+$/.test(s.eyebrow.text) ? "left" : "center"} />
        </div>
      )}
      <div style={{ position: "absolute", left: (W - width) / 2 + (sc.pose === "pair" ? -width * 0.5 : 0), top: Math.max(safe.top, top) + (s.eyebrow ? 60 : 0), transform: `translateY(${settle * 900}px) scale(${zoom})`, transformOrigin: "50% 40%" }}>
        <Phone src={sc.src} width={width} scroll={scroll} rotateY={(ry - settle * 20) * (1 - fAmt * 0.8)} rotateX={(rx + settle * 22) * (1 - fAmt * 0.8)} rotateZ={rz - settle * 4} focus={focus} shadow={0.6 + 0.4 * enter} />
      </div>
      {sc.pose === "pair" && sc.also && (
        <div style={{ position: "absolute", left: (W - width) / 2 + width * 0.5, top: Math.max(safe.top, top) + width * 0.18, transform: `translateY(${(1 - spring({ frame: frame - s.from - 8, fps, config: { damping: 19, mass: 0.9 } })) * 900}px)` }}>
          <Phone src={sc.also} width={width} rotateY={14} rotateX={6} rotateZ={2} shadow={0.8} />
        </div>
      )}
      {s.caption && <Caption text={s.caption.text} frame={frame} at={s.from + Math.round(s.dur * 0.22)} ctx={ctx} native={native} />}
    </AbsoluteFill>
  );
}

function LiveScene({ s, ctx }: { s: Scene; ctx: Ctx }) {
  const { frame, fps } = ctx;
  const { W } = ctx.box;
  const demo = monthlyMoneyResetDemo();
  const enter = spring({ frame: frame - s.from - 18, fps, config: { damping: 19, mass: 0.9 } });
  const countEnd = s.from + 30;
  const hand = interpolate(frame, [countEnd - 4, countEnd + 10], [0, 1], { ...clamp, easing: EXPO });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", ...(demo.themeStyle as React.CSSProperties) }}>
      {hand < 1 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - hand }}>
          <span style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: 200, letterSpacing: "-0.05em", color: "var(--fg)", fontFeatureSettings: "'tnum' 1" }}>
            {formatCurrency(countUpValue({ frame, start: s.from, durationInFrames: 30, from: 0, to: demo.breakdown.safeToSpend }), demo.state.currency)}
          </span>
        </AbsoluteFill>
      )}
      <div style={{ width: Math.min(720, W * 0.7), opacity: enter, transform: `translateY(${(1 - enter) * 600 - 80}px) perspective(2000px) rotateX(${(1 - enter) * 20}deg)`, filter: "drop-shadow(0 50px 70px rgba(16,20,24,0.3))" }}>
        {s.live === "nextActionCard"
          ? <NextActionCard nextAction={demo.nextAction} checkInDay={demo.state.preferences.checkInDay} onDismiss={() => {}} onAct={() => {}} />
          : <SafeToSpendCard breakdown={demo.breakdown} currency={demo.state.currency} updatedAt={demo.now} weeksRemaining={demo.weeksRemaining} tightestDay={demo.tightestDay} />}
      </div>
      {s.caption && <Caption text={s.caption.text} frame={frame} at={s.from + Math.round(s.dur * 0.4)} ctx={ctx} native={ctx.film.treatment.voice === "native"} />}
    </AbsoluteFill>
  );
}

function BrandScene({ s, ctx }: { s: Scene; ctx: Ctx }) {
  const { frame, fps } = ctx;
  const { W, safe } = ctx.box;
  const t = frame - s.from;
  const mark = spring({ frame: t, fps, config: { damping: 13, mass: 0.7, stiffness: 110 } });
  const name = s.copy[0].text;
  const logoVars = { "--logo-mark": "var(--hl)", "--logo-mark-glyph": "var(--on-hl)" } as React.CSSProperties;
  if (s.variant === "lockup") {
    const size = fitFontSize([name], W - safe.left - safe.right - 200, 92);
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, maxWidth: W - safe.left - safe.right }}>
          <div style={{ ...logoVars, transform: `translateX(${(1 - mark) * -80}px) rotate(${(1 - mark) * -20}deg)`, opacity: mark }}><LogoMark size={size * 1.3} /></div>
          <KineticHeadline lines={[name]} frame={frame} start={s.from + 6} fontSize={size} align="left" />
        </div>
      </AbsoluteFill>
    );
  }
  const bloom = interpolate(t, [0, 6, 40], [0, 0.8, 0.3], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--fg) 18%, transparent) 0%, transparent 62%)", opacity: bloom }} />
      <div style={{ ...logoVars, transform: `scale(${0.55 + 0.45 * mark}) rotate(${(1 - mark) * -12}deg)`, opacity: Math.min(1, mark * 1.5), filter: "drop-shadow(0 30px 50px rgba(16,20,24,0.25))" }}><LogoMark size={160} /></div>
      <KineticHeadline lines={s.lines?.[0] ?? [name]} frame={frame} start={s.from + 8} fontSize={fitFontSize(s.lines?.[0] ?? [name], W - safe.left - safe.right, 100)} wordStagger={4} />
    </AbsoluteFill>
  );
}

function CtaScene({ s, ctx }: { s: Scene; ctx: Ctx }) {
  const { frame, fps } = ctx;
  const { W, safe } = ctx.box;
  const t = frame - s.from;
  const { name, price, compareAt } = productLine(ctx.film.product);
  const line = s.copy[1]?.text;
  const pill = spring({ frame: t - 16, fps, config: { damping: 14, mass: 0.8 } });
  const priceIn = interpolate(t, [10, 28], [0, 1], { ...clamp, easing: EXPO });
  const url = s.variant === "free" ? "draftpace.com/free" : "draftpace.com/shop";
  const logoVars = { "--logo-mark": "var(--hl)", "--logo-mark-glyph": "var(--on-hl)" } as React.CSSProperties;
  const showPrice = s.variant === "price";
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34, padding: `0 ${safe.right}px 0 ${safe.left}px` }}>
      <div style={{ ...logoVars, opacity: Math.min(1, t / 10) }}><LogoMark size={96} /></div>
      <KineticHeadline lines={[name]} frame={frame} start={s.from + 2} fontSize={fitFontSize([name], W - safe.left - safe.right, 84)} />
      {line && <KineticHeadline lines={[line]} frame={frame} start={s.from + 8} fontSize={42} font="IBM Plex Sans" weight={500} color="var(--fg-muted)" />}
      {showPrice && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 22, opacity: priceIn, transform: `translateY(${(1 - priceIn) * 20}px)` }}>
          {compareAt && <span style={{ fontFamily: "IBM Plex Sans", fontSize: 44, color: "var(--fg-muted)", textDecoration: "line-through", textDecorationThickness: 3 }}>{compareAt}</span>}
          <span style={{ fontFamily: "Newsreader", fontWeight: 600, fontSize: 104, color: "var(--fg)", letterSpacing: "-0.02em" }}>{price}</span>
        </div>
      )}
      <div style={{ transform: `scale(${pill * (1 + 0.02 * Math.max(0, Math.sin((t - 30) / 7)))})`, opacity: Math.min(1, pill * 1.4), padding: "24px 52px", borderRadius: 999, background: "var(--hl)", color: "var(--on-hl)", fontFamily: "IBM Plex Sans", fontWeight: 600, fontSize: 38 }}>
        {url}
      </div>
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------------ film

function SceneView({ s, i, ctx }: { s: Scene; i: number; ctx: Ctx }) {
  const { frame } = ctx;
  const T = ctx.film.treatment.voice === "native" ? 6 : 12;
  const p = interpolate(frame, [s.from, s.from + T], [0, 1], clamp);
  const enter = i === 0 ? {} : enterStyle(s.transition, p, ctx.box.W);
  // A looping placement fades its last frames into the first scene's ground, so the loop has no seam.
  const last = i === ctx.film.scenes.length - 1 && PLATFORMS[ctx.film.platform].loops;
  const out = last ? interpolate(frame, [s.from + s.dur - 10, s.from + s.dur], [1, 0], clamp) : 1;
  const content = (() => {
    switch (s.kind) {
      case "title": return <TitleScene s={s} ctx={ctx} />;
      case "list": return <ListScene s={s} ctx={ctx} />;
      case "contrast": return <ContrastScene s={s} ctx={ctx} />;
      case "phone": return <PhoneScene s={s} ctx={ctx} />;
      case "live": return <LiveScene s={s} ctx={ctx} />;
      case "brand": return <BrandScene s={s} ctx={ctx} />;
      case "cta": return <CtaScene s={s} ctx={ctx} />;
    }
  })();
  return (
    <AbsoluteFill style={{ ...groundVars(s.ground), ...enter, overflow: "hidden" }}>
      <Ground ground={s.ground} frame={frame} />
      <Motif film={ctx.film} ctx={ctx} index={i} />
      <AbsoluteFill style={{ transform: cameraTransform(ctx.film, s, frame), opacity: out }}>{content}</AbsoluteFill>
      <WipeEdge kind={s.transition} p={p} />
    </AbsoluteFill>
  );
}

export function FilmComposition({ film }: { film: Film }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = themeFor(film.product);
  const plat = PLATFORMS[film.platform];
  const box: Box = { W: film.width, H: film.height, safe: plat.safe };
  const ctx: Ctx = { film, box, frame, fps };
  const cues = film.scenes.flatMap((s) => s.sfx.map((c) => ({ ...c, abs: Math.max(0, s.from + c.at) })));
  const ducks = cues.filter((c) => c.cue === "impact" || c.cue === "settle" || c.cue === "riser");
  const total = film.durationInFrames;
  const bed = (f: number) => {
    const d = Math.max(0, ...ducks.map((c) => interpolate(f, [c.abs - 4, c.abs + 2, c.abs + 30], [0, 1, 0], clamp)));
    return interpolate(f, [0, 18, total - 30, total], [0, film.music.level, film.music.level, 0], clamp) * (1 - 0.55 * d);
  };
  const filmVars = {
    "--film-bg": theme.bg, "--film-card": theme.card, "--film-ink": theme.ink, "--film-muted": theme.muted,
    "--film-accent": theme.accent, "--film-accent-soft": theme.accentSoft, "--film-line": theme.line,
  } as React.CSSProperties;
  return (
    <AbsoluteFill style={{ ...postCssVars(theme), ...filmVars, background: theme.bg }}>
      <Audio src={staticFile(film.music.bed)} volume={bed} />
      {cues.filter((c) => c.cue in SFX_CUES).map((c, i) => (
        <Sequence key={`sfx-${i}`} from={c.abs} layout="none">
          <Audio src={staticFile(SFX_CUES[c.cue as keyof typeof SFX_CUES])} volume={c.volume} />
        </Sequence>
      ))}
      {film.scenes.map((s, i) => (
        <Sequence key={s.id + i} from={s.from} durationInFrames={s.dur} layout="none">
          <SceneView s={s} i={i} ctx={ctx} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
