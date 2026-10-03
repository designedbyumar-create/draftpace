"use client";

import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";
import type { ButtonSize } from "@/design-system/Button";
import { trackEvent } from "@/lib/analytics/gtag";

/**
 * The one real "get" action for a free product, shared between the Shop
 * list (ShopProductCard in ShopGrid.tsx) and the product page (GetAction
 * in shop/[productSlug]/page.tsx) so there's exactly one place that knows
 * how a free product is added: a plain POST straight to the activation
 * endpoint, the same one /app/activate/[productSlug]'s own <form> posts to.
 * Distinct from "Learn more", which just links to the product page. The
 * two used to be the same single link, collapsing "add this" and "tell me
 * more" into one ambiguous action.
 *
 * "use client" only because onSubmit needs to run in the browser to fire
 * GA4's free_product_start alongside the real submit. The <form> itself
 * still POSTs natively (no preventDefault, no fetch), so activation works
 * exactly as before whether or not the event fires.
 *
 * Neither call site actually renders this today for a real product: the
 * Shop grid only lists paid products, and the one free product's own
 * detail page permanently redirects away before GetAction would reach
 * its free branch (see /free/page.tsx, the real "start the free product"
 * surface, which fires the same event itself). This stays wired for the
 * day a second free product exists and one of these two paths becomes
 * live again, rather than being event-less until someone remembers.
 */
export default function AddToLibraryButton({
  slug,
  label = "Add to library",
  size = "md",
  fullWidth = false,
  analytics,
}: {
  slug: string;
  label?: string;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Optional so a call site with no product name handy still works; every real one passes it. */
  analytics?: { productName: string };
}) {
  return (
    <form
      method="POST"
      action={`/api/products/${slug}/activate`}
      onSubmit={() => {
        if (!analytics) return;
        trackEvent("free_product_start", { product_id: slug, product_name: analytics.productName });
      }}
    >
      <Button type="submit" size={size} fullWidth={fullWidth} iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
    </form>
  );
}
