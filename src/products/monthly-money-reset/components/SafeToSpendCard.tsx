"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarCheck,
  CaretDown,
  Clock,
  WarningCircle,
} from "@/design-system/Icon";
import {
  entranceVariant,
  staggerContainer,
  staggerItem,
} from "@/design-system/motion";
import type { SafeToSpendBreakdown } from "../calculations";
import { weeklyGuideAmount } from "../calculations";
import type { TightestDay } from "../cycleTimeline";
import { formatCurrency } from "../currency";

/**
 * The Number: the answer and the proof as one object. The figure sits on the
 * forest panel; the seven-term working hangs from a slot beneath it as a
 * paper receipt, always in view, so nobody has to open anything to see why
 * the number is what it is. Every line is a term of computeSafeToSpend.
 */

const BREAKDOWN_LINES: {
  key: keyof SafeToSpendBreakdown;
  label: string;
  sign: "+" | "-" | "=";
}[] = [
  {
    key: "startingAvailableBalance",
    label: "Money available right now",
    sign: "=",
  },
  { key: "incomeReceived", label: "Income received", sign: "+" },
  { key: "ordinarySpending", label: "Ordinary spending recorded", sign: "-" },
  { key: "billPayments", label: "Bill payments made", sign: "-" },
  { key: "savingsTransfersOut", label: "Savings transfers made", sign: "-" },
  {
    key: "protectedUnpaidBills",
    label: "Protected bills not yet paid",
    sign: "-",
  },
  { key: "protectedReserveHeld", label: "Reserve still held", sign: "-" },
];

/** Torn-off bottom edge. Two mask layers: a solid body, and a row of downward teeth. */
const TEAR_MASK =
  "linear-gradient(#000 0 0) top / 100% calc(100% - 8px) no-repeat, conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) bottom / 16px 8px repeat-x";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Tailwind 3 drops an `/opacity` on a var() colour, so translucent tints are mixed explicitly. */
const CHIP =
  "inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--mmr-hero-ink)_10%,transparent)] px-3 py-1.5 text-[12px] font-semibold ring-1 ring-inset ring-[color-mix(in_srgb,var(--mmr-hero-ink)_16%,transparent)]";

function formatTightestDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function updatedLabel(updatedAt: string, now: number): string {
  const days = Math.floor((now - new Date(updatedAt).getTime()) / DAY_MS);
  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  return `Updated ${days} days ago`;
}

/** "$1,284.50" to ["$1,284", ".50"], so the cents can sit quieter than the dollars. */
function splitCents(formatted: string): [string, string] {
  const match = formatted.match(/^(.*?)([.,]\d{2})$/);
  return match ? [match[1], match[2]] : [formatted, ""];
}

