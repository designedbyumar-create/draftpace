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
import { LoadErrorState } from "./shared";
import ThemeScope from "./ThemeScope";
import { listMyProductInstances, setProductInstanceLifecycle, startNextCycle, type ListInstancesResult } from "../data";
import { computeSafeToSpend } from "../calculations";
import { runCloseSequence, type CloseSequenceFailureStep } from "../closeSequence";
import { cycleKeyToLabel } from "@/product-framework/cycle";
import { formatCurrency } from "../currency";
import type { CarryForwardChoices } from "../state";

const DEFAULT_CHOICES: CarryForwardChoices = {
  recurringIncome: true,
  recurringBills: true,
  spendingGroups: true,
  reservePreference: true,
  checkInPreference: true,
};

const CLOSE_FAILURE_MESSAGES: Record<CloseSequenceFailureStep, (closedLabel: string, nextLabel: string) => string> = {
  "save-close": () => "Couldn't save this month's close. Nothing changed, check your connection and try again.",
  lifecycle: () => "This month saved as closed, but marking it complete failed. Try again to finish.",
  "start-next-cycle": (closedLabel, nextLabel) =>
    `${closedLabel} is closed, but starting ${nextLabel} failed. Try again to continue.`,
  "carry-forward": (closedLabel, nextLabel) =>
    `${closedLabel} is closed and ${nextLabel} was started, but carrying your details forward failed. Try again to finish, or open ${nextLabel} from your library and set it up directly.`,
};

function nextCycleKey(cycleKey: string): string {
  const [year, month] = cycleKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function HistoryModule({ definition }: { definition: ProductDefinition }) {
  const router = useRouter();
  const { status, instanceId, state, saveDirectly, retry } = useInstanceState(definition.slug);
  const [pastCyclesResult, setPastCyclesResult] = useState<ListInstancesResult | null>(null);
  const [pastCyclesRetryToken, setPastCyclesRetryToken] = useState(0);
  const [closing, setClosing] = useState(false);
  const [reflection, setReflection] = useState("");
  const [choices, setChoices] = useState<CarryForwardChoices>(DEFAULT_CHOICES);
  const [working, setWorking] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyProductInstances(definition.slug).then((result) => {
      if (!cancelled) setPastCyclesResult(result);
    });
    return () => {
      cancelled = true;
    };
  }, [definition.slug, pastCyclesRetryToken]);

  if (status === "loading") {
    return <p className="text-[13px] text-[var(--muted)]">Loading your history…</p>;
  }

  if (status === "error") {
    return <LoadErrorState onRetry={retry} />;
  }

  if (status === "no-instance" || !state || !instanceId) {
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
  const completedPastCycles =
    pastCyclesResult?.status === "ok"
      ? pastCyclesResult.rows.filter((row) => row.cycleKey !== state.cycle.cycleKey && row.lifecycleState === "completed")
      : [];

  /**
   * A checked, retryable sequence — the previous version ignored the result
   * of every step but the next-cycle creation, so a save failure could leave
   * the old cycle marked "completed" with no next cycle ever created, or
   * silently drop the carry-forward data, with the user routed away as if
   * everything had succeeded. See the MMR reliability pass, 2026-08-04.
   *
   * Each step only runs after the previous one is confirmed. On any
   * failure: stop, report which step failed, leave `closing` open with
   * `reflection`/`choices` untouched, and let the same button retry. Every
   * step here is safe to repeat: re-saving the same closed state or
   * re-marking the lifecycle "completed" is a harmless no-op, startNextCycle
   * reuses grant_free_product which is idempotent per (user, product,
   * cycle_key), and the carry-forward save below treats a conflict on the
   * brand-new instance as success rather than an error, since the only thing
   * that could already be at a later revision than 1 is this same sequence's
   * own earlier, unacknowledged attempt.
   */
  async function finishClose() {
    if (!state || !instanceId) return;
    setWorking(true);
    setCloseError(null);

    const newCycleKey = nextCycleKey(state.cycle.cycleKey);
    const newCycleLabel = cycleKeyToLabel(newCycleKey);
    const { saveMonthlyMoneyResetState } = await import("../data");

    const result = await runCloseSequence(
      {
        saveClosedState: saveDirectly,
        setLifecycle: setProductInstanceLifecycle,
        startNextCycle,
        saveNextCycleState: saveMonthlyMoneyResetState,
      },
      {
        productSlug: definition.slug,
        instanceId,
        previous: state,
        reflection,
        choices,
        newCycleKey,
        newCycleLabel,
        closedAt: new Date().toISOString(),
      }
    );

    if (result.status === "ok") {
      router.push(`/app/products/${definition.slug}/setup`);
      return;
    }

    setWorking(false);
    setCloseError(CLOSE_FAILURE_MESSAGES[result.step](state.cycle.label, newCycleLabel));
  }

  return (
    <ThemeScope>
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

          {closeError && (
            <p className="mt-4 text-[13px] font-semibold text-[var(--danger)]">{closeError}</p>
          )}

          <div className="mt-5 flex gap-2">
            <Button onClick={finishClose} disabled={working} iconLeft={<Check size={14} aria-hidden />}>
              {working ? "Closing…" : closeError ? "Try again" : `Close and start ${cycleKeyToLabel(nextCycleKey(state.cycle.cycleKey))}`}
            </Button>
            <Button variant="ghost" onClick={() => setClosing(false)} disabled={working}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Previous cycles</p>
        {pastCyclesResult?.status === "error" ? (
          <EmptyState
            icon={Clock}
            title="Couldn't load your previous cycles"
            description="This was just a read failure, not a sign anything's missing. Try again."
            action={
              <Button size="md" onClick={() => setPastCyclesRetryToken((t) => t + 1)}>
                Try again
              </Button>
            }
          />
        ) : completedPastCycles.length === 0 ? (
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
    </ThemeScope>
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
