"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { ArrowRight, BookOpen } from "@/design-system/Icon";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";
import { listMyProductInstances, type ProductInstanceSummary } from "@/product-framework/instances";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";

/**
 * Library is a collection of owned experiences, not a filtered database. Leads
 * with the products themselves and a human status line, hides the filter bar
 * until there is enough inventory for it to earn its place, and ends with a
 * quiet path back to discovery. See docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §10.
 */

const FILTER_THRESHOLD = 5;

type LibraryFilter = "all" | "in-progress" | "paused" | "finished" | "archived";

const FILTERS: { id: LibraryFilter; label: string; matches: (i: ProductInstanceSummary) => boolean }[] = [
  { id: "all", label: "All", matches: () => true },
  { id: "in-progress", label: "In progress", matches: (i) => i.lifecycleState === "active" },
  { id: "paused", label: "Paused", matches: (i) => i.lifecycleState === "paused" },
  { id: "finished", label: "Finished", matches: (i) => i.lifecycleState === "completed" },
  { id: "archived", label: "Archived", matches: (i) => i.lifecycleState === "archived" },
];

/** "2026-08" -> "August 2026"; anything else is shown unchanged. */
function humanCycle(cycleKey: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(cycleKey);
  if (!match) return cycleKey;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

function humanStatus(instance: ProductInstanceSummary): string {
  if (!instance.setupComplete) return "Setup not finished";
  switch (instance.lifecycleState) {
    case "active":
      return "In progress";
    case "completed":
      return "Finished";
    case "paused":
      return "Paused";
    case "archived":
      return "Archived";
    default:
      return "In progress";
  }
}

export default function LibraryPage() {
  const [instances, setInstances] = useState<ProductInstanceSummary[] | null>(null);
  const [filter, setFilter] = useState<LibraryFilter>("all");

  useEffect(() => {
    registerMonthlyMoneyReset();
    let cancelled = false;
    listMyProductInstances().then((rows) => {
      if (!cancelled) setInstances(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const owned = useMemo(() => {
    const latest = new Map<string, ProductInstanceSummary>();
    for (const instance of instances ?? []) {
      if (!latest.has(instance.productSlug)) latest.set(instance.productSlug, instance);
    }
    return [...latest.values()];
  }, [instances]);

  const showFilters = owned.length >= FILTER_THRESHOLD;
  const activeFilter = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const visible = showFilters ? owned.filter(activeFilter.matches) : owned;

  return (
    <PlatformShell title="Your library" subtitle="Everything you own, ready when you are">
      {instances === null ? (
        <p className="text-[13px] text-[var(--muted)]">Loading…</p>
      ) : owned.length === 0 ? (
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
              {FILTERS.map((item) => (
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
              {visible.map((instance) => (
                <OwnedItem key={instance.id} instance={instance} />
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

/** One owned product, presented as an experience with a human status line. */
function OwnedItem({ instance }: { instance: ProductInstanceSummary }) {
  const definition = productRegistry.getBySlug(instance.productSlug);
  if (!definition) return null;
  const family = familyRegistry.get(definition.family);

  const destination = !instance.setupComplete
    ? `/app/products/${definition.slug}/setup`
    : instance.lifecycleState === "completed"
      ? `/app/products/${definition.slug}/history`
      : `/app/products/${definition.slug}/workspace`;

  const actionLabel = !instance.setupComplete
    ? "Finish setup"
    : instance.lifecycleState === "completed"
      ? "Review"
      : "Open";

  const statusLine = [family?.label ?? definition.family, humanCycle(instance.cycleKey), humanStatus(instance)].join(" · ");

  return (
    <Link
      href={destination}
      className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--border-strong)]"
    >
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-[var(--text)]">{definition.title}</p>
        <p className="mt-1 text-[12.5px] text-[var(--muted)]">{statusLine}</p>
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
