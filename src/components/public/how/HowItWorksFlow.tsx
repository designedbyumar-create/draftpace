"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bell, Check, Smartphone, User, WarningCircle } from "@/design-system/Icon";

type Step = {
  id: string;
  when: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    id: "own",
    when: "The moment you buy",
    title: "You buy it once, and it is yours",
    body: "It lands in your library to keep. No subscription to babysit, nothing that expires if you step away.",
  },
  {
    id: "setup",
    when: "First few minutes",
    title: "It sets up around your situation",
    body: "A few questions that actually change what happens. Rough answers are fine, and you can skip anything that does not apply.",
  },
  {
    id: "save",
    when: "As you use it",
    title: "It saves as you go, everywhere",
    body: "Nothing to remember to save. It syncs across your devices and keeps working even with no connection.",
  },
  {
    id: "return",
    when: "When you come back",
    title: "It remembers exactly where you were",
    body: "Open it again days later, on any device, and it picks up where you left off. No summary to reread first.",
  },
  {
    id: "adapt",
    when: "When life changes",
    title: "You update what changed, not everything",
    body: "Change the one thing that moved. The parts connected to it adjust, and the rest stays exactly as it was.",
  },
  {
    id: "rest",
    when: "After a long gap",
    title: "Coming back is always welcoming",
    body: "No broken streak, no wall of overdue. It asks what changed and hands you one small step to restart with.",
  },
];

const CYCLE_MS = 4800;

export default function HowItWorksFlow() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(STEPS[0].id);
  const [paused, setPaused] = useState(false);
  const activeIndex = STEPS.findIndex((s) => s.id === activeId);

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
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
      <ol role="tablist" aria-label="How a living product works, step by step" className="relative flex flex-col">
        <div className="absolute bottom-4 left-[15px] top-4 w-px bg-[var(--border)]" aria-hidden />
        <motion.div
          className="absolute left-[15px] top-4 w-px bg-[var(--primary)]"
          aria-hidden
          animate={{ height: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 30 }}
          style={{ maxHeight: "calc(100% - 32px)" }}
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
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]"
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
        className="flex min-h-[320px] flex-col justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:sticky lg:top-24"
      >
        <StepDemo id={activeId} reduceMotion={reduceMotion} />
      </div>
    </div>
  );
}

function DemoWrap({ children, id, reduceMotion }: { children: React.ReactNode; id: string; reduceMotion: boolean | null }) {
  return (
    <motion.div
      key={id}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3"
    >
      {children}
    </motion.div>
  );
}

function StepDemo({ id, reduceMotion }: { id: string; reduceMotion: boolean | null }) {
  if (id === "own") {
    return (
      <DemoWrap id={id} reduceMotion={reduceMotion}>
        <div className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
            <Check size={16} aria-hidden />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-[var(--text)]">Monthly Money Reset</p>
            <p className="text-[12px] text-[var(--muted)]">Added to your library. Yours to keep.</p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--faint)]">No subscription. It does not expire if you step away.</p>
      </DemoWrap>
    );
  }

  if (id === "setup") {
    return (
      <DemoWrap id={id} reduceMotion={reduceMotion}>
        {[
          { q: "What is your income this month?", a: "About $3,200" },
          { q: "When do your bills usually hit?", a: "Around the 1st" },
        ].map((row) => (
          <div key={row.q} className="flex items-center justify-between gap-4 rounded-[var(--radius)] bg-[var(--surface-muted)] px-4 py-3">
            <span className="text-[12px] text-[var(--muted)]">{row.q}</span>
            <span className="text-[13px] font-semibold text-[var(--text)]">{row.a}</span>
          </div>
        ))}
        <div className="flex items-center justify-center text-[var(--faint)]" aria-hidden>
          <ArrowRight size={16} className="rotate-90" />
        </div>
        <div className="rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--primary)]">Your result</p>
          <p className="mt-1 font-serif text-[24px] font-semibold tracking-tight text-[var(--text)]">Safe to spend: $84 a day</p>
        </div>
      </DemoWrap>
    );
  }

  if (id === "save") {
    return (
      <DemoWrap id={id} reduceMotion={reduceMotion}>
        <div className="flex items-center gap-2 text-[13px] text-[var(--text)]">
          <Check size={15} className="text-[var(--success)]" aria-hidden />
          Saved to your account just now.
        </div>
        <div className="flex flex-wrap gap-2">
          {["Phone", "Laptop", "Tablet"].map((device) => (
            <span key={device} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-[12px] font-medium text-[var(--muted)]">
              <Smartphone size={12} aria-hidden />
              {device}
            </span>
          ))}
        </div>
        <p className="text-[12px] text-[var(--faint)]">Lose connection and it keeps going, then syncs when you are back.</p>
      </DemoWrap>
    );
  }

  if (id === "return") {
    return (
      <DemoWrap id={id} reduceMotion={reduceMotion}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            <User size={18} aria-hidden />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-[var(--text)]">Welcome back.</p>
            <p className="text-[13px] text-[var(--muted)]">You are on week 3 of 4. Nothing to set up again.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] p-3.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
            <Bell size={12} aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">Next</p>
            <p className="mt-0.5 text-[13px] font-semibold text-[var(--text)]">Log this week&rsquo;s spending, then you are set.</p>
          </div>
        </div>
      </DemoWrap>
    );
  }

  if (id === "adapt") {
    return (
      <DemoWrap id={id} reduceMotion={reduceMotion}>
        <div className="flex items-center gap-2 self-start rounded-full bg-[var(--warning-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--warning)]">
          <WarningCircle size={13} aria-hidden />
          Your income dropped this month
        </div>
        <div className="flex items-center justify-center text-[var(--faint)]" aria-hidden>
          <ArrowRight size={16} className="rotate-90" />
        </div>
        <div className="rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--primary)]">Adjusted for you</p>
          <p className="mt-1 font-serif text-[24px] font-semibold tracking-tight text-[var(--text)]">Safe to spend: $61 a day</p>
          <p className="mt-1.5 text-[12px] text-[var(--muted)]">You changed one number. It reworked the rest.</p>
        </div>
      </DemoWrap>
    );
  }

  return (
    <DemoWrap id={id} reduceMotion={reduceMotion}>
      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
        <p className="text-[14px] font-semibold text-[var(--text)]">Welcome back. It has been 3 weeks.</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
          A few things may have changed. Want to update what is different, or just pick up where you left off?
        </p>
      </div>
      <p className="flex items-center gap-2 text-[12px] text-[var(--faint)]">
        <Check size={13} className="text-[var(--success)]" aria-hidden />
        No broken streak. Nothing marked overdue.
      </p>
    </DemoWrap>
  );
}
