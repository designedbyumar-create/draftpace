"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Layers3, LockKeyhole } from "@/components/ui/Icon";
import { CompanionResponse, ProgressSummary, RuntimeState, SystemBlueprint } from "@/lib/systems";
import { SystemBook } from "@/components/system/SystemVisuals";
import CompanionPanel from "@/components/system-runtime/CompanionPanel";

export default function SystemEntry({
  blueprint,
  state,
  progress,
  nextStep,
  companion,
  onPrimary,
}: {
  blueprint: SystemBlueprint;
  state: RuntimeState;
  progress: ProgressSummary;
  nextStep: string;
  companion: CompanionResponse;
  onPrimary: () => void;
}) {
  const primaryLabel = getPrimaryLabel(state);
  const hasStarted = progress.completedSessions > 0;
  const progressLabel = hasStarted ? `${progress.percent}%` : "Ready";

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Image
                src="/logo/draftpace-brand-logo.svg"
                alt="Draftpace"
                width={158}
                height={49}
                className="h-auto w-[158px]"
                priority
              />
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill icon={<LockKeyhole size={13} />} label={blueprint.access === "paid" ? "Paid System" : "System"} />
                <StatusPill icon={<CheckCircle2 size={13} />} label={blueprint.ownedStatus === "owned" ? "Owned" : blueprint.ownedStatus} muted />
              </div>
            </div>

            <h2 className="mt-8 max-w-2xl text-[38px] font-black leading-[0.96] tracking-tight text-[var(--text)] sm:text-[56px]">
              {blueprint.name}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-[17px]">{blueprint.promise}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-stretch">
              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">Next move</p>
                <p className="mt-2 text-lg font-black leading-tight text-[var(--text)]">{nextStep}</p>
              </div>
              <button
                type="button"
                onClick={onPrimary}
                className="flex min-h-20 items-center justify-center gap-2 rounded-[24px] bg-[var(--primary)] px-6 py-4 text-sm font-black text-[var(--primary-contrast)] shadow-[0_16px_40px_rgba(55,48,163,0.22)]"
              >
                {primaryLabel}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <StatusBlock label="Progress" value={progressLabel} />
              <StatusBlock label="Marked" value={`${progress.completedSessions}`} />
              <StatusBlock label="Paths" value={`${blueprint.paths.length}`} />
            </div>
          </div>

          <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] p-4 lg:border-l lg:border-t-0">
            <SystemBook
              visualKind={blueprint.visualTheme.visualKind}
              accent={blueprint.visualTheme.accent}
              secondary={blueprint.visualTheme.secondary}
              title={blueprint.shortName}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[var(--primary)]">
            <Layers3 size={17} />
            <p className="text-[11px] font-black uppercase tracking-[0.16em]">Inside this System</p>
          </div>
          <p className="text-xs font-bold text-[var(--muted)]">{blueprint.paths.length} paths available</p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {blueprint.paths.slice(0, 4).map((path, index) => (
            <div key={path.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                  style={{ background: index === 0 ? blueprint.visualTheme.accent : blueprint.visualTheme.secondary }}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-black text-[var(--text)]">{path.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{path.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CompanionPanel blueprint={blueprint} response={companion} />
    </div>
  );
}

function getPrimaryLabel(state: RuntimeState) {
  if (!state.setup.pathId) return "Choose Path";
  if (!state.setup.rhythmId || !state.setup.intensityId) return "Set Pace";
  if (state.stage === "complete") return "Open Next Session";
  return "Open Active Session";
}

function StatusPill({ icon, label, muted = false }: { icon: ReactNode; label: string; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] ${
        muted
          ? "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted)]"
          : "border-[var(--border)] bg-[var(--primary-soft)] text-[var(--primary)]"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}

function StatusBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--faint)]">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-[var(--text)]">{value}</p>
    </div>
  );
}
