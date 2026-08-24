"use client";

import Button from "@/design-system/Button";
import { KIND_LABEL, type LifeItem } from "../life";
import type { Playbook } from "../playbook";
import { playbooksFor } from "../playbooks";

/**
 * Which kind of help, for one item.
 *
 * With one playbook in the library this screen did not exist and the
 * product opened the only thing it had. With eight, opening the first
 * match would mean a thread about a half decorated room silently getting
 * the phone call playbook, so the choice belongs to the person.
 *
 * Offered by situation rather than by name, the same as Help, because
 * somebody looking at "sort out the electricity bill" recognises "the
 * whole thing is too big to start" faster than they recognise "break
 * down something too big".
 */
export default function PlaybookChooser({
  item,
  onPick,
  onCancel,
}: {
  item: LifeItem;
  onPick: (playbook: Playbook) => void;
  onCancel: () => void;
}) {
  const available = playbooksFor(item.kind);

  return (
    <section className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        What is in the way?
      </p>
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
      {available.length === 0 && (
        // Only reachable for a reference, which no playbook opens for,
        // and saying so is better than an empty panel.
        <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">
          Nothing here opens for {KIND_LABEL[item.kind].toLowerCase()}.
        </p>
      )}
      <div className="mt-3">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Not now
        </Button>
      </div>
    </section>
  );
}
