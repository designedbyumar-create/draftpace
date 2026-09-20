"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import { describeResultError } from "@/product-framework/result";
import { createPreparationItems } from "../domain/travelData";
import { expandStarterLists, STARTER_LISTS } from "../packingLists";
import type { Person, PreparationItem } from "../trip";

/**
 * Starting a packing list, on purpose.
 *
 * Nothing is added until the button is pressed, the screen says so, and
 * every item it adds is an ordinary row the person can tick or remove. It
 * says who the items are for, and how many will be added, before adding
 * them, so nothing lands on somebody's trip that they did not see coming.
 * The count is of what is about to be added, never of what is left.
 */
export default function PackingStarter({
  instanceId,
  tripId,
  people,
  existing,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  tripId: string;
  people: Person[];
  existing: PreparationItem[];
  onAdded: (items: PreparationItem[]) => void;
  onCancel: () => void;
}) {
  const [chosen, setChosen] = useState<Set<string>>(new Set(["essentials"]));
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rows = expandStarterLists([...chosen], people, existing);
  const active = people.filter((person) => person.status === "active");

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createPreparationItems(instanceId, tripId, rows);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onAdded(result.data);
  }

  const group = (kind: "trip" | "with", legend: string) => (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-[13px] font-semibold text-[var(--text)]">{legend}</legend>
      {STARTER_LISTS.filter((list) => list.kind === kind).map((list) => (
        <label key={list.id} className="flex min-h-11 items-start gap-3 rounded-xl px-1 py-2">
          <input
            type="checkbox"
            checked={chosen.has(list.id)}
            onChange={() => toggle(list.id)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
          />
          <span>
            <span className="block text-[15px] text-[var(--text)]">{list.label}</span>
            <span className="block text-[13px] text-[var(--muted)]">{list.blurb}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );

  return (
    <section aria-label="Start a packing list" className="flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div>
        <h3 className="text-[18px] font-semibold text-[var(--text)]">Start a packing list</h3>
        <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
          A starting point, not a rulebook. Nothing is added until you press the button, and you can remove or
          change any of it afterwards.
        </p>
      </div>

      {group("trip", "What kind of trip?")}
      {group("with", "Travelling with")}

      <p className="text-[13px] leading-5 text-[var(--muted)]">
        {active.length === 0
          ? "For nobody in particular, because no travellers are recorded on this trip yet."
          : `For ${active.map((person) => (person.isChild ? `${person.name} (child)` : person.name)).join(", ")}.`}
      </p>

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || rows.length === 0}>
          {rows.length === 0 ? "Nothing new to add" : `Add ${rows.length} ${rows.length === 1 ? "item" : "items"} to my list`}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
