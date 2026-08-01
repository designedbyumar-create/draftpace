"use client";

import { motion, useReducedMotion } from "framer-motion";

const STAGES = [
  { label: "Starting", detail: "You start on your phone, on the bus, with five minutes to spare." },
  { label: "Leaving", detail: "You close the tab. There is nothing extra you need to save first." },
  { label: "Returning later", detail: "Three days later, you open it again on your laptop." },
  { label: "Seeing where it stopped", detail: "It shows you exactly where you left off, not a blank screen." },
  { label: "Updating what changed", detail: "One detail changed since then. You update just that part." },
  { label: "Continuing", detail: "You keep going from there, not from the beginning." },
];

export default function ContinuityStory() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      <div className="absolute bottom-2 left-[15px] top-2 w-px bg-[var(--border)] sm:left-[19px]" aria-hidden />
      <ol className="flex flex-col gap-8">
        {STAGES.map((stage, index) => (
          <motion.li
            key={stage.label}
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.03 }}
            className="relative flex gap-4 pl-0 sm:gap-5"
          >
            <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--primary)] bg-[var(--bg)] text-[12px] font-bold text-[var(--primary)] sm:h-10 sm:w-10">
              {index + 1}
            </span>
            <div className="pt-1">
              <p className="text-[14px] font-semibold text-[var(--text)]">{stage.label}</p>
              <p className="mt-1 max-w-md text-[13px] leading-relaxed text-[var(--muted)]">{stage.detail}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
