"use client";

import { useEffect, useState } from "react";
import { listMyEntitlements } from "@/product-framework/entitlements";
import { listMyProductInstances } from "@/product-framework/instances";
import { deriveOwnedProducts } from "@/product-framework/deriveOwnedProducts";
import { ensureProductsRegistered } from "@/products/manifest";
import ManualOwnershipView, { type Ownership } from "./ManualOwnershipView";

/**
 * The one live part of a manual: where this reader actually stands with
 * this product, and the way in.
 *
 * Everything else on a manual page is the product's own published,
 * static content and is rendered on the server. Ownership is not — it is
 * per-person and read at request time — so it is isolated here rather
 * than making the whole page client-side.
 *
 * A read failure resolves to "unavailable" rather than "not owned": the
 * same discipline as deriveOwnedProducts, where an entitlement is the
 * only thing that ever means somebody doesn't own something.
 */
export default function ManualOwnershipBar({ productSlug }: { productSlug: string }) {
  const [ownership, setOwnership] = useState<Ownership>({ state: "loading" });

  useEffect(() => {
    ensureProductsRegistered();
    let cancelled = false;

    Promise.all([listMyEntitlements(), listMyProductInstances()]).then(([entitlements, instances]) => {
      if (cancelled) return;

      if (entitlements.status === "error") {
        setOwnership({ state: "unavailable" });
        return;
      }

      const row = deriveOwnedProducts(entitlements.rows, instances).find((r) => r.productSlug === productSlug);
      if (!row) {
        setOwnership({ state: "not-owned" });
        return;
      }
      if (row.kind !== "ready") {
        setOwnership({ state: "unavailable" });
        return;
      }
      setOwnership({ state: "owned", row });
    });

    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  return <ManualOwnershipView ownership={ownership} productSlug={productSlug} />;
}
