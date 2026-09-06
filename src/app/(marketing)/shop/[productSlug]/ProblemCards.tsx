"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDown } from "@/design-system/Icon";
import { useCombinedReducedMotion } from "@/components/onboarding/motion";
import { staggerContainer, staggerItem } from "@/design-system/motion";

/**
 * The Shop product page's "problem, named and solved" section. Replaces the
 * old side-by-side "Who this is for" / "What becomes easier" tick lists:
 * those named a situation and a benefit as two separate flat lists a
 * visitor had to mentally reconnect themselves. This names the problem and
 * reveals its answer in one motion, one card at a time.
 *
 * A card is a real disclosure control (button + aria-expanded), not a
 * decorative interaction: the problem statement is always visible, the
 * solution is one tap away, never both dumped on screen at once. The first
 * card starts open, since a visitor arriving at this section is already
 * mid-read, not choosing where to start.
 */
export default function ProblemCards({ items }: { items: { problem: string; solution: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useCombinedReducedMotion();

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial="hidden"
      animate="visible"
      variants={staggerContainer(reduceMotion)}
    >
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <motion.div
            key={item.problem}
            variants={staggerItem(reduceMotion)}
            className={`overflow-hidden rounded-2xl border transition-colors duration-[var(--dur)] ease-[var(--ease-out)] ${
              open
                ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <span className="text-[15px] font-semibold leading-snug text-[var(--text)]">{item.problem}</span>
              <CaretDown
                size={16}
                className={`mt-1 shrink-0 text-[var(--faint)] transition-transform duration-[var(--dur)] ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="solution"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? {} : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 0.61, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-[14px] leading-relaxed text-[var(--muted)]">{item.solution}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
