"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/gtag";

/**
 * Fires GA4's view_product once, on mount, for a product detail page
 * (the Shop's [productSlug] page and /free, the equivalent page for the
 * one free product). Rendered by the server component that already knows
 * the product; this is the entire client boundary — one effect, no
 * state, nothing else on the page needs to become a client component to
 * host it.
 *
 * product_id/product_name are the same values the checkout links, the
 * webhook's variant map, and the Shop grid already use (ShopProduct.id
 * and .title) — never invented for analytics. product_category is the
 * life area the product is filed under in src/content/areas.ts (Money,
 * Home, Travel, ...), the closest real category concept this catalogue
 * has; a product with no area (shouldn't happen for a published listing,
 * but see getAreaForProduct's own contract) reports "uncategorized"
 * rather than a thrown error or a silently missing parameter.
 */
export default function ViewProductTracker({
  productId,
  productName,
  productCategory,
}: {
  productId: string;
  productName: string;
  productCategory: string;
}) {
  useEffect(() => {
    trackEvent("view_product", {
      product_id: productId,
      product_name: productName,
      product_category: productCategory,
    });
    // Deliberately fires once per mount, not on every prop change: this
    // component is always remounted by React when productId changes
    // (it's keyed by the page it lives on, one product per page), so
    // there is no real "same instance, different product" case to guard
    // against here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
