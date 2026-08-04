"use client";

import { useState } from "react";
import type { ProductDefinition } from "@/product-framework/definition";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Download, Wallet } from "@/design-system/Icon";
import { useInstanceState } from "./useInstanceState";
import { LoadErrorState } from "./shared";
import ThemeScope from "./ThemeScope";
import { computeSafeToSpend, weeklyGuideAmount, type SafeToSpendBreakdown } from "../calculations";
import { computeNextAction } from "../nextAction";
import { formatCurrency } from "../currency";
import type { MonthlyMoneyResetState } from "../state";
import type { MoneyResetPdfData } from "../printables/generatePdf";

const BREAKDOWN_LINES: { key: keyof SafeToSpendBreakdown; label: string; sign: string }[] = [
  { key: "startingAvailableBalance", label: "Money available right now", sign: "=" },
  { key: "incomeReceived", label: "Income received", sign: "+" },
  { key: "ordinarySpending", label: "Ordinary spending recorded", sign: "-" },
  { key: "billPayments", label: "Bill payments made", sign: "-" },
  { key: "savingsTransfersOut", label: "Savings transfers made", sign: "-" },
  { key: "protectedUnpaidBills", label: "Protected bills not yet paid", sign: "-" },
  { key: "protectedReserveHeld", label: "Reserve still held", sign: "-" },
];

