import { useReducedMotion } from "framer-motion";
import { useAccessibility } from "@/design-system/theme/AccessibilityProvider";

/** Same value as --ease-out in globals.css, as a numeric array (framer-motion needs a tuple, not a CSS var string). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const SPRING = { type: "spring", stiffness: 320, damping: 32 } as const;

/**
 * Combines the OS-level prefers-reduced-motion signal (useReducedMotion)
 * with Draftpace's own explicit "Reduce motion" Settings toggle
 * (useAccessibility().reduceMotion) — either one should suppress
 * JS-driven animation. The reference marketing components only check the
 * former; this is a gap worth closing in new code.
 */
export function useCombinedReducedMotion(): boolean {
  const osReduceMotion = useReducedMotion();
  const { reduceMotion: settingReduceMotion } = useAccessibility();
  return Boolean(osReduceMotion) || settingReduceMotion;
}
