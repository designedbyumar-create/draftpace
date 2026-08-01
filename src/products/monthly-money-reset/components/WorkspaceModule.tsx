"use client";

import { useState } from "react";
import type { ProductDefinition } from "@/product-framework/definition";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import Badge from "@/design-system/Badge";
import { CalendarCheck, Check, Plus, Wallet, X } from "@/design-system/Icon";
import { useInstanceState } from "./useInstanceState";
import { SaveStatusIndicator } from "./shared";
import SafeToSpendCard from "./SafeToSpendCard";
import NextActionCard from "./NextActionCard";
import QuickAddModal from "./QuickAddModal";
import { computeSafeToSpend, markBillPaid, markBillSkipped } from "../calculations";
import { computeNextAction } from "../nextAction";
import { formatCurrency } from "../currency";
import type { ActivityEntry, MonthlyMoneyResetState } from "../state";

type Tab = "overview" | "activity" | "plan" | "bills";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "plan", label: "Spending plan" },
  { id: "bills", label: "Bills" },
];

function weeksRemainingInCycle(cycleKey: string, now: Date = new Date()): number {
  const [year, month] = cycleKey.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dayOfMonth = now.getUTCDate();
  return Math.max(Math.ceil((daysInMonth - dayOfMonth + 1) / 7), 1);
}

function activityLabel(entry: ActivityEntry): string {
  switch (entry.type) {
    case "spending":
      return "Spending";
    case "income_received":
      return "Income received";
    case "bill_paid":
      return "Bill paid";
    case "savings_transfer":
      return "Savings set aside";
    case "correction":
      return "Correction";
    default:
      return "Setup change";
  }
}