function monthLabel(cycleKey: string): string {
  const [year, month] = cycleKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function weeksRemaining(cycleKey: string, now: Date = new Date()): number {
  const [year, month] = cycleKey.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Math.max(Math.ceil((daysInMonth - now.getUTCDate() + 1) / 7), 1);
}

function buildData(state: MonthlyMoneyResetState, definition: ProductDefinition, origin: string): MoneyResetPdfData {
  const breakdown = computeSafeToSpend(state);
  const nextAction = computeNextAction(state, breakdown);
  const upcomingBills = state.bills
    .filter((bill) => bill.status === "upcoming" || bill.status === "changed")
    .slice(0, 6)
    .map((bill) => ({ name: bill.name || "Bill", amount: bill.amountMinorUnits }));

  return {
    monthLabel: monthLabel(state.cycle.cycleKey),
    monthSlug: state.cycle.cycleKey,
    generatedLabel: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    currency: state.currency,
    safeToSpend: breakdown.safeToSpend,
    weekly: weeklyGuideAmount(breakdown.safeToSpend, weeksRemaining(state.cycle.cycleKey)),
    breakdownLines: BREAKDOWN_LINES.map((line) => ({ label: line.label, sign: line.sign, value: breakdown[line.key] })),
    protectedUnpaidBills: breakdown.protectedUnpaidBills,
    protectedReserveHeld: breakdown.protectedReserveHeld,
    upcomingBills,
    nextMove: nextAction?.label ?? null,
    origin,
    slug: definition.slug,
  };
}

export default function PrintablesModule({ definition }: { definition: ProductDefinition }) {
  const { status, state, retry } = useInstanceState(definition.slug);
  const [generating, setGenerating] = useState(false);

  if (status === "loading") {
    return <p className="text-[13px] text-[var(--muted)]">Loading your snapshot…</p>;
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

  if (!state.setup.completedAt) {
    return (
      <EmptyState
        icon={Download}
        title="Finish setup to make your snapshot"
        description="Your Printable is built from your plan, so it needs setup finished first. It only takes a minute."
        action={
          <Button href={`/app/products/${definition.slug}/setup`} size="md">
            Finish setup
          </Button>
        }
      />
    );
  }

  const data = buildData(state, definition, "https://www.draftpace.com");

  async function handleDownload() {
    if (generating || !state) return;
    setGenerating(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "https://www.draftpace.com";
      const { downloadMoneyResetPdf } = await import("../printables/generatePdf");
      await downloadMoneyResetPdf(buildData(state, definition, origin));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <ThemeScope>
      <div className="max-w-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--mmr-clay)]">Printables</p>
        <h2 className="mt-2 font-serif text-[22px] font-semibold tracking-tight text-[var(--mmr-ink)]">
          A snapshot you can keep.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--mmr-muted)]">
          Print it, save it, or share it with someone. It is built from your plan right now, so every download is
          current, and it links straight back to your workspace.
        </p>

        <PrintablePreview data={data} />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="lg" iconLeft={<Download size={15} aria-hidden />} onClick={handleDownload} disabled={generating}>
            {generating ? "Preparing your PDF…" : "Download PDF"}
          </Button>
          <p className="text-[12px] text-[var(--mmr-muted)]">
            The file links back to your workspace, setup, and history.
          </p>
        </div>
      </div>
    </ThemeScope>
  );
}

/** The living preview: an on-screen mirror of the artifact, in MMR's world. */
function PrintablePreview({ data }: { data: MoneyResetPdfData }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--mmr-line)] bg-[var(--mmr-paper)] shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between border-b border-[var(--mmr-line)] px-6 py-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--mmr-sage-strong)]">
          Monthly Money Reset
        </span>
        <span className="font-serif text-[12px] text-[var(--mmr-muted)]">Draftpace</span>
      </div>

      <div className="px-6 py-5">
        <p className="font-serif text-[22px] font-semibold text-[var(--mmr-forest-900)]">{data.monthLabel}</p>
        <p className="mt-0.5 text-[12px] text-[var(--mmr-muted)]">Your money snapshot, as of {data.generatedLabel}.</p>

        <div className="mt-4 rounded-xl bg-[var(--mmr-forest-900)] px-5 py-4 text-[var(--mmr-ivory)]">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] opacity-60">Safe to spend now</p>
          <p className={`mt-1 font-serif text-[34px] font-semibold leading-none ${data.safeToSpend < 0 ? "text-[var(--mmr-clay)]" : ""}`}>
            {formatCurrency(data.safeToSpend, data.currency)}
          </p>
          <p className="mt-2 text-[11px] opacity-70">
            About {formatCurrency(data.weekly, data.currency)} a week for the rest of the month.
          </p>
        </div>

        {data.nextMove && (
          <div className="mt-3 rounded-lg border-l-2 border-[var(--mmr-clay)] bg-[var(--mmr-clay-soft)] px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-clay)]">Your next move</p>
            <p className="mt-0.5 text-[13px] font-semibold text-[var(--mmr-ink)]">{data.nextMove}</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-sage-strong)]">What is protected</p>
            <PreviewLine label="Bills not yet paid" value={formatCurrency(data.protectedUnpaidBills, data.currency)} />
            <PreviewLine label="Reserve still held" value={formatCurrency(data.protectedReserveHeld, data.currency)} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-sage-strong)]">Upcoming bills</p>
            {data.upcomingBills.length === 0 ? (
              <p className="mt-1.5 text-[11px] text-[var(--mmr-muted)]">Every bill is handled this month.</p>
            ) : (
              data.upcomingBills.slice(0, 3).map((bill, i) => (
                <PreviewLine key={i} label={bill.name} value={formatCurrency(bill.amount, data.currency)} />
              ))
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-[var(--mmr-line)] pt-3">
          <p className="text-[11px] text-[var(--mmr-sage-strong)]">
            Continue in the app: <span className="text-[var(--mmr-forest-900)] underline">Open your workspace</span>,{" "}
            <span className="text-[var(--mmr-forest-900)] underline">Update your setup</span>,{" "}
            <span className="text-[var(--mmr-forest-900)] underline">See your history</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-1.5 flex items-center justify-between border-b border-[var(--mmr-line)] pb-1 text-[11px]">
      <span className="text-[var(--mmr-muted)]">{label}</span>
      <span className="font-semibold text-[var(--mmr-ink)]">{value}</span>
    </div>
  );
}
