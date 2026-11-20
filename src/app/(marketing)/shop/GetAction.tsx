import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";
import { hasLemonSqueezyCheckout, getLemonSqueezyCheckoutUrl } from "@/shop/lemonSqueezyCheckout";
import type { ShopProduct } from "@/shop/definition";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { withPreservedUtm } from "@/lib/analytics/utm";
import CheckoutButton from "@/components/shop/CheckoutButton";
import TrackedLink from "@/components/analytics/TrackedLink";
import GetFreeProductButton from "./GetFreeProductButton";

/**
 * The one real purchase action, and the one place that decides what it
 * does. Originally lived only inside /shop/[productSlug]/page.tsx; a
 * second product surface (a bespoke landing page, starting with
 * /homeschooling-companion) needs the exact same checkout resolution,
 * sign-in redirect and Lemon Squeezy link, never a second copy that
 * could quietly drift from this one. Same reasoning as
 * PwaInstallSection's extraction: two surfaces that both claim to sell
 * a product must not be able to disagree about how buying it works.
 */
export type CheckoutStatus =
  | { kind: "not-applicable" }
  | { kind: "not-configured" }
  | { kind: "signed-out"; redirectTo: string }
  | { kind: "ready"; href: string };

/**
 * Resolved once per request (not per GetAction instance, of which a page
 * can have several) so every GetAction on a page agrees on the exact
 * same checkout link. "signed-out" only fires when a real checkout URL
 * is actually configured: an unauthenticated visitor should never be
 * sent to sign up for a purchase that isn't live yet.
 */
export async function resolveCheckout(
  product: ShopProduct,
  searchParams: Record<string, string | string[] | undefined>,
  backToPath: string,
): Promise<CheckoutStatus> {
  if (product.access !== "paid" || product.purchaseAction?.href) return { kind: "not-applicable" };
  if (!hasLemonSqueezyCheckout(product.slug)) return { kind: "not-configured" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // withPreservedUtm before encodeURIComponent: the campaign has to
    // survive the round trip through signup and back to this exact
    // page, or a visitor who signs up mid-visit is the one visitor this
    // whole system silently fails to attribute.
    const backTo = withPreservedUtm(backToPath, searchParams);
    return { kind: "signed-out", redirectTo: `/signup?redirectTo=${encodeURIComponent(backTo)}` };
  }

  const href = getLemonSqueezyCheckoutUrl(product.slug, { userId: user.id, email: user.email ?? null });
  return href ? { kind: "ready", href } : { kind: "not-configured" };
}

/**
 * The get action itself. Free adds the product to the visitor's account;
 * paid links to the real Lemon Squeezy checkout once it's configured and
 * the visitor is signed in. A coming-soon product shows a disabled state
 * instead of a live action.
 */
export function GetAction({
  product,
  checkout,
  productCategory,
  size = "md",
  center = false,
  fullWidth = false,
}: {
  product: ShopProduct;
  checkout: CheckoutStatus;
  /** The area label (Money, Home, Travel, ...) the page already computed once, passed down rather than re-derived per render. */
  productCategory: string;
  size?: "sm" | "md" | "lg";
  center?: boolean;
  /** Fills its column, so the buy box reads as one block rather than a button floating in it. */
  fullWidth?: boolean;
}) {
  if (product.availability === "coming-soon") {
    return (
      <div className={center ? "inline-flex flex-col items-center gap-1.5" : "flex flex-col gap-1.5"}>
        <Button size={size} disabled>
          Coming soon
        </Button>
        <p className="text-caption text-[var(--faint)]">Not available to get just yet.</p>
      </div>
    );
  }

  const label = product.purchaseAction?.label ?? (product.access === "free" ? "Get it, free" : "Get Lifetime Access");

  if (product.access === "free") {
    return <GetFreeProductButton slug={product.slug} label={label} size={size} analytics={{ productName: product.title }} />;
  }

  // Paid, with a static href already set on the listing itself (e.g. a
  // future non-Lemon-Squeezy checkout), unrelated to per-visitor checkout
  // resolution, so it always wins if present.
  if (product.purchaseAction?.href) {
    return (
      <Button href={product.purchaseAction.href} size={size} fullWidth={fullWidth} iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
    );
  }

  if (checkout.kind === "ready") {
    return (
      <CheckoutButton
        href={checkout.href}
        size={size}
        fullWidth={fullWidth}
        iconRight={<ArrowRight size={15} aria-hidden />}
        analytics={{ productId: product.id, productName: product.title, productCategory, cta: label }}
      >
        {label}
      </CheckoutButton>
    );
  }

  if (checkout.kind === "signed-out") {
    return (
      <TrackedLink
        href={checkout.redirectTo}
        size={size}
        fullWidth={fullWidth}
        iconRight={<ArrowRight size={15} aria-hidden />}
        eventName="product_cta_click"
        eventParams={{ product_id: product.id, product_name: product.title, cta: label }}
      >
        {label}
      </TrackedLink>
    );
  }

  // Checkout isn't configured yet (Lemon Squeezy product/checkout link not
  // created), or this product isn't paid at all: shown as pending rather
  // than a dead or fake link.
  return (
    <div className={center ? "inline-flex flex-col items-center gap-1.5" : "flex flex-col gap-1.5"}>
      <Button size={size} disabled iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
      <p className="text-caption text-[var(--faint)]">Checkout opens soon.</p>
    </div>
  );
}
