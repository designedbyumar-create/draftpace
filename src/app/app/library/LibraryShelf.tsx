"use client";

import Link from "next/link";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { ArrowRight, BookOpen, WarningCircle } from "@/design-system/Icon";
import { listMyEntitlements } from "@/product-framework/entitlements";
import { listMyProductInstances } from "@/product-framework/instances";
import { deriveOwnedProducts, type OwnedProductRow } from "@/product-framework/deriveOwnedProducts";
import { visibleLibraryFilters, type LibraryFilter } from "@/product-framework/ownedProductPresentation";
import LibraryShelfCard from "@/components/platform/LibraryShelfCard";
import DegradedProductRow from "@/components/platform/DegradedProductRow";
import { ensureProductsRegistered } from "@/products/manifest";

/**
 * Library is the shelf — what you own, what each thing is, and the way
 * into learning it properly. Home already answers "what does my life need
 * from me today", so Library deliberately does not repeat that: no
 * headline figures, no next actions, no life-area grouping. It shows the
 * products themselves, led by their real screens, with a manual behind
 * each one.
 *
 * Ownership itself comes from entitlements, not product_instances — an
 * instance is progress on something already owned, not proof of
 * ownership. See deriveOwnedProducts.ts for exactly how a read failure at
 * any layer degrades a row instead of ever hiding it.
 *
 * The per-product presentation (promise, life area, the rendered screens)
 * is passed in from the server page, because the Shop listing content and
 * the mockup components are static and have no business being fetched or
 * bundled a second time on the client just to be read here.
 */

export type ShelfPresentation = {
  promise: string | null;
  areaLabel: string | null;
  preview: ReactNode | null;
};

const FILTER_THRESHOLD = 5;

export default function LibraryShelf({ presentation }: { presentation: Record<string, ShelfPresentation> }) {
  const [rows, setRows] = useState<OwnedProductRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    ensureProductsRegistered();
    let cancelled = false;

    Promise.all([listMyEntitlements(), listMyProductInstances()]).then(([entitlementsResult, instancesResult]) => {
      if (cancelled) return;

      if (entitlementsResult.status === "error") {
        setLoadError(entitlementsResult.message);
        setRows(null);
        return;
      }

      setLoadError(null);
      setRows(deriveOwnedProducts(entitlementsResult.rows, instancesResult));
    });

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const filters = visibleLibraryFilters(rows ?? []);
  const showFilters = (rows?.length ?? 0) >= FILTER_THRESHOLD;
  const activeFilter = filters.find((f) => f.id === filter) ?? filters[0];
  const visible = rows ? (showFilters ? rows.filter(activeFilter.matches) : rows) : [];
  const ready = visible.filter((row): row is Extract<OwnedProductRow, { kind: "ready" }> => row.kind === "ready");
  const degraded = visible.filter((row): row is Exclude<OwnedProductRow, { kind: "ready" }> => row.kind !== "ready");

  const subtitle =
    rows && rows.length > 0
      ? `${rows.length} ${rows.length === 1 ? "product" : "products"} — open one, or read how to get more out of it`
      : "Everything you own, ready when you are";

  return (
    <PlatformShell title="Your library" subtitle={subtitle}>
      {rows === null && !loadError ? (
        <p className="text-[13px] text-[var(--muted)]">Loading…</p>
      ) : loadError ? (
        <EmptyState
          icon={WarningCircle}
          title="Couldn't load your library"
          description="Your access hasn't changed. This was just a read failure, check your connection and try again."
          action={
            <Button size="md" onClick={() => setRetryToken((t) => t + 1)}>
              Try again
            </Button>
          }
        />
      ) : rows && rows.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nothing here yet"
          description="Start with something free from the Store to see it here."
          action={
            <Button href="/shop" size="md">
              Go to the Store
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {showFilters && (
            <div role="tablist" aria-label="Library filter" className="flex gap-1 overflow-x-auto border-b border-[var(--border)]">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.id}
                  onClick={() => setFilter(item.id)}
                  className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-semibold transition ${
                    filter === item.id
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {visible.length === 0 ? (
            <p className="text-[13px] text-[var(--muted)]">Nothing matches this filter right now.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {ready.map((row) => {
                const shown = presentation[row.productSlug];
                return (
                  <LibraryShelfCard
                    key={row.productSlug}
                    row={row}
                    promise={shown?.promise ?? null}
                    areaLabel={shown?.areaLabel ?? null}
                    preview={shown?.preview ? <Fragment key="preview">{shown.preview}</Fragment> : null}
                  />
                );
              })}
            </div>
          )}

          {degraded.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {degraded.map((row) => (
                <DegradedProductRow key={row.productSlug} row={row} onRetry={() => setRetryToken((t) => t + 1)} />
              ))}
            </div>
          )}

          <div className="border-t border-[var(--border)] pt-6">
            <Link href="/shop" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
              Find more in the Store
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
