"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createDocument } from "../domain/travelData";
import type { DocumentKind, Person, TravelDocument } from "../trip";

const KIND_OPTIONS: { value: DocumentKind; label: string }[] = [
  { value: "passport", label: "Passport" },
  { value: "visa", label: "Visa" },
  { value: "insurance", label: "Insurance" },
  { value: "confirmation", label: "Confirmation" },
  { value: "ticket", label: "Ticket" },
  { value: "agreement", label: "Agreement" },
  { value: "other", label: "Other" },
];

const SELECT_CLASS =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[14px] text-[var(--text)] outline-none focus:border-[var(--primary)]";

/**
 * Adding a document. kept_where is the whole point: a registry entry,
 * never a file, see trip.ts's own header on TravelDocument.
 */
export default function DocumentForm({
  instanceId,
  tripId,
  people,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  tripId: string;
  people: Person[];
  onAdded: (document: TravelDocument) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<DocumentKind>("passport");
  const [label, setLabel] = useState("");
  const [personId, setPersonId] = useState("");
  const [keptWhere, setKeptWhere] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createDocument(instanceId, tripId, {
      kind,
      label,
      personId: personId || null,
      keptWhere: keptWhere || null,
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
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-[var(--text)]">Kind</span>
        <select value={kind} onChange={(e) => setKind(e.target.value as DocumentKind)} className={SELECT_CLASS}>
          {KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Minha's passport" autoFocus />

      {people.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[var(--text)]">Belongs to (optional)</span>
          <select value={personId} onChange={(e) => setPersonId(e.target.value)} className={SELECT_CLASS}>
            <option value="">Not tied to one traveller</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <Input
        label="Where it's kept (optional)"
        value={keptWhere}
        onChange={(e) => setKeptWhere(e.target.value)}
        placeholder="Photo in Umar's phone"
        hint="What exists and where it is, never the document itself. Nothing here is uploaded or stored as a file."
      />

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || label.trim().length === 0}>
          Add document
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
