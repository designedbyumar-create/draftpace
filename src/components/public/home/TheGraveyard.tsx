import { Download } from "@/design-system/Icon";

// The folder of things people already bought and forgot. Deliberately grey and
// still: the stillness is the point. Names are generic artifact types, never a
// real marketplace brand.
const DEAD_FILES = [
  { name: "budget.xlsx", meta: "Opened once" },
  { name: "moving-checklist.pdf", meta: "Last opened 5 months ago" },
  { name: "workout-plan.pdf", meta: "Never opened" },
  { name: "planner-2024.pdf", meta: "Downloaded twice, forgotten twice" },
];

export default function TheGraveyard() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Why we exist</p>
        <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
          Most of what you buy online dies on download.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
          You have paid for a folder like this already: a budget, a checklist, a workout plan, a planner that
          promised to change something. Each one peaked the moment you bought it, then went quiet. A file cannot
          notice, remind, or adjust, so it never does.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 [filter:grayscale(1)]" aria-hidden>
        {DEAD_FILES.map((file) => (
          <div key={file.name} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--faint)]">
              <Download size={16} aria-hidden />
            </span>
            <p className="mt-3 truncate text-[13px] font-semibold text-[var(--muted)]">{file.name}</p>
            <p className="mt-0.5 text-[11px] text-[var(--faint)]">{file.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
