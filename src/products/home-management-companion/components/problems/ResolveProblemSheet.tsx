"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import { formatCurrency, toMinorUnits } from "@/lib/currency";
import { describeResultError } from "@/product-framework/result";
import RecordFormSheet from "../shared/RecordFormSheet";
import { resolveProblem, scheduleProblem } from "../../domain/problems";
import { createServiceProvider } from "../../domain/serviceProviders";
import { HOME_BASE_CURRENCY } from "../care/CareActionSheet";
import type { Problem, ServiceProvider } from "../../state";

const DID_IT_MYSELF = "self";
const SOMEONE_NEW = "new";

type Outcome = "sorted" | "booked";

/**
 * What happened with a problem.
 *
 * Same shape as the care action sheet on purpose: "somebody fixed
 * something" is one idea, and it should not feel like two different
 * products depending on whether the thing was scheduled or broke
 * unexpectedly.
 *
 * Two outcomes only. Sorted writes the fix into the home's memory and
 * closes it. Booked records that somebody is coming, which is the one
 * piece of middle state that genuinely helps: it stops the product
 * asking about something already in hand. There is deliberately no
 * further workflow, no stages and no assignment. The goal is helping
 * somebody deal with a problem, not running a repair project.
 */
export default function ResolveProblemSheet({
  open,
  problem,
  instanceId,
  providers,
  onClose,
  onSaved,
}: {
  open: boolean;
  problem: Problem | null;
  instanceId: string | null;
  providers: ServiceProvider[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [outcome, setOutcome] = useState<Outcome>("sorted");
  const [when, setWhen] = useState(today);
  const [whoDidIt, setWhoDidIt] = useState<string>(DID_IT_MYSELF);
  const [newProviderName, setNewProviderName] = useState("");
  const [newProviderPhone, setNewProviderPhone] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProviders = providers.filter((p) => p.status !== "archived");

  useEffect(() => {
    if (!open) return;
    setOutcome("sorted");
    setWhen(today);
    setWhoDidIt(DID_IT_MYSELF);
    setNewProviderName("");
    setNewProviderPhone("");
    setCost("");
    setNotes("");
    setError(null);
  }, [open, problem, today]);

  async function resolveProviderId(): Promise<string | null | "failed"> {
    if (whoDidIt === DID_IT_MYSELF) return null;
    if (whoDidIt !== SOMEONE_NEW) return whoDidIt;
    if (!newProviderName.trim()) {
      setError("What's their name?");
      return "failed";
    }
    const created = await createServiceProvider(instanceId as string, {
      name: newProviderName.trim(),
      category: null,
      phone: newProviderPhone.trim() || null,
      email: null,
      lastUsedAt: when,
      notes: null,
      status: "active",
      source: "manual",
    });
    if (!created.ok) {
      setError(describeResultError(created.error));
      return "failed";
    }
    return created.data.id;
  }

  async function handleSave() {
    if (!problem || !instanceId) return;
    setError(null);

    let costMinorUnits: number | null = null;
    if (outcome === "sorted" && cost.trim()) {
      const amount = Number(cost);
      if (!Number.isFinite(amount) || amount < 0) {
        setError("That cost doesn't look like a number.");
        return;
      }
      costMinorUnits = toMinorUnits(amount, HOME_BASE_CURRENCY);
    }

    setSaving(true);
    const providerId = await resolveProviderId();
    if (providerId === "failed") {
      setSaving(false);
      return;
    }

    const result =
      outcome === "booked"
        ? await scheduleProblem(problem, when, providerId ?? undefined)
        : await resolveProblem(problem, instanceId, {
            resolvedAt: when,
            providerId,
            actualCostMinorUnits: costMinorUnits,
            notes: notes.trim() || null,
          });

    setSaving(false);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    onSaved();
    onClose();
  }

  if (!problem) return null;

  const costPreview =
    cost.trim() && Number.isFinite(Number(cost)) && Number(cost) >= 0
      ? formatCurrency(toMinorUnits(Number(cost), HOME_BASE_CURRENCY), HOME_BASE_CURRENCY)
      : null;

  return (
    <RecordFormSheet
      open={open}
      onClose={onClose}
      title={problem.title}
      description="Tell Home Base how this ended, and it will remember for you."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : outcome === "booked" ? "Save" : "Save"}
          </Button>
        </>
      }
    >
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-[var(--text)]">What happened?</p>
        <div className="flex gap-2">
          <OutcomeChoice label="It's sorted" selected={outcome === "sorted"} onSelect={() => setOutcome("sorted")} />
          <OutcomeChoice label="Someone's coming" selected={outcome === "booked"} onSelect={() => setOutcome("booked")} />
        </div>
      </div>

      <Input
        label={outcome === "booked" ? "When are they coming?" : "When"}
        type="date"
        value={when}
        max={outcome === "booked" ? undefined : today}
        onChange={(event) => setWhen(event.target.value)}
      />

      <Select label={outcome === "booked" ? "Who's coming?" : "Who sorted it?"} value={whoDidIt} onChange={(event) => setWhoDidIt(event.target.value)}>
        <option value={DID_IT_MYSELF}>{outcome === "booked" ? "Not decided yet" : "I did it myself"}</option>
        {activeProviders.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
        <option value={SOMEONE_NEW}>Someone new…</option>
      </Select>

      {whoDidIt === SOMEONE_NEW && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Their name"
            value={newProviderName}
            onChange={(event) => setNewProviderName(event.target.value)}
            placeholder="e.g. Ace Plumbing"
          />
          <Input
            label="Phone (optional)"
            value={newProviderPhone}
            onChange={(event) => setNewProviderPhone(event.target.value)}
            hint="Saved so next time is a lookup, not a search."
          />
        </div>
      )}

      {outcome === "sorted" && (
        <>
          <Input
            label="What it cost (optional)"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            placeholder="0.00"
            hint={costPreview ? `Recorded as ${costPreview}` : undefined}
          />
          <Input
            label="Anything worth remembering? (optional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="e.g. Replaced the opener spring, said the other one is next"
          />
        </>
      )}

      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
    </RecordFormSheet>
  );
}

function OutcomeChoice({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex-1 rounded-lg border px-3 py-2.5 text-[13px] font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] ${
        selected
          ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
          : "border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--text)]"
      }`}
    >
      {label}
    </button>
  );
}
