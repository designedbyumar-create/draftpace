/**
 * Per-product visual tokens for storyboard rendering. Every value is copied
 * from that product's own src/products/<slug>/theme.ts (the LIGHT set) or,
 * for products with no dedicated theme file, from its accent in
 * src/design-system or definition.ts. Never invented: if a product's real
 * palette changes, update it here to match, don't pick a new one.
 */
export const THEMES = {
  "monthly-money-reset": {
    title: "Monthly Money Reset",
    bg: "#f5f0e8", // --mmr-ivory
    card: "#fffdf9", // --mmr-paper
    cardSoft: "#edf0e9", // --mmr-sage-pale
    ink: "#18231f", // --mmr-ink
    muted: "#6e776f", // --mmr-muted
    accent: "#214b3e", // --mmr-forest-800 / --primary
    accentSoft: "#dce2d7", // --mmr-sage-soft
    line: "#ded8cd", // --mmr-line
  },
  "personal-finance-companion": {
    title: "Personal Finance Companion",
    bg: "#eef4f1", // theme.accentScale.wash
    card: "#ffffff", // theme.ground.light.surface
    cardSoft: "#dbe8e2", // theme.accentScale.soft
    ink: "#101613", // theme.ground.light.text
    muted: "#57625c", // theme.ground.light.muted
    accent: "#0d3b2e", // theme.accent
    accentSoft: "#dbe8e2",
    line: "#e6e9e7", // theme.ground.light.surfaceStrong
  },
  "home-management-companion": {
    title: "Home Base",
    bg: "#f4f2ec", // manifest.backgroundColor
    card: "#ffffff", // platform --surface (no product-specific ground declared)
    cardSoft: "#e6ede2", // theme.accentScale.wash
    ink: "#1b1a16", // platform --text
    muted: "#66625a", // platform --muted
    accent: "#4f7a5c", // theme.accent
    accentSoft: "#e6ede2",
    line: "#e8e4da", // platform --surface-strong
  },
  "personal-life-affairs-companion": {
    title: "Personal Life Affairs Companion",
    bg: "#efebe2", // theme.ground.light.appBg
    card: "#fbf8f1", // theme.ground.light.surface
    cardSoft: "#e6eaf0", // theme.accentScale.soft
    ink: "#1b1f27", // theme.ground.light.text
    muted: "#565c68", // theme.ground.light.muted
    accent: "#26374f", // theme.accent
    accentSoft: "#e6eaf0",
    line: "#e4ded0", // theme.ground.light.surfaceStrong
  },
  "homeschooling-companion": {
    title: "Homeschooling Companion",
    bg: "#f6f1f7", // theme.accentScale.wash
    card: "#ffffff", // platform --surface (no product-specific ground declared)
    cardSoft: "#f0eaf1", // theme.accentScale.soft
    ink: "#1b1a16", // platform --text
    muted: "#66625a", // platform --muted
    accent: "#6a4a72", // theme.accent
    accentSoft: "#f0eaf1",
    line: "#e8e4da", // platform --surface-strong
  },
  alongside: {
    title: "ADHD Life Companion",
    bg: "#f4f0f1", // theme.ground.light.appBg
    card: "#fbf9fa", // theme.ground.light.surface
    cardSoft: "#f1e7eb", // theme.accentScale.soft
    ink: "#241e21", // theme.ground.light.text
    muted: "#645a5f", // theme.ground.light.muted
    accent: "#86586a", // theme.accent
    accentSoft: "#f1e7eb",
    line: "#e4dbdf", // theme.ground.light.surfaceStrong
  },
  "travel-companion": {
    title: "Travel Companion",
    bg: "#eef4f5", // theme.ground.light.appBg
    card: "#ffffff", // theme.ground.light.surface
    cardSoft: "#d9eef0", // theme.accentScale.soft
    ink: "#0f2a2f", // theme.ground.light.text
    muted: "#4b646a", // theme.ground.light.muted
    accent: "#00626f", // theme.accent
    accentSoft: "#d9eef0",
    line: "#dde9ea", // theme.ground.light.surfaceStrong
  },
  "vehicle-maintenance-companion": {
    title: "Vehicle Maintenance Companion",
    bg: "#f2f3f4", // theme.ground.light.appBg
    card: "#ffffff", // theme.ground.light.surface
    cardSoft: "#fbe8d5", // theme.accentScale.soft
    ink: "#14181b", // theme.ground.light.text
    muted: "#565e64", // theme.ground.light.muted
    accent: "#b45309", // theme.accent
    accentSoft: "#fbe8d5",
    line: "#e4e7e9", // theme.ground.light.surfaceStrong
  },
  "family-health-binder": {
    title: "Family Health Binder",
    bg: "#faf6f3", // theme.ground.light.appBg
    card: "#fffdfb", // theme.ground.light.surface
    cardSoft: "#f9e3ea", // theme.accentScale.soft
    ink: "#241a1b", // theme.ground.light.text
    muted: "#64565a", // theme.ground.light.muted
    accent: "#b23a5b", // theme.accent
    accentSoft: "#f9e3ea",
    line: "#ebe1da", // theme.ground.light.surfaceStrong
  },
};

export function themeFor(slug) {
  const t = THEMES[slug];
  if (!t) throw new Error(`No theme tokens yet for ${slug}. Add them to scripts/video-plan/theme.mjs from its theme.ts.`);
  return t;
}
