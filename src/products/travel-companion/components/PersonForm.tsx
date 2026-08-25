"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createPerson } from "../domain/travelData";
import type { Person } from "../trip";

export default function PersonForm({
  instanceId,
  tripId,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  tripId: string;
  onAdded: (person: Person) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [isChild, setIsChild] = useState(false);
  const [relationshipNote, setRelationshipNote] = useState("");
  const [requirements, setRequirements] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createPerson(instanceId, tripId, {
      name,
      isChild,
      relationshipNote: relationshipNote || null,
      requirements: requirements || null,
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
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Roha" autoFocus />
      <label className="flex items-center gap-2 text-[13px] text-[var(--text)]">
        <input type="checkbox" checked={isChild} onChange={(e) => setIsChild(e.target.checked)} className="accent-[var(--primary)]" />
        Travelling as a child
      </label>
      <Input
        label="Relationship (optional)"
        value={relationshipNote}
        onChange={(e) => setRelationshipNote(e.target.value)}
        placeholder="Umar and Roha's daughter"
      />
      <Input
        label="Requirements (optional)"
        value={requirements}
        onChange={(e) => setRequirements(e.target.value)}
        placeholder="Vegetarian meals, aisle seat"
        hint="Private by default. Nothing here is shown to anyone unless you choose to."
      />
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || name.trim().length === 0}>
          Add traveller
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
