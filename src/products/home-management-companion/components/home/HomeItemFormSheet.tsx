"use client";

import { useEffect, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import RecordFormSheet from "../shared/RecordFormSheet";
import { describeResultError } from "@/product-framework/result";
import { HOME_ITEM_TYPES, matchHomeItemType } from "../../homeKnowledge";
import { describeCadence, withArticle } from "../../homeVoice";
import { createMaintenanceTask } from "../../domain/maintenanceTasks";
import type { HomeItem } from "../../state";

export interface HomeItemFormValues {
  name: string;
  type: string;
  customType: string;
  brand: string;
  model: string;
  location: string;
  purchaseDate: string;
  installDate: string;
  warrantyExpiresAt: string;
  documentLink: string;
  notes: string;
}

const EMPTY_VALUES: HomeItemFormValues = {
  name: "",
  type: "other",
  customType: "",
  brand: "",
  model: "",
  location: "",
  purchaseDate: "",
  installDate: "",
  warrantyExpiresAt: "",
  documentLink: "",
  notes: "",
};

function thingToFormValues(item: HomeItem): HomeItemFormValues {
  const known = HOME_ITEM_TYPES.some((t) => t.id === item.type);
  return {
    name: item.name,
    type: known ? item.type : "other",
    customType: known ? "" : item.type,
    brand: item.brand ?? "",
    model: item.model ?? "",
    location: item.location ?? "",
    purchaseDate: item.purchaseDate ?? "",
    installDate: item.installDate ?? "",
    warrantyExpiresAt: item.warrantyExpiresAt ?? "",
    documentLink: item.documentLink ?? "",
    notes: item.notes ?? "",
  };
}

/** Lowercase, hyphenated, always starts with a letter, satisfies thingSchema's open-type regex even from arbitrary input. */
function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return "other";
  return /^[a-z]/.test(slug) ? slug : `t-${slug}`;
}

/**
 * Form values -> the patch shape the domain layer expects.
 *
 * When someone leaves the type alone but names the item recognisably
 * ("Basement water heater"), the curated match wins over a slug made
 * from their words. Without this the record stores
 * "basement-water-heater", which matches nothing in homeKnowledge.ts, so
 * the product would propose that item's care once at creation and then
 * never know what it was again.
 */
export function homeItemFormValuesToPatch(values: HomeItemFormValues): Record<string, unknown> {
  const recognised = values.type === "other" && !values.customType.trim() ? matchHomeItemType(values.name, "") : null;
  const type = recognised ? recognised.id : values.type === "other" ? slugify(values.customType || values.name) : values.type;
  return {
    name: values.name.trim(),
    type,
    brand: values.brand.trim() || null,
    model: values.model.trim() || null,
    location: values.location.trim() || null,
    purchaseDate: values.purchaseDate || null,
    installDate: values.installDate || null,
    warrantyExpiresAt: values.warrantyExpiresAt || null,
    documentLink: values.documentLink.trim() || null,
    notes: values.notes.trim() || null,
    status: "active",
    source: "manual",
  };
}

type SaveResult = { ok: true; item: HomeItem } | { ok: false; message: string };

export default function HomeItemFormSheet({
  open,
  item,
  instanceId,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  item: HomeItem | null;
  instanceId: string | null;
  onClose: () => void;
  onSave: (values: HomeItemFormValues) => Promise<SaveResult>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<HomeItemFormValues>(EMPTY_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"form" | "suggestions">("form");
  const [createdItem, setCreatedThing] = useState<HomeItem | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set());
  const [addingTasks, setAddingTasks] = useState(false);

  const suggestion = createdItem ? matchHomeItemType(createdItem.name, createdItem.type) : null;

  useEffect(() => {
    if (open) {
      setValues(item ? thingToFormValues(item) : EMPTY_VALUES);
      setError(null);
      setStep("form");
      setCreatedThing(null);
    }
  }, [open, item]);

  async function handleSave() {
    if (!values.name.trim()) {
      setError("Enter a name first.");
      return;
    }
    setSaving(true);
    const result = await onSave(values);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (item) {
      onClose();
      return;
    }
    const match = matchHomeItemType(result.item.name, result.item.type);
    if (match && match.care.length > 0) {
      setCreatedThing(result.item);
      setCheckedTasks(new Set(match.care.map((_, i) => i)));
      setStep("suggestions");
      return;
    }
    onClose();
  }

  async function handleConfirmSuggestions() {
    if (!createdItem || !suggestion || !instanceId) {
      onClose();
      return;
    }
    setAddingTasks(true);
    setError(null);
    // Never swallow a failure here. These are jobs the person explicitly
    // ticked; closing the sheet as though they were saved when they were
    // not is the worst outcome available, because nothing would ever
    // remind them again.
    for (const index of checkedTasks) {
      const task = suggestion.care[index];
      const created = await createMaintenanceTask(instanceId, {
        applianceId: createdItem.id,
        name: task.taskName,
        cadenceDays: task.intervalDays,
        careTemplateId: task.id,
        lastDoneAt: null,
        documentLink: null,
        notes: null,
        status: "active",
        source: "manual",
      });
      if (!created.ok) {
        setAddingTasks(false);
        setError(`Couldn't add "${task.taskName}". ${describeResultError(created.error)}`);
        return;
      }
    }
    setAddingTasks(false);
    onClose();
  }

  function toggleTask(index: number) {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (step === "suggestions" && createdItem && suggestion) {
    return (
      <RecordFormSheet
        open={open}
        onClose={onClose}
        title={`This looks like ${withArticle(suggestion.label)}`}
        description="Add its typical upkeep now, or skip and add tasks later."
        triggerRef={triggerRef}
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={addingTasks}>
              Skip
            </Button>
            <Button onClick={handleConfirmSuggestions} disabled={addingTasks || checkedTasks.size === 0}>
              {addingTasks ? "Adding…" : `Add ${checkedTasks.size || ""} task${checkedTasks.size === 1 ? "" : "s"}`}
            </Button>
          </>
        }
      >
        {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
        <ul className="flex flex-col gap-2">
          {suggestion.care.map((task, index) => (
            <li key={task.taskName}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] p-3.5 transition hover:border-[var(--border-strong)]">
                <input
                  type="checkbox"
                  checked={checkedTasks.has(index)}
                  onChange={() => toggleTask(index)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border-strong)] text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                />
                <span>
                  <span className="block text-[13px] font-semibold text-[var(--text)]">{task.taskName}</span>
                  <span className="block text-[12px] text-[var(--muted)]">
                    {describeCadence(task)}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </RecordFormSheet>
    );
  }

  return (
    <RecordFormSheet
      open={open}
      onClose={onClose}
      title={item ? "Edit" : "Add something to your home"}
      description="Whatever it is, call it what you call it. Only the name is required."
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
        placeholder="e.g. Kitchen refrigerator"
        autoFocus
      />
      <Select label="Type" value={values.type} onChange={(event) => setValues({ ...values, type: event.target.value })}>
        {HOME_ITEM_TYPES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
        <option value="other">Other / not listed</option>
      </Select>
      {values.type === "other" && (
        <Input
          label="Describe the type (optional)"
          value={values.customType}
          onChange={(event) => setValues({ ...values, customType: event.target.value })}
          placeholder="e.g. sump pump"
        />
      )}
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
      <Input
        label="Location (optional)"
        value={values.location}
        onChange={(event) => setValues({ ...values, location: event.target.value })}
        placeholder="e.g. Basement"
      />
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
