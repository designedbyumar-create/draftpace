"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Target, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listSavingsGoals, createSavingsGoal, updateSavingsGoal, archiveSavingsGoal } from "../domain/savingsGoals";
import type { SavingsGoal } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import SavingsFormSheet, { savingsFormValuesToPatch, type SavingsFormValues } from "./savings/SavingsFormSheet";
import {
  summarizeSavings,
  resolveDominantAction,
  describeSavingsIncompleteness,
  progressPercent,
  monthlyContributionNeededMinorUnits,
} from "./savings/savingsLogic";
import { describeResultError } from "@/product-framework/result";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

export default function SavingsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findPersonalFinanceCompanionInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    setInstanceId(found.id);
    const result = await listSavingsGoals(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setGoals(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: SavingsFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your account. Try reloading the page.";
    if (editingGoal) {
      const result = await updateSavingsGoal(editingGoal.id, savingsFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      setGoals((prev) => prev.map((g) => (g.id === result.data.id ? result.data : g)));
      return null;
    }
    const result = await createSavingsGoal(instanceId, savingsFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    setGoals((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(goal: SavingsGoal) {
    const result = await archiveSavingsGoal(goal.id);
    if (result.ok) setGoals((prev) => prev.map((g) => (g.id === result.data.id ? result.data : g)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading savings…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Target}
        title="Couldn't load your savings goals"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance") {
    return <EmptyState icon={Target} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = goals.filter((g) => g.status !== "archived");
  const archived = goals.filter((g) => g.status === "archived");
  const summary = summarizeSavings(goals);
  const dominantAction = resolveDominantAction(goals);

  return (
    <SectionShell
      icon={Target}
      title="Savings"
      purpose="Money set aside on purpose: emergencies, goals, or costs seen coming."
      onAdd={() => {
        setEditingGoal(null);
        setFormOpen(true);
      }}
      addLabel="Add goal"
      summary={
        <StatRow>
          <StatTile label="Saved" value={formatCurrency(summary.totalSavedMinorUnits, "USD")} />
          <StatTile label="Target" value={formatCurrency(summary.totalTargetMinorUnits, "USD")} />
          <StatTile label="Goals" value={String(summary.activeCount)} />
          <StatTile label="Missing date" value={String(summary.missingTargetDateCount)} tone="muted" />
        </StatRow>
      }
      dominantAction={
        dominantAction?.kind === "add-first" ? (
          <p className="text-[13px] leading-relaxed text-[var(--text)]">
            No savings goals yet. Add one directly. An emergency fund is a good place to start.
          </p>
        ) : dominantAction?.kind === "add-target-date" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] leading-relaxed text-[var(--text)]">
              {dominantAction.goal.name}
              {" "}doesn&apos;t have a target date yet.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingGoal(dominantAction.goal);
                setFormOpen(true);
              }}
            >
              Add target date
            </Button>
          </div>
        ) : null
      }
    >
      {active.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No savings goals yet"
          description="Add an emergency fund, a specific goal, or money set aside for a cost you can see coming."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add goal
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((goal) => (
            <SavingsCard
              key={goal.id}
              goal={goal}
              onEdit={() => {
                setEditingGoal(goal);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(goal)}
            />
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            {showArchived ? "Hide" : "Show"}{" "}{archived.length} closed{" "}{archived.length === 1 ? "goal" : "goals"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((goal) => (
                <SavingsCard key={goal.id} goal={goal} onEdit={() => {}} onArchive={() => {}} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}

      <SavingsFormSheet open={formOpen} goal={editingGoal} onClose={() => setFormOpen(false)} onSave={handleSave} triggerRef={addButtonRef} />
    </SectionShell>
  );
}

function SavingsCard({
  goal,
  onEdit,
  onArchive,
  readOnly = false,
}: {
  goal: SavingsGoal;
  onEdit: () => void;
  onArchive: () => void;
  readOnly?: boolean;
}) {
  const incompleteMessage = describeSavingsIncompleteness(goal);
  const effectiveStatus = incompleteMessage ? "confirmedIncomplete" : goal.status;
  const progress = progressPercent(goal);
  const monthlyNeeded = monthlyContributionNeededMinorUnits(goal);

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex flex-wrap items-start gap-2">
            <p className="min-w-0 text-[14px] font-semibold text-[var(--text)]">{goal.name}</p>
            <Badge tone={STATUS_TONE[effectiveStatus]}>{STATUS_LABEL[effectiveStatus]}</Badge>
          </div>
          <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text)]">
            {formatCurrency(goal.savedAmountMinorUnits, goal.currency)}
            <span className="text-[13px] font-medium text-[var(--muted)]"> of {formatCurrency(goal.targetAmountMinorUnits, goal.currency)}</span>
          </p>
          {progress !== null && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
            </div>
          )}
          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            {goal.targetDate ? `Target ${goal.targetDate}` : "No target date"}
            {monthlyNeeded !== null && monthlyNeeded > 0 ? ` · ${formatCurrency(monthlyNeeded, goal.currency)}/month needed` : ""}
          </p>
          {incompleteMessage && <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--warning)]">{incompleteMessage}</p>}
        </button>
        {!readOnly && (
          <Button size="sm" variant="ghost" onClick={onArchive}>
            Close
          </Button>
        )}
      </div>
    </li>
  );
}
