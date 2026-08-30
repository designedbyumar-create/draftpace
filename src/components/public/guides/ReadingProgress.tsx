"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * A hairline showing how far through the article you are.
 *
 * Several of these run to ten minutes and open with a wall of text, and
 * the one question a reader has on a phone is how much is left. A
 * scrollbar answers that for the document, not for the article, and on
 * iOS it is not visible at all until you scroll.
 *
 * It sits above the sticky header rather than below it so it never
 * moves, and it takes the area accent so the article's colour is
 * present even at the top of the viewport. Purely decorative: the
 * information is also available from the scrollbar, so it is hidden
 * from assistive technology rather than announced on every scroll.
 */
export default function ReadingProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Spring only because a raw scroll value renders a visibly steppy bar
  // on trackpads. Under a reduced-motion preference the raw value is
  // used, which still tracks correctly, just without the easing.
  const smoothed = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: reduceMotion ? scrollYProgress : smoothed }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-[var(--area,var(--primary))]"
    />
  );
}
