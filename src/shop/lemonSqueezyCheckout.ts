/**
 * Builds a real Lemon Squeezy checkout link for a signed-in visitor, using
 * the hosted Buy Link approach (no Lemon Squeezy API key needed), confirmed
 * as the right starting mechanism with the founder.
 *
 * WHY THE URLS LIVE IN CODE, NOT ONLY IN ENV VARS
 *
 * These were env-var-only while the Lemon Squeezy products did not exist
 * yet. They exist now, and a Buy Link is not a secret: it is rendered into
 * the page's own HTML for anyone to read, exactly like a link to a pricing
 * page. Keeping them here means a new product is one change in one file
 * rather than a code change plus a deployment-config change somebody has
 * to remember, and it lets a test assert that every published paid product
 * actually has a way to buy it (see lemonSqueezyCheckout.test.ts).
 *
 * The env var still wins where it is set, so a staging deployment can point
 * at Lemon Squeezy test-mode links without touching this file.
 *
 * THE SECRETS ARE ELSEWHERE, AND STAY THERE
 *
 * LEMON_SQUEEZY_WEBHOOK_SECRET and the variant-id map in
 * src/app/api/lemon-squeezy/webhook/route.ts are what actually decide
 * whether access is granted. Those remain env-only: the first is a signing
 * secret, and the second is the check that stops a malformed payload from
 * granting the wrong product.
 *
 * WHAT THE QUERY PARAMS DO
 *
 * `embed=1` makes lemon.js open the checkout as an overlay on our own page
 * instead of navigating away (see CheckoutButton.tsx). `button_color` is
 * the one piece of the overlay's own appearance a link can set, so each
 * product's checkout carries that product's accent rather than the Lemon
 * Squeezy default purple. The user's id rides along as
 * `checkout[custom][user_id]`, which the webhook reads back out of
 * `meta.custom_data.user_id` to know which Draftpace account to grant
 * access to: this is what ties an anonymous Lemon Squeezy sale back to a
 * real entitlement without an API-generated checkout session.
 */

import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";

/**
 * The live Buy Links, one per paid product. A product missing from here
 * has no checkout yet and falls back to the existing "Checkout opens soon"
 * pending state in shop/[productSlug]/page.tsx, which is deliberate: a
 * half-wired product should read as not-for-sale-yet, never as a broken
 * buy button.
 */
const CHECKOUT_URL_BY_SLUG: Record<string, string> = {
  "personal-finance-companion":
    "https://draftpace.lemonsqueezy.com/checkout/buy/ea071133-27bd-412f-bdad-aec76783dc58",
  "home-management-companion":
    "https://draftpace.lemonsqueezy.com/checkout/buy/c5b5a7ed-bc62-4b8c-99d1-133e28012ea2",
  "alongside": "https://draftpace.lemonsqueezy.com/checkout/buy/55645579-035e-44fa-b8cc-daab10fc2212",
  "homeschooling-companion":
    "https://draftpace.lemonsqueezy.com/checkout/buy/40cf5565-372c-45ed-be99-b34a91707e81",
  "personal-life-affairs-companion":
    "https://draftpace.lemonsqueezy.com/checkout/buy/a00c131f-29ca-41f4-b7a1-f3fcdc028eb4",
  "travel-companion": "https://draftpace.lemonsqueezy.com/checkout/buy/56eb2495-89af-4f4c-8e76-c4b29d6b5131",
  "vehicle-maintenance-companion":
    "https://draftpace.lemonsqueezy.com/checkout/buy/c55443ca-3315-4b43-9570-e0bd29309af9",
  "family-health-binder": "https://draftpace.lemonsqueezy.com/checkout/buy/84f4a4ea-0061-4785-b412-483bdcb4e1d8",
};

/** Per-deployment override, for test-mode links on a staging environment. */
const CHECKOUT_URL_ENV_BY_SLUG: Record<string, string | undefined> = {
  "personal-finance-companion": process.env.LEMON_SQUEEZY_PFC_CHECKOUT_URL,
  "home-management-companion": process.env.LEMON_SQUEEZY_HMC_CHECKOUT_URL,
  "personal-life-affairs-companion": process.env.LEMON_SQUEEZY_PLA_CHECKOUT_URL,
  "homeschooling-companion": process.env.LEMON_SQUEEZY_HSC_CHECKOUT_URL,
  "alongside": process.env.LEMON_SQUEEZY_ALONGSIDE_CHECKOUT_URL,
  "travel-companion": process.env.LEMON_SQUEEZY_TRAVEL_CHECKOUT_URL,
  "vehicle-maintenance-companion": process.env.LEMON_SQUEEZY_VMC_CHECKOUT_URL,
  "family-health-binder": process.env.LEMON_SQUEEZY_FHB_CHECKOUT_URL,
};

/** Matches sitemap.ts, so a preview deployment returns to itself. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://draftpace.com";

function baseCheckoutUrl(productSlug: string): string | undefined {
  return CHECKOUT_URL_ENV_BY_SLUG[productSlug] ?? CHECKOUT_URL_BY_SLUG[productSlug];
}

export function hasLemonSqueezyCheckout(productSlug: string): boolean {
  return Boolean(baseCheckoutUrl(productSlug));
}

/** Every slug with a live checkout, for the guard test and for tooling. */
export function listCheckoutSlugs(): string[] {
  return Object.keys(CHECKOUT_URL_BY_SLUG);
}

/**
 * The product's own accent, as Lemon Squeezy's `button_color` wants it.
 * Falls back to undefined (Lemon Squeezy's own default) rather than to a
 * platform colour, because a product with no accent of its own should not
 * borrow one it does not use anywhere else.
 */
function checkoutButtonColor(productSlug: string): string | undefined {
  ensureProductsRegistered();
  return productRegistry.getBySlug(productSlug)?.theme?.accentScale?.base;
}

export function getLemonSqueezyCheckoutUrl(
  productSlug: string,
  visitor: { userId: string; email: string | null }
): string | null {
  const base = baseCheckoutUrl(productSlug);
  if (!base) return null;

  const url = new URL(base);
  // Set rather than appended, so a base URL that already carries embed=1
  // (as a link copied straight out of the Lemon Squeezy dashboard does)
  // stays correct instead of gaining a duplicate.
  url.searchParams.set("embed", "1");

  const buttonColor = checkoutButtonColor(productSlug);
  if (buttonColor) url.searchParams.set("button_color", buttonColor);

  url.searchParams.set("checkout[custom][user_id]", visitor.userId);
  if (visitor.email) url.searchParams.set("checkout[email]", visitor.email);

  // Where Lemon Squeezy sends the customer once payment clears. Without
  // it the overlay closes onto the Shop page they were already reading,
  // which still says "Get it": nothing confirms the purchase and the
  // obvious next click is the buy button again. /app/welcome waits for
  // the grant to land before offering the way in, which is why this does
  // not point straight at the product.
  //
  // Set per checkout rather than in the Lemon Squeezy dashboard so it
  // stays correct per product with nothing to configure by hand, and so
  // it is visible here next to everything else the link carries.
  if (siteUrl) url.searchParams.set("checkout[success_url]", `${siteUrl}/app/welcome/${productSlug}`);

  return url.toString();
}
