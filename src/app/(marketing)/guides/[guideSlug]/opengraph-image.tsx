import { ImageResponse } from "next/og";
import { LIFE_AREAS, getAreaBySlug } from "@/content/areas";
import { GUIDES, SERIES, getGuideBySlug } from "@/content/guides";
import { guideSeoTitle } from "@/content/guideMeta";

/**
 * The share card for every guide and area hub.
 *
 * Before this, every guide shared the homepage's card. This one is text
 * only on purpose: it says what the page is and which area it belongs
 * to, in that area's colour, so a link in a chat or a Pinterest scrape
 * describes the page it points at. It shows no product screen and no
 * claim, so it can never be wrong about what a Companion does.
 *
 * The colours are the light-theme values of --area-* in globals.css.
 * An image renderer cannot read CSS variables, so they are repeated here;
 * change both together.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A Draftpace guide";

const COLOURS: Record<string, { accent: string; soft: string }> = {
  money: { accent: "#176b51", soft: "#e2efe9" },
  home: { accent: "#96591a", soft: "#f6ebda" },
  "mind-and-focus": { accent: "#5a4bb8", soft: "#e9e6f7" },
  "family-and-learning": { accent: "#97417a", soft: "#f7e6f1" },
  "affairs-and-endings": { accent: "#4d5a68", soft: "#e9ecef" },
  travel: { accent: "#1f6291", soft: "#e2edf5" },
  vehicles: { accent: "#4d5a35", soft: "#e9ecdf" },
  "family-health": { accent: "#424c62", soft: "#e6e9f0" },
  series: { accent: "#0e6e75", soft: "#e0f0f0" },
};

function fontSizeFor(title: string): number {
  if (title.length <= 34) return 84;
  if (title.length <= 48) return 72;
  return 62;
}

// Prerendered like the pages they belong to, one card per guide and area.
export function generateStaticParams() {
  return [...LIFE_AREAS.map((a) => ({ guideSlug: a.slug })), ...GUIDES.map((g) => ({ guideSlug: g.slug }))];
}

export default async function Image({ params }: { params: Promise<{ guideSlug: string }> }) {
  const { guideSlug } = await params;

  const area = getAreaBySlug(guideSlug);
  const guide = area ? undefined : getGuideBySlug(guideSlug);
  const areaKey = area ? area.slug : guide?.areaSlug && guide.areaSlug !== SERIES ? guide.areaSlug : "series";
  const colours = COLOURS[areaKey] ?? COLOURS.series;
  const label = area ? area.label : guide && guide.areaSlug && guide.areaSlug !== SERIES ? (getAreaBySlug(guide.areaSlug)?.label ?? "Guides") : "The Companion Series";
  const title = area ? `${area.label} guides` : guide ? guideSeoTitle(guide) : "Draftpace guides";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: colours.soft,
          padding: "72px 84px",
          borderLeft: `20px solid ${colours.accent}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 4, color: colours.accent, textTransform: "uppercase" }}>
          {label}
        </div>
        <div style={{ display: "flex", fontSize: fontSizeFor(title), fontWeight: 700, lineHeight: 1.08, color: "#1b1a17", letterSpacing: -2 }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30, color: "#4a4842" }}>
          <div style={{ display: "flex", fontWeight: 700, color: colours.accent }}>Draftpace</div>
          <div style={{ display: "flex" }}>draftpace.com/guides</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
