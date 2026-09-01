"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createPreparationItem } from "../domain/travelData";
import type { PreparationCategory, PreparationItem } from "../trip";

const CATEGORY_OPTIONS: { value: PreparationCategory; label: string }[] = [
  { value: "documents", label: "Documents" },
  { value: "packing", label: "Packing" },
  { value: "transport", label: "Transport" },
  { value: "money", label: "Money" },
  { value: "home", label: "Home" },
  { value: "people", label: "People" },
  { value: "bookings", label: "Bookings" },
];

const SELECT_CLASS =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[14px] text-[var(--text)] outline-none focus:border-[var(--primary)]";

/** Adding a checklist item. No seeded content, ever: the title is always the user's own words. */
export default function PreparationForm({
  instanceId,
  tripId,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  tripId: string;
  onAdded: (item: PreparationItem) => void;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<PreparationCategory>("documents");
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createPreparationItem(instanceId, tripId, { category, title });
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
        <span className="text-[13px] font-semibold text-[var(--text)]">Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value as PreparationCategory)} className={SELECT_CLASS}>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Input label="What needs doing" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Renew Minha's passport" autoFocus />

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || title.trim().length === 0}>
          Add to the list
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
