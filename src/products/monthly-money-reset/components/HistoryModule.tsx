"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDefinition } from "@/product-framework/definition";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import Badge from "@/design-system/Badge";
import Toggle from "@/design-system/Toggle";
import { Check, Clock } from "@/design-system/Icon";
import { useInstanceState } from "./useInstanceState";
import { listMyProductInstances, setProductInstanceLifecycle, startNextCycle, type ProductInstanceSummary } from "../data";
import { computeSafeToSpend } from "../calculations";
import { buildNextCycleState } from "../carryForward";
import { cycleKeyToLabel } from "../cycle";
import { formatCurrency } from "../currency";
import type { CarryForwardChoices } from "../state";

const DEFAULT_CHOICES: CarryForwardChoices = {
  recurringIncome: true,
  recurringBills: true,
  spendingGroups: true,
  reservePreference: true,
  checkInPreference: true,
};

function nextCycleKey(cycleKey: string): string {
  const [year, month] = cycleKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function HistoryModule({ definition }: { definition: ProductDefinition }) {
  const router = useRouter();
  const { status, instanceId, state, setState, forceSave } = useInstanceState(definition.slug);
  const [pastCycles, setPastCycles] = useState<ProductInstanceSummary[] | null>(null);
  const [closing, setClosing] = useState(false);
  const [reflection, setReflection] = useState("");
  const [choices, setChoices] = useState<CarryForwardChoices>(DEFAULT_CHOICES);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listMyProductInstances(definition.slug).then((rows) => {
      if (!cancelled) setPastCycles(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [definition.slug]);

  if (status === "loading") {
    return <p className="text-[13px] text-[var(--muted)]">Loading your history…</p>;
  }

  if (status === "no-instance" || status === "error" || !state || !instanceId) {
    return (
      <EmptyState
        icon={Clock}
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

  const breakdown = computeSafeToSpend(state);
  const unresolvedBills = state.bills.filter((bill) => bill.status === "upcoming" || bill.status === "changed");
  const expectedIncome = state.income.filter((entry) => entry.status === "expected");
  const alreadyClosed = state.cycle.closedAt !== undefined;
  const completedPastCycles = (pastCycles ?? []).filter(
    (row) => row.cycleKey !== state.cycle.cycleKey && row.lifecycleState === "completed"
  );

  async function finishClose() {
    if (!state || !instanceId) return;
    setWorking(true);

    const closedAt = new Date().toISOString();
    const closedState = {
      ...state,
      cycle: { ...state.cycle, closedAt },
      completion: {
        closedAt,
        closingSafeToSpendMinorUnits: breakdown.safeToSpend,
        reflection: reflection || undefined,
        carryForward: choices,
      },
    };
    setState(closedState);
    await forceSave();
    await setProductInstanceLifecycle(instanceId, "completed");

    const newCycleKey = nextCycleKey(state.cycle.cycleKey);
    const result = await startNextCycle(definition.slug, newCycleKey);
    if (result.status === "ok") {
      const nextState = buildNextCycleState({
        previous: state,
        previousInstanceId: instanceId,
        cycleKey: newCycleKey,
        cycleLabel: cycleKeyToLabel(newCycleKey),
        choices,
      });
      // This runs against the brand-new instance's own revision (1), not the
      // closed cycle's — save_monthly_money_reset_state is instance-scoped.
      await import("../data").then(({ saveMonthlyMoneyResetState }) =>
        saveMonthlyMoneyResetState({
          instanceId: result.instanceId,
          expectedRevision: 1,
          state: nextState,
          setupComplete: false,
          safeToSpendMinorUnits: 0,
          nextActionLabel: null,
        })
      );
      router.push(`/app/products/${definition.slug}/setup`);
    } else {
      router.push("/app/library");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[var(--border)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Current cycle</p>
            <p className="mt-1 text-[16px] font-semibold text-[var(--text)]">{state.cycle.label}</p>
          </div>
          {alreadyClosed ? (
            <Badge tone="success">Closed</Badge>
          ) : (
            <Badge tone="neutral">In progress</Badge>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4">
          <div>
            <p className="text-[var(--faint)]">Activity</p>
            <p className="font-semibold text-[var(--text)]">{state.activity.length}</p>
          </div>
          <div>
            <p className="text-[var(--faint)]">Check-ins</p>
            <p className="font-semibold text-[var(--text)]">{state.checkIns.length}</p>
          </div>
          <div>
            <p className="text-[var(--faint)]">Bills unresolved</p>
            <p className="font-semibold text-[var(--text)]">{unresolvedBills.length}</p>
          </div>
          <div>
            <p className="text-[var(--faint)]">Safe to spend</p>
            <p className="font-semibold text-[var(--text)]">{formatCurrency(breakdown.safeToSpend, state.currency)}</p>
          </div>
        </div>

        {!alreadyClosed && !closing && (
          <Button className="mt-4" onClick={() => setClosing(true)}>
            Close {state.cycle.label}
          </Button>
        )}
      </div>

      {closing && !alreadyClosed && (
        <div className="rounded-2xl border border-[var(--border)] p-5">
          <p className="text-[13px] font-semibold text-[var(--text)]">Before you close</p>

          {(unresolvedBills.length > 0 || expectedIncome.length > 0) && (
            <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-[var(--muted)]">
              {unresolvedBills.length > 0 && (
                <p>
                  {unresolvedBills.length} bill{unresolvedBills.length === 1 ? "" : "s"} still not marked paid or
                  skipped, they&apos;ll carry into next month as unresolved.
                </p>
              )}
              {expectedIncome.length > 0 && (
                <p>{expectedIncome.length} income source(s) still marked expected rather than received.</p>
              )}
              <p>Review anything missing in the Workspace before continuing, if you&apos;d like.</p>
            </div>
          )}

          <p className="mt-4 text-[13px] font-semibold text-[var(--text)]">Closing Safe-to-Spend</p>
          <p className="mt-1 text-[20px] font-semibold text-[var(--text)]">
            {formatCurrency(breakdown.safeToSpend, state.currency)}
          </p>

          <label className="mt-4 block text-[13px] font-semibold text-[var(--text)]" htmlFor="reflection">
            How did this month go? <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <textarea
            id="reflection"
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-[14px] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          />

          <p className="mt-5 text-[13px] font-semibold text-[var(--text)]">Carry into next month</p>
          <div className="mt-2 flex flex-col divide-y divide-[var(--border)]">
            <CarryForwardRow
              label="Recurring income"
              checked={choices.recurringIncome}
              onChange={(checked) => setChoices({ ...choices, recurringIncome: checked })}
            />
            <CarryForwardRow
              label="Recurring bills"
              checked={choices.recurringBills}
              onChange={(checked) => setChoices({ ...choices, recurringBills: checked })}
            />
            <CarryForwardRow
              label="Spending groups"
              checked={choices.spendingGroups}
              onChange={(checked) => setChoices({ ...choices, spendingGroups: checked })}
            />
            <CarryForwardRow
              label="Reserve preference"
              checked={choices.reservePreference}
              onChange={(checked) => setChoices({ ...choices, reservePreference: checked })}
            />
            <CarryForwardRow
              label="Check-in preference"
              checked={choices.checkInPreference}
              onChange={(checked) => setChoices({ ...choices, checkInPreference: checked })}
            />
          </div>

          <div className="mt-5 flex gap-2">
            <Button onClick={finishClose} disabled={working} iconLeft={<Check size={14} aria-hidden />}>
              {working ? "Closing…" : `Close and start ${cycleKeyToLabel(nextCycleKey(state.cycle.cycleKey))}`}
            </Button>
            <Button variant="ghost" onClick={() => setClosing(false)} disabled={working}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Previous cycles</p>
        {completedPastCycles.length === 0 ? (
          <EmptyState icon={Clock} title="No completed months yet" description="Closed cycles show up here once you've closed your first month." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {completedPastCycles.map((cycle) => (
              <div key={cycle.id} className="rounded-xl border border-[var(--border)] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">{cycleKeyToLabel(cycle.cycleKey)}</p>
                <p className="mt-1.5 text-[16px] font-semibold text-[var(--text)]">
                  {cycle.safeToSpendMinorUnits !== null ? formatCurrency(cycle.safeToSpendMinorUnits, state.currency) : "Not available"}
                </p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">safe to spend at close</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CarryForwardRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <p className="text-[13px] text-[var(--text)]">{label}</p>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
