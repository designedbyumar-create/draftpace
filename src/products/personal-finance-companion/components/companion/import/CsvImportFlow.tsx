"use client";

import { useMemo, useRef, useState } from "react";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Select from "@/design-system/Select";
import Alert from "@/design-system/Alert";
import Badge from "@/design-system/Badge";
import { parseCsv, parseCsvMoneyToMinorUnits, looksLikeFormulaInjection } from "../../../import/csvParse";
import { fromMinorUnits } from "@/lib/currency";
import { createImportSession } from "../../../domain/importSessions";
import { createExtractionCandidates } from "../../../domain/extractionCandidates";
import { confirmCandidate } from "../../../domain/confirmCandidate";
import { describeResultError } from "@/product-framework/result";
import type { Account, Transaction } from "../../../state";
import type { CandidateDraft, TransactionCandidatePayload } from "../../../import/types";
import type { ExtractionCandidate } from "../../../import/types";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

type AmountMode = "single" | "debitCredit";
type Step = "upload" | "map" | "confirming" | "done";

interface RowResult {
  row: string[];
  candidate: CandidateDraft;
  ambiguous: boolean;
}

function isPossibleDuplicate(candidate: TransactionCandidatePayload, existing: Transaction[]): boolean {
  if (candidate.amountMajorUnits === undefined || !candidate.occurredOn) return false;
  return existing.some(
    (t) =>
      t.occurredOn === candidate.occurredOn &&
      Math.abs(fromMinorUnits(t.amountMinorUnits, t.currency) - candidate.amountMajorUnits!) < 0.01 &&
      t.description.trim().toLowerCase() === candidate.description.trim().toLowerCase()
  );
}

