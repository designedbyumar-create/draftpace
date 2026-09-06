"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";
import { ArrowLeft, ArrowRight } from "@/design-system/Icon";

/**
 * The manual's tour of the product's real screens — one at a time, named,
 * steppable in both directions.
 *
 * Deliberately different from the Shop card's version of the same
 * screens (ShopCardMockup), which cycles them silently on hover as a
 * teaser. Somebody who already owns the product does not need to be
 * enticed; they need to know which screen is which and to be able to sit
 * on one. So this one is driven only by the reader, never on a timer,
 * and every screen carries the caption saying what it is.
 *
 * Screens arrive already rendered from the server — this component never
 * knows which product it is showing.
 */
export default function ManualScreenTour({
  screens,
}: {
  screens: { node: ReactNode; caption: string | null }[];
}) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const current = screens[active];

  function go(delta: number) {
    setActive((i) => (i + delta + screens.length) % screens.length);
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-sunken)] p-5 sm:p-6">
      {/* Height is the phone's own: PhoneFrame is w-full at a fixed 9/19.5
          aspect ratio, so 240px wide is 520px tall. Hard-coded rather
          than left to the content, because the screens are absolutely
          positioned to crossfade in place and would otherwise collapse
          the box onto the caption below. */}
      <div className="relative mx-auto h-[520px] w-full max-w-[240px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="absolute inset-x-0 top-0"
          >
            {current.node}
          </motion.div>
        </AnimatePresence>
      </div>

      {current.caption && (
        <p className="mx-auto mt-5 max-w-sm text-center text-[13.5px] leading-relaxed text-[var(--muted)]">
          {current.caption}
        </p>
      )}

      {screens.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => go(-1)}
            aria-label="Previous screen"
            iconLeft={<ArrowLeft size={14} aria-hidden />}
          >
            Back
          </Button>
          <div className="flex items-center gap-1.5" aria-hidden>
            {screens.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                tabIndex={-1}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-5 bg-[var(--primary)]" : "w-1.5 bg-[var(--border-strong)]"
                }`}
              />
            ))}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => go(1)}
            aria-label="Next screen"
            iconRight={<ArrowRight size={14} aria-hidden />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
