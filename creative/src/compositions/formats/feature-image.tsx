/**
 * Feature Image format: a still. One slide of a carousel, a single
 * Instagram post, or a Pinterest pin, depending only on which aspect ratio
 * it's registered at in Root.tsx — the slide content is the same either
 * way. Reuses the exact same motion primitives as feature-spotlight.tsx
 * (fadeUpLine, cardPop), evaluated at a fixed "settled" frame instead of
 * over a timeline, so a still and a video slide of the same beat look like
 * they belong to the same film, not two different tools.
 */
import { AbsoluteFill } from "remotion";
import { fadeUpLine } from "../../motion/typography";
import { cardPop } from "../../motion/ui";
import { monthlyMoneyResetDemo, SafeToSpendCard, NextActionCard } from "../../ui-adapter/monthlyMoneyReset";

const SETTLED_FRAME = 30; // past every entrance primitive's own duration, so opacity/scale read as fully at rest

export type Slide = {
  id: string;
  kind: "headline" | "safeToSpendCard" | "nextActionCard" | "cta";
  typography?: { eyebrow?: string; lines?: string[]; sub?: string };
  caption?: string | null;
};

function Headline({ slide }: { slide: Slide }) {
  const lines = slide.typography?.lines ?? [];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 10%" }}>
      <div style={{ textAlign: "center" }}>
        {slide.typography?.eyebrow && (
          <p
            style={{
              fontFamily: "var(--font-space-mono)",
              fontSize: "2.2vw",
              letterSpacing: "0.22em",
              color: "var(--mmr-clay)",
              margin: "0 0 1.4vw",
            }}
          >
            {slide.typography.eyebrow}
          </p>
        )}
        {lines.map((line, i) => {
          const { opacity, translateY } = fadeUpLine({ frame: SETTLED_FRAME, start: 0, index: i, staggerFrames: 7 });
          return (
            <p
              key={line}
              style={{
                opacity,
                transform: `translateY(${translateY}px)`,
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: "6.2vw",
                lineHeight: 1.14,
                letterSpacing: "-0.02em",
                color: "var(--mmr-forest-900)",
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

function CardSlide({ slide, Card }: { slide: Slide; Card: "safeToSpendCard" | "nextActionCard" }) {
  const demo = monthlyMoneyResetDemo();
  const pop = cardPop({ frame: SETTLED_FRAME, start: 0, fps: 30 });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: pop.opacity }}>
      <div style={{ width: "58%", maxWidth: 680 }}>
        {Card === "safeToSpendCard" ? (
          <SafeToSpendCard
            breakdown={demo.breakdown}
            currency={demo.state.currency}
            updatedAt={demo.now}
            weeksRemaining={demo.weeksRemaining}
            tightestDay={demo.tightestDay}
          />
        ) : (
          <NextActionCard nextAction={demo.nextAction} checkInDay={demo.state.preferences.checkInDay} onDismiss={() => {}} onAct={() => {}} />
        )}
      </div>
      {slide.caption && (
        <p
          style={{
            position: "absolute",
            bottom: "12%",
            left: "10%",
            right: "10%",
            textAlign: "center",
            fontFamily: "var(--font-inter)",
            fontSize: "2.6vw",
            lineHeight: 1.4,
            color: "var(--mmr-muted)",
          }}
        >
          {slide.caption}
        </p>
      )}
    </AbsoluteFill>
  );
}

function CtaSlide({ slide }: { slide: Slide }) {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 700,
            fontSize: "6vw",
            letterSpacing: "-0.02em",
            color: "var(--mmr-forest-900)",
            margin: 0,
          }}
        >
          {slide.typography?.lines?.[0]}
        </p>
        <p
          style={{
            fontFamily: "var(--font-space-mono)",
            fontSize: "2.4vw",
            letterSpacing: "0.04em",
            color: "var(--mmr-clay)",
            margin: "1.2vw 0 0",
          }}
        >
          {slide.typography?.sub}
        </p>
      </div>
    </AbsoluteFill>
  );
}

export function FeatureImage({ slide }: { slide: Slide }) {
  const demo = monthlyMoneyResetDemo();
  return (
    <AbsoluteFill style={{ ...demo.themeStyle, background: "var(--mmr-ivory)" } as React.CSSProperties}>
      {slide.kind === "headline" && <Headline slide={slide} />}
      {slide.kind === "safeToSpendCard" && <CardSlide slide={slide} Card="safeToSpendCard" />}
      {slide.kind === "nextActionCard" && <CardSlide slide={slide} Card="nextActionCard" />}
      {slide.kind === "cta" && <CtaSlide slide={slide} />}
    </AbsoluteFill>
  );
}
