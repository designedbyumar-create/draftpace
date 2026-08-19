"use client";

import { useEffect, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import RecordFormSheet from "../shared/RecordFormSheet";
import type { ServiceProvider } from "../../state";

export interface ServiceProviderFormValues {
  name: string;
  category: string;
  phone: string;
  email: string;
  lastUsedAt: string;
  notes: string;
}

const EMPTY_VALUES: ServiceProviderFormValues = {
  name: "",
  category: "",
  phone: "",
  email: "",
  lastUsedAt: "",
  notes: "",
};

function providerToFormValues(provider: ServiceProvider): ServiceProviderFormValues {
  return {
    name: provider.name,
    category: provider.category ?? "",
    phone: provider.phone ?? "",
    email: provider.email ?? "",
    lastUsedAt: provider.lastUsedAt ?? "",
    notes: provider.notes ?? "",
  };
}

export function serviceProviderFormValuesToPatch(values: ServiceProviderFormValues): Record<string, unknown> {
  return {
    name: values.name.trim(),
    category: values.category.trim() || null,
    phone: values.phone.trim() || null,
    email: values.email.trim() || null,
    lastUsedAt: values.lastUsedAt || null,
    notes: values.notes.trim() || null,
    status: "active",
    source: "manual",
  };
}

export default function ServiceProviderFormSheet({
  open,
  provider,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  provider: ServiceProvider | null;
  onClose: () => void;
  onSave: (values: ServiceProviderFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<ServiceProviderFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(provider ? providerToFormValues(provider) : EMPTY_VALUES);
      setError(null);
    }
  }, [open, provider]);

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
      title={provider ? "Edit service provider" : "Add a service provider"}
      description="Who you'd call again, so you don't have to search for the number next time."
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
        placeholder="e.g. Joe's Plumbing"
        autoFocus
      />
      <Input
        label="Category (optional)"
        value={values.category}
        onChange={(event) => setValues({ ...values, category: event.target.value })}
        placeholder="e.g. Plumber"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Phone (optional)"
          value={values.phone}
          onChange={(event) => setValues({ ...values, phone: event.target.value })}
        />
        <Input
          label="Email (optional)"
          type="email"
          value={values.email}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
        />
      </div>
      <Input
        label="Last used (optional)"
        type="date"
        value={values.lastUsedAt}
        onChange={(event) => setValues({ ...values, lastUsedAt: event.target.value })}
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
