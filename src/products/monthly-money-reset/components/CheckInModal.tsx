"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/design-system/Button";
import { Check, X } from "@/design-system/Icon";
import { generateId } from "./shared";
import QuickAddModal, { type QuickAddType } from "./QuickAddModal";
import { computeSafeToSpend } from "../calculations";
import { computeNextAction } from "../nextAction";
import { formatCurrency } from "../currency";
import type { CheckIn, MonthlyMoneyResetState } from "../state";

type QuestionKey = "incomeChanged" | "billsChanged" | "spendingMissing" | "reserveAdjusted";

const QUESTIONS: { key: QuestionKey; label: string; quickAddType: QuickAddType; actionLabel: string }[] = [
  { key: "incomeChanged", label: "Has any income changed or come in?", quickAddType: "income", actionLabel: "Add it" },
  { key: "billsChanged", label: "Has a bill changed or been paid?", quickAddType: "bill", actionLabel: "Add it" },
  { key: "spendingMissing", label: "Is there spending you haven't added yet?", quickAddType: "spending", actionLabel: "Add it" },
  { key: "reserveAdjusted", label: "Do you need to adjust your reserve or savings?", quickAddType: "savings", actionLabel: "Add it" },
];

const CORRECTION_LOG_LABEL: Record<QuickAddType, string> = {
  income: "Income marked received",
  bill: "Bill marked paid",
  spending: "Missed spending added",
  savings: "Reserve adjustment added",
  correction: "Correction added",
};

/**
 * The weekly check-in: four real questions, each a direct door into the
 * correction it implies rather than a toggle plus a passive "go do this
 * elsewhere" hint. A catch-all fifth question covers anything the other four
 * don't fit, routed to the general Correction flow — the closest real
 * editing surface that already exists, not a new one. See the MMR redesign
 * plan, Phase 4.
 */
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
  const [answers, setAnswers] = useState<Record<QuestionKey, boolean>>({
    incomeChanged: false,
    billsChanged: false,
    spendingMissing: false,
    reserveAdjusted: false,
  });
  const [somethingElseOff, setSomethingElseOff] = useState(false);
  const [resolved, setResolved] = useState<Set<QuestionKey | "other">>(new Set());
  const [activeCorrection, setActiveCorrection] = useState<QuestionKey | "other" | null>(null);
  const [changeLog, setChangeLog] = useState<string[]>([]);
  const [phase, setPhase] = useState<"questions" | "receipt">("questions");
  const [submitting, setSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [dedupeKey] = useState(() => generateId("checkin-submit"));
  const [openingSafeToSpend] = useState(() => computeSafeToSpend(state).safeToSpend);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !activeCorrection) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, activeCorrection]);

  function answerYes(key: QuestionKey) {
    setAnswers((prev) => ({ ...prev, [key]: true }));
    setActiveCorrection(key);
  }

  function answerNo(key: QuestionKey) {
    setAnswers((prev) => ({ ...prev, [key]: false }));
    setResolved((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

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
      feelsAccurate: !somethingElseOff,
      safeToSpendAtMinorUnits: breakdown.safeToSpend,
      dedupeKey,
    };
    setSubmitting(true);
    setSaveFailed(false);
    // Only advances to the receipt once the save is confirmed — see
    // QuickAddModal for why closing before that landed lost real progress.
    const ok = await onApply({
      ...state,
      checkIns: [...state.checkIns, checkIn],
      lastMeaningfulActivityAt: now,
      lastConfirmedAt: now,
    });
    if (ok) {
      setPhase("receipt");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setSaveFailed(true);
  }

  if (activeCorrection) {
    const quickAddType = activeCorrection === "other" ? "correction" : QUESTIONS.find((q) => q.key === activeCorrection)!.quickAddType;
    return (
      <QuickAddModal
        state={state}
        initialType={quickAddType}
        onApply={async (next) => {
          const ok = await onApply(next);
          if (ok) {
            setResolved((prev) => new Set(prev).add(activeCorrection));
            setChangeLog((prev) => [...prev, CORRECTION_LOG_LABEL[quickAddType]]);
            setActiveCorrection(null);
          }
          return ok;
        }}
        onClose={() => setActiveCorrection(null)}
      />
    );
  }

  if (phase === "receipt") {
    const closingBreakdown = computeSafeToSpend(state);
    const nextAction = computeNextAction(state, closingBreakdown);
    const changed = closingBreakdown.safeToSpend !== openingSafeToSpend;

    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="checkin-receipt-title">
        <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[var(--surface)] p-6 shadow-xl sm:rounded-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Check-in complete</p>
          <h2 id="checkin-receipt-title" className="mt-1 text-lg font-semibold text-[var(--text)]">
            Confirmed accurate as of today
          </h2>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-[var(--surface-muted)] p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Safe-to-Spend</p>
              {changed ? (
                <p className="mt-1 text-[13px] text-[var(--text)]">
                  <span className="line-through opacity-60">{formatCurrency(openingSafeToSpend, state.currency)}</span>{" "}
                  <span className="font-bold">{formatCurrency(closingBreakdown.safeToSpend, state.currency)}</span>
                </p>
              ) : (
                <p className="mt-1 text-[15px] font-bold text-[var(--text)]">{formatCurrency(closingBreakdown.safeToSpend, state.currency)}</p>
              )}
            </div>
          </div>

          {changeLog.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">What changed</p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {changeLog.map((entry, index) => (
                  <li key={index} className="flex items-center gap-2 text-[13px] text-[var(--text)]">
                    <Check size={13} className="text-[var(--success)]" aria-hidden />
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-[var(--border)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Your next move</p>
            <p className="mt-1 text-[13px] font-semibold text-[var(--text)]">
              {nextAction ? nextAction.label : "Nothing needs attention right now"}
            </p>
          </div>

          <Button size="lg" fullWidth className="mt-5" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    );
  }

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
              A yes takes you straight to fixing it
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
          {QUESTIONS.map((question) => {
            const isResolved = resolved.has(question.key);
            return (
              <div key={question.key} className="flex items-center justify-between gap-4 py-3.5">
                <p className="text-[13px] text-[var(--text)]">{question.label}</p>
                {isResolved ? (
                  <button
                    type="button"
                    onClick={() => answerYes(question.key)}
                    className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[var(--success)]"
                  >
                    <Check size={13} aria-hidden />
                    Added
                  </button>
                ) : (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => answerNo(question.key)}
                      className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        answers[question.key] === false
                          ? "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text)]"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => answerYes(question.key)}
                      className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--primary)]"
                    >
                      Yes — {question.actionLabel}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between gap-4 py-3.5">
            <p className="text-[13px] text-[var(--text)]">Anything else that doesn&apos;t feel accounted for?</p>
            {resolved.has("other") ? (
              <button
                type="button"
                onClick={() => setActiveCorrection("other")}
                className="flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-[var(--success)]"
              >
                <Check size={13} aria-hidden />
                Added
              </button>
            ) : (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setSomethingElseOff(false)}
                  className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    !somethingElseOff
                      ? "border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--text)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSomethingElseOff(true);
                    setActiveCorrection("other");
                  }}
                  className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--primary)]"
                >
                  Yes — Add it
                </button>
              </div>
            )}
          </div>
        </div>

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
