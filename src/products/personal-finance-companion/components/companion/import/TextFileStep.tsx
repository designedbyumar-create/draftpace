"use client";

import { useRef, useState } from "react";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import { extractCandidatesFromText } from "../../../import/extractFromText";
import { createImportSession } from "../../../domain/importSessions";
import { createExtractionCandidates } from "../../../domain/extractionCandidates";
import type { ExtractionCandidate } from "../../../import/types";
import { describeResultError } from "@/product-framework/result";

const MAX_SIZE_BYTES = 200 * 1024; // 200 KB — plenty for pasted-style notes, small enough that nothing here needs streaming or persistent storage.

/**
 * Text-file input (launch spec D4). The file's raw bytes are read
 * entirely in the browser and never uploaded to storage — only the
 * extracted text is used, and only its metadata (name/size/type) is kept
 * for provenance on the import session. Validates type, size, and
 * emptiness before ever reading content.
 */
export default function TextFileStep({
  instanceId,
  onCandidatesReady,
  onBack,
}: {
  instanceId: string;
  onCandidatesReady: (candidates: ExtractionCandidate[], importSessionId: string) => void;
  onBack: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    const isTextType = file.type === "text/plain" || file.type === "" || /\.txt$/i.test(file.name);
    if (!isTextType) return "Only plain text files (.txt) are supported.";
    if (file.size === 0) return "This file is empty.";
    if (file.size > MAX_SIZE_BYTES) return "This file is too large (200 KB max).";
    return null;
  }

  async function handleFile(file: File) {
    setError(null);
    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFileName(file.name);
    setBusy(true);

    let text: string;
    try {
      text = await file.text();
    } catch {
      setError("Couldn't read this file.");
      setBusy(false);
      return;
    }
    if (!text.trim()) {
      setError("This file doesn't contain any text.");
      setBusy(false);
      return;
    }

    const sessionResult = await createImportSession(instanceId, {
      inputType: "textFile",
      fileOriginalName: file.name,
      fileSizeBytes: file.size,
      fileMimeType: file.type || "text/plain",
    });
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
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Text file</p>
        <h2 className="mt-1 text-[17px] font-semibold text-[var(--text)]">Upload a plain text file.</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
          The same pattern-matching Draftpace uses for pasted notes, applied to a .txt file. The file itself is never stored —
          only what you confirm becomes a real record.
        </p>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <input
        ref={inputRef}
        type="file"
        accept=".txt,text/plain"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-[13px] font-medium text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--text)]"
      >
        {busy ? "Looking for records…" : fileName ? `Selected: ${fileName}` : "Choose a .txt file"}
      </button>

      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" size="md" onClick={onBack} disabled={busy}>
          Back
        </Button>
      </div>
    </Surface>
  );
}
