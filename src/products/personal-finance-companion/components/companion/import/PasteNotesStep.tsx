"use client";

import { useState } from "react";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import { extractCandidatesFromText } from "../../../import/extractFromText";
import { createImportSession } from "../../../domain/importSessions";
import { createExtractionCandidates } from "../../../domain/extractionCandidates";
import type { ExtractionCandidate } from "../../../import/types";
import { describeResultError } from "@/product-framework/result";

const PLACEHOLDER = `Checking account about $2,400
Salary 3,200 on the 25th
Rent 900 due first
Netflix 15.99 around the 12th
Visa balance 4,800, minimum maybe 160
Emergency savings 1,300 of 5,000 target`;

/**
 * Pasted-notes input (launch spec D3). Extraction is plain pattern
 * matching, not AI (see extractFromText.ts) — the copy here says so
 * honestly ("Draftpace looked for patterns"), never "AI found this".
 */
export default function PasteNotesStep({
  instanceId,
  onCandidatesReady,
  onBack,
}: {
  instanceId: string;
  onCandidatesReady: (candidates: ExtractionCandidate[], importSessionId: string) => void;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function findRecords() {
    setError(null);
    if (!text.trim()) {
      setError("Paste some notes first.");
      return;
    }
    setBusy(true);
    const sessionResult = await createImportSession(instanceId, { inputType: "pastedNotes" });
    if (!sessionResult.ok) {
      setError(describeResultError(sessionResult.error));
      setBusy(false);
      return;
    }
    const drafts = extractCandidatesFromText(text);
    const candidatesResult = await createExtractionCandidates(instanceId, sessionResult.data.id, drafts);
    setBusy(false);
    if (!candidatesResult.ok) {
      setError(describeResultError(candidatesResult.error));
      return;
    }
    onCandidatesReady(candidatesResult.data, sessionResult.data.id);
  }

  return (
    <Surface elevated className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Notes or messages</p>
        <h2 className="mt-1 text-[17px] font-semibold text-[var(--text)]">Paste what you already know.</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
          Draftpace looks for patterns like amounts, due dates, and balances — one line at a time. Nothing becomes a real record
          until you confirm it.
        </p>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={8}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] leading-relaxed text-[var(--text)] placeholder:text-[var(--faint)] focus:border-[var(--primary)] focus:outline-none"
      />

      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" size="md" onClick={onBack} disabled={busy}>
          Back
        </Button>
        <Button size="md" onClick={findRecords} disabled={busy}>
          {busy ? "Looking for records…" : "Find records"}
        </Button>
      </div>
    </Surface>
  );
}
