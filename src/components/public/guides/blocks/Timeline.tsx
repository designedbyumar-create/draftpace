"use client";

import { motion, useReducedMotion } from "framer-motion";
import { renderInline } from "../inline";

/**
 * A sequence drawn as a sequence.
 *
 * Several of these guides are ordered for a reason: the first two weeks
 * after a death, the twenty minutes after a delay is announced, the
 * order to untangle money in after a separation. Rendered as a numbered
 * list they read as a set of equal items, and readers in exactly those
 * situations pick the easiest one rather than the first one.
 *
 * The spine makes the order structural. The marker carries the real
 * interval from the content rather than a step number, because "Within
 * 48 hours" tells a reader something that "3" does not.
 *
 * The reveal is staggered on scroll, which reinforces direction, but it
 * never animates opacity. Framer Motion renders its `initial` styles
 * into the server HTML, so an opacity of zero here would mean the text
 * of the article is invisible until JavaScript hydrates, and invisible
 * permanently if it never does. Only the marker fades; the words are
 * always on the page. Under a reduced-motion preference nothing moves.
 */
export default function Timeline({
  steps,
  idPrefix,
}: {
  steps: { when: string; what: string }[];
  idPrefix: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <ol className="relative mt-5 flex flex-col">
      {/* The spine. It stops at the last node rather than running past
          it, so the sequence reads as finished rather than truncated. */}
      <span
        aria-hidden
        className="absolute bottom-[26px] left-[7px] top-[10px] w-[2px] rounded-full bg-[var(--border-strong)]"
      />

      {steps.map((step, i) => (
        <motion.li
          key={i}
          initial={reduceMotion ? false : { y: 8 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : i * 0.05 }}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          <motion.span
            aria-hidden
            initial={reduceMotion ? false : { scale: 0.4, opacity: 0.2 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : i * 0.05 }}
            className="relative z-10 mt-[6px] h-4 w-4 shrink-0 rounded-full border-[3px] border-[var(--area,var(--primary))] bg-[var(--bg)]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--area,var(--primary))]">
              {step.when}
            </p>
            <p className="mt-1.5 text-[15.5px] leading-[1.65] text-[var(--text)]">
              {renderInline(step.what, `tl-${idPrefix}-${i}`)}
            </p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
