"use client";

import { useState } from "react";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Alert from "@/design-system/Alert";
import { fromMinorUnits } from "@/lib/currency";
import { describeResultError } from "@/product-framework/result";
import { summarizeCandidate, CANDIDATE_TYPE_LABEL } from "../../../import/candidateSummary";
import { detectDuplicate, type ComparableRecord } from "../../../import/duplicateDetection";
import { confirmCandidate, skipCandidate } from "../../../domain/confirmCandidate";
import type { CandidatePayload, ExtractionCandidate } from "../../../import/types";
import type { FinancialPictureInputs } from "../../../companion/capability";

/** Existing-record lookups for duplicate detection — built once per render from the already-loaded financial picture, never a separate query. */
function comparableRecordsFor(candidateType: ExtractionCandidate["candidateType"], records: FinancialPictureInputs): ComparableRecord[] {
  switch (candidateType) {
    case "account":
      return records.accounts.filter((a) => a.status !== "archived").map((a) => ({ id: a.id, name: a.name, amountMajorUnits: fromMinorUnits(a.currentBalanceMinorUnits, a.currency) }));
    case "income":
      return records.incomeSources
        .filter((s) => s.status !== "archived")
        .map((s) => ({ id: s.id, name: s.name, amountMajorUnits: s.amountMinorUnits !== null ? fromMinorUnits(s.amountMinorUnits, s.currency) : null }));
    case "bill":
      return records.bills
        .filter((b) => b.status !== "archived")
        .map((b) => ({ id: b.id, name: b.name, amountMajorUnits: b.amountMinorUnits !== null ? fromMinorUnits(b.amountMinorUnits, b.currency) : null }));
    case "subscription":
      return records.subscriptions
        .filter((s) => s.status !== "archived")
        .map((s) => ({ id: s.id, name: s.name, amountMajorUnits: s.amountMinorUnits !== null ? fromMinorUnits(s.amountMinorUnits, s.currency) : null }));
    case "debt":
      return records.debts.filter((d) => d.status !== "archived").map((d) => ({ id: d.id, name: d.name, amountMajorUnits: fromMinorUnits(d.balanceMinorUnits, d.currency) }));
    case "savingsGoal":
      return records.savingsGoals.filter((g) => g.status !== "archived").map((g) => ({ id: g.id, name: g.name, amountMajorUnits: fromMinorUnits(g.targetAmountMinorUnits, g.currency) }));
    default:
      return [];
  }
}

function candidateName(payload: CandidatePayload): string | null {
  if ("name" in payload) return payload.name;
  if ("description" in payload) return payload.description;
  return null;
}

function candidatePrimaryAmount(payload: CandidatePayload): number | null {
  if ("balanceMajorUnits" in payload && payload.balanceMajorUnits !== undefined) return payload.balanceMajorUnits;
  if ("amountMajorUnits" in payload && payload.amountMajorUnits !== undefined) return payload.amountMajorUnits;
  if ("targetAmountMajorUnits" in payload && payload.targetAmountMajorUnits !== undefined) return payload.targetAmountMajorUnits;
  return null;
}

