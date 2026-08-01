"use client";

import Button from "@/design-system/Button";
import { Check, Plus, X } from "@/design-system/Icon";
import type { NextAction } from "../state";

export default function NextActionCard({
  nextAction,
  onDismiss,
  onAct,
}: {
  nextAction: NextAction | null;
  onDismiss: () => void;
  onAct: () => void;
}) {
  if (!nextAction) {
    return (
      <div className="rounded-2xl border border-[var(--border)] p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Your next move</p>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
            <Check size={14} aria-hidden />
          </span>
          <p className="text-[14px] font-semibold text-[var(--text)]">No action needed right now</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Your next move</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss this recommendation"
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
        >
          <X size={12} aria-hidden />
        </button>
      </div>
      <p className="mt-2 text-[17px] font-semibold text-[var(--text)]">{nextAction.label}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{nextAction.reason}</p>
      <Button size="md" className="mt-4" iconLeft={<Plus size={13} aria-hidden />} onClick={onAct}>
        {nextAction.id === "weekly-check-in" ? "Start check-in" : "Add what changed"}
      </Button>
    </div>
  );
}
