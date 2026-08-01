"use client";

import { useEffect, useState } from "react";
import { CaretDown, WarningCircle } from "@/design-system/Icon";
import type { SafeToSpendBreakdown } from "../calculations";
import { weeklyGuideAmount } from "../calculations";
import { formatCurrency } from "../currency";

const BREAKDOWN_LINES: { key: keyof SafeToSpendBreakdown; label: string; sign: "+" | "-" | "=" }[] = [
  { key: "startingAvailableBalance", label: "Money available right now", sign: "=" },
  { key: "incomeReceived", label: "Income received", sign: "+" },
  { key: "ordinarySpending", label: "Ordinary spending recorded", sign: "-" },
  { key: "billPayments", label: "Bill payments made", sign: "-" },
  { key: "savingsTransfersOut", label: "Savings transfers made", sign: "-" },
  { key: "protectedUnpaidBills", label: "Protected bills not yet paid", sign: "-" },
  { key: "protectedReserveHeld", label: "Reserve still held", sign: "-" },
];

export default function SafeToSpendCard({
  breakdown,
  currency,
  updatedAt,
  weeksRemaining,
}: {
  breakdown: SafeToSpendBreakdown;
  currency: string;
  updatedAt: string;
  weeksRemaining: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const stale = now - new Date(updatedAt).getTime() > 7 * 24 * 60 * 60 * 1000;
  const weekly = weeklyGuideAmount(breakdown.safeToSpend, weeksRemaining);

  return (
    <div className="rounded-2xl bg-[var(--text)] p-6 text-[var(--bg)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-60">Safe to spend now</p>
        {stale && (
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold">
            <WarningCircle size={12} aria-hidden />
            May be out of date
          </span>
        )}
      </div>

      <p
        className={`mt-3 text-[44px] font-semibold leading-none tracking-tight sm:text-[64px] ${
          breakdown.safeToSpend < 0 ? "text-[var(--danger)]" : ""
        }`}
      >
        {formatCurrency(breakdown.safeToSpend, currency)}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide opacity-60">This week, roughly</p>
          <p className="mt-1 text-[18px] font-semibold">{formatCurrency(weekly, currency)}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex items-center gap-1.5 text-[12px] font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white"
        >
          How this is calculated
          <CaretDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 flex flex-col divide-y divide-white/10 border-t border-white/15 pt-2">
          {BREAKDOWN_LINES.map((line) => (
            <div key={line.key} className="flex items-center justify-between gap-4 py-2 text-[13px]">
              <span className="opacity-70">
                {line.sign !== "=" ? `${line.sign} ` : ""}
                {line.label}
              </span>
              <span className="font-semibold">{formatCurrency(breakdown[line.key], currency)}</span>
            </div>
          ))}
          <p className="pt-3 text-[11px] leading-relaxed opacity-60">
            Based on the information currently added. Expected income doesn&apos;t count until it&apos;s marked
            received, and this isn&apos;t financial advice.
          </p>
        </div>
      )}
    </div>
  );
}
