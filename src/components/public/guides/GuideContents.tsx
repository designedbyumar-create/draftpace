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
 * Desktop gets a rail beside the article, in the normal flow rather than
 * pinned to the viewport, with the section you are currently reading
 * marked. Its top margin (lg:mt-14) is not decorative: the rail and the
 * article are grid siblings that both start flush against the header's
 * bottom border, and the article's own first line only appears to sit
 * lower because GuideBody's internal spacing (mt-10 on the wrapper, mt-4
 * on the first paragraph) pushes it down 56px. The rail has no such
 * spacing of its own, so without this margin its heading rendered flush
 * against the header, reading as stuck to the banner rather than seated
 * beside the article. Phones get a collapsed disclosure at
 * the top, closed by default, because an open list of six links between
 * the headline and the first paragraph would push the article itself
 * below the fold.
 *
 * The active section is the last heading whose top has scrolled past a
 * line near the top of the viewport, recomputed on every scroll tick
 * (rAF-throttled) rather than tracked via IntersectionObserver: an
 * observer only fires on entries to/from a watched band, so a heading
 * whose band-crossing happens between two observer callbacks (any fast
 * scroll, or a short section whose heading never lingers in a narrow
 * band) is skipped entirely and the indicator is left stuck on
 * whichever heading it last caught. Comparing positions directly on
 * every tick can't skip one.
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

    // Roughly the sticky header's height: a heading counts as "current"
    // once it reaches this line, same line the old IntersectionObserver
    // band started from.
    const THRESHOLD = 88;

    function updateActive() {
      let current: string | null = null;
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= THRESHOLD) current = element.id;
        else break;
      }
      setActiveId(current);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActive();
        ticking = false;
      });
    }

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
                "group flex gap-2.5 rounded-md py-1.5 pl-3 pr-2 text-body-sm leading-snug transition-colors",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
                active
                  ? "bg-[var(--area-soft,var(--surface-muted))] font-semibold text-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--area-soft,var(--surface-muted))]/50",
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
      <nav aria-label="Contents" className="hidden lg:mt-14 lg:block lg:self-start">
        <p className="mb-5 pl-3 text-eyebrow font-bold text-[var(--faint)]">
          In this guide
        </p>
        {list}
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
          <span className="text-body-sm font-semibold text-[var(--text)]">
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
