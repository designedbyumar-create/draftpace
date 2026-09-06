"use client";

import { useId, useMemo, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createPlace } from "../domain/travelData";
import { lookupTimezone, TIMEZONE_PLACES } from "../timezoneLookup";
import type { Place } from "../trip";

export default function PlaceForm({
  instanceId,
  tripId,
  nextOrdinal,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  tripId: string;
  nextOrdinal: number;
  onAdded: (place: Place) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [arrivesAt, setArrivesAt] = useState("");
  const [departsAt, setDepartsAt] = useState("");
  /** Set only once a person has actually picked from the search field below. Null means "use whatever the name detects". */
  const [timezoneOverride, setTimezoneOverride] = useState<string | null>(null);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timezoneListId = useId();

  const detected = useMemo(() => lookupTimezone(name), [name]);
  const timezone = timezoneOverride ?? detected;

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createPlace(instanceId, tripId, {
      name,
      ordinal: nextOrdinal,
      arrivesAt: arrivesAt || null,
      departsAt: departsAt || null,
      timezone,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onAdded(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <Input label="Destination" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kyoto" autoFocus />
      <div className="flex flex-wrap gap-3">
        <Input type="date" label="Arrives" value={arrivesAt} onChange={(e) => setArrivesAt(e.target.value)} containerClassName="flex-1" />
        <Input type="date" label="Departs" value={departsAt} onChange={(e) => setDepartsAt(e.target.value)} containerClassName="flex-1" />
      </div>

      {/*
        Never a raw UTC offset. Detected from the destination name against
        a small offline table (timezoneLookup.ts); a person can search
        that same table by hand to correct it, but there is no numeric
        offset input anywhere here, because an offset is exactly the
        thing that quietly goes wrong the moment a place observes
        daylight saving.
      */}
      <div>
        <p className="text-[13px] font-semibold text-[var(--text)]">Timezone</p>
        {timezone ? (
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">
            {timezoneOverride ? "Set to" : "Detected as"} <span className="font-semibold text-[var(--text)]">{timezone}</span>.
            {!timezoneOverride && " Search below to change it."}
          </p>
        ) : (
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">
            Not detected from that name. Search for it below if you know it, or leave it and dates will be compared in
            UTC.
          </p>
        )}
        <Input
          value={timezoneSearch}
          onChange={(e) => {
            const value = e.target.value;
            setTimezoneSearch(value);
            if (value.trim().length === 0) {
              setTimezoneOverride(null);
              return;
            }
            const match = TIMEZONE_PLACES.find((entry) => entry.name.toLowerCase() === value.trim().toLowerCase());
            if (match) setTimezoneOverride(match.iana);
          }}
          list={timezoneListId}
          placeholder="Search a city or airport to set it by hand"
          containerClassName="mt-2"
          hint="Pick a real place from the list. There is no way to type a UTC offset directly."
        />
        <datalist id={timezoneListId}>
          {TIMEZONE_PLACES.map((entry) => (
            <option key={`${entry.name}-${entry.iana}`} value={entry.name} />
          ))}
        </datalist>
      </div>

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || name.trim().length === 0}>
          Add destination
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
