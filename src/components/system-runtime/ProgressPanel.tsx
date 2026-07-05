"use client";

import { ProgressSummary, SystemBlueprint } from "@/lib/systems";
import { MomentumRing } from "@/components/system/SystemVisuals";

export default function ProgressPanel({
  blueprint,
  progress,
  compact = false,
}: {
  blueprint: SystemBlueprint;
  progress: ProgressSummary;
  compact?: boolean;
}) {
  const hasStarted = progress.completedSessions > 0;
  const statusLabel = hasStarted ? `${progress.momentumScore} momentum` : "Ready";
  const barWidth = hasStarted ? progress.percent : 6;

  if (compact) {
    return (
      <section className="sticky top-[72px] z-20 rounded-[22px] border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-[0_14px_44px_rgba(15,23,42,0.07)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-xs font-black text-[var(--text)]">{blueprint.shortName}</p>
              <p className="shrink-0 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--primary)]">
                {statusLabel}
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-strong)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${barWidth}%`, background: blueprint.visualTheme.accent, opacity: hasStarted ? 1 : 0.4 }}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--surface-muted)] px-3 py-2 text-center">
            <p className="text-sm font-black text-[var(--text)]">{progress.completedSessions}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[var(--faint)]">marked</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_14px_44px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-4">
        {hasStarted ? (
          <MomentumRing value={progress.momentumScore} accent={blueprint.visualTheme.accent} />
        ) : (
          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)]">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-[var(--primary)]">Ready</span>
            <span className="mt-1 text-[10px] font-bold text-[var(--muted)]">not started</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">Progress summary</p>
          <h3 className="mt-1 text-lg font-black text-[var(--text)]">
            {hasStarted ? "Momentum is visible." : "Ready when you start."}
          </h3>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--surface-strong)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${barWidth}%`, background: blueprint.visualTheme.accent, opacity: hasStarted ? 1 : 0.4 }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {progress.metrics.slice(0, 3).map((metric) => (
          <div key={metric.id} className="rounded-2xl bg-[var(--surface-muted)] p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--faint)]">{metric.label}</p>
            <p className="mt-1 text-base font-black text-[var(--text)]">{metric.displayValue}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
