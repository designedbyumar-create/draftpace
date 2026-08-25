"use client";

import Button from "@/design-system/Button";
import type { Playbook } from "./steps";

/**
 * Which situation, for one context. Shared runtime, proven first by
 * Alongside.
 *
 * With one playbook in a library this screen has no reason to exist and
 * the product can open the only thing it has. Past that, opening the
 * first match risks silently offering the wrong help for the context in
 * front of it, so the choice belongs to the person.
 *
 * Offered by situation rather than by name, same as the front door,
 * because somebody looking at their own context recognises the
 * situation faster than they recognise a playbook's internal title.
 */
export default function PlaybookChooser<TContext extends string = string>({
  title = "What is in the way?",
  available,
  emptyLabel,
  onPick,
  onCancel,
}: {
  title?: string;
  available: Playbook<TContext>[];
  /** Shown when nothing opens for this context, instead of an empty panel. */
  emptyLabel?: string;
  onPick: (playbook: Playbook<TContext>) => void;
  onCancel: () => void;
}) {
  return (
    <section className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{title}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {available.map((playbook) => (
          <li key={playbook.key}>
            <button
              type="button"
              onClick={() => onPick(playbook)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-left text-[14px] leading-5 text-[var(--text)] transition-colors hover:border-[var(--primary)]"
            >
              {playbook.situation}
            </button>
          </li>
        ))}
      </ul>
      {available.length === 0 && emptyLabel && (
        <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">{emptyLabel}</p>
      )}
      <div className="mt-3">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Not now
        </Button>
      </div>
    </section>
  );
}
