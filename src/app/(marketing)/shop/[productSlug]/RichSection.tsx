"use client";

import Image from "next/image";
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
 * stuck at opacity 0, invisible content, not just a missing animation. A
 * section with a matching screenshot (product.media[].section, see
 * src/shop/definition.ts) gets a real framed visual beside its text,
 * alternating sides, instead of every section being a plain text block
 * regardless of whether art exists for it.
 */
export default function RichSection({
  eyebrow,
  children,
  media,
  reverse = false,
}: {
  eyebrow: string;
  children: React.ReactNode;
  media?: { src: string; alt: string } | null;
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
      {media ? (
        <div
          className={`grid items-center gap-8 sm:gap-12 ${
            reverse ? "sm:grid-cols-[1fr_1.05fr]" : "sm:grid-cols-[1.05fr_1fr]"
          }`}
        >
          <div className={reverse ? "sm:order-2" : ""}>
            <SectionHeading>{eyebrow}</SectionHeading>
            <div className="mt-4 text-[16px] leading-relaxed text-[var(--text)]">{children}</div>
          </div>
          <div className={reverse ? "sm:order-1" : ""}>
            <FramedShot src={media.src} alt={media.alt} />
          </div>
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

/** Same "framed browser window" treatment as the hero's hero visual, reused
 * so every real screenshot on this page reads as one consistent system. */
function FramedShot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-x-4 inset-y-6 -z-10 rounded-[28px] bg-[var(--primary)] opacity-[0.08] blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden />
        </div>
        <div className="relative aspect-[4/3]">
          <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
        </div>
      </div>
    </div>
  );
}
