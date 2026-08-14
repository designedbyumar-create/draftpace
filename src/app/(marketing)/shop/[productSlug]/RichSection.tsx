"use client";

import { motion } from "framer-motion";
import { EASE_OUT, useCombinedReducedMotion } from "@/components/onboarding/motion";

/**
 * The Shop product page's section shell. Fades/lifts in on mount using the
 * same pattern as LivingAnatomy.tsx / LivingSpectrum.tsx (animate, not
 * whileInView): those reference components deliberately animate
 * immediately rather than gating on IntersectionObserver, and a live check
 * of an earlier whileInView version here confirmed why. A programmatic
 * scroll_to (and, per report, some real scroll patterns) can land past the
 * trigger margin without the observer ever firing, leaving whole sections
 * stuck at opacity 0, invisible content, not just a missing animation.
 *
 * `visual` takes any node, not just an image, so a product with a bespoke
 * illustration (see monthlyMoneyResetVisuals.tsx) can pair it with a
 * section without RichSection needing to know what kind of visual it is.
 */
export default function RichSection({
  eyebrow,
  children,
  visual,
  reverse = false,
}: {
  eyebrow: string;
  children: React.ReactNode;
  visual?: React.ReactNode;
  reverse?: boolean;
}) {
  const reduceMotion = useCombinedReducedMotion();

  return (
    <motion.section
      className="mt-16 sm:mt-20"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {visual ? (
        <div
          className={`grid items-center gap-8 sm:gap-12 ${
            reverse ? "sm:grid-cols-[1fr_1.05fr]" : "sm:grid-cols-[1.05fr_1fr]"
          }`}
        >
          <div className={reverse ? "sm:order-2" : ""}>
            <SectionHeading>{eyebrow}</SectionHeading>
            <div className="mt-4 text-[16px] leading-relaxed text-[var(--text)]">{children}</div>
          </div>
          <div className={reverse ? "sm:order-1" : ""}>{visual}</div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          <SectionHeading>{eyebrow}</SectionHeading>
          <div className="mt-4 text-[15px] leading-relaxed text-[var(--text)]">{children}</div>
        </div>
      )}
    </motion.section>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{children}</h2>;
}
