"use client";

import { useEffect, useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import SettingsRow from "@/components/platform/SettingsRow";
import { CreditCard, WarningCircle } from "@/design-system/Icon";
import { familyRegistry } from "@/product-framework/families";
import { listMyEntitlements, type AccessSource } from "@/product-framework/entitlements";
import { deriveOwnedProducts, type OwnedProductRow } from "@/product-framework/deriveOwnedProducts";
import { ensureProductsRegistered } from "@/products/manifest";

/**
 * Owned products here used to be a permanent "No purchases yet" empty
 * state, regardless of what you actually owned: it never read the same
 * entitlements Home and Library already load. That's not an honest
 * "not built yet", it's a real bug, since the data was sitting right
 * there. Payment method and billing history genuinely don't exist yet
 * (no card on file, no invoice records), so those stay honest empty
 * states, unlike this one.
 *
 * No product_instances fetch here: Billing cares about what you own and
 * how you got it, not setup/lifecycle progress, so instances is passed
 * as an empty "ok" result rather than a second network read Billing
 * has no use for.
 */

const ACCESS_SOURCE_LABEL: Record<AccessSource, string> = {
  "free-grant": "Free",
  purchase: "Purchased",
  "admin-grant": "Granted by Draftpace",
};

function formatGrantedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function BillingPage() {
  const [rows, setRows] = useState<OwnedProductRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    ensureProductsRegistered();
    let cancelled = false;

    listMyEntitlements().then((entitlementsResult) => {
      if (cancelled) return;

      if (entitlementsResult.status === "error") {
        setLoadError(entitlementsResult.message);
        setRows(null);
        return;
      }

      setLoadError(null);
      setRows(deriveOwnedProducts(entitlementsResult.rows, { status: "ok", rows: [] }));
    });

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  return (
    <PlatformShell title="Billing" subtitle="Purchases, entitlements, and payment method">
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Owned products
          </h2>
          {rows === null && !loadError ? (
            <p className="text-[13px] text-[var(--muted)]">Loading…</p>
          ) : loadError ? (
            <EmptyState
              icon={WarningCircle}
              title="Couldn't load your purchases"
              description="Your access hasn't changed. This was just a read failure, check your connection and try again."
              action={
                <Button size="md" onClick={() => setRetryToken((t) => t + 1)}>
                  Try again
                </Button>
              }
            />
          ) : rows && rows.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No purchases yet"
              description="Products you own will list here with their entitlement source and status."
            />
          ) : (
            <Surface padded={false}>
              <div className="divide-y divide-[var(--border)] px-5">
                {rows!.map((row) => (
                  <OwnedProductRowView key={row.productSlug} row={row} />
                ))}
              </div>
            </Surface>
          )}
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Payment method
          </h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Payment method" description="Add a card for future purchases." unavailable />
            </div>
          </Surface>
        </section>

        <section>
          <h2 className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Billing history
          </h2>
          <Surface padded={false}>
            <div className="divide-y divide-[var(--border)] px-5">
              <SettingsRow label="Receipts and invoices" unavailable />
              <SettingsRow label="Subscription state" description="No subscription products exist yet." unavailable />
            </div>
          </Surface>
        </section>
      </div>
    </PlatformShell>
  );
}

/** One owned product's entitlement: what it is, how it was granted, and
 *  when — never its setup/lifecycle progress, that's Library's job. */
function OwnedProductRowView({ row }: { row: OwnedProductRow }) {
  const title =
    row.kind === "ready" || row.kind === "progress-unavailable" ? row.definition.title : row.productSlug;
  const family =
    row.kind === "ready" || row.kind === "progress-unavailable" ? familyRegistry.get(row.definition.family) : undefined;

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 text-[12.5px] text-[var(--muted)]">
          {family ? `${family.label} · ` : ""}
          {ACCESS_SOURCE_LABEL[row.entitlement.accessSource]}
        </p>
      </div>
      <p className="shrink-0 text-[12.5px] text-[var(--faint)]">{formatGrantedDate(row.entitlement.grantedAt)}</p>
    </div>
  );
}
