"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createRecordEntry } from "../domain/travelData";
import type { RecordCategory, RecordEntry } from "../trip";

const CATEGORY_OPTIONS: { value: RecordCategory; label: string }[] = [
  { value: "note", label: "Note" },
  { value: "lesson", label: "Lesson for next time" },
  { value: "destination", label: "Destination" },
  { value: "stay", label: "Stay" },
  { value: "transport", label: "Transport" },
  { value: "reservation", label: "Reservation" },
];

const SELECT_CLASS =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[14px] text-[var(--text)] outline-none focus:border-[var(--primary)]";

/**
 * Adding a dated note by hand.
 *
 * Place (optional) is what makes proposal §16's future-trip surfacing
 * possible: a later trip whose own destination matches this trip's own
 * place_name here is what gets offered, deterministically, never
 * copied without an explicit click.
 */
export default function RecordEntryForm({
  instanceId,
  tripId,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  tripId: string;
  onAdded: (entry: RecordEntry) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<RecordCategory>("note");
  const [placeName, setPlaceName] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createRecordEntry(instanceId, tripId, { category, placeName: placeName || null, body });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onAdded(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-[var(--text)]">Kind</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as RecordCategory)} className={SELECT_CLASS}>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Input
        label="In your own words"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="The ramen place near Nishiki Market was worth the wait"
        autoFocus
      />

      <Input
        label="Place (optional)"
        value={placeName}
        onChange={(e) => setPlaceName(e.target.value)}
        placeholder="Kyoto"
        hint="If you ever go back to this place, this note will be offered again, never copied without you choosing to."
      />

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || body.trim().length === 0}>
          Add to the record
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
