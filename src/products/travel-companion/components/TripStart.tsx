"use client";

import { useRouter } from "next/navigation";
import { TRAVEL_COMPANION_SLUG } from "../instanceData";
import type { Trip } from "../trip";
import TripSetupForm from "./TripSetupForm";

/**
 * The first thing somebody with no trip sees, and the whole of setting one
 * up: a name and rough dates, on the screen itself.
 *
 * It used to say "No trip yet" and offer a link to a form, which made the
 * first five minutes of a product about organising a trip a screen that
 * organised nothing. Now the form is the screen, and finishing it lands on
 * the trip laid out day by day, so the first thing that happens is that
 * the trip exists and has a shape.
 *
 * No wizard, and no second screen of questions: a trip needs a name and
 * rough dates to exist, and everything else is added from the days.
 */
export default function TripStart({
  instanceId,
  onCreated,
}: {
  instanceId: string;
  onCreated: (trip: Trip) => void;
}) {
  const router = useRouter();
  return (
    <div id="travel-tour-start" className="mx-auto flex w-full max-w-md flex-col gap-6 py-2">
      <div>
        <h1 className="text-[36px] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--text)] [text-wrap:balance]">
          Where are you going?
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
          A name and rough dates are enough. You will see the trip laid out day by day straight away, and add
          what you have booked from there.
        </p>
      </div>
      <TripSetupForm
        instanceId={instanceId}
        onCreated={(trip) => {
          onCreated(trip);
          router.push(`/app/products/${TRAVEL_COMPANION_SLUG}/itinerary`);
        }}
      />
    </div>
  );
}
