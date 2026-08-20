"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import { formatCurrency, toMinorUnits } from "@/lib/currency";
import { describeResultError } from "@/product-framework/result";
import RecordFormSheet from "../shared/RecordFormSheet";
import { markMaintenanceTaskDone, skipMaintenanceTask } from "../../domain/maintenanceTasks";
import { createServiceProvider } from "../../domain/serviceProviders";
import { describeCareStatus } from "../../homeVoice";
import type { MaintenanceTask, ServiceProvider } from "../../state";

/**
 * Provisional, same convention Personal Finance Companion uses at its own
 * call sites while a currency setting does not exist yet. One constant to
 * change when Home Base grows a real one.
 */
export const HOME_BASE_CURRENCY = "USD";

/** "Me" and "someone new" are not providers, so they get sentinel values rather than polluting the provider list. */
const DID_IT_MYSELF = "self";
const SOMEONE_NEW = "new";

type Outcome = "done" | "skipped";

/**
 * What happened with a piece of care.
 *
 * This replaces a bare "mark done" button, which recorded a date and
 * threw away everything that made the event worth remembering. When a job
 * actually gets done there is a person who did it, sometimes a bill, and
 * usually something worth knowing next time. Capturing that at the moment
 * it happens is the only point at which the person actually knows it.
 *
 * Nothing here is required beyond the date. Someone who changed a filter
 * themselves on a Sunday taps once more and is finished.
 */
export default function CareActionSheet({
  open,
  task,
  instanceId,
  providers,
  onClose,
  onSaved,
}: {
  open: boolean;
  task: MaintenanceTask | null;
  instanceId: string | null;
  providers: ServiceProvider[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [outcome, setOutcome] = useState<Outcome>("done");
  const [performedAt, setPerformedAt] = useState(today);
  const [whoDidIt, setWhoDidIt] = useState<string>(DID_IT_MYSELF);
  const [newProviderName, setNewProviderName] = useState("");
  const [newProviderPhone, setNewProviderPhone] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setOutcome("done");
    setPerformedAt(today);
    setWhoDidIt(DID_IT_MYSELF);
    setNewProviderName("");
    setNewProviderPhone("");
    setCost("");
    setNotes("");
    setError(null);
  }, [open, task, today]);

  const activeProviders = providers.filter((p) => p.status !== "archived");

  async function handleSave() {
    if (!task || !instanceId) return;
    setError(null);

    if (outcome === "skipped") {
      setSaving(true);
      const result = await skipMaintenanceTask(task);
      setSaving(false);
      if (!result.ok) {
        setError(describeResultError(result.error));
        return;
      }
      onSaved();
      onClose();
      return;
    }

    if (!performedAt) {
      setError("When was it done?");
      return;
    }

    let costMinorUnits: number | null = null;
    if (cost.trim()) {
      const amount = Number(cost);
      if (!Number.isFinite(amount) || amount < 0) {
        setError("That cost doesn't look like a number.");
        return;
      }
      costMinorUnits = toMinorUnits(amount, HOME_BASE_CURRENCY);
    }

    setSaving(true);

    let providerId: string | null = null;
    if (whoDidIt === SOMEONE_NEW) {
      if (!newProviderName.trim()) {
        setSaving(false);
        setError("What's their name?");
        return;
      }
      const created = await createServiceProvider(instanceId, {
        name: newProviderName.trim(),
        category: null,
        phone: newProviderPhone.trim() || null,
        email: null,
        lastUsedAt: performedAt,
        notes: null,
        status: "active",
        source: "manual",
      });
      if (!created.ok) {
        setSaving(false);
        setError(describeResultError(created.error));
        return;
      }
      providerId = created.data.id;
    } else if (whoDidIt !== DID_IT_MYSELF) {
      providerId = whoDidIt;
    }

    const result = await markMaintenanceTaskDone(task, instanceId, {
      performedAt,
      providerId,
      costMinorUnits,
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

  if (!task) return null;

  const costPreview = cost.trim() && Number.isFinite(Number(cost)) && Number(cost) >= 0
    ? formatCurrency(toMinorUnits(Number(cost), HOME_BASE_CURRENCY), HOME_BASE_CURRENCY)
    : null;

  return (
    <RecordFormSheet
      open={open}
      onClose={onClose}
      title={task.name}
      description={describeCareStatus(task.lastDoneAt, task.cadenceDays, new Date())}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : outcome === "skipped" ? "Skip this round" : "Save"}
          </Button>
        </>
      }
    >
      <div>
        <p className="mb-1.5 text-[13px] font-semibold text-[var(--text)]">What happened?</p>
        <div className="flex gap-2">
          <OutcomeChoice label="I took care of it" selected={outcome === "done"} onSelect={() => setOutcome("done")} />
          <OutcomeChoice label="Skipping this round" selected={outcome === "skipped"} onSelect={() => setOutcome("skipped")} />
        </div>
      </div>

      {outcome === "skipped" ? (
        <p className="text-[13px] leading-relaxed text-[var(--muted)]">
          No problem. This moves to its next round and Home Base will bring it up again then, as though this one had passed
          normally.
        </p>
      ) : (
        <>
          <Input label="When" type="date" value={performedAt} max={today} onChange={(e) => setPerformedAt(e.target.value)} />

          <Select label="Who did it?" value={whoDidIt} onChange={(e) => setWhoDidIt(e.target.value)}>
            <option value={DID_IT_MYSELF}>I did it myself</option>
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
                onChange={(e) => setNewProviderName(e.target.value)}
                placeholder="e.g. Ace HVAC"
              />
              <Input
                label="Phone (optional)"
                value={newProviderPhone}
                onChange={(e) => setNewProviderPhone(e.target.value)}
                hint="Saved so next time is a lookup, not a search."
              />
            </div>
          )}

          <Input
            label="What it cost (optional)"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            hint={costPreview ? `Recorded as ${costPreview}` : undefined}
          />

          <Input
            label="Anything worth remembering? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Filter size 16x25x1, they said the belt is wearing"
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
