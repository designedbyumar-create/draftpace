/**
 * Finds pin: an illustration-led Pinterest pin (1000 x 1500, Pinterest's
 * recommended size) for the Maple & Main Finds account. Five layouts, one product
 * palette each, the same spot illustrations as the carousels, and the
 * product's real screen on the split layout. The product line at the foot
 * carries the real name and price from the Shop listing, and every pin
 * says it is made by Draftpace.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { LogoMark } from "@/design-system/Logo";
import { themeFor, postCssVars } from "../../theme-registry";
import { productLine } from "../../shop-listings";
import { Illustration, type Palette } from "../../visual/illustrations";
import { Phone } from "../../visual/Phone";
import type { FindsPin } from "../../../pinterest/maple-main-finds";

/**
 * What a pin draws: a Maple & Main find, or one of Draftpace's own pins
 * (pinterest/draftpace-pins.ts), which may link to a free guide instead of
 * the product and may have no line under its headline.
 */
export type PinArt = Pick<FindsPin, "product" | "tag" | "head" | "scene" | "points" | "screen"> & {
  layout: FindsPin["layout"] | "hero";
  sub?: string;
  /** "price" (the default) shows the real price; "guide" says the guide is free. */
  cta?: "price" | "guide";
  /** The small line under the product name. */
  byline?: string;
};

const SERIF = "Newsreader";
const SANS = "IBM Plex Sans";
const W = 1000;

/** The warm second colours a finds pin can take: peach, butter and pink. */
const POPS = [{ hue: 18, css: "hsl(18 88% 76%)" }, { hue: 43, css: "hsl(43 92% 70%)" }, { hue: 340, css: "hsl(340 80% 80%)" }];

/** A warm second colour for sparkles and highlights: of peach, butter and pink, the one furthest round the colour wheel from the product's accent. */
export function popFor(accent: string): string {
  const n = parseInt(accent.slice(1), 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const hue = (h * 60 + 360) % 360;
  const away = (x: number) => Math.min(Math.abs(x - hue), 360 - Math.abs(x - hue));
  return POPS.reduce((a, c) => (away(c.hue) > away(a.hue) ? c : a)).css;
}

const size = (chars: number, steps: [number, number][], min: number) => steps.find(([n]) => chars <= n)?.[1] ?? min;

/** "{name}" and "{price}" filled from the product's real Shop listing. */
export function fillPin(text: string, product: string): string {
  const { name, price } = productLine(product);
  return text.replace(/\{name\}/g, name).replace(/\{price\}/g, price);
}

function Tag({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <span style={{ display: "inline-block", padding: "12px 26px", borderRadius: 999, background: dark ? "var(--post-card)" : "var(--post-accent)", color: dark ? "var(--post-accent)" : "var(--post-card)", fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: "0.14em", textTransform: "uppercase" }}>{text}</span>
  );
}

/** The product, its real price, and who makes it. */
function ProductLine({ product, dark, cta = "price", byline = "Made by Draftpace" }: { product: string; dark?: boolean; cta?: PinArt["cta"]; byline?: string }) {
  const { name, price } = productLine(product);
  const pill = cta === "guide" ? "Free guide" : price === "Free" ? "Free" : `${price} once`;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, ["--logo-mark" as string]: "var(--post-accent)", ["--logo-mark-glyph" as string]: "var(--post-card)" }}>
        <LogoMark size={56} />
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: dark ? "var(--post-card)" : "var(--post-ink)", lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, color: dark ? "var(--post-card)" : "var(--post-ink)", opacity: 0.6, marginTop: 4 }}>{byline}</div>
        </div>
      </div>
      <span style={{ flexShrink: 0, padding: "12px 26px", borderRadius: 999, background: "var(--post-accent)", color: "var(--post-card)", fontFamily: SANS, fontWeight: 700, fontSize: 30 }}>{pill}</span>
    </div>
  );
}

