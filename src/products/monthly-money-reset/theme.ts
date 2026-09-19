import type { CSSProperties } from "react";

/**
 * Monthly Money Reset's scoped visual identity: deep forest, sage, ivory,
 * and a restrained clay accent, mined from docs/monthly-money-reset-
 * prototype.html's :root and html[data-theme="dark"] blocks. Applied only
 * as inline CSS custom properties on this product's own wrapper (see
 * ThemeScope.tsx) — never written to globals.css, never affecting any
 * other product, the platform shell, or admin. See
 * docs/PRODUCT-FRAMEWORK.md's "Theme isolation" section.
 */

const LIGHT: Record<string, string> = {
  // The Number's own panel. Light keeps the deep forest; dark keeps it deep
  // too (below), rather than inverting to a pale slab on a dark page.
  "--mmr-hero": "#173c32",
  "--mmr-hero-ink": "#f5f0e8",
  "--mmr-forest-950": "#102a24",
  "--mmr-forest-900": "#173c32",
  "--mmr-forest-800": "#214b3e",
  "--mmr-forest-700": "#315f50",
  "--mmr-sage-strong": "#718772",
  "--mmr-sage": "#96a58f",
  "--mmr-sage-soft": "#dce2d7",
  "--mmr-sage-pale": "#edf0e9",
  "--mmr-ivory": "#f5f0e8",
  "--mmr-ivory-2": "#faf7f1",
  "--mmr-paper": "#fffdf9",
  "--mmr-ink": "#18231f",
  "--mmr-muted": "#6e776f",
  "--mmr-muted-2": "#8f968f",
  "--mmr-line": "#ded8cd",
  "--mmr-line-strong": "#cbc3b7",
  "--mmr-clay": "#b86f4a",
  "--mmr-clay-soft": "#f2e2d8",
  "--mmr-success": "#43765e",
  "--mmr-warning": "#a85d37",
  "--mmr-danger": "#9e4f44",
};

const DARK: Record<string, string> = {
  "--mmr-hero": "#1f4034",
  "--mmr-hero-ink": "#eef2ea",
  "--mmr-forest-950": "#eaf0eb",
  "--mmr-forest-900": "#dce8df",
  "--mmr-forest-800": "#bdd0c3",
  "--mmr-forest-700": "#99b19f",
  "--mmr-sage-strong": "#9eb1a1",
  "--mmr-sage": "#788f7e",
  "--mmr-sage-soft": "#2f4138",
  "--mmr-sage-pale": "#26362f",
  "--mmr-ivory": "#111915",
  "--mmr-ivory-2": "#16201b",
  "--mmr-paper": "#1b2620",
  "--mmr-ink": "#f2f1eb",
  "--mmr-muted": "#b6bdb7",
  "--mmr-muted-2": "#909b93",
  "--mmr-line": "#34433b",
  "--mmr-line-strong": "#47584e",
  "--mmr-clay": "#d58a64",
  "--mmr-clay-soft": "#3e2d26",
  "--mmr-success": "#88b89b",
  "--mmr-warning": "#d8936b",
  "--mmr-danger": "#dc8779",
};

export function monthlyMoneyResetThemeVars(resolvedTheme: "light" | "dark"): CSSProperties {
  return (resolvedTheme === "dark" ? DARK : LIGHT) as CSSProperties;
}

/**
 * The few shared tokens this product must set itself. It does not declare an
 * accentScale (see definition.ts), so nothing gave it a --primary: the
 * shell's `[data-product-theme]` rule pointed --primary at a variable this
 * product never declares, and every filled button and link inside it
 * rendered with no colour. Kept apart from the --mmr-* set on purpose: that
 * set is guaranteed never to collide with a platform token, and this one is
 * a deliberate, named override of exactly these six.
 */
export const MONEY_RESET_SHARED_TOKENS = [
  "--primary",
  "--primary-strong",
  "--primary-soft",
  "--primary-contrast",
  "--link",
  "--focus-ring",
] as const;

const SHARED_LIGHT: Record<string, string> = {
  "--primary": "#214b3e",
  "--primary-strong": "#173c32",
  "--primary-soft": "#dce2d7",
  "--primary-contrast": "#fffdf9",
  "--link": "#214b3e",
  "--focus-ring": "#315f50",
};

const SHARED_DARK: Record<string, string> = {
  "--primary": "#a9cdb8",
  "--primary-strong": "#c6e0d0",
  "--primary-soft": "#26362f",
  "--primary-contrast": "#0f1a15",
  "--link": "#a9cdb8",
  "--focus-ring": "#a9cdb8",
};

export function monthlyMoneyResetSharedTokens(resolvedTheme: "light" | "dark"): CSSProperties {
  return (resolvedTheme === "dark" ? SHARED_DARK : SHARED_LIGHT) as CSSProperties;
}