export default function CandidateReviewQueue({
  instanceId,
  candidates,
  records,
  source,
  accountId,
  onCandidateResolved,
  onDone,
}: {
  instanceId: string;
  candidates: ExtractionCandidate[];
  records: FinancialPictureInputs;
  source: "pastedNotes" | "textFile" | "csvImport";
  /** Required to confirm any transaction-type candidate (e.g. ambiguous CSV rows) — chosen once during CSV mapping, not derivable from the candidate itself. */
  accountId?: string;
  onCandidateResolved: (candidateId: string, result: { recordType: string; recordId: string } | "skipped") => void;
  onDone: () => void;
}) {
  const pending = candidates.filter((c) => c.reviewStatus === "unreviewed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; amount: string }>({ name: "", amount: "" });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkConfirming, setBulkConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = pending.reduce<Record<string, number>>((acc, c) => {
    if (c.candidateType === "unsupported") return acc;
    acc[c.candidateType] = (acc[c.candidateType] ?? 0) + 1;
    return acc;
  }, {});

  // Exception-first: only a candidate that's unrecognized, ambiguous, low/
  // medium confidence, missing a field, or a possible duplicate needs a
  // human decision per item. Everything else is clean enough to confirm in
  // bulk — reviewing 20 identical high-confidence transactions one at a
  // time would just teach people to stop reading them.
  const analyzed = pending.map((candidate) => {
    const isUnsupported = candidate.candidateType === "unsupported";
    const name = candidateName(candidate.payload);
    const amount = candidatePrimaryAmount(candidate.payload);
    const duplicate = !isUnsupported && name ? detectDuplicate(name, amount, comparableRecordsFor(candidate.candidateType, records)) : null;
    const needsAttention =
      isUnsupported ||
      candidate.confidence !== "high" ||
      candidate.missingFields.length > 0 ||
      candidate.ambiguityNotes.length > 0 ||
      duplicate !== null;
    return { candidate, isUnsupported, name, amount, duplicate, needsAttention };
  });
  const needsAttention = analyzed.filter((a) => a.needsAttention);
  const looksRight = analyzed.filter((a) => !a.needsAttention);

  async function handleConfirm(candidate: ExtractionCandidate, overridePayload?: CandidatePayload) {
    setError(null);
    setBusyId(candidate.id);
    const result = await confirmCandidate({ instanceId, candidate, payload: overridePayload, source, accountId });
    setBusyId(null);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    setEditingId(null);
    onCandidateResolved(candidate.id, result.data);
  }

  async function handleConfirmAllLooksRight() {
    setError(null);
    setBulkConfirming(true);
    for (const { candidate } of looksRight) {
      const result = await confirmCandidate({ instanceId, candidate, source, accountId });
      if (!result.ok) {
        setError(`Stopped after a save failed: ${describeResultError(result.error)}`);
        setBulkConfirming(false);
        return;
      }
      onCandidateResolved(candidate.id, result.data);
    }
    setBulkConfirming(false);
  }

  async function handleSkip(candidate: ExtractionCandidate) {
    setBusyId(candidate.id);
    const result = await skipCandidate(candidate);
    setBusyId(null);
    if (result.ok) onCandidateResolved(candidate.id, "skipped");
  }

  function startEdit(candidate: ExtractionCandidate) {
    setEditingId(candidate.id);
    setEditValues({
      name: candidateName(candidate.payload) ?? "",
      amount: candidatePrimaryAmount(candidate.payload)?.toString() ?? "",
    });
  }

  function confirmEdit(candidate: ExtractionCandidate) {
    const payload = { ...candidate.payload } as Record<string, unknown>;
    if ("name" in payload) payload.name = editValues.name;
    if ("description" in payload) payload.description = editValues.name;
    const amount = editValues.amount.trim() === "" ? undefined : Number(editValues.amount);
    if ("balanceMajorUnits" in candidate.payload) payload.balanceMajorUnits = amount;
    else if ("amountMajorUnits" in candidate.payload) payload.amountMajorUnits = amount;
    else if ("targetAmountMajorUnits" in candidate.payload) payload.targetAmountMajorUnits = amount;
    handleConfirm(candidate, payload as unknown as CandidatePayload);
  }

  if (pending.length === 0) {
    return (
      <Surface elevated className="flex flex-col gap-4">
        <p className="text-[15px] font-semibold text-[var(--text)]">All caught up.</p>
        <p className="text-[13px] text-[var(--muted)]">Every candidate from this import has been reviewed.</p>
        <Button size="md" onClick={onDone}>
          Continue
        </Button>
      </Surface>
    );
  }

  return (
    <Surface elevated className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Review</p>
        <h2 className="mt-1 text-[17px] font-semibold text-[var(--text)]">
          Draftpace found {pending.length} possible {pending.length === 1 ? "record" : "records"}.
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Object.entries(counts).map(([type, count]) => (
            <Badge key={type} tone="neutral">
              {CANDIDATE_TYPE_LABEL[type as ExtractionCandidate["candidateType"]]} {count}
            </Badge>
          ))}
        </div>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      {needsAttention.length > 0 && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">
            Needs a look ({needsAttention.length})
          </p>
          <ul className="mt-2 flex flex-col gap-3">
        {needsAttention.map(({ candidate, isUnsupported, duplicate }) => {
          const summary = summarizeCandidate(candidate);
          const isEditing = editingId === candidate.id;
          const isBusy = busyId === candidate.id;

          return (
            <li key={candidate.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">
                {isUnsupported ? "Not recognized" : `Possible ${CANDIDATE_TYPE_LABEL[candidate.candidateType]}`}
              </p>

              {isEditing ? (
                <div className="mt-2 flex flex-col gap-2.5">
                  <Input label="Name" value={editValues.name} onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))} />
                  <Input
                    label="Amount"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={editValues.amount}
                    onChange={(e) => setEditValues((v) => ({ ...v, amount: e.target.value }))}
                  />
                </div>
              ) : (
                <>
                  <p className="mt-1 text-[15px] font-semibold text-[var(--text)]">{summary.title}</p>
                  <ul className="mt-0.5 flex flex-col text-[13px] text-[var(--muted)]">
                    {summary.lines.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </>
              )}

              {candidate.ambiguityNotes.length > 0 && !isEditing && (
                <div className="mt-2 flex flex-col gap-1">
                  {candidate.ambiguityNotes.map((note, i) => (
                    <p key={i} className="text-[12px] text-[var(--warning)]">
                      {note}
                    </p>
                  ))}
                </div>
              )}

              {!isEditing && (
                <p className="mt-2 text-[11px] italic text-[var(--faint)]">Based on: &ldquo;{candidate.sourceReference}&rdquo;</p>
              )}

              {duplicate && !isEditing && (
                <div className="mt-2">
                  <Alert tone="warning">
                    This may already exist: {duplicate.existingRecordName} ({duplicate.status === "exactDuplicate" ? "same amount" : "similar"}).
                  </Alert>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)} disabled={isBusy}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => confirmEdit(candidate)} disabled={isBusy}>
                      {isBusy ? "Saving…" : "Confirm"}
                    </Button>
                  </>
                ) : isUnsupported ? (
                  <Button size="sm" variant="ghost" onClick={() => handleSkip(candidate)} disabled={isBusy}>
                    Dismiss
                  </Button>
                ) : (
                  <>
                    <Button size="sm" onClick={() => handleConfirm(candidate)} disabled={isBusy}>
                      {isBusy ? "Saving…" : `Confirm ${CANDIDATE_TYPE_LABEL[candidate.candidateType]}`}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => startEdit(candidate)} disabled={isBusy}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleSkip(candidate)} disabled={isBusy}>
                      Skip
                    </Button>
                  </>
                )}
              </div>
            </li>
          );
        })}
          </ul>
        </div>
      )}

      {looksRight.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">
              Looks right ({looksRight.length})
            </p>
            <Button size="sm" variant="secondary" onClick={handleConfirmAllLooksRight} disabled={bulkConfirming || busyId !== null}>
              {bulkConfirming ? "Confirming…" : `Confirm all ${looksRight.length}`}
            </Button>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {looksRight.map(({ candidate }) => {
              const summary = summarizeCandidate(candidate);
              const isEditing = editingId === candidate.id;
              const isBusy = busyId === candidate.id;

              if (isEditing) {
                return (
                  <li key={candidate.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">
                      Possible {CANDIDATE_TYPE_LABEL[candidate.candidateType]}
                    </p>
                    <div className="mt-2 flex flex-col gap-2.5">
                      <Input label="Name" value={editValues.name} onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))} />
                      <Input
                        label="Amount"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={editValues.amount}
                        onChange={(e) => setEditValues((v) => ({ ...v, amount: e.target.value }))}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(null)} disabled={isBusy}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => confirmEdit(candidate)} disabled={isBusy}>
                        {isBusy ? "Saving…" : "Confirm"}
                      </Button>
                    </div>
                  </li>
                );
              }

              return (
                <li
                  key={candidate.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-[var(--text)]">{summary.title}</p>
                    <p className="truncate text-[12px] text-[var(--muted)]">{summary.lines.join(" · ")}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button size="sm" onClick={() => handleConfirm(candidate)} disabled={isBusy || bulkConfirming}>
                      {isBusy ? "Saving…" : "Confirm"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(candidate)} disabled={isBusy || bulkConfirming}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleSkip(candidate)} disabled={isBusy || bulkConfirming}>
                      Skip
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Surface>
  );
}
