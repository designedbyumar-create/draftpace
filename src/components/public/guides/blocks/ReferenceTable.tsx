"use client";

import { useId, useMemo, useState } from "react";
import { Search, X } from "@/design-system/Icon";
import { renderInline } from "../inline";

/**
 * Reference tables, which are the most valuable thing in sixteen of
 * these guides and were the worst thing about reading them on a phone.
 *
 * WHAT WAS WRONG
 *
 * The previous renderer put every table in a horizontally scrolling box
 * with a 480px minimum width. On a 375px screen the third column was
 * simply cut off with no affordance suggesting it existed, so the
 * column carrying the reasoning, which is the column worth reading,
 * was invisible on the device most of these are read on.
 *
 * WHAT IT DOES NOW
 *
 * Below the small breakpoint every row becomes its own card: the first
 * column is the card's title and each remaining column is a labelled
 * line beneath it. Nothing is truncated and the page never scrolls
 * sideways. From the small breakpoint up it is a real table again,
 * because a real table is better when there is room for one.
 *
 * Long tables also get a filter. That is not decoration: a reader
 * arriving at a service-interval table wants one appliance, and
 * scanning twenty rows on a phone to find it is the whole friction.
 */

const FILTER_FROM_ROWS = 8;

export default function ReferenceTable({
  columns,
  rows,
  idPrefix,
}: {
  columns: string[];
  rows: string[][];
  idPrefix: string;
}) {
  const [query, setQuery] = useState("");
  const filterId = useId();
  const filterable = rows.length >= FILTER_FROM_ROWS;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(needle)));
  }, [query, rows]);

  return (
    <div className="mt-5">
      {filterable && (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus-within:border-[var(--area,var(--primary))]">
          <Search size={15} aria-hidden className="shrink-0 text-[var(--faint)]" />
          <input
            id={filterId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Filter ${rows.length} rows`}
            aria-label={`Filter this table of ${rows.length} rows`}
            className="w-full bg-transparent text-[14.5px] text-[var(--text)] outline-none placeholder:text-[var(--faint)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear the filter"
              className="shrink-0 rounded p-0.5 text-[var(--faint)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <X size={14} aria-hidden />
            </button>
          )}
        </div>
      )}

      {filterable && (
        <p aria-live="polite" className="sr-only">
          {visible.length} of {rows.length} rows shown
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] px-4 py-6 text-center text-[14px] text-[var(--muted)]">
          Nothing in this table matches {`"${query}"`}.
        </p>
      ) : (
        <>
          {/* Phones: one card per row, nothing clipped. */}
          <ul className="flex flex-col gap-2.5 sm:hidden">
            {visible.map((row, r) => (
              <li
                key={r}
                className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
              >
                <p className="border-b border-[var(--border)] bg-[var(--area-soft,var(--surface-muted))] px-4 py-2.5 text-[15px] font-semibold leading-snug text-[var(--text)]">
                  {renderInline(row[0], `mc-${idPrefix}-${r}`)}
                </p>
                <dl className="flex flex-col divide-y divide-[var(--border)]">
                  {row.slice(1).map((cell, c) => (
                    <div key={c} className="px-4 py-3">
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">
                        {columns[c + 1]}
                      </dt>
                      <dd className="mt-1 text-[14.5px] leading-[1.6] text-[var(--text)]">
                        {renderInline(cell, `md-${idPrefix}-${r}-${c}`)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>

          {/* Everywhere with room for one: a real table. */}
          <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] sm:block">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row, r) => (
                  <tr key={r} className="transition-colors hover:bg-[var(--surface-muted)]">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={[
                          "border-b border-[var(--border)] px-4 py-3 align-top text-[var(--text)]",
                          c === 0 ? "font-medium" : "",
                        ].join(" ")}
                      >
                        {renderInline(cell, `t-${idPrefix}-${r}-${c}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
