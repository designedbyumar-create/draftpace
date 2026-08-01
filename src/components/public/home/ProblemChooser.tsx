"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@/design-system/Icon";

type Need = {
  id: string;
  label: string;
  situation: string;
  help: string;
  example: string;
  href: string;
};

const NEEDS: Need[] = [
  {
    id: "organized",
    label: "Get organized",
    situation: "Papers, tabs, and half-finished notes everywhere, none of it in one place.",
    help: "A single place to put what matters, sorted without extra effort on your part.",
    example: "One list: what's due, what's decided, what's next.",
    href: "/help-with/getting-organized",
  },
  {
    id: "plan",
    label: "Plan something important",
    situation: "A move, a trip, or an event with a lot of moving parts and no clear order.",
    help: "A plan that accounts for what you actually have to do, broken into the right order.",
    example: "A timeline that shows what needs attention this week, not the whole plan at once.",
    href: "/help-with/planning-something-important",
  },
  {
    id: "moving",
    label: "Keep something moving",
    situation: "A project or goal that stalls every time life gets busy for a while.",
    help: "Small check-ins that pick up exactly where you stopped, without a recap.",
    example: "Five minutes to see what changed and what to do next.",
    href: "/help-with/keeping-something-moving",
  },
  {
    id: "decide",
    label: "Make a difficult decision",
    situation: "Weighing a few options that all come with real tradeoffs.",
    help: "A way to lay out what matters to you and see the choice clearly.",
    example: "A comparison that shows what you would actually be choosing.",
    href: "/help-with/making-a-difficult-decision",
  },
  {
    id: "back-on-track",
    label: "Get back on track",
    situation: "It has been weeks, and the plan you made feels out of date now.",
    help: "A way back in that does not start with a wall of overdue tasks.",
    example: "Update what changed, then continue from there.",
    href: "/help-with/getting-back-on-track",
  },
  {
    id: "learn",
    label: "Learn step by step",
    situation: "A skill or process you want to learn without getting lost partway through.",
    help: "One step at a time, with the next one always clear.",
    example: "A single next lesson, not a full syllabus to plan around.",
    href: "/help-with/learning-step-by-step",
  },
];

export default function ProblemChooser() {
  const [activeId, setActiveId] = useState(NEEDS[0].id);
  const reduceMotion = useReducedMotion();
  const active = NEEDS.find((need) => need.id === activeId) ?? NEEDS[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <div role="tablist" aria-label="What are you trying to make easier?" className="flex flex-col gap-1">
        {NEEDS.map((need) => {
          const isActive = need.id === activeId;
          return (
            <button
              key={need.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(need.id)}
              className={`rounded-lg px-4 py-3 text-left text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
                isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              }`}
            >
              {need.label}
            </button>
          );
        })}
      </div>

      <motion.div
        key={active.id}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Sounds like</p>
        <p className="mt-2 text-[16px] leading-relaxed text-[var(--text)]">{active.situation}</p>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What helps</p>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{active.help}</p>

        <div className="mt-6 rounded-lg bg-[var(--surface-muted)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What that looks like</p>
          <p className="mt-1.5 text-[14px] font-medium text-[var(--text)]">{active.example}</p>
        </div>

        <Link
          href={active.href}
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
        >
          See what helps with this
          <ArrowRight size={13} aria-hidden />
        </Link>
      </motion.div>
    </div>
  );
}
