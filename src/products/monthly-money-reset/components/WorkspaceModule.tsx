"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductDefinition } from "@/product-framework/definition";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import Badge from "@/design-system/Badge";
import { CalendarCheck, Check, Plus, Wallet, X } from "@/design-system/Icon";
import { useInstanceState } from "./useInstanceState";
import { LoadErrorState, SaveStatusIndicator } from "./shared";
import SafeToSpendCard from "./SafeToSpendCard";
import NextActionCard from "./NextActionCard";
import QuickAddModal from "./QuickAddModal";
import CheckInModal from "./CheckInModal";
import ThemeScope from "./ThemeScope";
import GuidedTour, { type TourStep } from "./GuidedTour";
import { computeSafeToSpend, markBillPaid, markBillSkipped } from "../calculations";
import { computeNextAction } from "../nextAction";
import { formatCurrency } from "../currency";
import type { ActivityEntry } from "../state";

type View = "overview" | "activity" | "plan" | "bills";

const VIEWS: { id: View; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "plan", label: "Spending plan" },
  { id: "bills", label: "Bills" },
];

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "mmr-tour-safe-to-spend",
    title: "Your one number",
    body: "Safe to spend now is what is genuinely free to spend, after your protected bills and the reserve you set aside. It re-settles the moment anything changes.",
  },
  {
    targetId: "mmr-tour-next-move",
    title: "One next move, never a to-do wall",
    body: "When something needs your attention, it shows up here as a single step. When nothing does, it stays quiet. You are never behind.",
  },
  {
    targetId: "mmr-tour-quick-add",
    title: "Add what changes",
    body: "Spent something, got paid, paid a bill? Add it here in a few taps and your number updates straight away.",
  },
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

const LABEL = "text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--mmr-sage-strong)]";

