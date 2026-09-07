"use client";

import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import type { DraftpaceIcon } from "@/design-system/Icon";
import FirstRunTour from "./FirstRunTour";
import type { TourStep } from "./GuidedTour";

/**
 * What a brand new owner sees, and the one thing they can do about it.
 *
 * THE GAP THIS CLOSES
 *
 * Every product already had an honest empty state and, since the tour
 * lift, a first-run tour. Five of the nine had no way out of that empty
 * state: Alongside, Homeschooling Companion, Personal Life Affairs
 * Companion, Vehicle Maintenance Companion and Family Health Binder
 * passed no `action` to a single EmptyState anywhere in the product. So
 * somebody who had just paid read "Add a vehicle in Vehicles to start
 * tracking what it needs" and had nothing to click. The instruction
 * named a destination and then left them to find it in the rail.
 *
 * A first screen that tells somebody what to do next should be the thing
 * that takes them there. That is the whole of this component: the
 * product's own empty state, its own first action as a real button to
 * the destination that action happens on, and its tour, mounted
 * together so no product can ship one without the others.
 *
 * `commit` rather than `primary`, per the two button registers: this is
 * inside a product, so it wears that product's own accent rather than
 * the marketing CTA (src/design-system/buttonStyles.ts).
 */
export default function FirstRun({
  slug,
  icon,
  title,
  description,
  actionLabel,
  destination,
  steps,
}: {
  slug: string;
  icon?: DraftpaceIcon;
  title: string;
  description: string;
  /** What the button says. An imperative naming the first real action, never "Get started". */
  actionLabel: string;
  /** The destination id that action happens on, from this product's own navigation. */
  destination: string;
  steps: TourStep[];
}) {
  return (
    <>
      <FirstRunTour slug={slug} steps={steps} />
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={
          <Button href={`/app/products/${slug}/${destination}`} variant="commit" size="sm">
            {actionLabel}
          </Button>
        }
      />
    </>
  );
}
