"use client";

import { useState } from "react";
import { CaretDown } from "@/design-system/Icon";
import { formatCurrency } from "@/lib/currency";
import type { ExplainBreakdown as ExplainBreakdownData } from "../../companion/capability";

/**
 * The reusable "How Draftpace got this" disclosure — every deterministic
 * figure Companion or Workspace shows (Available Money, Expected Income,
 * Upcoming Obligations, ...) can attach one of these rather than each
 * screen inventing its own breakdown presentation. Built from
 * capability.ts's ExplainBreakdown shape only — never renders a figure
 * that wasn't already computed deterministically upstream.
 */
export default function ExplainBreakdown({
  breakdown,
  currency,
  label,
  valueMinorUnits,
  variant = "light",
}: {
  breakdown: ExplainBreakdownData;
  currency: string;
  label: string;
  valueMinorUnits: number;
  /** "dark" when placed on a --primary-colored surface (e.g. Workspace's
   * Available Money hero): the toggle's own text is --primary by default,
   * invisible against a --primary background. The expanded panel below is
   * always its own self-contained light card regardless of variant. */
  variant?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex items-center gap-1 text-[12px] font-semibold hover:underline ${
          variant === "dark" ? "text-[var(--primary-contrast)] opacity-80" : "text-[var(--primary)]"
        }`}
      >
        <CaretDown size={13} aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
        How Draftpace got this
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <p className="text-[12px] font-semibold text-[var(--text)]">{label}</p>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {breakdown.lineItems.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-[12px] text-[var(--muted)]">
                <span>{item.label}</span>
                <span className="font-mono tabular-nums">
                  {item.amountMinorUnits < 0 ? "− " : ""}
                  {formatCurrency(Math.abs(item.amountMinorUnits), currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-1.5 flex items-center justify-between border-t border-[var(--border)] pt-1.5 text-[12px] font-semibold text-[var(--text)]">
            <span>= {label}</span>
            <span className="font-mono tabular-nums">{formatCurrency(valueMinorUnits, currency)}</span>
          </div>
          <p className="mt-2 text-[11px] text-[var(--faint)]">Based on {breakdown.basedOn.join(", ")}.</p>
          {breakdown.caveat && <p className="mt-1 text-[11px] leading-relaxed text-[var(--warning)]">{breakdown.caveat}</p>}
        </div>
      )}
    </div>
  );
}
