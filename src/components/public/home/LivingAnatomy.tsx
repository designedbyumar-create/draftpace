"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock, Smartphone, User, WarningCircle } from "@/design-system/Icon";

type Behavior = {
  id: string;
  label: string;
  blurb: string;
};

const BEHAVIORS: Behavior[] = [
  { id: "remembers", label: "Remembers you", blurb: "It opens exactly where you left off, with your details already in place." },
  { id: "responds", label: "Responds to you", blurb: "Change one thing and it recalculates everything around it." },
  { id: "guides", label: "Guides you", blurb: "It offers the one next move, not a wall of buttons to manage." },
  { id: "ready", label: "Stays ready", blurb: "Saved to your account, on every device, and there even offline." },
  { id: "adapts", label: "Adapts", blurb: "When your situation shifts, it reshapes the plan instead of breaking." },
];

const CYCLE_MS = 4600;

export default function LivingAnatomy() {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(BEHAVIORS[0].id);
  const [paused, setPaused] = useState(false);
  const active = BEHAVIORS.find((b) => b.id === activeId) ?? BEHAVIORS[0];

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveId((current) => {
        const index = BEHAVIORS.findIndex((b) => b.id === current);
        return BEHAVIORS[(index + 1) % BEHAVIORS.length].id;
      });
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const select = (id: string) => {
    setPaused(true);
    setActiveId(id);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
      <div role="tablist" aria-label="What makes a product alive" className="flex flex-col gap-1.5">
        {BEHAVIORS.map((behavior, index) => {
          const isActive = behavior.id === activeId;
          return (
            <button
              key={behavior.id}
              type="button"
              role="tab"
              id={`behavior-tab-${behavior.id}`}
              aria-selected={isActive}
              aria-controls="behavior-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(behavior.id)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                event.preventDefault();
                const next =
                  event.key === "ArrowDown"
                    ? (index + 1) % BEHAVIORS.length
                    : (index - 1 + BEHAVIORS.length) % BEHAVIORS.length;
                select(BEHAVIORS[next].id);
                document.getElementById(`behavior-tab-${BEHAVIORS[next].id}`)?.focus();
              }}
              className={`rounded-[var(--radius)] border px-4 py-3.5 text-left transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                isActive
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                  : "border-transparent hover:bg-[var(--surface-muted)]"
              }`}
            >
              <span className={`text-[14px] font-semibold ${isActive ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>
                {behavior.label}
              </span>
              <span className={`mt-0.5 block text-[12.5px] leading-relaxed ${isActive ? "text-[var(--text)]" : "text-[var(--muted)]"}`}>
                {behavior.blurb}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="behavior-panel"
        role="tabpanel"
        aria-labelledby={`behavior-tab-${active.id}`}
        className="flex min-h-[280px] flex-col justify-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[shadow:var(--shadow-soft)] sm:p-8"
      >
        <BehaviorDemo id={active.id} reduceMotion={reduceMotion} />
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

function BehaviorDemo({ id, reduceMotion }: { id: string; reduceMotion: boolean | null }) {
  if (id === "remembers") {
    return (
      <DemoWrap id={id} reduceMotion={reduceMotion}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            <User size={18} aria-hidden />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-[var(--text)]">Welcome back.</p>
            <p className="text-[13px] text-[var(--muted)]">You are on week 3 of 4. Last visit was 2 days ago.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[var(--radius)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-[13px] text-[var(--muted)]">
          <Clock size={14} className="text-[var(--faint)]" aria-hidden />
          Nothing to set up again. It kept everything.
        </div>
      </DemoWrap>
    );
  }

  if (id === "responds") {
    return (
      <DemoWrap id={id} reduceMotion={reduceMotion}>
        <div className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
          <span className="text-[12px] text-[var(--muted)]">You change one input</span>
          <span className="text-[13px] font-semibold text-[var(--text)]">Income &rarr; $3,200</span>
        </div>
        <div className="flex items-center justify-center text-[var(--faint)]" aria-hidden>
          <ArrowRight size={16} className="rotate-90" />
        </div>
        <div className="flex items-center justify-between rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] px-4 py-3">
          <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--primary)]">Recalculated</span>
          <span className="text-[13px] font-semibold text-[var(--text)]">Safe to spend &rarr; $76 a day</span>
        </div>
      </DemoWrap>
    );
  }

  if (id === "guides") {
    return (
      <DemoWrap id={id} reduceMotion={reduceMotion}>
        <p className="text-[12px] text-[var(--muted)]">Out of everything you could do, it picks one:</p>
        <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] p-4">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
            <ArrowRight size={12} aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-ink)]">Next</p>
            <p className="mt-0.5 text-[13px] font-semibold text-[var(--text)]">Move $200 into savings before Friday.</p>
          </div>
        </div>
      </DemoWrap>
    );
  }

  if (id === "ready") {
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
        <p className="text-[12px] text-[var(--faint)]">Open it anywhere. It even works with no connection.</p>
      </DemoWrap>
    );
  }

  return (
    <DemoWrap id={id} reduceMotion={reduceMotion}>
      <div className="flex items-center gap-2 self-start rounded-full bg-[var(--warning-soft)] px-3 py-1.5 text-[12px] font-semibold text-[var(--warning)]">
        <WarningCircle size={13} aria-hidden />
        Your move-in date just moved up a week
      </div>
      <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary-soft)] p-4">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]">
          <Check size={12} aria-hidden />
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--brand-ink)]">Plan adjusted</p>
          <p className="mt-0.5 text-[13px] font-semibold text-[var(--text)]">Everything shifted to the 8th. You did not rebuild a thing.</p>
        </div>
      </div>
    </DemoWrap>
  );
}
