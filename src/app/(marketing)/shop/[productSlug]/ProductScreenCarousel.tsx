"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { accentWash } from "@/design-system/accentTone";
import PhoneFrame from "../PhoneFrame";

/**
 * One frame, one phone, and the screens changing inside it.
 *
 * WHAT THIS REPLACED, AND WHY
 *
 * A large cover image with four thumbnails under it. Clicking a thumbnail
 * swapped the whole picture: background, phone, caption, everything. That
 * is four pictures of a product rather than one product doing four things,
 * and the eye has to re-find the phone after every change.
 *
 * Here the frame and the phone never move. Only the screen inside the
 * bezel slides, the way it would if you were holding it, so the thing
 * being demonstrated stays anchored and the change reads as use rather
 * than as a different image.
 *
 * THE SCREENS ARE REAL
 *
 * They come from screenTourFor(), the same map the Shop card and the
 * owned-product manual draw from, so somebody who buys a product
 * recognises it afterwards as the thing they were shown. The captions come
 * from each mockup's own doc comment rather than being written fresh as
 * marketing copy, which means a redrawn mockup makes its caption wrong in
 * the same commit its comment is.
 *
 * Advancing on its own is deliberate but gentle: it stops permanently the
 * moment somebody takes control, because a carousel that keeps moving
 * under a reader who is trying to look at one thing is worse than one that
 * never moved at all. It also never runs for a visitor who has asked for
 * reduced motion, and never while the tab is hidden.
 */
const ADVANCE_MS = 4200;

export type CarouselScreen = { node: ReactNode; caption: string | null };

export default function ProductScreenCarousel({
  screens,
  accent,
  title,
}: {
  screens: CarouselScreen[];
  accent: string;
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [taken, setTaken] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const timer = useRef<number | null>(null);

  const select = useCallback((next: number) => {
    setTaken(true);
    setIndex(next);
  }, []);

  useEffect(() => {
    if (taken || reduceMotion || screens.length < 2) return;

    const tick = () => {
      // Pausing while hidden stops a background tab burning through every
      // screen, so the first thing a returning reader sees is not screen
      // three of three with no idea what one and two were.
      if (!document.hidden) setIndex((i) => (i + 1) % screens.length);
      timer.current = window.setTimeout(tick, ADVANCE_MS);
    };
    timer.current = window.setTimeout(tick, ADVANCE_MS);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [taken, reduceMotion, screens.length]);

  const active = screens[index];

  return (
    <div className="flex flex-col">
      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] px-6 pt-10 sm:px-10 sm:pt-14"
        style={{
          // The same wash the generated store images use (accentWash, and
          // see docs/DESIGN-SYSTEM.md for why it goes through HSL rather
          // than mixing with white), so this frame and the picture of it
          // that gets shared to social are recognisably one thing.
          background: `linear-gradient(150deg, ${accentWash(accent, 0.905)} 0%, ${accentWash(accent, 0.973)} 62%, ${accentWash(accent, 0.925)} 100%)`,
        }}
      >
        {/* The caption above the phone, not below: it says what you are
            about to look at, and it is the thing that changes, so it
            belongs where the eye already is before the screen swaps. */}
        <div className="relative mx-auto mb-7 h-[52px] max-w-[26rem] text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-0 font-serif text-[19px] leading-[1.3] sm:text-[21px]"
              style={{ color: `color-mix(in srgb, ${accent} 82%, black)` }}
            >
              {active?.caption ?? title}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* The phone is the fixed thing. Only what is inside the bezel
            changes, which is why the frame lives outside AnimatePresence
            and the screen lives inside it. */}
        <div className="mx-auto w-[248px] sm:w-[268px]">
          <PhoneFrame accent={accent}>
            <div className="relative h-full w-full overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  {active?.node}
                </motion.div>
              </AnimatePresence>
            </div>
          </PhoneFrame>
        </div>
      </div>

      {/* Controls, under the frame rather than over the phone. Real
          buttons with real labels: a row of unlabelled dots is a control
          a screen reader cannot use and a thumb struggles to hit. */}
      {screens.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {screens.map((screen, i) => (
            <button
              key={i}
              type="button"
              onClick={() => select(i)}
              aria-label={screen.caption ?? `Screen ${i + 1} of ${screens.length}`}
              aria-current={i === index}
              className="group flex h-11 items-center px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ outlineColor: accent }}
            >
              <span
                className="block h-[3px] rounded-full transition-all duration-300"
                style={{
                  width: i === index ? 34 : 16,
                  backgroundColor: i === index ? accent : "var(--border-strong)",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