export default function WorkspaceModule({ definition }: { definition: ProductDefinition }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, state, saveStatus, setState, forceSave, retry } = useInstanceState(definition.slug);
  const [view, setView] = useState<View>("overview");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [tourOn, setTourOn] = useState(false);

  const setupDone = Boolean(state?.setup.completedAt);
  const replayRequested = searchParams.get("tour") === "1";

  useEffect(() => {
    if (!setupDone || typeof window === "undefined") return;

    // An explicit replay (Settings -> Replay tour) always starts the tour,
    // regardless of the first-use flag below — the query param is the
    // trigger, and it's cleared from the URL immediately so a refresh
    // doesn't re-trigger it. This never touches the first-use flag itself.
    if (replayRequested) {
      setTourOn(true);
      router.replace(`/app/products/${definition.slug}/workspace`);
      return;
    }

    const key = `draftpace-tour-${definition.slug}`;
    if (window.localStorage.getItem(key)) return;
    const timer = window.setTimeout(() => setTourOn(true), 550);
    return () => window.clearTimeout(timer);
  }, [setupDone, definition.slug, replayRequested, router]);

  const finishTour = useCallback(() => {
    setTourOn(false);
    if (typeof window !== "undefined") window.localStorage.setItem(`draftpace-tour-${definition.slug}`, "1");
  }, [definition.slug]);

  if (status === "loading") {
    return <p className="text-[13px] text-[var(--muted)]">Loading your Workspace…</p>;
  }

  if (status === "error") {
    return <LoadErrorState onRetry={retry} />;
  }

  if (status === "no-instance" || !state) {
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

  if (!state.setup.completedAt) {
    return (
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
    );
  }

  const breakdown = computeSafeToSpend(state);
  const nextAction = computeNextAction(state, breakdown);
  const upcomingBills = state.bills.filter((bill) => bill.status === "upcoming" || bill.status === "changed");
  const recentActivity = [...state.activity].reverse().slice(0, 5);

  function dismissNextAction() {
    if (!state || !nextAction) return;
    setState({ ...state, nextAction: { ...nextAction, dismissedAt: new Date().toISOString() } });
  }

  function actOnNextAction() {
    if (nextAction?.id === "weekly-check-in") setCheckInOpen(true);
    else setQuickAddOpen(true);
  }

  function payBill(billId: string) {
    if (!state) return;
    setState({ ...state, bills: markBillPaid(state.bills, billId, new Date().toISOString()) });
  }

  function skipBill(billId: string) {
    if (!state) return;
    setState({ ...state, bills: markBillSkipped(state.bills, billId) });
  }

  return (
    <ThemeScope>
      <div>
        {/* Hero: the one number and the one next move own the top. */}
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
          <div id="mmr-tour-safe-to-spend">
            <SafeToSpendCard
              breakdown={breakdown}
              currency={state.currency}
              updatedAt={state.updatedAt}
              weeksRemaining={weeksRemainingInCycle(state.cycle.cycleKey)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div id="mmr-tour-next-move" className="flex-1">
              <NextActionCard
                nextAction={nextAction}
                checkInDay={state.preferences.checkInDay}
                onDismiss={dismissNextAction}
                onAct={actOnNextAction}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                id="mmr-tour-quick-add"
                size="lg"
                fullWidth
                iconLeft={<Plus size={15} aria-hidden />}
                onClick={() => setQuickAddOpen(true)}
              >
                Quick add
              </Button>
              <button
                type="button"
                onClick={() => setCheckInOpen(true)}
                className="text-[12px] font-semibold text-[var(--mmr-muted)] hover:text-[var(--mmr-ink)]"
              >
                Do a weekly check-in
                {state.checkIns.length > 0 ? ` · ${state.checkIns.length} done this month` : ""}
              </button>
            </div>
          </div>
        </div>

        {/* A closer look: a quiet, subordinate control, clearly below the hero. */}
        <div className="mt-10 border-t border-[var(--mmr-line)] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="A closer look" className="flex flex-wrap gap-1">
              {VIEWS.map((item, index) => {
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mmr-view-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={`mmr-viewpanel-${item.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setView(item.id)}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                      event.preventDefault();
                      const nextIndex =
                        event.key === "ArrowRight" ? (index + 1) % VIEWS.length : (index - 1 + VIEWS.length) % VIEWS.length;
                      setView(VIEWS[nextIndex].id);
                      document.getElementById(`mmr-view-${VIEWS[nextIndex].id}`)?.focus();
                    }}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                      active
                        ? "bg-[var(--mmr-sage-pale)] text-[var(--mmr-forest-900)]"
                        : "text-[var(--mmr-muted)] hover:text-[var(--mmr-ink)]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <SaveStatusIndicator status={saveStatus} />
          </div>

          <div className="mt-6">
            {view === "overview" && (
              <div id="mmr-viewpanel-overview" role="tabpanel" aria-labelledby="mmr-view-overview" className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className={LABEL}>Recently changed</p>
                  {recentActivity.length === 0 ? (
                    <p className="mt-3 text-[13px] text-[var(--mmr-muted)]">Nothing recorded yet. Use Quick add when something changes.</p>
                  ) : (
                    <div className="mt-3 flex flex-col divide-y divide-[var(--mmr-line)]">
                      {recentActivity.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between gap-4 py-2.5">
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--mmr-ink)]">{activityLabel(entry)}</p>
                            {entry.note && <p className="mt-0.5 text-[12px] text-[var(--mmr-muted)]">{entry.note}</p>}
                          </div>
                          <p className="text-[13px] font-semibold text-[var(--mmr-ink)]">
                            {formatCurrency(entry.amountMinorUnits, state.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  <div>
                    <p className={LABEL}>What&apos;s protected</p>
                    <div className="mt-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[var(--mmr-muted)]">Bills not yet paid</span>
                        <span className="font-semibold text-[var(--mmr-ink)]">{formatCurrency(breakdown.protectedUnpaidBills, state.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-[var(--mmr-muted)]">Reserve still held</span>
                        <span className="font-semibold text-[var(--mmr-ink)]">{formatCurrency(breakdown.protectedReserveHeld, state.currency)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className={LABEL}>Upcoming bills</p>
                      {upcomingBills.length > 0 && (
                        <button type="button" onClick={() => setView("bills")} className="text-[11px] font-semibold text-[var(--mmr-clay)] hover:underline">
                          See all
                        </button>
                      )}
                    </div>
                    {upcomingBills.length === 0 ? (
                      <p className="mt-3 text-[13px] text-[var(--mmr-muted)]">Every bill is handled for this month.</p>
                    ) : (
                      <div className="mt-3 flex flex-col divide-y divide-[var(--mmr-line)]">
                        {upcomingBills.slice(0, 3).map((bill) => (
                          <div key={bill.id} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                            <span className="text-[var(--mmr-ink)]">{bill.name || "Bill"}</span>
                            <span className="font-semibold text-[var(--mmr-muted)]">{formatCurrency(bill.amountMinorUnits, state.currency)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {view === "activity" && (
              <div id="mmr-viewpanel-activity" role="tabpanel" aria-labelledby="mmr-view-activity">
                {state.activity.length === 0 ? (
                  <EmptyState icon={Wallet} title="No activity yet" description="Spending, income, and bill payments will show up here as you add them." />
                ) : (
                  <div className="flex flex-col divide-y divide-[var(--mmr-line)]">
                    {[...state.activity].reverse().map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-4 py-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge tone="neutral">{activityLabel(entry)}</Badge>
                            <p className="text-[12px] text-[var(--mmr-muted-2)]">{new Date(entry.date).toLocaleDateString()}</p>
                          </div>
                          {entry.note && <p className="mt-1 text-[12px] text-[var(--mmr-muted)]">{entry.note}</p>}
                        </div>
                        <p className="text-[13px] font-semibold text-[var(--mmr-ink)]">
                          {formatCurrency(entry.amountMinorUnits, state.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === "plan" && (
              <div id="mmr-viewpanel-plan" role="tabpanel" aria-labelledby="mmr-view-plan">
                {state.spendingGroups.length === 0 ? (
                  <EmptyState icon={Wallet} title="No spending groups yet" description="Add spending groups in Setup to see them here." />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {state.spendingGroups.map((group) => {
                      const spent = state.activity
                        .filter((entry) => entry.type === "spending" && entry.spendingGroupId === group.id)
                        .reduce((total, entry) => total + entry.amountMinorUnits, 0);
                      return (
                        <div key={group.id} className="rounded-xl border border-[var(--mmr-line)] p-4">
                          <p className="text-[13px] font-semibold capitalize text-[var(--mmr-ink)]">{group.name || group.kind}</p>
                          <p className="mt-2 text-[18px] font-semibold text-[var(--mmr-ink)]">{formatCurrency(spent, state.currency)}</p>
                          <p className="mt-0.5 text-[11px] text-[var(--mmr-muted)]">recorded this month</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {view === "bills" && (
              <div id="mmr-viewpanel-bills" role="tabpanel" aria-labelledby="mmr-view-bills" className="flex flex-col gap-2">
                {state.bills.length === 0 ? (
                  <EmptyState icon={CalendarCheck} title="No bills added yet" description="Add bills in Setup so Draftpace can protect them." />
                ) : (
                  state.bills.map((bill) => (
                    <div key={bill.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--mmr-line)] p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-[var(--mmr-ink)]">{bill.name || "Bill"}</p>
                          {bill.protected && <Badge tone="primary">Protected</Badge>}
                          <Badge tone={bill.status === "paid" ? "success" : bill.status === "skipped" ? "neutral" : "warning"}>
                            {bill.status}
                          </Badge>
                        </div>
                        {bill.dueDate && <p className="mt-1 text-[12px] text-[var(--mmr-muted)]">Due {bill.dueDate}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-[13px] font-semibold text-[var(--mmr-ink)]">{formatCurrency(bill.amountMinorUnits, state.currency)}</p>
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
          </div>
        </div>

        {quickAddOpen && (
          <QuickAddModal
            state={state}
            onApply={async (next) => {
              setState(next);
              return forceSave();
            }}
            onClose={() => setQuickAddOpen(false)}
          />
        )}
        {checkInOpen && (
          <CheckInModal
            state={state}
            onApply={async (next) => {
              setState(next);
              return forceSave();
            }}
            onClose={() => setCheckInOpen(false)}
          />
        )}
      </div>

      {tourOn && <GuidedTour steps={TOUR_STEPS} onFinish={finishTour} />}
    </ThemeScope>
  );
}
