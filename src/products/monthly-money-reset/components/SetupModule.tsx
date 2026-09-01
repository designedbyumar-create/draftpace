"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ProductDefinition } from "@/product-framework/definition";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Surface from "@/design-system/Surface";
import Toggle from "@/design-system/Toggle";
import EmptyState from "@/design-system/EmptyState";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Wallet } from "@/design-system/Icon";
import { useInstanceState } from "./useInstanceState";
import { AmountField, LoadErrorState, SaveStatusIndicator, generateId } from "./shared";
import ThemeScope from "./ThemeScope";
import { EASE_OUT, useCombinedReducedMotion } from "@/components/onboarding/motion";
import { computeSafeToSpend } from "../calculations";
import { formatCurrency } from "../currency";
import { firstIncompleteStep, stepCompleteness, type SetupStepId } from "../setupCompleteness";
import type { BillEntry, IncomeEntry, MonthlyMoneyResetState, SpendingGroup } from "../state";

/** Exported for setupTracker.test.ts — the tracker must always end on a reachable Confirm step. */
export const STEPS = [
  { step: 1, title: "This month", short: "Starting point" },
  { step: 2, title: "Money coming in", short: "Income" },
  { step: 3, title: "Protect what must be paid", short: "Bills & reserve" },
  { step: 4, title: "Set your spending view", short: "Spending" },
  { step: 5, title: "Review", short: "Confirm" },
] as const;

const CURRENCIES = ["USD", "PKR", "GBP", "EUR", "CAD", "AUD", "INR", "AED", "SAR"];

const CHECK_IN_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export function isTrackerStepComplete(state: MonthlyMoneyResetState, step: number): boolean {
  return step <= 4 ? stepCompleteness(state, step as SetupStepId).complete : Boolean(state.setup.completedAt);
}

