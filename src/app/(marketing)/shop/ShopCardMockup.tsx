"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * The hover-to-look-inside interaction for a Shop card's thumbnail.
 *
 * Every product already has three real, hand-built phone mockups (see
 * the *Visuals.tsx files next to shop/[productSlug]/page.tsx) that
 * already tell the product's story in sequence: the screen somebody
 * lands on, and two more that show what actually using it looks like.
 * The Shop grid used to show only the first one, frozen, in a flat
 * solid-color placeholder before that. This crossfades through all
 * three while a visitor's pointer or keyboard focus is on the card, and
 * settles back on the first the instant it leaves, so the resting state
 * somebody scrolls past is unchanged and the extra screens are a reward
 * for pausing on a card rather than a distraction for scrolling past
 * one.
 *
 * Real screens, not one screen scrolled. Each of these mockups is
 * already a self-contained phone screen sized to fill its frame edge to
 * edge (see PhoneFrame in monthlyMoneyResetVisuals.tsx and its
 * siblings), so there's no hidden lower half to reveal by scrolling one
 * screen. Cycling between genuinely different real screens shows more
 * of the actual product than a scroll trick ever could from a single
 * one.
 */
export default function ShopCardMockup({ screens }: { screens: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    if (screens.length < 2 || reduceMotion || timerRef.current) return;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % screens.length);
    }, 1600);
  }

  function stop() {
    setActive(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Belt and braces: a card removed from the DOM mid-hover (e.g. a
  // filter change) should never leave an interval running forever.
  useEffect(() => () => stop(), []);

  return (
    <div className="absolute inset-0" onMouseEnter={start} onMouseLeave={stop} onFocus={start} onBlur={stop}>
      <div
        className="absolute left-1/2 top-5 w-[230px]"
        style={{ transform: "translateX(-50%) scale(0.82)", transformOrigin: "top center" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {screens[active]}
          </motion.div>
        </AnimatePresence>
      </div>

      {screens.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5">
          {screens.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)] transition-all duration-300 ${
                i === active ? "w-4 opacity-95" : "w-1.5 opacity-55"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
