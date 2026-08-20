"use client";

import { useMemo, useRef, useState } from "react";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Select from "@/design-system/Select";
import Alert from "@/design-system/Alert";
import Badge from "@/design-system/Badge";
import { parseCsv, looksLikeFormulaInjection } from "../../import/csvParse";
import { createImportSession } from "../../domain/importSessions";
import { confirmCandidate } from "../../domain/confirmCandidate";
import { describeResultError } from "@/product-framework/result";
import type { CandidateDraft, CandidateType, ExtractionCandidate } from "../../import/types";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Step = "upload" | "map" | "confirming" | "done";

interface RowResult {
  candidate: CandidateDraft;
  ambiguous: boolean;
}

/** Blank or malformed returns undefined rather than guessing at a format, same never-guess discipline as the extraction matchers. */
function parseCsvDate(raw: string): string | undefined {
  const trimmed = raw.trim();
  return ISO_DATE.test(trimmed) ? trimmed : undefined;
}

/**
 * CSV import, Home Base's own parallel to PFC's CsvImportFlow.tsx,
 * reuses the generic parseCsv tokenizer verbatim (see import/csvParse.ts).
 * Generalized over Home Base's three possible target types instead of
 * hardcoded to one row shape, since (unlike PFC's transactions) there's
 * no single dominant CSV shape this product imports.
 */
