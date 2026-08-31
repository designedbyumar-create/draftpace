"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "@/design-system/Icon";
import Button from "@/design-system/Button";

export interface PickerPanel {
  areaSlug: string;
  areaLabel: string;
  situation: string;
  /** The three things this area's Companion actually does, from src/content/areas.ts. */
  whatHelps: string[];
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
        {/* Three lines at most, and it names the six areas outright: the
            previous version described how the products behave before
            saying what part of anybody's life they are for. */}
        <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--muted)]">
          Seven products for the parts of everyday life that are hardest to stay on top of: money, home, focus,
          family, affairs and travel. Each one remembers your situation so you do not have to.
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

        {/* The way in, directly under the chips it belongs to. Outline
            rather than a filled button: this is the hero's secondary
            action, under a heading that is itself the page's argument,
            and a solid teal block here would outweigh it. Fixed height,
            so switching areas never moves the column. */}
        <div className="mt-6 h-11">
          <Button
            href={`/shop/${active.productSlug}`}
            variant="outline"
            iconRight={<ArrowRight size={15} aria-hidden />}
          >
            {active.productTitle}
          </Button>
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
            {/* The phone is capped narrower than the 280px it renders at
                elsewhere, which buys the room for the three lines below
                without making this column taller than the copy beside
                it. PhoneFrame is w-full under its own max-width, so a
                narrower parent simply scales the whole screen down. */}
            <div className="mx-auto max-w-[244px]">{active.mockup}</div>

            {/* What the product actually does, three lines, from
                src/content/areas.ts's whatHelps: written under the rule
                that every line has to be true of the shipped product.
                This replaces a single situation sentence that repeated
                what the chips had already established. Always exactly
                three items, so the block cannot change height. */}
            <ul className="mx-auto mt-7 flex max-w-sm flex-col gap-2.5" role="list">
              {active.whatHelps.map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <Check size={14} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                  <span className="text-[13.5px] leading-relaxed text-[var(--muted)]">{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
