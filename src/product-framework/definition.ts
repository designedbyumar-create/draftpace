import { z } from "zod";

/**
 * The product-definition contract. Deliberately metadata-only: there is no
 * field for sensitive user data or executable secrets, and product-specific
 * data always lives behind `dataSchemaRef`, never inline here.
 * See docs/PRODUCT-FRAMEWORK.md and docs/DATA-BOUNDARIES.md.
 */

const capabilityIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/, "Capability ids must be namespaced, e.g. \"companion.next-action\".");

const destinationIdSchema = z.string().min(1);

export const productAccessSchema = z.object({
  model: z.enum(["free", "paid", "membership"]),
  entitlementKey: z.string().optional(),
});

export const productThemeExtensionSchema = z
  .object({
    accent: z.string().optional(),
    /**
     * The full accent scale, and the opt-in that actually re-themes a
     * product's surfaces.
     *
     * `accent` alone was never enough to theme anything: a button needs a
     * hover state, a soft tint and a readable contrast colour, so every
     * component reasonably kept using the platform's own --primary and a
     * declared accent stayed decorative. Products that declare only
     * `accent` keep behaving exactly as before; declaring the scale is
     * what opts a product into having its own colour, and it stays scoped
     * to that product's shell root.
     */
    accentScale: z
      .object({
        base: z.string(),
        strong: z.string(),
        soft: z.string(),
        contrast: z.string(),
      })
      .optional(),
    /**
     * A serif or otherwise warmer family used only where the product
     * speaks in its own voice, never for data or controls. Holds a CSS
     * font-family value, normally a next/font variable reference.
     */
    narrativeFont: z.string().optional(),
    dataVisualizationPalette: z.array(z.string()).optional(),
    motionPersonality: z.enum(["calm", "energetic", "neutral"]).optional(),
    contentWidth: z.enum(["narrow", "standard", "wide"]).optional(),
  })
  .default({});

export const productModuleRegistrationSchema = z.object({
  id: z.string().min(1),
  destination: destinationIdSchema.optional(),
});

/**
 * How `product_instances.cycle_key` (shared table, see migrations) applies
 * to this product. "monthly" (the default) is Monthly Money Reset's model:
 * a fresh instance per calendar cycle, looked up by an exact match on
 * today's cycle key. "continuous" is for a product with no reset concept —
 * exactly one instance ever, whose cycle_key is fixed at creation as an
 * "instance cohort" marker (satisfying the shared table's NOT NULL
 * YYYY-MM check) rather than an active period, found by most-recently-
 * created instead of by matching today's key. See
 * src/app/app/products/[productSlug]/layout.tsx and ./page.tsx.
 */
export const productCycleModelSchema = z.enum(["monthly", "continuous"]).default("monthly");

/**
 * A product's own installable-PWA identity, layered on top of Draftpace's
 * site-wide manifest (public/manifest.webmanifest) rather than replacing
 * it. Optional — a product with no `pwa` field is covered only by the
 * root manifest, same as every product before this field existed. See
 * src/app/app/products/[productSlug]/manifest.webmanifest/route.ts and
 * docs/PWA-PRODUCT-IDENTITY.md.
 */
export const productPwaIconSchema = z.object({
  src: z.string().min(1),
  sizes: z.string().min(1),
  type: z.string().min(1),
  purpose: z.enum(["any", "maskable"]).optional(),
});

export const productPwaSchema = z
  .object({
    name: z.string().min(1),
    shortName: z.string().min(1).max(30),
    description: z.string().min(1),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    icons: z.array(productPwaIconSchema).min(1),
    /**
     * True while the icon/color values above are borrowed from Draftpace's
     * own neutral brand assets rather than this product's real, final
     * visual identity. Surfaced in the settings destination and in the
     * manifest route's response so provisional branding is never mistaken
     * for a shipped decision. See docs/PWA-PRODUCT-IDENTITY.md.
     */
    provisionalBranding: z.boolean().default(true),
  })
  .optional();

export const productDefinitionSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]*$/, "Slugs must be lowercase, alphanumeric, and hyphenated."),
  title: z.string().min(1),
  /** One-line promise shown on the Start destination — not marketing copy, just what this product is for. */
  tagline: z.string().optional(),
  family: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be semver, e.g. \"0.1.0\"."),
  status: z.enum(["draft", "active", "coming_soon", "archived"]),
  access: productAccessSchema,
  cycleModel: productCycleModelSchema,
  pwa: productPwaSchema,
  capabilities: z.array(capabilityIdSchema).default([]),
  navigation: z.array(destinationIdSchema).default([]),
  /**
   * Which declared destinations are "primary" (always visible once the
   * product is past its first-use gate) versus secondary/contextual. Optional
   * — most products don't need to set this; the shared resolver's default
   * (workspace/progress/history-equivalents are primary, everything else
   * secondary) covers the common case. Set this only when a product's shape
   * genuinely differs. See navigationResolver.ts.
   */
  primaryNavigation: z.array(destinationIdSchema).optional(),
  startRoute: z.string().default("start"),
  workspaceLabel: z.string().optional(),
  /** Generic per-destination label overrides, e.g. { start: "Companion" } — the same override "workspace" already gets via workspaceLabel, extended to any destination a product wants to rename without renaming the destination id/route itself. */
  destinationLabels: z.record(z.string(), z.string()).optional(),
  setup: z
    .object({
      required: z.boolean().default(false),
      skippable: z.boolean().default(true),
      schemaRef: z.string().optional(),
      /** Label shown for the "setup" destination once it's complete and demoted out of primary navigation, e.g. "Edit your plan". Falls back to a generic label when unset. */
      completedLabel: z.string().optional(),
    })
    .default({ required: false, skippable: true }),
  dataSchemaRef: z.string().optional(),
  modules: z.array(productModuleRegistrationSchema).default([]),
  permissions: z.array(z.string()).default([]),
  events: z.array(z.string()).default([]),
  theme: productThemeExtensionSchema,
  layouts: z.array(z.string()).default(["responsive"]),
  offline: z.enum(["none", "shell-only", "local-edits"]).default("shell-only"),
  notifications: z.object({ supported: z.boolean().default(false) }).default({ supported: false }),
  progressModel: z.object({ kind: z.string() }).optional(),
  history: z
    .object({ enabled: z.boolean().default(false), kinds: z.array(z.string()).default([]) })
    .default({ enabled: false, kinds: [] }),
  settingsSections: z.array(z.string()).default([]),
  migrationPolicy: z
    .object({
      compatibility: z.enum(["backward-compatible", "migration-required", "new-cycle-only"]),
    })
    .default({ compatibility: "backward-compatible" }),
  /**
   * True only for internal architecture fixtures (docs/DATA-BOUNDARIES.md).
   * Never true for a real product. The registry excludes fixtures from
   * production unless explicitly enabled — see environment.ts.
   */
  devFixture: z.boolean().default(false),
});

export type ProductDefinitionInput = z.input<typeof productDefinitionSchema>;
export type ProductDefinition = z.infer<typeof productDefinitionSchema>;

export function validateProductDefinition(input: unknown): ProductDefinition {
  return productDefinitionSchema.parse(input);
}
