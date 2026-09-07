"use client";

import GuidedTour, { type TourStep } from "./GuidedTour";
import { useFirstRunTour } from "./useFirstRunTour";

/**
 * A product's first-run tour, as one line.
 *
 * Modules early-return their empty state, which for most products is
 * exactly the screen a first-run tour is meant to explain, so the tour
 * has to be mountable in more than one return path. Pairing the trigger
 * with the tour here means each of those paths costs a single line
 * instead of a hook, a piece of state and a conditional render.
 *
 * Only one path is mounted at a time, so the trigger still runs once.
 */
export default function FirstRunTour({
  slug,
  steps,
  ready = true,
  labelPrefix,
}: {
  slug: string;
  steps: TourStep[];
  /** The product's own gate: false while it would tour placeholders rather than real state. */
  ready?: boolean;
  labelPrefix?: string;
}) {
  const { tourOn, finishTour } = useFirstRunTour(slug, ready);
  if (!tourOn) return null;
  return <GuidedTour steps={steps} onFinish={finishTour} labelPrefix={labelPrefix ?? slug} />;
}
