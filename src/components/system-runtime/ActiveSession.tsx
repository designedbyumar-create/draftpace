"use client";

import { ArrowRight, BadgeCheck, BookOpen, SlidersHorizontal } from "@/components/ui/Icon";
import {
  ActiveSession as RuntimeActiveSession,
  CompanionResponse,
  RuntimeActionValues,
  RuntimeValue,
  SystemBlueprint,
} from "@/lib/systems";
import ActionStack from "@/components/system-runtime/ActionStack";
import CompanionPanel from "@/components/system-runtime/CompanionPanel";

export default function ActiveSession({
  blueprint,
  session,
  values,
  ready,
  companion,
  onChange,
  onAdjust,
  onMark,
}: {
  blueprint: SystemBlueprint;
  session: RuntimeActiveSession;
  values: RuntimeActionValues;
  ready: boolean;
  companion: CompanionResponse;
  onChange: (actionId: string, value: RuntimeValue) => void;
  onAdjust: () => void;
  onMark: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
              style={{ background: blueprint.visualTheme.accent }}
            >
              <BookOpen size={19} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">Daily Page</p>
              <p className="text-sm font-black text-[var(--text)]">{session.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-[11px] font-black text-[var(--muted)]">
              {session.path.shortName}
            </span>
            <span
              className="rounded-full px-3 py-1.5 text-[11px] font-black text-white"
              style={{ background: blueprint.visualTheme.accent }}
            >
              {session.intensity.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[34px] font-black leading-[1.02] tracking-tight text-[var(--text)]">
              {session.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{session.lead}</p>
          </div>
          <button
            type="button"
            onClick={onAdjust}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-xs font-black text-[var(--muted)]"
          >
            <SlidersHorizontal size={15} />
            Adjust
          </button>
        </div>

        <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
          <div className="mb-5">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">Primary move</p>
            <p className="mt-2 text-base font-black leading-6 text-[var(--text)]">{session.recommendedAction}</p>
          </div>
          <ActionStack blueprint={blueprint} actions={session.actions} values={values} onChange={onChange} />
        </div>

        <CompanionPanel blueprint={blueprint} response={companion} />

        <button
          type="button"
          disabled={!ready}
          onClick={onMark}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-4 text-sm font-black text-[var(--primary-contrast)] shadow-[0_16px_40px_rgba(55,48,163,0.22)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          {session.template.completionLabel || "Mark Progress"}
          {ready ? <BadgeCheck size={17} /> : <ArrowRight size={17} />}
        </button>
      </div>
    </section>
  );
}
