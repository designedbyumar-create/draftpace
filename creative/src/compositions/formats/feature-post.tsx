/**
 * Feature Post: an advertising-weight promotional image. Each post sells
 * one real problem the product solves (`problem`, an index into the
 * product's real Shop problemsSolved), and makes its case with three real
 * things only:
 *
 *  1. the problem, in the headline (guarded to read as the real one);
 *  2. the real UI, a live component or a real captured screen in a phone;
 *  3. the product's own answer, the real `solution` text of that same
 *     problemsSolved entry, as a proof chip.
 *
 * Same visual language as the video (Backdrop, Phone, KineticHeadline at
 * rest), so a pin and a Reel of the same product read as one campaign.
 *
 * Layouts:
 *  - tilt:   headline top-left, the phone turned in 3D toward the reader.
 *  - window: headline centred, the phone rising from the bottom edge.
 *  - fan:    three of the product's real screens fanned, the post's own in front.
 */
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { LogoMark } from "@/design-system/Logo";
import { monthlyMoneyResetDemo, SafeToSpendCard } from "../../ui-adapter/monthlyMoneyReset";
import { themeFor, postCssVars } from "../../theme-registry";
import { listingFor, productLine } from "../../shop-listings";
import { Backdrop } from "../../visual/Backdrop";
import { KineticHeadline, fitFontSize } from "../../visual/Kinetic";
import { Phone } from "../../visual/Phone";

export type Post = {
  id: string;
  themeSlug: string;
  problem: number;
  layout: "tilt" | "window" | "fan";
  eyebrow: string;
  headline: string[];
  /** Words to set in the product accent. */
  emphasis?: string[];
  ui: { kind: "safeToSpendCard" } | { kind: "screen"; src: string; scroll?: number; also?: string[] };
  /** Show the product's real solution text as a proof chip (default true). */
  proof?: boolean;
};

/** Far past every reveal: the kinetic headline at rest. */
const AT_REST = 10_000;

