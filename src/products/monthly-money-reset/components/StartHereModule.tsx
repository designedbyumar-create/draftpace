"use client";

import { useState } from "react";
import type { ProductDefinition } from "@/product-framework/definition";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import { ArrowRight, Check, Lock, Sparkles } from "@/design-system/Icon";
import { useInstanceState } from "./useInstanceState";

const WHAT_YOU_ADD = [
  "The money available right now, and anything else you'd rather protect or set aside.",
  "Bills you need to protect, so they never get spent by accident.",
  "A rough shape for everyday spending, not a detailed budget.",
];

const CALCULATION_LINES = [
  { label: "Starting available balance", sign: "" },
  { label: "Income received since the reset began", sign: "+" },
  { label: "Ordinary spending recorded", sign: "−" },
  { label: "Bill payments made", sign: "−" },
  { label: "Savings transfers made", sign: "−" },
  { label: "Protected bills not yet paid", sign: "−" },
  { label: "Protected reserve still held", sign: "−" },
];

export default function StartHereModule({ definition }: { definition: ProductDefinition }) {
  const { status, state } = useInstanceState(definition.slug);
  const [showExplainer, setShowExplainer] = useState(false);

  const setupComplete = Boolean(state?.setup.completedAt);
  const primaryHref = `/app/products/${definition.slug}/${setupComplete ? "workspace" : "setup"}`;
  const primaryLabel = setupComplete ? "Go to your Workspace" : "Set up this month";

  return (
    <div>
      <p className="text-[16px] leading-relaxed text-[var(--text)]">{definition.tagline}</p>
      <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">
        Add the money available now, protect upcoming bills and set aside what you don&apos;t want to spend. Monthly
        Money Reset keeps the current picture clear and updates it as the month changes.
      </p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        <Badge tone="success">Free</Badge>
        <Badge tone="neutral">Takes a few minutes</Badge>
        <Badge tone="neutral">Change anything later</Badge>
      </div>

      <Surface className="mt-6 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What you&apos;ll add</p>
        <div className="mt-3 flex flex-col gap-2.5">
          {WHAT_YOU_ADD.map((line) => (
            <div key={line} className="flex items-start gap-2.5">
              <Check size={14} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
              <p className="text-[13px] leading-relaxed text-[var(--text)]">{line}</p>
            </div>
          ))}
        </div>
      </Surface>

      <Surface className="mt-4 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What you&apos;ll get</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--text)]">
          A Safe-to-Spend figure that updates as the month goes on, built from information you add, not a guess. It
          shows up during setup, before you've finished adding everything, so you're never staring at a blank
          screen waiting for a result.
        </p>
      </Surface>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        {status === "loading" ? (
          <Button size="lg" disabled iconRight={<ArrowRight size={15} aria-hidden />}>
            {primaryLabel}
          </Button>
        ) : (
          <Button href={primaryHref} size="lg" iconRight={<ArrowRight size={15} aria-hidden />}>
            {primaryLabel}
          </Button>
        )}
        <Button variant="ghost" size="lg" onClick={() => setShowExplainer((value) => !value)}>
          See how the calculation works
        </Button>
      </div>

      {showExplainer && (
        <Surface className="mt-5 p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[var(--primary)]" aria-hidden />
            <p className="text-[13px] font-semibold text-[var(--text)]">How Safe-to-Spend is worked out</p>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-[var(--border)]">
            {CALCULATION_LINES.map((line) => (
              <div key={line.label} className="flex items-center justify-between gap-4 py-2">
                <p className="text-[13px] text-[var(--muted)]">{line.label}</p>
                <span className="text-[13px] font-semibold text-[var(--faint)]">{line.sign || "="}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-[var(--muted)]">
            Expected income never counts until you mark it received. A protected bill stops counting as
            &quot;not yet paid&quot; the moment you pay it, and starts counting as a payment instead, so paying it
            never changes your total twice. The result can go negative, and if it does, it stays visible rather than
            being hidden at zero.
          </p>
        </Surface>
      )}

      <p className="mt-6 flex items-center gap-1.5 text-[11px] text-[var(--faint)]">
        <Lock size={12} aria-hidden />
        Only you can see this. It saves to your account automatically, and it&apos;s a planning aid, not financial
        advice.
      </p>
    </div>
  );
}
