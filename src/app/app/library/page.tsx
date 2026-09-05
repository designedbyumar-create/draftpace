"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { ArrowRight, BookOpen, WarningCircle } from "@/design-system/Icon";
import { familyRegistry } from "@/product-framework/families";
import { listMyEntitlements } from "@/product-framework/entitlements";
import { listMyProductInstances } from "@/product-framework/instances";
import { deriveOwnedProducts, type OwnedProductRow } from "@/product-framework/deriveOwnedProducts";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import {
  boughtStartedLine,
  humanCycle,
  humanStatus,
  visibleLibraryFilters,
  type LibraryFilter,
} from "@/product-framework/ownedProductPresentation";
import { ensureProductsRegistered } from "@/products/manifest";

/**
 * Library is a collection of owned experiences, not a filtered database. Leads
 * with the products themselves and a human status line, hides the filter bar
 * until there is enough inventory for it to earn its place, and ends with a
 * quiet path back to discovery. See docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §10.
 *
 * Ownership itself comes from entitlements, not product_instances — an
 * instance is progress on something already owned, not proof of ownership.
 * See deriveOwnedProducts.ts for exactly how a read failure at any layer
 * degrades a row instead of ever hiding it.
 */

const FILTER_THRESHOLD = 5;

export default function LibraryPage() {
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

  return (
    <PlatformShell title="Your library" subtitle="Everything you own, ready when you are">
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
            <div className="grid gap-3">
              {visible.map((row) => (
                <OwnedItem key={row.productSlug} row={row} onRetry={() => setRetryToken((t) => t + 1)} />
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

/** One owned product, presented as an experience with a human status line — degraded, but never hidden, if any layer failed to load. */
function OwnedItem({ row, onRetry }: { row: OwnedProductRow; onRetry: () => void }) {
  if (row.kind === "definition-missing" || row.kind === "progress-unavailable") {
    const title = row.kind === "progress-unavailable" ? row.definition.title : row.productSlug;
    const family = row.kind === "progress-unavailable" ? familyRegistry.get(row.definition.family) : undefined;
    const description = row.kind === "progress-unavailable" ? "Progress couldn't load" : "Couldn't load details for this product";

    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-xs)]">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[var(--text)]">{title}</p>
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

  const { definition, instance, entitlement } = row;
  const family = familyRegistry.get(definition.family);

  if (!instance) {
    return (
      <Link
        href={`/app/products/${definition.slug}`}
        className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-xs)] transition-colors hover:border-[var(--border-strong)]"
      >
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[var(--text)]">{definition.title}</p>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">{[family?.label ?? definition.family, "Not started yet"].join(" · ")}</p>
          <p className="mt-1 text-[12.5px] text-[var(--faint)]">{boughtStartedLine(entitlement, null)}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
          Start
          <ArrowRight size={14} aria-hidden />
        </span>
      </Link>
    );
  }

  const destination = resolveProductDestination(definition, instance);

  const actionLabel = !instance.setupComplete
    ? "Finish setup"
    : instance.lifecycleState === "completed"
      ? "Review"
      : "Open";

  const statusLine = [family?.label ?? definition.family, humanCycle(instance.cycleKey), humanStatus(instance)].join(" · ");

  return (
    <Link
      href={destination}
      className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-xs)] transition-colors hover:border-[var(--border-strong)]"
    >
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-[var(--text)]">{definition.title}</p>
        <p className="mt-1 text-[12.5px] text-[var(--muted)]">{statusLine}</p>
        <p className="mt-1 text-[12.5px] text-[var(--faint)]">{boughtStartedLine(entitlement, instance)}</p>
        {instance.nextActionLabel && instance.setupComplete && (
          <p className="mt-1.5 text-[12.5px] text-[var(--muted)]">Next: {instance.nextActionLabel}</p>
        )}
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
        {actionLabel}
        <ArrowRight size={14} aria-hidden />
      </span>
    </Link>
  );
}

