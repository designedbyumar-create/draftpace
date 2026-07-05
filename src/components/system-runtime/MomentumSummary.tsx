"use client";

import { Flame, Sparkles } from "@/components/ui/Icon";
import { ProgressSummary, SystemBlueprint } from "@/lib/systems";

export default function MomentumSummary({
  blueprint,
  progress,
}: {
  blueprint: SystemBlueprint;
  progress: ProgressSummary;
}) {
  const hasStarted = progress.completedSessions > 0;

  return (
    <section className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">Momentum</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-[var(--text)]">
            {hasStarted ? progress.momentumScore : "Ready"}
          </p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
          style={{ background: blueprint.visualTheme.accent }}
        >
          {progress.currentStreak > 0 ? <Flame size={20} /> : <Sparkles size={20} />}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {hasStarted
          ? "Showing up carries more weight than doing too much once. The score rises from marked sessions, streak, and product-specific metrics."
          : "Momentum begins after the first marked session. Until then, Draftpace keeps the next action clear."}
      </p>
    </section>
  );
}
