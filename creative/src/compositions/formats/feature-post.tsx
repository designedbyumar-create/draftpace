/**
 * Feature Post format: an advertising-weight promotional image, not a
 * screenshot-with-a-caption. Each post sells one real, specific thing the
 * product does (one real problemsSolved entry), with the visual language
 * proven in the Maple & Main Finds Pinterest work this session (blobs,
 * tilted/windowed real UI, Newsreader display type).
 *
 * Product-agnostic: every color comes from the real per-product theme
 * tokens (theme-registry.ts), resolved by `post.themeSlug`, not
 * hardcoded. Any product with an entry in theme-registry.ts can use this
 * format. The real UI element is still always real: either a live
 * component (only wired for Monthly Money Reset's SafeToSpendCard today)
 * or a real captured screen image (public/screens/), never a recreated
 * mockup.
 */
import { AbsoluteFill, Img, staticFile } from "remotion";
import { monthlyMoneyResetDemo, SafeToSpendCard } from "../../ui-adapter/monthlyMoneyReset";
import { themeFor, postCssVars } from "../../theme-registry";

export type Post = {
  id: string;
  themeSlug: string;
  layout: "tilt" | "window";
  eyebrow: string;
  headline: string[];
  ui: { kind: "safeToSpendCard" } | { kind: "screen"; src: string };
  product: { name: string; price: string };
};

function RealUi({ ui, frameWidth }: { ui: Post["ui"]; frameWidth: number }) {
  if (ui.kind === "safeToSpendCard") {
    const demo = monthlyMoneyResetDemo();
    return (
      <div style={{ width: frameWidth }}>
        <SafeToSpendCard
          breakdown={demo.breakdown}
          currency={demo.state.currency}
          updatedAt={demo.now}
          weeksRemaining={demo.weeksRemaining}
          tightestDay={demo.tightestDay}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        width: frameWidth,
        height: frameWidth * 1.8,
        overflow: "hidden",
        borderRadius: 28,
        background: "#15151a",
        padding: 10,
      }}
    >
      <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: 20 }}>
        <Img
          src={staticFile(ui.src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
        />
      </div>
    </div>
  );
}

function Footer({ product }: { product: Post["product"] }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "7%",
        right: "7%",
        bottom: "5.5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        fontFamily: "IBM Plex Sans",
        fontSize: "1.7vw",
        fontWeight: 600,
        color: "var(--post-ink)",
      }}
    >
      <span>
        {product.name} · {product.price}
      </span>
      <span style={{ opacity: 0.6 }}>Made by Draftpace</span>
    </div>
  );
}

function Headline({ eyebrow, headline, align = "left" }: { eyebrow: string; headline: string[]; align?: "left" | "center" }) {
  return (
    <div style={{ textAlign: align }}>
      <p
        style={{
          fontFamily: "IBM Plex Sans",
          fontWeight: 700,
          fontSize: "1.9vw",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--post-accent)",
          margin: "0 0 1.2vw",
        }}
      >
        {eyebrow}
      </p>
      {headline.map((line, i) => (
        <p
          key={i}
          style={{
            fontFamily: "Newsreader",
            fontWeight: 600,
            fontSize: "5vw",
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
            color: "var(--post-ink)",
            margin: 0,
            textWrap: "balance",
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function TiltLayout({ post }: { post: Post }) {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Two soft blobs in the product's own real accent tones. */}
      <div
        style={{
          position: "absolute",
          left: "-18%",
          top: "-10%",
          width: "70%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: "var(--post-card-soft)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-22%",
          bottom: "-16%",
          width: "60%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: "var(--post-accent-soft)",
          opacity: 0.7,
        }}
      />
      <div style={{ position: "absolute", left: "8%", top: "7%", right: "12%" }}>
        <Headline eyebrow={post.eyebrow} headline={post.headline} />
      </div>
      <div
        style={{
          position: "absolute",
          right: "9%",
          bottom: "16%",
          transform: "rotate(-5deg)",
          filter: "drop-shadow(0 40px 60px rgba(20, 20, 20, 0.28))",
        }}
      >
        <RealUi ui={post.ui} frameWidth={420} />
      </div>
      <Footer product={post.product} />
    </AbsoluteFill>
  );
}

function WindowLayout({ post }: { post: Post }) {
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "54%",
          width: "92%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: "var(--post-card-soft)",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div style={{ position: "absolute", left: "8%", right: "8%", top: "8%", textAlign: "center" }}>
        <Headline eyebrow={post.eyebrow} headline={post.headline} align="center" />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "13%",
          transform: "translateX(-50%)",
          filter: "drop-shadow(0 40px 60px rgba(20, 20, 20, 0.3))",
        }}
      >
        <RealUi ui={post.ui} frameWidth={430} />
      </div>
      <Footer product={post.product} />
    </AbsoluteFill>
  );
}

export function FeaturePost({ post }: { post: Post }) {
  const theme = themeFor(post.themeSlug);
  return (
    <AbsoluteFill style={{ ...postCssVars(theme), background: "var(--post-bg)" } as React.CSSProperties}>
      {post.layout === "tilt" ? <TiltLayout post={post} /> : <WindowLayout post={post} />}
    </AbsoluteFill>
  );
}
