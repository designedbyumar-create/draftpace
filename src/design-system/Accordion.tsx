"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CaretDown } from "@/design-system/Icon";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
};

/**
 * One section open at a time, the rest collapsed to their title — the
 * shared shape behind both a manual's FAQ (ManualFaq) and a product's own
 * secondary content (how to use it, what's inside, privacy, ...). Long
 * prose sections, shown all at once, turn a page into a wall of text
 * nobody actually reads top to bottom; collapsed to their headings, the
 * headings themselves become a scannable index, and nothing is lost that
 * a click away.
 */
export default function Accordion({
  items,
  defaultOpenId,
}: {
  items: AccordionItem[];
  /** Opens this item on first render — never more than one, so the group starts exactly as settled as it will ever be mid-interaction. */
  defaultOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} id={item.id} className="scroll-mt-28">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`${item.id}-panel`}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--surface-sunken)]"
            >
              <span className="text-body font-semibold text-[var(--text)]">{item.title}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
                className="shrink-0 text-[var(--faint)]"
              >
                <CaretDown size={16} aria-hidden />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${item.id}-panel`}
                  role="region"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
