"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createTrip } from "../domain/travelData";
import { COUNTRIES } from "../geoData/countries";
import { US_STATES } from "../geoData/usStates";
import PlaceAutocomplete from "./PlaceAutocomplete";
import type { Trip, TravelType } from "../trip";

const TRAVEL_TYPE_CHOICE: { id: TravelType; label: string }[] = [
  { id: "international", label: "Going to a country" },
  { id: "domestic", label: "Travelling locally (USA)" },
];

/**
 * A trip is not always a destination. "Japan" as the title placeholder
 * pushed everyone toward naming the trip after a place, when the title
 * field and the destination field (below it) answer different
 * questions. Rotated on mount rather than fixed to one example, so it
 * reads as "any short name works," not as a hint toward any one of them.
 */
const TITLE_EXAMPLES = ["Business trip", "Family vacation", "Weekend getaway", "Reunion trip", "Anniversary trip"];

/**
 * Setting up a trip.
 *
 * Reachable from an empty Trip screen, still no wizard: a trip needs a
 * title to exist, nothing else is required. Dates are a guess, not a
 * declaration: most people do not know their exact return date the
 * moment they start planning. For an international trip, a visa expiry
 * is real information somebody already has and a trip cannot outlast,
 * so it defaults the return date until a real one (a booked flight,
 * added afterward under Bookings) replaces it. Choosing a travel type
 * swaps in a search field over a fixed list (geoData/), never a
 * suggestion of where to go, only of how to spell where somebody
 * already said they're going.
 */
export default function TripSetupForm({
  instanceId,
  onCreated,
  onCancel,
}: {
  instanceId: string;
  onCreated: (trip: Trip) => void;
  onCancel?: () => void;
}) {
  const [titlePlaceholder] = useState(() => TITLE_EXAMPLES[Math.floor(Math.random() * TITLE_EXAMPLES.length)]);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [endsAtTouched, setEndsAtTouched] = useState(false);
  const [visaExpiresOn, setVisaExpiresOn] = useState("");
  const [travelType, setTravelType] = useState<TravelType | null>(null);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function changeVisaExpiresOn(next: string) {
    setVisaExpiresOn(next);
    // A guessed return date, not a declared one: it only fills a blank,
    // and stops touching the field the moment somebody edits Ends
    // directly, so it can never silently overwrite a real date.
    if (!endsAtTouched) setEndsAt(next);
  }

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const destinationSummary = travelType === "international" ? country : travelType === "domestic" ? state : null;
    const result = await createTrip(instanceId, {
      title,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      travelType,
      destinationSummary,
      destinationCountry: travelType === "international" ? country : null,
      destinationState: travelType === "domestic" ? state : null,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onCreated(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <Input label="What is this trip?" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={titlePlaceholder} autoFocus />

      <div>
        <p className="mb-1.5 text-body-sm font-semibold text-[var(--text)]">Where are you going?</p>
        <div role="group" aria-label="Where are you going?" className="flex flex-wrap gap-2">
          {TRAVEL_TYPE_CHOICE.map((choice) => {
            const active = choice.id === travelType;
            return (
              <button
                key={choice.id}
                type="button"
                aria-pressed={active}
                onClick={() => setTravelType(active ? null : choice.id)}
                className={`min-h-9 rounded-full border px-3.5 text-body-sm font-semibold ${
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                    : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)]"
                }`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
        {travelType === "international" && (
          <div className="mt-3 flex flex-col gap-3">
            <PlaceAutocomplete label="Country" value={country} onChange={setCountry} options={COUNTRIES} placeholder="Argentina" />
            <Input
              type="date"
              label="Visa expires on"
              value={visaExpiresOn}
              onChange={(e) => changeVisaExpiresOn(e.target.value)}
              hint="Optional. If you don't know your return date yet, we'll use this as a placeholder for it below, until you add a real flight."
            />
          </div>
        )}
        {travelType === "domestic" && (
          <div className="mt-3">
            <PlaceAutocomplete label="State" value={state} onChange={setState} options={US_STATES} placeholder="Alabama" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          type="date"
          label="Starts"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          containerClassName="flex-1"
        />
        <Input
          type="date"
          label="Ends"
          value={endsAt}
          onChange={(e) => {
            setEndsAtTouched(true);
            setEndsAt(e.target.value);
          }}
          containerClassName="flex-1"
        />
      </div>
      <p className="-mt-2 text-caption text-[var(--muted)]">
        Don&apos;t know your dates yet? Leave them blank. Both are rough, and either can change anytime; exact times live on
        each booking.
      </p>
      {errorMessage && <p className="text-body-sm text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || title.trim().length === 0}>
          Set up this trip
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </section>
  );
}
