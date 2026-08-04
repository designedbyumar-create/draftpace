"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import Button from "@/design-system/Button";
import { Check, WarningCircle, WifiOff } from "@/design-system/Icon";
import { fromMinorUnits, toMinorUnits } from "../currency";
import type { SaveStatus } from "./useInstanceState";

/**
 * The distinct "a read failed" state — must never be visually or textually
 * confused with "no-instance" (genuinely not owned yet). A network hiccup, a
 * transient RLS timing issue, or state that failed schema validation are all
 * recoverable; none of them mean the product needs to be added again. See
 * the P0 stability incident, 2026-08-04, and DRAFTPACE-PRODUCT-EXPERIENCE-
 * PLAYBOOK's "never fabricate an empty state from a failed read" principle.
 */
export function LoadErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--danger)]/40 px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
        <WarningCircle size={18} aria-hidden />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-[var(--text)]">Couldn&apos;t load Monthly Money Reset</p>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-5 text-[var(--muted)]">
          Your product and everything saved to it are still there. This screen just couldn&apos;t load right now.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onRetry}>
          Retry
        </Button>
        <Button size="sm" variant="secondary" href="/app">
          Back to Draftpace
        </Button>
      </div>
    </div>
  );
}

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "saving") {
    return <p className="text-[11px] font-semibold text-[var(--muted)]">Saving…</p>;
  }
  if (status === "saved") {
    return (
      <p className="flex items-center gap-1 text-[11px] font-semibold text-[var(--success)]">
        <Check size={12} aria-hidden />
        Saved
      </p>
    );
  }
  if (status === "conflict") {
    return (
      <p className="flex items-center gap-1 text-[11px] font-semibold text-[var(--warning)]">
        <WarningCircle size={12} aria-hidden />
        Updated elsewhere, refreshed with the latest
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1 text-[11px] font-semibold text-[var(--danger)]">
      <WifiOff size={12} aria-hidden />
      Couldn&apos;t save. Check your connection
    </p>
  );
}

/** A currency-aware amount input: displays/edits a major-unit decimal, stores integer minor units. */
export function AmountField({
  label,
  valueMinorUnits,
  currency,
  onChange,
  autoFocus,
}: {
  label: string;
  valueMinorUnits: number;
  currency: string;
  onChange: (minorUnits: number) => void;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useState<string>(
    valueMinorUnits === 0 ? "" : String(fromMinorUnits(valueMinorUnits, currency))
  );

  return (
    <Input
      label={label}
      type="text"
      inputMode="decimal"
      autoFocus={autoFocus}
      value={draft}
      placeholder="0.00"
      onChange={(event) => {
        const raw = event.target.value;
        if (!/^\d*\.?\d*$/.test(raw)) return;
        setDraft(raw);
        const numeric = Number(raw);
        onChange(Number.isFinite(numeric) ? toMinorUnits(numeric, currency) : 0);
      }}
      onBlur={() => {
        if (draft === "") return;
        const numeric = Number(draft);
        setDraft(Number.isFinite(numeric) ? String(fromMinorUnits(toMinorUnits(numeric, currency), currency)) : "");
      }}
    />
  );
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
