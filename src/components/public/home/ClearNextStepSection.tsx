import { ArrowRight } from "@/design-system/Icon";

const SCATTERED = ["3 messages about the venue", "2 dates still unconfirmed", "1 decision waiting on you"];

export default function ClearNextStepSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Instead of a dashboard</p>
        <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
          A clear next step, not another dashboard to manage.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
          You do not need a summary of everything. You need to know what to do right now. Draftpace looks at where
          things stand and tells you the one thing worth doing next.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Scattered around</p>
          <ul className="mt-3 flex flex-col gap-2">
            {SCATTERED.map((detail) => (
              <li key={detail} className="text-[13px] text-[var(--muted)]">
                {detail}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center py-1 text-[var(--faint)]" aria-hidden>
          <ArrowRight size={16} className="rotate-90" />
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] p-5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
            <ArrowRight size={11} aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">Right now</p>
            <p className="mt-0.5 text-[14px] font-semibold text-[var(--text)]">Reply to the venue about Saturday</p>
          </div>
        </div>
      </div>
    </div>
  );
}
