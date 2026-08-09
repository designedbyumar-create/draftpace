"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CreditCard, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listDebts, createDebt, updateDebt, archiveDebt } from "../domain/debts";
import type { Debt } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import DebtFormSheet, { debtFormValuesToPatch, type DebtFormValues } from "./debt/DebtFormSheet";
import { summarizeDebts, resolveDominantAction, describeDebtIncompleteness } from "./debt/debtLogic";
import { describeResultError } from "@/product-framework/result";
import { createUserReminder } from "../domain/reminders";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const REMIND_ME_DELAY_DAYS = 3;

export default function DebtModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [reminderSetFor, setReminderSetFor] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);

  async function remindMeAboutRate(debt: Debt) {
    if (!instanceId) return;
    const nextEligibleAt = new Date(Date.now() + REMIND_ME_DELAY_DAYS * 24 * 60 * 60 * 1000);
    const result = await createUserReminder(instanceId, {
      entityType: "debt",
      entityId: debt.id,
      note: `Add an interest rate for ${debt.name}.`,
      schedule: { kind: "daysBefore", targetDate: nextEligibleAt.toISOString().slice(0, 10), days: 0 },
      nextEligibleAt: nextEligibleAt.toISOString(),
    });
    if (result.ok) setReminderSetFor(debt.id);
  }

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
    const result = await listDebts(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setDebts(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: DebtFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your account. Try reloading the page.";
    if (editingDebt) {
      const balanceChanged = Math.round(Number(values.balanceMajorUnits) * 100) !== editingDebt.balanceMinorUnits;
      const result = await updateDebt(editingDebt.id, debtFormValuesToPatch(values, balanceChanged));
      if (!result.ok) return describeResultError(result.error);
      setDebts((prev) => prev.map((d) => (d.id === result.data.id ? result.data : d)));
      return null;
    }
    const result = await createDebt(instanceId, debtFormValuesToPatch(values, true));
    if (!result.ok) return describeResultError(result.error);
    setDebts((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(debt: Debt) {
    const result = await archiveDebt(debt.id);
    if (result.ok) setDebts((prev) => prev.map((d) => (d.id === result.data.id ? result.data : d)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading debt…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={CreditCard}
        title="Couldn't load your debt"
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
    return <EmptyState icon={CreditCard} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = debts.filter((d) => d.status !== "archived");
  const archived = debts.filter((d) => d.status === "archived");
  const summary = summarizeDebts(debts);
  const dominantAction = resolveDominantAction(debts);

  return (
    <SectionShell
      icon={CreditCard}
      title="Debt"
      purpose="What's owed. No payoff calculator here, just an accurate, current picture."
      onAdd={() => {
        setEditingDebt(null);
        setFormOpen(true);
      }}
      addLabel="Add debt"
      summary={
        <StatRow>
          <StatTile label="Total balance" value={formatCurrency(summary.totalBalanceMinorUnits, "USD")} />
          <StatTile label="Minimum payments" value={formatCurrency(summary.totalMinimumPaymentMinorUnits, "USD")} />
          <StatTile label="Debts" value={String(summary.activeCount)} />
          <StatTile label="Missing rate" value={String(summary.missingInterestRateCount)} tone="muted" />
        </StatRow>
      }
      dominantAction={
        dominantAction?.kind === "add-first" ? (
          <p className="text-[13px] leading-relaxed text-[var(--text)]">
            No debts yet. Add one directly so Draftpace can keep an accurate picture of what&apos;s owed.
          </p>
        ) : dominantAction?.kind === "add-interest-rate" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] leading-relaxed text-[var(--text)]">
              Your {dominantAction.debt.name} debt is saved. Add the interest rate to calculate a reliable payoff timeline.
            </p>
            <div className="flex items-center gap-2">
              {reminderSetFor === dominantAction.debt.id ? (
                <span className="text-[12px] font-medium text-[var(--success)]">Reminder set</span>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => remindMeAboutRate(dominantAction.debt)}>
                  Remind me
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setEditingDebt(dominantAction.debt);
                  setFormOpen(true);
                }}
              >
                Add rate
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {active.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No debts yet"
          description="Add a credit card, loan, or anything else you owe money on."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add debt
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onEdit={() => {
                setEditingDebt(debt);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(debt)}
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
            {showArchived ? "Hide" : "Show"} {archived.length} closed {archived.length === 1 ? "debt" : "debts"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((debt) => (
                <DebtCard key={debt.id} debt={debt} onEdit={() => {}} onArchive={() => {}} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}

      <DebtFormSheet open={formOpen} debt={editingDebt} onClose={() => setFormOpen(false)} onSave={handleSave} triggerRef={addButtonRef} />
    </SectionShell>
  );
}

const DEBT_TYPE_LABEL: Record<Debt["type"], string> = {
  creditCard: "Credit card",
  personalLoan: "Personal loan",
  studentLoan: "Student loan",
  autoLoan: "Auto loan",
  mortgage: "Mortgage",
  other: "Other",
};

function DebtCard({
  debt,
  onEdit,
  onArchive,
  readOnly = false,
}: {
  debt: Debt;
  onEdit: () => void;
  onArchive: () => void;
  readOnly?: boolean;
}) {
  const incompleteMessage = describeDebtIncompleteness(debt);
  const effectiveStatus = incompleteMessage ? "confirmedIncomplete" : debt.status;

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-[var(--text)]">{debt.name}</p>
            <Badge tone={STATUS_TONE[effectiveStatus]}>{STATUS_LABEL[effectiveStatus]}</Badge>
          </div>
          <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text)]">
            {formatCurrency(debt.balanceMinorUnits, debt.currency)}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {DEBT_TYPE_LABEL[debt.type]} · min {formatCurrency(debt.minimumPaymentMinorUnits, debt.currency)}
            {debt.interestRate !== null ? ` · ${debt.interestRate}% APR` : ""}
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