/** Two or three illustrations arranged as one scene: the first large, the others tucked around it. */
function Scene({ motifs, palette, w, ground = 0.7, stage = true }: { motifs: string[]; palette: Palette; w: number; ground?: number; stage?: boolean }) {
  const [hero, a, b] = motifs;
  return (
    <div style={{ position: "relative", width: w, height: w * 0.86 }}>
      {/* A tinted stage, so the drawings have something to stand on. */}
      {stage && <div style={{ position: "absolute", left: w * 0.04, top: w * 0.06, width: w * 0.86, height: w * 0.78, borderRadius: "48% 52% 46% 54% / 55% 48% 52% 45%", background: "color-mix(in srgb, var(--post-accent) 16%, var(--post-card))" }} />}
      {stage && <div style={{ position: "absolute", right: w * 0.02, top: w * 0.02, width: w * 0.2, height: w * 0.2, borderRadius: "50%", background: palette.pop, opacity: 0.55 }} />}
      {a && <div style={{ position: "absolute", right: 0, top: 0 }}><Illustration motif={a} palette={palette} size={w * 0.42} ground={ground} /></div>}
      {b && <div style={{ position: "absolute", right: w * 0.04, bottom: 0 }}><Illustration motif={b} palette={palette} size={w * 0.36} ground={ground} /></div>}
      <div style={{ position: "absolute", left: 0, top: w * 0.08 }}><Illustration motif={hero} palette={palette} size={w * (a ? 0.68 : 0.8)} ground={ground} /></div>
    </div>
  );
}

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ borderRadius: 36, background: "var(--post-card)", boxShadow: "0 30px 60px -34px rgba(16,20,24,0.35), 0 0 0 1px var(--post-line)", padding: "34px 40px", ...style }}>{children}</div>
);

function Head({ text, max = 84, color = "var(--post-ink)", align = "left" as const }: { text: string; max?: number; color?: string; align?: "left" | "center" }) {
  const s = Math.min(max, size(text.length, [[30, 92], [44, 82], [58, 72], [72, 64], [90, 56]], 50));
  return <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: s, lineHeight: 1.06, letterSpacing: "-0.018em", color, textAlign: align, textWrap: "balance" }}>{text}</p>;
}

const Sub = ({ text, color = "var(--post-ink)" }: { text: string; color?: string }) => (
  <p style={{ margin: 0, fontFamily: SANS, fontWeight: 500, fontSize: size(text.length, [[60, 36], [90, 32]], 29), lineHeight: 1.36, color, textWrap: "pretty" }}>{text}</p>
);

function SceneLayout({ pin, palette }: { pin: PinArt; palette: Palette }) {
  return (
    <div style={{ position: "absolute", inset: "70px 60px 60px", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 10px" }}>
        <Tag text={pin.tag} />
        <div style={{ marginTop: 30 }}><Head text={pin.head} /></div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Scene motifs={pin.scene} palette={palette} w={760} /></div>
      <Card>{pin.sub && <><Sub text={pin.sub} /><div style={{ height: 1, background: "var(--post-line)", margin: "28px 0" }} /></>}<ProductLine product={pin.product} cta={pin.cta} byline={pin.byline} /></Card>
    </div>
  );
}

/** The picture first: a large scene on a tinted panel, then the headline and its line, then the product. */
function HeroLayout({ pin, palette }: { pin: PinArt; palette: Palette }) {
  return (
    <>
      <div style={{ position: "absolute", left: 40, right: 40, top: 40, height: 700, borderRadius: 44, background: "color-mix(in srgb, var(--post-accent) 14%, var(--post-card))", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 40, top: 34 }}><Tag text={pin.tag} /></div>
        <div style={{ position: "absolute", left: 120, top: 120 }}><Scene motifs={pin.scene} palette={palette} w={680} stage={false} ground={0.9} /></div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 800 }}>
        <Head text={pin.head} max={78} />
        {pin.sub && <div style={{ marginTop: 22 }}><Sub text={pin.sub} color="color-mix(in srgb, var(--post-ink) 76%, transparent)" /></div>}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 64 }}><ProductLine product={pin.product} cta={pin.cta} byline={pin.byline} /></div>
    </>
  );
}

function SplitLayout({ pin, palette }: { pin: PinArt; palette: Palette }) {
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 700, background: "var(--post-ink)", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 30, bottom: 10 }}><Scene motifs={pin.scene.slice(0, 2)} palette={palette} w={420} ground={1} stage={false} /></div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 70 }}>
          <Tag text={pin.cta ? pin.tag : "The problem"} dark />
          <div style={{ marginTop: 30, maxWidth: 600 }}><Head text={pin.head} color="var(--post-card)" max={74} /></div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 760, width: 470 }}>
        <Tag text={pin.cta ? "How it helps" : "The fix"} />
        {pin.sub && <div style={{ marginTop: 26 }}><Sub text={pin.sub} /></div>}
      </div>
      {pin.screen && <div style={{ position: "absolute", right: 60, top: 740 }}><Phone src={pin.screen} width={340} rotateY={-14} rotateX={6} /></div>}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 260, background: "linear-gradient(to top, var(--post-bg) 62%, transparent)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 64 }}><ProductLine product={pin.product} cta={pin.cta} byline={pin.byline} /></div>
    </>
  );
}

