"use client";

import { useState, type KeyboardEvent } from "react";
import {
  AFFAIR_AREA_LABEL,
  AFFAIR_AREA_ORDER,
  AFFAIR_DOMAIN_LABEL,
  type AffairArea,
} from "../affairsKnowledge";
import { BOOK_ATTRIBUTION, BOOK_NAME } from "../completion";
import { personalLifeAffairsCompanionDefinition } from "../definition";
import { describeItem, type AffairItem } from "../lifeAffairs";

/**
 * The book, as an object: a cloth cover, then index tabs and the section
 * that is open.
 *
 * WHAT SOMEBODY WOULD RECEIVE
 *
 * The contents are set the way the printed copy sets them, in the
 * person's own words with the entry and where it is joined by a leader,
 * so what is on screen is what would be handed over. Only areas that have
 * something in them get a tab. A tab for an empty area would be a
 * checklist row wearing a heading.
 *
 * The cover keeps its cloth blue in the dark theme. It is an object, and
 * objects do not invert.
 */

const ACCENT = personalLifeAffairsCompanionDefinition.theme?.accentScale;
if (!ACCENT) throw new Error("Personal Life Affairs Companion must declare its accent scale.");
const COVER = ACCENT.base;
const COVER_INK = ACCENT.contrast;

export default function BookSpread({
  lastUpdated,
  items,
}: {
  /** Already formatted, or null when nothing has been confirmed yet. */
  lastUpdated: string | null;
  items: AffairItem[];
}) {
  const groups = AFFAIR_AREA_ORDER.map((area) => ({ area, entries: items.filter((item) => item.area === area) })).filter(
    (group) => group.entries.length > 0,
  );
  const [selected, setSelected] = useState<AffairArea | null>(null);
  const active = groups.find((group) => group.area === selected) ?? groups[0] ?? null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!active || (event.key !== "ArrowRight" && event.key !== "ArrowLeft")) return;
    const index = groups.findIndex((group) => group.area === active.area);
    const next = groups[(index + (event.key === "ArrowRight" ? 1 : groups.length - 1)) % groups.length];
    setSelected(next.area);
    document.getElementById(`book-tab-${next.area}`)?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="relative overflow-hidden rounded-[var(--radius-sm)] py-9 pl-11 pr-7 shadow-[0_22px_34px_-22px_color-mix(in_srgb,#000_45%,transparent)]"
        style={{ backgroundColor: COVER, color: COVER_INK }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[22px] bg-[color-mix(in_srgb,#000_22%,transparent)] shadow-[inset_-1px_0_0_color-mix(in_srgb,#fff_14%,transparent)]"
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-75">{BOOK_ATTRIBUTION}</p>
        <h2
          className="mt-6 text-[40px] leading-none tracking-[-0.01em]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)", fontWeight: 500 }}
        >
          {BOOK_NAME}
        </h2>
        <div className="mt-6 h-px w-14" style={{ backgroundColor: COVER_INK, opacity: 0.55 }} />
        {lastUpdated && <p className="mt-3 text-[12.5px] opacity-80">Last updated {lastUpdated}</p>}
      </div>

      {active && (
        <div>
          <div
            role="tablist"
            aria-label="Sections of your book"
            onKeyDown={onKeyDown}
            className="-mb-px flex gap-1 overflow-x-auto pl-3"
          >
            {groups.map(({ area }) => {
              const isActive = area === active.area;
              return (
                <button
                  key={area}
                  id={`book-tab-${area}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="book-section"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setSelected(area)}
                  className={`relative shrink-0 rounded-t-[var(--radius-sm)] border border-b-0 px-3.5 pb-2 pt-2 text-[12px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                    isActive
                      ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                      : "border-transparent bg-[var(--surface-strong)] text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {AFFAIR_DOMAIN_LABEL[area]}
                </button>
              );
            })}
          </div>
          <section
            id="book-section"
            role="tabpanel"
            aria-labelledby={`book-tab-${active.area}`}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-5 py-5 shadow-[0_18px_30px_-24px_color-mix(in_srgb,#000_32%,transparent)]"
          >
            <p className="border-b border-[var(--border)] pb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              {AFFAIR_AREA_LABEL[active.area]}
            </p>
            <ul className="mt-2 flex flex-col">
              {active.entries.map((item) => {
                const detail = describeItem(item);
                return (
                  <li key={item.id} className="py-2">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-[16px] text-[var(--text)]"
                        style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
                      >
                        {item.label}
                      </span>
                      <span aria-hidden className="min-w-4 flex-1 border-b border-dotted border-[var(--border-strong)]" />
                    </div>
                    {detail && detail !== item.label && (
                      <p className="mt-0.5 text-[13px] leading-snug text-[var(--muted)]">{detail}</p>
                    )}
                    {item.notes && <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">{item.notes}</p>}
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-[var(--border)] pt-3 text-[12px] leading-relaxed text-[var(--muted)]">
              The printed copy carries the date you last confirmed each entry, so whoever holds it can tell what is
              current.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
