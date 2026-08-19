"use client";

import { useEffect, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import RecordFormSheet from "../shared/RecordFormSheet";
import type { MaintenanceTask, HomeItem } from "../../state";

export interface MaintenanceTaskFormValues {
  applianceId: string;
  name: string;
  cadenceDays: string;
  lastDoneAt: string;
  documentLink: string;
  notes: string;
}

function emptyValues(defaultApplianceId?: string): MaintenanceTaskFormValues {
  return {
    applianceId: defaultApplianceId ?? "",
    name: "",
    cadenceDays: "90",
    lastDoneAt: "",
    documentLink: "",
    notes: "",
  };
}

function taskToFormValues(task: MaintenanceTask): MaintenanceTaskFormValues {
  return {
    applianceId: task.applianceId ?? "",
    name: task.name,
    cadenceDays: String(task.cadenceDays),
    lastDoneAt: task.lastDoneAt ?? "",
    documentLink: task.documentLink ?? "",
    notes: task.notes ?? "",
  };
}

/** Form values (all strings) -> the patch shape the domain layer expects, or an error message if invalid. */
export function maintenanceTaskFormValuesToPatch(values: MaintenanceTaskFormValues): Record<string, unknown> | string {
  const cadence = Number(values.cadenceDays);
  if (!Number.isFinite(cadence) || cadence <= 0) return "Enter how often this repeats, in days.";
  return {
    applianceId: values.applianceId || null,
    name: values.name.trim(),
    cadenceDays: Math.round(cadence),
    lastDoneAt: values.lastDoneAt || null,
    documentLink: values.documentLink.trim() || null,
    notes: values.notes.trim() || null,
    status: "active",
    source: "manual",
  };
}

export default function MaintenanceTaskFormSheet({
  open,
  task,
  things,
  defaultApplianceId,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  task: MaintenanceTask | null;
  things: HomeItem[];
  defaultApplianceId?: string;
  onClose: () => void;
  onSave: (values: MaintenanceTaskFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<MaintenanceTaskFormValues>(emptyValues(defaultApplianceId));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(task ? taskToFormValues(task) : emptyValues(defaultApplianceId));
      setError(null);
    }
  }, [open, task, defaultApplianceId]);

  async function handleSave() {
    if (!values.name.trim()) {
      setError("Enter a name first.");
      return;
    }
    setSaving(true);
    const message = await onSave(values);
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    onClose();
  }

  return (
    <RecordFormSheet
      open={open}
      onClose={onClose}
      title={task ? "Edit maintenance task" : "Add a maintenance task"}
      description="A repeating job, like changing a filter, with how often it needs doing."
      triggerRef={triggerRef}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <Input
        label="Task"
        value={values.name}
        onChange={(event) => setValues({ ...values, name: event.target.value })}
        placeholder="e.g. Change HVAC filter"
        autoFocus
      />
      <Input
        label="Repeats every (days)"
        type="number"
        min={1}
        value={values.cadenceDays}
        onChange={(event) => setValues({ ...values, cadenceDays: event.target.value })}
      />
      <Select
        label="What's it for? (optional)"
        value={values.applianceId}
        onChange={(event) => setValues({ ...values, applianceId: event.target.value })}
      >
        <option value="">Not tied to anything in particular</option>
        {things.map((thing) => (
          <option key={thing.id} value={thing.id}>
            {thing.name}
          </option>
        ))}
      </Select>
      <Input
        label="Last done (optional)"
        type="date"
        value={values.lastDoneAt}
        onChange={(event) => setValues({ ...values, lastDoneAt: event.target.value })}
      />
      <Input
        label="Manual or instructions link (optional)"
        value={values.documentLink}
        onChange={(event) => setValues({ ...values, documentLink: event.target.value })}
      />
      <Input
        label="Notes (optional)"
        value={values.notes}
        onChange={(event) => setValues({ ...values, notes: event.target.value })}
      />
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
    </RecordFormSheet>
  );
}
