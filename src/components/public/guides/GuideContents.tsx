"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CaretDown } from "@/design-system/Icon";
import type { GuideHeading } from "@/content/guideHeadings";

/**
 * Contents for one article, in the two shapes the two screen sizes want.
 *
 * A ten minute reference guide with six sections had no navigation at
 * all. On desktop that wastes a wide empty margin; on a phone it means
 * scrolling past four sections to reach the table you came for.
 *
 * Desktop gets a sticky rail beside the article, with the section you
 * are currently reading marked. Phones get a collapsed disclosure at
 * the top, closed by default, because an open list of six links between
 * the headline and the first paragraph would push the article itself
 * below the fold.
 *
 * The active section is tracked with an IntersectionObserver against a
 * band near the top of the viewport rather than by comparing scroll
 * offsets on every frame.
 */
export default function GuideContents({
  headings,
  variant,
}: {
  headings: GuideHeading[];
  /**
   * The two shapes live in different grid cells, so this renders once
   * per placement rather than rendering both and hiding one. Each
   * instance tracks its own active section, which costs one extra
   * observer and keeps the markup in the cell it belongs to.
   */
  variant: "disclosure" | "rail";
}) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    // A band across the upper third: a heading is "current" from the
    // moment it reaches the top area until the next one does.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -66% 0px", threshold: 0 }
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  const list = (
    <ol className="flex flex-col gap-0.5">
      {headings.map((heading, i) => {
        const active = heading.id === activeId;
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={() => setOpen(false)}
              aria-current={active ? "location" : undefined}
              className={[
                "group flex gap-2.5 rounded-md py-1.5 pl-3 pr-2 text-[13.5px] leading-snug transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                active
                  ? "bg-[var(--area-soft,var(--surface-muted))] font-semibold text-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]",
              ].join(" ")}
            >
              <span
                className={[
                  "shrink-0 font-mono text-[11px] tabular-nums",
                  active ? "text-[var(--area,var(--primary))]" : "text-[var(--faint)]",
                ].join(" ")}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{heading.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "rail") {
    return (
      <nav aria-label="Contents" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <p className="mb-3 pl-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
          In this guide
        </p>
        <div className="border-l border-[var(--border)]">{list}</div>
      </nav>
    );
  }

  return (
    <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="guide-contents-mobile"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <span className="text-[13px] font-semibold text-[var(--text)]">
            In this guide
            <span className="ml-2 font-normal text-[var(--faint)]">{headings.length} sections</span>
          </span>
          <span
            aria-hidden
            className={[
              "shrink-0 text-[var(--faint)] transition-transform duration-[var(--dur)]",
              open ? "rotate-180" : "",
            ].join(" ")}
          >
            <CaretDown size={15} />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="guide-contents-mobile"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--border)] px-2 py-2">{list}</div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
