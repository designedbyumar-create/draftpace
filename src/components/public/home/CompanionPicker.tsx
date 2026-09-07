"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";

export interface PickerPanel {
  areaSlug: string;
  areaLabel: string;
  /** This area's own button label, from src/content/areas.ts. */
  heroCta: string;
  productSlug: string;
  productTitle: string;
  /**
   * The price row, formatted on the server by the same shop helpers the
   * Shop grid and the product page use, so the hero can never quote a
   * different number from the page it links to.
   */
  priceLabel: string;
  compareAtLabel: string | null;
  savingsPercent: number | null;
  isFree: boolean;
  comingSoon: boolean;
  /** Rendered on the server so this client component never imports a route module. */
  mockup: ReactNode;
}

const CYCLE_MS = 5200;

const EASE = [0.22, 1, 0.36, 1] as const;

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
 *
 * WHAT THE RIGHT-HAND COLUMN IS
 *
 * The name of the product, what it costs, the screen, and one button.
 * Nothing else. It used to carry a three-line "what you get" checklist
 * and a line about ownership beside the phone, which made the hero the
 * densest block on the site: a heading, a paragraph, eight chips, a
 * product name, a price, three ticked lines, an ownership sentence and
 * a button, all above the fold. The screen is the argument here; a
 * reader who wants the three lines is one click from a page that gives
 * them properly. The area is not repeated either: the chip lit on the
 * left already says which one this is.
 *
 * The button's label comes from the area (heroCta in
 * src/content/areas.ts), so the one control in the most valuable
 * position on the site says something about what is behind it and
 * changes as the picker moves, rather than reading "See the full
 * product" under a heading that already names the product.
 *
 * MOTION IS FOR STATE CHANGES, NEVER FOR HOVER
 *
 * Hover stays a colour shift everywhere, as it is across the rest of the
 * design system. What moves here is the thing that is actually changing:
 * the chip pill slides between areas, the screen and the button label
 * cross-fade, and a hairline under the chips shows how long the current
 * area has left. That last one exists because the section
 * already auto-advanced with no warning at all, which read as the page
 * moving on its own.
 */