export default function SetupModule({ definition }: { definition: ProductDefinition }) {
  const router = useRouter();
  const { status, state, saveStatus, setState, forceSave, retry } = useInstanceState(definition.slug);
  const [justFinished, setJustFinished] = useState(false);
  const reduceMotion = useCombinedReducedMotion();

  if (status === "loading") {
    return <p className="text-[13px] text-[var(--muted)]">Loading your setup…</p>;
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

  const currentStep = state.setup.currentStep;
  const breakdown = computeSafeToSpend(state);

  function goToStep(step: number) {
    if (!state) return;
    setState({ ...state, setup: { ...state.setup, currentStep: step } });
  }

  /**
   * Navigation only ever follows a confirmed-saved write. If a save fails
   * (network blip, a conflict), forceSave() reports false, the entered
   * values stay exactly as typed in local state, and the same button is the
   * retry: clicking Continue/Finish setup again re-attempts the save. See
   * the P0 stability incident, 2026-08-04: navigating regardless of save
   * outcome is how a genuine save failure presented as lost progress.
   */
  async function handleContinue() {
    if (!state) return;
    if (currentStep <= 4 && !stepCompleteness(state, currentStep as SetupStepId).complete) return;
    const stepSaved = await forceSave();
    if (!stepSaved) return;
    if (currentStep < 5) {
      goToStep(currentStep + 1);
    } else {
      // Reachable by jumping straight to the Review tile without resolving
      // 1-4 first: send the user back to whichever step still needs
      // attention instead of silently finishing an incomplete setup.
      const incomplete = firstIncompleteStep(state);
      if (incomplete) {
        goToStep(incomplete);
        return;
      }
      const next: MonthlyMoneyResetState = {
        ...state,
        setup: { ...state.setup, completedAt: new Date().toISOString(), stepsCompleted: [1, 2, 3, 4, 5] },
      };
      setState(next);
      const finished = await forceSave();
      if (!finished) return;
      setJustFinished(true);
    }
  }

  function markStepSeen(step: number) {
    if (!state || state.setup.stepsCompleted.includes(step)) return;
    setState({ ...state, setup: { ...state.setup, stepsCompleted: [...state.setup.stepsCompleted, step] } });
  }

  // A deliberate transition, not an immediate redirect: the user sees the
  // number Setup produced before moving on, with one dominant action and no
  // decorative animation. See the MMR redesign plan, Phase 3.
  if (justFinished) {
    return (
      <ThemeScope>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="mx-auto flex max-w-md flex-col items-center gap-2 py-16 text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
            Your first Safe-to-Spend is ready
          </p>
          <p className="font-serif text-[40px] font-semibold tracking-tight text-[var(--text)]">
            {formatCurrency(breakdown.safeToSpend, state.currency)}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
            This is what&apos;s genuinely free to spend in {state.cycle.label}, after your protected bills and
            reserve. It re-settles the moment anything changes, and everything you entered stays editable.
          </p>
          <Button
            size="lg"
            className="mt-4"
            onClick={() => router.push(`/app/products/${definition.slug}/workspace`)}
          >
            Go to This Month
          </Button>
        </motion.div>
      </ThemeScope>
    );
  }

  return (
    <ThemeScope>
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
          Step {currentStep} of 5
        </p>
        <SaveStatusIndicator status={saveStatus} />
      </div>

      {/* Tablet and desktop: five readable columns, equal width. Never the
          horizontally-scrolling row mobile gets below, since there's room here. */}
      <div className="mb-6 hidden gap-1.5 sm:flex">
        {STEPS.map((item) => (
          <button
            key={item.step}
            type="button"
            onClick={() => goToStep(item.step)}
            className={`flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
              currentStep === item.step
                ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                : "border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--muted)]">
              {isTrackerStepComplete(state, item.step) ? <Check size={11} aria-hidden /> : item.step}
            </span>
            <span className="truncate text-[11px] font-semibold text-[var(--text)]">{item.short}</span>
          </button>
        ))}
      </div>

      {/* Mobile: a compact current-step treatment instead of five cramped
          tiles: every step, including Confirm, stays reachable through
          Back/Continue without needing horizontal scroll discovery. */}
      <div className="mb-6 sm:hidden">
        <div className="flex gap-1">
          {STEPS.map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => goToStep(item.step)}
              aria-current={currentStep === item.step ? "step" : undefined}
              aria-label={`${item.short}${isTrackerStepComplete(state, item.step) ? ", complete" : ""}`}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                currentStep === item.step
                  ? "bg-[var(--primary)]"
                  : isTrackerStepComplete(state, item.step)
                    ? "bg-[var(--primary)]/40"
                    : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
        <p className="mt-2.5 text-[13px] font-semibold text-[var(--text)]">
          Step {currentStep} of 5 · {STEPS[currentStep - 1].short}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
        <Surface className="p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">{STEPS[currentStep - 1].title}</h2>

          {/* Extra clearance on mobile only, so the sticky action bar below
              never sits over the last field once it pins to the screen. */}
          <div className="pb-6 sm:pb-0">
            {currentStep === 1 && <StepThisMonth state={state} setState={setState} />}
            {currentStep === 2 && <StepIncome state={state} setState={setState} />}
            {currentStep === 3 && <StepBills state={state} setState={setState} />}
            {currentStep === 4 && <StepSpending state={state} setState={setState} />}
            {currentStep === 5 && <StepReview state={state} breakdown={breakdown} goToStep={goToStep} />}
          </div>

          {/* Desktop/tablet: in-flow, inside the card, as before. */}
          <div className="mt-7 hidden items-center justify-between border-t border-[var(--border)] pt-5 sm:flex">
            <Button
              variant="secondary"
              disabled={currentStep === 1}
              iconLeft={<ArrowLeft size={14} aria-hidden />}
              onClick={() => goToStep(currentStep - 1)}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                markStepSeen(currentStep);
                handleContinue();
              }}
              disabled={currentStep <= 4 && !stepCompleteness(state, currentStep as SetupStepId).complete}
              iconRight={currentStep < 5 ? <ArrowRight size={14} aria-hidden /> : <Check size={14} aria-hidden />}
            >
              {currentStep < 5 ? "Continue" : "Finish setup"}
            </Button>
          </div>

          {/* Mobile: pinned to the bottom of the screen while scrolling a
              long step, so Continue never requires hunting for it. */}
          <div className="sticky bottom-0 -mx-5 mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:hidden">
            <Button
              variant="secondary"
              disabled={currentStep === 1}
              iconLeft={<ArrowLeft size={14} aria-hidden />}
              onClick={() => goToStep(currentStep - 1)}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                markStepSeen(currentStep);
                handleContinue();
              }}
              disabled={currentStep <= 4 && !stepCompleteness(state, currentStep as SetupStepId).complete}
              iconRight={currentStep < 5 ? <ArrowRight size={14} aria-hidden /> : <Check size={14} aria-hidden />}
            >
              {currentStep < 5 ? "Continue" : "Finish setup"}
            </Button>
          </div>
        </Surface>

        <aside className="lg:sticky lg:top-6">
          <div className="rounded-xl bg-[var(--mmr-forest-900)] p-5 text-[var(--mmr-ivory)]">
            <p className="font-serif text-[10px] font-bold uppercase tracking-[0.14em] opacity-60">Live preview</p>
            <p className="mt-2 font-serif text-[28px] font-semibold tracking-tight">
              {formatCurrency(breakdown.safeToSpend, state.currency)}
            </p>
            <p className="mt-1 text-[11px] opacity-70">Estimated Safe-to-Spend so far</p>
            <div className="mt-4 flex flex-col gap-1.5 border-t border-[var(--mmr-sage-strong)]/25 pt-3 text-[11px]">
              <PreviewLine label="Starting balance" value={formatCurrency(breakdown.startingAvailableBalance, state.currency)} />
              <PreviewLine label="Income received" value={formatCurrency(breakdown.incomeReceived, state.currency)} />
              <PreviewLine label="Protected bills" value={formatCurrency(breakdown.protectedUnpaidBills, state.currency)} />
              <PreviewLine label="Reserve held" value={formatCurrency(breakdown.protectedReserveHeld, state.currency)} />
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--faint)]">
            You can change anything from this setup later. Nothing here is final.
          </p>
        </aside>
      </div>
    </div>
    </ThemeScope>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between opacity-80">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/** The one-sentence "what's missing and why it matters" note a step shows while incomplete. */
function StepMissingNote({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-soft)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[var(--text)]">
      {text}
    </p>
  );
}

function StepThisMonth({
  state,
  setState,
}: {
  state: MonthlyMoneyResetState;
  setState: (next: MonthlyMoneyResetState) => void;
}) {
  const completeness = stepCompleteness(state, 1);
  const isZero = state.startingAvailableBalanceMinorUnits === 0;
  return (
    <div className="mt-5 flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Currency"
          value={state.currency}
          onChange={(event) => setState({ ...state, currency: event.target.value })}
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>
        <Input
          label="Name this month (optional)"
          value={state.cycle.label}
          onChange={(event) => setState({ ...state, cycle: { ...state.cycle, label: event.target.value } })}
        />
      </div>

      <AmountField
        label="Money available right now"
        valueMinorUnits={state.startingAvailableBalanceMinorUnits}
        currency={state.currency}
        onChange={(minorUnits) => setState({ ...state, startingAvailableBalanceMinorUnits: minorUnits })}
        autoFocus
      />
      <p className="text-[12px] leading-relaxed text-[var(--muted)]">
        This is what&apos;s already in your account, including anything you&apos;ve already been paid. You don&apos;t
        need to add that income again in the next step. This number already covers it.
      </p>

      {isZero && (
        <label className="flex items-center gap-2.5 text-[12px] font-semibold text-[var(--text)]">
          <Toggle
            checked={state.setup.acknowledgements.startingBalanceZeroConfirmed}
            onChange={(checked) =>
              setState({
                ...state,
                setup: { ...state.setup, acknowledgements: { ...state.setup.acknowledgements, startingBalanceZeroConfirmed: checked } },
              })
            }
            label="This is correct: I have $0 available right now"
          />
          This is correct: I have $0 available right now
        </label>
      )}

      {!completeness.complete && <StepMissingNote text={completeness.missing} />}
    </div>
  );
}

function StepIncome({
  state,
  setState,
}: {
  state: MonthlyMoneyResetState;
  setState: (next: MonthlyMoneyResetState) => void;
}) {
  function addIncome() {
    const entry: IncomeEntry = {
      id: generateId("inc"),
      name: "",
      amountMinorUnits: 0,
      status: "expected",
      recurring: false,
    };
    setState({ ...state, income: [...state.income, entry] });
  }

  function updateIncome(id: string, patch: Partial<IncomeEntry>) {
    setState({ ...state, income: state.income.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) });
  }

  function removeIncome(id: string) {
    setState({ ...state, income: state.income.filter((entry) => entry.id !== id) });
  }

  const completeness = stepCompleteness(state, 2);

  return (
    <div className="mt-5">
      <p className="text-[12px] leading-relaxed text-[var(--muted)]">
        Add income you&apos;re still expecting this month. Rough estimates are fine. It won&apos;t count toward
        Safe-to-Spend until you mark it received.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {state.income.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-[var(--border)] p-4">
            <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
              <Input
                label="Source"
                value={entry.name}
                onChange={(event) => updateIncome(entry.id, { name: event.target.value })}
                placeholder="e.g. Paycheck"
              />
              <AmountField
                label="Amount"
                valueMinorUnits={entry.amountMinorUnits}
                currency={state.currency}
                onChange={(minorUnits) => updateIncome(entry.id, { amountMinorUnits: minorUnits })}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-[var(--text)]">
                <Toggle
                  checked={entry.status === "received"}
                  onChange={(checked) => updateIncome(entry.id, { status: checked ? "received" : "expected" })}
                  label={`Mark ${entry.name || "this income"} as received`}
                />
                {entry.status === "received" ? "Received" : "Still expected"}
              </label>
              <button
                type="button"
                onClick={() => removeIncome(entry.id)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
                aria-label={`Remove ${entry.name || "income source"}`}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" size="sm" className="mt-3" iconLeft={<Plus size={13} aria-hidden />} onClick={addIncome}>
        Add income source
      </Button>

      {state.income.length === 0 && (
        <label className="mt-4 flex items-center gap-2.5 text-[12px] font-semibold text-[var(--text)]">
          <Toggle
            checked={state.setup.acknowledgements.noOtherIncomeConfirmed}
            onChange={(checked) =>
              setState({
                ...state,
                setup: { ...state.setup, acknowledgements: { ...state.setup.acknowledgements, noOtherIncomeConfirmed: checked } },
              })
            }
            label="Confirm: no other income expected this month"
          />
          Confirm: no other income expected this month
        </label>
      )}

      {!completeness.complete && <div className="mt-4"><StepMissingNote text={completeness.missing} /></div>}
    </div>
  );
}

function StepBills({
  state,
  setState,
}: {
  state: MonthlyMoneyResetState;
  setState: (next: MonthlyMoneyResetState) => void;
}) {
  function addBill() {
    const entry: BillEntry = {
      id: generateId("bill"),
      name: "",
      amountMinorUnits: 0,
      category: "Other",
      protected: true,
      status: "upcoming",
    };
    setState({ ...state, bills: [...state.bills, entry] });
  }

  function updateBill(id: string, patch: Partial<BillEntry>) {
    setState({ ...state, bills: state.bills.map((bill) => (bill.id === id ? { ...bill, ...patch } : bill)) });
  }

  function removeBill(id: string) {
    setState({ ...state, bills: state.bills.filter((bill) => bill.id !== id) });
  }

  function addReserve() {
    setState({
      ...state,
      protectedReserve: [...state.protectedReserve, { id: generateId("res"), label: "Safety buffer", amountMinorUnits: 0 }],
    });
  }

  function updateReserve(id: string, amountMinorUnits: number) {
    setState({
      ...state,
      protectedReserve: state.protectedReserve.map((item) => (item.id === id ? { ...item, amountMinorUnits } : item)),
    });
  }

  const completeness = stepCompleteness(state, 3);
  const nothingToProtect = state.bills.length === 0 && state.protectedReserve.length === 0;

  return (
    <div className="mt-5">
      <p className="text-[12px] leading-relaxed text-[var(--muted)]">
        Protected commitments stay set aside whether they&apos;re paid yet or not, so your Safe-to-Spend number never
        assumes money you actually owe.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {state.bills.map((bill) => (
          <div key={bill.id} className="rounded-lg border border-[var(--border)] p-4">
            <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
              <Input
                label="Bill"
                value={bill.name}
                onChange={(event) => updateBill(bill.id, { name: event.target.value })}
                placeholder="e.g. Rent"
              />
              <AmountField
                label="Amount"
                valueMinorUnits={bill.amountMinorUnits}
                currency={state.currency}
                onChange={(minorUnits) => updateBill(bill.id, { amountMinorUnits: minorUnits })}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-[var(--text)]">
                <Toggle
                  checked={bill.protected}
                  onChange={(checked) => updateBill(bill.id, { protected: checked })}
                  label={`Protect ${bill.name || "this bill"}`}
                />
                {bill.protected ? "Protected" : "Not protected"}
              </label>
              <button
                type="button"
                onClick={() => removeBill(bill.id)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
                aria-label={`Remove ${bill.name || "bill"}`}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" size="sm" className="mt-3" iconLeft={<Plus size={13} aria-hidden />} onClick={addBill}>
        Add a commitment
      </Button>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <p className="text-[13px] font-semibold text-[var(--text)]">Reserve you don&apos;t want to spend</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
          Money still sitting in your account that you&apos;d rather leave untouched, a safety buffer, or savings you
          haven&apos;t moved out yet.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {state.protectedReserve.map((item) => (
            <AmountField
              key={item.id}
              label={item.label}
              valueMinorUnits={item.amountMinorUnits}
              currency={state.currency}
              onChange={(minorUnits) => updateReserve(item.id, minorUnits)}
            />
          ))}
        </div>
        <Button variant="secondary" size="sm" className="mt-3" iconLeft={<Plus size={13} aria-hidden />} onClick={addReserve}>
          Add a reserve amount
        </Button>
      </div>

      {nothingToProtect && (
        <label className="mt-5 flex items-center gap-2.5 text-[12px] font-semibold text-[var(--text)]">
          <Toggle
            checked={state.setup.acknowledgements.noBillsOrReserveConfirmed}
            onChange={(checked) =>
              setState({
                ...state,
                setup: { ...state.setup, acknowledgements: { ...state.setup.acknowledgements, noBillsOrReserveConfirmed: checked } },
              })
            }
            label="Confirm: nothing to protect this month"
          />
          Confirm: nothing to protect this month
        </label>
      )}

      {!completeness.complete && <div className="mt-4"><StepMissingNote text={completeness.missing} /></div>}
    </div>
  );
}

function StepSpending({
  state,
  setState,
}: {
  state: MonthlyMoneyResetState;
  setState: (next: MonthlyMoneyResetState) => void;
}) {
  function addGroup() {
    const group: SpendingGroup = { id: generateId("grp"), name: "", kind: "flexible" };
    setState({ ...state, spendingGroups: [...state.spendingGroups, group] });
  }

  function updateGroup(id: string, patch: Partial<SpendingGroup>) {
    setState({
      ...state,
      spendingGroups: state.spendingGroups.map((group) => (group.id === id ? { ...group, ...patch } : group)),
    });
  }

  function removeGroup(id: string) {
    setState({ ...state, spendingGroups: state.spendingGroups.filter((group) => group.id !== id) });
  }

  const completeness = stepCompleteness(state, 4);

  return (
    <div className="mt-5">
      <p className="text-[12px] leading-relaxed text-[var(--muted)]">
        Keep this broad. You don&apos;t need a detailed category for every kind of purchase.
      </p>

      {!completeness.complete && <StepMissingNote text={completeness.missing} />}

      <div className="mt-4 flex flex-col gap-3">
        {state.spendingGroups.map((group) => (
          <div
            key={group.id}
            className="grid grid-cols-1 items-end gap-3 rounded-lg border border-[var(--border)] p-4 sm:grid-cols-[1.4fr_1fr_auto]"
          >
            <Input
              label="Group"
              value={group.name}
              onChange={(event) => updateGroup(group.id, { name: event.target.value })}
              placeholder="e.g. Everyday spending"
            />
            <Select
              label="Kind"
              value={group.kind}
              onChange={(event) => updateGroup(group.id, { kind: event.target.value as SpendingGroup["kind"] })}
            >
              <option value="essentials">Essentials</option>
              <option value="flexible">Flexible spending</option>
              <option value="personal">Personal / optional</option>
              <option value="custom">Custom</option>
            </Select>
            <button
              type="button"
              onClick={() => removeGroup(group.id)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--danger)] sm:w-11"
              aria-label={`Remove ${group.name || "group"}`}
            >
              <Trash2 size={14} aria-hidden />
              <span className="text-[13px] font-semibold sm:hidden">Remove</span>
            </button>
          </div>
        ))}
      </div>

      <Button variant="secondary" size="sm" className="mt-3" iconLeft={<Plus size={13} aria-hidden />} onClick={addGroup}>
        Add a spending group
      </Button>

      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <Select
          label="Weekly check-in day"
          value={state.preferences.checkInDay}
          onChange={(event) =>
            setState({
              ...state,
              preferences: { ...state.preferences, checkInDay: event.target.value as (typeof CHECK_IN_DAYS)[number] },
            })
          }
          className="w-full sm:max-w-xs"
        >
          {CHECK_IN_DAYS.map((day) => (
            <option key={day} value={day}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function StepReview({
  state,
  breakdown,
  goToStep,
}: {
  state: MonthlyMoneyResetState;
  breakdown: ReturnType<typeof computeSafeToSpend>;
  goToStep: (step: number) => void;
}) {
  const incompleteSteps = STEPS.slice(0, 4).filter(
    (item) => !stepCompleteness(state, item.step as SetupStepId).complete
  );

  const rows: { label: string; value: string }[] = [
    { label: "Money available right now", value: formatCurrency(breakdown.startingAvailableBalance, state.currency) },
    { label: "Income received", value: formatCurrency(breakdown.incomeReceived, state.currency) },
    {
      label: "Income still expected (not counted yet)",
      value: formatCurrency(
        state.income.filter((entry) => entry.status === "expected").reduce((total, entry) => total + entry.amountMinorUnits, 0),
        state.currency
      ),
    },
    { label: "Protected bills not yet paid", value: formatCurrency(breakdown.protectedUnpaidBills, state.currency) },
    { label: "Reserve held", value: formatCurrency(breakdown.protectedReserveHeld, state.currency) },
  ];

  return (
    <div className="mt-5">
      {incompleteSteps.length > 0 && (
        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-soft)] p-4">
          <p className="text-[12px] font-semibold text-[var(--text)]">A few steps still need attention</p>
          {incompleteSteps.map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => goToStep(item.step)}
              className="flex items-center justify-between text-left text-[12px] font-semibold text-[var(--primary)] hover:underline"
            >
              {item.short}
              <ArrowRight size={13} aria-hidden />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
            <p className="text-[13px] text-[var(--muted)]">{row.label}</p>
            <p className="text-[13px] font-semibold text-[var(--text)]">{row.value}</p>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 bg-[var(--surface-muted)] px-4 py-3.5">
          <p className="text-[13px] font-bold text-[var(--text)]">Preliminary Safe-to-Spend</p>
          <p className="text-[15px] font-bold text-[var(--text)]">{formatCurrency(breakdown.safeToSpend, state.currency)}</p>
        </div>
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-[var(--muted)]">
        You can go back and edit any step before finishing. Once you finish, you&apos;ll land in your Workspace with
        this as your starting point, and everything here stays editable.
      </p>
    </div>
  );
}
