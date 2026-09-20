"use client";

import { useMemo, useState } from "react";
import Input from "@/design-system/Input";
import { formatCurrency, toMinorUnits } from "@/lib/currency";
import type { Debt } from "../../state";
import { MAX_PLAN_MONTHS, comparePayoff, formatMonth, payoffInputs, type PayoffStrategy } from "./payoffPlan";

const METHOD_LABEL: Record<PayoffStrategy, string> = {
  snowball: "Smallest balance first",
  avalanche: "Highest rate first",
};

/** The payoff plan, presentational: everything it shows is handed to it. */
export function PayoffPlanView({
  debts,
  strategy,
  extraText,
  onStrategy,
  onExtraText,
  now,
}: {
  debts: Debt[];
  strategy: PayoffStrategy;
  extraText: string;
  onStrategy: (next: PayoffStrategy) => void;
  onExtraText: (next: string) => void;
  now: Date;
}) {
  const { planned, excluded } = useMemo(() => payoffInputs(debts), [debts]);
  const extraAmount = Number.parseFloat(extraText);
  const extraMinorUnits = Number.isFinite(extraAmount) && extraAmount > 0 ? toMinorUnits(extraAmount, "USD") : 0;
  const comparison = useMemo(() => (planned.length > 0 ? comparePayoff(planned, extraMinorUnits, now) : null), [planned, extraMinorUnits, now]);

  if (planned.length === 0 && excluded.length === 0) return null;
  const plan = comparison ? comparison[strategy] : null;

  return (
    <section aria-labelledby="payoff-plan-heading" className="mt-8 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 id="payoff-plan-heading" className="text-[17px] font-semibold tracking-[-0.015em] text-[var(--text)]">
        Payoff plan
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
        Worked out from the balances, rates and minimum payments you recorded. A rate that changes later, such as the end of an introductory rate, is not modelled.
      </p>

      {excluded.length > 0 && (
        <p className="mt-3 text-[13px] leading-relaxed text-[var(--text)]">
          Left out, no interest rate: {excluded.map((d) => d.name).join(", ")}. Add a rate to include {excluded.length === 1 ? "it" : "them"}.
        </p>
      )}

      {plan && comparison && (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Extra each month"
              hint="On top of the minimums. Leave at 0 to see the minimums only."
              inputMode="decimal"
              value={extraText}
              onChange={(event) => onExtraText(event.target.value)}
            />
            <div>
              <p id="payoff-method-label" className="mb-1.5 text-[13px] font-semibold text-[var(--text)]">
                Which debt gets the extra
              </p>
              <div role="radiogroup" aria-labelledby="payoff-method-label" className="flex overflow-hidden rounded-[12px] border border-[var(--border-strong)]">
                {(Object.keys(METHOD_LABEL) as PayoffStrategy[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    role="radio"
                    aria-checked={strategy === method}
                    onClick={() => onStrategy(method)}
                    className={`flex-1 px-3 py-2.5 text-[13px] font-semibold ${
                      strategy === method ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "bg-[var(--surface)] text-[var(--muted)]"
                    }`}
                  >
                    {METHOD_LABEL[method]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-6 text-[26px] font-normal leading-tight tracking-[-0.02em] text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
            {plan.debtFreeMonth
              ? `Debt-free in ${formatMonth(plan.debtFreeMonth)}`
              : `Not paid off within ${MAX_PLAN_MONTHS / 12} years at these payments`}
          </p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Interest along the way: {formatCurrency(plan.totalInterestMinorUnits, "USD")}
          </p>

          <ol className="mt-4 overflow-hidden rounded-[14px] border border-[var(--border)]">
            {plan.steps.map((step, index) => (
              <li key={step.debtId} className={`flex items-baseline justify-between gap-3 px-4 py-3 ${index ? "border-t border-[var(--border)]" : ""}`}>
                <span className="text-[14px] font-medium text-[var(--text)]">{step.name}</span>
                <span className="text-right text-[13px] text-[var(--muted)]">
                  {step.payoffMonth ? `Paid off ${formatMonth(step.payoffMonth)}` : "Not paid off in that time"}
                </span>
              </li>
            ))}
          </ol>

          {planned.length > 1 && (
            <p className="mt-4 text-[13px] leading-relaxed text-[var(--muted)]">
              {comparison.cheaper
                ? `${METHOD_LABEL[comparison.cheaper]} costs ${formatCurrency(comparison.savedMinorUnits, "USD")} less in interest than ${METHOD_LABEL[comparison.cheaper === "avalanche" ? "snowball" : "avalanche"].toLowerCase()}.`
                : "Both methods cost the same in interest here."}
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default function PayoffPlan({ debts }: { debts: Debt[] }) {
  const [strategy, setStrategy] = useState<PayoffStrategy>("avalanche");
  const [extraText, setExtraText] = useState("0");
  const now = useMemo(() => new Date(), []);
  return <PayoffPlanView debts={debts} strategy={strategy} extraText={extraText} onStrategy={setStrategy} onExtraText={setExtraText} now={now} />;
}
