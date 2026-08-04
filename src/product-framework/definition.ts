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
    dataVisualizationPalette: z.array(z.string()).optional(),
    motionPersonality: z.enum(["calm", "energetic", "neutral"]).optional(),
    contentWidth: z.enum(["narrow", "standard", "wide"]).optional(),
  })
  .default({});

export const productModuleRegistrationSchema = z.object({
  id: z.string().min(1),
  destination: destinationIdSchema.optional(),
});

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
