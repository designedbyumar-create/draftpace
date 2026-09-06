"use client";

import { familyRegistry } from "@/product-framework/families";
import type { OwnedProductRow } from "@/product-framework/deriveOwnedProducts";

/**
 * An owned product whose definition or progress failed to load, shown
 * rather than hidden — an entitlement is the only thing that ever removes
 * a row (see deriveOwnedProducts.ts). Deliberately plain and quiet: it is
 * a read failure, not a product, so it never gets the shelf card's
 * screens or the summary tile's headline treatment. One honest line and
 * one retry.
 *
 * Shared by Home and Library so a failure looks identical in both, and so
 * neither has to keep its own copy of what "couldn't load" looks like.
 */
export default function DegradedProductRow({
  row,
  onRetry,
}: {
  row: Exclude<OwnedProductRow, { kind: "ready" }>;
  onRetry: () => void;
}) {
  const title = row.kind === "progress-unavailable" ? row.definition.title : row.productSlug;
  const family = row.kind === "progress-unavailable" ? familyRegistry.get(row.definition.family) : undefined;
  const description = row.kind === "progress-unavailable" ? "Progress couldn't load" : "Couldn't load details for this product";

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[shadow:var(--shadow-xs)]">
      <div className="min-w-0">
        <p className="text-[14.5px] font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 text-[12.5px] text-[var(--muted)]">
          {family ? `${family.label} · ` : ""}
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 text-[13px] font-semibold text-[var(--primary)] hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
