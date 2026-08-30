"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "@/design-system/Icon";

export interface FinderEntry {
  areaSlug: string;
  areaLabel: string;
  situation: string;
  inTheirWords: string;
  whatHelps: string[];
  products: { slug: string; title: string; access: string }[];
  /** Rendered server-side, so this client component never imports a route module. */
  mockup: ReactNode;
}

/**
 * The Need help finder.
 *
 * The page this replaces asked "What do you need help with?" and offered
 * six generic productivity situations, three of which had no product
 * behind them at all and ended by admitting it. It was also the only
 * genuinely customer-centric page on the site and it was reachable only
 * from the footer, under a label long enough to read as a sentence
 * rather than a destination.
 *
 * This version asks the same question against the shelf that actually
 * exists. Every situation here has a Companion behind it, so nobody is
 * walked through a description of their own problem and then told we
 * have not built anything for it.
 *
 * Nothing is preselected on purpose. The first thing a visitor should do
 * on this page is recognise themselves, and a default selection would
 * put an answer on screen before the question had been read.
 */
export default function NeedHelpFinder({ entries }: { entries: FinderEntry[] }) {
  const reduceMotion = useReducedMotion();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const open = entries.find((e) => e.areaSlug === openSlug) ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1fr] lg:items-start lg:gap-14">
      {/* The situations */}
      <div>
        <ul className="flex flex-col gap-2.5" role="list">
          {entries.map((entry) => {
            const isOpen = entry.areaSlug === openSlug;
            return (
              <li key={entry.areaSlug}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`answer-${entry.areaSlug}`}
                  onClick={() => setOpenSlug(isOpen ? null : entry.areaSlug)}
                  className={[
                    "w-full rounded-[var(--radius-lg)] border p-4 text-left transition-colors",
                    isOpen
                      ? "border-[var(--primary)] bg-[var(--surface)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]",
                  ].join(" ")}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                        {entry.areaLabel}
                      </span>
                      <span className="mt-1.5 block text-[15px] leading-relaxed text-[var(--text)]">
                        {entry.situation}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={[
                        "mt-1 shrink-0 text-[var(--faint)] transition-transform duration-200",
                        isOpen ? "rotate-90 text-[var(--primary)]" : "",
                      ].join(" ")}
                    >
                      <ArrowRight size={16} />
                    </span>
                  </span>
                </button>

                {/* On narrow screens the answer belongs directly under the
                    situation it answers, rather than in a column that would
                    sit far below the whole list. */}
                <div className="lg:hidden">
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`answer-${entry.areaSlug}`}
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2.5">
                          <Answer entry={entry} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            );
          })}
        </ul>

        {!open && (
          <p className="mt-5 text-[13px] leading-relaxed text-[var(--faint)]">
            Pick whichever is closest. None of these are quizzes and nothing is recorded.
          </p>
        )}
      </div>

      {/* The answer, on wide screens only */}
      <div className="hidden lg:block" aria-live="polite">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key={open.areaSlug}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Answer entry={open} withMockup />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] p-10 text-center"
            >
              <p className="text-[15px] leading-relaxed text-[var(--muted)]">
                Choose a situation and the Companion built for it appears here, with what it actually does.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Answer({ entry, withMockup = false }: { entry: FinderEntry; withMockup?: boolean }) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <p className="font-serif text-[17px] leading-relaxed text-[var(--text)]">
        &ldquo;{entry.inTheirWords}&rdquo;
      </p>

      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What helps</p>
      <ul className="mt-2.5 flex flex-col gap-2">
        {entry.whatHelps.map((line) => (
          <li key={line} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[var(--muted)]">
            <Check size={15} aria-hidden className="mt-0.5 shrink-0 text-[var(--primary)]" />
            {line}
          </li>
        ))}
      </ul>

      {withMockup && <div className="mt-6">{entry.mockup}</div>}

      <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border)] pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
          {entry.products.length > 1 ? "Companions for this" : "The Companion for this"}
        </p>
        {entry.products.map((product) => (
          <a
            key={product.slug}
            href={`/shop/${product.slug}`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3.5 py-3 transition-colors hover:border-[var(--primary)]"
          >
            <span className="text-[14px] font-semibold text-[var(--text)]">{product.title}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                {product.access === "free" ? "Free" : "Paid"}
              </span>
              <ArrowRight size={15} aria-hidden className="text-[var(--primary)]" />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
