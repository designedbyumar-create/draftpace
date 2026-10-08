/**
 * Re-exports the real per-product theme tokens already extracted this
 * session in scripts/video-plan/theme.mjs (copied from each product's own
 * theme.ts / definition.ts — see that file's own header comment). Not
 * duplicated here: one source of truth for "what is this product's real
 * palette," shared by the storyboard tooling and this engine.
 */
// @ts-expect-error - plain JS module, no type declarations
import { THEMES as THEMES_UNTYPED, themeFor as themeForUntyped } from "../../scripts/video-plan/theme.mjs";

export type ProductTheme = {
  title: string;
  bg: string;
  card: string;
  cardSoft: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  line: string;
};

export const THEMES = THEMES_UNTYPED as Record<string, ProductTheme>;

export function themeFor(slug: string): ProductTheme {
  return themeForUntyped(slug) as ProductTheme;
}

/** Maps a product's theme tokens onto the generic --post-* CSS variables every format reads, so no format hardcodes one product's token names. */
export function postCssVars(theme: ProductTheme): React.CSSProperties {
  return {
    "--post-bg": theme.bg,
    "--post-card": theme.card,
    "--post-card-soft": theme.cardSoft,
    "--post-ink": theme.ink,
    "--post-muted": theme.muted,
    "--post-accent": theme.accent,
    "--post-accent-soft": theme.accentSoft,
    "--post-line": theme.line,
  } as React.CSSProperties;
}
