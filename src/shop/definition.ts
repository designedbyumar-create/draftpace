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

/** A doubt the buyer arrives with, and the plain answer to it. Resolved on the
 * product page near the decision, since this market objects before it desires.
 * See docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §6. */
const objectionSchema = z.object({
  worry: z.string().min(1),
  answer: z.string().min(1),
});

/**
 * One concrete problem this product solves, paired with the specific thing
 * that changes because of it. Rendered as an interactive card on the
 * product page (see ProblemCards.tsx), replacing the old side-by-side
 * "Who this is for" / "What becomes easier" tick lists: those named a
 * situation and a benefit as two separate flat lists a visitor had to
 * mentally reconnect themselves. This names the connection directly.
 * Optional and additive: `audience`/`outcomes` below are unchanged and
 * still power the Shop grid card and the Library manual page.
 */
const problemSolvedSchema = z.object({
  problem: z.string().min(1),
  solution: z.string().min(1),
});

const shopProductObjectSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Slugs must be lowercase, alphanumeric, and hyphenated."),
  publicationStatus: z.enum(["draft", "published", "archived"]),
  title: z.string().min(1),
  promise: z.string().min(1),
  problem: z.string().min(1),
  audience: z.array(z.string()).default([]),
  audienceExclusions: z.array(z.string()).default([]),
  objections: z.array(objectionSchema).default([]),
  outcomes: z.array(z.string()).default([]),
  problemsSolved: z.array(problemSolvedSchema).default([]),
  howItWorks: z.array(z.string()).default([]),
  access: z.enum(["free", "paid"]),
  price: z.object({ amount: z.number().nonnegative(), currency: z.string().length(3) }).optional(),
  /**
   * The struck-through "regular price" shown beside `price`, for a listing
   * currently on launch pricing. `price` never stops being the number that
   * actually gets charged — this field only ever adds a comparison next to
   * it, never replaces it, so nothing downstream that reads `price` (the
   * checkout link, the structured-data Offer) needs to know this exists.
   * The refinement below is what stops a listing claiming a "discount"
   * that isn't one: compareAtPrice must always be a real number genuinely
   * higher than what's actually charged.
   */
  compareAtPrice: z.object({ amount: z.number().positive(), currency: z.string().length(3) }).optional(),
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

export const shopProductSchema = shopProductObjectSchema.refine(
  (product) => !product.compareAtPrice || (product.price && product.compareAtPrice.amount > product.price.amount),
  {
    message:
      "compareAtPrice must be a real number genuinely higher than price — a listing can't claim a discount that isn't one.",
    path: ["compareAtPrice"],
  }
);

export type ShopProductInput = z.input<typeof shopProductSchema>;
export type ShopProduct = z.infer<typeof shopProductSchema>;

export function validateShopProduct(input: unknown): ShopProduct {
  return shopProductSchema.parse(input);
}

/**
 * The one place that decides how a listing's price reads, shared between
 * the Shop index cards and the product detail page so the two can never
 * disagree on wording (e.g. a paid listing with no price set yet always
 * says "Price not yet set", never a fabricated "$0.00").
 */
export function formatPrice(product: ShopProduct): string {
  if (product.access === "free") return "Free";
  if (!product.price) return "Price not yet set";
  return formatMoney(product.price);
}

/**
 * The struck-through regular price, or null when a listing has none (a
 * free product, an unpriced product, or simply a paid product with no
 * launch discount running). Callers should treat null as "render nothing
 * here" rather than substitute their own fallback text — the whole point
 * of this being separate from formatPrice is that only a listing that
 * actually has a compareAtPrice should ever show one.
 */
export function formatCompareAtPrice(product: ShopProduct): string | null {
  if (!product.compareAtPrice) return null;
  return formatMoney(product.compareAtPrice);
}

/**
 * The percentage a listing's compareAtPrice represents over its actual
 * price, rounded to the nearest whole point. Computed rather than typed
 * anywhere, so a badge reading "Save 20%" can never drift out of sync
 * with the two numbers it's describing.
 */
export function discountPercent(product: ShopProduct): number | null {
  if (!product.compareAtPrice || !product.price) return null;
  const { amount: was } = product.compareAtPrice;
  const { amount: now } = product.price;
  if (was <= 0) return null;
  return Math.round(((was - now) / was) * 100);
}

/** Whole-dollar prices render without a trailing ".00"; anything with real
 * cents keeps them. Every price in the catalogue today is a whole dollar
 * amount, but a future product's isn't guaranteed to be. */
function formatMoney(money: { amount: number; currency: string }): string {
  const hasCents = !Number.isInteger(money.amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(money.amount);
}
