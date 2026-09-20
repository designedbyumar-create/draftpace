import type { ReactNode } from "react";
import type { PackingSection } from "../packingLists";

/**
 * The packing list, set out to be ticked.
 *
 * Grouped by whose it is, then by heading, so a family can pack from one
 * screen or one printed page. Nothing here counts what is left, scores
 * anything or nags: a ticked item is simply ticked, and a removed one is
 * simply gone from the list (archived, never deleted).
 *
 * Presentational only. Writing stays in TripModule.
 */

export interface PackingViewProps {
  sections: PackingSection[];
  onToggle: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
  actions: ReactNode;
}

export default function PackingView({ sections, onToggle, onRemove, actions }: PackingViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
      {sections.map((section) => (
        <section key={section.key} aria-label={`Packing for ${section.heading}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="text-[16px] font-semibold text-[var(--text)]">{section.heading}</h3>
          <div className="mt-3 flex flex-col gap-4">
            {section.groups.map((group) => (
              <div key={group.group}>
                <p className="border-b border-[var(--border)] pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {group.group}
                </p>
                <ul className="mt-1 flex flex-col">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex min-h-11 items-center gap-3">
                      <label className="flex min-w-0 flex-1 items-center gap-3 py-1.5">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => onToggle(item.id, item.done)}
                          className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                        />
                        <span className={`text-[15px] ${item.done ? "text-[var(--muted)] line-through" : "text-[var(--text)]"}`}>
                          {item.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.title}`}
                        className="min-h-9 shrink-0 rounded-full px-3 text-[12px] font-semibold text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
