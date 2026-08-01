"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@/design-system/Icon";
import { NEEDS } from "@/content/needs";

export default function ProblemChooser() {
  const [activeSlug, setActiveSlug] = useState(NEEDS[0].slug);
  const reduceMotion = useReducedMotion();
  const active = NEEDS.find((need) => need.slug === activeSlug) ?? NEEDS[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <div role="tablist" aria-label="What are you trying to make easier?" className="flex flex-col gap-1">
        {NEEDS.map((need) => {
          const isActive = need.slug === activeSlug;
          return (
            <button
              key={need.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSlug(need.slug)}
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
        key={active.slug}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Sounds like</p>
        <p className="mt-2 text-[16px] leading-relaxed text-[var(--text)]">{active.situation}</p>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What helps</p>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{active.whatHelps[0]}</p>

        <div className="mt-6 rounded-lg bg-[var(--surface-muted)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">What that looks like</p>
          <p className="mt-1.5 text-[14px] font-medium text-[var(--text)]">{active.example}</p>
        </div>

        <Link
          href={`/help-with/${active.slug}`}
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
        >
          See what helps with this
          <ArrowRight size={13} aria-hidden />
        </Link>
      </motion.div>
    </div>
  );
}
