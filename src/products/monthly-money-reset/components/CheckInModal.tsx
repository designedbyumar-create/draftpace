"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/design-system/Button";
import Toggle from "@/design-system/Toggle";
import { X } from "@/design-system/Icon";
import { generateId } from "./shared";
import { computeSafeToSpend } from "../calculations";
import type { CheckIn, MonthlyMoneyResetState } from "../state";

const QUESTIONS: { key: keyof Pick<CheckIn, "incomeChanged" | "billsChanged" | "spendingMissing" | "reserveAdjusted" | "feelsAccurate">; label: string }[] = [
  { key: "incomeChanged", label: "Has any income changed since your last check-in?" },
  { key: "billsChanged", label: "Has a bill changed?" },
  { key: "spendingMissing", label: "Is there spending missing that you haven't added yet?" },
  { key: "reserveAdjusted", label: "Do you need to adjust your reserve?" },
  { key: "feelsAccurate", label: "Does your current Safe-to-Spend feel based on complete information?" },
];

export default function CheckInModal({
  state,
  onApply,
  onClose,
}: {
  state: MonthlyMoneyResetState;
  /** Returns whether the save actually succeeded — the modal only closes on true. */
  onApply: (next: MonthlyMoneyResetState) => Promise<boolean>;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    incomeChanged: false,
    billsChanged: false,
    spendingMissing: false,
    reserveAdjusted: false,
    feelsAccurate: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [dedupeKey] = useState(() => generateId("checkin-submit"));
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleFinish() {
    if (submitting) return;
    // Guards a double-tap or a retried submission from adding two check-ins,
    // the same dedupeKey contract QuickAddModal uses for activity entries.
    if (state.checkIns.some((entry) => entry.dedupeKey === dedupeKey)) return;
    const now = new Date().toISOString();
    const breakdown = computeSafeToSpend(state);
    const checkIn: CheckIn = {
      id: generateId("checkin"),
      date: now,
      incomeChanged: answers.incomeChanged,
      billsChanged: answers.billsChanged,
      spendingMissing: answers.spendingMissing,
      reserveAdjusted: answers.reserveAdjusted,
      feelsAccurate: answers.feelsAccurate,
      safeToSpendAtMinorUnits: breakdown.safeToSpend,
      dedupeKey,
    };
    setSubmitting(true);
    setSaveFailed(false);
    // Only closes once the save is confirmed — see QuickAddModal for why.
    const ok = await onApply({
      ...state,
      checkIns: [...state.checkIns, checkIn],
      lastMeaningfulActivityAt: now,
    });
    if (ok) {
      onClose();
      return;
    }
    setSubmitting(false);
    setSaveFailed(true);
  }

  const somethingChanged = answers.incomeChanged || answers.billsChanged || answers.spendingMissing || answers.reserveAdjusted;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[var(--surface)] p-6 shadow-xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Weekly check-in</p>
            <h2 id="checkin-title" className="mt-1 text-lg font-semibold text-[var(--text)]">
              Update only what changed
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

        <div className="mt-5 flex flex-col divide-y divide-[var(--border)]">
          {QUESTIONS.map((question) => (
            <div key={question.key} className="flex items-center justify-between gap-4 py-3.5">
              <p className="text-[13px] text-[var(--text)]">{question.label}</p>
              <Toggle
                checked={answers[question.key]}
                onChange={(checked) => setAnswers((prev) => ({ ...prev, [question.key]: checked }))}
                label={question.label}
              />
            </div>
          ))}
        </div>

        {somethingChanged && (
          <p className="mt-4 rounded-lg bg-[var(--surface-muted)] p-3.5 text-[12px] leading-relaxed text-[var(--text)]">
            Update the relevant income, bills, or spending using Quick Add before finishing, so this check-in
            reflects the real picture.
          </p>
        )}

        {saveFailed && (
          <p className="mt-4 text-[12px] font-semibold text-[var(--danger)]">
            Couldn&apos;t save. Your answers are still here, check your connection and try again.
          </p>
        )}

        <Button size="lg" fullWidth className="mt-5" onClick={handleFinish} disabled={submitting}>
          {submitting ? "Saving…" : saveFailed ? "Try again" : "Finish check-in"}
        </Button>
      </div>
    </div>
  );
}
