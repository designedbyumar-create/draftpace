"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import { Check, WarningCircle, WifiOff } from "@/design-system/Icon";
import { fromMinorUnits, toMinorUnits } from "../currency";
import type { SaveStatus } from "./useInstanceState";

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