function ListLayout({ pin, palette }: { pin: PinArt; palette: Palette }) {
  return (
    <>
      <div style={{ position: "absolute", left: 70, right: 70, top: 70 }}>
        <Tag text={pin.tag} />
        <div style={{ marginTop: 30 }}><Head text={pin.head} max={76} /></div>
        <div style={{ marginTop: 18 }}><Sub text={pin.sub ?? ""} color="color-mix(in srgb, var(--post-ink) 70%, transparent)" /></div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: pin.points!.length > 3 ? 500 : 560, display: "flex", flexDirection: "column", gap: pin.points!.length > 3 ? 16 : 22 }}>
        {pin.points!.map((p, i) => (
          <Card key={i} style={{ display: "flex", alignItems: "center", gap: 26, padding: "14px 32px 14px 18px" }}>
            <div style={{ flexShrink: 0 }}><Illustration motif={p.motif} palette={palette} size={pin.points!.length > 3 ? 132 : 170} /></div>
            <p style={{ margin: 0, fontFamily: SANS, fontWeight: 600, fontSize: p.text.length > 48 ? 32 : 36, lineHeight: 1.3, color: "var(--post-ink)", textWrap: "pretty" }}>{p.text}</p>
          </Card>
        ))}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 64 }}><ProductLine product={pin.product} cta={pin.cta} byline={pin.byline} /></div>
    </>
  );
}

function PovLayout({ pin, palette }: { pin: PinArt; palette: Palette }) {
  const s = size(pin.head.length, [[50, 70], [70, 62], [90, 54]], 48);
  return (
    <>
      <div style={{ position: "absolute", left: 70, top: 70 }}><Tag text={pin.tag} /></div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 160 }}>
        <Card style={{ padding: "48px 52px", borderRadius: 44 }}>
          <p style={{ margin: 0, fontFamily: SERIF, fontWeight: 500, fontStyle: "italic", fontSize: s, lineHeight: 1.12, color: "var(--post-ink)", textWrap: "balance" }}>{pin.head}</p>
        </Card>
        {/* The bubble's tail. */}
        <div style={{ position: "absolute", left: 110, bottom: -34, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: "36px solid var(--post-card)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, bottom: 330, display: "flex", alignItems: "center", justifyContent: "center" }}><Scene motifs={pin.scene} palette={palette} w={640} /></div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 60 }}>
        <Card>{pin.sub && <><Sub text={pin.sub} /><div style={{ height: 1, background: "var(--post-line)", margin: "28px 0" }} /></>}<ProductLine product={pin.product} cta={pin.cta} byline={pin.byline} /></Card>
      </div>
    </>
  );
}

function BoardLayout({ pin, palette }: { pin: PinArt; palette: Palette }) {
  const pts = pin.points!;
  const tilt = [-3, 2.5, 2, -2.5, -1.5, 3];
  const cardW = 400, img = pts.length > 4 ? 150 : 190;
  return (
    <>
      <div style={{ position: "absolute", left: 70, right: 70, top: 70 }}>
        <Tag text={pin.tag} />
        <div style={{ marginTop: 30 }}><Head text={pin.head} max={78} /></div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: pts.length > 4 ? 470 : 520, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 60, rowGap: 30 }}>
        {pts.map((p, i) => (
          <div key={i} style={{ width: cardW, transform: `rotate(${tilt[i % tilt.length]}deg)` }}>
            <Card style={{ padding: "20px 22px 24px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Illustration motif={p.motif} palette={palette} size={img} /></div>
              <p style={{ margin: "8px 0 0", fontFamily: SANS, fontWeight: 600, fontSize: p.text.length > 26 ? 27 : 31, lineHeight: 1.25, color: "var(--post-ink)" }}>{p.text}</p>
            </Card>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 64 }}><ProductLine product={pin.product} cta={pin.cta} byline={pin.byline} /></div>
    </>
  );
}

export function FindsPinStill({ pin }: { pin: PinArt }) {
  const t = themeFor(pin.product);
  const palette: Palette = { ink: t.ink, accent: t.accent, soft: t.accentSoft, paper: t.card, pop: popFor(t.accent) };
  const filled = { ...pin, head: fillPin(pin.head, pin.product), sub: pin.sub && fillPin(pin.sub, pin.product) };
  const Layout = { scene: SceneLayout, hero: HeroLayout, split: SplitLayout, list: ListLayout, pov: PovLayout, board: BoardLayout }[pin.layout];
  return (
    <AbsoluteFill style={{ ...postCssVars(t), background: "var(--post-bg)", width: W, height: 1500, overflow: "hidden" } as React.CSSProperties}>
      {/* A soft wash of the product's tint behind everything, so every pin reads as its product at a glance. */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 88% 8%, color-mix(in srgb, var(--post-accent) 22%, transparent) 0%, transparent 44%), radial-gradient(circle at 4% 64%, color-mix(in srgb, var(--post-accent) 14%, transparent) 0%, transparent 40%)", opacity: 1 }} />
      <Layout pin={filled} palette={palette} />
    </AbsoluteFill>
  );
}