export default function CompanionPicker({ panels }: { panels: PickerPanel[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState(false);

  const cycling = !chosen && !reduceMotion && panels.length > 1;

  useEffect(() => {
    if (!cycling) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % panels.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [cycling, panels.length]);

  if (panels.length === 0) return null;
  const active = panels[index] ?? panels[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-12">
      {/* min-w-0 on both columns: a grid item's automatic minimum is its
          min-content width, so one unbreakable string inside either
          column widens the whole track past the container rather than
          wrapping. The product name did exactly that, and pushed the
          page into a sideways scroll at 390px. */}
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">The Companion Series</p>
        <h1 className="mt-3 font-serif text-[38px] font-semibold leading-[1.08] tracking-tight sm:text-[48px] lg:text-[54px]">
          For the parts of life that are hard to keep track of.
        </h1>
        {/* Three lines at most, and it names the areas outright: the
            previous version described how the products behave before
            saying what part of anybody's life they are for. */}
        <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-[var(--muted)]">
          Companions for the parts of everyday life that are hardest to stay on top of: money, home, focus, family,
          affairs, travel, vehicles and family health. Each one remembers your situation so you do not have to.
        </p>

        <fieldset className="mt-7 border-0 p-0">
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
                  //
                  // The fill is a shared-layout element rather than a
                  // background on the button, so it travels from the old
                  // chip to the new one instead of blinking out in one
                  // place and in again somewhere else. The chip's own
                  // border is transparent when active so the pill is the
                  // only edge, and the box never changes size.
                  className={[
                    "relative rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors duration-[var(--dur)] ease-[var(--ease-out)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
                    isActive
                      ? "border-transparent text-[var(--brand-ink-contrast)]"
                      : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand-ink)] hover:text-[var(--text)]",
                  ].join(" ")}
                >
                  {isActive && (
                    <motion.span
                      aria-hidden
                      layoutId={reduceMotion ? undefined : "companion-picker-chip"}
                      className="absolute inset-0 rounded-full bg-[var(--brand-ink)]"
                      transition={{ type: "spring", stiffness: 460, damping: 38, mass: 0.7 }}
                    />
                  )}
                  <span className="relative">{panel.areaLabel}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* How long this area has left before the section moves on. It
            keeps its 2px of space once somebody chooses for themselves
            and the cycling stops, so nothing below it shifts. */}
        <div
          aria-hidden
          className="mt-4 h-[2px] w-full max-w-[280px] overflow-hidden rounded-full bg-[var(--border)] transition-opacity duration-[var(--dur)] ease-[var(--ease-out)]"
          style={{ opacity: cycling ? 1 : 0 }}
        >
          {cycling && (
            <motion.div
              key={index}
              className="h-full w-full origin-left rounded-full bg-[var(--primary)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
            />
          )}
        </div>

      </div>

      {/* aria-live is off while the section is auto-advancing on its own:
          announcing a fresh product every 5.2 seconds to a screen reader
          that did not ask for one is noise. It turns on the moment
          somebody picks an area themselves, which is a change they made
          and should hear. */}
      <div aria-live={chosen ? "polite" : "off"} className="min-w-0">
        {/* The name of the thing, and what it costs, directly above what
            it gives you. */}
        <div className="flex items-start justify-between gap-4">
          <p className="min-h-[48px] min-w-0 font-serif text-[20px] font-semibold leading-tight tracking-tight text-[var(--text)]">
            {active.productTitle}
          </p>
          <PriceRow panel={active} />
        </div>

        {/* A column, not a row. This was phone-beside-text; with the
            checklist gone there is nothing to sit beside the screen, and
            leaving the split in place stranded the button across a void
            of empty page. The screen and its one control now stack, so
            the button reads as belonging to what is above it. */}
        <div className="flex flex-col items-start gap-5 border-t border-[var(--border)] pt-5">
          {/* Every mockup is drawn at a fixed 280px with fixed type
              sizes inside them, so narrowing their container reflows the
              screen rather than shrinking it. Scaling the whole frame is
              what actually makes a smaller phone, and the outer box
              carries the screen's own 9/19.5 aspect at the width we
              want, so it reserves exactly the height the scaled frame
              occupies and nothing below it is thrown out.

              176px, which is 0.6286 of the 280px the frames are drawn
              at. One size at every width. */}
          <div className="relative aspect-[9/19.5] w-[176px] shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.productSlug}
                className="absolute left-0 top-0 w-[280px] origin-top-left scale-[0.6286]"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                {active.mockup}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* The way in, and nothing else. Outline rather than filled,
              because this sits under a heading that is itself the page's
              argument and a solid block would outweigh it. */}
          <div className="min-w-0">
            {/* The visible label changes with the area; the accessible
                name still carries the product, so a screen reader's link
                list does not fill with near-identical generic entries.
                Keyed on the slug so the label cross-fades with the rest
                of the panel instead of swapping under the pointer. */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active.productSlug}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.22, ease: EASE }}
              >
                <Button
                  href={`/shop/${active.productSlug}`}
                  variant="outline"
                  aria-label={`See ${active.productTitle} in detail`}
                  iconRight={<ArrowRight size={15} aria-hidden />}
                >
                  {active.heroCta}
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The price, in the same shape the Shop grid and the product page show
 * it: struck-through regular price first where a launch discount is
 * running, then the number you actually pay, then the saving. Nothing
 * here is computed locally: the strings arrive already formatted by
 * src/shop/definition.ts, so the hero cannot drift from the page it
 * links to.
 */
function PriceRow({ panel }: { panel: PickerPanel }) {
  if (panel.comingSoon) {
    return (
      <div className="shrink-0 pt-1">
        <Badge tone="neutral">Coming soon</Badge>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 pt-1.5">
      {panel.compareAtLabel && (
        <span className="font-serif text-[12px] text-[var(--faint)] line-through">{panel.compareAtLabel}</span>
      )}
      <span className="font-serif text-[15px] font-semibold leading-none tracking-tight text-[var(--text)]">
        {panel.priceLabel}
      </span>
      {panel.savingsPercent !== null && panel.savingsPercent > 0 && (
        <Badge tone="success">Save {panel.savingsPercent}%</Badge>
      )}
    </div>
  );
}
