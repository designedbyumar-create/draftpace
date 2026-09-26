"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@/design-system/Icon";
import { entranceVariant } from "@/design-system/motion";

/**
 * The reader's own words first, ours second.
 *
 * Every listing opened with a paragraph naming the problem in Draftpace's
 * voice, at an average of 1,670 words per page and reading grades that
 * got *harder* in the domains where people arrive most worried (health,
 * money, cars). This asks the only question that matters on arrival:
 * which of these is you. Nothing to read until something matches.
 *
 * The phrasings are researched, not invented: see the searchedProblems
 * field in src/shop/definition.ts. That research already existed in
 * src/content/askdp.ts and reached only Ask DP until now.
 */
/**
 * `guide` is resolved by the server page and passed down as a slug and
 * title only. Importing the guides module here would ship every guide's
 * text to the browser for the sake of one link.
 */
export type SearchedProblem = { phrase: string; answer: string; guide?: { slug: string; title: string } };

export default function SearchedProblems({ items }: { items: SearchedProblem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={item.phrase}
            className="overflow-hidden rounded-xl border transition-colors"
            style={{
              borderColor: open ? "var(--primary)" : "var(--border)",
              backgroundColor: open ? "var(--primary-soft)" : "var(--surface)",
            }}
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-start gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <span
                aria-hidden
                className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: open ? "var(--primary)" : "var(--border-strong)" }}
              />
              <span className="text-[15px] font-semibold leading-snug text-[var(--text)]">
                &ldquo;{item.phrase}&rdquo;
              </span>
            </button>

            {open && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={entranceVariant(Boolean(reduceMotion))}
                className="px-4 pb-4 pl-[30px]"
              >
                <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">{item.answer}</p>
                {item.guide && (
                  <Link
                    href={`/guides/${item.guide.slug}`}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--primary)] hover:underline"
                  >
                    Read the free guide: {item.guide.title}
                    <ArrowRight size={13} aria-hidden />
                  </Link>
                )}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