export default function CsvImportFlow({
  instanceId,
  onDone,
  onBack,
}: {
  instanceId: string;
  onDone: (ambiguousCandidates: ExtractionCandidate[], importSessionId: string) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [parseErrorCount, setParseErrorCount] = useState(0);

  const [targetType, setTargetType] = useState<CandidateType>("thing");
  const [nameCol, setNameCol] = useState("");
  const [brandCol, setBrandCol] = useState("");
  const [purchaseDateCol, setPurchaseDateCol] = useState("");
  const [warrantyCol, setWarrantyCol] = useState("");
  const [cadenceDaysCol, setCadenceDaysCol] = useState("");
  const [phoneCol, setPhoneCol] = useState("");
  const [emailCol, setEmailCol] = useState("");

  const [confirmProgress, setConfirmProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [ambiguousCandidates, setAmbiguousCandidates] = useState<ExtractionCandidate[]>([]);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      setError("Only .csv files are supported.");
      return;
    }
    if (file.size === 0) {
      setError("This file is empty.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("This file is too large (2 MB max).");
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);
    file
      .text()
      .then((text) => {
        const result = parseCsv(text);
        if (result.headers.length === 0) {
          setError("Couldn't find a header row in this file.");
          return;
        }
        setHeaders(result.headers);
        setRows(result.rows);
        setParseErrorCount(result.rowErrors.length);
        setNameCol(result.headers.find((h) => /name/i.test(h)) ?? result.headers[0]);
        setBrandCol(result.headers.find((h) => /brand/i.test(h)) ?? "");
        setPurchaseDateCol(result.headers.find((h) => /purchas/i.test(h)) ?? "");
        setWarrantyCol(result.headers.find((h) => /warrant/i.test(h)) ?? "");
        setCadenceDaysCol(result.headers.find((h) => /cadence|every|days/i.test(h)) ?? "");
        setPhoneCol(result.headers.find((h) => /phone/i.test(h)) ?? "");
        setEmailCol(result.headers.find((h) => /email/i.test(h)) ?? "");
        setStep("map");
      })
      .catch(() => setError("Couldn't read this file."));
  }

  const mappedRows: RowResult[] = useMemo(() => {
    if (step !== "map") return [];
    const nameIdx = headers.indexOf(nameCol);
    if (nameIdx < 0) return [];

    return rows.map((row) => {
      const name = row[nameIdx]?.trim() ?? "";
      const formulaRisk = looksLikeFormulaInjection(name);
      const ambiguityNotes: string[] = formulaRisk
        ? ["This name starts with a character spreadsheets treat as a formula. Shown as plain text here."]
        : [];

      if (targetType === "thing") {
        const brandIdx = headers.indexOf(brandCol);
        const purchaseIdx = headers.indexOf(purchaseDateCol);
        const warrantyIdx = headers.indexOf(warrantyCol);
        const purchaseDate = purchaseIdx >= 0 ? parseCsvDate(row[purchaseIdx]) : undefined;
        const warrantyExpiresAt = warrantyIdx >= 0 ? parseCsvDate(row[warrantyIdx]) : undefined;
        const candidate: CandidateDraft = {
          candidateType: "thing",
          payload: { name, brand: brandIdx >= 0 ? row[brandIdx] || undefined : undefined, purchaseDate, warrantyExpiresAt },
          confidence: name ? "high" : "low",
          missingFields: name ? [] : ["name"],
          ambiguityNotes,
          sourceReference: row.join(", "),
        };
        return { candidate, ambiguous: !name };
      }

      if (targetType === "maintenanceTask") {
        const cadenceIdx = headers.indexOf(cadenceDaysCol);
        const rawCadence = cadenceIdx >= 0 ? row[cadenceIdx].trim() : "";
        const cadenceDays = /^\d+$/.test(rawCadence) ? Number(rawCadence) : undefined;
        const missingFields = cadenceDays === undefined ? ["cadenceDays"] : [];
        const candidate: CandidateDraft = {
          candidateType: "maintenanceTask",
          payload: { name, cadenceDays },
          confidence: name && cadenceDays !== undefined ? "high" : "low",
          missingFields: name ? missingFields : ["name", ...missingFields],
          ambiguityNotes,
          sourceReference: row.join(", "),
        };
        return { candidate, ambiguous: !name || cadenceDays === undefined };
      }

      const phoneIdx = headers.indexOf(phoneCol);
      const emailIdx = headers.indexOf(emailCol);
      const candidate: CandidateDraft = {
        candidateType: "serviceProvider",
        payload: {
          name,
          phone: phoneIdx >= 0 ? row[phoneIdx] || undefined : undefined,
          email: emailIdx >= 0 ? row[emailIdx] || undefined : undefined,
        },
        confidence: name ? "high" : "low",
        missingFields: name ? [] : ["name"],
        ambiguityNotes,
        sourceReference: row.join(", "),
      };
      return { candidate, ambiguous: !name };
    });
  }, [step, rows, headers, targetType, nameCol, brandCol, purchaseDateCol, warrantyCol, cadenceDaysCol, phoneCol, emailCol]);

  const readyCount = mappedRows.filter((r) => !r.ambiguous).length;
  const ambiguousCount = mappedRows.length - readyCount;

  async function confirmImport() {
    setError(null);
    setStep("confirming");

    const sessionResult = await createImportSession(instanceId, {
      inputType: "csv",
      fileOriginalName: fileName ?? undefined,
      fileSizeBytes: fileSize,
      fileMimeType: "text/csv",
    });
    if (!sessionResult.ok) {
      setError(describeResultError(sessionResult.error));
      setStep("map");
      return;
    }
    setSessionId(sessionResult.data.id);

    const candidates: ExtractionCandidate[] = mappedRows.map((r) => ({
      ...r.candidate,
      id: crypto.randomUUID(),
      duplicateStatus: "none",
      duplicateOfName: null,
      reviewStatus: "unreviewed",
    }));
    const readyCandidates = candidates.filter((_, i) => !mappedRows[i].ambiguous);
    const stillAmbiguous = candidates.filter((_, i) => mappedRows[i].ambiguous);

    setConfirmProgress({ done: 0, total: readyCandidates.length });
    let succeeded = 0;
    for (const candidate of readyCandidates) {
      const result = await confirmCandidate({ instanceId, candidate, importSessionId: sessionResult.data.id, source: "csvImport" });
      if (result.ok) succeeded++;
      setConfirmProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setConfirmedCount(succeeded);
    setAmbiguousCandidates(stillAmbiguous);
    setStep("done");
  }

  if (step === "upload") {
    return (
      <Surface elevated className="flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">CSV import</p>
          <h2 className="mt-1 text-[17px] font-semibold text-[var(--text)]">Upload a spreadsheet export.</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
            Works with a CSV of things, maintenance tasks, or service providers. You&apos;ll map the columns
            yourself on the next screen, since formats vary. Dates must read YYYY-MM-DD.
          </p>
        </div>
        {error && <Alert tone="danger">{error}</Alert>}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-[13px] font-medium text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--text)]"
        >
          Choose a .csv file
        </button>
        <Button variant="secondary" size="md" onClick={onBack}>
          Back
        </Button>
      </Surface>
    );
  }

  if (step === "map") {
    return (
      <Surface elevated className="flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Map columns</p>
          <h2 className="mt-1 text-[17px] font-semibold text-[var(--text)]">Tell Draftpace what each column means.</h2>
          {parseErrorCount > 0 && <p className="mt-1 text-[12px] text-[var(--warning)]">{parseErrorCount} row(s) couldn&apos;t be parsed and were skipped.</p>}
        </div>
        {error && <Alert tone="danger">{error}</Alert>}

        <Select label="What are you importing?" value={targetType} onChange={(e) => setTargetType(e.target.value as CandidateType)}>
          <option value="thing">What's in your home</option>
          <option value="maintenanceTask">Care and upkeep</option>
          <option value="serviceProvider">People you use</option>
        </Select>

        <Select label="Name column" value={nameCol} onChange={(e) => setNameCol(e.target.value)}>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>

        {targetType === "thing" && (
          <>
            <Select label="Brand column (optional)" value={brandCol} onChange={(e) => setBrandCol(e.target.value)}>
              <option value="">None</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
            <Select label="Purchase date column (optional, YYYY-MM-DD)" value={purchaseDateCol} onChange={(e) => setPurchaseDateCol(e.target.value)}>
              <option value="">None</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
            <Select label="Warranty expires column (optional, YYYY-MM-DD)" value={warrantyCol} onChange={(e) => setWarrantyCol(e.target.value)}>
              <option value="">None</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </>
        )}

        {targetType === "maintenanceTask" && (
          <Select label="Repeats every (days) column" value={cadenceDaysCol} onChange={(e) => setCadenceDaysCol(e.target.value)}>
            <option value="">Choose a column</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
        )}

        {targetType === "serviceProvider" && (
          <div className="grid grid-cols-2 gap-3">
            <Select label="Phone column (optional)" value={phoneCol} onChange={(e) => setPhoneCol(e.target.value)}>
              <option value="">None</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
            <Select label="Email column (optional)" value={emailCol} onChange={(e) => setEmailCol(e.target.value)}>
              <option value="">None</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <p className="text-[12px] font-semibold text-[var(--text)]">Preview</p>
          <div className="mt-2 flex gap-2">
            <Badge tone="success">{readyCount} ready</Badge>
            {ambiguousCount > 0 && <Badge tone="warning">{ambiguousCount} need review</Badge>}
          </div>
          <ul className="mt-2 flex flex-col gap-1 text-[12px] text-[var(--muted)]">
            {mappedRows.slice(0, 5).map((r, i) => (
              <li key={i}>{"name" in r.candidate.payload ? r.candidate.payload.name || "(no name)" : ""}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" size="md" onClick={() => setStep("upload")}>
            Back
          </Button>
          <Button size="md" onClick={confirmImport} disabled={mappedRows.length === 0}>
            Import {mappedRows.length} {mappedRows.length === 1 ? "row" : "rows"}
          </Button>
        </div>
      </Surface>
    );
  }

  if (step === "confirming") {
    return (
      <Surface elevated className="flex flex-col gap-3">
        <p className="text-[14px] font-medium text-[var(--text)]">
          Importing {confirmProgress.done} of {confirmProgress.total}…
        </p>
      </Surface>
    );
  }

  return (
    <Surface elevated className="flex flex-col gap-4">
      <Alert tone="success">{confirmedCount} records imported.</Alert>
      {ambiguousCandidates.length > 0 && <Alert tone="warning">{ambiguousCandidates.length} rows need individual review before they can be confirmed.</Alert>}
      <Button size="md" onClick={() => onDone(ambiguousCandidates, sessionId ?? "")}>
        Continue
      </Button>
    </Surface>
  );
}
