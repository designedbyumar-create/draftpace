"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Badge from "@/design-system/Badge";
import { BookOpen } from "@/design-system/Icon";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";
import { listMyProductInstances, type ProductInstanceSummary } from "@/product-framework/instances";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";

type LibraryFilter = "all" | "active" | "paused" | "completed" | "archived";

const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "completed", label: "Completed" },
  { id: "archived", label: "Archived" },
];

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

  const latestPerProduct = new Map<string, ProductInstanceSummary>();
  for (const instance of instances ?? []) {
    if (!latestPerProduct.has(instance.productSlug)) latestPerProduct.set(instance.productSlug, instance);
  }
  const owned = [...latestPerProduct.values()];
  const visible = filter === "all" ? owned : owned.filter((instance) => instance.lifecycleState === filter);

  return (
    <PlatformShell title="Library" subtitle="What you've added to your account">
      <div
        role="tablist"
        aria-label="Library filter"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]"
      >
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

      {instances === null ? (
        <p className="text-[13px] text-[var(--muted)]">Loading…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={owned.length === 0 ? "Nothing here yet" : `No ${filter} products`}
          description={
            owned.length === 0
              ? "Add something free or owned from the Shop to see it here."
              : "Nothing matches this filter right now."
          }
          action={
            owned.length === 0 ? (
              <Link href="/shop" className="text-[13px] font-semibold text-[var(--primary)]">
                Go to the Shop
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((instance) => (
            <LibraryCard key={instance.id} instance={instance} />
          ))}
        </div>
      )}
    </PlatformShell>
  );
}

function LibraryCard({ instance }: { instance: ProductInstanceSummary }) {
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
      ? "Review result"
      : "Open";

  return (
    <Link
      href={destination}
      className="block rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--border-strong)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-[var(--text)]">{definition.title}</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {family?.label ?? definition.family} · Free · {instance.cycleKey}
          </p>
          {instance.nextActionLabel && (
            <p className="mt-1.5 text-[12px] text-[var(--muted)]">{instance.nextActionLabel}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge tone={instance.lifecycleState === "active" ? "success" : "neutral"}>{instance.lifecycleState}</Badge>
          <span className="text-[11px] font-semibold text-[var(--primary)]">{actionLabel}</span>
        </div>
      </div>
    </Link>
  );
}
