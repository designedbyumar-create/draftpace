"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import { describeResultError } from "@/product-framework/result";
import { setDocumentExpiry } from "../domain/travelData";
import { formatDate } from "../documentChecks";
import type { TravelDocument } from "../trip";

/**
 * A document's expiry: shown when recorded, and a quiet way to add or clear
 * it. Optional everywhere, because plenty of entries (a confirmation, an
 * agreement) have no date that matters.
 */
export default function DocumentExpiry({
  document,
  onChanged,
}: {
  document: TravelDocument;
  onChanged: (document: TravelDocument) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(document.expiresOn ?? "");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save(next: string | null) {
    setPending(true);
    setErrorMessage(null);
    const result = await setDocumentExpiry(document.id, next);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onChanged(result.data);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="date"
          aria-label={`Expiry date for ${document.label}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[14px] text-[var(--text)]"
        />
        <Button size="sm" variant="commit" disabled={pending || !value} onClick={() => save(value)}>
          Save
        </Button>
        {document.expiresOn && (
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => save(null)}>
            Clear
          </Button>
        )}
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setEditing(false)}>
          Cancel
        </Button>
        {errorMessage && <p className="basis-full text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-[var(--muted)]">
      {document.expiresOn ? `Expires ${formatDate(document.expiresOn)}` : null}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="min-h-9 rounded-full px-2.5 text-[12.5px] font-semibold text-[var(--text)] hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      >
        {document.expiresOn ? "Change" : "Add expiry date"}
      </button>
    </p>
  );
}
