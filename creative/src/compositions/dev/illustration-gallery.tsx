/** Every spot illustration in one product's palette: for reviewing the set, never published. */
import React from "react";
import { AbsoluteFill } from "remotion";
import { themeFor } from "../../theme-registry";
import { Illustration, MOTIFS } from "../../visual/illustrations";

export function IllustrationGallery({ product }: { product: string }) {
  const t = themeFor(product);
  const palette = { ink: t.ink, accent: t.accent, soft: t.accentSoft, paper: t.card };
  return (
    <AbsoluteFill style={{ background: t.bg, padding: 40, display: "flex", flexWrap: "wrap", gap: 20, alignContent: "flex-start" }}>
      {MOTIFS.map((m) => (
        <div key={m} style={{ width: 220, textAlign: "center", fontFamily: "IBM Plex Sans", fontSize: 18, color: t.ink }}>
          <Illustration motif={m} palette={palette} size={200} />
          {m}
        </div>
      ))}
    </AbsoluteFill>
  );
}
