"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { renderInline } from "../inline";

/**
 * Two sides held against each other.
 *
 * Several guides turn on a contrast: what a tool assumes against what
 * the work actually is, procrastination against executive dysfunction,
 * what a bank means by available against what you can spend. As a
 * two-column table these collapse badly on a phone, and as prose the
 * pairing is lost entirely.
 *
 * Desktop gets both sides at once, which is how a contrast is best
 * read. A phone gets a real toggle instead of a squeezed table, because
 * two columns of sentences at 375px are unreadable and switching
 * between them is how somebody actually compares on a small screen.
 * The underline animates between tabs so the switch reads as one
 * control with two positions rather than two separate buttons.
 */
export default function CompareBlock({
  left,
  right,
  idPrefix,
}: {
  left: { label: string; items: string[] };
  right: { label: string; items: string[] };
  idPrefix: string;
}) {
  const reduceMotion = useReducedMotion();
  const [side, setSide] = useState<"left" | "right">("left");
  const groupId = useId();
  const sides = [
    { key: "left" as const, ...left },
    { key: "right" as const, ...right },
  ];

  return (
    <div className="mt-5">
      {/* Phones: one side at a time. */}
      <div className="sm:hidden">
        <div role="tablist" aria-label="Compare two sides" className="flex border-b border-[var(--border)]">
          {sides.map((entry) => {
            const active = side === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                role="tab"
                id={`${groupId}-tab-${entry.key}`}
                aria-selected={active}
                aria-controls={`${groupId}-panel-${entry.key}`}
                onClick={() => setSide(entry.key)}
                className={[
                  "relative flex-1 px-3 pb-2.5 pt-1 text-left text-[13px] font-semibold leading-snug transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                  active ? "text-[var(--text)]" : "text-[var(--faint)]",
                ].join(" ")}
              >
                {entry.label}
                {active && (
                  <motion.span
                    layoutId={`${groupId}-underline`}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-0 -bottom-px h-[2px] bg-[var(--area,var(--primary))]"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>

        {sides.map((entry) => (
          <div
            key={entry.key}
            role="tabpanel"
            id={`${groupId}-panel-${entry.key}`}
            aria-labelledby={`${groupId}-tab-${entry.key}`}
            hidden={side !== entry.key}
          >
            <ul className="flex flex-col gap-3 pt-4">
              {entry.items.map((item, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-[1.6] text-[var(--text)]">
                  <span
                    aria-hidden
                    className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--area,var(--primary))]"
                  />
                  <span>{renderInline(item, `cmp-${idPrefix}-${entry.key}-${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Room for both: show both. */}
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] sm:grid sm:grid-cols-2">
        {sides.map((entry, index) => (
          <div
            key={entry.key}
            className={[
              "flex flex-col bg-[var(--surface)] p-5",
              index === 0 ? "border-r border-[var(--border)]" : "",
            ].join(" ")}
          >
            <p
              className={[
                "text-[11px] font-bold uppercase tracking-[0.12em]",
                index === 0 ? "text-[var(--faint)]" : "text-[var(--area,var(--primary))]",
              ].join(" ")}
            >
              {entry.label}
            </p>
            <ul className="mt-3.5 flex flex-col gap-3">
              {entry.items.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-[14.5px] leading-[1.6] text-[var(--text)]">
                  <span
                    aria-hidden
                    className={[
                      "mt-[8px] h-[5px] w-[5px] shrink-0 rounded-full",
                      index === 0 ? "bg-[var(--border-strong)]" : "bg-[var(--area,var(--primary))]",
                    ].join(" ")}
                  />
                  <span>{renderInline(item, `cmpd-${idPrefix}-${entry.key}-${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
