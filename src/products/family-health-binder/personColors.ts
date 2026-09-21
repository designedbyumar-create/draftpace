import type { CSSProperties } from "react";

/**
 * A small colour for each person, so a house of four reads at a glance.
 * These are mixing sources only: the mark's fill and its letter are both
 * mixed with the surface and the text of whichever theme is showing, so one
 * list serves light and dark and the letter stays readable on its own fill
 * (personColors.test.ts holds every one to 4.5:1 in both themes).
 *
 * The colour is a label for a person and never a signal about their health.
 */
export const PERSON_HUES = ["#b23a5b", "#3f6fb5", "#2f8a68", "#b0791a", "#7a55ad", "#c25a2e"] as const;

/** Hue for the nth person, cycling. */
export function personHue(index: number): string {
  return PERSON_HUES[((index % PERSON_HUES.length) + PERSON_HUES.length) % PERSON_HUES.length];
}

export const MARK_FILL_PERCENT = 20;
export const MARK_INK_PERCENT = 55;

export function personMarkStyle(index: number): CSSProperties {
  const hue = personHue(index);
  return {
    backgroundColor: `color-mix(in srgb, ${hue} ${MARK_FILL_PERCENT}%, var(--surface))`,
    color: `color-mix(in srgb, ${hue} ${MARK_INK_PERCENT}%, var(--text))`,
  };
}

/** The first letter of a name, upper-cased, or "?" for a name with none. */
export function initialOf(name: string): string {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : "?";
}
