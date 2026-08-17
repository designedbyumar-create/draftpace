"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "@/design-system/Icon";
import DeviceStage from "./DeviceStage";
import { AdaptScreen, OwnScreen, ReturnScreen, RestScreen, SaveScreen, SetupScreen } from "./howItWorksVisuals";

type Step = {
  id: string;
  when: string;
  title: string;
  body: string;
  Screen: React.ComponentType;
};

const STEPS: Step[] = [
  {
    id: "own",
    when: "The moment you buy",
    title: "You buy it once, and it is yours",
    body: "It lands in your library to keep. No subscription to babysit, nothing that expires if you step away.",
    Screen: OwnScreen,
  },
  {
    id: "setup",
    when: "First few minutes",
    title: "It sets up around your situation",
    body: "A few questions that actually change what happens. Rough answers are fine, and you can skip anything that does not apply.",
    Screen: SetupScreen,
  },
  {
    id: "save",
    when: "As you use it",
    title: "It saves as you go, everywhere",
    body: "Nothing to remember to save. It syncs across your devices and keeps working even with no connection.",
    Screen: SaveScreen,
  },
  {
    id: "return",
    when: "When you come back",
    title: "It remembers exactly where you were",
    body: "Open it again days later, on any device, and it picks up where you left off. No summary to reread first.",
    Screen: ReturnScreen,
  },
  {
    id: "adapt",
    when: "When life changes",
    title: "You update what changed, not everything",
    body: "Change the one thing that moved. The parts connected to it adjust, and the rest stays exactly as it was.",
    Screen: AdaptScreen,
  },
  {
    id: "rest",
    when: "After a long gap",
    title: "Coming back is always welcoming",
    body: "No broken streak, no wall of overdue. It asks what changed and hands you one small step to restart with.",
    Screen: RestScreen,
  },
];

const CYCLE_MS = 4800;

export default function HowItWorksFlow() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(STEPS[0].id);
  const [paused, setPaused] = useState(false);
  const activeIndex = STEPS.findIndex((s) => s.id === activeId);
  const active = STEPS[activeIndex];

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveId((current) => {
        const index = STEPS.findIndex((s) => s.id === current);
        return STEPS[(index + 1) % STEPS.length].id;
      });
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const select = (id: string) => {
    setPaused(true);
    setActiveId(id);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
      <ol role="tablist" aria-label="How a living product works, step by step" className="relative flex flex-col">
        <div className="absolute bottom-4 left-[15px] top-4 w-px bg-[var(--border)]" aria-hidden />
        <motion.div
          className="absolute left-[14.5px] top-4 w-[3px] rounded-full bg-[var(--primary)]"
          aria-hidden
          animate={{ height: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 30 }}
          style={{ maxHeight: "calc(100% - 32px)", boxShadow: "0 0 10px 1px var(--primary)" }}
        />
        {STEPS.map((step, index) => {
          const isActive = step.id === activeId;
          const isDone = index < activeIndex;
          return (
            <li key={step.id} className="relative">
              <button
                type="button"
                role="tab"
                id={`how-tab-${step.id}`}
                aria-selected={isActive}
                aria-controls="how-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => select(step.id)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                  event.preventDefault();
                  const next =
                    event.key === "ArrowDown"
                      ? (index + 1) % STEPS.length
                      : (index - 1 + STEPS.length) % STEPS.length;
                  select(STEPS[next].id);
                  document.getElementById(`how-tab-${STEPS[next].id}`)?.focus();
                }}
                className="flex w-full items-start gap-4 rounded-[var(--radius)] py-3.5 pl-0 pr-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              >
                <span
                  className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-bold transition-colors duration-[var(--dur)] ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),var(--shadow-xs)]"
                      : isDone
                        ? "border-[var(--primary)] bg-[var(--bg)] text-[var(--primary)]"
                        : "border-[var(--border-strong)] bg-[var(--bg)] text-[var(--faint)]"
                  }`}
                >
                  {isDone ? <Check size={14} aria-hidden /> : String(index + 1).padStart(2, "0")}
                </span>
                <span className="pt-0.5">
                  <span className={`block text-[11px] font-bold uppercase tracking-[0.12em] ${isActive ? "text-[var(--primary)]" : "text-[var(--faint)]"}`}>
                    {step.when}
                  </span>
                  <span className={`mt-1 block text-[15px] font-semibold ${isActive ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
                    {step.title}
                  </span>
                  {isActive && (
                    <motion.span
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-1.5 block max-w-sm text-[13px] leading-relaxed text-[var(--muted)]"
                    >
                      {step.body}
                    </motion.span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div
        id="how-panel"
        role="tabpanel"
        aria-labelledby={`how-tab-${activeId}`}
        className="flex flex-col gap-3 lg:sticky lg:top-24"
      >
        <DeviceStage>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <active.Screen />
            </motion.div>
          </AnimatePresence>
        </DeviceStage>
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">{active.when}</p>
      </div>
    </div>
  );
}
