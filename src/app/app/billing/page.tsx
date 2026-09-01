"use client";

import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Surface from "@/design-system/Surface";
import SettingsRow from "@/components/platform/SettingsRow";
import { CreditCard } from "@/design-system/Icon";

export default function BillingPage() {
  return (
    <PlatformShell title="Billing" subtitle="Purchases, entitlements, and payment method">
      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Owned products
          </h2>
          <EmptyState
            icon={CreditCard}
            title="No purchases yet"
            description="Products you own will list here with their entitlement source and status."
          />
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