export default function CsvImportFlow({
  instanceId,
  accounts,
  existingTransactions,
  onDone,
  onBack,
}: {
  instanceId: string;
  accounts: Account[];
  existingTransactions: Transaction[];
  onDone: (ambiguousCandidates: ExtractionCandidate[], accountId: string) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [parseErrorCount, setParseErrorCount] = useState(0);

  const [dateCol, setDateCol] = useState("");
  const [descriptionCol, setDescriptionCol] = useState("");
  const [amountMode, setAmountMode] = useState<AmountMode>("single");
  const [amountCol, setAmountCol] = useState("");
  const [debitCol, setDebitCol] = useState("");
  const [creditCol, setCreditCol] = useState("");
  const [categoryCol, setCategoryCol] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");

  const [confirmProgress, setConfirmProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [ambiguousCandidates, setAmbiguousCandidates] = useState<ExtractionCandidate[]>([]);
  const [confirmedCount, setConfirmedCount] = useState(0);

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
        setDateCol(result.headers.find((h) => /date/i.test(h)) ?? result.headers[0]);
        setDescriptionCol(result.headers.find((h) => /desc|narration|memo/i.test(h)) ?? result.headers[1] ?? result.headers[0]);
        setAmountCol(result.headers.find((h) => /amount/i.test(h)) ?? "");
        setDebitCol(result.headers.find((h) => /debit/i.test(h)) ?? "");
        setCreditCol(result.headers.find((h) => /credit/i.test(h)) ?? "");
        setCategoryCol(result.headers.find((h) => /categor/i.test(h)) ?? "");
        setStep("map");
      })
      .catch(() => setError("Couldn't read this file."));
  }

  const mappedRows: RowResult[] = useMemo(() => {
    if (step !== "map") return [];
    const dateIdx = headers.indexOf(dateCol);
    const descIdx = headers.indexOf(descriptionCol);
    const amountIdx = headers.indexOf(amountCol);
    const debitIdx = headers.indexOf(debitCol);
    const creditIdx = headers.indexOf(creditCol);
    const categoryIdx = headers.indexOf(categoryCol);

    return rows.map((row) => {
      const description = descIdx >= 0 ? row[descIdx] : "";
      const occurredOn = dateIdx >= 0 ? row[dateIdx] : "";
      const category = categoryIdx >= 0 ? row[categoryIdx] || undefined : undefined;

      let amountMajorUnits: number | undefined;
      let direction: "debit" | "credit" | undefined;
      const missingFields: string[] = [];

      if (amountMode === "single" && amountIdx >= 0) {
        const minor = parseCsvMoneyToMinorUnits(row[amountIdx]);
        if (minor !== null) {
          amountMajorUnits = Math.abs(minor) / 100;
          direction = minor < 0 ? "debit" : "credit";
        }
      } else if (amountMode === "debitCredit") {
        const debitMinor = debitIdx >= 0 ? parseCsvMoneyToMinorUnits(row[debitIdx]) : null;
        const creditMinor = creditIdx >= 0 ? parseCsvMoneyToMinorUnits(row[creditIdx]) : null;
        if (debitMinor !== null && debitMinor !== 0) {
          amountMajorUnits = Math.abs(debitMinor) / 100;
          direction = "debit";
        } else if (creditMinor !== null && creditMinor !== 0) {
          amountMajorUnits = Math.abs(creditMinor) / 100;
          direction = "credit";
        }
      }

      if (amountMajorUnits === undefined) missingFields.push("amountMinorUnits");
      if (!occurredOn) missingFields.push("occurredOn");
      if (!description) missingFields.push("description");

      const payload: TransactionCandidatePayload = { description: description || "(no description)", amountMajorUnits, direction, occurredOn: occurredOn || undefined, category };
      const duplicate = isPossibleDuplicate(payload, existingTransactions);
      const formulaRisk = looksLikeFormulaInjection(description);

      const candidate: CandidateDraft = {
        candidateType: "transaction",
        payload,
        confidence: missingFields.length === 0 ? "high" : "low",
        missingFields,
        ambiguityNotes: [
          ...(duplicate ? ["A transaction with this exact date, amount, and description already exists."] : []),
          ...(formulaRisk ? ["This description starts with a character spreadsheets treat as a formula. Shown as plain text here."] : []),
        ],
        sourceReference: row.join(", "),
      };

      return { row, candidate, ambiguous: missingFields.length > 0 || duplicate };
    });
  }, [step, rows, headers, dateCol, descriptionCol, amountMode, amountCol, debitCol, creditCol, categoryCol, existingTransactions]);

  const readyCount = mappedRows.filter((r) => !r.ambiguous).length;
  const ambiguousCount = mappedRows.length - readyCount;

  async function confirmImport() {
    if (!accountId) {
      setError("Choose an account first.");
      return;
    }
    setError(null);
    setStep("confirming");

    const sessionResult = await createImportSession(instanceId, { inputType: "csv", fileOriginalName: fileName ?? undefined, fileSizeBytes: fileSize, fileMimeType: "text/csv" });
    if (!sessionResult.ok) {
      setError(describeResultError(sessionResult.error));
      setStep("map");
      return;
    }

    const candidatesResult = await createExtractionCandidates(
      instanceId,
      sessionResult.data.id,
      mappedRows.map((r) => ({ ...r.candidate, duplicateStatus: r.candidate.ambiguityNotes.some((n) => n.includes("already exists")) ? "possibleDuplicate" : "none" }))
    );
    if (!candidatesResult.ok) {
      setError(describeResultError(candidatesResult.error));
      setStep("map");
      return;
    }

    const readyCandidates = candidatesResult.data.filter((_, i) => !mappedRows[i].ambiguous);
    const stillAmbiguous = candidatesResult.data.filter((_, i) => mappedRows[i].ambiguous);

    setConfirmProgress({ done: 0, total: readyCandidates.length });
    let succeeded = 0;
    for (const candidate of readyCandidates) {
      const result = await confirmCandidate({ instanceId, candidate, accountId, source: "csvImport" });
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
          <h2 className="mt-1 text-[17px] font-semibold text-[var(--text)]">Upload a transaction export.</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">
            Works with most bank/card CSV exports. You&apos;ll map the columns yourself on the next screen, since formats vary.
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

        <Select label="Account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>

        <Select label="Date column" value={dateCol} onChange={(e) => setDateCol(e.target.value)}>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>
        <Select label="Description column" value={descriptionCol} onChange={(e) => setDescriptionCol(e.target.value)}>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>
        <Select label="Amount format" value={amountMode} onChange={(e) => setAmountMode(e.target.value as AmountMode)}>
          <option value="single">One Amount column (negative = spending)</option>
          <option value="debitCredit">Separate Debit / Credit columns</option>
        </Select>
        {amountMode === "single" ? (
          <Select label="Amount column" value={amountCol} onChange={(e) => setAmountCol(e.target.value)}>
            <option value="">Choose a column</option>
            {headers.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Select label="Debit column" value={debitCol} onChange={(e) => setDebitCol(e.target.value)}>
              <option value="">None</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
            <Select label="Credit column" value={creditCol} onChange={(e) => setCreditCol(e.target.value)}>
              <option value="">None</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </div>
        )}
        <Select label="Category column (optional)" value={categoryCol} onChange={(e) => setCategoryCol(e.target.value)}>
          <option value="">None</option>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <p className="text-[12px] font-semibold text-[var(--text)]">Preview</p>
          <div className="mt-2 flex gap-2">
            <Badge tone="success">{readyCount} ready</Badge>
            {ambiguousCount > 0 && <Badge tone="warning">{ambiguousCount} need review</Badge>}
          </div>
          <ul className="mt-2 flex flex-col gap-1 text-[12px] text-[var(--muted)]">
            {mappedRows.slice(0, 5).map((r, i) => (
              <li key={i}>
                {r.candidate.payload && "description" in r.candidate.payload ? r.candidate.payload.description : ""} ·{" "}
                {"amountMajorUnits" in r.candidate.payload && r.candidate.payload.amountMajorUnits !== undefined
                  ? `$${r.candidate.payload.amountMajorUnits.toFixed(2)}`
                  : "no amount"}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button variant="secondary" size="md" onClick={() => setStep("upload")}>
            Back
          </Button>
          <Button size="md" onClick={confirmImport}>
            Import {mappedRows.length} {mappedRows.length === 1 ? "transaction" : "transactions"}
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
      <Alert tone="success">{confirmedCount} transactions imported.</Alert>
      {ambiguousCandidates.length > 0 && (
        <Alert tone="warning">{ambiguousCandidates.length} rows need individual review before they can be confirmed.</Alert>
      )}
      <Button size="md" onClick={() => onDone(ambiguousCandidates, accountId)}>
        Continue
      </Button>
    </Surface>
  );
}
