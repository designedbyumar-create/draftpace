"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Check } from "@/design-system/Icon";
import { renderInline } from "../inline";

/**
 * A list of things to actually do, with tick boxes and a live count.
 *
 * WHY IT DOES NOT REMEMBER ANYTHING
 *
 * Nothing here is stored. A guide is a public page and its reader has
 * no account, so persisting ticks would need either local storage that
 * silently diverges between devices or a login the reader did not ask
 * for. Both would be a worse promise than the honest one, and the
 * footnote says plainly that ticks last for this visit. The products
 * are where state belongs, and that difference is worth demonstrating
 * rather than blurring.
 *
 * The count exists because the value of ticking is knowing where you
 * stopped in a long sweep, which is the actual reading situation these
 * lists are written for.
 */
export default function CheckableList({
  items,
  idPrefix,
}: {
  items: string[];
  idPrefix: string;
}) {
  const [done, setDone] = useState<ReadonlySet<number>>(() => new Set());

  const toggle = (index: number) =>
    setDone((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const complete = done.size;
  const total = items.length;
  const pct = useMemo(() => (total === 0 ? 0 : Math.round((complete / total) * 100)), [complete, total]);

  return (
    <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {complete === 0 ? `${total} things to do` : `${complete} of ${total}`}
        </p>
        {complete > 0 && (
          <button
            type="button"
            onClick={() => setDone(new Set())}
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[12px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <RotateCcw size={13} aria-hidden />
            Clear
          </button>
        )}
      </div>

      {/* A single rule rather than a bar with a percentage label. The
          reader is part way through a sweep, not scoring themselves. */}
      <div className="h-[3px] w-full bg-[var(--border)]" aria-hidden>
        <div
          className="h-full bg-[var(--area,var(--primary))] transition-[width] duration-[var(--dur)] ease-[var(--ease-out)]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="flex flex-col divide-y divide-[var(--border)]">
        {items.map((item, i) => {
          const checked = done.has(i);
          const id = `${idPrefix}-${i}`;
          return (
            <li key={i}>
              <label
                htmlFor={id}
                className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--surface-muted)]"
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(i)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={[
                    "mt-[3px] flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors",
                    "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)]",
                    checked
                      ? "border-[var(--area,var(--primary))] bg-[var(--area,var(--primary))] text-white"
                      : "border-[var(--border-strong)] bg-[var(--surface)]",
                  ].join(" ")}
                >
                  {checked && <Check size={12} filled />}
                </span>
                <span
                  className={[
                    "text-[15.5px] leading-[1.65] transition-colors",
                    checked ? "text-[var(--faint)]" : "text-[var(--text)]",
                  ].join(" ")}
                >
                  {renderInline(item, `ck-${idPrefix}-${i}`)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-[12px] text-[var(--faint)]">
        Ticks are for this visit only. Nothing here is saved anywhere.
      </p>
    </div>
  );
}
