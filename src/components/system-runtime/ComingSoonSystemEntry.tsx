"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, CheckCircle2, Clock, Compass, Layers3, LockKeyhole, Sparkles } from "@/components/ui/Icon";
import { getSystemCategory, SystemBlueprint, formatSystemPrice } from "@/lib/systems";
import { MomentumRing, SystemBook } from "@/components/system/SystemVisuals";

export default function ComingSoonSystemEntry({ blueprint }: { blueprint: SystemBlueprint }) {
  const category = getSystemCategory(blueprint.category);
  const highlights = blueprint.storeCard.highlights?.length
    ? blueprint.storeCard.highlights
    : blueprint.paths.slice(0, 3).map((path) => path.name);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <section className="overflow-hidden rounded-[34px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1fr_330px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill label="Coming Soon" icon={<Clock size={13} />} />
              <StatusPill label={category?.label || blueprint.category} icon={<Compass size={13} />} muted />
              <StatusPill label={formatSystemPrice(blueprint)} icon={<LockKeyhole size={13} />} muted />
            </div>

            <p className="mt-8 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--faint)]">
              Draftpace System preview
            </p>
            <h2 className="mt-3 max-w-2xl text-[38px] font-black leading-[0.96] tracking-tight text-[var(--text)] sm:text-[56px]">
              {blueprint.name}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-[17px]">{blueprint.promise}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-stretch">
              <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">What is ready to preview</p>
                <p className="mt-2 text-lg font-black leading-tight text-[var(--text)]">
                  {blueprint.paths.length} system paths, companion framing, and recovery behavior.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="flex min-h-20 cursor-not-allowed items-center justify-center gap-2 rounded-[24px] bg-[var(--surface-strong)] px-6 py-4 text-sm font-black text-[var(--faint)]"
              >
                {blueprint.storeCard.ctaLabel || "Notify Me"}
                <Bell size={16} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <PreviewMetric label="Progress" value="0%" />
              <PreviewMetric label="Sessions" value="0" />
              <PreviewMetric label="Paths" value={`${blueprint.paths.length}`} />
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

      <section className="grid gap-4 lg:grid-cols-[1fr_270px]">
        <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[var(--primary)]">
              <Layers3 size={17} />
              <p className="text-[11px] font-black uppercase tracking-[0.16em]">System library</p>
            </div>
            <p className="text-xs font-bold text-[var(--muted)]">Preview only</p>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {blueprint.paths.map((path, index) => (
              <div key={path.id} className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                    style={{ background: index % 2 === 0 ? blueprint.visualTheme.accent : blueprint.visualTheme.secondary }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[var(--text)]">{path.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{path.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
            <MomentumRing value={0} accent={blueprint.visualTheme.accent} label="Preview" />
            <p className="mt-4 text-base font-black text-[var(--text)]">No progress yet</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              This System is not active, so Draftpace is not saving sessions, marking days, or writing progress.
            </p>
          </div>

          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_14px_44px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2 text-[var(--primary)]">
              <Sparkles size={17} />
              <p className="text-[11px] font-black uppercase tracking-[0.16em]">Companion hint</p>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-[var(--text)]">
              When this opens, the Companion will help choose a pace, compress the session when needed, and keep progress tied to real behavior.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--faint)]">Included direction</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {highlights.map((highlight) => (
            <div key={highlight} className="flex items-start gap-2 rounded-2xl bg-[var(--surface-muted)] p-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--primary)]" />
              <span className="text-xs font-bold leading-5 text-[var(--muted)]">{highlight}</span>
            </div>
          ))}
        </div>
      </section>

      <Link href="/dashboard/drafts" className="inline-flex items-center gap-2 text-sm font-black text-[var(--primary)]">
        <ArrowLeft size={15} />
        Back to Systems
      </Link>
    </div>
  );
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

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--faint)]">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-[var(--text)]">{value}</p>
    </div>
  );
}
