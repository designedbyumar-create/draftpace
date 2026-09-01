"use client";

import type { ProductDefinition } from "@/product-framework/definition";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { ChartBar, Wallet } from "@/design-system/Icon";
import { useInstanceState } from "./useInstanceState";
import { LoadErrorState } from "./shared";
import ThemeScope from "./ThemeScope";
import { computeSafeToSpend } from "../calculations";
import { formatCurrency } from "../currency";

export default function ProgressModule({ definition }: { definition: ProductDefinition }) {
  const { status, state, retry } = useInstanceState(definition.slug);

  if (status === "loading") {
    return <p className="text-[13px] text-[var(--muted)]">Loading your progress…</p>;
  }

  if (status === "error") {
    return <LoadErrorState onRetry={retry} />;
  }

  if (status === "no-instance" || !state) {
    return (
      <EmptyState
        icon={Wallet}
        title="This product isn't set up in your library yet"
        description="Add Monthly Money Reset to your library first."
        action={
          <Button href={`/app/activate/${definition.slug}`} size="md">
            Add to my library
          </Button>
        }
      />
    );
  }

  if (!state.setup.completedAt) {
    return (
      <EmptyState
        icon={ChartBar}
        title="Nothing to show yet"
        description="Progress builds up once setup is finished and the month gets underway."
        action={
          <Button href={`/app/products/${definition.slug}/setup`} size="md">
            Finish setup
          </Button>
        }
      />
    );
  }

  const breakdown = computeSafeToSpend(state);
  const paidBills = state.bills.filter((bill) => bill.status === "paid").length;
  const totalBills = state.bills.length;

  const firstCheckInWithSnapshot = state.checkIns.find((checkIn) => checkIn.safeToSpendAtMinorUnits !== undefined);
  const movement =
    firstCheckInWithSnapshot?.safeToSpendAtMinorUnits !== undefined
      ? breakdown.safeToSpend - firstCheckInWithSnapshot.safeToSpendAtMinorUnits
      : null;

  const groupsWithGuide = state.spendingGroups.filter((group) => group.guideAmountMinorUnits !== undefined);

  return (
    <ThemeScope>
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Bills handled"
          value={totalBills > 0 ? `${paidBills} of ${totalBills}` : "No bills added"}
          note={totalBills > 0 ? "Paid this cycle. The rest are already protected." : "Add bills in Setup to track this."}
        />
        <MetricCard
          label="Check-ins"
          value={String(state.checkIns.length)}
          note={state.checkIns.length > 0 ? "Completed this month." : "A short weekly check-in keeps this accurate."}
        />
        <MetricCard
          label="Reserve maintained"
          value={formatCurrency(breakdown.protectedReserveHeld, state.currency)}
          note="Still held back, not spent."
        />
      </div>

      <div className="rounded-2xl border border-[var(--border)] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Safe-to-Spend movement</p>
        {movement === null ? (
          <p className="mt-2 text-[13px] text-[var(--muted)]">
            Not enough history yet, movement shows up after your first check-in.
          </p>
        ) : (
          <p className="mt-2 text-[15px] font-semibold text-[var(--text)]">
            {movement >= 0 ? "Up" : "Down"} {formatCurrency(Math.abs(movement), state.currency)} since your first
            check-in this month.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Spending against your own guide</p>
        {groupsWithGuide.length === 0 ? (
          <p className="mt-2 text-[13px] text-[var(--muted)]">
            No spending guide set for any group yet. Add one in Setup if you'd like to compare.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {groupsWithGuide.map((group) => {
              const spent = state.activity
                .filter((entry) => entry.type === "spending" && entry.spendingGroupId === group.id)
                .reduce((total, entry) => total + entry.amountMinorUnits, 0);
              const guide = group.guideAmountMinorUnits ?? 0;
              const percent = guide > 0 ? Math.min(Math.round((spent / guide) * 100), 999) : 0;
              return (
                <div key={group.id}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-[var(--text)]">{group.name || group.kind}</span>
                    <span className="text-[var(--muted)]">
                      {formatCurrency(spent, state.currency)} of {formatCurrency(guide, state.currency)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className={`h-full rounded-full ${percent > 100 ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--faint)]">
        This is a record of what actually happened, not a competition. Nothing here tracks streaks or penalizes a
        quiet week.
      </p>
    </div>
    </ThemeScope>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">{label}</p>
      <p className="mt-1.5 text-[20px] font-semibold text-[var(--text)]">{value}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">{note}</p>
    </div>
  );
}
