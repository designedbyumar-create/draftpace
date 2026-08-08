"use client";

import { Sparkles } from "@/design-system/Icon";

/**
 * "What this unlocked" (launch spec Stage C §6) — shown only when the
 * underlying data genuinely just made a capability meaningful for the
 * first time (a waiting → ready/needsInfo transition in capability.ts),
 * never a rotating tip or a fabricated milestone. No XP, no streak, no
 * badge — one plain sentence stating what became true.
 */
export default function UnlockMoment({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] p-3.5">
      <Sparkles size={16} aria-hidden className="mt-0.5 shrink-0 text-[var(--primary)]" />
      <p className="text-[13px] leading-relaxed font-medium text-[var(--text)]">{message}</p>
    </div>
  );
}
