"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@/design-system/Icon";

export interface PickerPanel {
  areaSlug: string;
  areaLabel: string;
  situation: string;
  productSlug: string;
  productTitle: string;
  /** Rendered on the server so this client component never imports a route module. */
  mockup: ReactNode;
}

const CYCLE_MS = 5200;

/**
 * The homepage hero, as one interaction: pick the part of life you are
 * dealing with, see the Companion that covers it.
 *
 * This replaces the static-file comparison that used to sit here. That
 * comparison argued about format (a living product versus a dead PDF),
 * which put the weakest and least defensible claim in the most valuable
 * position on the site, and made a visitor scroll most of the page
 * before learning what Draftpace is actually for. This asks the only
 * question that matters on arrival: which of these is you.
 *
 * It auto-advances so the range of the shelf is visible without any
 * interaction, stops permanently the moment somebody chooses for
 * themselves, and settles on the first area for anyone who prefers
 * reduced motion.
 */
export default function CompanionPicker({ panels }: { panels: PickerPanel[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    if (chosen || reduceMotion || panels.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % panels.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [chosen, reduceMotion, panels.length]);

  if (panels.length === 0) return null;
  const active = panels[index] ?? panels[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-12">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">The Companion Series</p>
        <h1 className="mt-4 font-serif text-[38px] font-semibold leading-[1.08] tracking-tight sm:text-[48px] lg:text-[54px]">
          For the parts of life that are hard to keep track of.
        </h1>
        <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--muted)]">
          Seven companions, each built for one thing that is genuinely difficult to hold in your head. Each remembers
          how your situation fits together, tells you what actually needs you now, and stays quiet when nothing does.
        </p>

        <fieldset className="mt-8 border-0 p-0">
          <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            What are you dealing with?
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {panels.map((panel, i) => {
              const isActive = i === index;
              return (
                <button
                  key={panel.areaSlug}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setChosen(true);
                    setIndex(i);
                  }}
                  // Brand ink, not teal: an area chip is a label you are
                  // sorting by, not the page's call to action. This is the
                  // same treatment the Shop's filter bar uses, so the one
                  // control does not read as two different things on two
                  // pages. See --brand-ink in globals.css.
                  className={[
                    "rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors",
                    isActive
                      ? "border-[var(--brand-ink)] bg-[var(--brand-ink)] text-[var(--brand-ink-contrast)]"
                      : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand-ink)] hover:text-[var(--text)]",
                  ].join(" ")}
                >
                  {panel.areaLabel}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6 min-h-[92px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.areaSlug}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[15px] leading-relaxed text-[var(--text)]">{active.situation}</p>
              <a
                href={`/shop/${active.productSlug}`}
                className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--primary)] hover:underline"
              >
                {active.productTitle}
                <ArrowRight size={14} aria-hidden />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.productSlug}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {active.mockup}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
