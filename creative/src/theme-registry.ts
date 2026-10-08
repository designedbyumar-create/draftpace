/**
 * Every product's palette, read from the product's own source, never
 * copied into this workspace:
 *
 *  - a product that declares `theme.accentScale` + `theme.ground` (most of
 *    them) is read straight from its definition.ts;
 *  - a product with an accentScale but no ground (Home Base,
 *    Homeschooling) sits on the platform ground, exactly as it does in the
 *    real app;
 *  - Monthly Money Reset declares neither, by design, and owns a scoped
 *    --mmr-* token set in its theme.ts instead, so it is read from there.
 *
 * Change a product's colours in the app and its creatives follow on the
 * next render. `tests/theme-registry.test.ts` holds PLATFORM_GROUND to
 * globals.css, the one value set here that can't be imported.
 */
import { alongsideDefinition } from "@/products/alongside/definition";
import { familyHealthBinderDefinition } from "@/products/family-health-binder/definition";
import { homeManagementCompanionDefinition } from "@/products/home-management-companion/definition";
import { homeschoolingCompanionDefinition } from "@/products/homeschooling-companion/definition";
import { monthlyMoneyResetDefinition } from "@/products/monthly-money-reset/definition";
import { personalFinanceCompanionDefinition } from "@/products/personal-finance-companion/definition";
import { personalLifeAffairsCompanionDefinition } from "@/products/personal-life-affairs-companion/definition";
import { travelCompanionDefinition } from "@/products/travel-companion/definition";
import { vehicleMaintenanceCompanionDefinition } from "@/products/vehicle-maintenance-companion/definition";
import { monthlyMoneyResetThemeVars } from "@/products/monthly-money-reset/theme";
import type { ProductDefinitionInput } from "@/product-framework/definition";

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

/** The platform's light ground, `html { ... }` in src/app/globals.css. CSS can't be imported as values, so a test pins these to that file. */
export const PLATFORM_GROUND = {
  appBg: "#f4f2ec",
  surface: "#ffffff",
  surfaceMuted: "#f1efe8",
  text: "#1b1a16",
  muted: "#66625a",
  border: "#e7e2d8",
} as const;

/** Every product the engine can render, keyed by the slug its shot/post files use (= its folder under src/products). */
export const PRODUCT_DEFINITIONS: Record<string, ProductDefinitionInput> = {
  alongside: alongsideDefinition,
  "family-health-binder": familyHealthBinderDefinition,
  "home-management-companion": homeManagementCompanionDefinition,
  "homeschooling-companion": homeschoolingCompanionDefinition,
  "monthly-money-reset": monthlyMoneyResetDefinition,
  "personal-finance-companion": personalFinanceCompanionDefinition,
  "personal-life-affairs-companion": personalLifeAffairsCompanionDefinition,
  "travel-companion": travelCompanionDefinition,
  "vehicle-maintenance-companion": vehicleMaintenanceCompanionDefinition,
};

function fromDefinition(def: ProductDefinitionInput): ProductTheme {
  const scale = def.theme?.accentScale;
  if (scale) {
    const ground = def.theme?.ground?.light ?? PLATFORM_GROUND;
    return {
      title: def.title,
      bg: ground.appBg,
      card: ground.surface,
      cardSoft: ground.surfaceMuted,
      ink: ground.text,
      muted: ground.muted,
      accent: scale.base,
      accentSoft: scale.soft,
      line: ground.border,
    };
  }
  // No accentScale: the product themes itself through its own scoped tokens.
  // Only Monthly Money Reset does this today; a new one fails loudly below.
  if (def.slug === "monthly-money-reset") {
    const v = monthlyMoneyResetThemeVars("light") as Record<string, string>;
    return {
      title: def.title,
      bg: v["--mmr-ivory"],
      card: v["--mmr-paper"],
      cardSoft: v["--mmr-ivory-2"],
      ink: v["--mmr-ink"],
      muted: v["--mmr-muted"],
      accent: v["--mmr-forest-800"],
      accentSoft: v["--mmr-sage-soft"],
      line: v["--mmr-line"],
    };
  }
  throw new Error(`${def.slug} declares no theme.accentScale and has no scoped-token mapping in theme-registry.ts`);
}

export const THEMES: Record<string, ProductTheme> = Object.fromEntries(
  Object.entries(PRODUCT_DEFINITIONS).map(([slug, def]) => [slug, fromDefinition(def)]),
);

export function themeFor(slug: string): ProductTheme {
  const theme = THEMES[slug];
  if (!theme) throw new Error(`No product theme for "${slug}". Known: ${Object.keys(THEMES).join(", ")}`);
  return theme;
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
