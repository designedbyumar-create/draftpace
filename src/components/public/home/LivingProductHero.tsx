"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bell, Check, Download, Sparkles } from "@/design-system/Icon";

type Mode = "static" | "living";

const CYCLE_MS = 4200;

/**
 * The studio thesis as one interaction: the same artifact (a budget you bought)
 * in two lives. As a static file it is inert, grey, and already forgotten. As a
 * Draftpace product it is alive: it remembers you, guides your next move, and
 * stays ready. It auto-plays and is fully controllable, and it settles on the
 * living state for anyone who prefers reduced motion.
 */
export default function LivingProductHero() {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("static");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduceMotion) {
      if (reduceMotion) setMode("living");
      return;
    }
    const id = window.setInterval(() => {
      setMode((current) => (current === "static" ? "living" : "static"));
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const select = (next: Mode) => {
    setPaused(true);
    setMode(next);
  };

  return (
    <figure className="m-0 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[shadow:var(--shadow-soft)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
          The same thing you bought
        </span>
        <div role="group" aria-label="Compare a static file with a living product" className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-muted)] p-0.5">
          {(["static", "living"] as const).map((value) => {
            const active = mode === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => select(value)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                  active ? "bg-[var(--surface)] text-[var(--text)] shadow-[shadow:var(--shadow-xs)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {value === "static" ? "Static file" : "Living product"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative min-h-[340px] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-sunken)]">
        <AnimatePresence mode="wait">
          {mode === "static" ? (
            <motion.div
              key="static"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-[340px] flex-col items-center justify-center gap-5 p-6 text-center [filter:grayscale(1)]"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--faint)]">
                <Download size={24} aria-hidden />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-[var(--muted)]">monthly-budget.pdf</p>
                <p className="mt-1 text-[12px] text-[var(--faint)]">Downloaded once. Opened 3 months ago.</p>
              </div>
              <p className="max-w-[15rem] text-[12px] leading-relaxed text-[var(--faint)]">
                It cannot remember you, react, or do anything. It just sits in a folder.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="living"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-[340px] flex-col gap-3 p-5"
            >
              <Stagger reduceMotion={reduceMotion} index={0}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                      {!reduceMotion && (
                        <motion.span
                          className="absolute inset-0 rounded-full bg-[var(--primary)]"
                          animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                    </span>
                    <p className="text-[14px] font-semibold text-[var(--text)]">Monthly Money Reset</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">Live</span>
                </div>
              </Stagger>

              <Stagger reduceMotion={reduceMotion} index={1}>
                <p className="text-[13px] text-[var(--muted)]">Welcome back. It has been a day since you checked in.</p>
              </Stagger>

              <Stagger reduceMotion={reduceMotion} index={2}>
                <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[shadow:var(--shadow-xs)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--faint)]">Safe to spend today</p>
                  <p className="mt-1 font-serif text-[32px] font-semibold leading-none tracking-tight text-[var(--text)]">$84</p>
                </div>
              </Stagger>

              <Stagger reduceMotion={reduceMotion} index={3}>
                <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] p-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
                    <Bell size={12} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-ink)]">Next</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-[var(--text)]">Log yesterday&rsquo;s spending, then you are set for the week.</p>
                  </div>
                </div>
              </Stagger>

              <Stagger reduceMotion={reduceMotion} index={4}>
                <div className="mt-auto flex items-center gap-2 text-[var(--faint)]">
                  <Check size={13} className="text-[var(--success)]" aria-hidden />
                  <p className="text-[12px]">Saved to your account, ready on every device.</p>
                </div>
              </Stagger>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <figcaption className="mt-4 flex items-center gap-2 text-[12px] leading-relaxed text-[var(--muted)]">
        <Sparkles size={14} className="shrink-0 text-[var(--primary)]" aria-hidden />
        <span>A Draftpace product is the version on the right, alive the whole time you own it.</span>
      </figcaption>
    </figure>
  );
}

function Stagger({ children, reduceMotion, index }: { children: React.ReactNode; reduceMotion: boolean | null; index: number }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.06 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={index === 4 ? "mt-auto" : undefined}
    >
      {children}
    </motion.div>
  );
}