function Ui({ ui, width, rotateY = 0, rotateX = 0, rotateZ = 0 }: { ui: Post["ui"]; width: number; rotateY?: number; rotateX?: number; rotateZ?: number }) {
  if (ui.kind === "safeToSpendCard") {
    const demo = monthlyMoneyResetDemo();
    return (
      <div style={{ perspective: 2400 }}>
        <div style={{ width: width * 1.35, transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`, filter: "drop-shadow(0 40px 60px rgba(16,20,24,0.3))" }}>
          <SafeToSpendCard breakdown={demo.breakdown} currency={demo.state.currency} updatedAt={demo.now} weeksRemaining={demo.weeksRemaining} tightestDay={demo.tightestDay} />
        </div>
      </div>
    );
  }
  return <Phone src={ui.src} width={width} scroll={ui.scroll ?? 0} rotateX={rotateX} rotateY={rotateY} rotateZ={rotateZ} />;
}

function ProofChip({ post, width }: { post: Post; width: number }) {
  const entry = listingFor(post.themeSlug).problemsSolved?.[post.problem];
  if (!entry || post.proof === false) return null;
  const u = width / 1080;
  return (
    <div
      style={{
        display: "flex",
        gap: 18 * u,
        maxWidth: 560 * u,
        padding: `${22 * u}px ${26 * u}px`,
        borderRadius: 22 * u,
        background: "var(--post-card)",
        boxShadow: `0 ${24 * u}px ${50 * u}px -${20 * u}px rgba(16,20,24,0.35), 0 0 0 1px var(--post-line)`,
      }}
    >
      <div style={{ width: 5 * u, borderRadius: 3, background: "var(--post-accent)", flexShrink: 0 }} />
      <div>
        {entry.label && (
          <p style={{ margin: `0 0 ${6 * u}px`, fontFamily: "IBM Plex Sans", fontWeight: 600, fontSize: 19 * u, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--post-accent)" }}>{entry.label}</p>
        )}
        <p style={{ margin: 0, fontFamily: "IBM Plex Sans", fontWeight: 500, fontSize: 25 * u, lineHeight: 1.35, color: "var(--post-ink)" }}>{entry.solution}</p>
      </div>
    </div>
  );
}

function Footer({ themeSlug, width }: { themeSlug: string; width: number }) {
  const { name, price, compareAt } = productLine(themeSlug);
  const u = width / 1080;
  return (
    <div style={{ position: "absolute", left: "7%", right: "7%", bottom: "4.5%", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "IBM Plex Sans", color: "var(--post-ink)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 * u, ["--logo-mark" as string]: "var(--post-accent)", ["--logo-mark-glyph" as string]: "var(--post-card)" }}>
        <LogoMark size={46 * u} />
        <span style={{ fontWeight: 600, fontSize: 26 * u }}>{name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 * u, padding: `${10 * u}px ${22 * u}px`, borderRadius: 999, background: "var(--post-card)", boxShadow: "0 0 0 1px var(--post-line)" }}>
        {compareAt && <span style={{ fontSize: 22 * u, color: "var(--post-muted)", textDecoration: "line-through" }}>{compareAt}</span>}
        <span style={{ fontWeight: 700, fontSize: 28 * u, color: "var(--post-accent)" }}>{price}</span>
      </div>
    </div>
  );
}

function Headline({ post, width, align, maxWidth }: { post: Post; width: number; align: "left" | "center"; maxWidth: number }) {
  const u = width / 1080;
  return (
    <div style={{ textAlign: align }}>
      <p style={{ fontFamily: "IBM Plex Sans", fontWeight: 600, fontSize: 22 * u, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--post-accent)", margin: `0 0 ${18 * u}px` }}>{post.eyebrow}</p>
      <KineticHeadline lines={post.headline} emphasis={post.emphasis} frame={AT_REST} start={0} align={align} fontSize={fitFontSize(post.headline, maxWidth, 74 * u)} />
    </div>
  );
}

function TiltLayout({ post, width, height }: { post: Post; width: number; height: number }) {
  const tall = height / width;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: "8%", top: "7%", right: "8%" }}>
        <Headline post={post} width={width} align="left" maxWidth={width * 0.84} />
      </div>
      <div style={{ position: "absolute", right: "6%", bottom: tall > 1.3 ? "11%" : "-14%" }}>
        <Ui ui={post.ui} width={width * (tall > 1.3 ? 0.44 : 0.4)} rotateY={-20} rotateX={8} rotateZ={-3} />
      </div>
      <div style={{ position: "absolute", left: "7%", bottom: tall > 1.3 ? "16%" : "14%" }}>
        <ProofChip post={post} width={width} />
      </div>
      <Footer themeSlug={post.themeSlug} width={width} />
    </AbsoluteFill>
  );
}

function WindowLayout({ post, width, height }: { post: Post; width: number; height: number }) {
  const tall = height / width;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: "7%", right: "7%", top: "7%" }}>
        <Headline post={post} width={width} align="center" maxWidth={width * 0.86} />
      </div>
      <div style={{ position: "absolute", left: "50%", top: tall > 1.3 ? "36%" : "42%", transform: "translateX(-50%)" }}>
        <Ui ui={post.ui} width={width * (tall > 1.3 ? 0.5 : 0.42)} rotateX={10} />
      </div>
      <div style={{ position: "absolute", right: "6%", top: tall > 1.3 ? "62%" : "64%" }}>
        <ProofChip post={post} width={width * 0.92} />
      </div>
      <Footer themeSlug={post.themeSlug} width={width} />
    </AbsoluteFill>
  );
}

function FanLayout({ post, width, height }: { post: Post; width: number; height: number }) {
  const tall = height / width;
  const also = post.ui.kind === "screen" ? post.ui.also ?? [] : [];
  const w = width * (tall > 1.3 ? 0.4 : 0.34);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: "7%", right: "7%", top: "7%" }}>
        <Headline post={post} width={width} align="center" maxWidth={width * 0.86} />
      </div>
      <div style={{ position: "absolute", left: "50%", top: tall > 1.3 ? "38%" : "44%", width: 0 }}>
        {also[0] && (
          <div style={{ position: "absolute", left: -w * 1.25, top: w * 0.18, opacity: 0.96 }}>
            <Phone src={also[0]} width={w * 0.86} rotateY={24} rotateZ={-7} shadow={0.7} />
          </div>
        )}
        {also[1] && (
          <div style={{ position: "absolute", left: w * 0.39, top: w * 0.18, opacity: 0.96 }}>
            <Phone src={also[1]} width={w * 0.86} rotateY={-24} rotateZ={7} shadow={0.7} />
          </div>
        )}
        <div style={{ position: "absolute", left: -w / 2, top: 0 }}>
          <Ui ui={post.ui} width={w} rotateX={6} />
        </div>
      </div>
      <Footer themeSlug={post.themeSlug} width={width} />
    </AbsoluteFill>
  );
}

export function FeaturePost({ post }: { post: Post }) {
  const { width, height } = useVideoConfig();
  const theme = themeFor(post.themeSlug);
  const Layout = post.layout === "tilt" ? TiltLayout : post.layout === "fan" ? FanLayout : WindowLayout;
  return (
    <AbsoluteFill style={{ ...postCssVars(theme) } as React.CSSProperties}>
      <Backdrop frame={0} motion={0} />
      <Layout post={post} width={width} height={height} />
    </AbsoluteFill>
  );
}