export default function WorkspaceModule({ definition }: { definition: ProductDefinition }) {
  const { status, state, saveStatus, setState } = useInstanceState(definition.slug);
  const [tab, setTab] = useState<Tab>("overview");
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  if (status === "loading") {
    return <p className="text-[13px] text-[var(--muted)]">Loading your Workspace…</p>;
  }

  if (status === "no-instance" || status === "error" || !state) {
    return (
      <EmptyState
        icon={Wallet}
        title="This product isn't set up in your library yet"
        description="Add Monthly Money Reset to your library first, then come back here."
        action={
          <Button href={`/app/activate/${definition.slug}`} size="md">
            Add to my library
          </Button>
        }
      />
    );
  }

  const breakdown = computeSafeToSpend(state);
  const nextAction = computeNextAction(state, breakdown);

  function dismissNextAction() {
    if (!state || !nextAction) return;
    setState({ ...state, nextAction: { ...nextAction, dismissedAt: new Date().toISOString() } });
  }

  function applyQuickAdd(next: MonthlyMoneyResetState) {
    setState(next);
    setQuickAddOpen(false);
  }

  function payBill(billId: string) {
    if (!state) return;
    setState({ ...state, bills: markBillPaid(state.bills, billId, new Date().toISOString()) });
  }

  function skipBill(billId: string) {
    if (!state) return;
    setState({ ...state, bills: markBillSkipped(state.bills, billId) });
  }

  const upcomingBills = state.bills.filter((bill) => bill.status === "upcoming" || bill.status === "changed");
  const recentActivity = [...state.activity].reverse().slice(0, 5);

  if (!state.setup.completedAt) {
    return (
      <div>
        <EmptyState
          icon={Wallet}
          title="Finish setup for a complete picture"
          description="You can still look around, but Safe-to-Spend won't be accurate until setup is finished."
          action={
            <Button href={`/app/products/${definition.slug}/setup`} size="md">
              Finish setup
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div role="tablist" aria-label="Workspace sections" className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--border)] p-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-[12px] font-semibold transition-colors ${
                tab === item.id ? "bg-[var(--text)] text-[var(--bg)]" : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <SaveStatusIndicator status={saveStatus} />
          <Button size="md" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setQuickAddOpen(true)}>
            Quick add
          </Button>
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5">
            <SafeToSpendCard
              breakdown={breakdown}
              currency={state.currency}
              updatedAt={state.updatedAt}
              weeksRemaining={weeksRemainingInCycle(state.cycle.cycleKey)}
            />
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Recently changed</p>
              {recentActivity.length === 0 ? (
                <EmptyState icon={Wallet} title="Nothing recorded yet" description="Use Quick Add once something changes." />
              ) : (
                <div className="flex flex-col divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                  {recentActivity.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--text)]">{activityLabel(entry)}</p>
                        {entry.note && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{entry.note}</p>}
                      </div>
                      <p className="text-[13px] font-semibold text-[var(--text)]">
                        {formatCurrency(entry.amountMinorUnits, state.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <NextActionCard nextAction={nextAction} onDismiss={dismissNextAction} onQuickAdd={() => setQuickAddOpen(true)} />

            <div className="rounded-2xl border border-[var(--border)] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">What&apos;s protected</p>
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[var(--muted)]">Bills not yet paid</span>
                  <span className="font-semibold text-[var(--text)]">
                    {formatCurrency(breakdown.protectedUnpaidBills, state.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[var(--muted)]">Reserve held</span>
                  <span className="font-semibold text-[var(--text)]">
                    {formatCurrency(breakdown.protectedReserveHeld, state.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Upcoming bills</p>
                <button type="button" onClick={() => setTab("bills")} className="text-[11px] font-semibold text-[var(--primary)] hover:underline">
                  See all
                </button>
              </div>
              {upcomingBills.length === 0 ? (
                <p className="mt-3 text-[13px] text-[var(--muted)]">Every bill is handled for this month.</p>
              ) : (
                <div className="mt-3 flex flex-col gap-2">
                  {upcomingBills.slice(0, 3).map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="text-[var(--text)]">{bill.name || "Bill"}</span>
                      <span className="font-semibold text-[var(--muted)]">{formatCurrency(bill.amountMinorUnits, state.currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div>
          {state.activity.length === 0 ? (
            <EmptyState icon={Wallet} title="No activity yet" description="Spending, income, and bill payments will show up here as you add them." />
          ) : (
            <div className="flex flex-col divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
              {[...state.activity].reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{activityLabel(entry)}</Badge>
                      <p className="text-[12px] text-[var(--faint)]">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    {entry.note && <p className="mt-1 text-[12px] text-[var(--muted)]">{entry.note}</p>}
                  </div>
                  <p className="text-[13px] font-semibold text-[var(--text)]">
                    {formatCurrency(entry.amountMinorUnits, state.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "plan" && (
        <div>
          {state.spendingGroups.length === 0 ? (
            <EmptyState icon={Wallet} title="No spending groups yet" description="Add spending groups in Setup to see them here." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {state.spendingGroups.map((group) => {
                const spent = state.activity
                  .filter((entry) => entry.type === "spending" && entry.spendingGroupId === group.id)
                  .reduce((total, entry) => total + entry.amountMinorUnits, 0);
                return (
                  <div key={group.id} className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-[13px] font-semibold text-[var(--text)] capitalize">{group.name || group.kind}</p>
                    <p className="mt-2 text-[18px] font-semibold text-[var(--text)]">{formatCurrency(spent, state.currency)}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--muted)]">recorded this month</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "bills" && (
        <div className="flex flex-col gap-2">
          {state.bills.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No bills added yet" description="Add bills in Setup so Draftpace can protect them." />
          ) : (
            state.bills.map((bill) => (
              <div key={bill.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-[var(--text)]">{bill.name || "Bill"}</p>
                    {bill.protected && <Badge tone="primary">Protected</Badge>}
                    <Badge tone={bill.status === "paid" ? "success" : bill.status === "skipped" ? "neutral" : "warning"}>
                      {bill.status}
                    </Badge>
                  </div>
                  {bill.dueDate && <p className="mt-1 text-[12px] text-[var(--muted)]">Due {bill.dueDate}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[13px] font-semibold text-[var(--text)]">{formatCurrency(bill.amountMinorUnits, state.currency)}</p>
                  {(bill.status === "upcoming" || bill.status === "changed") && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="secondary" iconLeft={<Check size={12} aria-hidden />} onClick={() => payBill(bill.id)}>
                        Mark paid
                      </Button>
                      <Button size="sm" variant="ghost" iconLeft={<X size={12} aria-hidden />} onClick={() => skipBill(bill.id)}>
                        Skip
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {quickAddOpen && <QuickAddModal state={state} onApply={applyQuickAdd} onClose={() => setQuickAddOpen(false)} />}
    </div>
  );
}
