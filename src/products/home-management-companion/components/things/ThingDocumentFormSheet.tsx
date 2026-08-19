"use client";

import { useEffect, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import RecordFormSheet from "../shared/RecordFormSheet";
import { thingDocumentKindSchema } from "../../state";

export interface ThingDocumentFormValues {
  kind: string;
  label: string;
  documentLink: string;
  documentDate: string;
  notes: string;
}

const EMPTY_VALUES: ThingDocumentFormValues = {
  kind: "warranty",
  label: "",
  documentLink: "",
  documentDate: "",
  notes: "",
};

const KIND_LABEL: Record<string, string> = {
  warranty: "Warranty",
  receipt: "Receipt",
  manual: "Manual",
  other: "Other",
};

export function thingDocumentFormValuesToPatch(values: ThingDocumentFormValues): Record<string, unknown> | string {
  if (!values.documentLink.trim()) return "Paste a link to the document first.";
  return {
    kind: values.kind,
    label: values.label.trim() || null,
    documentLink: values.documentLink.trim(),
    documentDate: values.documentDate || null,
    notes: values.notes.trim() || null,
    status: "active",
    source: "manual",
  };
}

export default function ThingDocumentFormSheet({
  open,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: ThingDocumentFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<ThingDocumentFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(EMPTY_VALUES);
      setError(null);
    }
  }, [open]);

  async function handleSave() {
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
      title="Add a document"
      description="A warranty, receipt, or manual for this thing, linked from wherever it already lives."
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
      <Select label="Kind" value={values.kind} onChange={(event) => setValues({ ...values, kind: event.target.value })}>
        {thingDocumentKindSchema.options.map((kind) => (
          <option key={kind} value={kind}>
            {KIND_LABEL[kind]}
          </option>
        ))}
      </Select>
      <Input
        label="Label (optional)"
        value={values.label}
        onChange={(event) => setValues({ ...values, label: event.target.value })}
        placeholder="e.g. Extended warranty"
        autoFocus
      />
      <Input
        label="Link"
        value={values.documentLink}
        onChange={(event) => setValues({ ...values, documentLink: event.target.value })}
        placeholder="Paste a link from Drive, Dropbox, wherever it lives"
      />
      <Input
        label="Date (optional)"
        type="date"
        value={values.documentDate}
        onChange={(event) => setValues({ ...values, documentDate: event.target.value })}
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
