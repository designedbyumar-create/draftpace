"use client";

import { useState } from "react";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import { extractCandidatesFromText } from "../../import/extractFromText";
import { createImportSession } from "../../domain/importSessions";
import type { ExtractionCandidate } from "../../import/types";
import { describeResultError } from "@/product-framework/result";

const PLACEHOLDER = `Refrigerator purchased 2023-01-15, warranty until 2026-01-15
Change furnace filter every 90 days
HVAC service every 6 months
Joe's Plumbing - 555-123-4567`;

/**
 * Pasted-notes input, Home Base's own parallel to PFC's PasteNotesStep.tsx.
 * Extraction is plain pattern matching, not AI (see extractFromText.ts),
 * the copy here says so honestly ("Draftpace looked for patterns"), never
 * "AI found this".
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
    const candidates: ExtractionCandidate[] = drafts.map((draft) => ({
      ...draft,
      id: crypto.randomUUID(),
      duplicateStatus: "none",
      duplicateOfName: null,
      reviewStatus: "unreviewed",
    }));
    setBusy(false);
    onCandidatesReady(candidates, sessionResult.data.id);
  }

  return (
    <Surface elevated className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Notes or messages</p>
        <h2 className="mt-1 text-[17px] font-semibold text-[var(--text)]">Paste what you already know.</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
          Draftpace looks for patterns like warranty dates, repeat schedules, and phone numbers, one line at a time.
          Nothing is saved until you say so.
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
