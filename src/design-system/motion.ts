import type { MotionProps, Variants } from "framer-motion";

/**
 * The five shared motion patterns, named once instead of hand-typed per
 * component. Every product's own `motionPersonality` is "calm" today (see
 * themeExtension.ts), these use exactly the calm timing/easing already
 * declared there (260ms, cubic-bezier(0.22, 0.61, 0.36, 1)) so a component
 * reaching for one of these can never quietly drift from what a product's
 * own theme already promises.
 *
 * Every builder takes the `reduceMotion` boolean a component already gets
 * from framer-motion's own `useReducedMotion()`, the same call site
 * pattern already used across the app (e.g. ProductSummaryTile.tsx), and
 * returns the reduced-motion-safe variant/props itself, rather than
 * leaving each call site to remember the `reduceMotion ? undefined : {...}`
 * ternary on its own.
 */

const CALM_DURATION = 0.26;
const CALM_EASE = [0.22, 0.61, 0.36, 1] as const;
const SPRING_EASE = [0.34, 1.2, 0.64, 1] as const;

/** Fade + 8px rise. The one shared "this just arrived" pattern, a hero figure, a headline, a single next-step card. */
export function entranceVariant(reduceMotion: boolean): Variants {
  return {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : CALM_DURATION, ease: CALM_EASE } },
  };
}

const STAGGER_GAP_SECONDS = 0.07;
const STAGGER_MAX_ITEMS = 6;

/** Wraps any list, bills, playbooks, steps, tasks, so its children reveal in sequence rather than all at once. Pair with `staggerItem` on each child. */
export function staggerContainer(reduceMotion: boolean): Variants {
  return {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? {}
        : { staggerChildren: STAGGER_GAP_SECONDS, delayChildren: 0.05 },
    },
  };
}

/** One item inside a `staggerContainer`. Caps its own delay contribution implicitly by capping how many items a container should stagger, see STAGGER_MAX_ITEMS: past six, reveal the rest together rather than making the list feel slow. */
export function staggerItem(reduceMotion: boolean): Variants {
  return {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.32, ease: CALM_EASE } },
  };
}

export { STAGGER_MAX_ITEMS };

/** Press feedback for any tappable surface, a button, a card, a row. */
export function pressProps(reduceMotion: boolean): Pick<MotionProps, "whileTap" | "transition"> {
  return {
    whileTap: reduceMotion ? undefined : { scale: 0.97 },
    transition: { duration: 0.1, ease: CALM_EASE },
  };
}

/** Hover lift for cards and rows, already proven on Home's tiles and the Library shelf; this makes it the one shared implementation instead of a duplicated inline transition per component. */
export function liftProps(reduceMotion: boolean): Pick<MotionProps, "whileHover" | "transition"> {
  return {
    whileHover: reduceMotion ? undefined : { y: -3 },
    transition: { duration: 0.22, ease: CALM_EASE },
  };
}

/**
 * The one shared completion beat, a bill marked paid, a task logged, a
 * step confirmed, a run finished. Never a badge or a streak: a single,
 * quiet spring pop acknowledging that something real just happened.
 * Mount this only at the moment of completion (e.g. keyed by the action's
 * id), never left running as ambient decoration.
 */
export function settleVariant(reduceMotion: boolean): Variants {
  return {
    hidden: reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.5, ease: SPRING_EASE },
    },
  };
}
