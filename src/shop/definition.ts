import { z } from "zod";

/**
 * The public Shop data model. Deliberately separate from
 * src/product-framework/definition.ts — that contract describes internal
 * product registration (family, capabilities, navigation); this one
 * describes what a visitor sees on a Shop listing. Nothing here is derived
 * from or exposes the internal product-framework registry automatically.
 * See docs/SHOP.md.
 */

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const mediaSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
});

export const shopProductSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Slugs must be lowercase, alphanumeric, and hyphenated."),
  publicationStatus: z.enum(["draft", "published", "archived"]),
  title: z.string().min(1),
  promise: z.string().min(1),
  problem: z.string().min(1),
  audience: z.array(z.string()).default([]),
  audienceExclusions: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  howItWorks: z.array(z.string()).default([]),
  access: z.enum(["free", "paid"]),
  price: z.object({ amount: z.number().nonnegative(), currency: z.string().length(3) }).optional(),
  purchaseAction: z.object({ label: z.string().min(1), href: z.string().min(1) }).optional(),
  media: z.array(mediaSchema).default([]),
  compatibility: z.array(z.string()).default([]),
  inclusions: z.array(z.string()).default([]),
  expectedInputs: z.array(z.string()).default([]),
  expectedOutputs: z.array(z.string()).default([]),
  savingBehavior: z.string().optional(),
  privacyNotes: z.string().optional(),
  faqs: z.array(faqSchema).default([]),
  relatedGuideSlugs: z.array(z.string()).default([]),
  relatedProductSlugs: z.array(z.string()).default([]),
  needGroups: z.array(z.string()).default([]),
  seo: z.object({ title: z.string().min(1), description: z.string().min(1) }),
  structuredDataEligible: z.boolean().default(false),
  publishedAt: z.string().optional(),
  availability: z.enum(["available", "coming-soon"]),
  /** Internal Shop preview only — never true for a real listing. */
  devFixture: z.boolean().default(false),
});

export type ShopProductInput = z.input<typeof shopProductSchema>;
export type ShopProduct = z.infer<typeof shopProductSchema>;

export function validateShopProduct(input: unknown): ShopProduct {
  return shopProductSchema.parse(input);
}
