"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "@/design-system/Icon";
import Button from "@/design-system/Button";

interface Row {
  id: string;
  kind: string;
  title: string;
  /** The right-hand column at rest. A time, a status, whatever the product shows. */
  meta: string;
  /** What this row reads as once the change has been recorded. Null means untouched. */
  affectedNote: string | null;
}

interface Scene {
  id: string;
  /** The tab label: the life this is happening in, not the product's name. */
  tab: string;
  /** The context strip above the rows. */
  context: string;
  /** The button that records the change. */
  trigger: string;
  /** The row the person themselves changed, and what it now says. */
  sourceId: string;
  sourceMeta: string;
  sourceNote: string;
  /** The line about what was deliberately left alone. */
  untouchedId: string;
  untouchedNote: string;
  rows: Row[];
  /** Which product this is, for the reader who wants to go and look. */
  productSlug: string;
  productTitle: string;
}

/**
 * Two lives, one mechanism.
 *
 * WHY THIS IS NOT ONE TRAVEL DEMO ANY MORE
 *
 * This section makes the strongest claim on the homepage, that a
 * Companion knows what else moves when one thing moves. It used to prove
 * it with a single flight delay, which meant the most important argument
 * on the site was demonstrated entirely inside one product, and read as
 * a Travel Companion feature rather than as something the shelf shares.
 * Somebody who does not travel had no reason to believe it applied to
 * them.
 *
 * Both scenes below are real product behaviour, not illustrations of it.
 * Travel Companion walks down what a booking was booked around. Personal
 * Life Affairs Companion takes a life event and brings back only the
 * entries that event could have made untrue, and "I moved" really does
 * affect exactly these six (LIFE_EVENTS in lifeEvents.ts; the labels are
 * the steps' own bookLabels from affairsKnowledge.ts).
 *
 * Both stop at the thing nobody connected, and neither changes anything
 * by itself. That last part is the point, and the copy says so, because
 * a product that silently rewrote six records would be worse than one
 * that rewrote none.
 */
const SCENES: Scene[] = [
  {
    id: "travel",
    tab: "A trip",
    context: "Japan, October",
    trigger: "Delay the flight by 3 hours",
    sourceId: "flight",
    sourceMeta: "07:30",
    sourceNote: "You changed this. Was 04:05.",
    untouchedId: "dinner",
    untouchedNote: "Not connected. Left alone.",
    productSlug: "travel-companion",
    productTitle: "Travel Companion",
    rows: [
      { id: "flight", kind: "Flight", title: "PK123 to Tokyo", meta: "04:05", affectedNote: null },
      {
        id: "transfer",
        kind: "Transfer",
        title: "Airport pickup",
        meta: "14:00",
        affectedNote: "Booked around the flight. Unchanged so far.",
      },
      {
        id: "hotel",
        kind: "Stay",
        title: "Kyoto check-in",
        meta: "15:00",
        affectedNote: "Booked around the transfer. Unchanged so far.",
      },
      { id: "dinner", kind: "Reservation", title: "Dinner, Nishiki", meta: "19:30", affectedNote: null },
    ],
  },
  {
    id: "affairs",
    tab: "Your affairs",
    context: "What you have written down",
    trigger: "Tell it you moved house",
    sourceId: "event",
    sourceMeta: "Today",
    sourceNote: "You told it this.",
    untouchedId: "executor",
    untouchedNote: "Moving cannot have changed this. Left alone.",
    productSlug: "personal-life-affairs-companion",
    productTitle: "Personal Life Affairs Companion",
    rows: [
      { id: "event", kind: "Life event", title: "I moved", meta: "Recorded", affectedNote: null },
      {
        id: "home",
        kind: "Entry",
        title: "The home, owned or rented",
        meta: "Written 2 years ago",
        affectedNote: "Could have stopped being true. Worth a look.",
      },
      {
        id: "utilities",
        kind: "Entry",
        title: "Utility providers",
        meta: "Written 2 years ago",
        affectedNote: "Could have stopped being true. Worth a look.",
      },
      {
        id: "keys",
        kind: "Entry",
        title: "Who has a spare key",
        meta: "Written 2 years ago",
        affectedNote: "Could have stopped being true. Worth a look.",
      },
      { id: "executor", kind: "Entry", title: "Who would sort things out", meta: "Written 2 years ago", affectedNote: null },
    ],
  },
];

export default function ChangeImpactDemo() {
  const reduceMotion = useReducedMotion();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [changed, setChanged] = useState(false);

  const scene = SCENES[sceneIndex];
  const affectedIds = scene.rows.filter((row) => row.affectedNote !== null).map((row) => row.id);
  const affected = new Set(changed ? affectedIds : []);

  function chooseScene(index: number) {
    setSceneIndex(index);
    setChanged(false);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-14">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">
          What makes these different
        </p>
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

        {/* Two lives, so the mechanism reads as something the shelf
            shares rather than one product's trick. */}
        <fieldset className="mt-7 border-0 p-0">
          <legend className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Try it in
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {SCENES.map((option, index) => {
              const isActive = index === sceneIndex;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => chooseScene(index)}
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
                      layoutId={reduceMotion ? undefined : "change-impact-scene"}
                      className="absolute inset-0 rounded-full bg-[var(--brand-ink)]"
                      transition={{ type: "spring", stiffness: 460, damping: 38, mass: 0.7 }}
                    />
                  )}
                  <span className="relative">{option.tab}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Button
            type="button"
            onClick={() => setChanged((c) => !c)}
            iconRight={changed ? undefined : <ArrowRight size={15} aria-hidden />}
          >
            {changed ? "Reset the example" : scene.trigger}
          </Button>
          <Link
            href={`/shop/${scene.productSlug}`}
            className="text-[13px] font-semibold text-[var(--muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
          >
            This is {scene.productTitle}
          </Link>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[shadow:var(--shadow-soft)] sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">{scene.context}</span>
          <AnimatePresence>
            {changed && (
              <motion.span
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-semibold text-[var(--muted)]"
              >
                {affectedIds.length} may be affected
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <ul className="flex flex-col gap-2">
          {scene.rows.map((row, rowIndex) => {
            const isSource = changed && row.id === scene.sourceId;
            const isAffected = affected.has(row.id);
            // Each affected row lands after the one above it, so the walk
            // reads as travelling down the list rather than everything
            // lighting up at once.
            const stagger = reduceMotion ? 0 : 0.12 * rowIndex;
            return (
              <motion.li
                key={row.id}
                animate={reduceMotion ? undefined : { x: isAffected ? 6 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: isAffected ? stagger : 0 }}
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
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">{row.kind}</p>
                    <p className="mt-0.5 text-[14px] font-medium text-[var(--text)]">{row.title}</p>
                  </div>
                  <p className="shrink-0 text-[13px] tabular-nums text-[var(--muted)]">
                    {isSource ? <span className="font-semibold text-[var(--text)]">{scene.sourceMeta}</span> : row.meta}
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
                      {scene.sourceNote}
                    </motion.p>
                  )}
                  {isAffected && row.affectedNote && (
                    <motion.p
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: stagger }}
                      className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12px] font-medium text-[var(--primary)]"
                    >
                      {row.affectedNote}
                    </motion.p>
                  )}
                  {changed && row.id === scene.untouchedId && (
                    <motion.p
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: reduceMotion ? 0 : 0.12 * scene.rows.length }}
                      className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[12px] text-[var(--faint)]"
                    >
                      <Check size={12} aria-hidden />
                      {scene.untouchedNote}
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
