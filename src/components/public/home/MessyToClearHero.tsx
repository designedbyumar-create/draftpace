"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "@/design-system/Icon";

type Item = { id: string; label: string; kind: "task" | "note" | "deadline" | "choice" | "change" };

const MESSY_ITEMS: Item[] = [
  { id: "task-1", label: "Email the landlord about the lease", kind: "task" },
  { id: "task-2", label: "Figure out the deposit situation", kind: "task" },
  { id: "note", label: "Notes: talked to Sam, still need dates", kind: "note" },
  { id: "deadline", label: "Due Friday", kind: "deadline" },
  { id: "choice", label: "Which apartment? Still deciding", kind: "choice" },
  { id: "change", label: "Move-in date just moved up a week", kind: "change" },
];

// Fixed, hand-placed scatter so the "messy" state reads as deliberate, not random.
const SCATTER: Record<string, { x: number; y: number; rotate: number }> = {
  "task-1": { x: -8, y: 0, rotate: -3 },
  "task-2": { x: 10, y: 46, rotate: 2 },
  note: { x: -4, y: 96, rotate: -1.5 },
  deadline: { x: 14, y: 150, rotate: 3 },
  choice: { x: -10, y: 198, rotate: -2 },
  change: { x: 6, y: 248, rotate: 1.5 },
};

export default function MessyToClearHero() {
  const [clear, setClear] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
          {clear ? "One clear next step" : "Everything, all at once"}
        </p>
        <button
          type="button"
          onClick={() => setClear((value) => !value)}
          className="rounded-lg border border-[var(--border-strong)] px-3 py-1.5 text-[12px] font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          {clear ? "Show the mess again" : "Make it clear"}
        </button>
      </div>

      <div className="relative min-h-[340px] overflow-hidden rounded-xl bg-[var(--surface-muted)]">
        {!clear ? (
          <div className="relative h-[340px] w-full">
            {MESSY_ITEMS.map((item) => {
              const pos = SCATTER[item.id];
              return (
                <motion.div
                  key={item.id}
                  layout={!reduceMotion}
                  initial={false}
                  className="absolute left-4 right-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 shadow-sm sm:left-6 sm:right-24"
                  style={
                    reduceMotion
                      ? { top: pos.y }
                      : { top: pos.y, transform: `translateX(${pos.x}px) rotate(${pos.rotate}deg)` }
                  }
                >
                  <p className="text-[13px] font-medium text-[var(--text)]">{item.label}</p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[340px] flex-col justify-center gap-3 p-5 sm:p-6">
            <AnimatePresence mode="popLayout">
              <motion.div
                key="next"
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-4"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
                  <ArrowRight size={11} aria-hidden />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">Next</p>
                  <p className="mt-0.5 text-[14px] font-semibold text-[var(--text)]">
                    Confirm the move-in date with the landlord
                  </p>
                </div>
              </motion.div>

              <motion.div
                key="waiting"
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.08 }}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5 opacity-70"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--faint)]" />
                <p className="text-[13px] text-[var(--muted)]">Deposit questions can wait until next week</p>
              </motion.div>

              <motion.div
                key="saved"
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.16 }}
                className="flex items-center gap-2 pt-1"
              >
                <Check size={13} className="text-[var(--success)]" aria-hidden />
                <p className="text-[12px] text-[var(--faint)]">
                  Everything else is saved. The apartment choice and Sam's notes are still there.
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
