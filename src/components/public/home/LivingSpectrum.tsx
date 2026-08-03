"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Stop = {
  label: string;
  title: string;
  body: string;
  example: string;
};

const STOPS: Stop[] = [
  {
    label: "Quiet",
    title: "A quiet tool",
    body: "It just remembers your last numbers and stays correct. It never pings you. It is simply there when you open it.",
    example: "Like a decision or budgeting tool",
  },
  {
    label: "Light",
    title: "A light-touch tracker",
    body: "It keeps your progress and shows you where things stand the moment you return, without chasing you.",
    example: "Like a habit or savings tracker",
  },
  {
    label: "Guided",
    title: "A guided program",
    body: "It reads where you are and suggests the one next step, so returning never means staring at a blank page.",
    example: "Like a plan you work through over weeks",
  },
  {
    label: "Deep",
    title: "A daily companion",
    body: "It checks in, adapts to what changed, and walks with you day to day. As present as you want it to be.",
    example: "Like a coach for something that matters",
  },
];

export default function LivingSpectrum() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const active = STOPS[index];
  const fillPercent = STOPS.length > 1 ? (index / (STOPS.length - 1)) * 100 : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
      <div>
        <div
          role="slider"
          aria-label="How present a living product is"
          aria-valuemin={0}
          aria-valuemax={STOPS.length - 1}
          aria-valuenow={index}
          aria-valuetext={active.title}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowUp") {
              event.preventDefault();
              setIndex((i) => Math.min(i + 1, STOPS.length - 1));
            } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
              event.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (event.key === "Home") {
              event.preventDefault();
              setIndex(0);
            } else if (event.key === "End") {
              event.preventDefault();
              setIndex(STOPS.length - 1);
            }
          }}
          className="relative rounded-[var(--radius-lg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg)]"
        >
          <div className="relative h-1 rounded-full bg-[var(--surface-strong)]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--primary)]"
              animate={{ width: `${fillPercent}%` }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
            />
            {STOPS.map((stop, i) => {
              const isActive = i <= index;
              return (
                <button
                  key={stop.label}
                  type="button"
                  aria-label={stop.title}
                  onClick={() => setIndex(i)}
                  style={{ left: `${(i / (STOPS.length - 1)) * 100}%` }}
                  className="absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-none"
                >
                  <span
                    className={`h-3 w-3 rounded-full border-2 transition-colors duration-[var(--dur-fast)] ${
                      isActive ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border-strong)] bg-[var(--surface)]"
                    }`}
                  />
                </button>
              );
            })}
            <motion.span
              className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--primary)] bg-[var(--surface)] shadow-[var(--btn-primary-rest)]"
              animate={{ left: `${fillPercent}%` }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          {STOPS.map((stop, i) => (
            <button
              key={stop.label}
              type="button"
              onClick={() => setIndex(i)}
              className={`text-[12px] font-semibold transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded ${
                i === index ? "text-[var(--primary)]" : "text-[var(--faint)] hover:text-[var(--muted)]"
              }`}
            >
              {stop.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={active.label}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-7"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">{active.example}</p>
        <p className="mt-2 font-serif text-[24px] font-semibold tracking-tight text-[var(--text)]">{active.title}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">{active.body}</p>
      </motion.div>
    </div>
  );
}
