"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight } from "@/design-system/Icon";
import { entranceVariant } from "@/design-system/motion";

export type ManualTask = { label: string; answer: string; destination?: string };

/**
 * What an owner came here to do, and the way straight to it.
 *
 * This replaces ten stacked prose sections that measured 6,212px on a
 * phone with no section navigation at all below xl, and whose first four
 * sections restated the Shop page to somebody who had already paid.
 *
 * A row opens to one or two sentences, never a tutorial, and then hands
 * over to the screen where the thing actually happens. The answer to
 * "how do I do this" is being taken there, not being told where to go.
 */
export default function ManualTasks({ tasks, productSlug }: { tasks: ManualTask[]; productSlug: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <ul className="flex flex-col gap-2" role="list">
      {tasks.map((task, i) => {
        const open = openIndex === i;
        return (
          <li
            key={task.label}
            className="overflow-hidden rounded-xl border transition-colors"
            style={{
              borderColor: open ? "var(--primary)" : "var(--border)",
              backgroundColor: open ? "var(--product-wash, var(--primary-soft))" : "var(--surface)",
            }}
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            >
              <ChevronRight
                size={15}
                aria-hidden
                className="shrink-0 transition-transform"
                style={{ transform: open ? "rotate(90deg)" : undefined, color: "var(--primary)" }}
              />
              <span className="text-[15px] font-semibold leading-snug text-[var(--text)]">{task.label}</span>
            </button>

            {open && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={entranceVariant(Boolean(reduceMotion))}
                className="px-4 pb-4 pl-[42px]"
              >
                <p className="text-[14.5px] leading-relaxed text-[var(--muted)]">{task.answer}</p>
                {task.destination && (
                  <Link
                    href={`/app/products/${productSlug}/${task.destination}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--primary)] hover:underline"
                  >
                    Take me there
                    <ArrowRight size={14} aria-hidden />
                  </Link>
                )}
              </motion.div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
