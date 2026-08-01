"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { CalendarCheck, CreditCard, RotateCcw, Target, Wallet, X } from "@/design-system/Icon";
import { AmountField, generateId } from "./shared";
import { computeSafeToSpend } from "../calculations";
import { formatCurrency } from "../currency";
import type { MonthlyMoneyResetState } from "../state";

type QuickAddType = "spending" | "income" | "bill" | "savings" | "correction";

const TYPES: { id: QuickAddType; label: string; icon: typeof CreditCard }[] = [
  { id: "spending", label: "Spending", icon: CreditCard },
  { id: "income", label: "Income received", icon: Wallet },
  { id: "bill", label: "Bill paid", icon: CalendarCheck },
  { id: "savings", label: "Savings set aside", icon: Target },
  { id: "correction", label: "Correction", icon: RotateCcw },
];

export default function QuickAddModal({
  state,
  onApply,
  onClose,
}: {
  state: MonthlyMoneyResetState;
  onApply: (next: MonthlyMoneyResetState) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<QuickAddType>("spending");
  const [amountMinorUnits, setAmountMinorUnits] = useState(0);
  const [note, setNote] = useState("");
  const [selectedIncomeId, setSelectedIncomeId] = useState("");
  const [selectedBillId, setSelectedBillId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dedupeKey] = useState(() => generateId("submit"));
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const expectedIncome = state.income.filter((entry) => entry.status === "expected");
  const unpaidBills = state.bills.filter((bill) => bill.status === "upcoming" || bill.status === "changed");
  const currentBreakdown = computeSafeToSpend(state);

  function buildNextState(): MonthlyMoneyResetState | null {
    const now = new Date().toISOString();

    if (type === "spending") {
      if (amountMinorUnits <= 0) return null;
      return {
        ...state,
        activity: [
          ...state.activity,
          {
            id: generateId("act"),
            type: "spending",
            amountMinorUnits,
            date: now,
            note: note || undefined,
            spendingGroupId: selectedGroupId || undefined,
            dedupeKey,
          },
        ],
        lastMeaningfulActivityAt: now,
      };
    }

    if (type === "income") {
      if (!selectedIncomeId) return null;
      return {
        ...state,
        income: state.income.map((entry) =>
          entry.id === selectedIncomeId
            ? { ...entry, status: "received" as const, receivedDate: now, amountMinorUnits: amountMinorUnits || entry.amountMinorUnits }
            : entry
        ),
        activity: [
          ...state.activity,
          { id: generateId("act"), type: "income_received", amountMinorUnits: amountMinorUnits || 0, date: now, note, dedupeKey },
        ],
        lastMeaningfulActivityAt: now,
      };
    }

    if (type === "bill") {
      if (!selectedBillId) return null;
      return {
        ...state,
        bills: state.bills.map((bill) => (bill.id === selectedBillId ? { ...bill, status: "paid" as const, paidDate: now } : bill)),
        activity: [
          ...state.activity,
          { id: generateId("act"), type: "bill_paid", amountMinorUnits: 0, date: now, note, relatedBillId: selectedBillId, dedupeKey },
        ],
        lastMeaningfulActivityAt: now,
      };
    }

    if (type === "savings") {
      if (amountMinorUnits <= 0) return null;
      return {
        ...state,
        savingsTransfers: [...state.savingsTransfers, { id: generateId("sav"), amountMinorUnits, date: now, note, dedupeKey }],
        lastMeaningfulActivityAt: now,
      };
    }

    if (amountMinorUnits === 0) return null;
    return {
      ...state,
      activity: [...state.activity, { id: generateId("act"), type: "correction", amountMinorUnits, date: now, note, dedupeKey }],
      lastMeaningfulActivityAt: now,
    };
  }

  const preview = buildNextState();
  const previewBreakdown = preview ? computeSafeToSpend(preview) : null;

  let consequenceText = "Add an amount to preview how your month changes.";
  if (type === "bill" && selectedBillId) {
    const bill = state.bills.find((entry) => entry.id === selectedBillId);
    consequenceText = bill?.protected
      ? "Safe-to-Spend won't change, since this bill was already protected."
      : "This will reduce Safe-to-Spend, since this bill wasn't protected.";
  } else if (previewBreakdown) {
    consequenceText = `Safe-to-Spend would change from ${formatCurrency(currentBreakdown.safeToSpend, state.currency)} to ${formatCurrency(previewBreakdown.safeToSpend, state.currency)}.`;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    // Guards a double-tap or a retried submission from ever applying twice,
    // the same dedupeKey contract calculations.ts's appendActivity() uses.
    if (state.activity.some((entry) => entry.dedupeKey === dedupeKey)) return;
    const next = buildNextState();
    if (!next) return;
    setSubmitting(true);
    onApply(next);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[var(--surface)] p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Quick add</p>
            <h2 id="quick-add-title" className="mt-1 text-lg font-semibold text-[var(--text)]">
              What changed?
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-muted)]"
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-1.5">
          {TYPES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-[10px] font-semibold transition-colors ${
                  type === item.id
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
                }`}
              >
                <Icon size={16} aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {type === "income" ? (
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Which income?</label>
              {expectedIncome.length === 0 ? (
                <p className="text-[12px] text-[var(--muted)]">
                  Nothing&apos;s still expected. Add income sources in Setup first.
                </p>
              ) : (
                <select
                  value={selectedIncomeId}
                  onChange={(event) => {
                    setSelectedIncomeId(event.target.value);
                    const entry = expectedIncome.find((income) => income.id === event.target.value);
                    if (entry) setAmountMinorUnits(entry.amountMinorUnits);
                  }}
                  className="h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[14px] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <option value="">Choose income</option>
                  {expectedIncome.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name || "Income"} · {formatCurrency(entry.amountMinorUnits, state.currency)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : type === "bill" ? (
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Which bill?</label>
              {unpaidBills.length === 0 ? (
                <p className="text-[12px] text-[var(--muted)]">Every bill is already marked paid.</p>
              ) : (
                <select
                  value={selectedBillId}
                  onChange={(event) => setSelectedBillId(event.target.value)}
                  className="h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[14px] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <option value="">Choose a bill</option>
                  {unpaidBills.map((bill) => (
                    <option key={bill.id} value={bill.id}>
                      {bill.name || "Bill"} · {formatCurrency(bill.amountMinorUnits, state.currency)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <AmountField
              label={type === "correction" ? "Amount (negative to add money back)" : "Amount"}
              valueMinorUnits={amountMinorUnits}
              currency={state.currency}
              onChange={setAmountMinorUnits}
              autoFocus
            />
          )}

          {type === "spending" && state.spendingGroups.length > 0 && (
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Group</label>
              <select
                value={selectedGroupId}
                onChange={(event) => setSelectedGroupId(event.target.value)}
                className="h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 text-[14px] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                <option value="">No group</option>
                {state.spendingGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input label="Note (optional)" value={note} onChange={(event) => setNote(event.target.value)} placeholder="What was this for?" />

          <div className="rounded-lg bg-[var(--surface-muted)] p-3.5">
            <p className="text-[12px] leading-relaxed text-[var(--text)]">{consequenceText}</p>
          </div>

          <Button type="submit" size="lg" fullWidth disabled={submitting || !preview}>
            {submitting ? "Saving…" : "Save and update my month"}
          </Button>
        </form>
      </div>
    </div>
  );
}
