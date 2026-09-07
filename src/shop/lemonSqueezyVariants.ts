/**
 * The Lemon Squeezy variant id for each paid product, and the resolver the
 * webhook uses to turn one into a product to grant.
 *
 * THIS IS NOT THE UUID IN THE BUY LINK. A Buy Link ends in a variant
 * *UUID* (.../checkout/buy/ea071133-...); the webhook payload carries a
 * separate numeric `variant_id`. They are different identifiers for the
 * same variant, and confusing them is silent and expensive: the payment
 * succeeds, the webhook returns 400, and the customer is charged with
 * nothing granted. The numbers come from the Lemon Squeezy dashboard,
 * Products -> the product's menu -> Copy variant ID.
 *
 * WHY THE IDS LIVE IN CODE
 *
 * Same reasoning as the checkout URLs in lemonSqueezyCheckout.ts: these
 * are identifiers, not secrets, and env-only meant this map was empty in
 * any deployment where nobody had remembered to set the variables, which
 * is a silent failure of exactly the kind above. What makes the webhook
 * safe is the HMAC signature check plus resolving the slug from this map
 * rather than trusting anything in the payload. The env var still
 * overrides, so staging can point at test-mode variants.
 *
 * WHY THE VERSION IS REPEATED HERE RATHER THAN READ FROM THE REGISTRY
 *
 * Reading it from productRegistry would be self-updating, but it pulls
 * every product definition into a webhook route that otherwise imports
 * almost nothing, on every cold start, to answer one string lookup.
 * Instead the version is stated here and lemonSqueezyCheckout.test.ts
 * asserts it still matches each product's own definition, so a version
 * bump fails CI rather than quietly granting a stale version in
 * production. The guarantee is the same; the cost moves off the request
 * path.
 *
 * Kept out of the route file because a Next route module may only export
 * request handlers, and this map has to be readable by that guard test.
 */

interface PurchasableProduct {
  /** Undefined until the founder supplies the id from the dashboard. */
  variantId: string | undefined;
  version: string;
}

const PURCHASABLE: Record<string, PurchasableProduct> = {
  "personal-finance-companion": {
    variantId: process.env.LEMON_SQUEEZY_PFC_VARIANT_ID ?? "2102710",
    version: "0.1.0",
  },
  "home-management-companion": {
    variantId: process.env.LEMON_SQUEEZY_HMC_VARIANT_ID ?? "2102727",
    version: "0.1.0",
  },
  "personal-life-affairs-companion": {
    variantId: process.env.LEMON_SQUEEZY_PLA_VARIANT_ID ?? "2102744",
    version: "0.1.0",
  },
  "homeschooling-companion": {
    variantId: process.env.LEMON_SQUEEZY_HSC_VARIANT_ID ?? "2102740",
    version: "0.1.0",
  },
  "alongside": { variantId: process.env.LEMON_SQUEEZY_ALONGSIDE_VARIANT_ID ?? "2102735", version: "0.1.0" },
  "travel-companion": { variantId: process.env.LEMON_SQUEEZY_TRAVEL_VARIANT_ID ?? "2102746", version: "0.1.0" },
  "vehicle-maintenance-companion": {
    variantId: process.env.LEMON_SQUEEZY_VMC_VARIANT_ID ?? "2102749",
    version: "0.1.0",
  },
  // Mapped, but not yet reachable from the Shop: this product exists in
  // Lemon Squeezy and has a variant, and no Buy Link URL has been
  // supplied, so its Shop page still shows "Checkout opens soon". The
  // mapping is harmless and deliberate: it means the day the link
  // arrives, or if a sale comes through Lemon Squeezy's own storefront,
  // the grant already works rather than 400ing.
  "family-health-binder": { variantId: process.env.LEMON_SQUEEZY_FHB_VARIANT_ID ?? "2102751", version: "0.1.0" },
};

/** Which slugs have a variant id, so a purchase of them can be granted. */
export function listMappedVariantSlugs(): string[] {
  return Object.entries(PURCHASABLE)
    .filter(([, entry]) => Boolean(entry.variantId))
    .map(([slug]) => slug);
}

/** The version this map claims for a slug, for the drift guard. */
export function grantedVersionFor(slug: string): string | undefined {
  return PURCHASABLE[slug]?.version;
}

/** Resolves a payload's variant id to the product to grant, or null. */
export function productForVariant(variantId: string): { slug: string; version: string } | null {
  if (!variantId) return null;
  const found = Object.entries(PURCHASABLE).find(([, entry]) => entry.variantId === variantId);
  return found ? { slug: found[0], version: found[1].version } : null;
}
