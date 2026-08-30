"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "@/design-system/Icon";

interface Row {
  id: string;
  kind: string;
  title: string;
  time: string;
  /** What this was booked around. Null means nothing upstream. */
  dependsOn: string | null;
}

const ROWS: Row[] = [
  { id: "flight", kind: "Flight", title: "PK123 to Tokyo", time: "04:05", dependsOn: null },
  { id: "transfer", kind: "Transfer", title: "Airport pickup", time: "14:00", dependsOn: "flight" },
  { id: "hotel", kind: "Stay", title: "Kyoto check-in", time: "15:00", dependsOn: "transfer" },
  { id: "dinner", kind: "Reservation", title: "Dinner, Nishiki", time: "19:30", dependsOn: null },
];

/**
 * The one thing on this shelf that a spreadsheet, a planner and a
 * to-do app all fail at, made touchable in about four seconds.
 *
 * Everything drawn here is real product behaviour rather than an
 * illustration of it: the walk goes downward only, it stops at the
 * booking nobody said was connected, and it changes nothing by itself.
 * That last part is the point, and the copy says so, because a product
 * that silently rewrote four bookings would be worse than one that
 * rewrote none.
 */
export default function ChangeImpactDemo() {
  const reduceMotion = useReducedMotion();
  const [changed, setChanged] = useState(false);

  // Downward walk from the flight: transfer depends on it, hotel depends
  // on the transfer. Dinner depends on nothing, so it is never touched.
  const affected = new Set(changed ? ["transfer", "hotel"] : []);

  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-14">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">What makes these different</p>
        <h2 className="mt-4 font-serif text-[30px] font-semibold leading-[1.12] tracking-tight sm:text-[36px]">
          It knows what else moves when one thing moves.
        </h2>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[var(--muted)]">
          A file cannot do this. Neither can a planner or a to-do list. When you tell a Companion that something
          changed, it already knows what you built on top of it, and shows you each one so you can decide.
        </p>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
          It never edits anything for you. Nothing here happens behind your back.
        </p>

        <button
          type="button"
          onClick={() => setChanged((c) => !c)}
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-[14px] font-semibold text-[var(--on-primary,#fff)] transition-transform active:scale-[0.985]"
        >
          {changed ? "Reset the example" : "Delay the flight by 3 hours"}
          {!changed && <ArrowRight size={15} aria-hidden />}
        </button>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Japan, October</span>
          <AnimatePresence>
            {changed && (
              <motion.span
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-semibold text-[var(--muted)]"
              >
                2 may be affected
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <ul className="flex flex-col gap-2">
          {ROWS.map((row) => {
            const isSource = changed && row.id === "flight";
            const isAffected = affected.has(row.id);
            return (
              <motion.li
                key={row.id}
                animate={
                  reduceMotion
                    ? undefined
                    : { x: isAffected ? 6 : 0 }
                }
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: isAffected ? (row.id === "transfer" ? 0.12 : 0.24) : 0 }}
                className={[
                  "rounded-xl border p-3 transition-colors duration-300",
                  isSource
                    ? "border-[var(--primary)] bg-[var(--surface-muted)]"
                    : isAffected
                      ? "border-[var(--primary)] bg-[var(--surface)]"
                      : "border-[var(--border)] bg-[var(--surface)]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">{row.kind}</p>
                    <p className="mt-0.5 text-[14px] font-medium text-[var(--text)]">{row.title}</p>
                  </div>
                  <p className="shrink-0 text-[13px] tabular-nums text-[var(--muted)]">
                    {isSource ? (
                      <span className="font-semibold text-[var(--text)]">07:30</span>
                    ) : (
                      row.time
                    )}
                  </p>
                </div>

                <AnimatePresence>
                  {isSource && (
                    <motion.p
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 overflow-hidden text-[12px] text-[var(--muted)]"
                    >
                      You changed this. Was 04:05.
                    </motion.p>
                  )}
                  {isAffected && (
                    <motion.p
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: reduceMotion ? 0 : row.id === "transfer" ? 0.12 : 0.24 }}
                      className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12px] font-medium text-[var(--primary)]"
                    >
                      Booked around the flight. Unchanged so far.
                    </motion.p>
                  )}
                  {changed && row.id === "dinner" && (
                    <motion.p
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: reduceMotion ? 0 : 0.36 }}
                      className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12px] text-[var(--faint)]"
                    >
                      <Check size={12} aria-hidden />
                      Not connected. Left alone.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
