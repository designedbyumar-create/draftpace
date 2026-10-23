"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics/gtag";

/**
 * Wraps a real, working product demo (LiveDemo) wherever it is embedded
 * outside the homepage accordion that already hosts it, so the funnel
 * between "saw the product page" (view_product, ViewProductTracker.tsx)
 * and "clicked buy" (CheckoutButton's own event) isn't a total blank: this
 * is the one mid-funnel signal asking whether anyone actually engages with
 * the proof before deciding, rather than scrolling past it.
 *
 * Fires view_product_demo once per mount (the demo rendered), and
 * interact_product_demo at most once per mount, on the first click or tap
 * anywhere inside it (the visitor actually touched it, not just saw it).
 * Both go through trackEvent, which only ever receives scalar product/UI
 * facts (slug, id, title) and never anything the visitor typed into the
 * demo itself, consistent with every other call site in this codebase.
 */
export default function ProductDemoTracker({
  productId,
  productSlug,
  children,
}: {
  productId: string;
  productSlug: string;
  children: ReactNode;
}) {
  const interacted = useRef(false);

  useEffect(() => {
    trackEvent("view_product_demo", { product_id: productId, product_slug: productSlug });
    // Fires once per mount, same reasoning as ViewProductTracker: this
    // component is remounted whenever the page it lives on changes product.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInteract() {
    if (interacted.current) return;
    interacted.current = true;
    trackEvent("interact_product_demo", { product_id: productId, product_slug: productSlug });
  }

  return (
    <div onPointerDown={handleInteract} onKeyDown={handleInteract}>
      {children}
    </div>
  );
}
