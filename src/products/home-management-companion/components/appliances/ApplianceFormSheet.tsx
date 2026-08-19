"use client";

import { useEffect, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import RecordFormSheet from "../shared/RecordFormSheet";
import type { Appliance } from "../../state";

export interface ApplianceFormValues {
  name: string;
  category: "appliance" | "system" | "other";
  brand: string;
  model: string;
  purchaseDate: string;
  installDate: string;
  warrantyExpiresAt: string;
  documentLink: string;
  notes: string;
}

const EMPTY_VALUES: ApplianceFormValues = {
  name: "",
  category: "appliance",
  brand: "",
  model: "",
  purchaseDate: "",
  installDate: "",
  warrantyExpiresAt: "",
  documentLink: "",
  notes: "",
};

function applianceToFormValues(appliance: Appliance): ApplianceFormValues {
  return {
    name: appliance.name,
    category: appliance.category,
    brand: appliance.brand ?? "",
    model: appliance.model ?? "",
    purchaseDate: appliance.purchaseDate ?? "",
    installDate: appliance.installDate ?? "",
    warrantyExpiresAt: appliance.warrantyExpiresAt ?? "",
    documentLink: appliance.documentLink ?? "",
    notes: appliance.notes ?? "",
  };
}

/** Form values (all strings, form-friendly) -> the patch shape the domain layer expects. */
export function applianceFormValuesToPatch(values: ApplianceFormValues): Record<string, unknown> {
  return {
    name: values.name.trim(),
    category: values.category,
    brand: values.brand.trim() || null,
    model: values.model.trim() || null,
    purchaseDate: values.purchaseDate || null,
    installDate: values.installDate || null,
    warrantyExpiresAt: values.warrantyExpiresAt || null,
    documentLink: values.documentLink.trim() || null,
    notes: values.notes.trim() || null,
    status: "active",
    source: "manual",
  };
}

export default function ApplianceFormSheet({
  open,
  appliance,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  appliance: Appliance | null;
  onClose: () => void;
  onSave: (values: ApplianceFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<ApplianceFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(appliance ? applianceToFormValues(appliance) : EMPTY_VALUES);
      setError(null);
    }
  }, [open, appliance]);

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
      title={appliance ? "Edit appliance" : "Add an appliance"}
      description="Whatever's in it is what shows up in your maintenance and warranty picture. Dates are optional."
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
        label="Name"
        value={values.name}
        onChange={(event) => setValues({ ...values, name: event.target.value })}
        placeholder="e.g. Water heater"
        autoFocus
      />
      <Select
        label="Category"
        value={values.category}
        onChange={(event) => setValues({ ...values, category: event.target.value as ApplianceFormValues["category"] })}
      >
        <option value="appliance">Appliance</option>
        <option value="system">Home system</option>
        <option value="other">Other</option>
      </Select>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Brand (optional)"
          value={values.brand}
          onChange={(event) => setValues({ ...values, brand: event.target.value })}
        />
        <Input
          label="Model (optional)"
          value={values.model}
          onChange={(event) => setValues({ ...values, model: event.target.value })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Purchase date (optional)"
          type="date"
          value={values.purchaseDate}
          onChange={(event) => setValues({ ...values, purchaseDate: event.target.value })}
        />
        <Input
          label="Install date (optional)"
          type="date"
          value={values.installDate}
          onChange={(event) => setValues({ ...values, installDate: event.target.value })}
        />
      </div>
      <Input
        label="Warranty expires (optional)"
        type="date"
        value={values.warrantyExpiresAt}
        onChange={(event) => setValues({ ...values, warrantyExpiresAt: event.target.value })}
      />
      <Input
        label="Manual or receipt link (optional)"
        value={values.documentLink}
        onChange={(event) => setValues({ ...values, documentLink: event.target.value })}
        placeholder="Paste a link from Drive, Dropbox, wherever it lives"
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
