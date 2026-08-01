import { ArrowRight } from "@/design-system/Icon";

export default function AdaptationSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">When life changes</p>
        <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
          When something changes, update the plan without rebuilding it.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
          The plan made sense before something changed, and going back now feels like more work than it should be.
          You update the one thing that changed. The rest of the plan adjusts around it.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 opacity-70">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">Before</p>
          <p className="mt-1 text-[14px] text-[var(--muted)]">Book the moving truck for the 15th</p>
        </div>

        <div className="flex items-center gap-2 self-center rounded-full bg-[var(--warning-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--warning)]">
          Move-in date changed to the 8th
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[var(--primary)] bg-[var(--primary-soft)] p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
            <ArrowRight size={11} aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">Now</p>
            <p className="mt-0.5 text-[14px] font-semibold text-[var(--text)]">Book the moving truck for the 8th</p>
          </div>
        </div>
      </div>
    </div>
  );
}
