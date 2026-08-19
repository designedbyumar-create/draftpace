/**
 * Builds a real Lemon Squeezy checkout link for a signed-in visitor, using
 * the simple hosted Buy Link approach (no Lemon Squeezy API key needed),
 * confirmed as the right starting mechanism with the founder. Each paid
 * product's base checkout URL is its own env var, set once the founder has
 * created the product/variant in Lemon Squeezy; until then, this returns
 * null and callers fall back to the existing "Checkout opens soon" pending
 * state (GetAction in shop/[productSlug]/page.tsx already has this for any
 * paid product with no usable purchaseAction.href).
 *
 * The user's id is passed as Lemon Squeezy custom checkout data
 * (`checkout[custom][user_id]`), which the webhook
 * (src/app/api/lemon-squeezy/webhook/route.ts) reads back out of
 * `meta.custom_data.user_id` to know which Draftpace account to grant
 * access to: this is what ties an anonymous Lemon Squeezy sale back to a
 * real Draftpace entitlement without an API-generated checkout session.
 */

const CHECKOUT_URL_ENV_BY_SLUG: Record<string, string | undefined> = {
  "personal-finance-companion": process.env.LEMON_SQUEEZY_PFC_CHECKOUT_URL,
  "home-management-companion": process.env.LEMON_SQUEEZY_HMC_CHECKOUT_URL,
};

export function hasLemonSqueezyCheckout(productSlug: string): boolean {
  return Boolean(CHECKOUT_URL_ENV_BY_SLUG[productSlug]);
}

export function getLemonSqueezyCheckoutUrl(
  productSlug: string,
  visitor: { userId: string; email: string | null }
): string | null {
  const base = CHECKOUT_URL_ENV_BY_SLUG[productSlug];
  if (!base) return null;

  const url = new URL(base);
  url.searchParams.set("checkout[custom][user_id]", visitor.userId);
  if (visitor.email) url.searchParams.set("checkout[email]", visitor.email);
  return url.toString();
}
