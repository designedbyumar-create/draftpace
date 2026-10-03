"use client";

import { familyRegistry } from "@/product-framework/families";
import type { OwnedProductRow } from "@/product-framework/deriveOwnedProducts";
import { textLinkClassName } from "@/design-system/textLinkStyles";

/**
 * An owned product whose definition or progress failed to load, shown
 * rather than hidden — an entitlement is the only thing that ever removes
 * a row (see deriveOwnedProducts.ts). Deliberately plain and quiet: it is
 * a read failure, not a product, so it never gets the shelf card's
 * screens or the summary tile's headline treatment. One honest line and
 * one retry.
 *
 * Used by Home so a failure looks the same every time, and so there is
 * one shared copy of what "couldn't load" looks like rather than a
 * per-surface reimplementation.
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
        <p className="text-body font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 text-caption text-[var(--muted)]">
          {family ? `${family.label} · ` : ""}
          {description}
        </p>
      </div>
      <button type="button" onClick={onRetry} className={textLinkClassName({ className: "shrink-0" })}>
        Try again
      </button>
    </div>
  );
}