export default function SafeToSpendCard({
  breakdown,
  currency,
  updatedAt,
  weeksRemaining,
  tightestDay,
}: {
  breakdown: SafeToSpendBreakdown;
  currency: string;
  updatedAt: string;
  weeksRemaining: number;
  /** The lowest point the account is projected to reach before the cycle ends, from cycleTimeline.ts. Null when nothing dated points to a dip worth naming. */
  tightestDay: TightestDay | null;
}) {
  const [showWorking, setShowWorking] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const stale = now - new Date(updatedAt).getTime() > 7 * DAY_MS;
  const weekly = weeklyGuideAmount(breakdown.safeToSpend, weeksRemaining);
  const negative = breakdown.safeToSpend < 0;
  const [dollars, cents] = splitCents(
    formatCurrency(breakdown.safeToSpend, currency),
  );

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={entranceVariant(Boolean(reduceMotion))}
      aria-label="Safe to spend now"
    >
      <div className="relative overflow-hidden rounded-t-[28px] rounded-b-[12px] bg-[var(--mmr-hero)] px-6 pb-9 pt-6 text-[var(--mmr-hero-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] sm:px-8 sm:pt-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">
            Safe to spend now
          </p>
          {stale ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--mmr-clay)_22%,transparent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--mmr-clay)]">
              <WarningCircle size={12} aria-hidden />
              May be out of date
            </span>
          ) : (
            <span className="text-[11px] font-medium opacity-55">
              {updatedLabel(updatedAt, now)}
            </span>
          )}
        </div>

        <p
          className={`mt-4 font-sans text-[60px] font-semibold leading-[0.95] tracking-[-0.05em] [font-feature-settings:'tnum'_1,'cv11'_1] sm:text-[76px] ${
            negative ? "text-[var(--mmr-clay)]" : ""
          }`}
        >
          {dollars}
          {cents && (
            <span className="text-[0.5em] tracking-[-0.02em] opacity-55">
              {cents}
            </span>
          )}
        </p>

        {/*
          The one line the guide research found missing everywhere: a
          banking app's "available balance" is a technical figure that does
          not know about a bill you haven't paid yet or savings you've set
          aside. This number does, because it already holds both back.
        */}
        <p className="mt-4 max-w-[34ch] text-[13.5px] leading-[1.5] opacity-70">
          Not your bank&apos;s balance. This already holds back the bills and
          savings you&apos;ve told it about.
        </p>

        {(weekly > 0 || tightestDay) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {weekly > 0 && (
              <span className={CHIP}>
                <CalendarCheck size={14} aria-hidden className="opacity-70" />
                About {formatCurrency(weekly, currency)} a week
              </span>
            )}
            {tightestDay && (
              <span className={CHIP}>
                <Clock size={14} aria-hidden className="opacity-70" />
                Tightest {formatTightestDate(tightestDay.date)}
                <span className="font-mono text-[11px] opacity-70">
                  {formatCurrency(tightestDay.amountMinorUnits, currency)}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* The receipt. drop-shadow lives on the wrapper because a masked element clips its own box-shadow. */}
      <div className="relative px-3.5 [filter:drop-shadow(0_14px_12px_rgba(16,42,36,0.22))_drop-shadow(0_1px_0_rgba(16,42,36,0.06))]">
        {/* The slot the receipt comes out of, drawn over the slip's top edge. */}
        <div
          aria-hidden
          className="absolute inset-x-1 top-0 z-10 h-[11px] -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--mmr-hero)_45%,#000)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
        />
        <div
          className="bg-[var(--mmr-paper)] px-5 pb-6 pt-8 text-[var(--mmr-ink)]"
          style={{ WebkitMask: TEAR_MASK, mask: TEAR_MASK }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mmr-muted)]">
              The working
            </h3>
            <button
              type="button"
              onClick={() => setShowWorking((value) => !value)}
              aria-expanded={showWorking}
              className="-mr-2 flex min-h-8 items-center gap-1 rounded-full px-2 text-[12px] font-semibold text-[var(--mmr-forest-800)] hover:bg-[var(--mmr-sage-pale)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              {showWorking ? "Hide" : "Show"}
              <CaretDown
                size={13}
                className={`transition-transform ${showWorking ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          </div>

          {showWorking && (
            <motion.dl
              className="mt-2 font-mono text-[12.5px] tabular-nums"
              initial="hidden"
              animate="visible"
              variants={staggerContainer(Boolean(reduceMotion))}
            >
              {BREAKDOWN_LINES.map((line) => (
                <motion.div
                  key={line.key}
                  variants={staggerItem(Boolean(reduceMotion))}
                  className="flex items-baseline gap-2 py-[7px]"
                >
                  <dt className="flex min-w-0 items-baseline gap-2 font-sans text-[13px] text-[color-mix(in_srgb,var(--mmr-ink)_82%,transparent)]">
                    <span
                      aria-hidden
                      className={`w-3 shrink-0 text-center font-mono text-[12px] ${
                        line.sign === "+"
                          ? "text-[var(--mmr-success)]"
                          : "text-[var(--mmr-muted-2)]"
                      }`}
                    >
                      {line.sign === "=" ? "" : line.sign}
                    </span>
                    {line.label}
                  </dt>
                  <span
                    aria-hidden
                    className="mb-[3px] min-w-3 flex-1 self-end border-b border-dotted border-[color-mix(in_srgb,var(--mmr-muted-2)_70%,transparent)]"
                  />
                  <dd className="shrink-0 text-[var(--mmr-ink)]">
                    {formatCurrency(breakdown[line.key], currency)}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
          )}

          <div
            className={`flex items-baseline justify-between gap-3 border-double border-[var(--mmr-ink)] ${
              showWorking ? "mt-1.5 border-t-[3px] pt-2.5" : "mt-3"
            }`}
          >
            <p className="text-[14px] font-semibold text-[var(--mmr-ink)]">
              Safe to spend
            </p>
            <p
              className={`font-mono text-[15px] font-bold tabular-nums ${negative ? "text-[var(--mmr-danger)]" : "text-[var(--mmr-ink)]"}`}
            >
              {formatCurrency(breakdown.safeToSpend, currency)}
            </p>
          </div>

          {showWorking && (
            <p className="mt-3 text-[11.5px] leading-[1.5] text-[var(--mmr-muted)]">
              Based on the information currently added. Expected income
              doesn&apos;t count until it&apos;s marked received, and this
              isn&apos;t financial advice.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
